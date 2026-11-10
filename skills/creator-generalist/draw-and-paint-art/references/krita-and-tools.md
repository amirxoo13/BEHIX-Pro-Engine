# Krita 5.x tools

## Reading Map

- Document and dockers
- Navigation and shortcuts
- Selection tools
- Transform tool
- Fill and gradient
- Assistants
- Canvas size
- Brushes
- Colour picking
- Layers, Alpha Lock, Inherit Alpha
- Blending modes
- Layer styles and filters
- Tools named

## Document and dockers

- File > New > pick a predefined size (for example A4, 300 ppi). The two small buttons beside width and height swap them for landscape. Create.
- Panels are called dockers. Settings > Dockers lists them (Palette, Advanced Color Selector, Brush Presets, Tool Options, Layers, Overview, Toolbox). A missing panel is almost always unticked there.
- Double-click a docker's title to undock or redock. Drop one docker on another to make tabs.
- Save a layout with the Workspace button at the top right > Save Workspace. The animation workspace is a built-in workspace in that list.

## Navigation and shortcuts

- Space + drag pans. Ctrl + Space + drag zooms. Shift + Space + drag rotates. Numpad 5 resets rotation. Tab hides all UI. In that mode, right click opens a pop-up palette.
- Overview docker: a thumbnail with zoom, rotate and a mirror button. Use it as a global reference while zoomed in.
- The mirror view flips only the view, not the pixels. Flip often for a fresh eye.
- Delete clears the active layer. Ctrl + Z undoes. Ctrl + Shift + Z redoes.
- Custom keys: Settings > Configure Krita > Keyboard Shortcuts > search > Custom > press the key > OK. The presenter's remaps: Mirror View (View category) = H, Freehand Selection = S, Deselect = Ctrl + D.
- Default keys kept: B brush, E eraser toggle, F fill, G gradient, Ctrl + T transform, X swap foreground and background, Backspace fill with the background colour, Ctrl + J duplicate layer, Ctrl + G group, Ctrl + E merge down, Insert new layer, Ctrl + U HSV adjust, Ctrl + H hide the selection outline.

## Selection tools

- Toolbox group: Freehand (lasso), Rectangle, Ellipse, Polygonal, Contiguous (magic wand, with a Fuzziness slider and an "all layers" option), Similar Color, Magnetic (guide it along an edge, Enter closes it) and Bezier.
- Shift while selecting adds. Alt subtracts. Tool Options also has the mode buttons Replace, Intersect, Add, Subtract and Symmetric Difference.
- Ctrl + H hides the marching ants and keeps the selection. Magnetic Selection isolates a nose, eye or pupil on a one-layer painting. Raising Fuzziness widens the colour range.

## Transform tool

- Ctrl + T works on a selection, or on the active layer if nothing is selected.
- Free mode: drag inside to move. Edge squares scale one axis and corner squares scale both. Shift keeps proportion. Alt scales from the centre. Hover between two squares to skew. Drag outside the box to rotate. Drag the target icon to move the pivot. Hold Ctrl with the cursor outside the box for a trackball 3D rotation.
- Enter validates. Click the transform tool icon again to reopen the gizmo.
- Other modes in Tool Options: Perspective, Warp (a mesh deform with a subdivision count and Draw anchor points), Cage (define a closed outline, then drag its points) and Liquify (push, grow, shrink, rotate and flow brushes). In Liquify, Ctrl inverts the mode, Shift + horizontal drag resizes the brush, and eraser mode removes liquify work.
- Liquify is slow on a full canvas. Select the region first.

## Fill and gradient

- Fill Tool (F): Tool Options has Threshold (how dark a gap counts as open), Grow selection (0 stops at the line edges) and optional Patterns. Grow above 0 overlaps noisy line edges and hides gaps.
- Fast concept path: lasso a shape, pick a colour, press X to flip the colours, then Backspace to fill with the background colour.
- Gradient Tool (G): click the gradient box in Tool Options > Add (custom gradient). Click a colour stop triangle to recolour it. Click the bar to add a stop. Drag a stop off the bar to delete it. Set the stop opacity, name it, Close.
- Options: Shape (linear, radial, conical, spiral), Repeat (none, forward, alternating) and Reverse.

## Assistants

- Assistant Tool > choose a type from the Tool Options list (Ellipse, Perspective, Spline, Infinite Ruler) > click the points on the canvas. Perspective needs the corner points, then the vanishing lines.
- Switch to the brush (B) and tick "Snap to Assistants" in its Tool Options. Without it the brush only sees the guides.
- The toolbox buttons Save, Load and Delete All keep presets, for example a perspective grid. Deleting a single assistant is buggy, so use Delete All.

## Canvas size

- Crop Tool, or Image > Resize Canvas. Untick Constrain Proportions, set the width, and choose the anchor to say which side grows. Image > Scale Image to New Size changes the pixels.

## Brushes

- B for the brush. Shift + horizontal stylus drag resizes it. The opacity slider is in the top toolbar (low opacity makes strokes accumulate). E toggles eraser mode on the current preset, so a textured brush erases with the same texture. The reset button restores the preset after you change it.
- A few brushes are enough. Fundamentals matter more than brush packs.
- Brush editor: Brush Presets docker > Edit Brush Settings (top toolbar). It has Brush Tip, Size, Opacity, Spacing, Rotation and Texture, plus a scratch pad. Turn on Pressure in Size or Opacity and click the curve to add points. A fast-rising curve is very responsive. A late-rising curve needs hard pressing. Drag a point out of the box to delete it. Save as New Brush Preset to keep it.
- Bundles: Settings > Manage Resources > Import Bundles/Resources > pick the bundle (for example "Impressionism" by Ramon Miranda from krita.org) > move it to the Active side > OK.
- Tags: in the Brush Presets docker, use the tag dropdown. Create a tag with plus, then right click a preset > assign to tag.
- Number-key brushes: Settings > Configure Krita > Python Plugin Manager > enable "Ten Brushes" > restart. Then Tools > Scripts > Ten Brushes. The top-row number keys switch to the assigned presets, and this works in Tab mode.

## Colour picking

- Hold Ctrl to sample the colour under the brush. Blend trick: paint two colours, Ctrl-pick the one in between and lay low-pressure strokes over the seam. Repeat.
- K darkens the current colour by a step. L lightens it. The step size is in Settings > Configure Krita > General > Color Selector Settings.
- Advanced Color Selector docker has square or triangle shapes. The Color Sampler tool has a Blend percent. At 100 it picks the exact colour. At 50 it moves only halfway to the colour under the cursor, which adds variation in realistic painting.
- Palette docker: add a palette with the plus icon, then add swatches.

## Layers, Alpha Lock, Inherit Alpha

- Layers docker: Insert adds a layer. Drag to reorder. Ctrl + click a layer thumbnail selects its pixels (then Ctrl + H hides the outline). Shift-click multi-selects. Ctrl + G groups, Ctrl + E merges down, Ctrl + J duplicates. Double-click renames. The padlock locks the layer.
- Alpha Lock (the checker icon on the far right of the layer row) paints only on existing pixels. "Ctrl + click, Ctrl + H, paint" does the same job. An empty layer cannot be painted when it is alpha locked.
- Select something, press Ctrl + C then Ctrl + V to paste it onto its own new layer.
- Inherit Alpha (the Photoshop clipping mask): group the base layer (Ctrl + G), add a layer above it, and press the Inherit Alpha button next to the Alpha Lock. Several such layers clip to the whole stack below. To lock only the layer below, group and separate.
- Transform and fill work on the active layer only. Check the active layer before you paint.

## Blending modes

Use the mode dropdown in the Layers docker. Black is 0, white is 1 and mid grey is 0.5.

| Mode | Effect | Use |
| --- | --- | --- |
| Multiply | Multiplies by the layer below, so it gets darker | Shadows |
| Addition | Adds, so it gets brighter | Glow and highlights |
| Overlay | Boosts saturation and contrast, never reaches white | Colour variation |
| Color | Changes hue and saturation, keeps values | Recolouring a grayscale painting |
| Soft Light (pick "Soft Light (Photoshop)") | A subtle version of Addition | Subtle highlights |

- Lower the layer opacity to soften each effect.

## Layer styles and filters

- Right click a layer > Layer Styles (drop shadow, inner glow, stroke). These are slow.
- Filter > Adjust > HSV/HSL Adjustment (Ctrl + U), and Filter > Adjust > Auto Contrast. Apply a filter as a filter layer (Layer > New > Filter Layer) so you can toggle and edit it.
- Filter > G'MIC-Qt is a free plugin with many extra filters. It can error. Explore it.

## Tools named

- Krita (free), Posemaniacs (free pose viewer), Mischief (infinite-canvas sketching, paid for layers), Impressionism brush bundle (free), Ten Brushes plugin (free, built in), G'MIC-Qt (free), Clip Studio Paint and Photoshop (paid). Set aside f.lux or any screen tint while you judge colour.
- Krita animation (frame-by-frame, onion skin) is in the Animation workspace. Right click a cell > Create Blank Frame. The Onion Skin docker sets previous and next frames. The source notes say transform tweening was not available. For 2D animation, the author prefers Grease Pencil (see `grease-pencil-drawing.md`).
