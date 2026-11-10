# Visual Psychology and Design Principles of the Vox Style (2D / 2.5D / 3D)

<!-- skill-navigation:start -->
## Reading Map

- [Visual Psychology and Design Principles of the Vox Style (2D / 2.5D / 3D)](#visual-psychology-and-design-principles-of-the-vox-style-2d--25d--3d)
- [1. Visual Hierarchy and Asymmetric Scale Contrast](#1-visual-hierarchy-and-asymmetric-scale-contrast)
- [2. Blueprint Aesthetic and the 3 Pillars of Credibility (#62)](#2-blueprint-aesthetic-and-the-3-pillars-of-credibility-62)
- [3. Deliberate Imperfection: The Two-Layer Torn Paper Border (#63)](#3-deliberate-imperfection-the-two-layer-torn-paper-border-63)
- [4. Print Citation: The Hidden Halftone Effect (#64, #54)](#4-print-citation-the-hidden-halftone-effect-64-54)
- [5. The True-Scale Timeline Ruler Law (#65)](#5-the-true-scale-timeline-ruler-law-65)
- [6. The Dual Highlighter Law (#66, #01, #29)](#6-the-dual-highlighter-law-66-01-29)
- [7. Colour Palettes, Typography and Editing Rhythm from Famous Vox Videos](#7-colour-palettes-typography-and-editing-rhythm-from-famous-vox-videos)
<!-- skill-navigation:end -->

> **Measured against real Vox, 2026-11-09** (six 2018-2021 collage-era videos plus four 2026 ones; notes in
> `vox-modern-measured.md` and `local.md`). Sections 3 and 4 below (torn borders, added halftone) and the
> 12 fps posterised wobble were **not seen** in any of them: keep them for a stylised piece, never call them Vox.
> Corrections: paper cards are flat, luma std 0-1, no grain. The marker band is **135-150% of cap height**
> (5.8-9.6% of frame height), yellow `#E8E030` to `#F2EB28`, rounded ends, Multiply, the sweep takes **1.0-1.4 s**
> slow-fast-slow, and other text is **never dimmed**. Holds are still (0.00-0.03 of 255 change per 0.125 s).
> Photo tilt 2-8 degrees with a thin white print border and a faint shadow. Red appears only as map fills and red
> ellipses or underlines on documents.

## 1. Visual Hierarchy and Asymmetric Scale Contrast

From an in-depth analysis (#61, *Why Amateur Motion Graphics All Look the Same*):

### Common beginner mistakes
- Splitting the frame evenly into balanced columns and rows. Every element has a similar size and fills every empty space.
- When everything has the same visual weight, the viewer's eye does not know where to look first. When you add motion to a flat design like this, the scene turns into motion chaos.

### The Vox rule: Extreme Scale Contrast
1. **One huge anchor (Dominant Anchor).** Pick only 1 element that carries the main message. Scale it up so it clearly dominates, and place it off-centre (asymmetric placement).
2. **A tiny secondary element (Tiny Secondary Target).** Shrink the element it is compared with. This creates visual tension between large and small.
3. **Generous negative space (Generous Negative Space).** Keep at least `45%–65%` of the frame as empty textured paper background (textured negative space). Empty space is not an area you have not drawn yet. It is a tool that forces the viewer's eye onto the subject.
4. **Connecting path (Connecting Path).** Use a stroke line, a dashed line or a ruler axis to connect the large Anchor to the small element.

### The Look-Away / Look-Back Test
- Before you place any keyframe, export or look at the finished still frame. Look away for 3 seconds, then look back at the screen:
  - Where does the eye land first?
  - Where does the eye move second?
- Start to animate only when the eye follows the order of the story you want to tell while the picture is **still**.

---

## 2. Blueprint Aesthetic and the 3 Pillars of Credibility (#62)

Why does Vox graphics look like **"scientific evidence / historical record"** (visual evidence) while amateur graphics look like **"a personal opinion on a computer"**?

Over centuries, the human brain learned to trust physical documents (printed maps, technical blueprints, archive files, printed newspapers). Before the digital age, printing needed vetting, editing and material cost. Sharp vector graphics on a pure white background (`#FFFFFF`) trigger the brain's doubt because they look "cheap and just typed".

To trigger the "trust the record" reflex, every Vox 2D/3D frame stands on **3 Pillars**:

| Pillar | Nature | Standard technical settings (2D and 3D) |
| --- | --- | --- |
| **1. Surface** | A warm material with fibre grain (tactile paper/slate). Never use digital pure white or pure black. | - Light background: warm cream `#F4F1EA`, old newsprint `#EFECE6`, or warm grey `#E5E0D8`.<br>- Dark background (Blueprint/Atlas): charcoal blue-black `#1B222C`, blueprint blue `#162B40`, muted dark red `#2A1818`.<br>- Add a **Paper Texture** layer (`Multiply` 15%–30% on a light background, `Screen`/`Overlay` 10%–20% on a dark one) + **Static Grain** (`animation speed = 0` or `0.5`, light intensity). |
| **2. Ink** | The ink soaks into the paper fibres. It does not float like a plastic sticker on the screen. | - Blend mode: `Multiply`, `Color Burn` or `Linear Light` (avoid sharp `Normal` 100%).<br>- **Paper Luma Matte:** Duplicate the paper background layer, raise the contrast very high (Curves S-curve) and use it as a **Luma Matte** for the graphics/text layer. The paper grain then shows through the ink strokes.<br>- **Roughen Edges + Displace:** Roughen the edge very finely (`Border: 1.5–3`, `Scale: 15–40`) + a light `Gaussian/Box Blur` (`0.5–1.5px`) to remove the digital sharpness. |
| **3. Life (16mm rhythm)** | A low frame rate that recalls a 16mm projector and a real rostrum camera stand. | - **Graphics / collage / background motion:** Apply `Posterize Time` at **`8–12 fps`** (`12 fps` is the standard for objects, or `2–4 fps` for a stop-motion jumping background texture with `wiggle(2, 1500)`).<br>- **2D/3D camera motion:** Keep a smooth **`24 fps` or `30 fps`** with a Continuous Bezier speed graph, so large pans and zooms do not tire the eye. |

---

## 3. Deliberate Imperfection: The Two-Layer Torn Paper Border (#63) (stylised option, not seen in Vox)

When you put a cutout photo of a person or object (cutout PNG) on a detailed map or newspaper background, the photo sinks in or looks like a cheap composite. The Vox solution is a **hand-cut / torn white paper border (Torn Paper Cutout Border)**.

### The 4-step process (for both 2D Layers and 3D Image Planes)
1. **Create the expanded matte core (Expanded Matte).**
   - Duplicate the cutout photo layer and put it underneath.
   - Fill it ivory (`#F7F4EB`, not `#FFFFFF`).
   - Expand the edge with a negative `Simple Choker` (`-15` to `-35`) or an `ErodeDilate` / `Morphology Dilate` node / SVG `<feMorphology operator="dilate">`.
2. **Dual-Pass Roughen Edges. This is the core secret.**
   - A single Roughen Edges layer always looks fake (either too round like a cloud, or too jagged). You must stack **2 layers**:
     - **Pass 1 (scissor cuts / large tears):** `Spiky` type (sharp/straight), large `Scale` (`80–140`), medium `Border` (`12–25`), high `Edge Sharpness` (`3.0–5.0`). This makes straight broken edges, like hand scissor cuts around the photo.
     - **Pass 2 (tiny paper fibres):** `Roughen` type, small `Scale` (`10–25`), thin `Border` (`2–5`), high `Fractal Influence`. This makes a rough fibre grain on the straight edges of Pass 1.
3. **Clip a fabric/paper texture over the photo (Fabric/Paper Texture Clip).**
   - Put a coarse fabric or crumpled paper texture over the photo and border. Use the blend mode `Hard Light` or `Multiply` (`20%–35%`) and cut it by the **Alpha Matte** of the paper border layer.
4. **Separated drop shadow (Tactile Drop Shadow).**
   - Add a short-distance shadow (`Distance: 6–15px`, `Softness: 12–25px`, `Opacity: 25%–40%`). Sometimes tint it purple, blue or muted red (`#2B2338`) instead of pure black, to lift the photo clearly off the table.

---

## 4. Print Citation: The Hidden Halftone Effect (#64, #54) (stylised option, not seen in Vox)

When Vox cites a modern web article or a digital news photo, it still puts a layer of **1950s halftone print dots** over it, at a level that is almost impossible to notice consciously (`Sub-perceptual Print Citation`).

### Crossed halftone dots (Crossed Venetian Blinds + Roughen Edges)
1. **Build the dot grid by hand (do not use a rigid Halftone filter).**
   - Apply 2 `Venetian Blinds` layers at right angles to each other. Layer 1 at `+45°`, Layer 2 at `-45°`, `Transition Completion: 35%–40%`, `Width: 12–19`, `Feather: 0`. The crossing points of the two diagonal stripe sets form a square-cell grid.
   - Apply `Roughen Edges` to the square grid. It rounds and slightly distorts each cell into newspaper halftone dots of naturally uneven size.
2. **Separate light and dark mattes (Blind Light & Blind Dark).**
   - Duplicate the original photo into 2 **Luma Matte** layers with contrast Curves:
     - `Blind Light` (regular Luma Matte): keeps small dots in the light areas.
     - `Blind Dark` (Inverted Luma Matte): keeps denser dots in the dark areas.
3. **Lower it to the threshold of perception (Threshold of Perception).**
   - Add a light `Chromatic Aberration` at the edge and lower the halftone strength. A normal viewer would not point at the screen and say "there are dots". The brain still sorts the picture at once as **"published and verified record"**.

### "Jumping" moire on flat illustration (Johnny Harris style)
- A fast method for a flat illustration or collage scene: take a high-resolution halftone texture (Texturelabs, credit
  the source) and lay it over the whole frame in `Overlay`. Then push the camera in or drift it very slowly. The texture stays **fixed** to the
  frame and only the scene below moves. The dot grid interferes with the drawn lines and makes a moire pattern that runs continuously. The scene
  no longer looks flat like a slide.
- Check: view it at 100% and at phone screen size. A still pattern means the camera did not run. A pattern of wide, flickering stripes means the
  dots are too coarse or the camera is too fast. Lower the opacity or use a finer texture.

---

## 5. The True-Scale Timeline Ruler Law (#65)

This comes from the classic work of **Cleveland & McGill (1984)** on visual data perception (*Position along a common scale*). Vox applies it fully (#65, *Why Your Timelines Feel Off*):

### Forbidden
- **NEVER** space event markers evenly (`100px`, `200px`, `300px`...) when the real time gaps between them are not equal (for example `1991`, `1993`, `2008`, `2009`). With even spacing, the time axis is only a disguised numbered list. It loses the whole story of rush and historical silence.

### Required process: Ruler-First Protocol
1. **Step 1: Create an evenly spaced ruler (Evenly Spaced Ruler).**
   - Use `Repeater` (2D), `sDuplicate` (Fusion) or `Geometry Nodes` (Blender 3D) to draw a system of tick marks spaced exactly evenly in a standard time unit (for example each small tick = 1 year or 1 day, each large tick = 5 or 10 units).
2. **Step 2: Place events at their real coordinates.**
   - Put each event on the exact tick of its real year or day:
     $$x_{\text{event}} = x_0 + (t_{\text{event}} - t_{\text{start}}) \times \text{px\_per\_unit}$$
3. **Step 3: Use the gaps with the camera.**
   - When two events are 15 years apart, the camera must glide fast across a series of empty ticks before it stops at the next cluster of events. The distance the camera travels across those empty ticks lets the viewer **feel the length of time** visually, without doing mental arithmetic.

---

## 6. The Dual Highlighter Law (#66, #01, #29)

Vox does not use one highlighter style for every kind of text. It clearly separates **2 physical contexts** (#66, *Vox Uses Two Different Highlighters*):

| Context | When to use it | Detailed technical structure |
| --- | --- | --- |
| **Highlighter 1: Digital text / online news (Digital Screen Highlighter)** (current Vox measured differently: a line-box-tall flat band, no dimming; see `vox-modern-measured.md`) | When you cite an online article, a clean PDF document or a flat 2D designed text panel | - **Colour and blend:** bright yellow `#FFE600` or `#F7E354`, blend mode `Multiply`.<br>- **Stroke height (Cap-Height Rule):** The stroke thickness is **lower than the capital letter height** (about `75%–85%` of the line height). The tall letter tops stick out slightly past the stroke.<br>- **Stroke end:** Softly rounded or slightly bevelled, not jagged.<br>- **Darken the surrounding area:** Lower the Opacity of the unhighlighted text to **`~30%`** as soon as the stroke passes (`Trim Paths` 0% -> 100% in `12–18 frames`, Easy Ease). |
| **Highlighter 2: Printed book page / archive record shot at an angle (Archival Book Page Highlighter)** | When you highlight on an old book page or a historical document with paper grain, placed in tilted 3D space | - **3 stacked Roughen Edges layers:**<br>  1. *Pass 1 (horizontal brush streaks):* `Edge Sharpness: 8–10`, stretched on the horizontal axis to make dry ink streaks at the tail of the marker stroke.<br>  2. *Pass 2 (large edge roughness):* `Border: ~40–50`, which makes bumps and dips along the stroke body.<br>  3. *Pass 3 (paper fibres soaked in ink):* a small `Roughen` type at the edge.<br>- **Bulge distortion (Bulge Distortion):** Add a `Turbulent Displace` of `Bulge` type (`Amount: 15–30`, `Size: 60–120`). The stroke end swells slightly (from pressing the pen tip on the paper) and tapers in the middle.<br>- **3D space and DOF:** You must make the book page and the stroke **3D Layers** with a `35mm` Camera. Turn on **Depth of Field** (wide aperture) so only the line being highlighted is sharp. The top and bottom edges of the page blur naturally. |

---

## 7. Colour Palettes, Typography and Editing Rhythm from Famous Vox Videos

This summarizes 12 classic Vox videos (*How highways wrecked American cities*, *How the US stole thousands of Native American children*, *Why all world maps are wrong*, *The hidden history of gated communities*, *Earworm*, *By Design*).

### Standard Vox palettes (Editorial Palettes)
1. **Classic Vox Editorial (light):**
   - Paper background: `#F4F1EA` / `#EFECE6`
   - Main ink (Charcoal Ink): `#1E2022`
   - Highlighter yellow (Vox Yellow): `#FFE600` / `#F7E354`
   - Alert red / border line (Editorial Red): `#E63946` / `#D62828`
   - Data blue (Atlas Blue): `#2A6F97` / `#1D3557`
2. **Vox Blueprint / Dark Atlas (dark):**
   - Slate / drawing background: `#182026` / `#1B263B`
   - Coordinate grid (Grid): `#2B3A4A` (`Overlay` 20%)
   - Main line: `#F0EEE9` (ivory, do not use `#FFFFFF`)
   - Glowing accents (Cyan / Amber): `#4CC9F0` and `#FCA311`
3. **Archival Sepia / Missing Chapter (vintage):**
   - Yellowed paper background: `#EAE0C8`
   - Brown-black ink: `#2B2118`
   - Accents: brick red `#B23A22` and moss green `#386641`

### Combined typography system (Font Pairing)
- **Titles / chapter labels (Editorial Serif):** *Harriet*, *Baskerville*, *Playfair Display* or *Instrument Serif*. Often combine **Regular** with **Bold Italic** on the key word (#27).
- **Numbers / maps / charts (Geometric Grotesque Sans):** *Balto*, *Overpass*, *Inter*, *Poppins ExtraBold* or *Space Grotesk*. Use spaced capitals (`letter-spacing: 0.08em–0.15em`) for country and city names on maps.
- **Records / dates / notes (Archival Monospace / Typewriter):** *American Typewriter*, *Courier Prime* or *JetBrains Mono*, with a `Typewriter` typing effect (#27, #33, #45).

### Editing rhythm (Editorial Pacing)
- **The 0.25s "Show-Before-Tell" rule.** The guiding stroke or zoom frame appears about `4–8 frames` (`0.15s–0.3s`) before the keyword in the voiceover, to catch the viewer's eye.
- **J-cut audio rhythm and physical SFX.** Every visual move comes with a dry, short physical sound: paper rustle (*paper rustle*), marker swipe (*marker swipe*), slide projector (*projector click* #14), a light typewriter tick (*typewriter tick*), and a deep *whoosh* when the 35mm camera shoots across a map.
