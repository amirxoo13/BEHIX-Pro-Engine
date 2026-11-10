# Blender card backgrounds and atmosphere

Image cards, masks, fog, sun and depth for anime and painted backgrounds built in Blender. All steps use EEVEE and plain nodes.
Node Wrangler (`Ctrl+T` adds Texture Coordinate and Mapping, `Ctrl+Shift+click` previews a node) is a bundled add-on.

Names mapped to Blender 4.2+ and 5.x: "Blend Mode = Alpha Blend" is now Material > Settings > Render Method = Blended. "Eevee Next" is just EEVEE. Blender 5.0 has no "Use Nodes" button in the compositor: open the Compositing workspace and press New.

## Reading Map

- Order of work for a whole scene
- Image-card clouds
- Painterly distortion of any image
- Mountains and trees as billboards
- Gradient edge fade
- Aerial perspective
- Fog plane
- Sun glow
- God rays
- Floating specks
- Birds from footage
- Layered dark planes and shadow blocker
- Warm near, blue far vignette
- Background colour that ignores lighting
- Fake glass reflection and dappled light
- Depth in a 2D plus 3D shot
- Scene principles that apply to any style

## Order of work for a whole scene

1. Block out every scene's environment before the character goes in. Colour-match the character to the scene, because that is easier than the reverse.
2. Per scene: scene 1 = cloud photo plus grass, scene 2 = noise-displaced plane for dirt, clumps, rocks, foliage, scene 3 = path in the centre with grass on the sides and one tree near the camera. Reuse ground, grass and trees across scenes. Scatter many small rocks, not a few big boulders.
3. Pull every scene to one palette (for example warm sunset: more orange, a little more contrast), then paste the character in and push its highlights toward orange and its shadows darker.
4. Cosy interior order: block out with a centre focus plus foreground and far background, give each object one light and one shadow colour, move the Sun, add ambient occlusion on unlit objects, fill an empty centre with trees, add a warm coloured gradient for edge light, tint highlight and shadow to the scene colours, add a branch with leaves above a boring area to cast shadow, add ground tiles with distortion, then small details.
5. Room layout comes from a reference catalogue, not a sketch. Add the camera early, make big shapes first and do not polish a pot that barely shows. Build all areas together because changing one changes the look of the others.
6. Cat room pipeline: plane, door, surroundings and accessories, lights, walls, toon colour with beige as the main colour, exterior, ambient occlusion, plants and fake glass, leaf-plane foliage, bounce light, foreground plants for variety, then compositing. Hide heavy foliage in the viewport until final.
7. Bedroom phases: decide the lighting in the blockout first (a window grid of light on the centre), then colour harmony and light spreading, then bring the character in and test angles, then animate. Declutter by removing leaves over the focal area.
8. For the far background of a room, use a stock preview image, scaled and flipped, or paint clouds. A black wall with graffiti behind the character worked better than buildings in one shot.

## Image-card clouds

A photo of a cloud becomes a soft cut-out card with no photo editing.

1. Get a cloud photo with a clearly blue sky and white cloud (Pexels, search "single cloud" for an isolated one).
2. `Shift+A` > Image > Images as Planes.
3. Delete Principled BSDF. Image Texture > Color Ramp (clamp so the cloud is white and the sky black) > Fac of a Mix Shader.
4. Mix Shader slot 1 = Transparent BSDF, slot 2 = RGB set white (value about 1.2).
5. Material > Settings > Render Method = Blended.

Black in the mask picks slot 1 (transparent), white picks slot 2. A greyed-out sky will not separate.

## Painterly distortion of any image

`Ctrl+T` on the Image Texture. Insert a Mix node (Color) between Mapping and the image Vector input. Set the blend mode to Divide (Overlay or others also work). Put a Noise Texture in B. Raise Fac a little, then raise Noise scale, roughness and detail. Keep it subtle: the image must stay recognisable. A Voronoi texture instead of Noise gives a rounder mosaic look. Use it on clouds, mountains and pine cut-outs.

## Mountains and trees as billboards

1. Pick a photo with a clear background separation. Remove the background in a photo editor (Krita or GIMP) and save a PNG.
2. Images as Planes. Image Color > Mix Shader, Alpha as Fac, Transparent BSDF in slot 1. In Edit Mode, right-click > Subdivide if you want to move vertices.
3. Insert a Mix node (Color, Soft Light or Overlay) with the sky colour in the colour path to fade the layer into the sky. Tint more the farther the layer sits.

## Gradient edge fade

Same Image Texture, Transparent BSDF and Mix Shader setup, but Fac comes from a Gradient Texture of type Quadratic Sphere (with `Ctrl+T` mapping), clamped by Map Range (easier than Color Ramp because it has From Min and From Max sliders). The centre stays opaque and the edges fade, so a card has no hard border. Place it behind the scene where detail is thin.

## Aerial perspective

The farther an element, the bluer and dimmer it must be, or the scene has no depth. Use fog planes (below) or fade distant objects with transparency or a blue tint. In foliage, put a Sphere Gradient (Linear) with grey-blue over distant trees.

## Fog plane

A movable, animatable fog card. Two sources give the same recipe.

1. Plane. Delete Principled BSDF. Noise Texture and Gradient Texture (Quadratic Sphere), both with `Ctrl+T`. Centre the gradient with its mapping.
2. Gradient > Map Range. Mix (Multiply) it with the noise.
3. Result > Fac of a Mix Shader: Transparent BSDF in slot 1 (or A), fog colour RGB in slot 2 (or B). Render Method = Blended.
4. Raise strength with Map Range or the RGB value. Animate the Noise Mapping Z location for drift. Layer several planes at different distances.

Without fog, god rays or bloom, the scene is harsh and has no unity. An older route is a fog object with a gradient so far objects fade, plus a Glare node:.

## Sun glow

Plane with a Quadratic Sphere gradient > Map Range > Fac of a Mix Shader (Transparent BSDF slot 1, a very bright RGB in slot 2). Render Method = Blended. `Shift+D` duplicate and scale it far larger for a second, overlapping halo. Pair it with a compositor Glare node.

## God rays

1. Stretch a Plane long on Y. Delete Principled BSDF.
2. Gradient Texture rotated 90 or -90 on Z, moved on X with Mapping.
3. Mix Shader: Transparent BSDF slot 1, gradient as Fac, Color node for the bright end. Blend mode Blended (it starts as Dithered).
4. Optional Color Ramp. Quadratic Sphere type gives a rounder beam. Scatter several with different brightness.

A paid add-on (Stylized Asset Suite) has a one-click animated god ray with dust. The node route above gives the same result.

## Floating specks

Voronoi Texture > Color Ramp (Constant, flipped so white comes first) gives dots. Mix Shader: Transparent BSDF in the black areas, a Color in the white areas. Blended. Animate Mapping Y with the expression `#frame * 0.05` (a negative value moves down, a larger value is faster). Reuse in any scene.

## Birds from footage

Import a clip of black birds on blue sky as a video image texture on a plane. Delete Principled. A Math node set to Less Than on the colour selects the dark pixels. If the ground in the clip also reads as a hit, multiply in a blank painted image through a Color Ramp (flipped) and paint out the unwanted area in Texture Paint. Use the result as Fac of a Mix Shader with Transparent BSDF, Blended. Birds can then be any colour. Needs strong brightness contrast between birds and sky.

## Layered dark planes and shadow blocker

- Dark planes behind foliage: a dark green plane with grunge, scaled up and put behind. Duplicate it nearer to the camera on Y with a transparency effect, so leaves farther behind get darker and harder to see. Turn off Cast Shadows on these planes.
- Background gradient, bright at the bottom and dark at the top: Gradient Texture rotated 90 on Z, Color Ramp to clamp.
- Shadow blocker: scale a big Cube so it casts shadow on half the scene. The light then hits only the subject and the near foliage. Move it to taste.
- An inset-and-delete-face plane works as a light blocker too, and a rectangle object can fake window blinds.

## Warm near, blue far vignette

In the foliage material: Gradient Texture with Texture Coordinate Object, pointing at an Empty (`Shift+A` > Empty > Sphere), type Quadratic Sphere. Mix node (Multiply, mode Color) with orange for white and blue for black. Move the Empty to move the warm area. Leaves near the subject read warm and bright, far ones blue and dark.

## Background colour that ignores lighting

World material: Light Path > Is Camera Ray into the Fac of a Mix Shader. Slot A = the normal world lighting (Background), slot B = an RGB colour or gradient for the visible background. Objects keep their lighting. A gradient background can use Quadratic Sphere > Map Range, with noise mixed into its mapping. Changing the background colour also shows flaws with fresh eyes.

## Fake glass reflection and dappled light

- Dappled light on glass: an Image Texture painted white into the B slot of a Mix over the glass colour. Tree reference images show these dapples.
- Glass reflection: a plane with Glossy BSDF behind the glass. Paint the blue reflection stronger on parts farther from the viewer. For a door, use a screenshot of the scene as the image texture, then replace it with the rendered animation as a video texture. Add RGB Curves for contrast if the video is faint.
- A bulb that glows: a bright RGB sphere with Bloom, inside a transparent outer sphere.

## Depth in a 2D plus 3D shot

Big, vibrant clouds in front. Dimmed, less saturated clouds and mountains behind. Pine trees and branches in the foreground as a frame. Add god rays and fog, and white wind streaks and dust near the camera for a 2D feel. A darker rebuild with fewer, more transparent clouds, fog and god rays read better. Change the camera mid-scene (side to front) for retention.

## Scene principles that apply to any style

Source for all:.

1. Gather inspiration and find the common patterns: positive and negative space, an accent colour, depth of field, rim light on the subject.
2. Put an interesting living subject in the centre. Viewers go to living things.
3. Light the subject and the foreground more than a dark background. Add rim light behind objects.
4. Break up the colour. A red flower in a green scene works, and keep it dim where the scene is dark.
5. Warm and cool contrast: an orange gradient where light hits, blue elsewhere.
6. Check values in grayscale and raise highlight values over time.
7. Test detail: add branches, keep them if they look natural.
8. Soften with Glare bloom, god rays, dust and fog.

Style change: for a flat cartoon plate keep gradients stepped and skip grain. For painterly plates keep gradients linear and add noise.

For NPR shaders on props, outlines and painted textures, read `model-characters` `references/npr-shading-and-painted-look.md`.
