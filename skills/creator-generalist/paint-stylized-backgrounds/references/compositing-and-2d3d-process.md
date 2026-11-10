# Compositing for a 2D look and the 2D plus 3D process

Compositor stacks that unify a stylized render, the finishing checklist, and the process of rendering in Blender and painting over in Clip Studio Paint or Krita.
Steps use Blender 4.2+ and 5.x names. Blender 5.0 has no "Use Nodes" button: open the Compositing workspace and press New. In 4.2+ set Render properties > Compositor to Always so the viewport shows the result. Box Sharpen is the Filter node type that older builds label "Sharpen". There is no standalone Laplace node: it is the Filter node, type Laplace.

## Reading Map

- Base stack
- Colour unity and split tone
- Two-colour contrast gradient
- Bloom and contrast
- Painterly and line effects
- Fix redness and grade
- Two-light lighting for environments
- Focus Empty depth of field
- Finishing checklist
- Render in Blender, paint over in Clip Studio Paint or Krita
- Decals painted in Krita
- Bake and export

## Base stack

Three videos agree on the same chain: Glare, Filter > Soften, Filter > Box Sharpen (or Diamond Sharpen). Tune Glare threshold. Box Sharpen strength 0.41 in one video, 0.700 in another (frame 16:57, Blender 5.2, Soften 0.450). Keep both values and pick by eye. Add Lens Distortion for a chromatic aberration look at the edges, and a subtle Hue/Saturation.

Grain: an Image node (any noise image) > Map Range clamped bright > Mix (Soft Light) with the render. Skip it for flat cartoon.

## Colour unity and split tone

- Unify: Mix (Color) after the image with one chosen colour. Keep Fac low, about 0.08 and never above 0.2, or colours wash out. This is the last step for scenes made of many different layers.
- Orange highlights and blue shadows: image > Map Range > Color Ramp (orange at the bright end, blue at the dark end) > the colour input of the Mix. Same low Fac.
- Soft Light or Overlay also tie colours together.

## Two-colour contrast gradient

Color Ramp from dark purple to bright orange with values above 1 (1.1 to 1.4), fed by the sharpened image. Mix (Multiply) the scene by that ramp. Everything is multiplied by the same two colours, which gives contrast and unity. It suits almost every scene. Ramp stops other than the first are unverified.

## Bloom and contrast

Glare (Bloom) between Render Layers and Composite. Glare lowers contrast, so add RGB Curves after it. A Mix node slides between before and after. Lowering the black level in the curve gave a pleasant magenta shift. View Transform > Use Curves (Render > Color Management) darkens shadows and brightens lights. Toon shading alone does not look cinematic, so soften it with ghosts, streaks and bloom.

## Painterly and line effects

- Kuwahara: Filter > Kuwahara, tune it, then Filter (Box Sharpen), then a Mix back with the previous image. Never full influence.
- Laplace outline: Filter (Laplace) > Fac of a Mix with B = black and the other input = the original image. A second Mix slides the strength. Try white to preview on dark scenes. Unverified on a frame.
- Hand-drawn line boil: the free Sketchify add-on. Install the zip (Edit > Preferences > Add-ons), `N` > Sketchify tab > Enable. Timing defaults to threes (Apply Timing). Speed is inverted: 500 to 600 slow, 10 to 20 fast. Frame 06:00 (Blender 5.0.1): Line Strength 12, Scale 22.5, Roughness 0.5, Extra Thickness 0.07, Blur 0.3, Line Harshness 1.55, Spreading 0.555. Use Shade Auto Smooth on cylinders. Add a real outline too, so lines remain with the add-on off.
- Outlines for props are in `model-characters` `references/npr-shading-and-painted-look.md`.

## Fix redness and grade

Recent Blender versions can add ugly redness. In the compositor add RGB Curves and lower the red channel. Raise the shadow step count for redness in shadows. Final warm vignette: a warm filter in your editor (DaVinci Resolve, free) or Blender Mix and RGB Curves. A phone photo filter also worked for the creator, but a tool filter is repeatable.

## Two-light lighting for environments

One to four lights per scene. Sun 1 is the top-down main light (power 4 in the node version). Sun 2 is the rim light from the side (power 1). Red and blue are channel identifiers that the shader reads, not final colours.

- Light linking (Blender 4.0+): put the character in a collection, select a Sun, Object properties > Shading > Light Linking, set Blocker or Receiving Collection. Duplicate the two Suns for an "environment" collection. A new object gets no light until you add it to the linked collection. This panel name is unverified on a frame.
- Rim extraction in plain nodes: Diffuse BSDF > Shader to RGB > Color Ramp = main light. A second Diffuse BSDF > Shader to RGB > Separate Color (take Blue) > Color Ramp > Fac of a Mix (Multiply), B = bright rim colour. For the environment copy the material, make it single-user, change the base colour, and link it with `Ctrl+L` > Link Materials.

## Focus Empty depth of field

Add an Empty (`F2` rename "Focus") at the subject. Camera data > Depth of Field on, F-stop about 1.4, Focus Object = the Empty. `Ctrl+Alt+Numpad 0` snaps a new camera to the current view.

## Finishing checklist

1. Compositor glare and lens distortion. Adjust contrast.
2. Add rim light to the character with an orange tint that matches the environment. Brighten its highlights to match.
3. Add gradients over flat areas, foliage shadows on bland walls, and extra debris (wood chips, leaves, petals).
4. Check edge highlights against the light direction. Highlights on the wrong side break the scene.
5. Tilt the camera a little down for composition if the shot is flat.
6. Add a black outline pass to props last, to sharpen the painted look.
7. Screenshot the work over time and check it on a phone at low and full brightness.

A scene with little detail gets character from shadows, gradients and hand-drawn marks: grunge, scratches and edge highlights painted on the light side.

## Render in Blender, paint over in Clip Studio Paint or Krita

1. Build the subject in Blender: project from an image, sculpt, rig, pose. Make cloth by duplicating part of the mesh and sculpting with Multires.
2. Place the Sun with an attractive angle and an orange colour. Make shadows deliberately blue (the sky colour), which adds contrast.
3. Add sparks, a flag or clouds with a Volume shader plus Noise Texture. Give clothing metallic and roughness.
4. Painting: sketch, grey underpainting, move onto the Blender render, paint grayscale first, then colorize and add detail. Go back and forth.
5. Krita equivalent: use a Group layer for the render, a Multiply layer for grayscale paint, then a Color layer and Overlay for colour (see `draw-and-paint-art` `references/light-form-and-colour.md`).

## Decals painted in Krita

For a texture that needs hand-painted marks, use Blender's own Texture Paint projection. Add an Image Texture for the decals, then Image > Edit Externally from Texture Paint mode, or use the screen-grab route: capture the view, paint on a separate layer in Krita above the screenshot, hide the base layer, save, and Apply in Blender to project. Erase with Mix = Erase Alpha. This is the free route to a paid add-on's decal feature (UV unwrap first, 2048 image, alpha 0).

## Bake and export

Blender cannot export shaders. Bake the toon material to a texture: Cycles, Bake panel, Diffuse (Color only) or Emit into a new Image Texture node that is selected and active. Bake ambient occlusion separately. Make materials single-user before you bake each object. Name each image, or the next bake overwrites it. Join objects before texturing if you will export, because `Ctrl+J` late breaks texturing. If lighting is baked, remove the lighting group first to bake colour only. A transparent object also bakes an alpha map. In the target engine plug the image into Emission (or Base Color) and use alpha for opacity. Shader-built animation can be baked to a video by rendering the shader animation to a clip and importing it:.
