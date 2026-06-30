#!/usr/bin/env python3
"""Generate the local Qwen3-TTS audition pack without touching app dependencies."""

from __future__ import annotations

import argparse
import json
import subprocess
from pathlib import Path

import soundfile as sf
import torch
from qwen_tts import Qwen3TTSModel


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_PROMPTS = ROOT / "voice-lab" / "prompts.json"
DEFAULT_OUTPUT = ROOT / "voice-lab" / "audio"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate Qwen3-TTS A/B samples")
    parser.add_argument(
        "--model",
        default="Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice",
        help="Hugging Face model id or downloaded local model directory",
    )
    parser.add_argument("--prompts", type=Path, default=DEFAULT_PROMPTS)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--speakers", nargs="+", default=["Serena", "Vivian"])
    parser.add_argument("--device", choices=["mps", "cpu", "cuda"], default=None)
    parser.add_argument("--keep-wav", action="store_true")
    return parser.parse_args()


def choose_device(requested: str | None) -> str:
    if requested:
        return requested
    if torch.backends.mps.is_available():
        return "mps"
    if torch.cuda.is_available():
        return "cuda"
    return "cpu"


def compress_audio(wav_path: Path, mp3_path: Path) -> None:
    subprocess.run(
        [
            "ffmpeg",
            "-hide_banner",
            "-loglevel",
            "error",
            "-y",
            "-i",
            str(wav_path),
            "-ac",
            "1",
            "-ar",
            "24000",
            "-codec:a",
            "libmp3lame",
            "-b:a",
            "64k",
            str(mp3_path),
        ],
        check=True,
    )


def main() -> None:
    args = parse_args()
    prompts = json.loads(args.prompts.read_text(encoding="utf-8"))
    device = choose_device(args.device)
    dtype = torch.float16 if device == "cuda" else torch.float32
    print(f"Loading {args.model} on {device} ({dtype})")
    model = Qwen3TTSModel.from_pretrained(
        args.model,
        device_map=device,
        dtype=dtype,
        attn_implementation="sdpa",
    )

    for speaker in args.speakers:
        speaker_dir = args.output / f"qwen3-{speaker.lower()}"
        speaker_dir.mkdir(parents=True, exist_ok=True)
        for index, prompt in enumerate(prompts, start=1):
            output_mp3 = speaker_dir / f"{prompt['id']}.mp3"
            if output_mp3.exists():
                print(f"[{speaker} {index}/{len(prompts)}] skip {prompt['id']}")
                continue
            print(f"[{speaker} {index}/{len(prompts)}] {prompt['text']}")
            wavs, sample_rate = model.generate_custom_voice(
                text=prompt["text"],
                language="Chinese",
                speaker=speaker,
            )
            output_wav = speaker_dir / f"{prompt['id']}.wav"
            sf.write(output_wav, wavs[0], sample_rate)
            compress_audio(output_wav, output_mp3)
            if not args.keep_wav:
                output_wav.unlink(missing_ok=True)

    print(f"Done. Open: {(ROOT / 'voice-lab' / 'index.html').resolve()}")


if __name__ == "__main__":
    main()
