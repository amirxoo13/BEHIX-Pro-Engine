# Low-poly stylized scenes and Ghibli-style food props

Rocks, stumps, mushrooms and floors for a stylized set, and food props as set dressing (eggs, waffles, pancakes, ramen, burger).
The look comes from the render, not the topology: plan shape, texture and light first, and fake detail in paint. Toon materials and painted layers are in `model-characters` `references/npr-shading-and-painted-look.md`. This file keeps only what the set needs.

Names for Blender 4.2+ and 5.x: "Shade Auto Smooth" is now Object > Shade Auto Smooth (a modifier node group in 4.1+). Loop Tools is a free extension from extensions.blender.org (right-click a vertex ring > Circle). Link Object Data is Object > Link/Transfer Data > Link Object Data.

## Reading Map

- Judge the render
- Low-poly rocks and cracks
- Tree stump with roots
- Mushrooms, leaves and floor discs
- Paint fake 3D
- UV and texture painting for a set
- Four-part low-poly process
- Set dressing rules
- Fried egg, pan and eggs
- Waffle, syrup and toppings
- Pancake, berries and plate
- Ramen, noodles and burger
- Prop patterns

## Judge the render

Topology matters less than silhouette, texture and light. Check the silhouette in flat shading with no details (Viewport Shading > Lighting: Flat, or X-ray `Alt+Z`). Simple rock geometry in solid view still renders well. Avoid over-modelling.

## Low-poly rocks and cracks

1. `A`, `X` clears the scene. `Shift+A` > Cube per rock. Edit Mode: select an edge and `G Z` to pull it down for a triangular silhouette.
2. Camera: `Shift+A` > Camera, `Ctrl+Alt+Numpad 0`. Resolution 1920x1080, or 1080x1920 for portrait.
3. Biggest rock: `Ctrl+B` bevel, move the back edge up, `Ctrl+R` centre loop cut, proportional editing (the mouse wheel changes falloff). Add loops around and at the bottom so the sides are quads, not one n-gon.
4. Work in Rendered view with a Sun from the start, because light defines how rocks read.
5. Cracks by merge: `Ctrl+B` an edge at the back, select the top vertex and the next, `M` > At Last. Repeat at the bottom. Push the edge behind inward to open a crack.
6. Fight blandness: a small rock on a face of the big one (`Shift+S` > Cursor to Selected, then add the rock), the big rock duplicated and scaled down as a side rock, a knife cut for extra edges, then Shade Auto Smooth.
7. Base: Circle, `E` `S` a few times, `F` fill, then move edge vertices so it is not a flat disc.

Blue cracked rock from an Ico Sphere (Add > Mesh > Ico Sphere): Subdivision Surface plus Displace with a Clouds texture. Shader: Voronoi set to Distance to Edge (not F1, which gives cells) for crack lines, broken up by a Noise texture added into the Voronoi vector. A Power node tightens the mask (heavier on dark areas than Map Range). Toon base in two blues, the crack mask mixes in a light blue. Duplicate and rotate rocks, Apply transforms and Origin to Geometry.

## Tree stump with roots

1. `A`, `X`. `Shift+A` > Mesh > Circle with 13 vertices. `Tab`, `E Z` to extrude up. `Alt+click` the bottom edge, `E S` once, `F` to fill. Loop cut and `G Z` down.
2. Roots: select a quad at the bottom, `E`, then `S` after each extrusion so roots taper. Select faces, `I` then `E` for small sub-roots. Loop cut the centre and `S` to bulge.
3. Preview with `Ctrl+1` then `Ctrl+Z`. Finally `Ctrl+1`, Shade Auto Smooth (it keeps parts harsh). Turn on the modifier's on cage and edit mode buttons. Solidify for thickness.
4. Top: select the top vertices and `V` to rip. Mirror with `Ctrl+M` `X`. Check the silhouette in flat shading.
5. Hollow: disable subdivision, `Alt+click` the top loop twice, `E S` inward, `E Z` down, `S Z 0` to flatten, `S` to scale in. `G G` slides awkward vertices. Optional `Shift+E` crease on rim edges.

## Mushrooms, leaves and floor discs

Circle with any vertex count, proportional editing to wave the vertices, `E S` twice, `F` fill, Solidify (if it thickens upward, `Shift+N` > Inside). Cap centre: `F3` > Grid Fill, raised. Duplicate with `Shift+D`, pivot Individual Origins, `R X X` for random tilts. Floor: circle scaled up, `E S` twice, `F`, `U` unwrap. Material: grunge for green and yellow over brown, and a transparency effect with a paintable mask so a pastel brush can erase the disc edge to look messy.

## Paint fake 3D

1. Darkness where a crack goes, brightness right beside and under it. It reads as depth.
2. Brightness along edges that catch light, darkness on the edges next to them for separation.
3. Dark lines inside bright areas. Random dark and bright blobs for variety. Split areas with cracks so rock looks fractured.
4. Blue (or another complementary colour) splashes on brown objects. Hue shift per edge: more orange on the lit edge, less at the back (Gradient > Hue shift mix).
5. Ambient occlusion on interior faces and under the object (darkness under the stump on the ground). White specular specks on mushrooms (test Multiply and Mix).
6. Keep separate image layers for darks, brights, softer extra darks and subtler extra brights, so each can be tuned.
7. Moss: a mask image, texture painted where moss should be, a noise-driven green and brown ramp mixed in with that mask as Fac, brights on top of moss and darks under it.
8. Background value kept dark (about 0.19 in the stump scene) with god rays.

The paid Stylized Asset Suite wraps these layers. Plain route: one Image Texture per layer into the Fac of a Mix whose B holds a Hue/Saturation/Value copy of the previous result (darks Value about 0.6, brights about 1.6).

## UV and texture painting for a set

- Rocks: mark a seam loop along the bottom (horizontal seams when detail is on top). Add side seams to big rocks for more islands. Select all rocks, `A`, `U` > Unwrap, shrink islands and leave room for later rocks. For a stretched island add a seam, or `U` > Minimum Stretch. All rocks share one atlas.
- Stump: `Ctrl+E` > Mark Seam around the start and the bottom of every root, down one side, across the centre, around the top. Select all, `U`. Test by painting white and black everywhere. Fix unpaintable areas with `Shift+N`. Flat mushrooms and leaves: unwrap one, select the others, `Ctrl+L` > Copy UV Maps (they then share one bake).
- Paint glitches: if `Ctrl+Z` or `F` switches to another image, add a blank Image Texture node and keep it selected. If painting does nothing, brush colour must be white with black second. If the mesh refuses paint, `Shift+N` (tick Inside if needed). Right-click a brush > Add to Quick Favorites, then `Q` picks the pastel or watercolor rake brush.

## Four-part low-poly process

1. Cubes with edge moves and loop cuts, Rendered view early, add small rocks.
2. Base colours, toon light, noise colour variety, layered painting, shine, grunge, ambient occlusion.
3. Cracks (dark, then bright under), blobs, split areas, painted vegetation and grass.
4. Final details, Soften then Box Sharpen, a clouds background.

## Set dressing rules

- Contrast and variety: do not repeat one object. Break brown wood curves with a green vine. Turn ducks to different directions. Imperfection looks real. Give focal items detail and off-camera items little. Check references (leaves, flowers, lamps) before modelling. Make decorations good from several angles if the camera rotates.
- Detail fillers: foreground flowers, petals on a barren floor, crumpled paper, a rolled blanket (spiral mesh, Solidify, Subdivision, Displace, striped with Wave Texture), roof tiles duplicated by hand (not Array) with a random value per tile, and a vine with leaves.
- Object duplicates: `Alt+D` shares mesh data. To separate, click the user-count number on the mesh data tab (make single user).

## Fried egg, pan and eggs

UV Sphere, X-ray, delete the bottom half. `Alt+click` the centre vertices and `E S` outward for the yolk dome. Proportional editing roughens the white edge. Solidify, `Ctrl+1`. Loop cuts in the white and `Alt+S` on the centre loop so the middle sits higher than the edges. Pan: circle, `E Z` up, scale out, fill the bottom, `Alt+S` to puff, extrude an edge for a handle. Distort each duplicate (`G` on vertices) so eggs differ. Faces: a filled circle with shadows disabled, vertex parented with `Ctrl+P` > Vertex (Triangle) on three yolk vertices. Looks: darks painted on the white, blacks throughout for a sketchy feel, a specular on the yolk.

Idle jiggle: Shape Keys `+` twice (Key 1 moves toward the centre and back, key 2 a spasm puff, key 3 an edge puff with `Alt+click` loop and a slight `S`). Press `I` on each slider and oscillate 1 to 0. For key 3 use a Noise F-curve modifier instead of keys.

## Waffle, syrup and toppings

1. Cube, `Ctrl+B` one side edge (2 or 3 segments), delete top and bottom faces, edge loops near the edges so `Ctrl+1` stays crisp, `Alt+S` to taper.
2. Squares object: plane, `E S`, raise outer vertices, delete the top face, loop cuts, `Alt+S`, border by `E S`. Array modifier (Relative Offset X -1), a second Array with Y = 1 for a grid, Displace (Clouds).
3. Boolean modifier: Intersect, Solver Fast, with a bevelled cube matching the outer shape. Add Subdivision.
4. Parent everything to an Empty. Duplicate and rotate (`R 90`) into a circle. Link Object Data across the squares so one edit changes all.
5. Displace Clouds, small size, strength about -0.32, for edge variation.
6. Chocolate syrup: Path curve with Bevel, `Alt+S` per point to thicken and thin. Maple syrup: plane at the plate edge, wavy droop and puddle, duplicate and rotate around the 3D cursor. Whipped cream: sphere scaled in Y, Displace with a Wood texture (Bands Noise type) driven by an Empty, shadow colour very yellow. Banana slices: cylinder, Displace strength about 0.3, a painted mask through Map Range (step) for a dark centre.
7. Shader: toon Diffuse > Shader to RGB > Color Ramp (Constant), with a Gradient Texture top to bottom (rotate Y 90) through Map Range (Steps, or "Stepped Linear") as a Mix Fac. Noise in a Mix between Mapping and the gradient jitters the edge. Shine only on tops: Glossy BSDF (low roughness) > Shader to RGB > Color Ramp (Constant), multiplied with the gradient mask, B = white. Syrup: toon beige into a Mix Shader with Transparent BSDF, Render Method Blended, Shadow Mode Alpha Clip.

## Pancake, berries and plate

- Pancake: sphere, delete a big part of the bottom vertices, extrude down from the outer edge and in with `E S`, edge loops in the centre, `Alt+S` on the centre loop with proportional editing, `Ctrl+1`, wobble by proportional editing. Stack like Jenga and scale each. Modifier stack seen at frame 00:52: Subdivision (Catmull-Clark, Viewport 1, Render 2) then Displace (Coordinates Object, Direction Normal, Strength 0.050, Midlevel 0.500). Set Displace to Object, or the texture follows the UVs.
- Pancake shader: Gradient base (beige) > Color Ramp, a Mix between Mapping and the gradient adds noise, Glossy BSDF with a Bump node for a jumbled stylized specular, HSV and RGB Curves for levels, a toon diffuse, then Multiply (node link order loose, unverified).
- Raspberry: toon Diffuse plus Bump from a Voronoi texture (round drupelets), a red gradient through Screen. Sphere pulled in at the top, Displace with Voronoi.
- Blueberry: sphere, a hole on top shaped into a star, extrude the star edges down, inset, Displace, toon gradient broken with noise, dark and light blue by HSV, Glossy plus Bump.

## Ramen, noodles and burger

- Ramen bowl: half sphere shaped with proportional editing, Noise with stepped interpolation (Color Ramp Constant) for dark brown against beige. Egg: half sphere, Loop Tools Circle, yolk with a circular gradient. Steak: trapezoid, Displace Clouds in Object coordinates driven by an Empty, colour with a Wave Texture, black charcoal bits.
- Noodles: a Bezier Circle profile (a little scaled on one side), a Path curve with Geometry > Bevel > Object = the circle, `Alt+S` and `Ctrl+T` tilt per point, proportional editing, duplicate and vary. Toon shader with an orange gradient at the bottom for broth tint.
- Burger: bun is a half sphere with Subdivision and Displace Clouds. Shader: Gradient top to bottom, orange to beige, Constant step ramp, coordinates distorted by Noise. Highlight: Glossy BSDF with noisy normals thresholded to black and white (unverified: "binarizing" may be Math Greater Than or a Constant Color Ramp), mixed with a lighter colour. Seeds parented to the bun. Tomato, meat, lettuce and cheese from circles and planes with Displace, all with a Solidify outline.
- Glass and milk (Blender 4.2): Glossy BSDF with ray tracing on, Mix Shader with Transparent BSDF and Fresnel (IOR tunes) as Fac. Milk inside: toon setup with the Color Ramp left Linear and a lighter top gradient. If milk looks wrong behind glass, turn off Shadow in the glass object's Ray Visibility. Whipped cream shadows tend yellowish.

## Prop patterns

- Wooden bucket: Circle, `E` up, `E` in at the bottom, `F` fill, `E S` scale in at the top, repeat, `Ctrl+1`, `Ctrl+R` support loops, inset the bottom, shade smooth.
- Belt: `Alt+click` an edge loop, `Shift+D`, `Alt+S` scale out, `P` > By Selection, Solidify, then an outline Solidify.
- Water wheel: half circle with Mirror modifiers, the 3D cursor (`Shift+S` > Cursor to Selected) as pivot, parent to an Empty with `Ctrl+P` > Object (Keep Transform).
- Back wall: plane with loop cuts, delete the window area. Lamp: 8-vertex circle extruded and scaled, beams from loop cuts.

