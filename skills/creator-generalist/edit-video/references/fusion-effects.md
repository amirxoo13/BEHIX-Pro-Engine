<!-- skill-navigation:start -->
## Reading map

Entry headings in this file, in order. Search for the exact name and read the whole entry.

- [Fusion effects, masking and keying](#fusion-effects-masking-and-keying)
- [Entries](#entries)

Entries: Polygon mask basics in Fusion; Text behind a subject; Chroma Keyer for colour separation; Magic Mask (Studio only); Free AI masking with Runway ML plus Photopea; Mask on the Color page with dynamic keyframes; Channels and luminance as a mask; Shatter (glass break) with Replicate 3D; Faux 3D spinning shape rig; Halftone pattern (fast version); Trails and echo (three methods); Tapered line; Repeating background animation (circles tiled); Glow scan; Particle line animation; Turbulent displace; Neptune-style glow, stripes and outline; Scene stylisation for AMVs; Logo glitch; Time Displacement fuse for staggered delay; Anime edit breakdown (layering scene comps); How to use pack macros; Domain of Definition (DoD) explained; Old (XF) vs new Transform; Matte Control for masking; Cutout in Photopea/Affinity then Matte Control; Distort warp (Displace + Create Bump Map); Roughen edges; Anime speed lines with two nodes (Fast Noise + Coordinate Space); Slit scan; Time Blend (CC Time Blend) effect with Loop nodes; Particles basics; Quick effects with fewer than five nodes (100 Tips part 1); Macro making and editing; Rebuild a UI/phone mockup in Fusion
<!-- skill-navigation:end -->

# Fusion effects, masking and keying

Fusion node effects, masking, keying and pack macro quirks.
Entries are merged across both notes. Merged entries keep both notes' steps. Studio-only items are marked. Every entry ends with its source link.

## Entries

### Polygon mask basics in Fusion
cut a subject out.
  - Steps: Compound clip > Fusion. Polygon node, connect to the MediaIn blue (mask) input; select Polygon > Invert. Use the Click Append tool; close the shape (last point to first). Few points; Ctrl+drag a point handle to break one handle; Alt+drag moves a point. Unselect Polygon to see the whole picture. Soft Edge for a feather. Combine two polygons: second Polygon into the first; use Paint Mode (Invert) to subtract. Animate: key the Polygon "Right-click > Animate" shape; key on changed frames; Alt+drag keyframe shifts.

- Second note, same technique (Polygon mask editing hacks): precise point control.
    - Steps: right click polygon > Polyline > Create to add ellipse/rectangle/arrow; B opens the point editor (type exact values, offset by +/-0.1); Shift+P publishes points as controls; S + X or Y = scale from cursor on one axis; E = twist; M = move centre; double polyline then O to soften outward and L to edit edge softness; the Levels control can be keyframed as mask opacity. Shift+T shows key order. Ctrl-drag a handle to curve only one side.

- Second note, same technique (Polygon mask a moving character in Fusion): low-point mask animated across keyframes; text/background behind the subject.
    - Steps: clone the footage into a Polygon mask on the Merge Mask input (blue). Click as few points as possible on corners, then smooth with Ctrl-drag handles. At each frame the subject starts a new movement, keyframe, then back one frame and keyframe the last pose. Fix gaps by clicking the line to add points; move several points together by selecting them. To put an element behind her, add a Merge and Background below the masked branch; for extra holes add another polygon, connect to the mask polygon and set Paint Mode = Invert.
    - Use when / pitfalls: Fusion is better for small motion; the Color page tracker mask is better when the subject jumps drastically each frame.

### Text behind a subject
mask the subject then merge text behind it.
  - Steps: MediaIn into both Merge inputs (use an Alt+click pipe), polygon/matte on Merge effect-mask input; add Text node into a Merge on the background branch so the text sits behind the masked subject (Merge order: background branch first, subject on top).

- Second note, same technique (Text behind a character fast (Chroma Keyer trick)): no magic mask.
    - Steps: Chroma Keyer picking a dark/flat background (rough is fine) > Merge (footage on yellow, Text on green) with the keyed alpha on the Merge mask; Merge > Apply Mask and Invert. Soften with ChromaKey Matte Blur and a lowered Threshold.
    - Use when / pitfalls: works on full clips because it is not a tracked mask; edges stay rough.

### Chroma Keyer for colour separation
faster than masking when subject and background differ in colour.
  - Steps: Shift+Space "chroma", drag a box in the viewer around colours to remove (Shift drag restores). Matte tab > Blur and Threshold to soften, Erode/Dilate. Delta Keyer for green screen.

### Magic Mask (Studio only)
AI subject tracking.
  - Steps: Shift+Space "Magic Mask", draw strokes with the add tool; quality "Better"; Alt for the minus dropper; Track forward (red to blue). Fix a bad frame and retrack. Adjust Blur and Threshold afterwards.

### Free AI masking with Runway ML plus Photopea
no Studio needed.
  - Steps: Edit page: right-click clip > Render in Place (MP4). Runway > Green Screen: click points; Mode > Exclude to remove; Export green-screen MP4 (720p on free). Drag it into Resolve; Resize node to 1920x1080; Delta Keyer on the green; Matte Control: Alt-drag keyer onto Garbage Mat, invert if needed. Stills: export a frame (File > Export > Current Frame as Still), Photopea magic wand + lasso (Shift add, Alt subtract), Ctrl+D deselect, File > Export As PNG; use in Fusion.

### Mask on the Color page with dynamic keyframes
when the subject moves a lot.
  - Steps: Color page > Alpha Output (right-click in node graph > Add Alpha Output, connect blue square to blue circle). Open mask window, open Keyframes panel, right-click > Add Dynamic Keyframe. Pen tool for shape; Ctrl+drag points to curve. Next frame > add another dynamic keyframe > three-dot > Reset Selected Window and redraw.

### Channels and luminance as a mask
Matte Control reading Alpha, R, G, B or Luminance.
  - Steps: Matte Control > Garbage Matte > Channel. Black = 0, white = 1 for Luminance. Any black and white clip (ink, overlay) plugged in as a garbage mat becomes a mask (resize to comp resolution). Restrict a Transform node to the red channel in its settings to see channel separation.

### Shatter (glass break) with Replicate 3D
image breaks into shards.
  - Steps: 24-frame comp. Image Plane 1 (subdivision 1) for the full picture. Image Plane 2 (subdivision 5, scale divided by 5 e.g. 0.2) into Replicate 3D (yellow) with a single shard as the green input. UVMap after Replicate 3D: orientation Z, Fit and Center, lock UVs to animate objects. Displace 3D with a map from Fast Noise (detail 10, brightness -1, scale about 4, second colour blue and alpha down) merged over a grey background (value 0.5) with a Rectangle mask; Displace 3D Channel RGB, Mode Relative, Bias -0.5. Instance the UVMap (Ctrl+Shift+V) to the Displace output. Transform 3D, Renderer 3D to MediaOut. Replicate 3D translation Y 0 to -1 at frame 23; Jitter tab keyframed (X 3, Y up, Z 1, rotation 180). Change Fast Noise type for new patterns. Ctrl+T gives key interpolation presets.

### Faux 3D spinning shape rig
2D shapes faking a 3D rotation using one linked slider.
  - Steps: Background > Merge; SEllipse + STransform + SRender (top and bottom) and an SRectangle (middle); rename Top, Bottom, Middle (F2). Custom Tool with only two number controls. Link Top and Bottom ellipse Width to Number1; Middle width to Number2; STransform X offsets `=number2/2` and `=number2/-2`. Key Number1 0.5 to 0 and Number2 0 to 0.5, add a middle key for size. SM Outline (Smokey) macro with black colour; Merge after SRender to hide inner line. Add a letter or cap with a Transform and an XY path Center expression `middle.width/2 + 0.5`. To smooth timing: paste into a 5 s comp, Time Stretch the splines and use Time Stretcher (Nearest) then compound to 24 frames; Grain filter (scale 4, blend 1, animated).

### Halftone pattern (fast version)
black or white dots from a radial gradient.
  - Steps: Brightness/Contrast (saturation 0) > Custom Tool. Background: Gradient Radial, start 0.5 centre, end at top, Auto Resolution off 1080 width. Transform: Edges = Wrap, size down, angle 50. Crop (Keep Center) back to 1920. Custom Tool expression on R, G and B channels: `if(c1+c2<1,0,1)`. Blur 0.5, Grain optional. Adjust Gamma/Gain to balance. If pixel errors appear, desaturate in Brightness/Contrast. Hold Ctrl and scroll Size to change dot size.

- Second note, same technique (Halftone effect): dot-grid halftone.
    - Steps: sEllipse -> sRender (uncheck Auto Resolution, 1080x1080) -> Transform XF (Edges Mirror) -> Crop (1920x1080, Keep Centered) -> Background (white) Merge; Variable Blur: Media In on green, dot map on yellow (Method Focus, Blur Channel Luma, plus size 1.5), Invert Color, Color Curves with added points at -0.1 (value 0) and 1.1 (value 1) then pull the low point to about 0.9, Brightness/Contrast before the invert. Link ellipse Height = Width; change Size/Angle; add a Transform at the end to crop the edge lines. Also a faster route (100 Tips): Rasterize effect with black colour, small size and angle, Background white behind, Invert Color, Brightness/Contrast.

### Trails and echo (three methods)
Duplicate node, Time Speed and Echo.
  - Steps: Duplicate + BitMap + Background (copies 5, time offset 1, motion blur 8 quality, shutter 360, BitMap high down); Time Speed stack (each delayed by 1 frame, flat colours on Backgrounds, Merge, Ctrl+T, extend Global In/Out to -5 so frame 0 shows); Echo node from Reactor (Echo Frames 1, Sub Frames 5+). Motion Graphic Trails: Chroma key, invert matte, Time Speed delay 1 and 2 on coloured Backgrounds; Ctrl+T reorders; Opacity mask or blank Background fixes the first two frames.

### Tapered line
line that thins at the ends.
  - Steps: BSpline path (uncheck Solid, Border Width), key Position 0 to 1 and Length; Settings > Motion Blur Quality 20, Shutter 1400, Sample Spread 2.5; BitMap high 0.25 with soft edge; second BitMap high 0; Erode/Dilate (Circle, negative 0.03). Rainbow glow: Background gradient (4 stops, Repeat), Soft Glow, Dilate, Merge. Avoid lines that cross closely; a Transform scales up edge artefacts.

### Repeating background animation (circles tiled)
Duplicate-offset grid with delayed rows.
  - Steps: Background > Merge; second Background (Auto Resolution off, width 1080) with Ellipse where height `=` width, key it big to 0; Transform to ~1/8 size; Duplicate (move 75, copies 4); second Duplicate on Y (copies 4); Time offset -1 frame per row; Background Global In -50 so animation starts before frame 0; second pair with offset -4; Erode/Dilate 0.01 Circle to hide seams; Merge edges Mirror.

### Glow scan
moving threshold edge that glows.
  - Steps: Adjustment clip; BitMap (channel Luminance) on footage; Fast Noise (discontinuous, detail 0, gradient colour with white at 0.025 and black at 2.05) into Brightness Map; Background on effect mask (channel Luminance, white); key Fast Noise offset 0 to 0.5; BitMap threshold and soft edge to remove pixelation; Merge Alpha Gain down for more glow; S-curve.

### Particle line animation
streaking lines from pEmitter.
  - Steps: pEmitter + pFriction + pRender; number 15, velocity up; Region Rectangle full height, off-screen left; Erode/Dilate Circle after pRender; pRender Global In -40 to -120 and pEmitter lifespan above 200; Style > Color Variance blue; Directional Blur (length left, Glow 10); friction 0 keyed higher than velocity to stop; shorten blur key; Soft Glow; radial gradient Backgrounds; Displace with offset -0.5; Transform 1.1.

### Turbulent displace
animated noise warp for transitions.
  - Steps: Adjustment clip; Displace + Fast Noise into green. Fast Noise keys: Contrast 1 to 0, Seed 0 to 1, Scale 2.5 to 2. Displace Offset -0.5, Refraction Strength 2. Spline ease-out on Seed and Contrast; turn off Scale line.

- Second note, same technique (Turbulent displace): wobbly warp reveal/transition.
    - Steps: Displace + Fast Noise + Create Bump Map (Shift+Space). Fast Noise colour 1 = -1 (negative values give a broader range), Scale key 3.5 to 1 (never 0), Contrast 1.5 (stay below 2), Detail 2 (up to 3). Create Bump Map: Clamp Z Normal up, Height Scale up, filter size 5 for some looks, output into Displace green. Displace Type = X and Y, X Channel = Green, Y Channel = Red, X and Y offset -0.5, right click Y Refraction > Connect To > Displace > X Refraction, key X Refraction 0.2 to near 0, Spread about 3 (smooth blend), change the Seed (expression "time/30" in the Seed) until the map is a black circle surrounded by white. Add Transform keyframes on top (scale 3 to 1 with tight curve) and motion blur; use GPU in Displace settings. Mirrored-edge displace macro avoids stretched edges.
    - Use when / pitfalls: Resolve 21 adds nothing here, but the Mirrored Displace is a community macro (Discord/GitHub).

### Neptune-style glow, stripes and outline
outlined subject with scanlines and bloom.
  - Steps: Install SM Outline 1.2 (Smokey): copy the .setting file, in Fusion right-click any node > Macro > Create Macro, paste into the folder. Matte Control with a mask on Garbage Matte (invert). Outline on both inputs, light blue, User > line opacity, frequency, angle, width. Second Matte Control to cut lines. Glow: solid Background plus Glow and Soft Glow (colour scale blue), Brightness/Contrast (pre-divide/post-multiply on so it affects only the subject) and Hue Curves.

### Scene stylisation for AMVs
depth blur, overlay contrast gradient and lens flare.
  - Steps: Depth Blur node: Background radial gradient (flip colours) centred on the face into the Blur Image input; Filter Super Soften, Blur Channel Luma, strength about half. Merge with Background gradient (dark at bottom, bright at top) at Apply Mode Overlay (reduce Gain); Lens Flare (Studio's Lens Flare node, or Reactor MiloLab Lens Flares on Free).

### Logo glitch
noise-driven displacement.
  - Steps: Fast Noise (high contrast and detail) with Mosaic blur, Transform squashes boxes thin and fat, Displace node, Prism Blur (red and alpha only).

### Time Displacement fuse for staggered delay
text or motion delayed by a gradient.
  - Steps: Time Displacement (We Suck Less / Vision forum fuse; needs a forum login) with a vertical gradient Background on green, strength 3 to 6 frames, Mode Blend or Flow with an Optical Flow node first; Posterize node to step the gradient to match frame count.

- Second note, same technique (Time displacement and time slice transition): warp that mixes two clips across time.
    - Steps: select both clips > right click > New Fusion Clip. Install the Time Displacement fuse (Wasuless forum, unofficial update by Dell has an extra button): Fusion path map > Fuses > drop the .fuse, restart. Merge1 -> Time Displacement yellow; Bitmap (Channel Luminance) fed by Media In 2 -> Fast Noise brightness map (Alt-connect) -> Time Displacement green; Fast Noise Detail 0, Brightness 1, Colour tab gradient, pin it, expression on red: negative of the Time Displacement midpoint; Time Displace Strength -1, Channel Red; midpoint value = number of steps. Time slice: use Transform zoom-out or zoom-in keyed at the cut frame (e.g. 24) as the source to the bitmap; Invert Color on the bitmap to start from darks; raise Bitmap soft edge to smooth. After the transition keyframe a Merge so the top layer stops rendering.
    - Use when / pitfalls: needs a Fusion Clip, referencing the lower edit layer is unreliable. Four-node time slice also possible with Time Mapper (Crocodove): Background (gradient vertical) into iMapper, time offset -8, interpolate frames off.

### Anime edit breakdown (layering scene comps)
structure of an advanced AMV.
  - Steps: Markers on music beats; clips on top layer; Fusion Clip. Per scene: Brightness/Contrast edge-darkening, practical noise or smoke, tracked follower text (Tracker Match Move), particles (pEmitter, point force, glow), 3D comps with image planes, Defocus Gamma for depth, Camera 3D with two Transforms alternating movement plus a Shake 3D, light leaks, RGB Splitter, paper texture backgrounds, Fast Noise plus Ellipse mask scene crops, luma-matte Fast Noise gradient transitions with offset animated. Slide transitions use Defocus Gamma, exposure (Brightness/Contrast) and Directional Blur on the Edit page.

### How to use pack macros
yellow input = main image, green = secondary/map, blue = effect mask.
  - Steps: Select the macro before pressing its buttons. Buttons: link refraction (links X and Y), preset cycle, "Update Resolution" when the comp is not 1080p, combo box + "Update preset" button. For edge control use Edges: Canvas (set size 1.02 or above to see edges), Mirror (raise mirror amount) or Duplicate. Preset keyframes use the comp range from frame 0. Macro nodes mostly built from Displace/Transform with Gradient Maps; Studio-only ones are labelled. Free replacements: Bilateral blur, Camera Lens Blur (Defocus), Vector Blur (Optical Flow), Channel Blur; Beam, Light Sweep, Glue Gun, Glass, Bulge, Magnify, Bend, Ripple, Wave Warp, Page Turn, Twister, Venetian Blinds, Grid Wipe, Jaws (animatable height), Gradient Wipe (pink input), Linear Wipe, Iris Wipe (key width), Radial Wipe, Motion Tile with offset rows; Blend If (Simon Ubell, free), Echo (Reactor), Skew (Reactor), Bezier Warp is Grid Warp: Source panel then "Copy Source to Destination".
  - Pitfalls: Warp-O-Matic is built on Tween (Studio); some items lag.

### Domain of Definition (DoD) explained
why the new Transform lags with mirrored edges.
  - Steps: viewer three-dots > Region > Show DoD. The new Transform with Edges = mirror/reflect/wrap/duplicate renders a huge (millions of pixels) domain; XF Transform does not. Add an Auto Domain node after to render only the visible canvas, or Set Domain to a fixed area.

### Old (XF) vs new Transform
which Transform to use for zooms, pivot, motion blur.
  - Steps: XF transform behaves like an After Effects null: zoom in then out on a second XF keeps full footage (non-destructive); has a pivot point so a zoom can aim at a face. New transform: cropped result after zooming in, no pivot (Twisty's free tool adds pivot, no rotation support), but better motion blur (streaky, one ghost) and better optimization. Pivot-style zooms: XF; mirrored edges + blur-heavy: new Transform.
  - Use when / pitfalls: raise Quality/Shutter on XF motion blur to compensate but it lags; fix missing motion blur on the last frame with Gradient extrapolation (see Splines).

### Matte Control for masking
replaces the pipe-and-merge workflow.
  - Steps: Matte Control after media in: footage into yellow, mask into Garbage Matte (hold Alt while dragging to choose the Garbage Matte input); in settings > Garbage Matte tab > Invert to isolate the subject; chain a second to clean keys.

### Cutout in Photopea/Affinity then Matte Control
when no tracker mask exists.
  - Steps: right click viewer > Save Image (PNG), open in Photopea (free): Lasso L with Shift to select background, Wand W to refine, Alt to subtract, E eraser, Ctrl+D deselect, export PNG; back in Resolve add PNG to the media pool, drag into Fusion, Matte Control: footage on yellow, cut-out on Garbage Matte, then Invert.

### Distort warp (Displace + Create Bump Map)
quick distortion.
  - Steps: Media In -> Create Bump Map (Height Scale max) -> Displace green; Displace Type X and Y, offsets -0.5, link Y Refraction to X Refraction (right click > Connect To), Spread about 6, Refraction -1 to +1. Swapping channels (Red to Green, White to Red) changes it from a zoom to a rotate-type warp.

### Roughen edges
torn paper outline around a cutout.
  - Steps: Polygon (roughly around subject, invert) -> Matte Control (garbage matte, Invert); Ctrl+C then Ctrl+Shift+V instance the polygon, De-instance Border Width; Background (white) + Merge (Ctrl+T), instanced polygon with Border Width and Filter (not Round). Displace + Fast Noise (Scale 170, Contrast 5, Detail 10) + Create Bump Map (filter size 5, clamp Z up, height up) with X and Y type, offsets -0.5 and linked refraction, Spread near 1. Erode/Dilate between Merge and Displace's mask input (Apply Mask Invert) to keep the subject clean. Brightness/Contrast desaturate and Defocus Gamma (pentagon) for the background.

### Anime speed lines with two nodes (Fast Noise + Coordinate Space)
crisp radial lines.
  - Steps: Fast Noise: Contrast 5, Brightness 1, unlock XY, Y Scale 0, X Scale 100, Seed Rate 6; Color tab > Gradient, type Linear, points at 0.5/1 and 0.5/0, flip colours, alpha 0 on the black stop and crush it to the edge. Coordinate Space > Shape Polar to Rectangular. Drag the gradient end towards the middle to adjust inner gap. Variations: Repeat = Repeat with seed rate down for star/snow stream; Background gradient + Transform (Edges Wrap) + Coordinate Space for "circus tube" and spirals; animate Offset.

### Slit scan
temporal slice effect using the Echo fuse (long, heavy).
  - Steps: install Echo fuse (Wasuless/Wes Suck Less forum account needed, version 1.3 by Dell; formerly Reactor): Path Map > Fuses > drop folder > restart. Chain: Scale (divide by 2) -> Transform XF -> Matte Control (garbage matte from two Rectangles) -> Set Domain -> Transform -> Set Domain -> Matte Control -> Auto Domain; Echo; Merge (original yellow, echo green). Rectangle 1 width 0.001 height 1 = the slit; edit controls to add Slider controls Mask Offset and Slit Width; link rectangle centres to expressions (centre X = (Rectangle1.Center.X) + MaskOffset etc.); Paint Mode Multiply on the slit; set Domain Left/Right via expressions; second Transform Edges = Duplicate so the strip repeats; Echo Frames 45 (smaller slit width allows fewer echoes, e.g. 25). Build a Custom Tool with number inputs (Slit Position, Mask Offset, Slit Width, Echo Amount, integers only) and link controls to it. Render with Saver (EXR, only needed channels, Render All Savers) then Loader.
  - Use when / pitfalls: very RAM heavy (64 GB machine uses 50%); a paid macro exists for it.

### Time Blend (CC Time Blend) effect with Loop nodes
echoing/disperse text or footage.
  - Steps: install "Loop" nodes via Reactor (Workspace > Scripts > Reactor > search Loop > tick, restart): Loop Start and Loop End by Wes (Shift+Enter keeps the Select Tool menu open). Background (alpha down) -> Merge <- Text+ (blend keyed 1 on first frame, 0 on second). Merge -> Displace (Fast Noise, Create Bump Map, X/Y, linked refraction, spread 3, channel swap Red to Green and Green to Red, strength keyed 0 up to about 0.05 by frame 18 and flattened) -> Transform (size 1.1 per loop step) between Loop Start and Loop End; before Displace add Matte Control with a second Fast Noise (colour 0, high contrast, low brightness, speed 10-20) in the garbage matte (Invert, Alpha); Blend on Matte Control keyed 0 first frame then 25 (reveals 25 percent per loop). Seed expression "time/30". Loop End: link Loop Start, set cache folder and frames (24) > Run Loop (re-run after each change). To reveal: Rectangle mask swipe keyframed Center, instance (Ctrl+Shift+V, de-instance Soft Edge, Border Width, Width), a second Merge/Matte Control, Transform with offset, invert garbage matte, merge on top.
  - Use when / pitfalls: a stuck Run Loop button after switching comps means replace the Loop End node and re-enter settings; erode/dilate after the displace makes bigger dispersal.

### Particles basics
emitter, render, spawn and control.
  - Steps: Fusion Composition (about 200 frames) > pEmitter + pRender (Shift+Space). Emitter Number keyed 100 on frame 1 then 0 on frame 2 (a burst), Region tab (All for full frame, Sphere etc.), Style: Point/NGon or Bitmap with a crop-reduced bitmap image (smaller is faster), size and Size Z/Variance, Lifespan about composition length, Velocity > Velocity Variance (variance smaller than velocity = same direction), Angle (90 = up) and Angle Variance, Angle Z (towards camera), Rotation and Spin, Color variance, Fade and Size-over-life, blur and depth-of-field blur; add the glow after, not in the emitter. Forces: pVortex, pDirectionalForce, pFlock, pFriction. Random seed reseeds positions. For each Style change to Bitmap, put a crop node to reduce pixels.
  - Use when / pitfalls: Darren Fett's videos cover the system more deeply.

### Quick effects with fewer than five nodes (100 Tips part 1)
ten effects.
  - Steps: Opacity: Brightness/Contrast with alpha on, gain down; Bevel: Displace with the image into X input and green and blue inputs, light channel Alpha, light power up to 10, Spread, Blend; Gradient map: Bitmap (Channel Luminance) -> Fast Noise brightness map, detail 0, brightness 1, Color Gradients, offset 0.5 then colour the stops; Border: Erode/Dilate (Filter Circle) + Background + Merge; Operator Under to keep the border behind; Tempered glass: Blur on input, Rectangle mask on Displace, Radial -0.5 spread; Fish eye: Spherize (Crocodove, Resolve 21), iteration 1; Time slice: Time Mapper with a Background gradient (vertical); Noise border: Fast Noise + Transform + Merge with gradient; Halftone: Rasterize. Text behind character: chroma keyer trick above.

### Macro making and editing
bundle nodes into a tool.
 - Steps: hover to see contained node names; copy into a sticky note and change "MacroOperator" to "GroupOperator" to open. Select nodes (selection order sets the first inputs) > right click > Macro > Create Macro; expand each node and tick the controls to expose, rename them, File > Save into the Macros folder. In the file: InstanceInput with Width=0.5 (halve a control) or Name="Zoom" to rename. Scripts to convert a group to a macro and rename inputs are on GitHub.

### Rebuild a UI/phone mockup in Fusion
simple reconstructed graphics.
  - Steps: 1080x1920 background, rectangles for bars, MultiMerge (Reactor) to stack many merges, render and save image to avoid lag, Soft Glow to make a screen look lit, DVE for pseudo 3D angle.
