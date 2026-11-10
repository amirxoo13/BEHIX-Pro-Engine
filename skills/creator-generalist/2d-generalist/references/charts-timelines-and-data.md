# Vox-Style Data Charts, True-Scale Timelines and Sound Waves (2D / 2.5D / 3D)

<!-- skill-navigation:start -->
## Reading Map

- [Vox-Style Data Charts, True-Scale Timelines and Sound Waves (2D / 2.5D / 3D)](#vox-style-data-charts-true-scale-timelines-and-sound-waves-2d--25d--3d)
- [1. True-Scale 2D and 3D Timeline Rulers (#34, #36, #44, #58, #65)](#1-true-scale-2d-and-3d-timeline-rulers-34-36-44-58-65)
- [2. Dot-Matrix / Shape Repeater Reveal (#08, VOX02)](#2-dot-matrix--shape-repeater-reveal-08-vox02)
- [3. Vox / Johnny Harris / WSJ-Style Bar and Line Charts (#04, #12, #37, #47, #50)](#3-vox--johnny-harris--wsj-style-bar-and-line-charts-04-12-37-47-50)
- [4. Sound Waves and Music Theory Charts in the Vox Earworm Style (#11, VOX11)](#4-sound-waves-and-music-theory-charts-in-the-vox-earworm-style-11-vox11)
<!-- skill-navigation:end -->

## 1. True-Scale 2D and 3D Timeline Rulers (#34, #36, #44, #58, #65)

### A. Ruler First, Events After (Ruler-First Proportional Scale, #65)
1. **Use a very wide pre-comp (`5000px–12000px`).**
   - Create a composition or plane `5000x1080` or `10000x1080` wide (#34, #36). Lay out the whole time axis on it before you bring it into the main `1920x1080` comp, which a Camera/Null controls.
2. **Build a ruler with evenly spaced ticks (Repeater Tick Track).**
   - Draw one small vertical tick (`Height: 16px`, `Stroke: 2px`). Use `Repeater` (2D), `sDuplicate` (Fusion) or `Geometry Nodes` (Blender) to duplicate it into `N` ticks with a fixed spacing (for example `40px` per year).
   - Every 5 or 10 ticks, add a taller tick (`Height: 32px`) with a year label (`1980`, `1990`, `2000`...).
   - Place each event at the **exact coordinate of its real year**. Dense periods and historical gaps then show themselves.

### B. Event Branches and Highlight Circles with a Flashing Centre (#36)
- When the main timeline line (`Trim Paths`) reaches an event marker and stops, do the following:
  1. A thinner side branch (`Stroke`) grows at a right angle, up or down, and joins a **Circle Frame**. To make the circle draw smoothly from where the straight branch ends, rotate the circle `Rotation` by `±90°`. The start point of the circle must then match the end point of the straight segment.
  2. **Flashing Pulse Marker (radar point).** At the intersection on the main axis, place a small `500x500` comp with 2–3 concentric circles. Scale them `Scale: 0% -> 100%` out of phase with each other. The outermost circle fades `Opacity: 60% -> 0%` with a light `Glow`.
  3. **Sliding frame mask (Circle/Box Track Matte).** The archive photo (after `Extract` + `Tint` or `Roughen Edges`) slides gently, with `Motion Blur`, inside the circle or box mask.
  4. To compare 2 opposing event streams, duplicate the branch cluster and **flip it to the other side of the timeline axis** (`Flip Vertical` around an Anchor Point on the main axis).

### C. 3D Space Timeline and Historical Film Strip (#44, #58)
1. **Build a reusable Holder (frame container) architecture (#44).**
   - Create 5–10 `Holder` pre-comps (or 3D Image Planes in Blender/Three.js). Give each holder a grey or ivory border frame (`Subtract Mask` border) and a `Roughen Edges` effect that makes an old postcard edge.
   - Offset the Holders in 3D space (different `X`, `Y` and `Z` depth, with a slight `Orientation/Rotation` tilt).
2. **Create 3D depth.**
   - Place a dark map or document very deep behind (far `Z`, `Invert` + lower `Saturation` + `Vignette`).
   - Let extracted text cutouts (in `Overlay` / `Screen` mode, `Opacity: 20%–35%`) float **in front, close to the camera lens**. This makes a blurry foreground bokeh.
   - Turn on **35mm Camera Depth of Field** and keyframe `Focal Distance` to follow the Holder photo that the narration is about.

---

## 2. Dot-Matrix / Shape Repeater Reveal (#08, VOX02)

This is a typical Vox technique to show hundreds or thousands of units (people, dollars, cases, nuclear warheads).

1. **Build the dot grid with a Repeater (do not duplicate layers by hand).**
   - Create 1 small circle. Add **Repeater 1 (horizontal row):** `Copies = C`, `Position Offset = (dx, 0)`. Add **Repeater 2 (vertical column):** `Copies = R`, `Position Offset = (0, dy)`.
2. **Wave-style reveal with an Alpha Matte (#08).**
   - Do not show the whole dot grid at once. Create a large polygon tilted `45°` (or a spreading circle) that sweeps across the dot grid. Use it as an **Alpha Track Matte** (or use the distance to an Empty in `Geometry Nodes`, or `sRender` falloff). The dots then grow along the diagonal from one corner to the other.
3. **Split proportional groups with colour and spacing.**
   - Duplicate the dot grid into 2 layers with different colours (for example muted grey `#4A5568` for the total, and red `#E63946` or yellow `#FFE600` for the group to stress). Use a mask to cut exactly the number of dots that matches the statistic.

---

## 3. Vox / Johnny Harris / WSJ-Style Bar and Line Charts (#04, #12, #37, #47, #50)

### A. The "Two-Level Anchor Point" Trick for Reusable Bar Charts (#50, Johnny Harris Bar Graph)
Use this when you build a chart with dozens of bars of different heights.
- **Mistake:** Keyframing `Scale Y` in the `Transform` of the whole Layer. When you duplicate a bar for the next year and drag its height, the whole animation keyframe set shifts. You then have to fix each keyframe.
- **Correct method (#50):**
  1. Keyframe `Scale Y: 0% -> 100%` (with `Easy Ease`) **inside `Rectangle Transform` (Shape Property)**, with the small Anchor Point at the bar bottom.
  2. When you duplicate the bar for the next 20 years, drag only **`Layer Transform Scale Y`** (with the overall Anchor Point also at the bar bottom) up or down to the data value. The inner grow animation `0 -> target value` keeps its speed and smoothness, and you never touch the keyframes again.
- **Double bar structure (Shadow/Comparison Bar):**
  - Put a dark bar (`Multiply`) underneath and a bright yellow bar (`#FFE600` / `Hard Light`) that grows `3–5 frames` later. This compares 2 values or adds depth on a graph-paper background (`Extracted Grid` in `Multiply` / `Overlay` `20%`).

### B. Reveal a Chart in 3D Space with a Track Matte and Motion Blur (#47)
- Make the line/area chart (with a yellow fill + light `Glow`) and the year markers (`1940`, `1950`...) **3D** layers in front of a dark archive photo background (for example a flag or a map with `Saturation` lowered, `Gaussian Blur` raised and a `Vignette`).
- Create a 3D `Solid Mask` plate that slides sideways as an **Alpha Track Matte**. It reveals the chart over time:
  - **Key point:** Turn on **Motion Blur** on both the chart layer and the sliding `Track Matte` layer. The leading edge of the chart line then has a natural motion blur while it grows.
  - Rotate the `35mm` Camera slightly around the chart while the mask opens from left to right. End with a `Posterize Time (12 fps)` layer.

### C. Attach a Chart to Live-Action Footage (Tracked Live-Action Graph, #37)
- Use this to place a bar or line chart floating on a wall or the sky behind a person who walks.
  1. Use `Planar Tracker` (Fusion / Mocha) to track the architectural plane behind. Export the `Transform` data to a `Null` (or use `Power Pin` / `Corner Pin` to force the chart perspective to match the tilt of the wall).
  2. Set the chart blend mode to `Soft Light` or `Overlay` (duplicate the layer if you need more density). The light of the real scene then shows through the chart.
  3. Duplicate the original footage to the top. Use `Roto Brush` / `Polygon Mask` to cut out the person or foreground object that passes in front of the chart (a light `Feather` + shrink the edge `-1px` so the outline separates cleanly).

---

## 4. Sound Waves and Music Theory Charts in the Vox Earworm Style (#11, VOX11)

From the well-known music analysis series **Vox Earworm**:
1. **Audio Spectrum / Waveform visuals.**
   - Use real audio amplitude data (`Audio Waveform` / `Audio Spectrum` in AE, in Blender the Graph Editor operator Channel > Sound to Samples (`graph.sound_to_samples`) on a keyed property, which a Geometry Nodes input then reads, or `useAudioData()` + `visualizeAudio()` in `@remotion/media-utils`).
   - Set the display to **Digital Bars** or **Segmented Dots**. Give each instrument its own colour (for example kick drum orange-red `#F77F00`, bass blue `#4CC9F0`, vocals yellow `#FFE600`) on a dark `#182026` background.
2. **True-scale staff scroll / Piano Roll.**
   - Follow the Timeline rule (#65). Place the notes or lyric syllables on a true-scale time grid (beat/bar grid). A playhead line sweeps across, or the camera slides sideways with the drum beat. Light up each note block (`Glow` + a slight scale to `110%`) at the exact moment its sound plays.
