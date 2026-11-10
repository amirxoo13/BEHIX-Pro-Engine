---
name: 2dg
description: Start the 2d-generalist skill from a slash command, with an optional mode first and then the subject, for example "/2dg map the Silk Road with a true-scale timeline" or "/2dg archival-collage the 1929 crash in newspapers". With no request it shows the menu of modes.
argument-hint: "[map|chart-timeline|archival-collage|design|audit] <subject>"
disable-model-invocation: true
---

# 2dg

The user started `2dg` (`2d-generalist`) with this request:

$ARGUMENTS

In tools that do not fill in the line above, the request is the rest of the user's message.

1. If the request is empty or is `help`, show the menu below as it is, then ask one question: what 2D content do you
   want to build? Stop there.
2. Otherwise load the `2d-generalist` skill (`../2d-generalist/SKILL.md`) and follow it from the start.
3. Read the request from the left: if the first word matches a mode (`map`, `chart-timeline`, `archival-collage`,
   `design`, `audit`), use that mode and drop the word from the subject. Otherwise pick the mode from the subject.
4. Before building (any mode except `audit`), run the intent brief from that skill (`references/intent-brief.md`). A mode and a subject do not say the purpose, format or look: ask about whichever of those the request leaves open, with options and a recommended default, in one round.

## Menu

| Mode | What it builds | Example |
|---|---|---|
| `map` | Animated 2D or 2.5D map: routes that draw on, extruded regions, 3D terrain | `/2dg map the Silk Road from Chang'an to Constantinople` |
| `chart-timeline` | True-scale ruler timeline, bar and line charts, dot grids, waveforms | `/2dg chart-timeline 4,000 years of writing on one ruler` |
| `archival-collage` | Newspaper zooms, highlighter marks, torn paper, 2.5D parallax photos | `/2dg archival-collage the 1929 stock market crash` |
| `design` | Style frame: hierarchy, paper and ink surface, palette and type pairs | `/2dg design a style frame for a video on lithium mining` |
| `audit` | Checks your free tools and prints install commands for missing ones | `/2dg audit` |
