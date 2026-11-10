# Real images first, reworked (`real-images.md`)

Editorial explainers are built from real photos, scans, documents and maps, reworked into the piece's look. Drawing
a train, a person, a building, a product or a logo from SVG shapes is the last resort: it looks fake next to a real
fact and it cannot carry proof. Search first, rework second, draw only what has no real picture (an arrow, a ruler,
a diagram of an idea).

## 1. What must be real, what may be drawn

| Real picture (search first) | May be drawn |
| --- | --- |
| Vehicles, machines, products, tools | Arrows, rulers, timelines, brackets, highlights |
| People, crowds, uniforms (no face of a private person) | Charts, counters, icons for abstract ideas |
| Places: stations, streets, buildings, landscapes | Maps built from real geodata (`maps-and-geodata-2d-3d.md`) |
| Documents: headlines, letters, notices, tickets, timetables | Paper, grain, tape, torn edges (from real scans when possible) |
| Logos and brand marks (official files) | Simple shapes that stand for a quantity |

A thing with no usable picture after a real search may be drawn, and the report says what was searched.

## 2. Find

```
uv run --no-project --with requests --with pillow python scripts/fetch_images.py search "<query>" --out <project>/assets/photos [--cutout] [--licence commercial]
uv run --no-project --with requests --with pillow python scripts/fetch_images.py get <project>/assets/photos 3 7
```

- `search` queries Openverse (Flickr, Wikimedia, museums) and Wikimedia Commons and draws a numbered sheet: look at
  it and pick by subject, angle, light and resolution (1600 px wide or more for a full-frame shot).
- Search the exact thing first (the real station, the real train series), then the generic thing. Try the local
  language name too ("南流山駅" next to "Minami-Nagareyama Station").
- `--cutout` prefers PNGs, which are often already cut out.
- Other sources by hand in the browser: national libraries and archives (Library of Congress blocks scripts), museum
  open access (Met, Rijksmuseum, Smithsonian), NASA, official press kits, the news source the script cites (screenshot
  the headline with `capture-web-for-social`).
- Licences are warned, never blocking (house rule). `get` writes `CREDITS.md` and `sources.json`; CC BY and CC BY-SA
  need the credit line in the post or description.

## 3. Rework so it belongs to the piece

```
uv run --no-project --with pillow --with numpy python scripts/rework_image.py <in> <out.png> [--crop x,y,w,h]
    [--duotone "#1b2a49,#f2e6cf"] [--posterize 5] [--halftone 6 --halftone-strength 0.35] [--grain 0.04] [--torn 18]
```

| Look | Flags | Use for |
| --- | --- | --- |
| Clean colour photo on torn paper | `--grain 0.05 --torn 20` | Proof shots: the real train, the real place |
| Duotone in the palette | `--duotone "<dark>,<light>"` | Background photos that must not compete with the subject |
| Print and halftone | `--duotone ... --halftone 6` | A stylised print look (not seen in measured Vox; Vox uses plain B&W scans: `--duotone "#1a1a1a,#f2f2f2"` only) |
| Posterized | `--posterize 4` | Stepped, graphic frames |

Then in the edit: cut the subject out when it must move on its own (a PNG cut-out, a hand-placed mask path in
Remotion or Fusion, or Blender with the photo on a card), give it a soft drop shadow, push or pan it with parallax
(`../3d-generalist/references/depth-parallax-and-atmosphere.md`), highlight words on documents
(`vox-psychology-and-design.md` §6). Keep the subject recognisable: the rework puts the photo into the palette and
paper, never so far that the real object is lost.

## 4. Check

- Every real-world object on screen is a real picture or the report names the search that found nothing.
- Every downloaded file has a line in `CREDITS.md`.
- No two neighbouring photos share the same crop, angle and tear (the No Stiff Repeats law).
