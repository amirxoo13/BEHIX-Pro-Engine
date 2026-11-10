# Animate backgrounds

Each entry gives the After Effects (AE) steps from the source, then the free equivalent. The free equivalents are the skill author's own mapping unless the entry says otherwise. They are marked "mapped".

## Reading Map

- Parallax with 3D layers
- Parallax with 2D layers
- Loops and camera moves
- Wind sway on stems and grass
- Leaves and grass field with turbulence
- Blender plane foliage
- Blender wind with Displace
- Grease Pencil wind
- Birds
- Water
- Fireworks
- Embers and fire
- Holographic card shine

## Parallax with 3D layers

AE: split the art into foreground, middle and background layers (more layers is more noticeable). Click the cube icon on each layer. Set different Z positions. Scale the distant layers up to fit the frame. Layer > New > Camera, then animate the camera.

Layers need paint behind occlusions, or the move shows holes.

Free: Blender, with Import Images as Planes (Edit > Preferences > Add-ons or Extensions), planes at different depths and an animated camera. Fusion: Merge3D with ImagePlane3D nodes and a Camera3D. Remotion with three.js (mapped).

Other styles: Ghibli-like uses a slow, subtle drift. Stylized realistic uses depth-map displaced projection. Retro holds stepped layer positions.

## Parallax with 2D layers

The rule is that farther layers move slower.

- Zoom or dolly: keyframe Scale on all layers. The sky ends at 110% and each nearer layer 10% more. Reverse the keyframes for a zoom out.
- Pan, tilt or truck: keyframe Position on all layers and change X or Y at the end. Give farther layers smaller offsets.
- Arc shot: background layers move right and foreground layers move left. Layers closest to the focus point move slowest.
- Rotational zoom: keyframe Scale and Rotation together.
- Cropped edges: Effect > Stylize > Motion Tile with an animated Output Width and Mirror Edges. Or CC Repeat Tile with Expand Right and Tiling = Checker Flip. Copy the effect to all layers. Tiling shows repetition, so a bigger painting for a scroll is often better.

Free: Blender, animate plane Location in the Graph Editor. Fusion: Transform nodes plus a Tile node. Remotion: interpolate a transform per layer (mapped). Cartoon uses stepped, limited movement. Stylized realistic adds depth blur per layer.

## Loops and camera moves

- Camera loop with an empty parent: add a Plain Axes empty named "camera control" at the scene centre. Parent the camera to it. Keyframe the empty's rotation at a few small angles. Make the first and last keys identical for a loop. Too much rotation shows flat drawings (grass) as cards.
- Hard cuts: use one camera per shot. On the first cut frame select camera A. Use Timeline > Marker > Bind Camera to Markers (Ctrl+B). Repeat at the cut frame with the next camera. Do not teleport one camera between two keys. It renders a smeared frame and breaks retiming.
- Rack focus: key Focus Distance on the camera from blurry to sharp. This is the same as a focus pull in 2D.
- Frame rate: 24 fps with motion blur on (Render > Motion Blur, Shutter 0.5 to 0.75). Never render 24 fps without motion blur.
- Final render as a PNG sequence (RGBA if you need alpha). A crash then loses no finished frames.

## Wind sway on stems and grass

AE:

1. Separate each stem or plant into layers.
2. Press Y (Pan Behind tool) and move the pivot to the base.
3. Press R, Alt-click the Rotation stopwatch and enter `wiggle(0.5,10)`. That is 0.5 per second at 10 degrees. Smaller values give gentler wind.
4. Copy the Rotation property (Ctrl+C) and paste (Ctrl+V) onto the other stems.
5. Add Effect > Distort > CC Bend It, set Start and End, then Alt-click Bend and add a small wiggle expression. Repeat per stem.
6. Grass strands: `wiggle(1,10)` on Rotation, then CC Bend It. Duplicate strands (Ctrl+D) and place bigger ones closer to the camera for depth.

Copy-paste makes all layers sync, so vary the values or the seeds.

Free: Blender Graph Editor Noise modifier on rotation (below). Fusion: an Expression on the Transform angle with `sin(time*...)`, or a Perturb modifier. Remotion: `Math.sin(frame/fps*...)` (mapped). Ghibli-like: slower, bigger sway. Cartoon: stepped rotation. Retro: 2 or 3 frame loops.

## Leaves and grass field with turbulence

AE:

1. Leaves: press P, Alt-click the Position stopwatch and add a small wiggle. Set the pivots. Repeat per layer.
2. Add Effect > Distort > Turbulent Displace to the leaf layers with a small Size and Amount.
3. Alt-click the Evolution stopwatch and enter `time*400`. Evolution runs 400 degrees per second. The grass field used `time*500`.
4. Grass: keyframe Offset (Turbulence) from a start value to a larger X value. Add `loopOut()` for wind rolling in from the left.
5. Copy the effect to all layers and vary Amount, Size and Random Seed per layer.

The effect is heavy. Vary the parameters or it looks uniform. Ghibli-like: lower amount and slower evolution. Retro: sprite swap.

Free: Fusion Displace node driven by an animated FastNoise. Blender Displace modifier or the compositor Displace node with an animated Noise Texture. Remotion SVG `feTurbulence` plus `feDisplacementMap` keyed on frame (mapped).

## Blender plane foliage

1. Enable Import Images as Planes. Add > Image > Images as Planes. Set Offset Planes so the planes do not overlap (this avoids z-fighting).
2. Tab into Edit mode and move the pivot, or change the Median in the Transform panel.
3. Select a plane and press I to key Rotation. Open the Graph Editor and select the rotation curve. In the Modifiers tab add a Noise modifier on the right axis for the plane orientation.
4. Tune Scale (frequency) and Strength (amplitude).
5. Use the copy and paste buttons to share modifier settings. Offset the keyframes so planes do not sway in sync.

For a cel look add a Stepped Interpolation modifier.

## Blender wind with Displace

For 3D trees, extendable to grass and flowers:

1. Leaf object > Add Modifier > Displace. New texture "tree wind noise", type Clouds, Size 6.
2. Coordinates = Object, with the object set to an animated empty. The noise slides as the empty moves.
3. Strength about 0.6.
4. Direction = X instead of Normal, for a sideways sway.
5. Vertex Group: in Edit Mode hover the leaves, press L, Object Data > Vertex Groups > +, name it "leaves on tree", Assign. Select it in the modifier so the trunk stays still.
6. The leaf material must use Generated texture coordinates (not Object), so its colour noise stays on the mesh.

## Grease Pencil wind

Add one lattice per bush layer (Add > Lattice, W and V resolution so it is a flat plane, for example V=1). Add a Lattice modifier on the Grease Pencil object pointing to it. Add shape keys to the lattice (move one side) and key the shape value to morph side to side. Keep the first and last values equal for a loop. For a swinging prop, key its rotation. This is a secondary-motion cycle over a still background.

## Birds

AE flap loop:

1. Draw the bird in two parts, wing and body. New comp about 120x120 px, 10 s. Press Y to set pivots.
2. Turn on 3D for the wing (F4 shows the switches). Press R and key X Rotation: default, a few frames on, a midpoint at 180 (add Y rotation if needed).
3. Parent the wing to the body. Nudge the body up as the wings flap down.
4. Alt-click the stopwatch and enter `loopOut("cycle")`. Select the keys and press F9 for Easy Ease.
5. Single flight: put the comp in the main scene and key Position across the screen. Press F9. Duplicate and offset the layers, then turn on layer Motion Blur.

AE flock:

1. Hide the bird comp. Add a Solid with Effect > Simulation > CC Particle World.
2. Particle Type = Textured Square, Texture Layer = the bird comp, Birth and Death Size about 0.5.
3. Texture Time = From Start so the birds do not flap in sync. Opacity 100 with the opacity map at full.
4. Physics Animation = Direction Axis, Velocity 0.5, Resistance 0.4, Gravity 0 (or -0.01 to rise).
5. Move the producer with Position X. Raise Longevity and lower Birth Rate. Enlarge Producer Radius X, Y and Z for spread and depth.

Blender flock: textured low-poly plane bird. Data tab > Shape Keys: add Basis and a second key with the wings down. Key the key value in the Dope Sheet, push it into an NLA strip, press N and raise Repeat. New emitter plane: Particles > Render As = Object (the bird), raise the scale, untick Show Emitter, set Velocity > Normal and lower Gravity in Field Weights. To desync, put the bird in a collection (M), duplicate with Shift+D with offset NLA strips, and set Render As = Collection. Optional: a Curve Guide force field for paths, Boids physics for flocks.

Free: Fusion pEmitter and pImageEmitter with an image sequence. Remotion: map over N birds with a per-bird offset frame (mapped). Ghibli-like: bigger birds with slow wing beats. Retro: a 3-frame sprite loop.

## Water

AE reflection, ripple and glitter:

1. Split the art into sky and water. Reflection: flip the sky layer, lower its opacity, add a vertical blur.
2. Ripple texture: Solid > Effect > Noise & Grain > Fractal Noise. Raise Contrast, lower Brightness, and under Transform untick Uniform Scaling and reduce Scale Width and Height. Key Offset Turbulence downward and enter `loopOut("offset")`. Set Evolution to `time*300`.
3. Add Distort > Corner Pin to fit the water plane. Hide the noise layer.
4. Adjustment layer with Distort > Displacement Map: map layer = the noise layer, Source = Effects & Masks.
5. Bright patch: duplicate the noise layer, precompose (Ctrl+Shift+C, Move all attributes), mask it, press F to feather, blend Screen, tint if you like.
6. Glitter: Solid > Effect > Simulation > CC Particle World, Particle Type = Star, Velocity and Gravity 0. Set producer Radius X and Y and Position Y to cover the water. Lower Birth and Death Size, Max Opacity 100%, Transfer Mode = Add, layer blend Screen. Optional Birth and Death Color. Add a star-glow plug-in for sparkle (the source used a paid one). Or use Particle Type = Texture Square with a custom glitter image.
7. Curved water: Bezier Warp or Mesh Warp. Stock water footage works too: mask it to the water, blend Screen, adjust the contrast.

Glitter must stay in the water area. Free: Fusion FastNoise into Displace or Vector Distort (with a Corner Positioner), a pEmitter with a Star glyph, a Merge in Screen apply mode. Blender compositor Displace node with an animated Noise Texture and a Glare node (type Streaks or Fog Glow in Blender 5.x, mapped). Remotion SVG `feTurbulence` plus `feDisplacementMap`. Ghibli-like: big, soft, slow sparkles. Retro: static palette-cycled sparkles.

Blender water plane with bump animation and glitter particles:

1. Sky plane: image to Emission Color, Strength 1, View Transform = Standard.
2. Water plane: Principled BSDF with a base colour, Roughness 0. Legacy EEVEE needed a Reflection Plane (Add > Light Probe > Plane). In Blender 5.x use Raytracing (mapped).
3. Noise Texture > Bump (Height) > Principled Normal. Bump Strength about 0.05, Noise Scale about 35.
4. Texture Coordinate and Mapping into the Noise (Ctrl+T with Node Wrangler). Driver expression `#frame/200` on Mapping Y location. Noise 4D with `#frame/200` on W.
5. Glitter: new particle system with Velocity Normal 0 and Gravity 0 in Field Weights. Set Render As = Object and instance a plane with a glitter texture.
6. Size control: add a Blend texture, set it to influence Size with Strand/Particle coordinates and a Color Ramp (black small, white large).
7. Placement: Weight Paint the water plane, then Particle Vertex Groups > Density = that group. This needs enough polygons.
8. Compositor: Glare node before Composite, a higher quality, type = Simple Star. Curved water: Lattice or Curve modifier.

Anime ocean with the Ocean modifier:

1. Delete the default point light. Add an Ocean modifier to the default cube (Modifiers > Physics > Ocean). Wave > Scale 1.1, Choppiness for sharper crests, Viewport and Render Resolution 16.
2. Animate Time with the driver `#frame/20`. Alignment higher means waves look closer to shore. Direction rotates the waves.
3. Light: View Transform = Standard, a very light blue World colour, a new Sun at a rotation that gives interesting shadows.
4. Material: Principled BSDF > Shader to RGB > Color Ramp (Smooth, deeper blue for the body, light blue for bright areas) > Diffuse BSDF > Material Output.
5. Foam: enable Foam and Spray in the modifier, name the data layers "foam" and "spray", Coverage about 0.3. In the shader use Attribute (name foam) > Color Ramp (Constant, bright spots on crests only). Combine with the first ramp using a Mix node set to Screen. The Attribute node needs the exact layer name.
6. Spray spheres: Geometry Nodes on a low-poly sphere. Group Input > Distribute Points on Faces > Instance on Points (instance = a small low-resolution UV Sphere) > Join Geometry (with the Group Input geometry) > Group Output. Drive Density with Attribute > Color Ramp > Math (Multiply). Put a Set Material node before Instance on Points. Add Random Value for scale and rotation. The source corrected this. Insert Set Position after Instance on Points. Use the foam attribute for where instances spawn. Use the spray attribute (Attribute > Color Ramp) as the Offset.
7. Variants: a warm ramp for sunset, a dark cold ramp for night, Emission for glowing foam at night.

Ghibli-like: painted-texture water with a hand-drawn wave line. Retro: a flat colour plane with a scrolling texture.

## Fireworks

AE with CC Particle World:

1. Composition > New Composition. Layer > New > Solid > Effect > Simulation > CC Particle World.
2. Trail layer: turn off visual guides. Particle Type = Shaded Sphere, Birth Size 0.2, Death Size 0, Max Opacity 100, Birth Rate 10. Push the producer back with Position Z. Radius X, Y and Z 0. Velocity 0.5, Gravity 0.1, Resistance 1.
3. Key Producer Position Y (press U to see keys), about 10 frames between keys. More frames make a slower trail. Key Birth Rate to 0 on the frame after the trail ends.
4. Burst layer: a new Solid with the same setup. Key Birth Rate 0, then 50 on the next frame, then 0 a few frames later. Velocity 15, Resistance 20, producer back in Z, Longevity 5. Key Gravity 0.1 then 0.8 so the particles drop after the burst. Offset the layer to start where the trail ends. Optional opacity map for flicker.
5. Extras: Effect > Time > Echo with Echo Time -0.08, Number of Echoes 20, Decay 0.8 (heavy on old PCs).
6. Flash: Solid > Effect > Generate > Lens Flare, centred. Add Effect > Color Correction > Levels and adjust Gamma and Output Black. Blend Screen or Add. Key Blend With Original. Soften with Fast Box Blur.
7. Select all firework layers and pre-compose (Ctrl+Shift+C). Duplicate the comp (Ctrl+D) and change the CC Particle World Random Seed for variations. Copies look identical without a seed change.

Free: Fusion pEmitter with a Region, Gravity and Directional Force, plus a Glow node and Trails. Blender: a particle system, or Geometry Nodes with a Point Cloud and a Glare node. Remotion: a canvas or three.js particle system with seeded randomness (`random(seed)`) (mapped). Ghibli-like: soft textured particles, fewer and slower bursts. Retro: sprite-based pixel bursts.

## Embers and fire

- Looping fire: a pointed blob mesh with a Displace modifier using a Musgrave texture (merged into Noise Texture in Blender 4.1+, mapped). Texture coordinates = an empty. The empty has a Follow Path constraint on a Bezier circle. Key Offset from 0 at the start to 360 at the end. The loop works only if the offset runs one full circle over the animation length. Lower the displace strength. Material: gradient into Emission strength 2, bloom through the Glare node.
- Looping embers: an invisible plane emitter with particles rendered as a small emissive sphere object. Use no gravity (Field Weights) and a low velocity with some randomness. Scale from a Blend texture and Color Ramp (black, white, black) in Influence > Size. To loop, duplicate the system. For a 240 frame animation set the first system Start -120, End 120 and the second Start 120, End 360. Both must have identical settings. Flickering light: key the Spot lamp size in and out.

## Holographic card shine

Blender (view-dependent gradient):

1. Color Management > View = Standard. World colour white.
2. Add > Image > Mesh Plane with the card texture. Extrude slightly for thickness. For the back, flip the UVs (UV editor, scale X by -1) and add a back material. With an alpha PNG, link Alpha to the Principled BSDF Alpha to keep the rounded corners.
3. Geometry node (Normal) and Camera Data node (View Vector) into a Vector Math set to Dot Product.
4. Dot into a Color Ramp (foil gradient) > Mix Color (A = card texture, B = ramp, blend = Color Dodge) > Base Color.
5. The Color Dodge Factor takes a greyscale foil pattern image (white reveals shine). Or make it procedural: a second Color Ramp from the dot product gives a metallic gradient. Multiply it with a Noise Texture > Color Ramp (tightened for contrast) in a Mix Color node.
6. Evolving pattern: Noise Texture Dimensions = 4D, dot product to W.
7. Blocky pixel foil: Texture Coordinate (Generated) > Vector Math Snap (Increment from a Math Divide, or two Divides into Combine XYZ for square pixels on a rectangular card) > Noise Vector. Add RGB Curves to boost.
8. Voronoi option: Voronoi Texture 4D with the dot on W. Use the Distance output and try the Distance Metric options.

Fix the card aspect ratio with separate X and Z divides. Cartoon: a hard-banded Color Ramp (Constant). Stylized realistic: thin-film or Iridescent Principled and a subtler Mix factor.

AE with default plugins only:

1. Two precomps (front and back). Parent the back to the front. Turn both 3D (cube icon). Y Rotation spins both.
2. Visibility by facing: on the Front opacity use `z = toComp([0,0,1])[2]; z > 0 ? 100 : 0;`. The Back uses `[0,0,-1]`. Without the ternary the card looks semi-transparent edge-on.
3. Flip the back: open its precomp, add an Adjustment Layer > Effect > Distort > Transform, Scale Width -100.
4. Cleaner option: remove the scripts, turn off the back's 3D and parent, and hide it. On the front use Effect > Channel > Blend with Layer = the back card. Drive Blend With Original with the same toComp expression. One script is enough.
5. Shine: inside the front precomp, Solid > Effect > Generate > 4-Color Gradient, blend Color Dodge. Drive it by rotation with an Opacity expression `linear(v, in1, in2, 0, 100)`, where v is pickwhipped to the front card's Y Rotation. Use inputs 15 and -15, not 90 and -90. The shine then shows only when the card faces the camera. toComp does not work inside the precomp for non-3D layers, so use `linear` on the Y rotation there.
6. Sweep: Effect > Transition > Linear Wipe, Feather about 400. Set the Wipe Angle and link Transition Completion with the same `linear` script.
7. Foil pattern: Effect > Noise & Grain > Fractal Noise above the gradient and wipe (hide the gradient for now). Contrast 110, Brightness -50, Complexity 1.0. Link Evolution with `linear` (output up to 1440). Turn the gradient back on with blend = Color. Try Fractal Type = String (flowing) or Noise Type = Block (geometric). Reduce Transform Scale for a fine sparkle.
8. Alternate foil: Effect > Generate > Cell Pattern, Plates, tiling on, Evolution linked.
9. Classic radial foil: use a gradient overlay in Photoshop or AE, style Angle, with a metallic gradient. Link the rotation with `linear`, precompose, then add Effect > Stylize > CC Repeat Tile.

Free: Fusion Merge3D with a card plane, Fast Noise and Gradient nodes and an Expression that reads the rotation. Remotion: a CSS 3D transform with `conic-gradient` and `mix-blend-mode: color-dodge` driven by rotateY (mapped). Cartoon: flat rainbow bands with high contrast. Stylized realistic: a subtler gradient with lower opacity.

