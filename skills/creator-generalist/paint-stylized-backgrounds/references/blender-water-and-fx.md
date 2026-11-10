# Blender stylized water and background FX

Waterfalls, pools, oceans, rain, smoke and fire made with plain nodes in EEVEE. They loop, so they suit backgrounds and 2D-looking shots.
Node Wrangler (`Ctrl+T` for Texture Coordinate and Mapping) is bundled. Shader to RGB works in EEVEE only.

Names mapped to Blender 4.2+ and 5.x: "Blend Mode = Alpha Blend" is Material > Settings > Render Method = Blended (a Dithered plane looks dusty). "Screen Space Refraction" is a legacy EEVEE setting. In 4.2+ use the material's raytraced transmission option (unverified: check the name in your build). Shift+right-click drag on a link makes a reroute point.

## Reading Map

- Rules for every mask in this file
- Waterfall with cascading gradients
- Waterfall geometry and motion
- Foam from two Voronoi textures
- Foam ring, splash and bubbles
- Pool, bath water and ripples
- Shallow water from stacked planes
- Anime ocean and water shader (with Ocean modifier values)
- Loops and stepped timing
- Rain
- Smoke and steam
- Fire
- Stepped wind and dust streaks

## Rules for every mask in this file

- Pattern: noise a gradient with a Mix node, clamp with Map Range, binarize with Color Ramp (Constant), use the result as the Fac of a Mix. Reuse it for everything.
- In a Mix, A is the black part of the mask and B is the white part. Flip the Color Ramp stops instead of rewiring.
- A Gradient Texture of type Quadratic Sphere, moved and scaled by its Mapping and distorted by noise, confines any effect to an area. Multiply it with the effect mask. It places top-of-fall bubbles, foam at the base and centre-only reflection noise.
- On a flat plane use the UV output of Texture Coordinate. Generated misbehaves at the edges, and Object uses the origin.
- Put a repeated setup in a node group (`Ctrl+G`). Delete unused inputs and keep Color in and Color out. Click the duplicate button to make a unique copy.

Source for these rules:.

## Waterfall with cascading gradients

The Spirited Away look: stacked colour sheets that fall over each other.

1. New material. Gradient Texture, `Ctrl+T`.
2. Between Mapping and the gradient insert a Mix (Color) node fed by a Voronoi (circular look) or Noise texture to distort the gradient.
3. After the gradient: Map Range, then Color Ramp (Constant, black at 0, white at 1) to binarize.
4. Ramp > Fac of a Mix: A = dark green, B = light green. Repeat with a second gradient for a second cascade and combine with another Mix.
5. Aim for three tones: top, middle, bottom (lighter, darker, a little lighter again).
6. Hue/Saturation/Value at the end shifts the hue (green to blue).

Bubbles at the top: Voronoi > Map Range > Color Ramp (Constant) gives white bubbles on black. Multiply with a Quadratic Sphere mask, displace both with noise, Color Ramp again, then Mix a bubble colour.

Falling stripes: a Wave texture gives ribbons. A second horizontal Wave plus Noise picks patches. Multiply the two. Mix with an HSV (Value up) for bright stripes. Dark stripes use another Wave, Map Range, Color Ramp and an HSV in slot A.

Toon light on top: Diffuse BSDF > Shader to RGB > Color Ramp (Constant). Add it to the manual gradient with an Add Mix and tick Clamp. A final Mix sets white at the top and bluish dark at the bottom.

Reflective floor: build the colour with nodes, then plug it into the Principled BSDF Base Color as the last node. Add a raytraced refraction or transmission option so the reflection shows. Add centre-only reflection noise (Map Range, multiply with a Quadratic Sphere).

## Waterfall geometry and motion

1. `Shift+A` > Mesh > Plane. Drag the top edge up, `Ctrl+R` loop cuts, proportional editing to bend a falling curve.
2. Add Subdivision Surface and a Displace modifier: Texture Coordinates = Object, Object = an Empty, texture type Clouds. Scale the Empty in X so the displacement is horizontal. Animate the Empty to wobble the water.
3. Duplicate to four fall planes. Add a plane as the pool, and press `/` for local view.
4. Make each copy's material unique and vary the mapping values and key timing, so no two falls match.

## Foam from two Voronoi textures

1. Voronoi A (F1) and Voronoi B (Smooth F1) on the same Mapping. Math Subtract (A minus B) gives cells.
2. Add noise, Map Range to clamp, multiply with a Quadratic Sphere mask where the fall meets the floor.
3. Color Ramp to binarize. Use it as Fac of a Mix with B = white.
4. Group it, then duplicate the group for the waterfall and remove the sphere multiply.

## Foam ring, splash and bubbles

- Foam ring: Add > Curve > Path, Curve data > Geometry > Bevel raise Depth, thicken with `Alt+S`. Place it where the fall meets the pool. Object > Convert > Mesh (resolution 12), move vertices up and down. Add a Displace driven by an Empty "foam displace" (Clouds), Subdivision after, and a second Displace with a Wood texture (type Saw) for fine detail. Animate the Empty up and down. An object shows one texture at a time, so use a placeholder Cube to edit the second texture.
- Splash: an Ico Sphere with a flat white material, rendered as the particle object on a plane emitter. Frame Start -50 and End 250 so the splash is already running at frame 0. The plane uses Transparent BSDF. Duplicate emitters at the top, the base, rocks and sides.
- Bubbles on edges: Distribute Points on Faces > Instance on Points with a Collection Info node (tick Separate Children and Reset Children) and Pick Instance on. Scale from Noise > Color Ramp.
- Soap bubble: Ico Sphere, Shade Smooth, Mix Shader with Fresnel as Fac, A = Transparent BSDF, B = an edge colour.

## Pool, bath water and ripples

1. Surface: Circle, repeated `E`, `S`, then `F` fill, with zigzag overflow edges. Displace (Clouds, Object coordinates, Empty) for motion.
2. Shader: toon blue into a Mix Shader with Transparent BSDF, Blended.
3. Lower pool: Gradient Texture (Quadratic Sphere is smoother than Spherical) with Color Ramp (Constant), moved with Mapping. Insert a Mix between Mapping and the gradient with Noise in B (Divide, raise Factor). Brighter outside, darker inside.
4. Ripples: Wave texture type Rings, Z direction, Object coordinates, Map Range, multiply with a spherical gradient so rings exist only in the middle. Color Ramp (Constant), Mix with white B, Mix Shader with Transparent BSDF.
5. Reflection plane: duplicate the water plane, new material with low-roughness Glossy BSDF, place it below the transparent water, and enable the refraction or transmission option.
6. Fix shadow artefacts with Shadows Cascade Size 2048 (legacy EEVEE setting).

## Shallow water from stacked planes

Subdivide a plane many times and duplicate it down several levels. Shader: toon Diffuse (blue-green) > HSV, with a Mix Shader and Transparent BSDF to slide the transparency. Objects under more layers look more washed out. In Edit Mode, `G Z` with proportional editing raises the water locally.

Liquid with objects inside (broth, syrup): lower the transparency and stack several liquid layers on top of each other, Blended. Duplicated faces stack opacity.

## Anime ocean and water shader

The Anime Ocean add-on is paid. Do not buy it. The plain route is below.

1. Plane or the Ocean modifier (Add > Mesh > Ocean in Blender 4.2+ is the modifier object, mapped). Resolution 9 to 14 (the add-on uses 14). Use repeat X and Y to enlarge, not scale. Animate Time (`I` at frame 0 and at the end, `T` > Linear).
2. Shader: a gradient through RGB Curves for the colour look, a Bump map for waves, a separate foam network, and a Fresnel driving transparency at grazing angles.
3. Stack two copies of the water plane (the second under the first). If you scale the plane down, raise Bump to compensate.
4. Light with a sunset HDRI (Poly Haven, free) and a Sun with strength about 3. The 3.5.1 frame shows View Transform Filmic with Look = Very High Contrast. Node values were too small to read (unverified). In 4.x and 5.x use AgX or Standard and adjust curves.

### Ocean modifier values from the 2.92 tutorial

Captions only, values read from frames (, Blender 2.92; the modifier is unchanged in 4.2+ and 5.x, Physics category).

1. Plane plus a Sun at Strength 10. Add Modifier > Physics > Ocean: Geometry Generate, Repeat X 1, Y 1, Resolution Viewport 14, Render 14, Time 1.00, Depth 200 m, Size 1.00, Spatial Size 50, Random Seed 0, Generate Normals off.
2. Waves: Scale 3.5, Smallest Wave 0.01 m, Choppiness 1.84, Wind Velocity 15 m/s, Alignment 0.25, Direction 0 degrees, Damping 0.68. The creator says these are the settings to play with.
3. Foam on: Data Layer `foam`, Coverage 0.34. The shader's Attribute node must use the same name.
4. Time: `I` at frame 1, last frame Time about 17 (he used 14 and calls it too fast), then Graph Editor, select all, `T` > Linear.
5. Shader (shown pre-made, links not readable, unverified): Glass BSDF as the base, two red Value nodes for foam adjustment, one Value node for a bloom-like glow along the wave tops. This is the paid Anime Ocean look: do not buy it, use the plain nodes in the steps above. Turn off the Sun's Shadow for less darkness, and set the light's direction and power by eye.

## Loops and stepped timing

- Linear loop: right-click a Mapping value > Insert Single Keyframe, move in time, change the value, insert again. Select both keys, `T` > Linear, `Shift+E` > Linear Extrapolation. Key the location, not the scale. Key X to move gradients down a fall, Z to animate in place.
- Expression drive: type `#frame * 0.05` into a Mapping field (a negative value reverses it, a larger value is faster).
- Stepped on twos or threes: `floor(#frame / -3)` changes every 3 frames. Change 3 to 2 or 4. Slow it with a divisor: `(floor(#frame / -3)) / 5`. A smaller divisor is faster.
- Animate a Displace with an Empty. Key the Empty, then Linear and Linear Extrapolation.

## Rain

- Stepped rain streaks: Plane, Noise Texture, `Ctrl+T`, Scale X very high so streaks are thin, Map Range to clamp heavily. Mix Shader with Transparent BSDF and the mask as Fac, white in B. Mapping Y driven by `(floor((frame) / -2))/-8` (read at frame 50:08, Blender 4.5.0). Mapping Scale there is X 11.04, Y 0.42, Z 1.0. Noise Scale 15.32, Detail 2.0, Roughness 0.251. Blended. Turn off Cast Shadows.
- Splash: Grease Pencil is the one use he likes. `Shift+A` > Grease Pencil > Stroke (Blender 5.x: Grease Pencil v3), Draw mode, Auto Keying on, white. Frame 1: three white streaks. About 3 frames later erase, turn on Onion Skin, draw smaller and more spread streaks. Three frames later erase all. Duplicate the object with `Shift+D` around the scene and repeat the keys.
- Droplets on a leaf: select the droplet, `Shift+click` the leaf, `Tab`, select three vertices, `Ctrl+P` > Vertex (Triangle).

## Smoke and steam

1. Plane, EEVEE, rendered view. Delete Principled BSDF.
2. Noise Texture, `Ctrl+T`, Map Range. Gradient Texture (Quadratic Sphere), `Ctrl+T`, Map Range. Tune both mappings to a smoke shape.
3. Multiply the two outputs. Mix Shader Fac = result, Transparent BSDF slot 1, white slot 2. Render Method = Blended.
4. Animate the first Mapping Y with `#frame * 0.05` (small is slow drift). Add the `floor` stepping above for a choppy 2D feel.
5. Holes: multiply by a new black Image Texture through an inverting Color Ramp, then paint in Texture Paint where smoke must vanish.

A smoke puff by shape keys: Plane > Subdivide. Object Data > Shape Keys, `+` (Basis), `+` for Key 1 set to 1, shape it with proportional editing, add Key 2, then key the values with `I` one frame apart and set `T` > Constant. Combine with the noise shader above, dissipating through an animated Map Range.

## Fire

Stacked layers: a sphere with every other top vertex extruded for inverted-V tips, a Displace driven by an Empty (drag the Empty to animate). Duplicate: first layer orange emission, second more transparent, bottom yellow, top reddish. Sparks: duplicate the fire with a gradient and a mostly black Noise animated upward. A speed node of the form "frame divided by number" sets the loop speed (200 to 500 slower, 50 faster).

## Stepped wind and dust streaks

Plane. Noise Texture switched from 3D to 2D, `Ctrl+T`, Map Range after it. Frame 10:36 (Blender 5.0.1) shows Noise 2D fBM, Normalize on, Scale 10.85, Detail 2, Roughness 0.5, Lacunarity 2, Distortion 0. Map Range From Min 0.73, From Max 1, To Min 0, To Max 1.15. Mapping Scale X 0.7. Stretch the streaks with noise scale. `E` extrudes edges to curve the plane around the camera. Drive Mapping X with a `floor(frame/4)` style expression (full text unverified). Mix Shader with Transparent BSDF in slot 1 and an RGB in slot 2. Parent the plane to the camera if needed.
