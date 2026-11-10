# 2D / 2.5D / 3D Toolchain Matrix and Technical Conversion Table

<!-- skill-navigation:start -->
## Reading Map

- [2D / 2.5D / 3D Toolchain Matrix and Technical Conversion Table](#2d--25d--3d-toolchain-matrix-and-technical-conversion-table)
- [1. Installed Tools vs. Optional Downloads (Free First)](#1-installed-tools-vs-optional-downloads-free-first)
- [2. Conversion Table: Vox-Standard Effects in Three Free Toolsets (2D and 3D)](#2-conversion-table-vox-standard-effects-in-three-free-toolsets-2d-and-3d)
- [3. Which Tool for a 2D, 2.5D or 3D Project?](#3-which-tool-for-a-2d-25d-or-3d-project)
<!-- skill-navigation:end -->

## 1. Installed Tools vs. Optional Downloads (Free First)

Run `uv run --no-project python scripts/check_vox_toolchain.py` at any time to check the real state of the machine.

### A. Tools already on the user's machine (100% free, ready to run)

| Tool | Default path | Role in the Vox pipeline (2D / 2.5D / 3D) |
| --- | --- | --- |
| **Blender 5.2** | `blender` (default install folder or `PATH`) | **Full 3D and 2D-in-3D.** Builds 3D terrain maps, 3D bar charts and timelines with **Geometry Nodes**, and hand-drawn strokes and highlighters in 3D space with **Grease Pencil** (`Build` + `Noise` modifier). Also gives 3D slide projectors, a real `35mm` Camera with Depth of Field, and Shader/Compositor setups for crumpled paper and halftone. |
| **DaVinci Resolve + Fusion** | `Resolve` + `fuscript` (default install folder) | **A free replacement for Adobe After Effects + Premiere Pro.** The **Fusion** node system handles all 2D/2.5D motion graphics (`sRender` shape/repeater, `Paint` trim stroke, `FastNoise`+`Displace` for Roughen Edges, `ImagePlane3D` + `Camera3D` + `SpotLight`, `Planar Tracker` in place of Mocha AE). It also has the **Color** page for grading and **Fairlight** for mixing SFX. |
| **Remotion 4.0 + Three.js 0.186 + React 19** | A Remotion project (`npx create-video@latest`), plus [67js](https://github.com/codepawl/67.js) when you need 3D scenes | **Motion graphics in code (2D SVG/Canvas + 3D WebGL).** Automates data charts (D3), GeoJSON maps, true-scale timelines, SVG filters (`<feTurbulence>` + `<feDisplacementMap>` for Roughen Edges and torn paper borders), and 3D scenes with `@remotion/three` / Three.js. |
| **FFmpeg & FFprobe** | `ffmpeg` / `ffprobe` on `PATH` | **Video/audio processing and CLI post-production.** Joins frame sequences, applies `fps=12` (Posterize Time), adds film grain (`noise`), vignette and chromatic aberration (`rgbashift`), and exports MP4/ProRes. |
| **yt-dlp** | `yt-dlp` on `PATH` | Downloads reference videos, maps, subtitles and storyboards for research and footage extraction. |
| **Python + `uv` & Node.js + `pnpm`** | Installed system-wide | Run the asset generation scripts (`generate_vox_assets.py`), process map and chart data (CSV/GeoJSON), and drive Blender/Remotion headless. |

### B. Tools not on the machine (recommended downloads, 100% free and open source)

The user does **not have to** download the tools below. The four tools above already cover 100% of the 2D/3D effects in the playlist. For deeper work on **satellite maps (instead of the paid GEOlayers 3 plugin)** or **manual drawing and background removal with the mouse**, you can install them free with one PowerShell command.

| Tool (free) | Which paid software it replaces | Quick install command (PowerShell) or download link |
| --- | --- | --- |
| **QGIS (open-source GIS)** | Fully replaces **GEOlayers 3** ($149 for After Effects). Exports vector and satellite maps at very high resolution (8K/16K), national borders, rivers, KML/GeoJSON routes and 3D DEM elevation maps. | `winget install OSGeo.QGIS` |
| **Google Earth Studio** | A free Google tool in the browser (needs an account). Flies a 3D camera around real satellite terrain and exports 3D Camera Track data to Blender / Resolve / AE. | Open `https://earth.google.com/studio/` |
| **Inkscape** | Replaces **Adobe Illustrator**. Draws and cleans multi-layer SVG files (vector maps, icons, blueprint diagrams) before you bring them into Fusion / Blender / Remotion. | `winget install Inkscape.Inkscape` |
| **Manim (Community)** | Replaces hand-keyed After Effects maths and diagram animation. Python code renders equations, graphs and geometry to video. | `uv run --no-project --with manim manim -pql scene.py MyScene` (needs a LaTeX install for equations) |
| **BeepBox / froupbox** | Replaces a paid DAW for chiptune intros and loops. Runs in the browser, the song lives in the URL, exports WAV. | Open `https://www.beepbox.co/` or `https://froupbox.github.io/` |
| **FamiStudio** | Replaces a paid DAW for NES-style chiptune with real console sound limits. Exports WAV and MP4. | `https://famistudio.org/` |
| **OBS Studio** | Replaces paid screen recorders. Records screen, webcam and each audio source on its own track. | `winget install OBSProject.OBSStudio` |
| **qpwgraph** (Linux) | Patchbay for PipeWire: wires the mic, desktop output and app inputs into separate OBS sources. On Windows, OBS's per-source audio covers this. | Linux package `qpwgraph` |
| **Simple Icons** | Replaces stock logo packs. 3,000+ brand logos, the copy button copies the SVG markup to paste into Inkscape. Brand marks keep their owners' rules. | `https://simpleicons.org/` |
| **Iosevka** | Open source monospace font (SIL OFL) with a web customizer to build your own variant, weights up to Heavy. Good for titles in a code-themed channel. | `https://typeof.net/Iosevka/` |
| **daccfish** | Small SDL2 C program by iceyrazor that shows a channel's Patreon supporter list as an animated credits screen, recorded with OBS. Licence not stated on its page, so read the repo before reuse. | `https://git.iceyfox.xyz/iceyrazor/daccfish` |
| **Krita** or **GIMP** | Replaces **Adobe Photoshop**. Removes backgrounds from reference images by hand, paints brush stroke textures and edits raster images. | `winget install KDE.Krita` or `winget install GIMP.GIMP` |

---

## 2. Conversion Table: Vox-Standard Effects in Three Free Toolsets (2D and 3D)

The original Flat Pack FX playlist teaches **Adobe After Effects**. The table below converts **each effect or expression 1:1** to the three free tools already on your machine.

| Effect / technique in the playlist (After Effects) | In **DaVinci Resolve Fusion** (2D / 2.5D nodes) | In **Blender 5.2** (3D / Grease Pencil / Compositor) | In **Remotion + SVG / Three.js** (2D / 3D code) |
| --- | --- | --- | --- |
| **Trim Paths** (a stroke that runs along a path, a chart axis or a map route: #01, #04, #28) | `Paint` node (`PolylineStroke`, then drag the `Write On` Start/End slider) or `sOutline` (`Length` and `Position` on the Shape). | **Grease Pencil:** Add a `Build Modifier` (`Sequential` or `Additive` mode).<br>**3D Curve:** Animate `Bevel Start / End` on the `Curve` object. | SVG `<path strokeDasharray={len} strokeDashoffset={len * (1 - progress)} />` or Three.js `Line2` / `TubeGeometry` `setDrawRange()`. |
| **Roughen Edges** (rough ink edges and the two-layer torn paper border: #01, #27, #62, #63, #66) | Combine `FastNoise` (`Detail: 5–8`, `Scale: 20–80`) wired to the control port of `Displace` (`Refraction Strength`), then `ErodeDilate` and `SoftGlow`/`Blur`. | **Grease Pencil:** Add a `Noise Modifier` (Position/Thickness) and `Subdivide`.<br>**3D Mesh / Shader:** `Noise Texture` -> `Vector Math` -> `Displacement`, or cut the alpha with `Greater Than`. | SVG `<filter>`: `<feTurbulence type="fractalNoise">` + `<feDisplacementMap>` (stack 2 turbulence/displacement pairs for the Dual-Pass Torn Border). |
| **Simple Choker** (grow the edge to make a white paper border around a cutout image: #42, #63) | Duplicate the image node -> `ErodeDilate` (Filter: `Circle`/`Box`, positive `Amount` to grow the edge) -> cream `Background` `#F7F4EB` cut by the matte -> `Merge` the original image on top. | **Compositor:** `Dilate/Erode` node (`Threshold` or `Feather` mode, `Distance: +15..+35`), then mix in `#F7F4EB` with `Alpha Over`. | SVG `<feMorphology operator="dilate" radius="12" in="SourceAlpha">` + `<feFlood floodColor="#F7F4EB">` + `<feMerge>` placed under the original image. |
| **Posterize Time (`8–12 fps`)** (16mm stop-motion stutter: #01, #39, #45, #62) | Add a `StopMotion` node (or `TimeSpeed` / the expression `floor(time / 2) * 2`) to the graphics/background branch. Keep `Camera3D` at 24/30 fps. | **Grease Pencil / Object:** Add a `Time Offset` / `Stepped Interpolation` modifier (`Frame Step = 2` or `3` in the Graph Editor `N-panel -> Modifiers -> Stepped`). | Convert frames in Remotion: `const steppedFrame = Math.floor(frame / 2) * 2;` for graphics and texture properties. The camera uses the smooth `frame`. |
| **Wiggle Expression (`wiggle(f, a)`)** (a light shake on cutouts or a jumping paper texture: #29, #32, #33, #62) | Right-click `Center` on the `Transform` node -> `Modify With -> Perturb` (`Speed`, `Strength`, `Wobble`). Add `StopMotion` for a texture boil. | In the **Graph Editor**: select the X/Y/Z channel -> add an **F-Curve `Noise` Modifier** (`Scale`, `Strength`) with a `Stepped Interpolation` modifier. | Use `noise2D(seed, steppedFrame * freq) * amp` from `@remotion/noise` (or a sin/cos hash function that is deterministic per seed). |
| **Shape Repeater** (duplicate dot-matrix circles, timeline ruler ticks and diagonal lines: #08, #28, #55, #65) | `sDuplicate` node (`Copies`, `X/Y Offset`, `Scale`) or a 2D/3D `Duplicate` before `sRender`. | **Geometry Nodes:** `Grid` or `Mesh Line` -> `Instance on Points` (duplicates circles, ruler ticks or 3D bars with independent scale properties). | An `Array.from({ length: count })` loop that renders `<circle>` / `<line>` in SVG, or `THREE.InstancedMesh` for tens of thousands of 3D elements. |
| **Extract + Tint + Blend Mode** (remove the white background of an old newspaper or map and tint it: #29, #35, #40, #45) | `LumaKeyer` node (pull `High` down to remove the bright background) + `ColorCorrector` / `Tint` + `Merge` (`Apply Mode: Multiply` / `Screen` / `Color Burn`). | **Shader Editor:** `RGB to BW` -> `ColorRamp` (invert it to get alpha, or mix colour in `Mix Color` in `Multiply`/`Burn` mode) -> `Principled BSDF`. | CSS `mix-blend-mode: multiply` / `color-burn`, or an SVG `<feColorMatrix>` that turns luminance into alpha (Luma-to-Alpha), then colour it. |
| **Venetian Blinds Halftone (`+45°` / `-45°`)** (old newspaper print dots on a modern photo: #54, #64) | Use the `Halftone` node in Resolve Studio/Fusion, or build 2 `FastNoise`/`Grid` stripes rotated `±45°` + `Displace` + `LumaKeyer` that splits a Light/Dark branch. | **Shader / Compositor:** `Wave Texture` (Bands `Diagonal`) combined with a perpendicular axis -> `Greater Than` that cuts by brightness (`Separate Color` / `RGB to BW`). | An SVG `<pattern>` of circular dots or a `±45°` diagonal grid, combined with `<feDisplacementMap>` and a `<mask>` driven by the image brightness (`generate_vox_assets.py`). |
| **3D Camera (`35mm`) + Null Orbit + Depth of Field** (2.5D/3D camera: #01, #14, #28, #44, #48, #66) | `Camera3D` (`Focal Length: 35mm`, turn on `Depth of Field` in `Renderer3D` `OpenGL`/`Software`) wired to a `Transform3D` that acts as the Null Controller. | **Camera Object:** `Focal Length = 35mm`, turn on `Depth of Field`, set `Focus Object` to an `Empty` placed at the main text or map, and parent the Camera to the controlling `Empty`. | `@remotion/three` `<PerspectiveCamera fov={37.8} />` (equal to 35mm full frame) inside a Null `<group>`, plus `@react-three/postprocessing` `<DepthOfField />`. |
| **Track Objects to Path / Create Nulls From Paths** (ships and vehicles that turn along their route: #23, #31) | In `Transform`: right-click `Center` -> `Path`, then tick `Heading` (turns to the tangent direction of the path). | Add a `Follow Path` constraint to the 3D/2D object, choose the route `Curve`, turn on **`Follow Curve`** and animate `Offset Factor` from `0.0` to `1.0`. | Use `svgPathElement.getPointAtLength(d)` and the derivative `atan2(dy, dx)` (or `THREE.Curve.getPointAt(t)` + `getTangentAt(t)`) to get the position and rotation angle. |
| **Mocha Planar Tracker & Roto Brush** (track drone/flycam motion and separate the foreground: #18, #24, #26, #37) | **`Planar Tracker`** node (free in Fusion. Modes `Perspective` / `Corner Pin` / `Transform` + `Planar Transform`) and the `Polygon` mask tool with automatic keyframe interpolation. | **Motion Tracking** workspace (`Movie Clip Editor`): place markers along a bridge or road -> `Solve Camera Motion`, or `Plane Track Deform` + a `Mask` layer in the Compositor. | Export tracking data as JSON from Blender/Fusion to Remotion when you need to composite code graphics over real footage. |

---

## 3. Which Tool for a 2D, 2.5D or 3D Project?

1. **Choose Remotion + SVG + Three.js when:**
   - The explainer relies on **quantitative data**: bar/line charts from CSV/JSON, dot-matrix grids of thousands of circles, true-scale timeline rulers with automatic coordinates, GeoJSON/TopoJSON maps.
   - You want to reuse templates in bulk through code, control typography layout exactly, make torn paper borders with SVG filters, and mix 2D DOM/SVG smoothly with 3D WebGL (`Three.js`).
2. **Choose DaVinci Resolve + Fusion (`Resolve`) when:**
   - You work with a lot of **real footage (drone footage, interviews, historical B-roll)** that needs planar motion tracking (`Planar Tracker`), foreground separation (rotoscoping), newspaper collage, cinematic grading and a visual audio and voiceover timeline.
3. **Choose Blender 5.2 (`blender` (default install folder or `PATH`)) when:**
   - You need **real 3D space or deep 2.5D**: raised 3D terrain maps with sun shadows and clouds drifting past mountains (#02, #13, #30), 3D timelines that travel through space (#44, #58), 3D slide projectors with optical effects and real depth of field (#14), or **Grease Pencil** strokes drawn directly on 3D model surfaces.
4. **Combine tools (hybrid pipeline):**
   - Use `scripts/generate_vox_assets.py` (Python) to pre-generate torn paper borders, halftone grids and SVG/PNG timeline rulers. Bring them into **Blender** or **Remotion** to animate in 2D/3D. Then use **DaVinci Resolve** or **FFmpeg** to add audio and apply the final finish (`Posterize Time` + `Grain` + `Chromatic Aberration`).
