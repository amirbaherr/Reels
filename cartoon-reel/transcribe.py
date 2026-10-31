import json, sys
import subprocess, numpy as np
from faster_whisper import WhisperModel
model_name = sys.argv[1] if len(sys.argv) > 1 else "large-v3"
m = WhisperModel(model_name, device="cpu", compute_type="int8")
audio = np.frombuffer(subprocess.run(["ffmpeg","-v","error","-i","audio/vo.wav","-f","f32le","-ac","1","-ar","16000","-"],capture_output=True,check=True).stdout, np.float32)
segs, info = m.transcribe(audio, language="fa", word_timestamps=True, beam_size=5, vad_filter=False)
out = []
for s in segs:
    out.append({"start": s.start, "end": s.end, "text": s.text,
                "words": [{"w": w.word, "s": w.start, "e": w.end, "p": w.probability} for w in s.words]})
    print(f"[{s.start:6.2f}-{s.end:6.2f}] {s.text}", flush=True)
json.dump(out, open("build/whisper_raw.json", "w"), ensure_ascii=False, indent=1)
