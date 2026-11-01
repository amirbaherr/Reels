"""Synthesizes the retro music bed and SFX track (48 kHz) timed to the animation."""
import numpy as np, wave, sys
SR = 48000; DUR = 48.6
N = int(SR * DUR)
rng = np.random.default_rng(7)

def t_(d): return np.arange(int(SR * d)) / SR
def env(n, a=0.005, r=0.1):
    e = np.ones(n); ia = max(1, int(a * SR)); e[:ia] = np.linspace(0, 1, ia)
    ir = min(n, int(r * SR)); e[n - ir:] *= np.linspace(1, 0, ir) ** 2
    return e
def lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); s = 0.0
    # vectorised one-pole via lfilter-like recursion
    from itertools import accumulate
    y = np.array(list(accumulate(x, lambda p, v: a * p + (1 - a) * v)))
    return y
def saw(f, tt): return 2 * ((f * tt) % 1) - 1
def sq(f, tt, duty=0.5): return np.where((f * tt) % 1 < duty, 1.0, -1.0)
def add(buf, x, at, g=1.0):
    i = int(at * SR); j = min(len(buf), i + len(x))
    if i < len(buf): buf[i:j] += x[:j - i] * g
def nf(n): return 440 * 2 ** ((n - 69) / 12)

# ---------------- MUSIC ----------------
BPM = 100; beat = 60 / BPM; bar = 4 * beat
chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]  # Am F C G
music = np.zeros(N)
nb = int(DUR / bar) + 1
for b in range(nb):
    ch = chords[b % 4]; t0 = b * bar
    # pad
    tt = t_(bar + 0.3)
    pad = sum(saw(nf(n) * d, tt) for n in ch for d in (0.996, 1.004))
    pad = lp(pad * env(len(tt), 0.35, 0.5), 900) * 0.05
    add(music, pad, t0)
    # bass 8ths
    for k in range(8):
        tt = t_(beat / 2)
        bs = lp(saw(nf(ch[0] - 24), tt) * env(len(tt), 0.003, 0.12), 500) * 0.22
        add(music, bs, t0 + k * beat / 2)
    # arp 16ths
    seq = [ch[0] + 12, ch[1] + 12, ch[2] + 12, ch[1] + 24]
    for k in range(16):
        tt = t_(beat / 4)
        ar = sq(nf(seq[k % 4]), tt, 0.25) * env(len(tt), 0.002, 0.1) * 0.025
        add(music, lp(ar, 2500), t0 + k * beat / 4)
    # drums
    for k in range(4):
        tt = t_(0.35)
        if k % 2 == 0:
            f = 120 * np.exp(-tt * 18) + 45
            kick = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 9) * 0.35
            add(music, kick, t0 + k * beat)
        else:
            sn = lp(rng.standard_normal(len(tt)), 3500) * np.exp(-tt * 14) * 0.12
            add(music, sn, t0 + k * beat)
    for k in range(8):
        tt = t_(0.05); hh = rng.standard_normal(len(tt)) * np.exp(-tt * 90) * 0.025
        add(music, hh - lp(hh, 6000), t0 + k * beat / 2)

def tape_stop(x, at, dur, gap):
    """pitch-down 'tape stop' starting at `at`, silence for `gap`, then resume."""
    i = int(at * SR); n = int(dur * SR)
    rate = np.linspace(1, 0, n) ** 1.5
    pos = i + np.cumsum(rate)
    seg = np.interp(pos, np.arange(len(x)), x) * np.linspace(1, 0.2, n)
    out = x.copy(); out[i:i + n] = seg
    g0 = i + n; g1 = int((at + dur + gap) * SR)
    out[g0:g1] = 0
    ramp = int(0.05 * SR)
    if g1 + ramp <= len(out): out[g1:g1 + ramp] *= np.linspace(0, 1, ramp)
    return out
music = tape_stop(music, 5.02, 0.45, 0.25)
music = tape_stop(music, 16.66, 0.5, 0.6)
music = tape_stop(music, 47.8, 0.6, 1.0)
fade = np.ones(N); fi = int(1.2 * SR); fade[:fi] = np.linspace(0, 1, fi)
music *= fade

# ---------------- SFX ----------------
sfx = np.zeros(N)
def blip(at, f=880, d=0.08, g=0.18, f2=None):
    tt = t_(d); fr = np.linspace(f, f2 or f * 1.5, len(tt))
    add(sfx, sq(1, np.cumsum(fr) / SR, 0.5) * env(len(tt), 0.002, d * 0.6) * g, at)
def whoosh(at, d=0.45, g=0.25, up=True):
    tt = t_(d); n = rng.standard_normal(len(tt))
    e = np.sin(np.pi * np.linspace(0, 1, len(tt))) ** 2
    out = lp(n, 2200 if up else 1200) * e * g * 2
    add(sfx, out, at - d * 0.4)
def impact(at, g=0.6, f0=110):
    tt = t_(0.7); f = f0 * np.exp(-tt * 6) + 35
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 5)
    s += lp(rng.standard_normal(len(tt)), 1800) * np.exp(-tt * 20) * 0.6
    add(sfx, s * g, at)
def glitch(at, g=0.12, d=0.22):
    tt = t_(d); n = rng.standard_normal(len(tt))
    hold = np.repeat(n[::60], 60)[:len(tt)]
    s = np.sign(hold) * sq(rng.uniform(200, 900), tt, 0.3) * 0.5 + hold * 0.5
    add(sfx, s * env(len(tt), 0.002, 0.08) * g, at - 0.04)
def ding(at, f=1320, g=0.12, d=0.35):
    tt = t_(d); s = (np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(2 * np.pi * f * 2.01 * tt)) * np.exp(-tt * 9)
    add(sfx, s * g, at)
def tick(at, g=0.12):
    tt = t_(0.02); add(sfx, rng.standard_normal(len(tt)) * np.exp(-tt * 300) * g, at)
def slide(at, f0, f1, d, g=0.12):
    tt = t_(d); fr = np.geomspace(f0, f1, len(tt)); vib = 1 + 0.03 * np.sin(2 * np.pi * 7 * tt)
    add(sfx, np.sin(2 * np.pi * np.cumsum(fr * vib) / SR) * env(len(tt), 0.01, 0.1) * g, at)
def buzz(at, f=110, d=0.35, g=0.12):
    tt = t_(d); add(sfx, lp(sq(f, tt), 1500) * env(len(tt), 0.005, 0.08) * g, at)
def rumble(at, d, g=0.15):
    tt = t_(d); s = lp(rng.standard_normal(len(tt)), 600) * np.linspace(0.2, 1, len(tt)) * env(len(tt), 0.05, 0.05)
    add(sfx, s * g * 3, at)

for g_ in [2.0, 5.02, 7.4, 9.18, 12.08, 16.66, 19.5, 21.86, 25.9, 29.02, 31.48, 37.4, 39.25, 42.36, 46.6]: glitch(g_)
slide(0.0, 60, 900, 0.5, 0.08); tick(0.05, 0.3)
impact(0.76, 0.55); blip(1.48, 660, 0.1, 0.1)
whoosh(2.0, 0.5, 0.18); ding(2.45, 1760, 0.05); ding(2.7, 2093, 0.05)
impact(3.22, 0.8, 90); whoosh(3.22, 0.6, 0.2)
rumble(3.95, 1.07, 0.12); slide(3.95, 300, 700, 1.05, 0.04)
slide(5.02, 1400, 180, 0.85, 0.12)
for k in range(28):
    u = k / 27; tick(5.3 + 0.95 * (1 - (1 - u) ** 0.5) , 0.16)
blip(6.25, 1200, 0.06, 0.12); whoosh(6.45, 0.25, 0.12); buzz(6.78, 98, 0.4, 0.13)
impact(7.4, 0.6, 70); ding(7.45, 1568, 0.08, 0.8); blip(8.18, 990, 0.1, 0.1)
for i in range(9): blip(9.3 + i * 0.13, 520 + i * 60, 0.05, 0.07)
slide(10.68, 300, 900, 0.18, 0.08); slide(10.86, 900, 400, 0.15, 0.06)
for i in range(9): ding(11.1 + i * 0.05, 1760 + i * 40, 0.035, 0.2)
whoosh(12.1, 0.5, 0.18)
for s in range(5): ding(13.52 + s * 0.09, 1046 * 2 ** (s * 2 / 12), 0.06)
blip(15.22, 1318, 0.12, 0.09, 2637); blip(15.5, 1568, 0.12, 0.09, 3136)
impact(16.66, 0.8, 80); slide(16.7, 900, 90, 0.6, 0.1)
for i in range(5): buzz(17.42 + i * 0.3, 440 if i % 2 == 0 else 330, 0.14, 0.09)
slide(19.25, 1200, 100, 0.3, 0.08)
whoosh(19.7, 0.5, 0.18, False); impact(19.95, 0.3, 60)
for k in range(len('C:\\> LOAD NEW_GEN.EXE')): tick(19.95 + k * 0.6 / 21, 0.18)
blip(20.7, 784, 0.12, 0.1); blip(21.06, 988, 0.12, 0.08)
for k in range(16): tick(21.1 + k * 0.6 / 16, 0.12)
ding(21.72, 1976, 0.06); slide(21.75, 2000, 80, 0.3, 0.08)
whoosh(21.9, 0.5, 0.18); blip(22.16, 700, 0.06, 0.07); ding(23.2, 1568, 0.09); slide(23.84, 200, 500, 0.2, 0.07)
blip(25.0, 700, 0.06, 0.08); blip(25.46, 1000, 0.08, 0.09)
whoosh(25.85, 0.4, 0.22); blip(25.96, 1760, 0.15, 0.07, 1760); blip(26.2, 1760, 0.15, 0.07, 1760)
for i in range(12): blip(27.26 + i * 0.1, 440 * 2 ** ((i % 6) * 2 / 12), 0.05, 0.08)
whoosh(29.85, 0.5, 0.2); whoosh(31.5, 0.5, 0.18)
for i in range(3): ding(31.76 + i * 0.12 + 0.3, 2400 + i * 200, 0.05, 0.25)
impact(34.7, 0.35, 140); impact(34.88, 0.35, 150)
slide(36.04, 300, 1200, 0.5, 0.06); impact(36.56, 0.45, 120); ding(36.6, 2093, 0.08, 0.6)
impact(37.4, 0.4, 90)
tick(38.6, 0.3); slide(38.62, 800, 300, 0.5, 0.06); impact(39.12, 0.3, 200); tick(39.14, 0.3)
whoosh(39.3, 0.5, 0.18)
for i in range(6): blip(39.5 + i * 0.36, 523 * 2 ** (i * 2 / 12), 0.1, 0.08)
slide(41.36, 300, 1600, 0.5, 0.07)
impact(42.36, 0.35, 80)
for k in range(16): tick(42.6 + k * 0.25, 0.14 if k % 2 else 0.2)
impact(44.66, 0.5, 70); ding(45.3, 1760, 0.09, 0.6); ding(45.34, 2637, 0.05, 0.6)
whoosh(46.6, 0.5, 0.18); blip(46.65, 784, 0.1, 0.09); blip(46.85, 988, 0.08, 0.08); blip(46.95, 1175, 0.1, 0.09)
impact(47.2, 0.5, 70)
slide(47.85, 4000, 40, 0.5, 0.09); tick(48.3, 0.25)

def write(path, x):
    x = np.clip(x, -1, 1)
    with wave.open(path, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())
music /= max(1e-9, np.abs(music).max()) / 0.8
sfx /= max(1e-9, np.abs(sfx).max()) / 0.8
write(sys.argv[1] + '/music.wav', music)
write(sys.argv[1] + '/sfx.wav', sfx)
print('ok')
