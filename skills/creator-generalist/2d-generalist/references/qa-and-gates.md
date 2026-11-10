# Render gate for 2D motion graphics (`qa-and-gates.md`)

`scripts/validate_vox_recipe.py` checks the recipe at the look gate, before anything is built (step 4 of
`~/.claude/skills/3d-generalist/references/pipeline-spine.md`). This gate checks the rendered video before
anyone sees a preview. Numbers catch what an eye skims past; a contact sheet catches what numbers cannot see. Run both
on the fast preview and again on the final.

## 1. Measured part (`scripts/check_render.py`)

```
uv run --no-project --with numpy python scripts/check_render.py <preview.mp4> [--max-hold 1.5] [--min-seconds 25 --max-seconds 65]
```

| Gate | Threshold | What it catches |
| --- | --- | --- |
| Sterile frame | No frame over 60% near-pure white (luma 250+) or black (5 or under) | A digital canvas with no paper, grain or slate |
| Dead air | No stretch over 1.5 s with no change in the picture | A held still while the voice talks, a stalled render. `vox-now` holds are meant to be still: use `--max-hold 3` there, and every hold must end in a hard cut |
| Loudness | Integrated -14 ±1.5 LUFS, true peak at or under -1 dB | A mix too quiet on a phone, clipping after AAC encode |
| Silence | No silence over 0.4 s | A voice stall, a gap between cues |
| Duration | Inside the brief's range | A cut that ran long |

It also prints the share of stepped frames (identical to the one before). On a piece animated on twos or posterized
at 8 to 12 fps this sits near 50% or more; near 0% means the stepped look never happened, near 100% means nothing moves.
The report and a 1 fps contact sheet go to `<video>_gate/`. Exit code 1 means a gate failed: fix it and rerun.

## 2. Looked-at part (contact sheet and full-size frames)

More than about five pictures go through a subagent. Read one full-size frame for any small text.

1. **Text reads on a phone:** any text meant to be read has a cap height of at least 5% of the frame height (about
   54 px at 1080p); labels at 44 to 48 px were too small on a phone in the first pilot (2026-11-09). Smaller text is
   decoration only. Nothing sits in the outer 5% (title safe) or under platform UI (bottom 15% and right edge on
   vertical video). On-screen text holds at least 0.5 s plus 0.3 s per word.
2. **One focal point per frame:** the eye lands on one thing; a highlight, arrow or zoom points at it.
3. **Surface matches the picked look:** flat paper and thin print borders by default; grain, ink bleed, torn edges and
   halftone only where `LOOK.md` picked a stylised option, and then on every card, not some.
4. **Nothing pops:** every element eases in and out; nothing appears or vanishes between two frames.
5. **No stiff repeats:** judged by eye on an 8 fps stretch of each group entrance. No two neighbouring elements share the exact size, angle and timing (the No Stiff Repeats law in SKILL.md).
6. **Picture before word:** each highlight or zoom lands 4 to 8 frames before the word it shows.
7. **Sound per event:** each stroke, pop, wipe and stamp has its own sound at its frame (`design-sound`).
8. **Look match:** `uv run --no-project --with numpy python ~/.claude/skills/3d-generalist/scripts/compare_look.py
   --style <picked style frame> <preview.mp4>` passes (mean luma within 20, saturation within 0.08, hue turned under
   20 degrees on every sampled second). A stretch that is meant to differ, such as a dark map beat, gets its own
   style frame.
9. **Brief drift:** the preview matches `brief.md` slot by slot: purpose, format, length, beats, look, constraints.

## 3. Then the preview

Send the 540p preview with sound only after both parts pass. Render full quality after the user approves it.
