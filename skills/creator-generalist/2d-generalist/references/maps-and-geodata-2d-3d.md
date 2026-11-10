# Building Maps and Geography in the Vox / Atlas / Johnny Harris / WSJ Style (2D / 2.5D / 3D)

<!-- skill-navigation:start -->
## Reading Map

- [Building Maps and Geography in the Vox / Atlas / Johnny Harris / WSJ Style (2D / 2.5D / 3D)](#building-maps-and-geography-in-the-vox--atlas--johnny-harris--wsj-style-2d--25d--3d)
- [1. Shared Architecture of Every Vox Map Scene (Pre-comp / High-Res Base Rule)](#1-shared-architecture-of-every-vox-map-scene-pre-comp--high-res-base-rule)
- [2. 2D Vector, Old Newspaper and Blueprint Maps (#03, #28, #35, #40, #45, #48)](#2-2d-vector-old-newspaper-and-blueprint-maps-03-28-35-40-45-48)
- [3. 2.5D Raised Maps, Terrain Shadows and Parallax Clouds (#02, #13, #19, #22, #57)](#3-25d-raised-maps-terrain-shadows-and-parallax-clouds-02-13-19-22-57)
- [4. Real 3D Terrain Maps, KML/GeoJSON Routes and Path-Following Objects (#20, #23, #30, #31)](#4-real-3d-terrain-maps-kmlgeojson-routes-and-path-following-objects-20-23-30-31)
- [5. Tracking Maps and Graphics onto Flycam / Drone Footage (#18, #24, #26, #39)](#5-tracking-maps-and-graphics-onto-flycam--drone-footage-18-24-26-39)
- [6. 35mm Camera Control and the Speed Graph](#6-35mm-camera-control-and-the-speed-graph)
<!-- skill-navigation:end -->

## 1. Shared Architecture of Every Vox Map Scene (Pre-comp / High-Res Base Rule)

From #02, #28, #31, #48:
1. **Base resolution 3–4 times larger (`4000px–8000px`).**
   - Never draw routes or text labels directly on a `1920x1080` frame if the camera zooms. Create a base map space (Base Map Comp / 3D Plane / SVG ViewBox) of at least **`3840x2160` up to `8000x8000`**.
2. **Multi-Scale Tile Pyramid (#28).**
   - Use this to zoom from a view of a whole continent into a single canal (such as the Suez Canal) or a building:
     - Put the wide-angle screenshot or tile at the bottom.
     - Put the mid-range and close-range (high resolution) screenshots on top at the matching position. Blend the edges with a lightly feathered mask (`Feather: 15–30px`).
     - Lock all these image layers to the same 3D plane (`Z = 0`). When the `35mm` Camera flies from far to near, the image stays perfectly sharp and does not break into grain.
3. **Free high-quality map sources.**
   - **Old historical maps:** the *David Rumsey Map Collection* (`davidrumsey.com`, download the `6000px+` version as in the guide at #31) or the *Library of Congress*.
   - **Modern vector, road and terrain maps:** *OpenStreetMap*, *Natural Earth Data* (GeoJSON/Shapefile for Remotion/Blender), *QGIS* (exports PDF/SVG/PNG 8K), or *Bing Maps / Google Maps Satellite*.

---

## 2. 2D Vector, Old Newspaper and Blueprint Maps (#03, #28, #35, #40, #45, #48)

### A. Separate Map Line Layers with Extract / Luma Key (#35, #40, #45)
Vox does not keep the map screenshot as is. It splits the background from the roads and borders so it can change their colours freely.
1. **Base Layer.** Apply `Tint` to turn the dark areas blue-black (`#16222F`) or warm cream (`#EFECE6`).
2. **Extracted Lines Layer.** Duplicate the map. Use `Extract` / `LumaKeyer` / SVG `Luma-to-Alpha` to remove all the bright background. Keep only the lines of roads, rivers and text. Apply `Tint` to turn them ivory, yellow `#FFE600`, or a lightly glowing cyan (`Glow`).
3. **Country area flash (Johnny Harris Country Highlight Flash, #48).**
   - Draw a polygon around the country to stress (orange/yellow `#F77F00` or `#FFE600`, blend mode `Multiply` on a light background or `Overlay`/`Soft Light` on a dark one).
   - When it appears, do not use a dull fade from `0% -> 100%`. Use a **Double-Pulse Flash** keyframe sequence: `0% (frame 0) -> 85% (frame 4) -> 35% (frame 8) -> 100% (frame 14)`. This makes an instant "light up" that grabs the eye.
4. **Dual-Layer Color-Shift Path (#48).**
   - Create 2 paths that overlap exactly and both run `Trim Paths`:
     - Lower layer: a white path (`Normal`, `Opacity: 65%`) that leads.
     - Upper layer: an orange/yellow path (`Multiply` / `Screen`, `Opacity: 100%`) that runs `4–6 frames` later, while the white path fades to `0%`.

### B. Satellite-to-Blueprint Wipe (#40)
- Align the satellite image of a building or area with the floor plan drawing (a blueprint/plan outline cut out with `Extract`).
- Sweep a sliding mask (`Track Matte` solid/shape with `Easy Ease` + `Motion Blur`) across the frame:
  - In front of the mask: show the real satellite image.
  - Behind the mask: show the technical drawing in white on a blueprint blue background (`#1B2B44`), with a dot grid (`Dot Grid` in `Hard Mix` / `Overlay` mode) and a `Stroke` outline that runs around the perimeter of the structure.
- If a title crosses the border between the two areas, duplicate the title layer. Colour the half on the light background black and the half on the dark background white. Cut both with the same sliding mask.

### C. Stop-Motion Cutout Map (#45)
- Split the map into separate districts or regions with intersecting masks (`Intersect` / `Subtract`).
- Apply `Roughen Edges` to the edge of each piece to make a cut paper edge.
- Slide and slightly rotate each piece in from outside the frame until they fit together. Add `wiggle(3, 2)` on the position and put a `Posterize Time (6 fps)` layer on top. The whole map then assembles like stop-motion paper cutout animation.

---

## 3. 2.5D Raised Maps, Terrain Shadows and Parallax Clouds (#02, #13, #19, #22, #57)

### A. Terrain Emboss and Painted Cast Shadows (#02)
Use this when you have only a flat 2D map image but want mountains that look raised when the camera tilts.
1. **Make the relief.**
   - Apply `Color Emboss` (`Direction: 130°`, `Relief: 3–6`, `Contrast: 100%`, blend mode `Multiply` or `Overlay`). You can also use a `Displacement Map` / `Mesh Warp` to push the mountain peaks up.
2. **Paint long mountain shadows by hand (Hand-Painted Mountain Shadows).**
   - Create a black solid/shape layer above the mountain range. Use a brush to paint shadow areas that follow the slopes on the side away from the sun. Apply `Fast Box Blur` (`15–30px`) and lower `Opacity` to `15%–25%`.
3. **Multi-layer drifting clouds in 3D space (3D Cloud Planes).**
   - Place 2–4 cloud PNG layers with a transparent background at different `Z` heights above the map plane (`Z = -80` to `-250` in AE, or `Z = +0.5` to `+2.0` in Blender/Three.js). Lower `Opacity` to `35%–50%`.
   - When the `35mm` Camera flies across and rotates slightly, the cloud layers drift at a different speed from the ground (parallax). This gives a very real sense of height from 2D material only.

### B. Extruded Country Pop-Up (#13, #57)
Use this to lift a country or an island off the map into a 3D block with side faces (extrusion).
- **In Blender 5.2 (the most true 3D):**
  - Import the SVG of the country border -> `Convert to Mesh` -> add a `Solidify Modifier` (or `Extrude Mesh` in Geometry Nodes) -> UV Project the satellite image onto the top face (`Top Material`) and give the side walls a muted rock/earth colour (`Side Rim Material`) -> place a low-angle `Sun` light to cast real shadows onto the sea around it.
- **In Resolve Fusion / After Effects (2.5D Stack, #13):**
  - Cut out the country area with a mask + `Roughen Edges`.
  - Build the thickness by stacking `15–20` copies, each shifted `1px` on the `Z` axis (`index * 1`). Give the bottom layers a darker colour as the walls. Add one more layer pushed further down at the base with `Fast Box Blur` as the Drop Shadow.
  - Add water waves around the coast. Duplicate the coastline outline, push it below, and apply `Roughen Edges` + a slow-moving `Turbulent Displace`.

---

## 4. Real 3D Terrain Maps, KML/GeoJSON Routes and Path-Following Objects (#20, #23, #30, #31)

### A. Turn a 2D Image / Map into a 3D Model with a Depth Map (#30)
- Generate a depth map (a 16-bit grayscale **Depth Map** from a depth generation model, or DEM elevation data from QGIS/OpenTopography).
- **In Blender 5.2 / Three.js:** Create a finely subdivided plane (`Subdivide 256x256+`). Use the original image as `Base Color` and the Depth Map as `Displacement` (`Displace Modifier` in Blender or `displacementMap` in `THREE.MeshStandardMaterial`).
- **Line and 3D mountain interaction (#30).** When you put a dashed line (`Dashed Stroke`) or a title plate in the same 3D space as the terrain mesh, shift the `Z` coordinate of the line so it **goes behind one mountain slope and then comes out on the other slope** (natural depth occlusion). Also turn on `Taper` so the far end of the line is smaller than the end near the camera.

### B. Objects (Ships, Planes, Cars, Icons) That Turn Along Their Path (#23, #31)
1. **Draw the route first.** Finish the whole route curve (`Path` / `Spline` / `Curve`) before you attach the object.
2. **Lock position and heading to the tip of the path (`Trace Path` / `Follow Curve`).**
   - Attach a Null/Empty that follows the `0% -> 100%` progress of the `Trim Paths` line with `Auto-Orient / Follow Curve` mode. The bow of the ship or plane then always turns with each bend.
3. **3D object popping out of the map surface (Pop-Out Launch, #31).**
   - Do not leave the ship flat on the same plane as the map. Stand the ship layer up at a tilt in 3D space (`X/Y Rotation`) with its Anchor Point at the bottom of the hull.
   - When the journey starts, animate the ship **rising out from under the water** with a light rotating dip (`Pitch dip & settle`). Turn on `Continuous Rasterize` + `Depth of Field`.

### C. WSJ / Vox-Style Callout Title Box on a 3D Map (#28)
- The title box has 3 beats:
  1. **Anchor Box.** An empty square (white/yellow `Stroke`, no `Fill`) that scales from `Size: 0 -> 24px` at the coordinates of the place.
  2. **Leader Line.** A straight or bent line that runs `Trim Paths` from the square into the empty space beside it.
  3. **Text Box that opens sideways (Unlinked X-Scale Box + Track Matte Text).**
     - Put the `Anchor Point` of the text box on its **left edge** (where it meets the leader line).
     - Unlink the X/Y scale (`Unlink Scale`) and drag `Scale X: 0% -> 100%` (`Scale Y` stays at `100%`).
     - The text inside uses this same box as its **Alpha Track Matte**, so the text shows only as the box opens over it.
     - If there is a subtitle line, duplicate the box underneath in the opposite colours (for example the top box has a white background and black text, and the bottom box has a black background and white text). Slide it down gently after `4 frames`.
- **Expression that balances the camera rotation (`Camera Z-Rotation Counter-Link`, #28).**
  - When the 3D Camera tilts on the `Z` axis, link the `Z-Rotation` of the title box to the camera `Z-Rotation`. The text then stays horizontal and easy for the viewer to read.

---

## 5. Tracking Maps and Graphics onto Flycam / Drone Footage (#18, #24, #26, #39)

Use this when you insert border lines, yellow planning zones or callout labels onto moving drone footage.

1. **Choose track points spread across depth (#26).**
   - When you use the `3D Camera Tracker`, do **not** pick only a small cluster of points in one corner if the drawn line spans the whole frame. The far end would slide in parallax. Hold `Shift` and pick track points along the whole length of the bridge or road, from foreground to background, before you create the `Camera & Solid/Null`.
2. **Combine with a Planar Tracker (Mocha / Fusion Planar Tracker) for complex surfaces (#26).**
   - Use this for shots with 2 height levels (for example the road surface below and an arched bridge girder above):
     - Track the first plane (`Road Surface`) with `Planar Tracker` (turn on `Perspective`). Use it as the **Track Matte** for the `Stroke` line or yellow highlight area (`Overlay` / `Soft Light`).
     - Track the second plane (`Bridge Top Arch`). Use it to put the bridge image over the drawn line. The glowing line then passes naturally under the bridge.
3. **Simplify the drone footage palette so graphics stand out (#39).**
   - Use this if the original drone video has too many colours and looks busy:
     - Turn the background footage into **high-contrast black and white** (`Tint` Black & White + `Curves` pulled darker).
     - For the area to highlight (for example a plot of land or a building): duplicate the original video and cut it by the `Track Matte` of the selection. Keep it brighter and add a Yellow `#FFE600` or Orange layer in `Soft Light` mode, a white outline with a light `Wiggle Paths`, and a light `Glow`.
     - Finish with `Posterize Time (12 fps)` on the graphics layer to blend into the Vox look.

---

## 6. 35mm Camera Control and the Speed Graph

- **Standard focal length.** Always use **`35mm`** (about `54°` horizontal or about `37.8°` vertical field of view). Do not use a very wide angle (`15mm` distorts the map edges). Do not use a very narrow one (`100mm+` loses the 3D parallax feel in flight).
- **Null rigging.**
  - Never keyframe `Position` and `Point of Interest` separately if the camera must fly through many points. Connect the Camera to a **3D Null / Empty Controller**:
    - Use the Null `Position X/Y` to pan sideways and up or down.
    - Use `Position Z` (or the Null `Scale`) to zoom.
    - Use the Null `Rotation X/Y/Z` to tilt the view (`Pitch` from `0°` looking straight down from above to `45°–60°` looking at the terrain at a slant).
- **Standard speed graph (`Continuous Bezier` bell curve).**
  - Select all the camera keyframes -> turn on **`Continuous Bezier`** -> open the **Speed Graph**.
  - Drag the two handles inward to make a sharp peak in the middle of the move (`Influence: 70%–85%` at both ends). The Camera starts softly, shoots very fast through the middle of the move, and brakes gently over a long ease as it lands on the target.
