"""Synthesizes the SFX stem and a soft music bed (no external samples)."""
import numpy as np, wave, sys
SR = 48000
DUR = float(sys.argv[1]) if len(sys.argv) > 1 else 27.5
rng = np.random.default_rng(7)
N = int(SR * DUR)
sfx = np.zeros((N, 2)); mus = np.zeros((N, 2))

def put(buf, t, sig, gain=1.0, pan=0.0):
    i = int(t * SR); sig = sig[: max(0, N - i)]
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[i:i + len(sig), 0] += sig * gain * l * 1.414
    buf[i:i + len(sig), 1] += sig * gain * r * 1.414

def tt(d): return np.arange(int(d * SR)) / SR
def env(d, a=.005, dec=.1):
    t = tt(d); return np.minimum(1, t / a) * np.exp(-t / dec)

def svf_bp(x, fc, q=1.2):
    """state-variable band-pass with per-sample cutoff"""
    lo = bp = 0.0; y = np.empty_like(x); fc = np.broadcast_to(fc, x.shape)
    for i in range(len(x)):
        f = 2 * np.sin(np.pi * min(fc[i], SR / 6) / SR)
        hi = x[i] - lo - bp / q; bp += f * hi; lo += f * bp; y[i] = bp
    return y

def whoosh(d=.5, f0=300, f1=3000, rise=True):
    t = tt(d); n = rng.standard_normal(len(t))
    fc = f0 * (f1 / f0) ** (t / d)
    e = np.sin(np.pi * (t / d) ** (0.7 if rise else 0.3)) ** 2
    return svf_bp(n, fc, .9) * e * .5

def pop(f=520, d=.12):
    t = tt(d); fr = f * (1 + .8 * np.exp(-t / .012))
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * env(d, .002, .035)

def click(d=.03):
    t = tt(d); return (np.sin(2 * np.pi * 2600 * t) * .6 + rng.standard_normal(len(t)) * .3) * env(d, .0005, .006)

def tick(f=3200): t = tt(.02); return np.sin(2 * np.pi * f * t) * env(.02, .0005, .004)

def chime(notes, d=1.2, dec=.35, spread=.06):
    out = np.zeros(int((d + spread * len(notes)) * SR))
    for k, f in enumerate(notes):
        t = tt(d); s = (np.sin(2 * np.pi * f * t) + .25 * np.sin(2 * np.pi * f * 2.01 * t) + .1 * np.sin(2 * np.pi * f * 3.98 * t)) * env(d, .003, dec)
        i = int(k * spread * SR); out[i:i + len(s)] += s
    return out * .5

def sparkle(d=.6, n=14):
    out = np.zeros(int((d + .2) * SR))
    for k in range(n):
        f = rng.uniform(2500, 6500); s = np.sin(2 * np.pi * f * tt(.15)) * env(.15, .001, .03)
        i = int(rng.uniform(0, d) * SR); out[i:i + len(s)] += s * rng.uniform(.3, 1)
    return out * .35

def thud(f0=110, f1=45, d=.35):
    t = tt(d); fr = f1 + (f0 - f1) * np.exp(-t / .04)
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * env(d, .002, .09)

def buzz(d=.32):
    t = tt(d); s = np.sign(np.sin(2 * np.pi * 110 * t)) * .5 + np.sign(np.sin(2 * np.pi * 116.5 * t)) * .5
    s = svf_bp(s, np.full(len(t), 700.0), .7)
    return s * env(d, .004, .12) * .9

def zap(d=.35):
    t = tt(d); fr = 2400 * (180 / 2400) ** (t / d)
    s = np.sin(2 * np.pi * np.cumsum(fr) / SR) * env(d, .001, .1)
    return s * .6 + svf_bp(rng.standard_normal(len(t)), np.full(len(t), 5000.0), .8) * env(d, .001, .05) * .6

# ---------------- cue sheet (seconds, synced to index.html timeline) ----------------
put(sfx, 0.0, sparkle(.5, 10), .7)
put(sfx, 0.05, whoosh(.45, 200, 2500), .6)
put(sfx, 1.6, chime([1318.5, 1975.5, 2637], 1.4, .45), .55); put(sfx, 1.62, sparkle(.6), .8)
for k in range(4): put(sfx, 2.02 + k * .1, pop(480 + k * 90), .55, [-.6, .6, -.4, .4][k])
put(sfx, 3.0, whoosh(.45, 3000, 400, False), .45)
put(sfx, 3.22, whoosh(.4, 300, 2200), .5)
for k in range(26): put(sfx, 3.5 + k * 1.4 / 26 + rng.uniform(0, .015), tick(rng.uniform(2600, 3600)), .22, .2)
for k in range(3): put(sfx, 4.0 + k * .13, pop(380 + k * 40), .4, .3 * (k - 1))
tk = 3.55; gap = .5
while tk < 5.3: put(sfx, tk, tick(1800), .35, -.3); tk += gap; gap = max(.07, gap * .78)
put(sfx, 5.36, buzz(), .55); put(sfx, 5.4, thud(), .7)
put(sfx, 5.45, whoosh(.7, 2000, 150, False), .35)
put(sfx, 5.6, thud(160, 60, .3), .55); put(sfx, 5.6, pop(300, .15), .5)
put(sfx, 6.15, whoosh(.4, 2500, 300, False), .45)
put(sfx, 6.42, whoosh(.55, 150, 3000), .6); put(sfx, 6.6, thud(90, 40, .3), .35)
for k in range(6): put(sfx, 7.16 + k * .085, pop(560 + (k % 3) * 120, .1), .42, [-.5, .5][k % 2])
put(sfx, 8.28, sparkle(.65, 18), .9); put(sfx, 8.28, chime([2093, 2637], .8, .25), .25)
put(sfx, 9.55, whoosh(.55, 400, 2600), .5); put(sfx, 10.12, thud(140, 60, .25), .5)
put(sfx, 10.92, whoosh(.4, 600, 3000), .4)
for k in range(7): put(sfx, 11.1 + k * .2, click(), .45, -.5 + k * .16)
put(sfx, 11.85, whoosh(.5, 300, 5000), .35)
put(sfx, 12.36, zap(), .6); put(sfx, 12.4, sparkle(.5, 16), .9); put(sfx, 12.6, chime([1568, 2093, 2637], 1.2, .4), .45)
put(sfx, 13.6, whoosh(.45, 3000, 300, False), .45)
put(sfx, 13.92, whoosh(.4, 300, 2600), .45)
for k in range(4): put(sfx, 14.05 + k * .09, pop(500 + k * 70, .1), .4, [.5, -.5, .5, -.5][k])
put(sfx, 15.2, click(), .8, .3); put(sfx, 15.55, whoosh(.45, 300, 2400), .45)
put(sfx, 15.9, whoosh(.25, 1500, 4000), .2); put(sfx, 17.2, whoosh(.25, 1500, 4000), .2)
put(sfx, 16.64, click(), .8); put(sfx, 16.7, chime([1760, 2349], .9, .3), .5); put(sfx, 16.72, sparkle(.4, 10), .6)
put(sfx, 17.12, whoosh(.4, 2600, 400, False), .4); put(sfx, 17.3, whoosh(.5, 250, 2600), .5, .4)
put(sfx, 17.45, whoosh(.5, 800, 4000), .35, -.2); put(sfx, 17.93, pop(700, .1), .45)
put(sfx, 18.1, click(), .8, -.2); put(sfx, 18.15, whoosh(.35, 600, 4500), .45)
for k in range(3): put(sfx, 18.5 + k * .16, pop(900 + k * 150, .08), .25)
put(sfx, 18.95, pop(520, .14), .55); put(sfx, 19.3, click(), .5)
put(sfx, 20.38, chime([1046.5, 1318.5, 1568, 2093], 1.5, .5, .05), .6); put(sfx, 20.4, sparkle(.7, 22), .9)
put(sfx, 20.6, whoosh(.4, 3000, 300, False), .4)
put(sfx, 20.85, whoosh(.4, 250, 2500), .5); put(sfx, 21.0, pop(440, .14), .5)
put(sfx, 21.66, click(.05), .9); put(sfx, 21.68, chime([2637], .5, .15), .35); put(sfx, 21.7, sparkle(.35, 8), .6)
put(sfx, 22.0, pop(620, .12), .5, .2)
put(sfx, 23.0, whoosh(.45, 300, 2600), .45); put(sfx, 23.12, pop(400, .15), .55)
for k in range(4): put(sfx, 23.5 + k * .11, tick(3000), .35)
put(sfx, 23.95, sparkle(.8, 26), 1.0); put(sfx, 23.95, chime([1318.5, 1760, 2217], 1.2, .4), .4)
put(sfx, 24.2, pop(520, .12), .45)
for k in range(4): put(sfx, 24.42 + k * .1, tick(3200), .3)
put(sfx, 24.9, click(), .7); put(sfx, 24.95, whoosh(.4, 600, 5000), .45)
put(sfx, 25.0, chime([1568, 2093], .9, .3), .5)
for k in range(14): put(sfx, 24.98 + rng.uniform(0, 1.6), pop(rng.uniform(700, 1200), .08), .18, rng.uniform(-.7, .7))

# ---------------- music bed ----------------
BPM = 100; beat = 60 / BPM
def ntf(n): return 440 * 2 ** ((n - 69) / 12)
chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]  # Am F C G
bar = 4 * beat
k = 0; t0 = 0.0
while t0 < DUR:
    ch = chords[k % 4]; d = bar + .8
    t = tt(d); e = np.minimum(1, t / .5) * np.minimum(1, np.maximum(0, (d - t) / .8))
    pad = np.zeros(len(t))
    for n in ch:
        f = ntf(n + 12)
        for det in (-.12, 0, .13):
            ff = f * 2 ** (det / 12)
            pad += np.sin(2 * np.pi * ff * t) + .35 * np.sin(2 * np.pi * ff * 2 * t) + .12 * np.sin(2 * np.pi * ff * 3 * t)
    put(mus, t0, pad * e * .02, 1, 0)
    bass = np.sin(2 * np.pi * ntf(ch[0] - 12) * t) * e * .10
    put(mus, t0, bass)
    # pluck arpeggio (8ths)
    arp = [ch[0] + 24, ch[1] + 24, ch[2] + 24, ch[1] + 24]
    for j in range(8):
        n = arp[j % 4]; tp = tt(.6); f = ntf(n)
        s = (np.sin(2 * np.pi * f * tp) + .3 * np.sin(2 * np.pi * 2 * f * tp)) * env(.6, .003, .16)
        put(mus, t0 + j * beat / 2, s * .05, 1, [-.35, .35][j % 2])
    # soft kick + hat
    for j in range(4):
        put(mus, t0 + j * beat, thud(120, 45, .3) * .16)
        hn = rng.standard_normal(int(.05 * SR)); hn = np.diff(hn, prepend=0)
        put(mus, t0 + j * beat + beat / 2, hn * env(.05, .0005, .012) * .025, 1, .25)
    t0 += bar; k += 1
fade = np.minimum(1, np.arange(N) / (SR * .6)) * np.minimum(1, (N - np.arange(N)) / (SR * .9))
mus *= fade[:, None]

def wr(name, x):
    x = np.clip(x, -1, 1); w = wave.open(name, 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((x * 32767).astype('<i2').tobytes()); w.close()
wr('build/sfx.wav', sfx * .8); wr('build/music.wav', mus)
print('peak sfx', np.abs(sfx).max(), 'mus', np.abs(mus).max())
