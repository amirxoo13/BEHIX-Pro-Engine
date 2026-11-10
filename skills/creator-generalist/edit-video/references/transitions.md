<!-- skill-navigation:start -->
## Reading map

Entry headings in this file, in order. Search for the exact name and read the whole entry.

- [Transitions](#transitions)
- [Entries](#entries)

Entries: Improve basic AMV scale transitions; Rotation transition; Zoom-out slide transition (pivot point slide); Fake zoom plus animated black bars; Hyper zoom; Motion tile reveal; Ghost zoom; Fade and opacity control; Luma fade (Luma Keyer transition); Stinger transitions (convert a Cross Dissolve to a Fusion transition); Zipper transition (stinger); Ripple dissolve (two methods); 3D cube transition; Stylised blur and glow at a cut; Per-beat blur/exposure/directional blur recipe; Slide transition (perfect); Beat-hit fake zoom (zoom out, zoom in on the hit, zoom out); Pinch zoom-out transition with Dent; Drip pinch/warp transition; Displacement transitions (warp slide, melt, pinch); Smear transition and smear macro; Box (split-screen) transition; Motion-graphic circle and slide transitions on an adjustment clip; VR rotate sphere transition; Offset frame (1-frame jump cut offset)
<!-- skill-navigation:end -->

# Transitions

Transitions built on adjustment clips, Fusion transitions and stingers.
Entries are merged across both notes. Merged entries keep both notes' steps. Studio-only items are marked. Every entry ends with its source link.

## Entries

### Improve basic AMV scale transitions
the common stiff zoom becomes a modern transition.
  - Steps: Turn off Motion Blur node settings only if it hides the scene (Fusion node > Settings). Loosen spline handles away from right angles (Ctrl+A, S, drag handles). Keep zoom direction the same through both halves (no zoom in then zoom out bounce). Zoom In: first half scale 1 to 2 or 3, second half 1 to 1.2. Zoom Out: first half 1.2 to 1, second half 2 or 3 to 1. Slides: move the scene a quarter to a third of the screen (check with Ctrl+G). Key the "in" half only 4 to 6 frames long (less than halfway), instead of the whole clip. Add black bars (adjustment clip across the edit > Fusion: MediaIn > Merge, Background, Rectangle mask width 1 inverted, position at the second graph line) to hide mirror edges and give room to scale. Combine diagonal moves (zoom plus up) and keep the scene from moving past the visible next subject. Add shakes, blurs and exposure flashes last.
  - Use when / pitfalls: mirrored edges (motion tile) visible for more than about one frame look amateur.

- Second note, same technique (Zoom-in / zoom-out transition (core 2-clip pair)): first clip scales in, second clip scales out, with matching pivot.
    - Steps: compound each clip (1 s) and put an adjustment clip over each. Clip A: Transform (XF) Size 1 to 2 over the whole clip, ease-in curve, Motion Blur on (Quality/Shutter few clicks). Clip B: Size 1 to 1.2-1.4, ease-out curve, Edges = Mirror (do the same on A). Move the Pivot Point onto the subject's face (about 0.3-0.8) and match it between clips. Zoom-out version: keyframe the last 3 to 5 frames from 1 to 1.2 on the first clip and start the next clip at 2.5-3 coming down to 1.
    - Use when / pitfalls: only zoom in when it makes sense for the scene, else slide or zoom out. Hide residual edges with black bars (adjustment clip > Merge <- Background <- Rectangle mask > invert) or a short blur.

### Rotation transition
zoom out plus spin with reflect edges.
  - Steps: Adjustment clip over each clip; Fusion > Transform (no XF). Out half: at the end key Rotation and Size, go back 5 frames and key again; rotate about 90 degrees left, start Size 1.2. Edges = Reflect. Motion blur: click the slider until blurred. Spline: Ctrl+A, S, tighten handles. Right-click last two keyframes > Gradient Extrapolation. In half: size start 2 to 2.5, rotation start 90 (same direction). Zoom-in variant: spin right and zoom to 2.5 at the end of clip one, and start at 1.2 on the next.

### Zoom-out slide transition (pivot point slide)
zoom out and slide by moving the pivot.
  - Steps: Transform on each adjustment clip: key Size at start/end, Reflect edges, ease-out curve; move Pivot to the left on clip one and to the right on clip two; add motion blur; add a second Transform with angle keyed (start, middle, end, ease in and out) towards the pivot direction for a tilt.

### Fake zoom plus animated black bars
wipes with moving bars synced to a flat part of the zoom.
  - Steps: Adjustment clip > Transform: key Size at start, end and two quarters in, S-curve, motion blur on, tiny angle key. Compound clip everything, add a Fusion composition with the compound as MediaIn, Merge > Background > Rectangle mask width 3 (bars). Key the mask angle at each still part of the zoom, smooth the spline.

### Hyper zoom
slide in, hyper zoom through still frames, scale out.
  - Steps: Adjustment clip 1: Transform key X slide-in and a second Transform key Size 1 to 3 starting in the middle; motion blur keys 3 frames; adjustment clip 2: Size 1 to 1.2-1.3 (avoid mirror edges). Fill about 12 frames with single frames of different scenes. Over those frames: Transform Size 1 to 1.6, Zoom Blur keyed 0.6 mid to 0.3 end, Brightness/Contrast saturation down in the middle and back up.

### Motion tile reveal
footage tiles reveal the next scene with a mirrored row.
  - Steps: First clip: Transform zoom 1 to 1.2 and back, slide, Edges = Wrap, S-curves, motion blur. Add a Merge behind; Ctrl+Shift+V pastes an instance Transform and connect MediaIn through it; Ctrl+T swaps merge inputs. De-instance X Position and set an expression `=-Transform1.Center` style link by typing `=` then dragging the plus to the Position so it moves the opposite way. Mask: another instance as effect mask (Alt-drag to Merge > Effect Mask), Rectangle height 1, instance edge behaviour Transparent, de-instance width and raise. Second clip: normal slide to 0.5 with Reflect and Size 1.15 to hide edge.

### Ghost zoom
a faded zoomed copy that disappears.
  - Steps: Adjustment clip > Transform: key Size 1 to 2 and Settings > Blend 1 to 0, graph in spline. For a stylised ghost: Merge with MediaIn on both inputs (Alt+click to pipe), an Edge Detect (grayscale, higher threshold) in the foreground, Merge Alpha Gain down, key Size 1 to 2 and Blend on the Merge.

### Fade and opacity control
five ways to fade.
  - Steps: Cross Dissolve from Video Transitions (needs handle frames); white dots at clip corners; Inspector Opacity keyframes; in Fusion Merge + Background (Alpha 0) + Ctrl+T, key the Merge Blend; or Channel Boolean (non-3D) with Operation Subtract using the background channels and key Blend. A 6-frame fade centred on a beat: three frames each side; set Blend 0.4 or 0.6 to favour one scene. Linear spline (Shift+L) for fades, S curve under the marker at a beat. Add Transform zoom to 1.2 on each adjustment clip with a loose graph.

### Luma fade (Luma Keyer transition)
transition by luminance threshold.
  - Steps: Layer clip 2 above clip 1 for 4 frames. Fusion > Luma Keyer; key Low and High; at the last frame high down, first frame high up and low slightly down. Blur the keyer to soften edges. Use as mask: change MediaIn Channel from Image to Settings > Luminance, invert; garbage-mat or solid-matte a polygon to fix holes.

### Stinger transitions (convert a Cross Dissolve to a Fusion transition)
build your own wipe with both clips visible.
  - Steps: Project Settings > Master > Optimize Media > cache transitions in user mode; Playback > Render Cache > User. Compound both clips, trim each by half the transition (e.g. 18 frames: trim 9 on the first, extend 9 on the second; the white line on the clip marks where the transition begins). Effects > Video Transitions > Fusion Cross Dissolve between them; right-click > Convert to Fusion Cross Dissolve; Inspector > Transition tab > wand icon opens its Fusion page (18 frames). Delete the Cross Dissolve and Merge the clips. Ellipse wipe: Ellipse mask on Merge, Height `=` linked to Width, key width 0 to 2, then make it length-independent by Modify With > Anim Curves (Source: Transition, Curve: Custom, Offset 0, Scale 2). Slide wipe: SEllipse > SRender > Transform with Center > XY Path > Anim Curves on X; Directional Blur (length -1, Glow 10) then BitMap (high down, low up) to make it solid; Transform Edges = Duplicate; Instance the Transform (Ctrl+Shift+V) on the mask. Burn: add Burn Away node with two inputs, Modify With Anim Curves on the transition value. Save: right-click the transition > Create Transition Preset (shows under User).
  - Pitfalls: timeline clips shortened by the transition length; cache transitions or it stutters.

### Zipper transition (stinger)
toothed wipe with a graphic line.
  - Steps: Same stinger set-up with 8 frames overlap. In the transition: Background > Invert (white) and Burn Away (black on yellow, white on green). Roughness, scale, and other parameters to 0 so only a line remains; Motion = Path, set the two end stars on the clip edges; Anim Curves on the transition (custom S curve). Plug Burn Away into the Merge mask input, MediaIn channel Luminance. Graphic: Transform > Matte Control > Time Speed (delay -1) > Garbage Matte Luminance; Burn Away through Ctrl+T into a Background mask (Luminance) tinted colour; Erode/Dilate thickens; Waviness (horizontal, speed 0) on Burn Away; Blur + BitMap in front to smooth. Sync clip slides: first-visible frame of clip 2 (4th frame) and the exact start/end frames inside the original clip (e.g. 18 and 27) for keyframes with mirror edges.

### Ripple dissolve (two methods)
Drip node or displace-based ripple with highlight.
  - Steps: Drip: Shift+Space "drip"; key Amplitude 0.15 to 0, Phase 0.75 to 2.25, Damping 0.2, Frequency 5; shape circular or radial; spline S-curves. With highlight: Displace node with Background to green; Background type Gradient, Radial, start 0.5, white point offset 0.5, add a black stop at end, Repeat = Repeat; key gradient offset 1 to 2.75. Displace type Radial, Refraction 0.4 to 0, Light Power 3 to 0 at quarter, Light channel Luma. Color Curves with soft handles for a smooth gradient. Ellipse via Matte Control garbage mat 0.1 inverted.

### 3D cube transition
footage on a spinning cube.
  - Steps: Markers on music; compound the footage; Fusion Composition above; Shape 3D (Cube), Renderer 3D to MediaOut; compound clip into the Shape; Crop to 1080x1080 offset 420 to fix the stretch; Proxy mode quarter, turn off high quality and motion blur while animating. Z Offset: start near camera, then back. Rotation Order set to XZY. Key Y rotation tilt then spin for the transition; ease-in/out graphs (hold Ctrl to move one side). Counter-rotate the footage with a Transform between clips; add border; shift all keyframes 2 frames; motion blur on the Renderer 3D.

### Stylised blur and glow at a cut
soft cut with a glow flash.
  - Steps: Adjustment clip over the cut; Blur size 0 at start, up in the middle, 0 at end; Glow keyed at the same frames; ease out/in splines.

### Per-beat blur/exposure/directional blur recipe
exposure and blur hits on beats.
 - Steps: Defocus Gamma (Reactor), Brightness/Contrast for exposure with Anim Curves on Gain, and Directional Blur, all on adjustment clips.

- Second note, same technique (Blur, exposure flash and directional blur layers on a cut): the layers that sell a transition.
    - Steps: Blur: adjustment clip 8-24 frames > Defocus Gamma (free from Reactor, "Do focus gamma") keyframe Defocus Size 10 to 0, Image Gamma 6 to 1, Lens Type pentagon/other shape, ease-out; for bleed-through start 2 frames before the cut and ramp 2-3 frames into the peak. Fallback: Defocus or Blur node (Fast Gaussian). Exposure: Brightness/Contrast, Gain (highlights) or Brightness (all) 1.2 to 1.0 (or 0.1 to 0 for brightness), ease-out. Directional blur: 2 frame adjustment clip on the cut, type Zoom (negative to zoom out) or Linear to match the slide, Length and Angle; for fake motion blur on a single frame offset use Wrap edges.

### Slide transition (perfect)
swipe left/right on a cut.
  - Steps: adjustment clip on each clip (12 frames); clip A: Transform (XF) with Center keyframed at the end, back 5 frames, move first keyframe 25% (0.25/0.75 on X), Edges = Mirror, ease-out curve; clip B mirrored (starts at 0.75, ends 0.5), ease-in. Add shake, blur and exposure above (below), plus a 2 frame directional blur on the cut. Slide direction follows the subject (eyeline, where the person is) and reading direction (left to right).
  - Use when / pitfalls: mirrored edges on both sides; zoom the clip 1.1 or so to avoid showing motion-tile.

### Beat-hit fake zoom (zoom out, zoom in on the hit, zoom out)
punch on a drum hit.
  - Steps: add Time Stretcher inside a Fusion comp for the clip so the subject action lands on frame 24 (S curve with steepest section at 24); Transform 1: size 3 to 1 over 28 frames; Transform 2: keyframe 3 frames before the marker, 1 to 1.2+ after, S curve with the vertical at the marker; Transform 3: zoom out over the last 5 frames with mirrored edges. Flatter line = smoother, steeper = stiffer.

### Pinch zoom-out transition with Dent
bulge impact on a zoom-out.
  - Steps: clip A end: Transform size 1 to 1.2 over the last 3-5 frames (start zoomed in 1), clip B start at 2.5-3 down to 1; 1-3 frame adjustment clip on the join > Dent node (type Dent 2/3), Strength about -0.3 (keyframe from start to a negative value), ease; shakes underneath.

### Drip pinch/warp transition
zoom plus ripple.
  - Steps: Transform zoom out + curve; add Drip node: Damping 1, Frequency 1.7, keyframe Amplitude 0 to 1; shape curve; motion blur on Transform and Drip (tab > Motion Blur, click shutter a few times); shakes on top.

### Displacement transitions (warp slide, melt, pinch)
displace driven by a gradient map.
  - Steps: Warp slide: adjustment clip over both clips; Displace Type = X and Y; Background > Type Gradient into Displace green input; keyframe X Refraction (0 at start, around -0.4 to -0.7 at the cut); second Displace with an inverted map (Invert Color) and positive values 0.4-0.7 after the cut; ease-in on the first, ease-out on the second; motion blur on. Melt: Fast Noise (Detail up, Contrast up, unlock XY, X scale 100, Y scale 10) into Displace; keyframe Y Refraction -0.1 at the cut and +0.1 after, Y Offset to 0.5 at the middle keys. Pinch: radial gradient Background, Displace type Radial, Refraction Strength about -0.7 at the cut to about 1.2 after.
  - Use when / pitfalls: Displace uses luminance of the map; all outer keys 0.

### Smear transition and smear macro
pull pixels along a line.
  - Steps: Displace + Background (Type Gradient) + Polygon (two points, Border Width up; select points, Shift+P to publish). Pin Background and Polygon; link gradient Start/End to Polygon point 0 / point 1 by expression; link polygon point 0 to the Displace Center. Polygon Soft Edge up, Displace Spread 3, strength up. Select the three nodes > right click > Macro > Create Macro; expose Soft Edge, Border Width, point 1, Displace Center and Refraction Strength; File > Save into the Macros folder. For a transition: paste on clip 1 (Source point left, Warp point right, Refraction keyed 0 up to about 2.5), flip with V and swap the points on clip 2.

### Box (split-screen) transition
sliding slivers with borders.
  - Steps: compound clips, then inside: Merge with Background (alpha 0) on yellow and Rectangle mask on mask; Height 1, Width 0.333; Transform (new) Y position keyframed over 20 frames, ease-out with motion blur 4 frames; copy for the next sliver, negate; another Merge with a white Background and a Rectangle (Solid off, Border Width) for outlines; duplicate with Angle 180 for both sides.

### Motion-graphic circle and slide transitions on an adjustment clip
ellipse reveal and wipes.
  - Steps: scale in 2.5 on first clip and 0.8 to 1.2 on second with Edges Reflect, slide with Center keys. Circle: Merge + sEllipse + sRender; Height=Width link; width 0 to 0.8 (1080 square) in 12 frames; second layer with Time Speed delay 5-6 frames; third as mask delay 10 and Apply Mask Invert; shift the shape's Global In 6 frames earlier. Slide: Background + second Transform keyed from X 0.75 to -0.75 (non-square comps go to the full range); copy with Time Stretch delay of 0.5 and 10 frames; final Transform at 1.1 to hide edges.

### VR rotate sphere transition
equirectangular spin.
  - Steps: Crop (Keep Centered, 1080x1080) > sphereMap (or Shape3D set to Sphere radius 500, base height/subdivisions 100) > Renderer3D render type OpenGL UV, uncheck Auto Resolution, 1080x1080; keyframe sphereMap X or Z rotation at the end and several frames before (to 0), S curve; copy to next clip and key it from the start. Shortcut: Reactor "Carter VR Transform Tools" and the Rotate Equirectangular node.

### Offset frame (1-frame jump cut offset)
1-frame flash glitch.
  - Steps: adjustment clip on the last frame; Transform (new) Y position key 0 then 1 one frame later, move the first key back one frame (Alt-drag in Spline), Edges = Wrap, Motion Blur 0.5. Resolve 16 alternative: old Transform Y = 1 with Edges Wrap plus Directional Blur (Length/Angle).
