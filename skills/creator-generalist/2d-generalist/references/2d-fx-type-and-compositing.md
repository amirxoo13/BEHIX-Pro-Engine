# 2D FX, Mattes, Transitions, Type and Compositing (After Effects recipes, free-tool routes)

Use this for 2D effects built from blur plus levels (goo, smoke, fire, liquid, rain, lava), loops and kaleidoscopes, mattes, transitions, kinetic type, and for putting graphics into footage. Each entry gives the After Effects (AE) recipe with exact values, the principle, and the free route (Fusion, Blender, web/CSS/SVG/canvas, Remotion). Route notes marked "untested" were not run.

## Reading Map

- [How to read an entry](#how-to-read-an-entry)
- [Currency notes](#currency-notes)
- [1. Mattes](#1-mattes)
  - Track mattes: alpha, luma, inverted; Set Matte; Stencil, Silhouette and Preserve Underlying Transparency; footage or art inside text
- [2. Goo, smoke, fire, liquid, lava, rain](#2-goo-smoke-fire-liquid-lava-rain)
  - Blur plus alpha Levels smoke; cartoon smoke and explosion; fire and splash by hand; liquid level reveal; 2D water ripple; lava (base, colour and relief, melting text); rain (CC Rainfall, CC Drizzle plus Threshold, ripple-warped text, painted drop); shooting star and twinkle; particle stream
- [3. Loops](#3-loops)
  - Grid tunnel; looped boil drawings; bricklayer repeat plus Bezier Warp; infinite zoom; global 12 fps
- [4. Kaleidoscopes and radiating shapes](#4-kaleidoscopes-and-radiating-shapes)
  - Radio Waves plus CC Kaleida; Mosaic plus Twirl pattern
- [5. Transitions](#5-transitions)
  - Fractal noise dissolve; shape-matte wipes (silhouette, spiral, feathered mask); cyberpunk glitch; luminance-slice glitch; noise-mapped lens blur
- [6. Kinetic type and text animators](#6-kinetic-type-and-text-animators)
  - Entrance recipe; text out of a line; tracking; outline plus gradient; linked text; random-letter fade; typewriter; write-on; Roughen Edges boil; per-letter bounce and quick tools; Loki font shuffle; Loki glow stack; brush reveal; text over busy footage; title kit look
- [7. Putting graphics into footage](#7-putting-graphics-into-footage)
  - Camera track; match the plate; reflections; multiply onto a wall; ink under skin; growth-matte title; cinematic title stack; gradient map (CC Toner); small effects; EbSynth and tracker repair; project hygiene
- [Licences, paid items and dropped material](#licences-paid-items-and-dropped-material)

## How to read an entry

Each entry: what it makes, AE steps, principle, free routes, use-when or pitfall, source link(s), and a short Check line (`verified` means a frame showed the values; `heard` means narration only; prefer verified values when two videos differ).

## Currency notes

- AE 2022 and later show Transform and layer settings in the Properties panel as well as the timeline; the shortcuts (P, S, R, U, E E) still work. Roto Brush is now version 3 and Content-Aware Fill exists; these entries do not rely on them.
- Camera tracking: the 3D Camera Tracker effect (Effect > Perspective) is also reachable from the Tracker panel as "Track Camera". Same solver.
- CC Toner, CC Plastic, CC Ball Action, CC Particle World, CC Drizzle and CC Rainfall are older built-in plug-ins; they shipped in AE 2023 and were not rechecked later. Each has a free route below.
- Mocha AE ships with AE. Fusion's Camera Tracker node is Studio-only in DaVinci Resolve; the free Resolve has the Planar Tracker and Tracker nodes. Blender's Movie Clip Editor is the free camera-solve route.
- Deep Glow, Autofill and similar are third-party plug-ins; treat as ideas, use Glow (built in) stacked at three radii instead.

## 1. Mattes

### Track mattes: alpha, luma and inverted
- Makes: one layer's shape or brightness decides what shows of the layer below.
- AE: put the matte layer directly above; on the lower layer use the TrkMat column (toggle the Transfer Modes pane with the bottom-left button): Alpha Matte, Alpha Inverted, Luma Matte, Luma Inverted. The matte hides itself; turn its eye back on if you want it visible. To make the footage follow the matte, parent it with the pickwhip. Only one matte per layer; pre-compose to stack more. Luma Inverted with a scan or texture above type cuts the texture's whites out of the type (Roughen Edges boil, see 6). Add Curves on a luma matte to change the reveal; bleeding-ink footage as Luma Inverted gives an ink reveal.
- Principle: alpha = transparency decides; luma = brightness decides.
- Free: Fusion: Merge with Operator In or Held Out, or a Matte Control (node settings untested). Blender: Set Alpha, or Mix (Multiply) with the matte's alpha or luminance. Web: CSS `mask-image` with `mask-mode: alpha` or `luminance`.
- Pitfall: matte layers of a different size stretch; see Set Matte.
- Check: verified [matte_damon over rainforest footage, TrkMat menu].

### Set Matte (matte layer anywhere in the stack)
- Makes: a matte that does not need layer order, and can be combined with other effects.
- AE: Effect > Channel > Set Matte on the target. Take Matte From Layer = the matte; source dropdown Source, Masks or Effects & Masks; Use For Matte = Alpha Channel (or Luma); Invert Matte for the opposite; untick Stretch Matte to Fit when sizes differ. Turn Continuously Rasterize on for vector or shape layers on both sides, and Collapse Transformations on a matte pre-comp, or position will not follow. Hidden matte copy trick: duplicate the board, extend it, hide it and point Set Matte at the copy, so a bird can rise out of a skateboard and stick out above it; a stroke-only copy on top restores the outline.
- Principle: one hidden copy lets one object mask another without touching the art.
- Free: Fusion Matte Control or Channel Booleans (untested). Blender Set Alpha. Web: SVG `<clipPath>` or `mask`.
- Check: verified [Set Matte panel and stacks at several frames].

### Stencil Alpha, Silhouette Alpha and Preserve Underlying Transparency
- Makes: one layer that cuts or restricts everything below it, not one layer.
- AE: Stencil Alpha (bottom of the blend-mode list) keeps only what lies under the layer's opaque pixels; Silhouette Alpha is the inverse (used to punch holes in smoke, see 2). Stencil Luma cuts by brightness (used for the noise dissolve). Preserve Underlying Transparency (Switches column) makes a layer paint only where the layers beneath are opaque, like a Photoshop clipping mask; use it for shading, grain and texture that must stay inside a shape. Replace a layer but keep its effects: Alt-drag the new item from the Project panel onto it.
- Principle: a mask that acts on the whole stack replaces many per-layer track mattes.
- Free: Fusion: Merge Operator Atop (preserve transparency) or In (stencil). Blender: Alpha Over plus Set Alpha. Web: CSS `mask-composite: intersect`, canvas `globalCompositeOperation = "source-atop"` or `destination-in`.
- Check: verified (Stencil Alpha on an eye layer, switch column icon); pumpkin example heard.

### Footage or art inside text; text revealed by a shape
- Makes: video shows only inside bold letters, or lines slide in through a shape.
- AE: duplicate the footage; top copy above the text layer with TrkMat = Alpha Matte of the text, trimmed to start at frame 12; bottom copy ends at frame 12. Keep the text huge and bold (about 450 px). Add a white solid below (the comp background colour does not render; the checkerboard shows real transparency). For poster text: two lines animate by position, each with a shape layer as Alpha Matte; Scale Y on top and bottom lines.
- Principle: the matte is the letter shape; make it large so the picture reads.
- Free: Web `background-clip: text` over video; SVG `mask`. Fusion: Text+ into a Matte Control (untested). Blender: Alpha Convert plus Mix.
- Check: verified (matte layer stack); poster heard.

## 2. Goo, smoke, fire, liquid, lava, rain

### Blur plus alpha Levels (goo) smoke from plumes
- Makes: round, merged cartoon smoke, steam or clouds from shape layers.
- AE: narrow pillar; plumes (not perfect circles) animate Position and Scale up it, path bent with Convert Vertex, trimmed at 14 s (Alt+]), duplicated and offset about 2 s with varied shapes. Comp 20 s: first 10 s build up, 10 to 18 s is the loop; select everything, Ctrl+D, move 8 s and 16 s later. On the pre-comp: Gaussian Blur 100, then Levels with Channel = Alpha, drag the outer triangles to the middle (frame values: Input Black 114, Input White 119, Output White 255; leave a tiny gap to avoid aliasing). Make the pre-comp larger than the comp so the blur does not eat the top edge. Holes ("armpits"): shape layers parented to their plume, blend Silhouette Alpha, scale about 50% to 150% over life, four copies. Stroke: duplicate the comp, Vegas (Generate): Stroke Image Contours, Segments 32, Length 1.0, Rendering Transparent; lower the bottom copy's opacity. Finish with an adjustment layer Posterize Time 12. The same comp works as a matte for a blur adjustment layer.
- Principle: blur then threshold the alpha merges shapes into blobs (more blur, rounder); subtract holes where smoke pulls away to keep volume.
- Free: SVG goo filter: `feGaussianBlur` then `feColorMatrix` values `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9` (CSS goo uses the same). Proved 2026-11-07: `stdDeviation` 22 on 40 to 90 px ellipses merged them into one hard-edged plume like Ben's frame; set the filter box to `x=-50% y=-50% width=200% height=200%` and `color-interpolation-filters=sRGB`. Blender compositor: Blur then Color Ramp on alpha. Fusion: Blur plus Color Curves or Threshold on alpha (untested).
- Pitfall: crushing Levels fully aliases; clouds poke at the top edge.
- Check: verified [Blur 100 and Levels, Hole layers on Silhouette Alpha].

### Cartoon smoke and explosion, fully procedural
- Makes: puffy explosion in black, orange and yellow-orange layers.
- AE: two circles (white over black) in a pre-comp "Cloud 1"; duplicate many times in the main comp, rotate and scale, anchor at one corner so they grow from one point; Cloud 2 (slower copy) replaces about half via Alt-drag. Adjustment layer: Extract (Luminance, Black Point 92, White 255, softness 0) removes the black; Turbulent Displace Amount 50, Size 13, Evolution `time*200`. Break-up: solid with Fractal Noise (Contrast 180, Scale 30 to 40), Preserve Underlying Transparency, Multiply, opacity 100 to 0 (Extract also cuts black below it). Smooth: Gaussian Blur 10, Levels on Alpha with Input Black raised (about 123 / 178) for rounded edges, Fill white. Pre-comp "Explosion"; Fill black for the outer smoke; duplicate in orange and yellow-orange with Time Remapping so the inner layers lag; Posterize Time 12 on a layer above (not inside the time-remapped comp).
- Principle: build a clean silhouette, distress with noise, then blur and crunch alpha for smooth hand-cut edges; colours are time-offset copies of one silhouette.
- Free: SVG chain `feTurbulence` > `feDisplacementMap` > `feGaussianBlur` > `feComponentTransfer` (alpha threshold). Blender compositor: Displace (Noise), Blur, Color Ramp. Fusion: Displace with FastNoise, Time Stretcher for offsets (untested).
- Check: verified [Extract Black Point 92, Turbulent Displace, Fill orange, Posterize Time 12]. The first step ("two circles as above") refers to a shape-layer setup from the same video.

### Fire, splash and hand-drawn smoke (frame by frame)
- Makes: stylised flame, water crown, smoke cloud.
- AE: fire three ways: (1) four drawings on separate shape layers, (2) one shape layer with Path keys changed a little each time, then Toggle Hold Keyframes, (3) draw once and add Wiggle Paths plus Posterize Time. A wobbly-curve flame is better drawn in a drawing app with the wave travelling up so four frames loop; AE can only imitate it with a tapered stroke and Wave Warp. Splash crown: spiky shape, Path keyed every 2 frames for four poses, pasted to loop, Simple Choker to round it, second splash offset so copies do not look cloned. Smoke X logo: animate main circles for timing, split into more circles for the mass, a second pass fills gaps, a third adds shadows, tint slightly purple, highlights move up frame by frame.
- Principle: a few random but limited poses read as fire or splash; offset duplicates.
- Free: Blender Grease Pencil frames on twos; web: SVG path array stepped at 12 fps; Remotion `Math.floor(frame/2)` pose index.
- Check: verified [wiggle values; 12 Path keys at 2-frame spacing; look frame]; smoke process heard.

### Liquid level reveal with Set Matte and Wave Warp
- Makes: liquid draining and refilling, driving several layers and bubbles from one matte.
- AE: rectangle "Liquid Matte" with a mask covering all but the top; Mask Path full at start, empty by about 12 frames, held half a second, full again about a second later, handles loosened in the Graph Editor. On each revealed layer: Set Matte (Take Matte From Layer = Liquid Matte, Use For Matte = Effects & Masks); Invert Matte for the layer that shows only when the liquid is gone. Continuously Rasterize on. On the matte: Wave Warp Sine, Height 20, Width 300, Direction 90, Speed 1; a duplicate raised with Speed -1. Bubbles: white stroke ellipse snaking up with Wiggle Paths, two variants offset many times, then matted by the same Liquid Matte. Bottom refill by an ellipse mask; opacity keys with Toggle Hold Keyframes. Turbulent Displace Amount 27.3, Size 55.6 so draining is not a perfect arc. Seamless bubble loop: at the work-area end split with Ctrl+Shift+D and drag the back half to the start. Posterize Time 12 on top.
- Principle: one animated matte drives every dependent layer; hold keys hide mask flaws.
- Free: Fusion: one animated mask wired as EffectMask or Matte Control into each layer; Ripple or Wave node. Blender: compositor Set Alpha with a Displace wave. Web: CSS `mask-image` with animated clip-path and `steps(12)`.
- Pitfall: Set Matte needs both layers continuously rasterized; puppet pins changed in 2023, shape-layer rigs are the long-term route.
- Check: verified [layer stack, Liquid Matte keys, Wave Warp, Turbulent Displace 27.3 / 55.6].

### 2D water ripple (Ripple effect plus mattes)
- Makes: a splash into a flat water line, an object rising through it.
- AE: rectangle shape named WATER, no fill, white 2 px stroke. Effect > Distort > Ripple: Radius keyed 0 to about 40, Type of Conversion Asymmetric, Wave Speed 3.0, Wave Width 60, Wave Height about 75 (heard) keyed to 0 later with Easy Ease so the waves fade. Move Center of Ripple far away for a clean sine without end kinks. Duplicate WATER with a Fill, rename "WATER Matte", above the object with Alpha Inverted (emerging); duplicate both with Alpha Matte for the underwater part, scaled 105% for refraction.
- Principle: warp a shape's edge, drive amplitude with one decaying key, reuse the shape as the matte. Use a rectangle, not a line, so it can be a matte.
- Free: Fusion Displace with a sine gradient. Blender Wave texture or modifier. Web: SVG `feTurbulence` plus `feDisplacementMap`, or a canvas path with decaying `sin` amplitude (untested).
- Check: verified [Ripple panel Radius 40, Asymmetric, Speed 3.0, Width 60]; Wave Height 75 heard.

### Lava: Fractal Noise base, colour and relief, melting text
- Makes: a boiling lava surface, its crust relief, and live type that melts with it.
- AE base: solid "Lava"; Fractal Noise: Fractal Type Smeary, Noise Type Soft Linear, Invert on, Contrast 130, Scale 250, Complexity 6, Overflow Allow HDR Results. Evolution expression `posterizeTime(12),time*30` (24 fps comp: boil at half rate while the mass drifts smoothly). Offset Turbulence 960,540 to 960,1080 over 10 s so it flows down. Curves darken with a small highlight tail. Colour: adjustment layer; CC Toner Tritone (Highlights FFDB00, Midtones red, Shadows black); CC Plastic: Ambient 75, Diffuse 25, Dust 25, Specular 0, Roughness 0.025, Metal 100; second CC Plastic with Surface Bump > Bump Layer = the adjustment layer (Luminance, Softness about 2, Height 25), Light Intensity 100 to 60 (heard). Text: Fill black, Roughen Edges, Displacement Map from the lava (Red horizontal 52, Green vertical 33, Center Map, Expand Output), Compound Blur (Maximum Blur 150, blur layer = lava), a copy of the Fractal Noise with Invert off, mode Screen.
- Principle: two clocks (smooth drift plus stuttered boil); map luminance to colour first, then bump-map the same luminance for relief; one map drives both distortion and blur.
- Free: Blender: Noise Texture 4D with W from a stepped `frame` (Math Floor of frame/2), Color Ramp black-red-yellow into Emission, same noise into Bump; compositor Displace and Variable Blur. SVG: `feTurbulence` with stepped `seed`, `feColorMatrix`, `feDiffuseLighting` relief. Fusion: Fast Noise with Seethe (untested). Noise type changes the look entirely (Rocky, Subscale, Terrain, Swirly were tried).
- Check: verified [noise settings, posterizeTime expression, CC Toner FFDB00, CC Plastic values, text effect stack].

### Rain: CC Rainfall, CC Drizzle plus Threshold, ripple-warped text, painted drop
- Makes: four levels of rain from a quick built-in to a stylised two-tone ripple field and a soft painted drop.
- Level 1, CC Rainfall (heard values): on a black solid raise Opacity and Size, Influence 0, fewer Drops, mode Screen over a gradient; Speed keyed 15000 to about 150 over 2 s (speed sets fall rate and streak length; slow shows circles); Spread 6 to 0 for straight rain; Scene Depth up; Extras > Ground Level hides drops at the ground. Splash: ellipse animating Size (not Scale, so stroke width stays), faded.
- Level 2, CC Drizzle plus Threshold (verified): grey solid about 3x comp height; Drip Rate 8, Longevity 1.00, Rippling 1x, Displacement 20, Ripple Height 100, Spreading 100; Shading Ambient 15, Diffuse 100, Specular 100, Roughness 0.015, Metal 100; Scale 100,40% for a low viewing angle; light Distant changed to Point, centred. Adjustment layer: Threshold, Tint (black to dark grey, white to pure blue), Gaussian Blur, glow, Transform wiggle, Posterize Time 12, Noise HLS Auto. Raindrops: pen line with three hold keys on Path, mode Difference.
- Level 2.5, ripple-warped text (verified): Displacement Map on the text, map layer = the drizzle comp (Effects & Masks), Red horizontal 165, Green vertical 25, Center Map, Wrap off, Expand Output on. Fixes: Distant light instead of Point, pre-compose the drizzle with Move All Attributes so the squash is baked in, make the background exactly 50% grey (no movement).
- Level 3, painted raindrop (heard recipe, verified look): everything in greyscale and toned last; ripple ellipse with Size and Stroke Width keys, Gaussian plus Directional Blur, feathered half-masks for highlights, dark shading copies with Preserve Underlying Transparency, a drop that bounces three times parented to a squash and stretch null, final Noise HLS Auto and CC Toner; optional strobe via a Curves adjustment layer with looped opacity 100 to 0 to 100.
- Principle: threshold turns a shaded 3D ripple into a bold two-tone graphic; a displacement map moves pixels by brightness, 50% grey means no move.
- Free: Blender: particle or Geometry Nodes line instances with motion blur; compositor Color Ramp (constant) for threshold, Glare (Fog Glow), Displace with 0.5-grey neutral map. Web: canvas lines with random depth and speed proportional to size; shader with concentric `sin` rings and a `step()`; SVG `feDisplacementMap` (R to X, G to Y, scale). Fusion: pEmitter with Streaks, Displace plus Threshold (untested).
- Check: verified [preset search, Drizzle values, displacement values, finished chili]; Level 1 numbers and Level 3 steps heard.

### Shooting star, twinkling stars and a particle stream
- Makes: a streak across the sky, stars that fade at different times, a pulsing stream.
- AE: shooting star: straight line on a shape layer, mask grown then shrunk, two Roughen Edges for texture. Twinkle: solid with Fractal Noise (Basic, Soft Linear, Contrast 750, Brightness 0, Complexity 5, Allow HDR Results, Evolution keyed) used as a Luma matte on the star layer set to Screen. Stream: CC Particle World with Physics Animation Directional Axis, smallest producer radius, high gravity and resistance, low Extra; animate Producer Position X and Y to follow the source so it pulses (final numbers not given), Simple Choker to smooth.
- Principle: a high-contrast animated noise field is a random on/off per pixel, usable as a matte for any flicker; animate the emitter, not the particles.
- Free: SVG `feTurbulence` plus `feComponentTransfer` for a hard-contrast mask; Blender Noise Texture plus Color Ramp as alpha, or an emitter with an animated position; Fusion FastNoise plus Threshold into a Matte Control (untested).
- Check: verified [Fractal Noise panel and Luma matte column; Particle World panel]; stream settings heard.

## 3. Loops

### 3D grid tunnel loop from shape layers
- Makes: a spinning tunnel of squares, seamless.
- AE: Rectangle Path square with stroke and no fill, Size animated 0 to past the frame with an intense Graph Editor curve; duplicate, offset, layer marker (numpad *) on layer one at the spacing, trim with Alt+], shift-drag until layers snap to the marker; select all, Ctrl+D, Ctrl+Shift+] to the top, repeat; B and N set the loop work area (three seconds). Lines: pen line corner to corner, Repeater Copies 7, Rotation 45. Black square at centre. Null at centre, parent all, Rotation 90 over the loop. A simple grid with no loop is one Repeater on scale (strokes scale too).
- Principle: offset duplicates of one eased animation make seamless endless motion; the marker keeps spacing even.
- Free: Remotion `frame % period` with N rectangles offset in time; Blender Geometry Nodes instances with scale from `(frame + index) % period`; Fusion Duplicate or Replicate3D (untested).
- Pitfall: a spiral of filled segments breaks the loop; re-find the loop frames after changing rotation.
- Check: verified [Repeater 7 copies and rotation 45, Null master].

### Looped boil drawings and a posterized project
- Makes: a 3 to 4 drawing boil repeated for the whole comp, and one rhythm for all motion.
- AE: quick way: duplicate the four frames, Ctrl+Shift+] to top, drag into sequence. Tidy: shrink the work area, Trim Comp to Work Area, in the parent Time > Enable Time Remapping, keep a key on the frame before last, delete the last key, Alt-click the stopwatch and set `loopOut("cycle")`. Without deleting the last key it holds forever. Global: adjustment layer Effect > Time > Posterize Time 12 (24 fps) or 12.5 (25 fps), under the light texture and over everything else; Ctrl+K lowers the comp rate early for lighter renders. A hand-drawn intro finishes the same way: grit textures, boil, subtle shake (Transform Position 960.3, 540.5, Scale 101, Shutter Angle 0), comp at 12 fps.
- Principle: keyframed motion next to choppy art looks wrong; match twos or threes everywhere.
- Free: Remotion `frame % boilFrames`, `Math.floor(frame/2)*2`; CSS `steps(4)` sprites; ffmpeg `fps=12` then `fps=24`; Blender NLA strip repeat or F-curve Cycles modifier; Fusion Loop node.
- Check: verified [Time Remap expression, Posterize Time 6.0 and 12.5].

### Bricklayer repeat row warped into a cylinder
- Makes: rows of icons scrolling forever, bent like they wrap a drum.
- AE: one icon comp, a "Camera Row" comp, a "Camera Repeat" comp with 10 rows parented to one parent, spaced with Align distribute, every other row shifted half a cell. Key Position on the parent: a ruler marker at the left edge where one icon starts, final key where the next icon aligns, drag the last key back one frame so the loop point does not repeat. Make the comp far larger than the main comp. Adjustment layer "WARP": Bezier Warp, bend top and bottom handles into an arc.
- Principle: a seamless scroll is exactly one cell of travel; the arc fakes a cylinder cheaply.
- Free: Blender: real cylinder with a repeating texture offset by an F-curve Cycles modifier. Web: CSS `background-position` animation with `perspective` rotateX on a parent; Remotion `% cellWidth`. Fusion Tile plus Bender (untested).
- Check: verified [Camera Repeat comp, 10 rows, WARP layer, Position key].

### Infinite zoom (two nested copies, master null)
- Makes: a zoom that never ends, with an invisible loop point.
- AE: Illustrator art as a comp in a 1920x1920 comp. Null "Master Scale" at the zoom target, parent the art. Scale 100 to about 5900-6000% at about 2.5 s; work area to that point (N); Continuously Rasterize on; both keys > Keyframe Assistant > Exponential Scale. Duplicate the comp, clear its parent, go to the end of the work area and parent it back to Master Scale so it matches exactly; the lower copy is exactly one zoom cycle behind in time (layer marker at the work-area end slid to the start; 2 s offset, 2.5 s lead). Hide the pop-in with a reveal mask (feather 131 px) inside the art comp. Finish: grain in Dissolve mode, Turbulent Displace (Amount 30, Size 2), looping paper texture, Posterize Time 12, nest in a 1080 comp.
- Principle: two copies at a ratio equal to the zoom factor and exponential scale; the inner copy runs a full cycle behind.
- Free: Remotion/three.js: scale two stacked copies with `Math.exp`, show the second at `(t + cycle) % cycle`; Blender: camera dolly on an exponential curve through nested instances; Fusion Transform with an expression (untested).
- Pitfall: nested vector comps blur at 6000% unless Continuously Rasterize is on.
- Check: verified [Master Scale null, two keyframes, mask feather].

## 4. Kaleidoscopes and radiating shapes

### Radio Waves plus CC Kaleida
- Makes: endless psychedelic loops from two effects and almost no keys.
- AE: solid (1920x1920, 24 fps, 10 s). Effect > Generate > Radio Waves: Wave Type Polygon (Sides 9, tick Star, tune Star Depth and Curve Size) or Mask (radiates a drawn shape). Wave Motion: Frequency 1.6, Expansion 5, Spin 3, Lifespan 10 s. Stroke: Profile Square, Fade-in 6.2, Fade-out 5, different Start and End Width for a taper. Drag the layer start left so shapes fill the frame at time 0. Key Spin -3 to 3, Star Depth -0.2 to -0.51, Curve Size 0 to 1.0. "Parameters are set at": Birth (only new rings change) or Each Frame (all change; used here). Then Effect > Stylize > CC Kaleida: Size 20 at Mirroring Flower, Size 75 at Starlish, Center keyed with 3 keys. Stack two copies with different keys and colour; optional Ripple.
- Principle: a generator of expanding outlines plus a mirror fold gives complex motion from few parameters.
- Correction: the auto transcript says "CC Collider"; the effect on screen is CC Kaleida.
- Free: web shader: draw concentric polygons with time offset, then fold the angle `a = abs(mod(a, TAU/n) - TAU/(2n))`. Blender: Geometry Nodes spawning scaled rings, kaleidoscope by polar coordinates in the shader or compositor. Fusion: repeated Polygon/Ellipse with Transform feedback (untested).
- Pitfall: too many layers turn to noise; a seamless loop needs Lifespan = comp length.
- Check: verified [Radio Waves defaults, Kaleida Flower and Starlish with keys].

### Mosaic and Twirl pattern (noise into blocks, five-colour toner)
- Makes: a warping coloured pixel pattern from one solid, a background.
- AE (order: Fractal Noise, Mosaic, CC Toner, Twirl, on a 3840x2160 solid): Fractal Noise Contrast 150, Scale 300, Complexity 3, Evolution `time*400` (800 = twice as fast). Mosaic Horizontal Blocks 50, Vertical Blocks 8, Sharp Colors on. CC Toner Pentone with five colours eyedropped from a palette PNG, Blend w. Original 0%. Twirl Angle 50 to 250, Radius 38 (heard); duplicate the layer and delete Twirl on the lower copy to fill the peeled edge. Slow push-in with Scale 50 to 100%.
- Principle: noise sampled into blocks is a random cell pattern; toning maps grays to the palette; twirl bends it with one number. A looser variant: Fractal Noise, Mosaic 8x1, Sharp Colors, driven as a column selector (see Loki shuffle).
- Free: web shader `floor(uv*vec2(50,8))`, noise, `palette[int(n*5)]`, polar rotation `angle = k*(1-r/radius)`. Blender: Noise (4D) into Pixelate or Math Floor quantise into a 5-stop constant Color Ramp; Twirl needs a vector Warp, untested. Fusion: FastNoise > Pixelate > gradient map > Vortex (untested).
- Check: verified [Contrast 150, Scale 300, Complexity 3, Evolution, Mosaic, Pentone]; Twirl values heard.

## 5. Transitions

### Fractal noise dissolve
- Makes: soft clouds that cut a hole in everything underneath.
- AE: black solid; Effect > Noise & Grain > Fractal Noise: Fractal Type Basic, Noise Type Soft Linear, Contrast 464 (about 500), Scale 155, Brightness animated from near white to about -1.7; blend mode Stencil Luma on the solid cuts through all layers below.
- Principle: an animated threshold (contrast plus brightness) turns smooth noise into an organic dissolve mask.
- Free: Fusion FastNoise plus an animated Threshold into a Merge mask; Blender Noise Texture plus Color Ramp (animate the stop) into Alpha Over; web SVG `feTurbulence` plus `feComponentTransfer` threshold as a mask.
- Check: verified [Contrast 464, Soft Linear, solid name].

### Shape-matte wipes: silhouette, spiral and soft feathered mask
- Makes: the next shot revealed through a moving shape.
- AE: Silhouette: duplicate a spinning character pre-comp over the next comp, scale 100% to about 20%, set the next comp's Track Matte to Alpha Matte of it, black background so values contrast; split the layer and remove the matte at the start so no holes show; Liquify (Effect > Distort) pushing the shape the way the next shot enters, applied only on the last two frames (slow render); slide-in by a few position keys; a feathered mask path wipes top to bottom. Spiral: footage under a growing spiral layer (stroke width 252.7, tapers 0.2) with Alpha Matte; the footage must start under the spiral before it grows. Soft wipe: ellipse mask, Mask Feather 100 px, Mask Path keyed 7 times left to right and back, trimmed with Alt+[ and Alt+]. Mask-path reveals use Easy Ease on two keys at 12 frames.
- Principle: tie transition direction to the next shot's motion; limit expensive effects to the frames that need them. A match cut tied to motion is the one tasteful default ("a cut is fine in any context").
- Free: web CSS `mask-image` with animated `mask-size` or `mask-position`, SVG `<mask>` with an animated spiral path; Blender compositor Set Alpha or Alpha Over; Fusion Merge with the shape as mask (untested). A glow Threshold animated over time as a light wipe was only suggested, not built (heard).
- Check: verified [Baby Spin scale keys and Alpha matte, spiral values, Mask Feather 100]; match-cut and glow idea heard.

### Cyberpunk glitch transition (block noise displacement)
- Makes: text or any layer glitches out, cuts, glitches back in as coloured LED pixels.
- AE: pre-comp "Text". Solid with Fractal Noise, pre-composed as "Fractal Noise Comp": Noise Type Block, Contrast 400, Uniform Scaling off, Scale Width 600, Height 50, Complexity 6, Evolution `time*500`. On the text: Displacement Map (layer = Fractal Noise Comp, hidden; Red horizontal, Green vertical, Center Map, Expand Output on); key Max Horizontal 0 at about 1 s up to 500 at the start (a spike to about 200 before the end), vertical only 0 to 35 and back; layer markers (numpad *) on the cuts with about 150 horizontal keyed there to hide the change. CC Ball Action (Ball Size about 55, Grid Spacing 0, the default is 5) for LED pixels, Posterize Time 12, Glow (threshold 20%, Radius 3, Intensity 0.5, heard) plus three duplicates at larger radii (12, ...) and lower intensity (0.3, ...). Constant life: the noise comp at 50% opacity inside the text comp with Preserve Underlying Transparency. Glitch in from nothing: Simple Choker, Choke Matte high to 0 over 1 s. Colour: Colorama on top of the stack (above the glows, or colours go wrong), Input Phase Get Phase From = Fractal Noise Comp, Add Mode Wrap, cycle palette. Variants: Gaussian Blur 15 on the noise for curvy analogue glitches; Noise 10% for granular ones; VHS overlay screened.
- Principle: one chaotic grayscale field drives displacement and colour; keying its maximum is the only authored curve (big, settle, kick).
- Free: SVG `feTurbulence` (`baseFrequency="0.001 0.1"`) into `feDisplacementMap` with an animated `scale`; LED grid with a radial-gradient mask at `background-size: 4px 4px`; canvas sliced bands offset in x. Blender compositor: stretched Noise or Checker texture into Displace, stacked Glare nodes, Color Ramp. Fusion: FastNoise (Block) into Displace, stacked Glow (node settings untested).
- Pitfall: keep vertical displacement small.
- Check: verified [Block noise values, Displacement Map settings, effect stack, Colorama Get Phase]; Glow values and Grid Spacing 0 heard.

### Luminance-slice glitch (Extract, Difference, Colorama)
- Makes: a thin band of footage, selected by brightness, sliding through the tonal range and recoloured.
- AE: pre-comp the footage, duplicate; top copy gets Extract (Channel Luminance; the histogram bar between Black and White Point is the slice shown), Black and White Point both keyed 0 to 250 over about 4 s with offset keys, Easy Ease; then Invert, Hue/Saturation (Master Hue +180, Saturation 71), Colorama preset Horizon, blend mode Difference. A second copy offset in time and scaled 100 to 200% adds a ghost; try Exclusion, Subtract, Divide too.
- Principle: a moving luminance slice, inverted, recoloured and difference-blended against the original.
- Free: Blender compositor: Greater Than and Less Than on a Separate Color Value for the slice, Hue Saturation Value, Mix (Difference). Fusion: Luma Keyer, Color Gradient, Merge Difference (untested). Web: canvas luma threshold, `mix-blend-mode: difference`.
- Check: verified [Extract 93 to 166, Hue 180, Sat 71, Colorama Horizon, three-layer stack].

### Noise-mapped lens blur (patchy defocus)
- Makes: patchy defocus so a glitch or title looks shot in camera.
- AE: adjustment layer: Gaussian Blur 5 (Repeat Edge Pixels on), Noise 10% (color noise on), optional Tint, then Camera Lens Blur: Blur Radius 5 to 10, Iris Shape Hexagon, Blur Map Layer = a hidden solid with Fractal Noise (Basic, Soft Linear, Complexity 2, Contrast 100 to 150, Scale 400, Evolution `time*100`), Channel Luminance, Center Map, Repeat Edge Pixels on. White = blurred, black = sharp.
- Principle: a grayscale map decides where blur is strong.
- Free: Blender Defocus or Bokeh Blur with a Z input from a Noise Texture; web layered CSS `filter: blur` with an animated noise `mask-image`; Fusion Lens Blur or Variable Blur with a noise map (untested).
- Pitfall: very slow in AE; keep noise complexity low.
- Check: verified [blur map settings, Camera Lens Blur settings].

## 6. Kinetic type and text animators

### Entrance: position, opacity, colour and blur
- Makes: the title entrance that fits most client work.
- AE: Position a small offset up or down, Opacity 0 to 100, both with F9 and a steep Graph Editor curve. Fill effect keyed red to white, a little shorter than the animation. Gaussian Blur 20 to 0. A barely visible red flash adds a premium moment unnoticed.
- Free: Fusion Text+ with an animated Color Corrector and Blur; CSS `filter: blur()` plus colour transitions; Remotion `interpolate`.
- Check: heard (colour and blur values); position graph seen.

### Text coming out of a line
- AE: white 2 px line with Trim Paths; draw outward from the middle: Start 0, End 100 at the end; both 50 at the start. Rectangle "Matte" above the text, bottom aligned to the line, text TrkMat Alpha Matte; nudge the matte down 1 px to close the gap; for the line below duplicate text and matte with Alpha Inverted. Start the text once enough line is drawn.
- Principle: the mask stays at the rest position while the text moves behind it.
- Free: CSS `clip-path: inset(...)` or an overflow-hidden wrapper plus transform; SVG `stroke-dashoffset` for the line.
- Check: verified [line, Matte, TrkMat column].

### Animated tracking (letter spacing grows)
- AE: Character panel Tracking 600; Text > Animate > Tracking, Tracking Amount 0 at start to 30 to 40 about five seconds later (stacks on the panel value); opacity fades in over a second. Franklin Gothic at 120 px in a crime title. Wide spacing that keeps widening reads as serious and slow; keep the delta small.
- Free: CSS `letter-spacing` keyframes; Remotion `interpolate` on `letterSpacing`; Fusion Text+ spacing keys; Blender Text has no per-frame tracking (use per-letter objects or Geometry Nodes, untested).
- Check: verified [Tracking 600, animator keys, Franklin Gothic].

### Thin outline with a rising translucent fill
- AE: stroke-only type 2 pt (1 to 4); duplicate with white fill at about 35%; rectangle mask on the lower half, Mask Feather about 400 (384 in frame), Mask Path keyed so the gradient rises.
- Free: CSS `-webkit-text-stroke` plus `mask-image: linear-gradient(...)`; Fusion soft Polygon mask.
- Pitfall: thick strokes distort glyph corners.
- Check: verified [Mask feather 384].

### Linked text (Source Text pickwhip)
- AE: on the lower layer, Text > Source Text, Alt-click the stopwatch and pickwhip to the top layer's Source Text (`text.sourceText`). Create Shapes from Text (right-click) for editable letter shapes; the Decompose Text script splits by word or character.
- Free: Fusion Text+ StyledText connect; a single variable in code. Blender text drivers are limited (untested).
- Check: verified [expression text]; the shape and script tips heard.

### Random-letter fade with a Range Selector animator
- AE: Text > Animate > Opacity 0%; Range Selector Start 100% to 0% over about 10 frames (frame shows Start 60%); Advanced > Randomize Order On; F9 on the end key; copy the animator to the second word and change Random Seed. Tracking 500, Roboto Medium; parent both words to the centre symbol and key Scale 100 to 104.
- Principle: the selector range says which letters are affected; animating it staggers the entrance.
- Free: per-letter spans with a seeded random delay in Remotion; Fusion Follower; Blender Geometry Nodes with a random per-instance threshold.
- Check: verified [Animator 1, Range Selector, Tracking 500].

### Natural typewriter (burst timing)
- AE: Effects & Presets > Animation Presets > Text > Animate In > Typewriter; drag the Range Selector Start keys; add keys with small positive and negative jumps for bursts and pauses; word by word: key Start at each word boundary, select, Toggle Hold Keyframe. Out from centre: key text Position, the left edge at screen centre at the start, F9 on both.
- Principle: humans type irregularly; irregular key timing is the trick.
- Free: Remotion `text.slice(0, n)` with `n` from an array of frame offsets; CSS `steps()` (uniform, use JS for bursts); Blender Text `body` driver.
- Check: verified [keys only, not exact percentages].

### Write-on text with the Stroke effect and masks
- AE: Effect > Generate > Stroke on the type layer; each pen stroke is its own mask (7 for the sample; Brush Size 2, Hardness 79%, Spacing 15%); Path = All Masks with Stroke Sequentially on; raise Brush Size until it covers the glyphs (about 12); key End 0 to 100 with Easy Ease; Paint Style = Reveal Original Image, so the stroke is the matte. Fix a stroke spoiling the next line by adding a point to the mask and bending it away. Works best with even-weight brush fonts.
- Principle: a thick invisible stroke follows the pen path and reveals the hidden artwork.
- Free: SVG `<mask>` with a thick path and `stroke-dashoffset` (the reliable route); Blender Grease Pencil Build modifier or Geometry Nodes Trim Curve; Fusion Paint stroke animation (untested).
- Pitfall: crossing strokes leak a spoiler without an extra matte.
- Check: verified [mask list and Stroke values].

### Rough, boiling type (Roughen Edges)
- AE: Effect > Stylize > Roughen Edges: Edge Type Roughen, Border 8 down to 4, Edge Sharpness 1, Fractal Influence 1, Scale 100, Complexity 2; Alt-click Evolution Options > Random Seed, `time*4` (new seed every 6th frame at 24 fps); a second instance Border 2, Scale 20 for fine noise. A scan above with the type's matte set to Luma Inverted cuts the texture out of the letters. Slow on large type.
- Free: SVG `feTurbulence` plus `feDisplacementMap` on text with a stepped `seed`; Blender Displace with a Noise whose W steps every few frames; Fusion Fast Noise > Displace plus Erode/Dilate.
- Check: verified [Border 4, Sharpness, Fractal Influence, Scale, Complexity].

### Per-letter bounce, TextEvo and quick tools
- AE: Illustrator letters on separate layers, anchors dragged to the baseline; Position (Separate Dimensions, Y only) with three keys: rest at about 1 s, an earlier key at the same value, start below by the letter height; Graph Editor value curve so the letter overshoots; copy keys to all letters, drag layers 2 frames apart left and right alternating; the i-dot later, higher, with Rotation 90. A colour flash by Fill keyed dark to light green to dark. TextEvo (aescripts) gives one-click per line, word or letter position and opacity in/out; all your text animations start to look alike. Type Array applies delays or markers to characters.
- Free: Remotion spans with `animation-delay: calc(var(--i) * 83ms)` at 24 fps; Fusion Text+ Follower (delay 2 frames); Blender Geometry Nodes Instance on Points per character with an index time offset.
- Check: heard (timeline not on a frame); plug-in docked panels verified.

### Loki font shuffle (luminance as a time index)
- Makes: a title that cycles random typefaces and settles, editable by changing the master letters.
- AE: comp 1920x1080, 24 fps, 20 s. Solid "noise": Fractal Noise Contrast 300, Random Seed `time*3`, then Mosaic Horizontal Blocks 8, Vertical Blocks 1, Sharp Colors on (8 columns flickering black and white). Six master type boxes (guide layers; type M while sizing), copies linked by pickwhip to Source Text. Ten 2 s sections, each a different font, size and vertical position; type LOKI in the middle four columns. Pre-comp "Text 02 Random" under the noise; Time Displacement with the noise as the layer, Max Displacement Time 20 s, so white columns jump 20 s ahead and black 20 s back. Posterize Time 3 fps on both layers (new font every 8 frames); Tint maps black to 50% grey; second noise `time*3+value` lets you drag the seed. Settle: noise Brightness 0 at 8 s to about 150 at 12 s. Jitter: duplicate noise as "Noise Fade", Displacement Map 3 px.
- Principle: luminance as a time index turns one comp of ten fonts into controlled randomness.
- Free: Remotion: seed a PRNG with `Math.floor(frame/8)` and the column index, pick from a font array, settle by raising the probability of the final font to 1. Blender via a handler (untested). Fusion has no direct Time Displacement (untested).
- Pitfall: fonts from Adobe Fonts are missing when a free project file opens; repeats are real dice rolls, add fonts rather than hand-edit.
- Check: verified [Time Displacement panel, noise layer]; other values heard.

### Loki glow, texture-in-glow and shake stack
- AE: Glow x3 (frame: Threshold 60%, Radius 100, Intensity 1.0, Composite Original Behind, Add; radii 100 and 200 at Intensity 0.1); painted-paper scan with Curves, Track Matte Alpha of the text, Screen; text Scale 150% with zoom on a null parent (85 to 100%); adjustment layer: CC Toner, Noise 25 above it, Gaussian Blur 4, Transform with `wiggle(6,1)` and Scale 101%; top paper texture with `posterizeTime(3);` and `wiggle(3,1000)` on Position, Screen, Curves.
- Principle: stack soft lights of different radii, clip a texture to the light with a matte, step the texture's motion at the type's rate.
- Free: stacked CSS `text-shadow` or `filter: drop-shadow` at three radii, texture with `mix-blend-mode: screen`, stepped transforms with `steps()` or Remotion `Math.floor(frame/8)`. Blender: three Glare (Fog Glow) nodes at different sizes. Fusion: Soften Glow duplicated (untested).
- Check: verified [glow stack, layer stack, texture position expression]; wiggle(6,1) and toner colours heard.

### Paint-brush reveal through a text stencil
- AE: in Photoshop draw a brush stroke on a transparent doc in many duplicated steps (tiny at the start, larger in the middle, smaller at the end); in AE import as a composition (Retain Layer Sizes), Alt+] trims each to one frame, Keyframe Assistant > Sequence Layers (Overlap off), Trim Comp to Work Area, Crop Comp to Region of Interest. In the type comp: stroke comp, Time > Freeze on Last Frame; text above it at Stencil Alpha. Rotate, scale and move the anchor to the stroke start per letter stroke (frames show Rotation 7, 2, 92, 88), offset in time; a 14% opacity copy of the word as a guide. Curves: Puppet Pin with 3 pins, or draw the curve in Photoshop. Second coat: duplicated strokes above the text, offset about 2 frames, un-stencilled with soft masks so extra texture pokes outside.
- Principle: one reusable animated brush plus a stencil replaces tracing every letter.
- Free: SVG `<mask>` with animated `stroke-dashoffset` paths; canvas strokes drawn in segments and clipped by text; Blender Grease Pencil Build modifier clipped by a text mask (untested); Fusion Paint stroke wipe (untested).
- Pitfall: long strokes poke outside letters; wide strokes over-warp with the pin tool.
- Check: verified [Sequence Layers dialog with 13 layers, rotations].

### Text over busy footage: six fixes
- AE, in order: (1) Drop Shadow with high Softness and raised Opacity; (2) black solid below the text at 20%; (3) the same solid with an ellipse mask feathered (F); (4) Gaussian Blur adjustment layer under the text, Blurriness 40, Repeat Edge Pixels on, rectangle mask for a frosted panel (black solid at 61% above); (5) a white-stroke rectangle round the blur so it looks designed; (6) Tint with a dark and a light colour eyedropped from the footage, Amount reduced.
- Principle: separate by luminance and soften edges so the fix does not read as a fix.
- Free: CSS `backdrop-filter: blur(20px)` on the label box plus `box-shadow`; Fusion Blur with a Rectangle mask under Text+; Blender Blur with a Box mask.
- Check: verified [Blurriness 40, solid at 61%].

### Title kit look (navy gradient, gold type)
- Look (by eye, not sampled): dark navy gradient background (blue left to near black right), heavy gold geometric sans in caps, white bullets; full-screen title is a simple move up; half-screen puts bullets right; "Coming Up" card is centred gold text. Few, short bullets; blur the background if legibility needs it. A wide-tracked serif title card (white caps on dark green with a coral frame, three sizes) is a further reference.
- Free: CSS `linear-gradient(90deg,#33406b,#222)`, gold `#E5B04D` (approximate), spring `translateY`.
- Check: verified [frames]; colours estimated. The project file is behind an email form (a link for the user to open, not downloaded).

## 7. Putting graphics into footage

### Track the camera and place graphics in the shot
- AE: select the footage, Effect > Perspective > 3D Camera Tracker (or Tracker panel > Track Camera; Detailed Analysis optional, about 30 s for 6 s); frame settings Shot Type Fixed Angle of View, Show Track Points 3D Solved. Create Camera, make the graphic 3D, drag Z (Shift = 10x). Or right-click a track point > Create Text and Camera. Works for simple camera moves only.
- Principle: solve a camera from parallax, then place 3D layers in that space.
- Free: Blender Movie Clip Editor: Detect Features, Track, Solve Camera Motion, Set Scene Tracking, then place objects (confident). Fusion Camera Tracker is Studio-only; free Resolve has the Planar Tracker. Mocha AE ships with AE.
- Check: verified [tracker panel and 3D Tracker Camera view]; match grain afterward (see next entry).

### Match the plate (tint, blur, noise, grade)
- AE: Tint (Map Black To a dark eyedropped from the plate, Map White To the sky white), Gaussian Blur 6 keyed to 10 as the graphic recedes, Noise 10% (color noise on, Clip Result Values on); final adjustment layer "Grade": Hue/Saturation (saturation 23) and Curves on the Blue channel.
- Principle: matching blacks, whites, blur and grain makes the graphic belong; the solve places it.
- Free: Blender compositor Color Balance, Blur, Noise; Fusion Color Corrector, Blur, FilmGrain; web SVG `feTurbulence` grain, CSS `filter: blur()`.
- Check: verified [Tint, Gaussian plus Noise stack, Grade values].

### Reflections: water pool, tracked graphic and sphere
- AE pool: Pool = rectangle with a Linear Gradient fill (Alt on the Fill label cycles fill type); duplicate the background, Fill with an eyedropped colour, bottom corners masked, feather 600. Pre-comp text as "Object", duplicate, Layer > Transform > Flip Vertical, mask the top with feather 286, mode Screen. Turbulent Displace twice: horizontal Amount 500, Size 3; vertical Amount 25, Size 20; animate Evolution and Offset; or Wave Warp Direction 0 for a stylised ripple. Limit to a pond: a pond layer above set as Alpha Matte. Nudge the reflection down for a gap. Tracked graphic: flipped copy slid under the waterline, rectangle mask with feather, Gaussian Blur vertical 50, Turbulent Displace Amount about 470, Size about 5. Spill: duplicate, Fill rich green, inverted beam mask, Mask Feather 307. Sphere environment reflection: a matted copy of the plate under the graphic's alpha, rotated 180, Gaussian Blur 15, Bulge (Horizontal Radius 102, Vertical Radius 101, Height 1 to 4, heard), keyframed several times, Screen.
- Principle: reflection is flip, fade, ripple (horizontal squash with a big amount, tiny size); a spherical reflection is a blurred, bulged copy of the scene inside the object's alpha.
- Free: CSS `-webkit-box-reflect: below 0 linear-gradient(transparent, rgba(255,255,255,.4))`; SVG `feTurbulence baseFrequency="0.02 0.3"` into `feDisplacementMap scale="30"`; Blender Principled glossy material with the plate as environment gives it for free; compositor Flip plus Displace (X only); Fusion Transform Flip Y plus Displace (untested).
- Pitfall: the bulge centre is not tracked, so it drifts; key centre and radius about five times.
- Check: verified [Fill and mask, both displace dialogs, Mask Feather 286, Gaussian 15, blend mode Screen]; Bulge Height 4 heard.

### Multiply art onto a wall
- AE: art layer Multiply, base aligned to the subject; Corner Pin for angled walls. Mask out windows and floor: solid with pen masks set to Subtract (M), art's Track Matte = Alpha Matte of that layer. For a subject on a white wall, duplicate the wall on top, rough-mask the person (not the shadow), then Extract (drag the white point left past the histogram spike) or Color Key (tolerance 21). Colour match: opacity 85%.
- Principle: Multiply keeps only dark values, so art takes the wall's texture; a matte hides it where it must not sit.
- Free: CSS `mix-blend-mode: multiply`, `clip-path` or `mask-image`, `transform: matrix3d` for corner pin; Fusion Merge Multiply, Polygon mask, Luma Keyer, CornerPositioner; Blender Mix Multiply plus a Corner Pin node.
- Check: verified [Extract panel, 85% opacity, composite].

### Ink under the skin (tattoo)
- AE: comp: skin plate at the bottom, tattoo pre-comp above with Gaussian Blur 6 (a duplicate at 20), Curves on Blue lifting blue in shadows, Multiply. On top a skin copy (Screen) with Track Matte Alpha from the animated anchor art, its Curves steep so only highlights remain, black and white, Gaussian Blur 20 on the matte. Fresh ink: more contrast in the top Curves, less blur, a duplicate with Fill red, blur 25, opacity 70%, another at blur 150, opacity 30%. Swap the art inside pre-comps with Alt-drag.
- Principle: tint and soften ink so it sits below the surface, then show only the skin's highlights through the ink shape.
- Free: Blender Alpha Over of blurred line art, Mix Multiply, a second Mix Screen with a thresholded skin copy; Fusion Merge Multiply and Screen, Blur, Color Curves; CSS `mix-blend-mode: multiply` plus `mask-image`.
- Check: verified [Blur 20, Curves, red glow stack, finished frame].

### Growth matte title reveal (veins, ink, light)
- AE: vein texture (white on black) grown by the paid Autofill plug-in from an origin, Time Remapping with a speed ramp, a darker slightly delayed copy for a gradient; CC Toner Pentone (pale pink, red-brown, dark red, navy, black), Outer Glow and Drop Shadow. Logo: stacked vein comps under the text at Stencil Alpha, gaps filled with an ink reveal matte. Final adjustment layer: Quick Chromatic Aberration 3, CC Lens, Transform to hide warped edges, Camera Lens Blur (Hexagon, Radius animated to rack focus, Highlight Threshold 204, Repeat Edge Pixels on), Noise HLS Auto (Grain, Lightness 3%, Grain Size 0.50).
- Principle: a growth sim becomes a matte, one matte stack reveals text, one lens-artefact layer glues it.
- Free: Blender Geometry Nodes branching growth (untested); canvas space-colonisation branches with `destination-in` and text; chromatic aberration by offsetting R and B 1 to 3 px, grain 3%, barrel distortion.
- Check: verified [vein matte, Pentone colours, Stencil Alpha reveal, final stack].

### Cinematic title stack (crime documentary)
- AE (5 s): light gray solid; vignette = black solid with an ellipse mask, mode Subtract, Mask Feather 750; wide-tracked title; paper texture Screen with steep Curves, scale 85 to 100, a duplicate rotated 64 degrees from about 140 to just over 200 with Gaussian Blur 2; light leak Screen, opacity 100 at 1 s, 10 at 2 s, back up for the last second; fingerprints Screen with Time Stretch 400%; stock clips Inverted, desaturated, Multiply. Adjustment layer: Curves per channel (red up in shadows, blue down in highlights), Camera Lens Blur (Radius 5 to 2 over 1 to 3 s, Hexagon, Highlight Threshold 204, Repeat Edge Pixels on to avoid pale halos), Noise 6%.
- Principle: a few cheap Screen or Multiply overlays, one grade, then blur and grain, so type and stock feel like one shot; animate layers in opposite directions for depth.
- Free: Fusion Merge Screen and Multiply, Vignette, ColorCurves, LensBlur, FilmGrain; Blender Mix Screen and Multiply, Ellipse Mask plus Blur, RGB Curves, Bokeh Blur, Noise; web `mix-blend-mode`, radial-gradient vignette, SVG grain.
- Pitfall: Camera Lens Blur renders slowly; light leaks and stock footage are not shipped.
- Check: verified [vignette 750, Curves, layer stack, Lens Blur].

### Gradient map (CC Toner) to recolour everything
- AE: keep the comp grayscale and colour on one top adjustment layer. CC Toner (Pentone: Highlights, Brights, Midtones, Darktones, Shadows), then Hue/Saturation and Curves. In a pre-comp, give shapes exact fills of 100%, 75%, 50%, 25% and 0% white, then apply CC Toner per instance so each gets its own palette while the animation stays editable. Tint or Tritone give less control.
- Principle: separate value from colour, so the palette is one swap.
- Free: Blender Color Ramp (5 constant stops) on luminance; Fusion Color Curves or a Gradient map (untested); SVG `feComponentTransfer type="table"` or `discrete`.
- Check: verified [CC Toner Pentone panel, grey fills]; per-instance setup panel not captured.

### Small effects and shadow tricks
- AE: Radial Wipe (pie charts; Wipe Center = circle centre); CC Sphere; Mesh Warp; CC Power Pin (corner-pin a video to a screen); Bezier Warp; CC Bend It after Grow Bounds; Mirror; Transform effect (second scale and position without a null); Simple Choker (rounded corners, Fill after); Roughen Edges x2 (large and small); Timecode plus Time-Reverse for a countdown; CC Ball Action (Grid Spacing 0 or 1 gives an LCD look); Mosaic; Checkerboard (Width 16); CC RepeTile; Echo (Echo Time -0.033, Number of Echoes 1, Decay 1.0, Add); CC Radial Fast Blur with CC Composite. Shadow: duplicate the pre-comp, Fill with the shadow colour, CC Slant to flatten, put behind.
- Free: Fusion Grid, Mirror, Tile; Blender Mix, Translate, Lens Distortion; SVG `feTile`; CSS `perspective` for corner pin.
- Check: verified for Ball Action, Mosaic, Checkerboard, Echo, Radial Fast Blur; the rest heard.

### EbSynth style change, face swap and tracker repair
- Makes: one painted keyframe propagated through a shot by motion.
- Steps: render the shot as a PNG sequence; paint a keyframe that matches one frame (largest face; Liquify-distorted keyframes give bad results); in EbSynth pick the Keyframes folder, Video folder and output, press Run All (about 30 min for 5 s of 1080p); more keyframes fix teeth, turned heads, pupils. Repair: new null; Window > Tracker > Track Motion with Position and Scale on two stable high-contrast points; apply to the null, parent the painted still to it; a second mask around eyes, nose and mouth set to Subtract, Mask Feather 30 px, lets the EbSynth blinks show through. Hide seams with Screen embers, a shake null with `wiggle(12,3)` (heard) and Scale 101%, and a warm Curves grade.
- Principle: use a still for stable parts and the propagated result for moving features. It transfers texture along motion, not a new look.
- Free: EbSynth is free (check the licence on its site); Fusion Planar Tracker plus Transform; Blender Movie Clip Editor, two markers (location and scale). Optical-flow warping in code is untested.
- Pitfall: cleanup needed, one painted frame took about an hour; the result "wouldn't hold up in a studio setting".
- Check: verified [tracker panel, Add/Subtract masks, shake layer]; the EbSynth window itself was not on a frame, so its steps are heard.

### Project hygiene (nest, parent, rasterize, prerender)
- AE: Pre-compose (Ctrl+Shift+C) for reuse and effects shared by all layers; Copy with Property Links; parent layers to one animated layer (Parent scale 95 to 100% over 1 s is a gentle push) or to a null and delete the null after; Continuously Rasterize on imported vectors; Viewer Lock (padlock above the Comp panel) lets you edit a nested comp while watching the parent; Tab shows the mini-flowchart of parent and child comps; prerender a heavy static background (for example a 4K Wave Warp ocean) and re-import it.
- Principle: nesting equals a component; effects and transforms apply once; cache what does not change.
- Free: Fusion Group or Macro; Blender node groups or Collection instances; Remotion components; Blender bake to image sequence or EXR; Fusion saved Loader of a rendered clip.
- Check: verified [pre-comp instances, Project panel folders, flowchart]; Viewer Lock heard.

## Licences, paid items and dropped material

- Paid or third party: Autofill (growth), Deep Glow, TextEvo and other aescripts items. Treat as ideas; use the free routes.
- Project files in the videos sit behind email forms or on Gumroad; they are links for the user to open, not downloads. Fonts from Adobe Fonts need a subscription. Stock footage (embers, light leaks, skin plates, free 4K stock) comes from stock sites and is not shipped; check each licence.
- EbSynth is free; confirm its licence on its site before commercial use.
- Dropped as out of scope or filler: the Illustrator global-swatch style-frame workflow and Milanote mood-board sponsor read (belong to design and brief, not this file), the beans-scene workflow (no verified steps), the Photoshop-only egg-white drawing, and transcript talk.
