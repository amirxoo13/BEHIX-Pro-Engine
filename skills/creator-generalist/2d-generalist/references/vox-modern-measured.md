# The current Vox explainer look, measured

Source: four Vox explainers from 2026, measured frame by frame.

Read this before any piece that must "look like Vox". The current Vox look is footage-led: real people, archival film
and news clips, with short, still, sparse graphic inserts between them. The paper-collage look (torn edges, halftone,
tilted stickers, boil) belongs to the older Vox series and to `archival-collage`. Pick one of the two on purpose and
say which one in the brief. Do not mix them. Marks: [M] measured, [S] seen, [G] guess.

## What the eye notices first

1. **Empty space.** A graphic frame is 60-75% empty paper, with at most 7 elements and one focal point in the middle
   40% of the frame. [M: 62-79% empty]
2. **Stillness.** A graphic that holds does not move at all: no boil, wobble, breathing or drift. Mean pixel change
   between frames 0.125 s apart is about 0.02 of 255. [M] Only a 3% push-in over 3-4 s on a photo or page is allowed.
3. **Hard cuts.** A new idea is a hard cut, every 1.5-3 s on average. No camera pans across a board, no crossfades,
   no wipes between beats. [M: 1.8 s per shot]
4. **Quiet colour.** Charts use 3 inks on paper. Saturated pixels stay at or under 3% of the frame. Red appears only
   on real objects in photos, never as a graphic slab. [M]

## Palette and surface

| Role | Value |
| --- | --- |
| Chart paper | `#F1ECE6`, soft large blotches (luma std about 4), no fine grain or fibre overlay |
| Parchment (history) | `#DDC7A4` to `#EADECC`, mottled, darker corners |
| Chart inks | gold `#C29A16`, grey `#80807F`, warm black `#1A130F` |
| Highlight and caption yellow | lemon `#F7EC02` (never orange-leaning) |
| Real web pages, diagrams | pure white, shown full frame |

Archival photos and film stay black and white or in their own colour, full-bleed, with no duotone.

## Type

| Element | Face | Size (share of frame height) |
| --- | --- | --- |
| Chart title | bold serif, top left | 2.5%, grey sans source line under it at 2% |
| Chart numbers, year ticks | bold sans / bold serif | 3% |
| Footage caption | bold sans, lemon yellow, no box | quotes in caps about 4% |
| Biggest pull-word | bold sans caps | about 10%, never more |
| Lower third | name bold serif 8%, role sans 3% | thin yellow vertical bar on the left |

## Highlight on text

A flat rectangle with hard square ends in `#F7EC02`, as tall as the whole line box (about 9% of frame height on a
headline), taller than the letters. The text under it stays black, and the rest of the text is **not dimmed**. Cut to
the page, wait 0.45 s, wipe the band left to right in 0.5 s, linear, then hold still about 2.7 s and hard cut. [M]
This replaces the "under cap height, dim the rest to 30%" highlighter of `vox-psychology-and-design.md` §3 for this look.

## Photos and cut-outs

- Full-bleed B&W photo or film with a slow push, or a flat page (newspaper, document) at about 60% of frame height,
  no tilt, no border, no shadow.
- Portrait in a graphic: circle crop with a yellow ring about 1% of frame height thick.
- Interview or clip inset: box with a yellow border about 0.8% of frame height.
- Small die-cut faces and logos: about 5% of frame width, white edge, real soft shadow. A physical collage is filmed
  for real (overhead camera, hand placing cut photos on kraft paper), not faked with filters.

## Motion inside a graphic

- Entrance: hard cut in, then 0.45 s later one element animates for 0.4-0.6 s with ease-out (an icon rises and
  settles, a ring fades from 10% while the first slides left by 3% of frame width).
- Series (figures, icons): left to right with a 1-2 frame stagger, the whole row in 0.25-0.5 s, label fades in 0.3 s after.
- Exit: erase or fade over 0.8 s, wait 0.25 s, next chart. Or a hard cut.
- Hold 3-8 s, as long as the sentence that goes with it.
- A yellow arrow can point from a caption to a person in archival film.

## Sound

Narration leads and the graphics illustrate it. A low bed (20-150 Hz) runs under the voice. At most one or two quiet
SFX per 10 s; pops do not each get a sound. [M: one 0.1 s thump on a ring erase in 20 s]

## Check before showing

Measure on the render, not by eye:

1. Empty share of each graphic frame (ink dilated 25 px at 1080p): 60% or more.
2. Mean pixel change between frames 0.125 s apart during holds: under 0.5 of 255.
3. Hard cuts: one per 1.5-3 s on average (`watch-video` `perceive.py` lists them).
4. Saturated pixels (HSV saturation over 0.5 and value over 0.3): 3% of the frame or less on charts.
5. Largest type: about 10% of frame height or less. Sound onsets: no more than about 2 per second.
