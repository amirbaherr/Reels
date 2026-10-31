"""Map the script onto whisper word timestamps + silence detection.

Outputs build/lines.json, build/words.json, build/env.json.
Run:  python3 align.py            (subtitles follow what is actually spoken)
      python3 align.py --strict   (subtitles use the script text verbatim)
"""
import json, re, subprocess, sys, difflib
import numpy as np

FPS = 30
AUDIO = "audio/vo.wav"
STRICT = "--strict" in sys.argv

SCRIPT = [
    ("ME", "این ویدیو رو هیچ ابزار ویدیوسازی نساخته."),
    ("CLAUDE", "من ساختمش. با کد!"),
    ("ME", "نه انیمیشن بلدم، نه سه‌بعدی."),
    ("CLAUDE", "لازم نیست. فقط باید حرف بزنی."),
    ("ME", "خب، چطوری؟"),
    ("CLAUDE", "قدم اول: کلود کد رو روی لپ‌تاپت باز کن."),
    ("CLAUDE", "قدم دوم: بگو ریلت درباره‌ی چیه. من سناریو رو می‌نویسم."),
    ("CLAUDE", "قدم سوم: صداها رو بساز و بده به من."),
    ("CLAUDE", "قدم چهارم: من دنیای سه‌بعدی رو می‌سازم و دهن‌ها رو با صدا هماهنگ می‌کنم."),
    ("ME", "و رندرش چقدر طول می‌کشه؟"),
    ("CLAUDE", "چند دقیقه. روی همین لپ‌تاپ."),
    ("ME", "کامنت کن «کارتون» تا راهنمای کامل رو برات بفرستم."),
]
# The recording differs from the script on these lines (verified by re-transcribing each crop):
SPOKEN = {
    5: "قدم اول: کلود کد رو باز کن.",
    10: "نهایتاً چند دقیقه.",
}
KEYWORDS = ["کد", "قدم", "سه‌بعدی", "کارتون"]


def norm(s):
    s = s.replace("ي", "ی").replace("ك", "ک").replace("‌", "")
    return re.sub(r"[^\w]", "", s)


def load_audio(sr=16000):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", AUDIO, "-f", "f32le", "-ac", "1", "-ar", str(sr), "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32), sr


def silences():
    out = subprocess.run(["ffmpeg", "-hide_banner", "-i", AUDIO, "-af", "silencedetect=noise=-35dB:d=0.25", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", out)]
    en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", out)]
    return list(zip(st, en + [1e9] * (len(st) - len(en))))


def snap(t, sil, side):
    for a, b in sil:
        if a < t < b:
            return b if side == "start" else a
    return t


def main():
    raw = json.load(open("build/whisper_raw.json"))
    assert len(raw) == len(SCRIPT), f"expected {len(SCRIPT)} segments, got {len(raw)}"
    sil = silences()
    a, sr = load_audio()
    dur = len(a) / sr

    # speech regions = complement of silences; each region belongs to the whisper segment containing its midpoint
    regions, t = [], 0.0
    for sa, sb in sil:
        if sa > t: regions.append((t, sa))
        t = sb
    if t < dur: regions.append((t, dur))
    seg_regions = [[] for _ in raw]
    for r in regions:
        mid = (r[0] + r[1]) / 2
        k = min(range(len(raw)), key=lambda j: 0 if raw[j]["start"] <= mid <= raw[j]["end"] else
                min(abs(mid - raw[j]["start"]), abs(mid - raw[j]["end"])))
        seg_regions[k].append(r)

    lines, words = [], []
    for i, ((spk, script_text), seg) in enumerate(zip(SCRIPT, raw)):
        text = script_text if STRICT else SPOKEN.get(i, script_text)
        regs = seg_regions[i]
        ls, le = regs[0][0], regs[-1][1]
        inner = [(regs[k][1], regs[k + 1][0]) for k in range(len(regs) - 1)]  # pauses inside the line
        # whisper word times, clamped into the line and pushed past inner pauses
        ww = []
        for w in seg["words"]:
            s, e = max(w["s"], ls), min(w["e"], le)
            for pa, pb in inner:
                if s < pb and e > pa and (e - pb) > (pa - s):
                    s = max(s, pb)
            ww.append([s, max(e, s + 0.08), norm(w["w"])])
        ww[0][0] = ls
        wc, wt = [], []
        for s, e, n in ww:
            for k, ch in enumerate(n):
                wc.append(ch)
                wt.append((s + (e - s) * k / len(n), s + (e - s) * (k + 1) / len(n)))
        toks = text.split(" ")
        sc, owner = [], []
        for ti, tok in enumerate(toks):
            for ch in norm(tok):
                sc.append(ch); owner.append(ti)
        m = [None] * len(sc)
        for blk in difflib.SequenceMatcher(None, sc, wc, autojunk=False).get_matching_blocks():
            for k in range(blk.size):
                m[blk.a + k] = blk.b + k
        times = [wt[m[k]] if m[k] is not None else wt[min(len(wt) - 1, int(k / len(sc) * len(wt)))]
                 for k in range(len(sc))]
        line_words = []
        for ti, tok in enumerate(toks):
            ks = [k for k in range(len(sc)) if owner[k] == ti]
            line_words.append({"line": i, "w": tok, "start": times[ks[0]][0], "end": times[ks[-1]][1],
                               "key": norm(tok) in {norm(k) for k in KEYWORDS}})
        line_words[0]["start"] = ls
        for k in range(1, len(line_words)):
            line_words[k]["start"] = max(line_words[k]["start"], line_words[k - 1]["start"] + 0.12)
            line_words[k - 1]["end"] = min(line_words[k - 1]["end"], line_words[k]["start"])
        for w in line_words:
            w["end"] = min(max(w["end"], w["start"] + 0.06), le)
        lines.append({"i": i + 1, "speaker": spk, "text": text, "script": script_text, "start": ls, "end": le})
        words += line_words

    # line 2: the laugh after "با کد!" (energy burst after the last word)
    L2 = lines[1]
    last = [w for w in words if w["line"] == 1][-1]
    # whisper spreads "کد" over the laugh; detect the final speech burst
    t = np.arange(0, dur, 0.01)
    rms = np.array([np.sqrt((a[int(x * sr):int(x * sr) + 160] ** 2).mean() + 1e-12) for x in t])
    db = 20 * np.log10(rms)
    win = (t > last["start"]) & (t < L2["end"])
    quiet = t[win][db[win] < -40]
    gaps = [q for q in quiet if q > last["start"] + 0.25]
    kad_end = gaps[0] if gaps else last["end"]
    last["end"] = min(last["end"], kad_end)
    L2["laugh"] = [round(float(kad_end), 3), round(float(L2["end"]), 3)]

    # loudness envelope per frame
    n = int(np.ceil(dur * FPS))
    hop = sr // FPS
    env = np.zeros(n)
    for f in range(n):
        c = int((f + 0.5) * hop); seg = a[max(0, c - 640):c + 640]
        env[f] = 20 * np.log10(np.sqrt((seg ** 2).mean()) + 1e-9) if len(seg) else -90
    lo, hi = -42.0, np.percentile(env[env > -40], 95)
    env = np.clip((env - lo) / (hi - lo), 0, 1) ** 0.8
    # attack/release smoothing
    sm = np.zeros(n); v = 0
    for f in range(n):
        v = v + (env[f] - v) * (0.75 if env[f] > v else 0.35); sm[f] = v
    me, cl = np.zeros(n), np.zeros(n)
    for L in lines:
        f0, f1 = int(L["start"] * FPS) - 1, int(np.ceil(L["end"] * FPS)) + 3
        tgt = me if L["speaker"] == "ME" else cl
        tgt[max(0, f0):min(n, f1)] = sm[max(0, f0):min(n, f1)]

    for L in lines:
        L["start"], L["end"] = round(L["start"], 3), round(L["end"], 3)
    for w in words:
        w["start"], w["end"] = round(w["start"], 3), round(w["end"], 3)
    json.dump(lines, open("build/lines.json", "w"), ensure_ascii=False, indent=1)
    json.dump(words, open("build/words.json", "w"), ensure_ascii=False, indent=1)
    json.dump({"fps": FPS, "frames": n, "duration": round(dur, 3),
               "ME": [round(float(x), 3) for x in me], "CLAUDE": [round(float(x), 3) for x in cl]},
              open("build/env.json", "w"))

    for L in lines:
        extra = f"  (laugh {L['laugh'][0]:.2f}-{L['laugh'][1]:.2f})" if "laugh" in L else ""
        print(f"{L['i']:2d} {L['speaker']:6s} {L['start']:6.2f} → {L['end']:6.2f}  {L['text']}{extra}")
        print("     " + "  ".join(f"{w['w']}[{w['start']:.2f}]{'*' if w['key'] else ''}" for w in words if w["line"] == L["i"] - 1))


if __name__ == "__main__":
    main()
