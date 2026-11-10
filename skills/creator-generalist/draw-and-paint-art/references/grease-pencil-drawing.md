# Grease Pencil drawing in Blender

Version mapping (mine): the sources use legacy Grease Pencil (GPv2, up to Blender 4.2). Blender 4.3 and 5.x use Grease Pencil v3 (GPv3). The v3 notes below come from the source captions and from general knowledge, not from the 2.82 video. Check names in the UI. Blender 2.82 "Stroke Placement" is the Drawing Plane option in the Draw mode header.

## Reading Map

- Setup for tablet drawing
- Drawing plane and reproject
- Layers, materials, stroke and fill
- Edit, sculpt and eraser tools
- Line Art outlines for 3D meshes
- Draw on mesh surfaces
- Layered 2D background
- Distance fog and wind
- Modifiers for loops and variation
- Frame-by-frame drawing
- Version mapping table

## Setup for tablet drawing

1. Edit > Preferences > Input > enable Emulate 3 Button Mouse. Alt + stylus rotates, Ctrl + Alt + drag zooms, Shift + Alt + drag pans. Turn it off again for COA Tools cut-out rigging, because Alt is the parent key there.
2. Delete the default cube. Shift + Right-click moves the 3D cursor, and the new object spawns there.
3. Add > Grease Pencil > Blank (a Stroke object also exists). In Blender 4.3+ the menu says Grease Pencil with the same Blank and Stroke entries.
4. Switch modes with the header Mode menu or the Ctrl + Tab pie (Object, Edit, Sculpt, Draw).
5. For a new 2D animation file, use File > New > 2D Animation (white background, camera view, Ink and pencil brushes). Numpad 0 is camera view.

## Drawing plane and reproject

1. In the Draw mode header set the Drawing Plane (2.82: Stroke Placement): View, Front X-Z, Side Y-Z, Top X-Y, 3D Cursor or Surface.
2. View projects onto the camera view. Front X-Z flattens everything on that plane even when the viewport is rotated.
3. Overlay > Canvas (or Guides) shows a grid on that plane. It is centred on the object origin, not on the cursor.
4. To flatten strokes drawn at different depths: Edit mode, select all, then Grease Pencil > Clean Up > Reproject Strokes and choose Front. In v3, find it in the Stroke menu.
5. Surface placement draws on top of a mesh with an Offset. Too low and strokes intersect the mesh. Too high and they float.

- Fills project from the view too. Fill while looking straight at the right plane, or the fill skews.

## Layers, materials, stroke and fill

1. Properties > Object Data tab holds the Grease Pencil layers: add, rename, lock, hide, opacity, blend mode, and onion skin per layer.
2. Properties > Material tab: each Grease Pencil material has a Stroke part and a Fill part. Toggle each one. Change the colour of a material after drawing to recolour every stroke that uses it.
3. Make a line-only layer with a Stroke-only material. Under it, make a colour layer with a Fill-only material.
4. Fill tool (Paint Bucket): click inside a closed shape. Hold Ctrl and draw a line to close gaps. Fill on the colour layer, not the line layer. A leak means a gap in the line.
5. Workflow: a sketch layer with a blue material, an ink layer above in black Ink Pen, a colour layer below. Lock the sketch layer before inking so Ctrl-erase does not erase it.
6. Brush for flat lines: radius sets the thickness, strength 1, pen pressure off. Shift stabilises. Hold Ctrl to erase (the default eraser is soft). The two-squares button draws behind (v3: Draw Mode Behind).
7. Draw-mode Shapes (Circle, Line, Curve, Bezier with Enter or Space to confirm, E for a new line) give clean geometry. The Smooth option (strength and iterations) steadies lines.

## Edit, sculpt and eraser tools

- Tab enters Edit mode. A selects all. Alt + A deselects. B box-selects. Keys 1, 2 and 3 switch point, stroke and segment select (2.82).
- G, R and S grab, rotate and scale. Press X, Y or Z to constrain to an axis. Shift + Z excludes Z. Alt + G, Alt + R and Alt + S clear the object transform.
- Sculpt mode (Ctrl + Tab) has Push, Grab, Smooth, Randomize and Thickness brushes. F changes the brush size. Shift + F changes the strength. Hold Shift for a temporary Smooth. Hold Ctrl for the opposite effect.
- Edit mode > Clean Up > Delete Loose Points removes leftover dots. Move strokes between layers: select them and press M.

## Line Art outlines for 3D meshes

1. Put the meshes in a collection (for example "mesh"). Add > Grease Pencil > Blank. In 4.3+ you can also use Add > Grease Pencil > Object Line Art, Scene Line Art or Collection Line Art.
2. For the manual route: create a collection "GP". Rename the first layer "mesh", untick Use Lights, and rename the first material "outline".
3. Modifiers > Line Art. Source = the collection "mesh", Target Layer = mesh, Target Material = outline. It needs a camera and the camera view (Numpad 0). The lines look wrong in free view because they are drawn from the camera.
4. Edge Types: Contour off, Individual Silhouette on, Crease off, Material Borders on. Crease Threshold 180 gives every edge and a small value gives only the silhouette. Mark exact edges with Edge > Mark Freestyle Edge.
5. Set the line thickness. Use a deep blue, not pure black, for the line colour.
6. In View Layer Properties tick Combined and Z for the Grease Pencil object, or it does not render correctly.

- Two other toon outlines (see `use-3d-software` for shader details): Solidify inverted hull (works in any view, holds when you orbit) and Freestyle (Render Properties > Freestyle, shows only in F12 renders). Use Solidify for characters and animated meshes.

## Draw on mesh surfaces

- Add a layer "line art" above "mesh" (Use Lights off). In Draw mode set the plane to Surface and adjust the Offset. A wireframe overlay shows where you draw.
- For grass or free drawing, use the 3D Cursor plane. Shift + right-click moves the cursor, and the Canvas overlay shows the plane.
- Lock the other layers to avoid erasing them. Break outlines occasionally for interest. Put strokes that appear in front of the line art on a layer below the mesh layer.

## Layered 2D background

- Build each hill or cloud from 3 layers: line art, fill colour and shadow. Set the shadow layer to Multiply at low opacity with Mask enabled (like a clipping mask) so the shadow shows only inside the fill.
- Spread the drawings through 3D space, not on one plane, so depth effects work.
- Sculpt mode tools (Push, Grab, Smooth, Thickness, Randomize) add bumpy terrain. If you lack points, use Edit mode > Stroke > Subdivide or a Subdivide modifier.

## Distance fog and wind

- Fog: Layers tab > Vertex Groups, add "fog". Add a Vertex Weight Proximity modifier (group = fog, target object = camera, distance range). Then add a Tint modifier with Influence > Vertex Group = fog, and click the weights button next to Strength. Use a pale blue. The Mist pass and volumetrics do not work on Grease Pencil, so this is the workaround. The layers must be spread in 3D.
- Wind: one lattice per bush layer (Add > Lattice, a flat plane), a Lattice modifier on the Grease Pencil object, and shape keys on the lattice keyed from side to side. Make the first and last values equal for a loop.
- Camera loop: parent the camera to an empty ("camera control") at the scene centre. Key the empty's rotation at small angles, with identical first and last keys. A large rotation shows flat drawings as cards.

## Modifiers for loops and variation

1. Set the pivot to the feet: in Edit mode select the feet points, Shift + S > Cursor to Selected, then in Object mode right click > Set Origin > Origin to 3D Cursor.
2. Modifiers (wrench) > Add Modifier > Time Offset. Mode Custom Range, frames 1 to 20, Keep Loop on.
3. Noise gives a boiling-line look (low factor, set Step for twos). Thickness, Smooth and Tint modifiers also exist. Tint can target one material.
4. Shift + D copies the object. Alt + D makes a linked instance that shares stroke data. Offset the Time Offset on each duplicate by a frame, and tint each one differently.

## Frame-by-frame drawing

1. Use the Dope Sheet in Grease Pencil mode (not the object Dope Sheet).
2. Draw the contact pose on frame 1 and the opposite contact pose around frame 10 or 21. Use right-click > Insert Blank Keyframe for a blank key. Add the passing pose halfway, then the down poses.
3. Onion skin: Object Data > Onion Skinning (opacity, frames before and after, tint colours). Toggle all in Overlay.
4. Fix a wrong frame in Edit mode: press 2 to select connected strokes, then scale and rotate.
5. Set the end frame to the loop length. Select all keys (A) and press S to scale the keys in time, which speeds the walk up.
6. Ink on a new layer above with the sketch locked, then Fill on a layer below.
7. Move the drawn object with I > Location. Press T > Linear in the editor for constant walk speed (default easing is slow in and out).
8. For arcs, use Object > Animation > Motion Paths (4.2+).

- Poses first: the contact, down, passing and up order also drives a 3D walk.

## Version mapping table

| Source name | Blender 4.3+ and 5.x |
| --- | --- |
| Grease Pencil (GPv2) object | Grease Pencil v3 object (same Add menu entry) |
| Stroke Placement | Drawing Plane in the Draw mode header |
| Draw on Back | Draw Mode: Behind |
| Layer Masks | Layer masks (same idea, check the panel) |
| Reproject Strokes | In the Stroke menu |
| Shader to RGB, Bloom (EEVEE) | Bloom removed in EEVEE Next (4.2+), use the Compositor Glare node |

I mapped all v3 names here. Verify them in your build.
