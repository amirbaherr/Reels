# Retro Reel – motion graphic

Synthwave / VHS-style motion graphic (1080×1920, 30 fps, 48.5 s) synced to the voice-over.

- `retro_reel_final.mp4` — final video (voice + synthesized music bed + SFX)
- `motion.js` / `index.html` — deterministic canvas renderer (`renderAt(t)`), font: ECPeyda SemiBold
- `render.js` — renders frames with headless Chromium (Playwright) → ffmpeg
- `audio/synth.py` — generates the music bed and SFX

Rebuild:
```bash
python3 audio/synth.py audio
node render.js video out/video_silent.mp4 4
ffmpeg -i out/video_silent.mp4 -i assets/voice.m4a -i audio/music.wav -i audio/sfx.wav -filter_complex "[1:a]aresample=48000,highpass=f=80,acompressor=threshold=-20dB:ratio=3:attack=5:release=120:makeup=4,asplit=2[v][sc];[2:a]volume=0.22[m];[m][sc]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=350[md];[3:a]volume=0.32[s];[v][md][s]amix=inputs=3:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k out/retro_reel.mp4
```
Preview stills: `node render.js preview <dir> 3.2 17.5 36.7`
