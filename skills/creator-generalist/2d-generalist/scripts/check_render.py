"""Measure a rendered 2D motion graphics video against the render gate in references/qa-and-gates.md.

Checks what numbers can see: sterile white or black frames, held frames with no motion (dead air), the share of
stepped (posterized) frames, audio loudness and true peak, long silences, and duration. It also writes a 1 fps
contact sheet for the visual part of the gate, which a person or a frame-reading agent must still look at.

Run:
  uv run --no-project --with numpy python scripts/check_render.py <video.mp4> [--out <folder>] [--max-hold 1.5]
      [--min-seconds 0] [--max-seconds 0] [--target-lufs -14]

Exit code 0 when every measured gate passes, 1 when one fails, 2 when the file cannot be read.
"""

import argparse
import json
import pathlib
import re
import subprocess
import sys

import numpy

ANALYSIS_WIDTH = 160
ANALYSIS_HEIGHT = 90
WHITE_LEVEL = 250
BLACK_LEVEL = 5
STERILE_SHARE = 0.6
STILL_DIFFERENCE = 0.4
SILENCE_DB = -45
MAX_SILENCE_SECONDS = 0.4


def run(command):
    return subprocess.run(command, capture_output=True, text=True, encoding="utf-8", errors="replace")


def probe(video):
    result = run(["ffprobe", "-v", "error", "-show_entries", "format=duration:stream=codec_type,r_frame_rate",
                  "-of", "json", str(video)])
    if result.returncode != 0:
        return None
    data = json.loads(result.stdout)
    duration = float(data["format"]["duration"])
    video_stream = next(stream for stream in data["streams"] if stream["codec_type"] == "video")
    numerator, denominator = video_stream["r_frame_rate"].split("/")
    frames_per_second = float(numerator) / float(denominator)
    has_audio = any(stream["codec_type"] == "audio" for stream in data["streams"])
    return duration, frames_per_second, has_audio


def read_gray_frames(video):
    command = ["ffmpeg", "-v", "error", "-i", str(video), "-vf",
               f"scale={ANALYSIS_WIDTH}:{ANALYSIS_HEIGHT},format=gray", "-f", "rawvideo", "-"]
    raw = subprocess.run(command, capture_output=True).stdout
    frame_size = ANALYSIS_WIDTH * ANALYSIS_HEIGHT
    count = len(raw) // frame_size
    return numpy.frombuffer(raw[:count * frame_size], dtype=numpy.uint8).reshape(count, ANALYSIS_HEIGHT, ANALYSIS_WIDTH)


def picture_checks(frames, frames_per_second, max_hold_seconds):
    white_share = (frames >= WHITE_LEVEL).mean(axis=(1, 2))
    black_share = (frames <= BLACK_LEVEL).mean(axis=(1, 2))
    sterile_frames = numpy.flatnonzero((white_share > STERILE_SHARE) | (black_share > STERILE_SHARE))
    differences = numpy.abs(numpy.diff(frames.astype(numpy.int16), axis=0)).mean(axis=(1, 2))
    still = differences < STILL_DIFFERENCE
    longest_hold = 0
    longest_hold_start = 0
    run_length = 0
    for index, is_still in enumerate(still):
        run_length = run_length + 1 if is_still else 0
        if run_length > longest_hold:
            longest_hold = run_length
            longest_hold_start = index - run_length + 1
    return {
        "sterile_frames": len(sterile_frames),
        "first_sterile_second": round(sterile_frames[0] / frames_per_second, 2) if len(sterile_frames) else None,
        "longest_hold_seconds": round(longest_hold / frames_per_second, 2),
        "longest_hold_starts_at": round(longest_hold_start / frames_per_second, 2),
        "stepped_frame_share": round(float(still.mean()), 3),
        "hold_ok": longest_hold / frames_per_second <= max_hold_seconds,
        "sterile_ok": len(sterile_frames) == 0,
    }


def audio_checks(video, target_lufs):
    loudness = run(["ffmpeg", "-v", "info", "-nostats", "-i", str(video), "-af", "ebur128=peak=true", "-f", "null", "-"])
    integrated = re.findall(r"I:\s+(-?[\d.]+) LUFS", loudness.stderr)
    true_peak = re.findall(r"Peak:\s+(-?[\d.]+) dBFS", loudness.stderr)
    silence = run(["ffmpeg", "-v", "info", "-nostats", "-i", str(video), "-af",
                   f"silencedetect=noise={SILENCE_DB}dB:d={MAX_SILENCE_SECONDS}", "-f", "null", "-"])
    silences = [float(value) for value in re.findall(r"silence_duration: ([\d.]+)", silence.stderr)]
    integrated_value = float(integrated[-1]) if integrated else None
    peak_value = float(true_peak[-1]) if true_peak else None
    return {
        "integrated_lufs": integrated_value,
        "true_peak_db": peak_value,
        "silences_over_limit": len(silences),
        "longest_silence_seconds": round(max(silences), 2) if silences else 0.0,
        "loudness_ok": integrated_value is not None and abs(integrated_value - target_lufs) <= 1.5,
        "peak_ok": peak_value is not None and peak_value <= -1.0,
        "silence_ok": not silences,
    }


def write_contact_sheet(video, out_folder, duration):
    columns = 6
    rows = max(1, int(numpy.ceil(duration / columns)))
    sheet = out_folder / "contact_sheet.jpg"
    run(["ffmpeg", "-y", "-v", "error", "-i", str(video), "-vf",
         f"fps=1,scale=320:-2,tile={columns}x{rows}:padding=4:color=gray", "-frames:v", "1", str(sheet)])
    return sheet


def main():
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("video")
    parser.add_argument("--out", default=None, help="folder for the report and contact sheet (default: next to the video)")
    parser.add_argument("--max-hold", type=float, default=1.5, help="longest allowed frame with no motion, seconds")
    parser.add_argument("--min-seconds", type=float, default=0)
    parser.add_argument("--max-seconds", type=float, default=0)
    parser.add_argument("--target-lufs", type=float, default=-14)
    arguments = parser.parse_args()

    video = pathlib.Path(arguments.video)
    probed = probe(video)
    if probed is None:
        print(f"cannot read {video}")
        return 2
    duration, frames_per_second, has_audio = probed
    out_folder = pathlib.Path(arguments.out) if arguments.out else video.parent / f"{video.stem}_gate"
    out_folder.mkdir(parents=True, exist_ok=True)

    report = {"video": str(video), "duration_seconds": round(duration, 2), "fps": round(frames_per_second, 3)}
    report["picture"] = picture_checks(read_gray_frames(video), frames_per_second, arguments.max_hold)
    report["audio"] = audio_checks(video, arguments.target_lufs) if has_audio else {"missing": True}
    duration_ok = (arguments.min_seconds <= 0 or duration >= arguments.min_seconds) and \
                  (arguments.max_seconds <= 0 or duration <= arguments.max_seconds)
    report["duration_ok"] = duration_ok
    report["contact_sheet"] = str(write_contact_sheet(video, out_folder, duration))

    gates = {
        "no sterile white or black frames": report["picture"]["sterile_ok"],
        f"no hold over {arguments.max_hold} s": report["picture"]["hold_ok"],
        "audio present": has_audio,
        f"loudness {arguments.target_lufs} ±1.5 LUFS": report["audio"].get("loudness_ok", False),
        "true peak at or under -1 dB": report["audio"].get("peak_ok", False),
        f"no silence over {MAX_SILENCE_SECONDS} s": report["audio"].get("silence_ok", False),
        "duration in range": duration_ok,
    }
    report["gates"] = gates
    (out_folder / "gate_report.json").write_text(json.dumps(report, indent=1), encoding="utf-8")

    for name, passed in gates.items():
        print(f"{'PASS' if passed else 'FAIL'}  {name}")
    picture = report["picture"]
    print(f"longest hold {picture['longest_hold_seconds']} s at {picture['longest_hold_starts_at']} s; "
          f"stepped frames {picture['stepped_frame_share']:.0%}")
    if has_audio:
        print(f"loudness {report['audio']['integrated_lufs']} LUFS, true peak {report['audio']['true_peak_db']} dB, "
              f"longest silence {report['audio']['longest_silence_seconds']} s")
    print(f"contact sheet: {report['contact_sheet']} (look at it: text, safe area, layout are not measured)")
    return 0 if all(gates.values()) else 1


if __name__ == "__main__":
    sys.exit(main())
