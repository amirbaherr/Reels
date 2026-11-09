# Reels

Paper-cut motion graphic (1080×1920, 30fps, 62s) showing follower growth of six client pages, synced to the voiceover.

- `output/reel.mp4` — final video with audio
- `motion/index.html` — the animation (HTML/CSS/JS, `renderFrame(t)` draws any moment in time)
- `motion/render.js` — renders frames with Playwright and encodes with ffmpeg
- `motion/make_textures.py` — generates the paper grain and stamp textures
- `assets/` — voiceover, ECPeyda font, cropped profile screenshots

## Re-render

```bash
python3 motion/make_textures.py                       # optional, textures are committed
NODE_PATH=$(npm root -g) node motion/render.js       # -> output/reel.mp4
NODE_PATH=$(npm root -g) node motion/render.js --stills 3.9,17.5,61.7   # preview frames
```

Scene timings are in `PAGES` inside `motion/index.html` (seconds, matched to the voiceover).
