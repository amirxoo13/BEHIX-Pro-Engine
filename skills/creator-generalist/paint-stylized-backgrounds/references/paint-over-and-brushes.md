# Paint-over and brushes

Photoshop steps stay, with the free tool beside them. Krita 5.x and GIMP replace Photoshop for every painting step. The Krita and GIMP mappings are the skill author's own and are marked "mapped".

## Reading Map

- Five-step workflow
- Layer split and clipping
- Bevel-line painting
- Sky and clouds
- Trees, grass and brushes
- Make cloud, leaf and star brushes
- Glowing edge lines
- Rain
- Final touches
- Photo paint-over order
- Painting in 3D with Grease Pencil

## Five-step workflow

1. Preparation: pick the base (photo or render), crop and frame it, fix the perspective with the Transform tool.
2. Separate into foreground, middle ground and background layers. This helps painting and parallax.
3. Adjust the colour (see `light-colour-and-time-of-day.md`).
4. Paint over. Add rough painterly brushwork where it looks like photo or CG. Soften edges, repaint trees and clouds, and remove unwanted figures and animals.
5. Add effects and atmosphere, then the final touches below.

Remove static people and animals from a plate that will move. A frozen figure breaks the illusion. Overlay a texture layer in Multiply for extra detail.

Other styles: Ghibli-like uses more brushwork and less line. Stylized realistic uses the render as is and fixes only edges. Cartoon flattens colours and adds outlines.

Free tool: Alt-click eyedropper in Photoshop is Ctrl-click colour pick in Krita (mapped).

## Layer split and clipping

- Make one layer per scene object: sky, clouds, distant buildings, middle buildings, foreground.
- A clipping layer (Krita: Inherit Alpha toggle. GIMP: Lock alpha channel, mapped) applies paint or an adjustment only to the layer under it.
- Foreground props that need their own motion or blur go on their own layers.

## Bevel-line painting

This removes the sharp CG edge. Do it first when you paint over a 3D render, and do it on all elements.

1. Colour-pick the object colour and lighten it slightly.
2. Draw a line along the edge. Shift+click draws a straight line in Photoshop. Krita: the line tool, or Shift+click with the Freehand brush (mapped).
3. Use a different line colour for each material colour.
4. Paint over shadow edges with a colour between the shadow and the object colour. Use a lower brush opacity or a new low-opacity layer.
5. Roughen the shadow and glow edges in the same way.

Focus on object edges, shadow borders and light-emitting areas. Ghibli-like uses warm hand-painted edge tints. Stylized realistic keeps it very subtle. Retro skips it and keeps hard edges.

## Sky and clouds

1. New layer for the sky. Fill with a solid warm colour (Alt+Backspace fills with the foreground colour, or use the Paint Bucket). Add a soft round brush gradient. For evening, make the top darker.
2. New layer for clouds. Block the shapes with a hard brush, then shade. Turn on Lock Transparent Pixels (Krita: Alpha Lock, the lock icon, mapped) so the shading stays inside the cloud.
3. Use Transform to adjust shapes. Use the Smudge tool to soften edges.
4. Add a second, farther cloud layer for depth.
5. If the clouds have too much contrast, add a Screen atmospheric layer over them with a soft brush.

Repaint the sky for each mood instead of filtering it. Ghibli-like: big cumulus with soft bottom shading. Retro: banded, palette-limited clouds.

## Trees, grass and brushes

- Use a basic round brush for rough painterly strokes. Hold Alt for the eyedropper.
- Custom leaf and cloud brushes lay out trees and clouds fast. Resize the brush to refine shapes. Make them as in the next section.
- Scatter brush for dust, rain or snow: turn on the Scattering option so dabs fall at random (Krita brush editor: Scatter, mapped).
- Ghibli-like uses textured gouache brushes. Cartoon uses flat shape stamps.
- Fill an empty exterior with painted trees. Use a custom grass brush for long grass.

## Make cloud, leaf and star brushes

 written tutorials. Photoshop steps, with the Krita equivalent mapped.

Cloud or leaf brush from a photo:
1. Use a public domain or CC photo with derivative rights only: clear blue sky with white cloud, or a leaf cluster.
2. Copy it to a new canvas and scale it under 500 px. Desaturate (Ctrl+Shift+U), invert (Ctrl+I), then Levels (Ctrl+L)
   until the background is pure white. White is transparent and black is opaque in the tip.
3. Edit > Define Brush Preset. Krita: Brush Editor > Brush Tip > Predefined > Import, or Clipboard after copying the
   selection (mapped).
4. Turn on Shape Dynamics (Size Jitter with Pen Pressure, Minimum Diameter, Angle Jitter, Roundness Jitter), Scattering
   (Both Axes, Count 1) and Other Dynamics (Opacity and Flow Jitter with Pen Pressure). Flow builds up while the pen
   stays down. Krita: Size, Rotation and Scatter sensors in the Brush Editor (mapped).
5. Save as a new brush preset, or the settings are lost.

Star brush and starfield:
1. Draw a tip of random dots, define it as a brush, add Size Jitter, Angle Jitter, Flip X and Flip Y Jitter, and Scatter.
2. Far stars: a black layer, Filter > Add Noise 5% monochromatic, then Levels so some dots are bright and some dim.
   Clone-stamp in Screen mode to make clusters, erase to thin out. Set the layer to Screen. Krita: Filter > Other >
   Random Noise (mapped).
3. Paint bigger stars with the star brush on a Screen or Add layer, and glow on a Color Dodge layer.

Sources: [cloud brush](https://www.mclelun.com/2017/10/creating-photoshop-cloud-brush.html),
[starfield](http://www.mclelun.com/2017/02/photoshop-starfield-starry-night.html),
.

## Glowing edge lines

1. New layer, right-click > Blending Options, enable Outer Glow. Set a warm orange colour and tune opacity and range.
2. Set the layer blend mode to Screen or Linear Dodge. Without the blend mode the glow does not show.
3. Paint on that layer. Everything on it glows. Use it for window rim light, grass blade highlights and light sources.

If the app has no Outer Glow, paint hard-edge lines and add a soft airbrush on a Screen layer. Krita: Layer Styles > Outer Glow. GIMP: duplicate the layer, Gaussian Blur, Screen mode (mapped).

Ghibli-like: subtle warm rim only. Stylized realistic: skip the lines and use bounce light.

## Rain

1. New layer filled with black.
2. Filter > Noise > Add Noise (Monochromatic).
3. Filter > Blur > Motion Blur.
4. Blend mode Screen. Use Levels to raise the contrast so streaks show.
5. Scale the layer up slightly to hide the bright edges.

Night rain: bluer tint. Retro: hard-edged streak sprites. Krita and GIMP have Add Noise and Motion Blur filters. For moving rain use the After Effects effect CC Rainfall, or Fusion FastNoise with a Directional Blur (mapped).

## Final touches

1. Re-adjust saturation and contrast so the plate is in harmony.
2. Blur the background layers, and optionally the close-up layers, for depth.
3. Grain: fill a new layer with neutral grey and apply Filter > Noise > Add Noise. Blend Overlay or Soft Light at lower opacity. Scale the layer up for larger grain. Grain hides the seam between the photo and the paint.
4. Sharpen for concept art: duplicate all layers and press Ctrl+E to merge. Apply Filter > Other > High Pass with a radius. Blend Overlay or Soft Light at lower opacity. GIMP: Filters > Enhance > High Pass (mapped).

Cartoon: skip grain. Ghibli-like: a paper texture overlay in Multiply. Retro: stronger grain and dithering.

## Photo paint-over order

This order comes from a speed-paint of a photographed field. The video has timestamps only, so details are thin.

1. Levels and Curves to add blue to the shadows.
2. Paint over the grass field to remove detail.
3. Separate foreground props onto their own layers.
4. Custom grass brush and long grass.
5. Luma-mask the distant buildings.
6. Paint the clouds with a round brush and shade them.
7. Paint the trees.
8. Fix straight man-made objects such as fences.
9. Add fog and haze in the distance last.

Remove photo detail before you add painted detail.

## Painting in 3D with Grease Pencil

Use this when the background must stay attached to a moving camera.

- Each hill or cloud is three layers: line, fill and shadow. Set the shadow layer to Multiply at low opacity with Mask on. The shadow then shows only inside the fill.
- Spread the drawings through 3D space, not on one plane, so depth effects work.
- Stroke Placement = Surface with an Offset (too low and strokes cut into the mesh, too high and they float). Stroke Placement = 3D Cursor for grass and free drawing (Shift+right-click moves the cursor).
- Brush: radius is the outline thickness, strength 1, pen pressure off for flat lines. Hold Shift to stabilize. Draw on Back puts new strokes behind (Draw Mode: Behind in Grease Pencil v3).
- Sculpt Mode tools Push, Grab, Smooth, Thickness and Randomize add bumps to terrain. Use Stroke > Subdivide when there are too few points.
- Break outlines now and then for interest.

