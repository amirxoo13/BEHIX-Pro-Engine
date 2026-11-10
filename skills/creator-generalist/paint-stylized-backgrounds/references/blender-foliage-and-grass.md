# Blender foliage, trees and grass

Leaf clusters, pastel and watercolor trees, bushes, anime grass and their animation, for any stylized background.
For toon colouring of a leaf (edge light, veins, random value) the steps are short here. The shader theory is in `model-characters` `references/npr-shading-and-painted-look.md`.

Names mapped to Blender 4.2+: Sapling Tree Gen is a free extension (Preferences > Get Extensions, extensions.blender.org). Older builds list it as the add-on "Add Curve: Sapling Tree Gen". Render Method = Blended replaces "Blend Mode = Alpha Blend". The tutorials show hair particle systems, which still work. A Geometry Nodes route (Distribute Points on Faces > Instance on Points) does the same job and is lighter.

## Reading Map

- Leaf plane with a painted alpha
- Leaf shader
- Quick tree with Sapling Tree Gen
- Better tree: icosphere hair particles
- Pastel and watercolor trees
- Bushes and ground vegetation
- Solid leaf-mass cluster (no leaf planes)
- Falling leaves and petals
- Foliage wind
- Anime grass field
- Grass patches
- Pastel crayon look for a whole scene
- Baking a tree for another engine

## Leaf plane with a painted alpha

The reusable base asset for trees and bushes.

1. Plane. New material, delete Principled BSDF. New Image Texture (alpha 0 at the start, 1024 is enough) > Fac of a Mix Shader with Transparent BSDF in slot 1 and a green Diffuse or toon shader in slot 2. Render Method = Blended, or Alpha Hash.
2. Texture Paint mode: paint leaf shapes in white. The paid Stylized Asset Suite wraps this as "Simple Transparency" plus a mask. The nodes above do the same.
3. Edit Mode: duplicate and rotate the plane into a small cluster. For softer light on leaves use a linear ramp, not a stepped one.
4. `Alt+G` clears the plane to the world origin before you use it as the tree leaf object.

Painting later on the plane updates every instance, so finish leaf edits after you build the tree. Draw a black outline on the leaf plane if the style has outlines.

## Leaf shader

Every effect is a Mix whose B slot holds a brighter or darker copy of the colour (Hue/Saturation/Value), driven by a mask. Work in View Transform = Standard.

1. Edge highlight: Layer Weight (Facing or Fresnel) > Color Ramp > Fac. A = colour, B = HSV with Value raised.
2. Sun light: Diffuse BSDF > Shader to RGB > Color Ramp (Constant) > Fac. B = Value up, A = Value down. Shader to RGB works in EEVEE only.
3. Veins: a painted image "leaf darks" (1024 or 2048) > Fac with B = Value down. A second image "leaf brights" on the edge of the darks gives depth.
4. Random value per leaf: Object Info > Random > Color Ramp with stops near 0.95 and 1.1 > HSV Saturation. A narrow range keeps leaves close.
5. Unwrap with Unwrap Angle Based (`U` in Edit Mode).

Modelling a leaf: plane, loop cuts, extrude the top edge, `Ctrl+1` subdivision, Apply, proportional editing to lift the centre, Solidify, Shade Smooth. Look at real leaf pictures first.

## Quick tree with Sapling Tree Gen

1. Install the extension. `Shift+A` > Curve > Sapling Tree Gen. Set every option in the operator panel when you create the tree. It cannot change later.
2. Leaves tab: tick Show Leaves, Leaf Shape = Dupli Faces, Leaf Object = the leaf plane or cluster, set Leaves count (more is laggy). Scale the plane in Edit Mode to resize leaves.
3. Armature tab: Use Armature. Animation tab: tick the boxes for built-in sway, speed about 25.
4. Plain route for per-leaf variety: Object Info > Random into a Mix or Color Ramp.
5. Put trees in their own collection and hide them while you work.

## Better tree: icosphere hair particles

1. Add an Ico Sphere. Particles tab > new system, type Hair, count 4 to 5, Render As Object, instance object = the leaf cluster. Tune scale.
2. Give the sphere a fully transparent material so only leaves show.
3. In Sapling Tree Gen's Leaves tab use this icosphere as Leaf Object. Another variant uses a plane with loop cuts bent like a leaf, or an icosphere with a low count of about 25 duplicated spheres.
4. Hide the icosphere (`H`) after placing it. Keep counts low. Duplicate trees with `Shift+D`.
5. In Edit Mode on the leaf object, duplicate and scale small pieces for fragments at the tree edge. An extra object with a red material scatters as red fake leaves.

## Pastel and watercolor trees

Paint a pastel or watercolor texture over the leaves. Two routes.

- Paid add-on route (Stylized Asset Suite "Charcoal/Watercolor" effect with a texture pack): do not buy it.
- Plain route (inferred from his baked result, not shown step by step): multiply or overlay a watercolor paper Image Texture over the leaf colour, with Window coordinates for screen space or UV coordinates. Use the Window route for parallax breakup. Use UV coordinates if the texture must follow the animation.
- Crayon alpha: crayon texture > Color Ramp > Math Add (shifts opacity) > Fac of a Mix Shader (A = colour, B = Transparent BSDF). Group it, Blended. A flower behind can be more transparent if you make the material and group unique (number button).
- Light the tree with one Sun, Steps = 1 two-tone toon, and tint the shadow bluish.

## Bushes and ground vegetation

1. Ico Sphere scaled wider on X. Hair particle system, Render As Object with the leaf plane, a high count. Transparent material on the sphere.
2. Add a Displace modifier above the particle system. New Clouds texture, Coordinates = Object, Object = an Empty. Moving the Empty changes the shape. Raise Strength for a bushier outline.
3. Duplicate with `Shift+D`. Apply modifiers (`Ctrl+A` over the modifier), tweak in Edit Mode, scatter patches. Raise the particle count after you displace, because leaves thin out. Use Local View (`/`).

## Solid leaf-mass cluster (no leaf planes)

A lumpy toon-green crown or bush mass built from solids, as an alternative to leaf planes. Captions only, no voiceover; values read from frames. Blender 2.91 in the video; in 4.2+ Remesh, Mesh to Volume and Volume to Mesh sit under Add Modifier > Generate.

1. Join 6 to 10 overlapping UV Spheres (`Ctrl+J`). Remesh modifier: Voxel, Voxel Size 0.1 m, Adaptivity 0, Smooth Shading off.
2. `Shift+A` > Volume > Empty. Its Mesh to Volume modifier: Object = the blob, Density 1, Fill Volume on, Exterior Band Width 0.1, Resolution Mode Voxel Amount, Voxel Amount 64.
3. Add a Cube. Its Volume to Mesh modifier: Object = the Volume, Grid Name density, Resolution Mode Grid, Threshold 0.1, Adaptivity 0, Smooth Shading off. The cube becomes a lumpy shell.
4. Repeat steps 2 and 3 to break the surface more, then Sculpt Smooth. Shade Smooth at the end. A Clouds texture on the volume adds noise (unverified: the modifier name is not readable).
5. Toon colour: Diffuse BSDF > Shader to RGB > Color Ramp (Constant), a dark and a light green stop (EEVEE only). One Sun, 2 to 3 lights is enough.
6. Make 2 or more variants (UV Sphere, `Ctrl+1` apply, proportional-edit lumps, Displace with a Clouds texture: Type Soft, Grayscale, Depth 2, Nabla 0.03, Strength 0.68, Midlevel 0.5, Coordinates Local). Copy modifiers with Object > Link/Transfer Data > Link Modifiers, active object = the one to copy from (unverified menu path, inferred from the caption).
7. Put the variants in a collection (`Shift+M` > New Collection, "treecluster"). On a big cluster add a Hair particle system: Number 50, Hair Length 4 m, Segments 5, Render As = Collection, Instance Collection = treecluster, Scale 0.16, Scale Randomness 0.239. Convert to Mesh, Edit Mode `P` > By Loose Parts, scale the pieces in so they blend, `Ctrl+J` everything.
8. Finish: Displace (Strength 0.68), Smooth (Factor 1.546, Repeat 1), Remesh (Voxel 0.2 m, Adaptivity 0). Sculpt or add another cluster layer or convert to volume again for more detail.

Pitfall: a particle emitter that appears at the origin after applying is just moved away. Trees: the creator suggests Sapling Tree Gen or a Skin modifier for branches with the clusters duplicated over it. Bushes: several cluster variants placed together.

## Falling leaves and petals

1. Plane above the tree as emitter. Particle system, low count, Render As Object (or Render As Collection for petals), Velocity tab to tune. Hide the plane or make it transparent.
2. On the tree's own particle system set Wind influence to 0 so its leaves do not blow.
3. `Shift+A` > Force Field > Wind, raise Strength. Raise Damp on the falling system to slow the fall.
4. Petals: put the petal in its own collection, Frame Start about 50 so it does not begin at frame 1, lifetime 200 or more.

## Foliage wind

- Turbulence: `Shift+A` > Force Field > Turbulence. Strength 33, Size 4 (the values in the video). Leaves that are particle instances react. Keyframe its location (`I`), move on in time, keyframe again, select both keys, `T` > Linear, `Shift+E` > Linear Extrapolation. The distance between keys sets the speed.
- Leaf wave: Wave modifier on the leaf. Make a vertex group at the leaf base (select faces, Assign), choose it in the Wave modifier and click Invert, so the stem stays still. Use more waviness for stormy scenes.
- Animated displacement: Displace with Coordinates = Object and an Empty, then key the Empty with Linear and Linear Extrapolation as above.
- Stems and vines: convert curves to mesh (Object > Convert > Mesh), add an armature, parent the stem with Automatic Weights, and parent each leaf, flower or droplet to its nearest bone (`Ctrl+P` > Bone).
- Bone wind: the Windy Armature add-on is paid (sold with the Stylized Asset Suite). Plain route (inferred, not shown): noise-driven rotation drivers, or a Noise F-curve modifier on bone rotation. Select the chain, add wind per chain, and treat the trunk as its own chain.

## Anime grass field

Creator's older Blender 3.x workflow (2023). Numeric settings are partly read from frames.

1. Big plane with a hair particle system, Render As Collection or Object, scattering a grass blade. Two more systems for tulips and leaves.
2. Hair settings seen at frame 01:12 (Blender 3.2.1): Length 1.0, Clump 0.160, Shape 0.231, Strand Shape 0, Diameter Root 0.51 m, Tip 0 m, Diameter Scale 0.01, Close Tip on.
3. Leaves system seen at frame 07:18: Number 135, Hair Length 4 m, Segments 5, Render As Object, Scale 0.18, Scale Randomness 0.49.
4. Shader: plain RGB base, a large and a small Noise multiplied to break uniformity, the Curves Info node (output Intercept) to darken toward the base (which output feeds the Mix Fac is unverified), then Hue/Saturation, RGB Curves and Brightness/Contrast to grade. Darker and bluer at night, yellower by day.
5. Flower: stem faces in a separate material slot, flower red with value variation. Set blend mode to Alpha Hash or Blended so overlapping petals look artistic.
6. Animate by keyframing the noise Mapping location on the first and last frame (a bigger move is faster) for flower, leaves and grass. Add a Wind and a Turbulence force.
7. Fake shadows from objects: bake Shadow in Cycles (EEVEE cannot bake) to an image with other objects' ray visibility off. Multiply the image into the grass colour and tint the shadow blue, not black. Restart if the bake stalls at 2%.

## Grass patches

Use a reusable grass placer instead of pasted blades: one Geometry Nodes group that scatters grass on any surface, with density and speed inputs. Paste it on the ground and scale it. Put a green painted layer under the grass so the ground is not grey. Duplicated leaves on the ground add chaos.

## Pastel crayon look for a whole scene

Download crayon or pastel textures. Image Texture, `Ctrl+T`, and connect Window (Texture Coordinate) to Mapping. Mix with the colour: Multiply (or Soft Light for light surfaces, Screen for dark hair), with RGB Curves to tune. Group it and expose Mapping location and scale. To break tiling, add a Voronoi Color through Vector Math Add into the Mapping location (use Voronoi, not Noise).

## Baking a tree for another engine

- Bloom does not export, so re-add it in the target.
- Light values above 1 bake as white. Set the light value to 1 before the bake.
- Effects from paid add-ons do not export. Use plain nodes (noise mask, Blended) instead.
- Bake alpha and diffuse lighting at 4096. Split a large tree with `Ctrl+L` and `P` > Selection so each part has its own texture.
- Target node setup: Mix Shader, alpha map to Fac, Transparent BSDF in slot A, baked image in slot B, Blended.
- Plain Blender bake: new Image Texture node active, Cycles, Bake panel, Diffuse (Color only) or Emit. Trunk unwrap: `F3` > Select Sharp Edges, `Ctrl+E` > Mark Seam, select all, `U` > Unwrap.
- Wind bake: select all bones, `F3` > Bake Action (Pose > Animation > Bake Action). Frame 19:26 shows Start 1, End 250, Step 1, Only Selected Bones on, Visual Keying, Clear Constraints and Clear Parents off. Convert the trunk curve to a mesh and re-parent it to the rig first.

