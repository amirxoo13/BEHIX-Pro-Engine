---
name: 2d-generalist
description: "Design, animate, texture, and composite Vox, Johnny Harris, and WSJ style editorial explainer motion graphics across 2D, 2.5D, and 3D using installed free tools (Blender, DaVinci Resolve Fusion, Remotion + Three.js/SVG, FFmpeg) or optional open-source GIS/vector tools. Use when asked to \"create a Vox style video\", \"Vox map or chart animation\", \"2D/3D editorial motion graphics\", \"newspaper highlight and torn paper collage\", \"2d generalist\", or \"2D motion graphics\"."
license: MIT
---

# 2D Generalist

Use this skill to design, animate, texture, and composite editorial motion graphics in the style of **Vox** (*Atlas*, *By Design*, *Earworm*, *Missing Chapter*) and **Flat Pack FX** across **2D, 2.5D, and 3D** using tools already installed on the user's machine (or recommending free tools when missing).

Before building a look, pick the named technique instead of brute force: the 3D skill's `references/technique-atlas.md` (symptom to technique, numbers, recipe across 2D, 3D, editing and sound) and `references/depth-parallax-and-atmosphere.md` (parallax speeds, haze maths for layers). Machine paths (Krita, OpenToonz): `local.md` next to this file when it exists.

## Mode Routing

| Mode | Scope (2D / 2.5D / 3D) | Primary Reference |
| --- | --- | --- |
| `script` | Title, hook, explainer structure, voice pace, beat table, captions | [`references/explainer-script.md`](references/explainer-script.md) |
| `qa` | Render gate on the preview and final: measured checks plus contact sheet | [`references/qa-and-gates.md`](references/qa-and-gates.md) |
| `audit` | Check installed free 2D/3D tools vs optional downloads | [`references/2d-3d-toolchain-matrix.md`](references/2d-3d-toolchain-matrix.md) |
| `design` | Visual hierarchy, asymmetric scale, Blueprint Aesthetic, palettes | [`references/vox-psychology-and-design.md`](references/vox-psychology-and-design.md) |
| `map` | 2D vector/satellite maps, 2.5D embossed/extruded layers, 3D terrain and GeoJSON routes (convert KML with `ogr2ogr`) | [`references/maps-and-geodata-2d-3d.md`](references/maps-and-geodata-2d-3d.md) |
| `chart-timeline` | Pre-drawn ruler timelines, 2D/3D bar/line graphs, dot-matrix repeaters, waveforms | [`references/charts-timelines-and-data.md`](references/charts-timelines-and-data.md) |
| `vox-now` | The current Vox explainer look, measured: footage-led, 60-75% empty frames, still holds, hard cuts every 1.5-3 s, 3 inks, lemon line-box highlight. Read first when asked to "look like Vox" | [`references/vox-modern-measured.md`](references/vox-modern-measured.md) |
| `photos` | Find real photos, scans, cut-outs and documents online, pick from a numbered sheet, rework into the piece's look, credits | [`references/real-images.md`](references/real-images.md) |
| `archival-collage` | Dual highlighters, newspaper push, 2.5D parallax; torn borders, flicker and slide projector as stylised options (not seen in measured Vox) | [`references/archival-collage-and-camera.md`](references/archival-collage-and-camera.md); highlighters and torn borders in [`references/vox-psychology-and-design.md`](references/vox-psychology-and-design.md) §3 and §6 |
| `thumbnail` | Vector thumbnails in Inkscape, brand logos as sticker outlines with soft shadows | [`references/inkscape-thumbnails-and-logos.md`](references/inkscape-thumbnails-and-logos.md) |
| `texture-look` | Grain, paper, halftone, dither, CRT, VHS, colour misregistration, engraving, boil, flat shading, stacked shadows and glows, colour split | [`references/textures-retro-and-shading.md`](references/textures-retro-and-shading.md) |
| `fx-type` | Goo, smoke, fire, liquid, rain, loops, infinite zoom, kaleidoscopes, mattes, transitions, kinetic type, graphics into footage | [`references/2d-fx-type-and-compositing.md`](references/2d-fx-type-and-compositing.md); drawn FX blended into 3D shots: the 3D skill's `references/hybrid-2d-3d-fx.md` |

## End-to-End Workflow: the production spine

Run the eight steps of `~/.claude/skills/3d-generalist/references/pipeline-spine.md` in order, for every mode. Each
step writes its file and its line under `## Progress` in `brief.md`; start a step only from the files of the one
above it. The user decides twice: the look at step 4 and the preview at step 8.

| Step | Writes | 2D rules for the step |
| --- | --- | --- |
| 1. Brief | `brief.md` | `references/intent-brief.md`; run `scripts/check_vox_toolchain.py` and mention only missing tools |
| 2. Reference | `refs/`, `refs/NOTES.md` | real photos, scans, documents and footage via `scripts/fetch_images.py` (`references/real-images.md`); real data for maps and charts; a Vox look starts from `references/vox-modern-measured.md` |
| 3. Script and beats | `script.md`, `beats.md`, scratch voice, cue list | `references/explainer-script.md` |
| 4. Look gate | style frames A/B/C, animatic of the beats, then `LOOK.md`, `recipe.json` | the user picks; one anchor with asymmetric scale and the Look-Away / Look-Back Test (`references/vox-psychology-and-design.md`); default flat paper and print borders, grain, ink bleed, torn edges and halftone only when the pick is a stylised option (`references/textures-retro-and-shading.md`); then `scripts/validate_vox_recipe.py --spec recipe.json` |
| 5. Assets and check | `assets/`, `CREDITS.md` | `scripts/rework_image.py` for cut-outs, `scripts/generate_vox_assets.py` for the filters and ruler timelines the recipe uses; every picture sourced or the search named |
| 6. Build and animate | scenes | Remotion + SVG filters + Three.js, Fusion (`ImagePlane3D`, `Camera3D`) or Blender Grease Pencil per `references/2d-3d-toolchain-matrix.md`; mode references above; graphics on 8 to 12 fps posterize, camera never posterized; finish with 35mm DoF, vignette and a light unsharp, grain and chromatic aberration only if `LOOK.md` says |
| 7. Sound | final voice, SFX, music, mix | `design-sound`: every visible stroke, pop and wipe gets its own sound at its frame |
| 8. QA, preview, final | gate report, 540p preview with sound | `scripts/check_render.py` and the contact sheet per `references/qa-and-gates.md`, look match with `~/.claude/skills/3d-generalist/scripts/compare_look.py`; the user approves the preview before the full render |

For any step done in Blender (geometry nodes, shaders, rigging, weight paint, NLA, bpy), load the `use-3d-software` skill for the exact nodes and current 5.x names. For the edit, captions, retime, transitions, grade and export in any editor (Resolve, CapCut, Premiere, Kdenlive, FFmpeg), load `edit-video`.
Craft skills for single steps: `draw-and-paint-art` (drawing, figures, painting in Krita), `paint-stylized-backgrounds` (backgrounds, paint-over, parallax, moving foliage and water), `animate-characters` (character motion, frame by frame, cut-out) and `rig-characters` (cut-out puppets).

## Core Vox Visual Laws (Non-Negotiable)

- **Real Pictures, Never Redrawn:** every real-world thing on screen (vehicle, person, place, product, document, logo) is a real photo or scan found online with `scripts/fetch_images.py`, never redrawn from SVG shapes. Measured Vox (2018-2026) shows archival photos as plain black-and-white scans; `scripts/rework_image.py` duotone, halftone and torn edges are a stylised option, not the Vox look. Draw only arrows, rulers, charts and ideas with no picture, and name the search when nothing was found ([`references/real-images.md`](references/real-images.md)).
- **Flat Paper, Real Documents:** graphic cards are flat near-white with no grain (measured `#F9F9F6`, `#F9F8EB`, `#F1ECE6`; grey bed `#D1D1D1`); pure white only for real web pages and documents. Dark maps use deep desaturated slate or navy.
- **Print Borders, Not Torn:** a cut-out photo gets a thin straight white print border of a few pixels, a 2-8 degree tilt and a faint shadow. No torn edge was seen in six measured Vox videos; the two-pass torn border in `vox-psychology-and-design.md` §3 is a stylised option only.
- **No Added Halftone:** halftone appears only inside scanned newspaper photos, as part of the source. Do not lay a halftone or duotone over photos for a Vox look (§4 of `vox-psychology-and-design.md` is a stylised option).
- **Pre-Drawn Ruler Timeline Law:** Never space unequal time intervals evenly. Draw an evenly spaced ruler/tick scale first, then place events at their true proportional coordinates so clusters and gaps tell the story.
- **Dual Highlighter Law:**
  - *Digital/Screen Text:* Clean `#FFE600` stroke (the one exception to No Stiff Repeats wobble), `Multiply` blend mode, stroke height **shorter than letter cap-height** (~75–85%), non-highlighted text dimmed to `~30%` opacity.
  - *Archival/Book Page:* 3-pass roughened edges (horizontal marker streaks + border + rough edge) + `Bulge` turbulent displacement, placed in 3D space with a `35mm` camera and shallow Depth of Field tracking the line.
- **No Stiff Repeats:** hand-made wobble on every shape (2 to 4 fps boil, Roughen Edges, slight rotation), no two
  neighbouring elements with the same size, angle and timing: stagger entrances by 2 to 6 frames, vary scale
  ±10%, and hide any repeating pattern with a large-scale noise or paper variation.
- **Camera Speed Graph:** All 2D/3D camera pans and zooms must use a `35mm` focal length equivalent, Null controller parenting, and a **Continuous Bezier** bell-curve speed graph (slow ease-in -> fast snap -> slow settle), never linear keyframes. An infinite zoom is the one exception: exponential scale, so the zoom speed looks constant.

## Scripts & References

- Toolchain audit: [`scripts/check_vox_toolchain.py`](scripts/check_vox_toolchain.py)
- Asset & SVG filter generator: [`scripts/generate_vox_assets.py`](scripts/generate_vox_assets.py)
- Recipe validator: [`scripts/validate_vox_recipe.py`](scripts/validate_vox_recipe.py)
- Unit tests: [`scripts/test_vox_skill.py`](scripts/test_vox_skill.py)
