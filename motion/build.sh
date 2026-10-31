#!/usr/bin/env bash
# Full pipeline: frames (Chromium/Playwright) -> SFX/music synth -> mix -> H.264 MP4
set -euo pipefail
cd "$(dirname "$0")"
FPS=${FPS:-60}; DUR=27.5
mkdir -p build ../output
NODE_PATH=$(npm root -g) node render.js frames "$FPS" "$DUR" build/frames 4
python3 sfx.py "$DUR"
ffmpeg -v error -y -i ../assets/voice.m4a -i build/music.wav -i build/sfx.wav -filter_complex "
 [0:a]aresample=48000,pan=stereo|c0=c0|c1=c0,highpass=f=75,equalizer=f=3500:t=q:w=1.2:g=2.5,
      acompressor=threshold=-22dB:ratio=3:attack=6:release=120:makeup=2,apad=whole_dur=${DUR}[v];
 [v]asplit=2[vo][vsc];
 [1:a][vsc]sidechaincompress=threshold=0.02:ratio=8:attack=25:release=350[m];
 [vo]volume=1.0[vf];[m]volume=0.55[mf];[2:a]volume=0.4[sf];
 [vf][mf][sf]amix=inputs=3:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=9,atrim=0:${DUR}[out]" \
 -map "[out]" -ar 48000 build/mix.wav
ffmpeg -v error -y -framerate "$FPS" -i build/frames/f%05d.jpg -i build/mix.wav \
 -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -profile:v high -movflags +faststart \
 -c:a aac -b:a 192k -shortest ../output/liquid-glass-motion.mp4
echo done: ../output/liquid-glass-motion.mp4
