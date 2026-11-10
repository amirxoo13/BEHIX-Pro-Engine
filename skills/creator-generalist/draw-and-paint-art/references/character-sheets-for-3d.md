# Character sheets and textures for 3D

This file covers the drawing side only. For UV unwrap, seams, Texture Paint, rigging and modelling steps, use `model-characters`, `use-3d-software` and `rig-characters`.

## Reading Map

- Turnaround and style sheet
- Painting rules for low-poly textures
- Face texture atlas
- Painted bump and roughness maps
- Colour in sculpt mode
- Cut-out part split in Krita
- Export parts
- Check a sheet

## Turnaround and style sheet

The notes name no single sheet recipe. These steps combine the construction and anatomy rules with the source modelling notes.

1. Draw the front view first with the construction rules (two blocks, joint circles, centre line). Draw the pose as an A-pose or T-pose with the arms and feet pointing the same way. That is easier to model and animate.
2. Draw the side view and the back view at the same scale. Use horizontal guide lines for the head top, chin, shoulder, elbow, waist, crotch, knee and ankle, and check each landmark against all views.
3. Add a three-quarter view only as a check. Draw the silhouette from the front and side planes.
4. Put the character on a neutral background with flat colour. Add a palette strip with the main colours and the shadow tints.
5. Add a style sheet: face expressions (open and closed eyes, mouth shapes), hands, shoes, props and the palette.
6. Keep the proportion ruler. The notes size the body in head heights by copying the head down the body (about 7.5 to 8 heads for an adult). Pick the number for your style: cartoon and chibi use fewer heads.
7. Make the line art clean enough that a modeller can read every overlap. Use varied line weight where parts overlap.

- A strong silhouette and clear negative space let a modeller read the pose and the clothes layers.
- Design for the planned topology: low-poly characters need loops at the elbow, knee and fingers, and facial features are painted, not modelled.

## Painting rules for low-poly textures

- Paint flat colour, and paint the shadows in (under the hair, under the arms), because the geometry is minimal. Little stretch on the UV is fine for flat painting. The crunchy look of one shared texture is part of the style.
- Block colours first, then paint details. Use a hard brush with stabilisation for line details. Keep pen pressure off for flat colour.
- Paint the face in an external program (Krita, Clip Studio Paint, Photoshop) for control, then reload it in Blender.
- Group the UV islands by use (clothes, skin, hair) so you can find them in the painting file. Export the UV layout (UV > Export UV Layout) and paint on a layer above it. Hide that layer before the final save.
- Save the image often. Blender does not auto-save it.
- Shadow colour: darken the base and shift the hue slightly toward blue, with more saturation. Do the same in the texture. Do not use pure black for the lines.
- For a bigger texture, 1K (1024) is enough for a low-poly character. Work in powers of two.

## Face texture atlas

- Divide the face texture into a grid of equal cells. For a 1K image, use 256 px cells (a quarter). Keep every face the same size inside its cell, and copy a face down one cell with grid snap.
- Paint eyes and mouth as separate sets when they should change independently. Put them in separate cells, rows or columns.
- Blink: draw the open and closed eyes side by side. Hold the closed eye for 1 to 2 frames and open it quickly.
- Mouth shapes: draw a mouth chart for lip sync.
- Keep the face UV centred in the cell, and use the UV Grid for the setup, then switch back to a blank image before painting.
- The shader setup (Mapping node, Combine XYZ, drivers, a bone that slides the UV) belongs to `model-characters`. It is in the face-texture source.

## Painted bump and roughness maps

- Make a second image in mid grey (RGB 0.5) for the bump. Black paints in (carves) and white paints out (raised). Use a pressure-radius toggle for tapered cracks. Roughness works the same, with its own grey image.
- Colour work: base colour first, large light-strength strokes for shading, dark thin lines for cracks, and light edges beside dark creases for relief. A low-strength yellow or orange tint warms the form.
- Brush tricks: duplicate the brush before you change it. For dots, raise Spacing (about 100 percent or more) and Jitter (up to 2). For a photo texture, switch the brush texture Mapping from Tiled to Stencil, use a tiling image with a free licence, and move the stencil between strokes so the pattern does not repeat.
- The node setup (Bump node, Image Texture) belongs to `use-3d-software`.

## Colour in sculpt mode

- On a dense sculpt you can paint colour into a Color Attribute with no UVs. Use the Paint tab, Paint Soft, and Color Filter for a base fill. The detail depends on the vertex count, so a low-poly mesh looks blobby.
- In the shader use the Color Attribute node (older names: Vertex Color, Attribute). Roughness 0 on eyes gives a wet look.

## Cut-out part split in Krita

1. Sketch the whole character on one layer, with feet and arms pointing the same way.
2. Add one layer per part and name it: arm_r, hand_r, torso, arm_l, hips, leg_r, leg_l, head (face, hair and beard on top).
3. Draw black line art on each part. Overlap the neighbouring part so the joints can hide gaps (let the torso pass through the shoulder). Plan the pivots, because a hand drawn too far from the shoulder breaks the rig.
4. Hide the sketch and show parts one at a time to check them.
5. Add a "colo" layer below each line art layer for flat colour. Use a hard brush. Press K for a darker shade of the same hue and use it for far-side limbs.
6. Select the line layer and its colour layer, press Ctrl + G, and name the group after the part (leg_l).
7. Stack order: hips above both legs, torso above hips, near arm above everything, head above torso.
8. For hand poses, make variants of the same size in one box, and export them as one strip.

- The same split works for Spine, Moho and Toon Boom.

## Export parts

1. Hide the background so it is transparent. Hide all groups except one part.
2. Crop Tool, frame the part, Enter.
3. File > Save As (Ctrl + Shift + S), format PNG, name it like the part (arm_l.png).
4. Ctrl + Z to undo the crop, hide this part, show the next, repeat. Save the .kra too.
5. Krita 5 also has Layer > Export Layer and batch export. The source notes say to verify these in your version (reconstructed).

- Rig and import steps (COA Tools, bones, IK) are in `rig-characters` and `use-3d-software`. The COA Tools add-on targeted Blender 2.8x, so check it in Blender 4.x or 5.x first.

## Check a sheet

- Overlay the views at one scale and check the landmark lines.
- Check the proportions, joints, hands and feet with the review list in `anatomy-and-foreshortening.md`.
- Hide the colour and check the silhouette in black.
- Check that every part that must move has clear overlap and a visible pivot.
- Check the palette: dark, mid and light values must separate, and the shadow tint must follow the light.
