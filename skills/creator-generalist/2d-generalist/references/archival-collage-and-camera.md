# Newspaper Archives, Collage, 3D Projector and Camera Finishing (2D / 2.5D / 3D)

<!-- skill-navigation:start -->
## Reading Map

- [Newspaper Archives, Collage, 3D Projector and Camera Finishing (2D / 2.5D / 3D)](#newspaper-archives-collage-3d-projector-and-camera-finishing-2d--25d--3d)
- [1. Historical Newspapers: Flickering Zoom, Hand-Drawn Circles and Magnifier (#01, #29, #46, #66)](#1-historical-newspapers-flickering-zoom-hand-drawn-circles-and-magnifier-01-29-46-66)
- [2. Collage, 3D Paper Unfold and Cut-Paper Animation (#15, #32, #43, #63)](#2-collage-3d-paper-unfold-and-cut-paper-animation-15-32-43-63)
- [3. Turning a Still Photo into a 2.5D Parallax Scene with Depth Titles (#05, #07, #30)](#3-turning-a-still-photo-into-a-25d-parallax-scene-with-depth-titles-05-07-30)
- [4. Vintage 3D Slide Projector and Film Dust (#14)](#4-vintage-3d-slide-projector-and-film-dust-14)
- [5. Ink Smoke Transitions, Film Burn and Custom Brush Strokes (#41, #42, #49)](#5-ink-smoke-transitions-film-burn-and-custom-brush-strokes-41-42-49)
- [6. The Master Vox Finishing Stack](#6-the-master-vox-finishing-stack)
<!-- skill-navigation:end -->

> **Measured against real Vox, 2026-11-09:** 2.5D parallax (§3) is confirmed: keystoned planes, background defocus,
> the camera moving every frame at 24 fps. A slow ease-in newspaper push is confirmed, but the accelerating
> 15-to-3-frame flicker stack (§1A), the 3D slide projector (§4) and torn paper (§2) were not seen in six videos.
> Newspaper shots cut 1.75-5.5 s apart. Treat the unseen effects as stylised options, not the Vox look.

## 1. Historical Newspapers: Flickering Zoom, Hand-Drawn Circles and Magnifier (#01, #29, #46, #66)

### A. Flickering Newspaper Keyword Zoom (#29)
Use this to show that an event covered whole front pages. For example, the keyword *"MOON"* appears on dozens of newspapers.
1. **Remove the newspaper background.** Put the newspaper over a `Crumpled Paper Texture`. Set the newspaper to the `Multiply` blend mode. You can also use `Extract` / `LumaKeyer` and pull `White Point` down to remove the white background, so the crumpled paper grain shows through the text.
2. **Lock the zoom centre on the keyword.** Create a `Null Object` with its centre exactly on the keyword. Parent the newspaper layers to the `Null` and animate `Scale` to zoom in on that keyword.
3. **Cut in an accelerating rhythm (Accelerating Match-Cut Stack).**
   - In the first part, cut the layer every `15–19 frames`. Shorten the gap to `8 -> 5 -> 3 frames` in the last part. Replace each cut with another newspaper so that **the keyword sits at the same position on every newspaper**.
   - At each newspaper change, shift or rotate the crumpled paper layer underneath a little. You can also use the expression `posterizeTime(2); wiggle(10, 600)` on an oversized paper layer. The paper grain then jumps with every newspaper.
4. **Finish with a highlight.** On the last newspaper, run a yellow highlighter stroke (`Multiply` + `Roughen Edges` + `Trim Paths`) over the keyword. At the same time, turn on an `Adjustment Layer` with `Gaussian Blur` and an `Inverted Feathered Mask` cut around the headline. This blurs all the small text around it (#27, #29).

### B. Dynamic Colour Highlight and Dispersing Magnifier (Dynamic Color & Lens Highlight, #46)
Use this to circle and magnify several details on a technical drawing or newspaper page.
1. Duplicate the document layer into 2 copies:
   - The lower copy (`Black & White Base`): lower the contrast/brightness when the circles appear.
   - The upper copy (`Color Highlight Layer`): use `Set Matte` / `Track Matte` to cut it by a `Circle Shape Layer`. Link the `Tint` or `Hue/Saturation` colour directly to the circle colour. The lines inside the circle then switch to the matching deep colour automatically.
2. Add the **`CC Lens`** effect (or a convex lens `Displace`). Put an expression on its `Center` that follows the circle `Position` (`Size: 0 -> 20`). This looks like a magnifying lens gliding over the paper.

---

## 2. Collage, 3D Paper Unfold and Cut-Paper Animation (#15, #32, #43, #63)

### A. Multi-Angle Collage and Face Flicker (Vox Collage Flicker, #32)
1. **Mix photo materials.** Collect 4–6 pictures of the same person or subject at a similar face angle but in different materials (colour photo, black and white photo, old engraving, oil painting).
2. **Cut odd polygon masks.** Use the Pen Tool to cut the pieces as asymmetric polygons (eyes, half a face, shoulders) instead of even rectangles.
3. **Give each piece its own wiggle rhythm.** Put the expression `wiggle(1, 15)` (with `Posterize Time`) on each cut piece. Do the same for the scribbled lines (a `Squiggly Stroke` with `Roughen Edges` at different thicknesses: `7px`, `9px`, `12px`) that run across the collage.
4. **Make the eye and face flicker.** Cut the central photo layer into 4–5 short segments (`3–5 frames` each). Replace them with different photos, all aligned on the eye position. At the same time, the master `Null` scales gently from `85% -> 100%`.

### B. 3D Paper Unfold / Pop-Up Book Effect (#43)
Use this to make a building, character or banknote burst open like a 3D pop-up book.
1. **Bake the paper texture (Baked Paper Pre-comp).** Put a crumpled paper layer (`Multiply` + `Tint`) over the cutout photo. Cut it by the photo's **Alpha Track Matte**, then `Pre-compose` it. The paper grain then stays stuck to the object when it folds.
2. **Split the folds with Mask Intersect/Subtract.**
   - Divide the object into parts: centre body, left wing, right wing, top section.
   - Turn all the pieces into **3D Layers** (or 3D planes joined by hinges in Blender/Three.js).
   - Put the pivot (`Anchor Point`) of each piece **exactly on the fold line**.
3. **Animate the 3D hinge rotation (`X / Y Rotation`).**
   - The two side wings rotate on the `Y` axis from `±90°` (or `±160°`) open to `0°`, like butterfly wings. The top section rotates on the `X` axis from `-90°` up to `0°`, `6 frames` later (`Easy Ease` + `Motion Blur`).
   - Add ribbons or banknotes that curl and fly out from behind with `Wave Warp` (`Sine`, `Wave Height: 8`, `Wave Width: 220`, `Direction: Horizontal`) along a curved path (`Bezier Position Path`).

---

## 3. Turning a Still Photo into a 2.5D Parallax Scene with Depth Titles (#05, #07, #30)

Use this when you have only one historical photo but need a gripping 5–8 second shot.
1. **Split 3 depth layers (Foreground / Midground / Background).**
   - Cut the foreground subject (a person, a monument) and the midground out of the background.
   - Fill the missing background behind the subject with Inpainting / Clone Stamp. If the camera move is small, you can also scale the background up `8%–12%` and blur it slightly.
2. **Arrange the layers in Z-space and place text between them (#05, #07).**
   - Push the background far away (positive `Z` in AE, negative `Z` in Blender and Three.js). Keep the midground at `Z = 0`. Pull the foreground close to the camera.
   - Put the **large title text between the Foreground and Background layers**. The foreground subject then hides a small part of the text when the `35mm` camera moves. This gives an instant sense of 3D space.

---

## 4. Vintage 3D Slide Projector and Film Dust (#14)

This is one of the most typical Vox effects. Use it to flip quickly through many maps or archive photos.

1. **Foreground slide frame (Foreground Slide Frame).**
   - Create an ivory or light grey solid. Cut a rounded rectangle hole in the middle (`Rounded Rectangle Mask` in `Subtract` mode) to make the border of a projected frame (Polaroid / 35mm Slide Mount).
   - Turn on **3D Layer** and pull this frame **closer to the Camera** than the plane that holds the photos underneath.
2. **Reverse depth of field (Out-of-Focus Foreground Frame).**
   - Turn on **Camera Depth of Field** on the `35mm` lens. Lock the focus distance (`Focal Distance`) on the **plane of the photo behind the frame**. The photo or map inside stays perfectly sharp. The white border near the camera gets a soft bokeh blur at its edge.
3. **Animate the frame push with a mechanical bounce (`X-Rotation Bounce`).**
   - When the slide frame slides up into the middle of the screen, add `X` rotation keyframes (`+12° -> -1° overshoot -> 0° settle`). It looks like a mechanical projector tray snapping into place.
   - Inside the frame, stack and cut 6–10 maps or archive photos. Flip to the next one every `8–12 frames` (`0.3s–0.5s`) and stop on the main photo.
4. **Projector lens optics.**
   - Put these on top: `CC Lens` (`Size ~ 300` gives a slight barrel curve at the 4 corners) + `Chromatic Aberration` (`Red: +3, Green: +2, Blue: -1`) + film dust and scratches (`Screen` / `Add`) + a warm, yellowish vintage `Lumetri` grade.

---

## 5. Ink Smoke Transitions, Film Burn and Custom Brush Strokes (#41, #42, #49)

### A. Multi-Plane Smoke Luma Reveal (#41)
- Use a video of white smoke on black (raise the contrast with `Curves` and speed it up with `Time Stretch: 50%`) as a **Luma Matte**. It gradually reveals the photo of a historical figure (with `Saturation` lowered and `Contrast` raised).
- Place the main figure, the side figures and the handwritten document at different `Z` depths in 3D space. Each plane uses a smoke layer that moves in the opposite direction. The main plane has smoke rising from the top down, and the side plane has smoke rising from the bottom up. Add ember particles (`Embers` in `Color Dodge` mode) and a `35mm` Camera with DOF.

### B. Film Burn and Independent Wiggle Outline (#42)
- **A white outline that wiggles independently of the subject.** Duplicate the figure photo. On the lower layer, apply a negative `Simple Choker` (`-10` to `-20`) + an ivory `Fill`. Add the expression `wiggle(0.7, 8)` **only on the lower outline layer** and parent it to the upper photo layer. The white outline around the figure then drifts in gentle waves, independent of the photo. This makes the collage feel alive.
- **Film burn (`CC Film Burn` / Radial Luma Burn).** Apply a burn that spreads from the centre outwards (`Easy Ease`). Apply it in sync on the title text (`Overlay`) and on the castle or archive background behind it. This gives one consistent transition language.

### C. Custom Procedural Brush Stroke (#49)
Use this when you do not use a ready brush PNG and want a dynamic brush stroke with an adjustable ink dryness.
1. Create a `1000x1000` brush-head comp that holds `Turbulent Noise` (raise `Contrast` very high and use the `Brightness` slider to set how dense or hollow the bristles are). Cut it with a diagonal `Mask`.
2. Bring the brush head into the main comp and animate `Position` gliding sideways along a gentle curve.
3. Create an `Adjustment Layer` with the **`Echo`** effect (a very small `Echo Time: -0.002s`). Raise `Number of Echoes` until the copies join from start to end into one long brush stroke.
4. Apply `Tint` (to change colour) + `Roughen Edges` (`Rusty` type) + `Directional Blur` (`90°` horizontal, to smooth the bristle streaks) + a second `Roughen Edges` layer at the edge. Use this brush stroke as a background or as an **Alpha Matte** that reveals the title text.

---

## 6. The Master Vox Finishing Stack

Whether you build in **Remotion + Three.js**, **DaVinci Resolve Fusion** or **Blender 5.2**, always put these effects in the **last step** (on an Adjustment Layer / Post-Processing / Compositor). This keeps the edit fast and locks in the Vox quality.

| Order (bottom to top) | Finishing pass | Standard settings |
| --- | --- | --- |
| **Pass 1** | **Selective Focus / 35mm Depth of Field** (#27, #34, #66) | Lock focus on the main information area. In 2D, use an `Adjustment Layer` + `Fast Box Blur (3–5px)` or `Camera Lens Blur` with a freehand `Mask` (`Inverted` + `Feather: 150–300px`). |
| **Pass 2** | **Unsharp Mask / Tactile Crispness** (#32, #40, #48) | Raise edge sharpness slightly (`Amount: 25–45`, `Radius: 1.5–2.0`) to bring out the paper grain and ink grain. |
| **Pass 3** | **Subtle Chromatic Aberration & Lens Distortion** (#14, #48, #64) | Split the RGB channels slightly at the frame edge (`0.5px–2.0px`) to remove the look of a perfect digital render. |
| **Pass 4** | **Vignette & S-Curve Grade** (#36, #41, #48) | Darken the 4 corners slightly (`Vignette`) + a gentle S-shaped `Curves`. Work at **16-bit per channel** (#36) if there is a gradient background (`Gradient Ramp`), to prevent banding. |
| **Pass 5** | **Static / Low-Speed Film Grain** (#27, #29, #39, #62) | Small film grain (`Intensity: 0.8–1.6`, `Animation Speed: 0` for still paper or `0.5` for archive film). Never leave the grain jumping wildly at the default speed. |
| **Pass 6** | **Posterize Time (`12 fps`)** (#01, #34, #39, #62) | Bring the rhythm of the graphics, collage and texture layers to `8–12 fps` (the 16mm editing standard). Keep the large camera pan/zoom moves smooth. |
