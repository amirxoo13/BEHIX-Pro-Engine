# Light, form and colour

The tools named here are Krita 5.x. Photoshop steps map one to one (Color and Overlay modes, Gradient Map adjustment layer, clipping mask). GIMP has the same modes.

## Reading Map

- Render a sphere in grayscale
- Cylinder and carved forms
- Colour a grayscale painting
- Painterly texture on a render
- Portrait painting workflow
- Paint over a Blender render
- Fake depth with paint
- Style notes

## Render a sphere in grayscale

1. Make a gradient background and a ground. On a new layer, draw a circle (hold Shift + Alt for a centred circle) and fill it mid-grey. Choose the light direction (for example from the top).
2. Core shadow: the darkest value, a band on the shadow side.
3. Light side: the value where the surface faces the light.
4. Highlight: the brightest value, where the surface faces the light head-on. The more a surface turns away, the darker it gets.
5. Reflected light: on the lower shadow edge, from the bounce off the ground. It is lighter than the core shadow and never as light as the lit side. Keep a very dark band where the sphere touches the ground (occlusion).
6. Blend: pick the colour and stroke toward the neighbouring colour. Stroke along the form (around the sphere), not in staircases.
7. Cast shadow: lasso a shape under the sphere. Make it darker near the contact and push it forward. Erase part with E for a gradient. Then use Filter > Blur > Gaussian Blur with more horizontal than vertical blur (untick the link), because the shadow is squashed in view.

- A bigger, flatter highlight reads as a more diffuse surface.

## Cylinder and carved forms

- Draw a cylinder by hand (draw through, erase after) with light from the top right. The top face is brightest. The side is a gradient from light to shadow. The shadowed side stays flat where the form turns at an angle. The side value never exceeds the top's intensity.
- Blend with zigzag strokes (painterly) or the airbrush.
- To carve a half sphere out of it, draw the hole outline. Put light where it hits the hole wall and shadow on the opposite side, then massage the values.
- Press H to flip the canvas and catch errors.

## Colour a grayscale painting

1. Paint in black and white first so the values are right.
2. Add a new layer in Color blend mode. Ctrl + click the subject layer to limit it to the subject. Paint the ground yellow and the sphere orange.
3. Add a second Color layer, tinted cooler, for the shadows. Erase it from the lit area and lower the opacity.
4. Press Ctrl + U (HSV Adjustment) to change hue and saturation and to test colour schemes.
5. For variety: select the object (Ctrl + click, Alt + click to subtract other layers). Airbrush random colours on a new layer, set it to Overlay and lower the opacity.
6. Gradient Map: duplicate the layers and merge them (Ctrl + E) into one. Then use Layer > New > Filter Layer > Gradient Map (also Filter > Map > Gradient Map). Choose a gradient from the preset list. Dark values map to the left colour and bright values map to the right colour. Edit the stops to push the mood (a cool scene with orange highlights).
7. Keep the colours following the value order.

- A Gradient Map is a fast way to start a painting. It is a filter layer, so you can remap later.
- Style: for flat cartoon or anime art, use one Color layer per material and one shadow layer in Multiply. For a realistic style, add the Overlay variation and keep the Gradient Map subtle.

## Painterly texture on a render

1. Group the render layers and duplicate the group (Ctrl + J). Add a new layer on top.
2. Choose a texture or paint brush. Pick the colour underneath and stamp it back in the same area, following the form. Repeat with a few brushes.
3. Merge down (Ctrl + E). Switch to eraser mode (E) with a textured brush and roughen the silhouette edge. Nature is not polished.
4. Use Ctrl + click on the layer to limit painting inside the shape.
5. For rock, add sparkle or texture strokes in Multiply at low opacity.
6. Merge shapes (shadow into the object) to simplify. Blend with a texture brush as if on a real canvas. Make some strokes go in odd directions to remove harsh angles.

- Chaos on top of order sells the paint look. This takes time.

## Portrait painting workflow

- Put a paper-texture layer under the drawing. Lay in a lot of paint and blend, mostly on one layer (merge the line art into the paint). For long pieces (10+ hours) use more layers. Extra layers on top are a safety net for tests.
- Work in 2 to 3 minute bursts and jump around the canvas so the whole picture stays consistent.
- Blend with the Airbrush, then restore texture over the gradient with the texture brush.
- Hair: think in large chunks. Highlights are small reflections.
- Texture: add a layer with a dotted brush in dark and light colours at reduced opacity. For grit, duplicate the portrait, apply Filter > Mean Removal (the caption says "min removal", so this is a reconstruction), lower its opacity and merge.

## Paint over a Blender render

Render in Blender with a Sun at an attractive angle, an orange Sun colour and deliberately blue shadows (the sky colour, which adds contrast). Then in Krita (or Clip Studio Paint, Photoshop): sketch, grey underpainting, move onto the render, paint grayscale first, then colorize and add detail, going back and forth. Krita equivalent of the Clip Studio steps: the render in a Group, grayscale paint on a Multiply layer, colour on a Color layer and Overlay. Background paint-over details are in `paint-stylized-backgrounds` `references/compositing-and-2d3d-process.md`.

## Fake depth with paint

Works on any flat or low-poly shape.

- Darkness where a crack or fold goes, then brightness right beside and under it.
- Brightness on edges that catch light, darkness on the edge next to them.
- Dark lines inside bright areas, and random dark and bright blobs for variety.
- Imagine a sun straight overhead. Paint darker value under shapes (under hair clumps, chin, accessories, fringe) into the colour, so the shape reads with no lights.
- Test it: take a screenshot with lighting off, convert to grayscale, then posterize or binarize. Form must still show.
- Keep value shapes crisp and describe the form accurately. Beginners paint smooth, muddy values. Zoom out often to judge the shot distance.

## Style notes

- Anime and cartoon: fewer value steps (light, shadow, core shadow), hard edges, one cast shadow shape.
- Realistic: all five light elements plus occlusion, soft blends and texture.
- Painterly: break the edges, vary the stroke direction, keep visible brush work.
- Retro or low-poly: paint the shadows into the colour, because the geometry is minimal (see `character-sheets-for-3d.md`).
