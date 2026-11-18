#!/usr/bin/env python3
"""
Generate natural multi-voice listening audio using Microsoft Edge neural TTS.

Works on macOS and Windows:
  - Uses ffmpeg-static (ffmpeg.exe on Windows)
  - Writes OS-safe temp files (no /tmp hardcoding)
  - Outputs MP3 for broad browser support on Windows + Mac

Usage:
  python scripts/generateListeningAudio.py
  python3 scripts/generateListeningAudio.py
"""

from __future__ import annotations

import asyncio
import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

try:
    import edge_tts
except ImportError:
    print("Installing edge-tts…")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "--user", "edge-tts"])
    import edge_tts

# This file lives in server/scripts/ — keep the server package self-contained.
SERVER_ROOT = Path(__file__).resolve().parents[1]
_sibling_client = SERVER_ROOT.parent / "client"
_sibling_client_audio = _sibling_client / "public" / "audio"
if os.environ.get("AUDIO_OUT_DIR"):
    OUT_DIR = Path(os.environ["AUDIO_OUT_DIR"])
elif (_sibling_client / "package.json").exists():
    OUT_DIR = _sibling_client_audio
else:
    OUT_DIR = SERVER_ROOT / "generated-audio"

MALE_VOICE = "en-US-AndrewNeural"
FEMALE_VOICE = "en-US-AvaNeural"
MALE_RATE = "-4%"
FEMALE_RATE = "-2%"
MALE_PITCH = "-1Hz"
FEMALE_PITCH = "+1Hz"
TURN_GAP_MS = 550


def resolve_ffmpeg() -> Path:
    base = SERVER_ROOT / "node_modules" / "ffmpeg-static"
    for name in ("ffmpeg.exe", "ffmpeg"):
        candidate = base / name
        if candidate.exists():
            return candidate
    raise SystemExit(
        "ffmpeg-static not found. From the server folder run:\n"
        "  npm install\n"
        "(Installs ffmpeg.exe on Windows / ffmpeg on macOS/Linux.)"
    )


FFMPEG = resolve_ffmpeg()


def load_listening_bank() -> list[dict]:
    """Load LISTENING_BANK via Node so JS string escaping stays correct."""
    out_json = Path(tempfile.gettempdir()) / "listening-bank.json"
    # Use JSON.stringify path with forward slashes — Node accepts this on Windows too
    out_literal = json.dumps(str(out_json))
    script = (
        "import { writeFileSync } from 'fs';"
        "import { LISTENING_BANK } from './data/listening.bank.js';"
        f"writeFileSync({out_literal}, JSON.stringify(LISTENING_BANK));"
    )
    subprocess.check_call(
        ["node", "--input-type=module", "-e", script],
        cwd=str(SERVER_ROOT),
        shell=False,
    )
    return json.loads(out_json.read_text(encoding="utf-8"))


def prepare_spoken_text(raw: str) -> str:
    text = (raw or "").strip()
    if not text:
        return text
    replacements = [
        (r"\bSLA\b", "S L A"),
        (r"\bCRM\b", "C R M"),
        (r"\bAPI\b", "A P I"),
        (r"\bIT\b", "I T"),
        (r"\bCFO\b", "C F O"),
        (r"\bVIP\b", "V I P"),
        (r"—", ", "),
        (r"–", ", "),
        (r"\s+", " "),
    ]
    for pattern, repl in replacements:
        text = re.sub(pattern, repl, text)
    return text.strip()


def ffmpeg_path_for_concat(path: Path) -> str:
    """ffmpeg concat demuxer is happiest with forward slashes on all OSes."""
    return path.resolve().as_posix().replace("'", r"'\''")


async def synthesize_line(text: str, voice: str, rate: str, pitch: str, out_mp3: Path) -> None:
    communicate = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
    await communicate.save(str(out_mp3))


def run_ffmpeg(args: list[str]) -> None:
    subprocess.check_call(
        [str(FFMPEG), *args],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        shell=False,
    )


async def build_dialogue(dialogue: dict, out_mp3: Path, tmp: Path) -> None:
    speakers = {s["id"]: s for s in dialogue["speakers"]}
    parts: list[Path] = []
    prev_voice = None

    for idx, line in enumerate(dialogue["lines"]):
        speaker = speakers.get(line["speaker"], {})
        is_female = speaker.get("voice") == "female"
        voice = FEMALE_VOICE if is_female else MALE_VOICE
        rate = FEMALE_RATE if is_female else MALE_RATE
        pitch = FEMALE_PITCH if is_female else MALE_PITCH
        spoken = prepare_spoken_text(line["text"])

        line_mp3 = tmp / f"line-{idx:02d}.mp3"
        await synthesize_line(spoken, voice, rate, pitch, line_mp3)

        if idx > 0:
            gap = TURN_GAP_MS + (120 if prev_voice != voice else 0)
            gap_path = tmp / f"gap-{idx:02d}.mp3"
            run_ffmpeg(
                [
                    "-y",
                    "-f",
                    "lavfi",
                    "-i",
                    "anullsrc=r=24000:cl=mono",
                    "-t",
                    f"{gap / 1000:.3f}",
                    "-c:a",
                    "libmp3lame",
                    "-q:a",
                    "9",
                    str(gap_path),
                ]
            )
            parts.append(gap_path)

        parts.append(line_mp3)
        prev_voice = voice
        sys.stdout.write(".")
        sys.stdout.flush()

    concat_list = tmp / "concat.txt"
    # Absolute paths with forward slashes — critical for Windows
    concat_list.write_text(
        "\n".join(f"file '{ffmpeg_path_for_concat(p)}'" for p in parts) + "\n",
        encoding="utf-8",
    )

    run_ffmpeg(
        [
            "-y",
            "-f",
            "concat",
            "-safe",
            "0",
            "-i",
            str(concat_list),
            "-c:a",
            "libmp3lame",
            "-b:a",
            "96k",
            str(out_mp3),
        ]
    )


async def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    bank = load_listening_bank()
    print(
        f"OS={os.name} platform={sys.platform} ffmpeg={FFMPEG.name}"
    )
    print(
        f"Generating {len(bank)} neural-voice dialogues "
        f"({MALE_VOICE} / {FEMALE_VOICE}) as MP3 — no name announcements…"
    )

    for dialogue in bank:
        dialogue_id = f"{dialogue['id']:02d}"
        out_mp3 = OUT_DIR / f"listening-d{dialogue_id}.mp3"
        with tempfile.TemporaryDirectory(prefix=f"listen-d{dialogue_id}-") as tmpdir:
            await build_dialogue(dialogue, out_mp3, Path(tmpdir))
        print(f"\nOK {out_mp3.name}")

    print("Done. Listening bank audioUrl should use .mp3; hard-refresh the browser.")


if __name__ == "__main__":
    asyncio.run(main())
