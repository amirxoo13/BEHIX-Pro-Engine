<!-- skill-navigation:start -->
## Reading map

Read the cheat sheet or table you need, then open the one entry and read it whole, with its steps and source.

- [After Effects motion design: expressions, effect map, workflow, resources](#after-effects-motion-design-expressions-effect-map-workflow-resources)
- [Quick map: AE expression to free tool](#quick-map-ae-expression-to-free-tool)
- [Expressions](#expressions)
  - [time*N: constant-speed driver](#timen-constant-speed-driver)
  - [Boil: time*N on a random seed, held with posterizeTime](#boil-timen-on-a-random-seed-held-with-posterizetime)
  - [wiggle(freq, amp)](#wigglefreq-amp)
  - [loopOut and the loop types](#loopout-and-the-loop-types)
  - [posterizeTime and the 12 fps look](#posterizetime-and-the-12-fps-look)
  - [Pick whip, linked properties and inverse rotation](#pick-whip-linked-properties-and-inverse-rotation)
  - [Counter-scale children of a scaled null](#counter-scale-children-of-a-scaled-null)
  - [Keep stroke width when a layer scales](#keep-stroke-width-when-a-layer-scales)
  - [Sliders, counters and sourceText links](#sliders-counters-and-sourcetext-links)
  - [Ratio link between two effect values](#ratio-link-between-two-effect-values)
  - [Path link and mirrored path](#path-link-and-mirrored-path)
  - [Exponential scale for an infinite zoom](#exponential-scale-for-an-infinite-zoom)
  - [valueAtTime, linear, ease, +value (standard, not seen in the notes)](#valueattime-linear-ease-value-standard-not-seen-in-the-notes)
- [AE effect to free-tool map](#ae-effect-to-free-tool-map)
- [Workflow and hotkeys](#workflow-and-hotkeys)
  - [Hotkeys that recur](#hotkeys-that-recur)
  - [Lesser-known shortcuts](#lesser-known-shortcuts)
  - [Project hygiene and structure](#project-hygiene-and-structure)
  - [Preferences and fixes](#preferences-and-fixes)
  - [Passes, storyboard and reference](#passes-storyboard-and-reference)
- [Tips and tricks](#tips-and-tricks)
- [Render and output settings](#render-and-output-settings)
- [Plugins, presets and resources](#plugins-presets-and-resources)
  - [Free tools and scripts](#free-tools-and-scripts)
  - [Paid tools (ideas only)](#paid-tools-ideas-only)
  - [Project files (email-gated, links for the user)](#project-files-email-gated-links-for-the-user)
  - [Free asset sources](#free-asset-sources)
<!-- skill-navigation:end -->

# After Effects motion design: expressions, effect map, workflow, resources

What the After Effects (AE) motion-design tutorials teach, merged into one reference, with the route for
each trick in free tools: Fusion (inside Resolve), Blender (drivers, F-curve modifiers, compositor) and web code
(JavaScript, SVG, CSS, canvas, Remotion). Routes marked "untested" were not run on this machine; run one and look at
frames before relying on it. The look and the story belong to `2d-generalist`; the effect recipes themselves are in
`premiere-and-after-effects.md`, `fusion-effects.md` and `paid-to-free.md`.

Check labels: `verified [frame]` means expression text or values were read from a frame; `heard` means narration only.
Currency: AE moved to the JavaScript expression engine by default in CC 2019 (the Legacy ExtendScript engine is an
option; `time`, `wiggle`, `loopOut`, `posterizeTime` are unchanged). The Properties panel (AE 2022 onward, widened since)
lists layer, text and shape properties, and does not change the expression steps below. Menu names drift, check them.

Time units differ between tools. AE `time` is seconds. Fusion `time` in an expression is the frame number. Blender
driver `frame` is the frame number. Remotion `frame` is the frame number, so seconds are `frame / fps`.

## Quick map: AE expression to free tool

| AE expression | Fusion | Blender | JavaScript / Remotion |
| --- | --- | --- | --- |
| `time*N` | `time/fps*N` in an expression field (untested) | driver `frame/24*N` | `frame / fps * N` |
| `wiggle(f, a)` | Shake modifier (Modify With > Shake) | F-curve Noise modifier (Scale = 1/f frames, Strength = a) | `a * noise1D(seed, floor(t*f))` |
| `loopOut("cycle")` | Spline Editor loop (Set Loop, untested) | F-curve Cycles modifier | `t % duration` |
| `loopOut("pingpong")` | Spline Editor ping-pong (untested) | Cycles modifier plus mirror keys | `abs(((t % (2*d)) - d))` |
| `posterizeTime(12)` | `floor(time/2)*2` on the driving value (24 fps comp, untested) | Stepped Interpolation F-curve modifier | `Math.floor(frame / (fps/12)) * (fps/12)` |
| `thisComp.layer("A").transform.rotation*-1` | right-click > Connect To, then `=-Transform1.Angle` (untested) | driver with variable = other object rotation, expression `-var` | `-parentRotation` |
| `valueAtTime(time-0.2)` | Time Offset (spline editor) or expression on a Transform (untested) | F-curve Time Offset (NLA strip offset) or driver on `frame-5` | `fn(frame - 5)` |
| `linear(t, a, b, v1, v2)` | none, use `iif` and a ramp (untested) | driver `max(0,min(1,(frame-a)/(b-a)))*(v2-v1)+v1` | `interpolate(frame, [a,b], [v1,v2], {extrapolateLeft:'clamp', extrapolateRight:'clamp'})` |
| `ease(t, a, b, v1, v2)` | Anim Curves modifier with Curve Easing (see `shakes-and-camera.md`) | F-curve Bezier handles | `interpolate(..., {easing: Easing.inOut(Easing.ease)})` |
| `comp("A").layer("B").text.sourceText` | `=Text1.StyledText` link (untested) | no direct body driver, use a frame-change handler (untested) | pass a prop |
| `effect("Slider")("Slider")` | published control or Custom Tool number | custom property with a driver | a prop or variable |
| `Math.round(slider)` | `=floor(x+0.5)` (untested) | driver `round(var)` | `Math.round(value)` |
| `content("Shape 1").content("Path 1").path` | Polyline path link with Connect To | shape key or driver (no path link) | share one `d` string |
| `s = value[i]*100/ps[i]` (counter-scale) | animate child position only | driver `1/parent.scale.x` | position = origin + dir*radius, scale separate |
| `exp(rate*t)` zoom | expression `exp(k*time/fps)` (untested) | driver `exp(k*frame/24)` | `Math.exp(rate * seconds)` |

## Expressions

All AE expressions are entered with Alt/Option-click on a property's stopwatch. The expression field also opens with
`E E` on the layer. Edit > Copy with Property Links (Ctrl+Alt+C) and Copy Expression Only (right-click the property)
carry expressions to other layers. Type maths straight into a number field (`360/12`, `+400`, `360*4`): AE evaluates it.

### time*N: constant-speed driver

Moves any value at a steady rate without keyframes: evolving noise, spinning layers, scrolling directions.
  - After Effects: Alt-click the stopwatch and type `time*N`. `time` counts seconds in the comp, so the value grows by N
    per second. Seen: `time*400` on Fractal Noise Evolution (400 default, 600 or 800 faster, 200 or 100 slower), `time*700`
    for a pool reflection, `time*200` gradients, `time*500` glitch map, `time*250` and `time*200` and `time*100` on Turbulent
    Displace Evolution, `time*50` on a Venetian Blinds Direction or on Rotation (50 degrees per second).
  - Principle: any scalar can be driven by elapsed time with a multiplier; N is the speed. Very fast values look
    jittery, tune N.
  - Fusion: expression field `=time/24*N` on Fast Noise Seethe (Fusion `time` is frames; replace 24 with the comp
    rate). Untested.
  - Blender: driver `frame/24*N` on a Noise Texture W input, or a Generator F-curve modifier (a ramp).
  - Web: `frame / fps * N` in Remotion, a CSS variable updated per frame, or `feTurbulence` seed or a noise z of
    `t * speed`.
  - Use when / pitfalls: endless backgrounds, gradients, glitch maps. When the target is a looping render, make `N*duration` a multiple of the noise period.
  - Check: verified [nutm 02:03 `time*400`; Drwv 00:50 `time*50`; 4:10 `time*100` shown red because expression-driven; 3 and 8 frames for `time*200`, `time*500`]

### Boil: time*N on a random seed, held with posterizeTime

Makes a rough edge, grain or engraving line redraw like a hand-drawn "boil", without keyframes.
  - After Effects: Alt-click Random Seed (Roughen Edges, Fractal Noise, Turbulent Displace) and type `time*4`. This adds
    4 per second, not "a new seed every four frames" (corrected in the source). To step it every N frames, put
    `posterizeTime(6);` on the first line and `time*100` on the second. Use a boil speed high enough that consecutive frames
    are unrelated: for a line, `time*1500` gave a new line each frame while 500 looked smooth.
  - Seen: `time*4` Roughen Edges seed (verified), `time*3` Fractal Noise seed, `posterizeTime(6);` then `time*1500` on
    Turbulent Displace Evolution, `posterizeTime(3);` then `wiggle(3,1000)` on a texture position.
  - Principle: a hand-drawn feel comes from the noise changing on twos or sixes while the shape stays.
  - Fusion: key Seed with `=floor(time/4)` on the noise node (a new pattern every 4 frames); existing notes use `time/30` in Seed.
  - Blender: driver `floor(frame/4)` on a Noise Texture W or a Seed value; or a Stepped Interpolation modifier on the keyed value.
  - Web: `random('seed-' + Math.floor(frame/4))` from Remotion, or feTurbulence `seed` stepping per 4 frames.
  - Use when / pitfalls: put grain effects above the matte effect so the shape is roughened, not the matte. Use different seeds on duplicates.
  - Check: verified [Roughen seed 3:03 `time*4`; 3:42 posterize Turbulent; 17:55 texture position]; `time*4` heard elsewhere

### wiggle(freq, amp)

Random offsets at a set rate: camera shake, film-reel jitter, flicker, misregistration.
  - After Effects: Alt-click the property and type `wiggle(freq, amp)`: freq = changes per second, amp = size in the
    property's units. Seen values: `wiggle(12,3)` null shake for a whole scene (parent all layers to a null, scale it 101%
    to hide edges), `wiggle(12,1)` and `wiggle(6,2)` or `wiggle(6,1.5)` on a Transform effect's Position for film or VHS
    jitter, `wiggle(6,15)` on a halftone sequence, `wiggle(8,50)` on opacity (base 50, so it ranges 0 to 100) for a flicker
    between a dark and a bright duplicate, `wiggle(1,50)` on rotation, `wiggle(0.5,...)` for gentle sway.
  - Principle: noise at a fixed rate is a hand-held shake; add `+ value` to keep the property's own keyframes under the noise.
  - Fusion: right-click Position > Modify With > Shake; set Minimum and Maximum symmetric, Smoothness about 1, re-seed to
    change the look (see `shakes-and-camera.md`).
  - Blender: F-curve Noise modifier on the camera or the object (Strength = amp, Scale = frames per change).
  - Web: `amp * noise1D(seed, Math.floor(frame / fps * freq))` using `@remotion/noise`; CSS flicker uses `steps()` keyframes.
  - Use when / pitfalls: camera shake and particles hide track faults, but do not use them as a crutch. Scale the target slightly so edges stay hidden.
  - Check: verified [`wiggle(8,50)` 10:30; `wiggle(6,15)` 7:30; `wiggle(6,2)` 10:04; `wiggle(6,1)` 16:30]; `wiggle(12,3)` heard

### loopOut and the loop types

Repeats a short keyed animation forever.
  - After Effects: Alt-click the stopwatch > Property > Loop Out, or type `loopOut("cycle")`. Other types: `"pingpong"`,
    `"offset"`; the second argument is numKeyframes (0 = all). On Time Remap the menu writes `loopOut(type = "cycle",
    numKeyframes = 0)`, which is notation, the real call is `loopOut("cycle")`. For Time Remap, set the last keyframe one frame
    before the loop point; for a loop of other layers drag the work area to start 1 s in so keys before frame 0 stay reachable.
    Copy across properties with Copy Expression Only.
  - Principle: the output wraps the keyed segment. A loop expression can drop frames in a texture; copying a texture to fill the loop is the safer fix.
  - Fusion: Spline Editor loop or ping-pong on the keyed spline (Set Loop, untested).
  - Blender: Cycles F-curve modifier (repeat or repeat with offset), Mirror for ping-pong.
  - Web: `frame % durationInFrames`; ping-pong with a triangle wave.
  - Use when / pitfalls: guide an exact loop point with a ruler guide (Ctrl+R); leave a one second lead-in so the last key can be dragged to match the first.
  - Check: verified [gBBry 07:45 `loopOut("cycle")`; t_1s5 11:13 Time Remap; Street Art 03:00]

### posterizeTime and the 12 fps look

Lowers the frame rate of one property or of the whole comp for a hand-made feel.
  - After Effects: for one property, first line `posterizeTime(12);` then the expression on the next line (`time*50`,
    `wiggle(...)`). For the whole comp: an adjustment layer on top with Effect > Time > Posterize Time at 12 fps (one
    switch matches every element; a hand-animated look also takes displace to roughen edges). Default stepped rate is the comp rate
    divided by two (15 at 30, 12 at 24). Animate on twos then cross-fade at 50% opacity with a one-frame offset to soften jitter.
    In the Render Queue switch Best Settings to Current Settings for a pixel-locked dither, or it breaks.
  - Principle: `posterizeTime(fps)` resets the clock rate for just that property.
  - Fusion: no node; quantise the driving value (`=floor(time/2)*2`) or retime with frame holds (see `retime-and-speed.md`).
  - Blender: Stepped Interpolation F-curve modifier (frame step 2); or render at 12 fps and encode at 24.
  - Web: `Math.floor(frame / (fps/12)) * (fps/12)`; CSS `steps()` timing functions.
  - Use when / pitfalls: a 12 fps look is a style choice, ask whether the audience wants it. Finish a stylised piece with gate weave, Posterize Time 12 and Noise HLS Auto.
  - Check: verified [frame 06:20 Posterize Time effect and comp, 13:00 adjustment layer on top]; exact semicolon lines from transcripts

### Pick whip, linked properties and inverse rotation

Change one property and others follow.
  - After Effects: drag the pick whip on a property to another property. Seen: `thisComp.layer("Circle").transform.rotation *-1`
    (a Ferris wheel's cages stay upright: pick-whip each cage's Rotation to the wheel's Rotation and multiply by `-1`);
    `thisComp.layer("Bat Light").transform.opacity`; `effect("Fill")(3)` linking a colour to another effect; rain
    drops whose Rotation all point at the first drop's Rotation. `+ value` after an expression restores the property's own keyframes. Copy with Property Links
    shares several effects across layers, so a client change takes one edit. Shift+pickwhip parents and keeps the visual position; Alt-click a property then pick-whip
    parents just that property.
  - Principle: a link makes one source of truth; the `*-1` cancels a parent's rotation.
  - Fusion: right-click the target > Connect To > the source, or type `=Transform1.Angle*-1` (untested).
  - Blender: driver with a variable of type Transform Channel; expression `-var`. Or Child Of / a rotation constraint.
  - Web: derive from one value: `rotation = -parentRotation`.
  - Use when / pitfalls: pre-compose building blocks before duplicating so one fix updates every copy.
  - Check: verified [Pmmv 1:00 `*-1`; atVK 06:49; 9Sa1 6:40; JiYw 875 s `effect("Fill")(3)`]; `+value` heard

### Counter-scale children of a scaled null

A burst or explosion where only positions scale and objects keep their size.
  - After Effects: put each object in its own pre-comp, add a null at the comp centre, parent all objects to it. Keyframe
    only the null's Scale (small to large, shape the speed in the graph editor). On each child's Scale add this expression, then Copy Expression Only to the rest:
    ```
    s = [];
    ps = parent.transform.scale.value;
    for (i = 0; i < ps.length; i++){
      s[i] = value[i]*100/ps[i];
    }
    s
    ```
  - Principle: parent scale multiplies down the chain; divide it back out per axis. Needs uniform scale.
  - Fusion: animate each child's position only with a radius multiplier (no direct equivalent).
  - Blender: driver `1/parent.scale.x` on the child (untested), or Geometry Nodes instances with separate position and scale.
  - Web: `position = origin + dir * radius(t)`, scale kept independent, no cancel needed.
  - Use when / pitfalls: bursts, radial reveals; give each child its own rotation, position and scale for parallax.
  - Check: verified [-warf 03:10 expression text; 02:57 null Scale 84%, Galaxy scale 50%; rsW4 01:45 comp 02]

### Keep stroke width when a layer scales

  - After Effects: on Stroke Width type `value / length(toComp([0,0]), toComp([0.7071,0.7071])) || 0.001;` (from Adam Plouff,
    text from the creator's public document). It divides the stroke by the layer's current scale. Cheaper alternative: animate an ellipse's Size, not Scale, so strokes stay the same width.
  - Fusion: scale the shape's geometry instead of the Transform (SRender stroke is in pixels).
  - Blender: apply scale to the curve and use bevel depth; web: SVG `vector-effect: non-scaling-stroke`.
  - Check: verified [rsW4 00:40 comp 01, stroke 3 px, Scale keyed]; text from the document, not a frame

### Sliders, counters and sourceText links

Drive text and counters from a slider; reference another comp's text.
  - After Effects: Source Text = `effect("Slider Control")("Slider")` shows 0.75630; wrap in `Math.round( ... )` (or
    `Math.floor`) for a counter. Reference another comp: `comp("COMP_NAME").layer("LAYER_NAME").text.sourceText`. A Dither Scale slider with `Math.round` stops decimals. Name every slider.
  - Fusion: link a Text+ StyledText to a number control through an expression (untested); use a Custom Tool with number inputs for sliders.
  - Blender: custom property with a driver; text body needs a frame-change handler (untested).
  - Web: the value is a prop; `Math.round(interpolate(...))`.
  - Check: verified [rsW4 11:00 `effect("Slider Control")("Slider")`; 08:50 `comp()` autocomplete]

### Ratio link between two effect values

  - After Effects: on Mosaic Vertical Blocks type `effect("Mosaic")("Horizontal Blocks")*0.56` (10 x 0.56 = 5.6, shown as 6).
    The exact 16:9 ratio is `*9/16` (0.5625), which keeps blocks square.
  - Fusion: link two controls with `=Pixelate1.Width*9/16` (untested); web: `rows = columns * 9/16`.
  - Check: verified [N17 5:38 and 5:41]

### Path link and mirrored path

  - After Effects: `content("Shape 1").content("Path 1").path` on a Path property mirrors another path (a blink copied
    from an eye); across layers `thisComp.layer("Spade Half - Right").content("Group 1").content("Path 1").path`. Check the first vertex
    first when a path morph misbehaves. Type `path` in the timeline search to expose and key every path at once.
  - Fusion: Polyline path with Connect To (untested); Blender: shape keys (no path link); web: reuse one SVG `d` string with a mirror transform.
  - Check: verified [4:50 and 12:02, 16:30]

### Exponential scale for an infinite zoom

A zoom looks constant only if scale multiplies by the same factor per frame, so scale is exponential in time.
  - After Effects: select two Scale keyframes > right-click > Keyframe Assistant > Exponential Scale; it bakes a key every
    frame. Put the zoom on a Master Scale null so repositioning does not break it.
  - Fusion: expression `exp(k*time/fps)` on the Transform size (untested). Blender: driver `exp(k*frame/24)`.
  - Web: `Math.exp(rate * seconds)` in Remotion (CSS keyframes cannot do it).
  - Check: verified [2:05 two keys, 5 s work area; 3:10 Master Scale null at 234% with baked keys]

### valueAtTime, linear, ease, +value (standard, not seen in the notes)

Four reference functions that the notes never typed on screen; they come from Adobe's expression reference
(helpx.adobe.com/after-effects/using/expression-language-reference.html) and are listed so the cheat sheet is complete.
Untested here.
  - `valueAtTime(time - 0.2)` reads the property 0.2 s earlier (follow with delay). `thisComp.layer("A").position.valueAtTime(time - 0.2)` makes a trailing layer.
  - `linear(time, t1, t2, v1, v2)` maps time or any input linearly into [v1, v2], clamped. `ease`, `easeIn` and `easeOut` are the smooth versions.
  - `+ value` after an expression keeps the property's own keyframes on top.
  - Free routes: see the quick map above. Easing is easier in the Graph Editor or `interpolate` with an `Easing` curve.
  - Source: [Adobe expression reference](https://helpx.adobe.com/after-effects/using/expression-language-reference.html)

## AE effect to free-tool map

Effects that recur across the notes. Fusion node names are from the Resolve 18 to 20 node list. All routes are
untested unless an existing reference file (named in the last column) already walks through it.

| AE effect | Fusion node | Blender node (compositor or shader) | Web / SVG / CSS | Steps in |
| --- | --- | --- | --- | --- |
| Fractal Noise (Evolution, Random Seed) | Fast Noise (Seethe, Seed) | Noise Texture (W) | `feTurbulence` baseFrequency, seed | `fusion-effects.md` |
| Turbulent Displace | Displace plus Fast Noise (plus Create Bump Map) | Displace node plus Noise Texture | `feDisplacementMap` plus `feTurbulence` | `fusion-effects.md` |
| Roughen Edges | Displace on the alpha with Fast Noise, or Erode/Dilate | Displace on the alpha, Dilate/Erode | `feDisplacementMap` on SourceAlpha | `fusion-effects.md` |
| Posterize Time | no node, quantise the driver | Stepped Interpolation modifier | `steps()` timing, `Math.floor(frame/k)*k` | this file |
| Transform effect plus wiggle (shake, misregistration) | Transform with Shake modifier | Noise F-curve modifier, Translate node | noise offsets per frame | `shakes-and-camera.md` |
| Gaussian Blur, Camera Lens Blur | Blur, Defocus | Blur, Defocus | CSS `filter: blur()`, `feGaussianBlur` | `fusion-effects.md` |
| Glow, Deep Glow | Glow (stack three at growing radius) | Glare (Bloom or Fog Glow) | stacked `drop-shadow()` or `blur()` plus `mix-blend-mode: screen` | `paid-to-free.md` |
| Curves, Levels, Hue/Saturation | Color Curves, Color Corrector | RGB Curves, Hue Correct, Color Balance | CSS `filter`, SVG `feComponentTransfer` | `color.md` |
| Tint, CC Toner (tritone) | Color Corrector (tint), Color Curves per channel | Color Ramp | SVG `feColorMatrix`, `feComponentTransfer` | `color.md` |
| Mosaic | Pixelate | Pixelate | `image-rendering: pixelated`, canvas downscale | untested |
| Venetian Blinds | Rectangle masks repeated (Replicate), or Wipe | Mix with a stripe gradient (Gradient Texture, Color Ramp) | `repeating-linear-gradient()` mask | untested |
| Set Matte, Track Matte | Merge with mask input, Matte Control | Set Alpha, Alpha Over | `mask-image`, `clip-path` | `fusion-effects.md` |
| Stencil / Silhouette Alpha (blend modes) | Merge Apply Mode Stencil or In/Out | Multiply by alpha, Set Alpha | `mask-composite`, canvas `destination-in` and `destination-out` | this file |
| Corner Pin, CC Power Pin | Corner Positioner | Corner Pin | CSS `transform: perspective() rotateX()`, `matrix3d()` | `fusion-effects.md` |
| Twirl, Ripple, Wave Warp | Vortex, Ripple (untested) | Displace with a gradient or Wave Texture | `feDisplacementMap` | untested |
| Displacement Map | Displace | Displace | `feDisplacementMap` | `fusion-effects.md` |
| Extract (keying by luma) | Luma Keyer, Bitmap | Luminance Key | CSS `mix-blend-mode`, canvas | untested |
| Noise HLS Auto, Add Grain, 50% grey Overlay noise | Film Grain, Fast Noise plus Overlay | Noise Texture plus Overlay mix | CSS blend with a noise PNG, `feTurbulence` | `paid-to-free.md` |
| Drop Shadow (stacked, growing radius) | Drop Shadow, Blur plus Offset | Blur plus Translate plus Multiply | CSS `drop-shadow()` repeated | `fusion-effects.md` |
| CC Radial Fast Blur | Directional Blur (radial) | Blur plus Translate (zoom), Vector Blur | CSS `filter: blur()` plus scale, canvas | untested |
| Chromatic aberration, RGB split | Channel Booleans then offset Transform per channel | Lens Distortion (Dispersion), Separate/Combine Color | SVG `feOffset` per channel with `feBlend screen` | `paid-to-free.md` |
| Color Halftone | Custom Tool dot expression (see `fusion-effects.md`) | Pixelate plus a threshold on a rotated pattern | CSS radial-gradient pattern, canvas | `fusion-effects.md` |
| CC Sphere | Shape3D sphere with an image texture | UV sphere with an image texture | three.js sphere | untested |
| Echo, Time Blend | Echo fuse, Time Speed | frame blend through Time offset | canvas accumulation | `fusion-effects.md` |
| Dissolve blend (crisp grain) | Merge Dissolve, mask | Mix with a mask | canvas random threshold | untested |
| Blur plus sharpen trick (soften then unsharp) | Blur then Sharpen / Unsharp Mask | Blur then Filter (Sharpen) | CSS `filter: blur() contrast()` | untested |

## Workflow and hotkeys

### Hotkeys that recur

Windows keys; use Cmd for Ctrl and Option for Alt on a Mac. Verified only as UI states unless noted, so check on your build.

| Key | Does | Free-tool equivalent |
| --- | --- | --- |
| S, R, P, T, M, F, U | Scale, Rotation, Position, Opacity (T), Mask (M), Mask Feather (F), keyframed properties (U); Shift adds more | Blender: I inserts a key on a hovered field; Fusion: Inspector |
| F9 | Easy Ease; then drag the first handle up for a fast start | Blender: T > Bezier; Fusion: Spline Editor |
| J / K | Previous / next keyframe | Blender: Up / Down arrows jump to keyframe |
| Ctrl+D | Duplicate layer (a mask if the mask is selected; effects in Effect Controls) | Blender: Shift+D |
| Ctrl+Shift+D | Split layer at the playhead | Resolve Edit: Ctrl+B |
| Ctrl+Shift+C | Pre-compose | Resolve: Compound Clip; Fusion: group |
| Ctrl+Y / Ctrl+Alt+Y / Ctrl+Alt+Shift+Y | New solid / adjustment layer / null | Fusion: Background / Transform / merge node |
| Alt+[ and Alt+] | Trim layer in / out at the playhead; `[` and `]` move the layer | Resolve: Q and W ripple trim |
| N and B | Set work-area end / start | Resolve: I and O marks |
| `*` on the numpad (Alt+`*` with dialog) | Layer marker | Resolve: M |
| Alt-click stopwatch, E E | Open the expression field, reveal expressions | Fusion: right-click > Expression; Blender: driver editor |
| Ctrl+Alt+click a keyframe or right-click > Toggle Hold Keyframe | Hold key, no fade (opacity, colours) | Blender: Constant interpolation |
| Ctrl+K | Composition Settings | Resolve: Project Settings |
| Ctrl+R | Rulers; drag a guide for an exact loop point | Blender: none |
| Shift+arrow on Vimeo | Step one frame in the browser (YouTube lacks it); VLC E | Blender and Resolve step frames with arrows |

  - Check: verified [jFbR 55:50 render frame; Alt+S key overlays at rsW4 01:45]; the rest heard across the videos

### Lesser-known shortcuts

  - Right-click > Invert Selection; while drawing a mask type the mode letter (N none, A add, S subtract, I intersect, L lighten, D darken, F difference); hold Space to reposition while drawing a shape; Ctrl + scroll in the expression editor enlarges text; double-click a tool to reset (selection tool resets scale, rotation tool rotation, Pan Behind the anchor point); hold a tool's key (W for rotation) to use it temporarily; right-click a layer > Select Children; Ctrl+Shift+E removes all effects from selected layers; Ctrl+` shows all properties, so Ctrl+A then Ctrl+` collapses all; in the expression editor Ctrl+D duplicates the line and Tab indents; Ctrl+Alt+Shift+N new folder in Project; Alt-click two keyframes shows the duration in the Info panel.
  - From the 50 tips: Tilde `~` over a panel toggles full screen; Tab shows the Mini-Flowchart; lock a Comp viewer to see a pre-comp in a split view (Viewer Lock); View > Snap to Guides; right-click work area > Trim Comp to Work Area; Region of Interest then Composition > Crop Comp to Region of Interest; Keyframe Assistant > Sequence Layers to stagger; Keyframe Assistant > Time-Reverse Keyframes; Alt-drag the first or last key to scale the selection of keys keeping proportions; Time > Time Stretch (50% twice as fast); Layer > Transform > Auto-Orient > Orient Along Path; Alt + drag a project item onto a layer to replace it and keep animation; Reveal in Composition / Project / Explorer; numbers 1-9 set layer opacity with the Move tool; Ctrl-click a twirl-down arrow opens all children; Shift while dragging the Z arrow moves 10x faster; Shift while dragging a keyframe point restricts movement to one axis; Title/Action Safe grid gives a centre crosshair. Ctrl+Shift+E in captions was Ctrl+Shift+D (split) misheard.

### Project hygiene and structure

  - Folders `00. Precomps`, `01. Assets`, `02. Comps` (number prefixes sort); rename layers, colour-code with Labels (matte layers purple, lightning yellow, shadows red); name the top adjustment layer `Effects`. Label every layer: it costs seconds and saves hours.
  - New comp 1920x1080 at 24 fps; make the comp longer than the shot (a 5 s comp for a 1 s shot) and trim later.
  - Put effects on an adjustment layer at the top so footage underneath can be swapped; put the effect source in a pre-comp (one comp per shot, one per colour when a texture needs Preserve Underlying Transparency) so changes update every copy; duplicate the pre-comp in the Project panel to get Lightning 2 and 3.
  - Import an Illustrator file as Composition (Retain Layer Sizes), not Footage, so layers survive; Overlord (paid) pushes Illustrator shapes in as shape layers.
  - Put the style frame on the top layer of the shot comp so one click toggles reference against the build.
  - Save workspaces (Window > Workspace > Save as New Workspace); a screen recording workspace with a keystroke overlay helps tutorials.
  - Check: verified [11 frame 00:50 folders; whFa 235 s workspace tabs; geBX 1:00 and 7:35 project layout]

### Preferences and fixes

  - Edit > Preferences > General (Mac: After Effects > Settings): Default Spatial Interpolation to Linear; Center Anchor Point in New Shape Layers; Enable Home Screen unchecked; Auto-Save every 5 to 10 minutes (default 20), Maximum Project Versions 15 (default 5). Check: verified [whFa 100 s list]; Auto-Save values heard.
  - Edit > Purge > All Memory and Disk Cache; File > Dependencies > Remove Unused Footage, Reduce Project, Collect Files. A corrupt project imports into a new project.
  - The "20 Quick Fixes" list: Tool Creates Mask vs shape (pen tool option); Toggle Mask and Shape Path Visibility; show hidden timeline columns with the three bottom-left icons; Shy layers with the Hide Shy icon; double-click footage opens the Footage panel; Continuously Rasterize for vectors and for both layers of Set Matte; edit vertices (double click, click away to deselect); gradient fill bar returns by selecting the fill; Set Matte size mismatch; space bar not playing (swap audio output device in Audio Hardware, then back); PNG sequence import unticked; front view vs Active Camera.
  - Hardware per the notes: CPU matters most, more cores help little, GPU not worth the cost, RAM for previews, SSD (heard).
  - Check: heard; list names verified [3neS 40 s Project panel list]

### Passes, storyboard and reference

  - Work coarse to fine: blocking or animatic first, details last, ease everything at the end (select all, ease once). Do animation approval before texture work. Send blocking to the client early. Do not animate what the client does not need.
  - Storyboard in three passes: thumbnail (for you), board (refined for the client), style frame (final look). Start on paper, draw alternatives (three transition thumbnails), be detailed in black-and-white line close to the final design, add written descriptions per frame; share by link, PDF or PNG. Free board tools: Miro, Excalidraw, Penpot, Krita or Grease Pencil, PureRef (untested).
  - Reference-first moodboard: write down what makes each reference work ("The Eyes!", "Match Lighting"). Search tricks: "cover" or "vintage" widens image searches; Pinterest related images; slow-motion clips on YouTube, art footage on Vimeo; step frame by frame (Shift+arrow on Vimeo) and read the shape of the event (a flash is a fast peak then a decay, not an even fade).
  - Eight habits to stop: motion blur on for 2D motion graphics, overstuffed scenes, a messy Project panel, one huge comp, easing plugins in place of the Graph Editor, eyeballing centre (use the Align panel set to Composition), Puppet Pin beyond subtle motion, skipping passes.
  - Pick music before animating to hit timings. Prove a risky look with a rough test before committing weeks.
  - Check: verified [KfX6 04:45 to 12:00 boards; 4OL9 3:10 to 11:30 board; LKlX 0:20 and 3:20]; claims heard

## Tips and tricks

Merged from every video; each keeps one line. Source for all: the tutorials listed in the credit line.

 - Subtle chromatic aberration (0.15 in Deep Glow, 1 to 3 px split), never "3D glasses"; effects are felt, not seen.
 - Stillness makes motion land: quiet shots and rest.
 - Several glows or blurs at growing radius and falling intensity beat one big one (radii 10, 100, 200 with 0.1 on the widest; four glows at 1x, 25, 100, 200 for natural falloff). Glow: set where it looks right, then halve it.
 - Put warp and blur on separate adjustment layers so their order can swap; Hue/Saturation at the top of the stack when you want saturation before the displacement; colour corrections before Tint, Hue/Saturation above Tint.
 - Screen or Add blend modes turn black to transparent; keep gradient centres black. A 50% grey solid is neutral in Overlay, the safest base for grain and chrome.
 - Colour depth: 16 bpc plus 1% noise (or 5% noise on an Overlay grey) removes banding.
 - Match the foreground to the plate, not the other way; test a global grade by toggling the adjustment layer; never double a shadow on a shadow; a hard black layer set to 80 to 90% opacity (or mid-grey) sits better.
 - Boil speed and seed: see the boil entry. Use different seeds on duplicates so digital randomness is not visible.
 - Gaussian Blur 99% of the time; Camera Lens Blur only for a blur map or bokeh; tick Repeat Edge Pixels on heavy blurs; never fully clear (leave 1 px of blur in a title); Box and Camera Lens Blur look more natural but are slower.
 - Roughen Edges crops at a straight line: add an empty mask. Both layers of Set Matte must be continuously rasterized. Complexity 6 to 3 on Fractal Noise saves render time. Mosaic averages colours: tick Sharp Colors and re-colour with CC Toner.
 - Hold keyframes for opacity or colours that must not gradient; split the layer to avoid a white flash at a swap.
 - Dissolve blend mode with a feathered mask gives grain that stays crisp when magnified.
 - Closing an eye is about twice as fast as opening; the top lid moves more than the bottom; animate one limb, then duplicate and offset.
 - Camera Lens Blur, heavy effects: preview at half or one-third resolution and split layers so effects render only where needed.
 - Hard-to-read text on footage: a soft drop shadow first, a frosted blur panel last. Framing low-resolution footage inside a frame makes it look deliberate.
  - Moving one source shape shifts every hue of a kaleidoscope (cheap palette finder); pick colours from references that are ugly alone (anime stills); screen a light leak with an opacity floor at about 10%. Source: [Kaleidoscope project](https://www.benmarriott.com/project-file-opt-in-170-fun).
 - Pre-rendered looping textures are reusable for life (render 5 to 10 s once). A free grain brush, scanned ink and paper loops are in the resources below.
 - Efficiency versus result: sometimes hack a few shape layers for a few frames; draw a path every few frames rather than a clever rig.
 - Plugins are worth about a day-rate share: if a tool saves an hour a year it pays; Ben calls Motion v2 and Ease and Wizz easing helpers to avoid early.
  - The scrub values in frames can differ from the spoken final values; trust the spoken final value.

## Render and output settings

  - After Effects: Composition > Add to Render Queue (Ctrl+M). Render Settings Best Settings (Current Settings for a pixel-locked
    dither); Quality Best, Resolution Full, Frame Rate use the comp's, Time Span Work Area Only. Output Module:
    - Editing or archive: QuickTime, Apple ProRes 422 HQ (about 200 MB for 10 s of 1080p). 99% of exports are ProRes 422 HQ,
      ProRes 4444 for transparency (or "High Quality with alpha") and H.264.
    - Web: Composition > Add to Adobe Media Encoder Queue, H.264 (about 3 MB against 35 MB ProRes for the example); the Render Queue also lists "H.264 - Match Render Settings - 5, 15, 40 Mbps"
      on the AE 2023 build.
    - Lossless AVI is 1.5 GB for 10 s of 1080p: avoid. Make output templates (arrow > Make Template): PNG sequence, ProRes 422 HQ,
      H.264 at 70%.
  - Currency: AE steers to Media Encoder; QuickTime-format output varies by build, verify yours. Output Module list shown was from AE 2021 to 2023.
  - Fusion / Resolve: Deliver page, ProRes or H.264 presets; transparency: ProRes 4444 or EXR.
  - Blender: Output Properties, File Format FFmpeg video, container QuickTime or MPEG-4, codec H.264 or ProRes; image sequence PNG or EXR for alpha.
  - Remotion: `npx remotion render --codec=h264` or `--codec=prores --prores-profile=4444`; PNG sequence with `--sequence`.
  - FFmpeg: web `ffmpeg -i in.mov -c:v libx264 -crf 18 -pix_fmt yuv420p out.mp4`; ProRes 422 HQ `-c:v prores_ks -profile:v 3`; ProRes 4444 `-profile:v 4 -pix_fmt yuva444p10le`.
  - Check: verified [jFbR 55:50 settings dialog; 3neS 450 s Output Module AVI Lossless, 462 s ProRes list; whFa 380 s templates]; sizes heard

## Plugins, presets and resources

Links come from the video descriptions. Nothing from the videos was downloaded or run. A project file behind an email
form or a Gumroad page is a link for the user to open, never a download for the agent. A paid plugin is an idea only:
find the free route in the map above. Check each licence before use. Prices are from the narration (2019 to 2023) and
may have changed.

### Free tools and scripts

| Name | Licence | Link | What for | Free route |
| --- | --- | --- | --- | --- |
| FX Console (Video Copilot) | free | https://www.videocopilot.net | effect search bar, favourites, copy comp to clipboard | Resolve: Shift+Space tool search |
| Saber, Orb (Video Copilot) | free | https://www.videocopilot.net/orb/ | energy beams, neon, planets | Fusion Glow, Blender Glare |
| Video Copilot Color Vibrance | free, name your price | https://www.videocopilot.net | tint light areas of a texture | Color Corrector |
| EaseCopy | free or name your price | https://aescripts.com/easecopy/ | copy easing between keys | Spline Editor, Blender copy and paste keys |
| ButtCapper, Schmear (Battle Axe) | free or name your price | https://www.battleaxe.co/ | round caps and joins | SVG `stroke-linecap` |
| Duik Bassel 2 (Rainbox Lab) | free, open source | rainboxlab.org | character rigging | Blender rigging |
| AnimDessin 2 (Photoshop) | free, unsupported | https://github.com/sbaril/Photoshop-Animation | frame-by-frame onion skins | Krita, Blender Grease Pencil, Procreate |
| Rough Animator to AE import script | free | https://www.roughanimator.com/toaftereffects/ | import rough frames | Krita |
| NTSCplayer | open source | https://github.com/ferropop/NTSCplayer | VHS look player | Fusion, FFmpeg filters |
| Kyle Martinez scriptlets | open source | https://github.com/kyletmartinez | AE scripts | n/a |
| Zack Lovatt scriptlets, Motion Script | free | https://lova.tt/scriptlets, https://www.motionscript.com/ | AE expressions and scripts | this file |
| Kyle T. Webster brushes | free in Photoshop (Brushes > Get More) | Adobe | grain and ink brushes | Krita brush packs |
| Stop Motion Studio (phone) | free version | app store | stop-motion frames | Dragonframe alternatives |
| EbSynth | free desktop tool | https://ebsynth.com/ | style transfer from keyframes | untested |
| Expressions document | free | https://docs.google.com/document/d/1xvq2Zd2ktOnHjXPiwbaa3zTthrXI4MTcTNV3PHMZZXs/edit | 10 expression texts | this file |
| Ditherpunk, blue-noise textures | free (check licence) | https://surma.dev/things/ditherpunk/, https://momentsingraphics.de/BlueNoise.html | dither background reading | `fusion-effects.md` |

### Paid tools (ideas only)

| Name | Price as narrated | What it does | Free route |
| --- | --- | --- | --- |
| Deep Glow | about 50 USD | GPU glow with chromatic aberration | stack Glow at growing radius |
| Overlord (Battle Axe) | 45 USD | Illustrator to AE shape paste | SVG import in Blender or Remotion |
| Flow, Motion v2 | 30 and 65 USD | easing panel, mini graph editor | Graph Editor, Spline Editor |
| Trapcode Particular, Stardust, Element 3D | 49.92 per month or 399, 299, 199.95 USD | particles and 3D in AE | Blender particles, Fusion 3D |
| Shadow Studio 2 | 49 USD | soft multi-layer shadows | stacked Drop Shadows |
| Retro Dither, Pix Dither, Autofill | about 50, 20, 50 USD | dither, procedural fill | dither entries in `fusion-effects.md` |
| Trapcode Starglow | paid | star glow | Glow plus a rotated Blur |
| Limber, Rubber Hose, Joysticks 'n Sliders, Cyclops, AfterCodecs, TextEvo | 10 to 90 USD each | rigs, nulls display, encoders, text | Duik, Blender |
| Epidemic Sound, Envato Elements, Yellow Images, Motion Elements, Lickd | subscription | music, stock, textures | Freesound, Mixkit, Poly Haven, below |
| Engraving / money template | 9.95 USD | engraving effect | built by hand in the engraving entry |

### Project files (email-gated, links for the user)

Free, but behind a Gumroad or opt-in email form; the user opens and signs up. Ben's shelf: https://gumroad.com/benmarriott.
Some have stock or artwork stripped.

| Project | Link |
| --- | --- |
| 60 min project | https://www.benmarriott.com/project-file-opt-in-00-welcome |
| Folder template | https://gum.co/gXYFl, https://www.benmarriott.com/project-file-opt-in-154-AE-template |
| 20 Quick Fixes | https://benmarriott.gumroad.com/l/fixAEplz |
| Gradients and grain brushes, grain brush | https://bit.ly/2EULioB, https://gum.co/wqAfE |
| Gradient experiments | https://gum.co/MSCZd |
| Psychedelic background | https://gum.co/itojb, https://gum.co/vwtYz |
| Halftone, CMYK halftone | https://gum.co/cXtjso, https://gum.co/HVYk |
| Dither | https://www.benmarriott.com/project-file-opt-in-191-dither |
| CRT/VHS, glitch intro | https://gum.co/CRTVHS, https://gum.co/SDXZJ |
| Shape morph, smoke, hand-drawn | https://www.benmarriott.com/project-file-opt-in-189-shape-morph, https://gum.co/rsPGjl, https://gum.co/HUkoZ |
| Reflections, RGB split, 5 type techniques | https://gum.co/ovpHW, https://gum.co/nIELg, https://gum.co/moretype |
| Shadows (killer, natural, reactive, shadow studio demo) | https://gum.co/msHtaU, https://bit.ly/2vkcWaf, https://gum.co/TQnCnd, https://gum.co/uaUPW |
| Rain, pumpkin, impossible triangle | https://www.benmarriott.com/project-file-opt-in-193-rain, https://www.benmarriott.com/project-file-opt-in-196-pumpkin, https://bit.ly/2XWtMI4 |
| Tattoo, lava, colour glitch, spiral, chrome | https://www.benmarriott.com/project-file-opt-in-147-tattoo, https://www.benmarriott.com/project-file-opt-in-171-lava, https://www.benmarriott.com/color-glitch, https://gum.co/aespiral, https://gum.co/ButLb |
| Layer styles, X logo, Apple logo, YouTube kit | https://gum.co/RiUHB, https://www.benmarriott.com/project-file-opt-in-182-X-Logo, https://www.benmarriott.com/project-file-apple-logo, https://www.benmarriott.com/project-file-opt-in-160-Youtube |
| Smash and shatter, water splash, graffiti, kaleidoscope | https://bit.ly/2RNhIqU, https://gum.co/JbSHD, https://gum.co/ujeQT, https://www.benmarriott.com/project-file-opt-in-170-fun |

### Free asset sources

From the "47 Amazing FREE Resources" list; licences vary, check each before shipping.

  - Imagery and video: Wikimedia Commons https://commons.wikimedia.org, Library of Congress https://www.loc.gov/free-to-use, NASA https://www.nasa.gov, Unsplash, Pexels, Pixabay, Mixkit https://mixkit.co (no sign-up), Reshot, TextureLabs https://texturelabs.org, Mitch Martinez free 4K stock http://mitchmartinez.com/free-4k-red-epic-stock-footage/ (licence per the site).
  - Fonts: Google Fonts https://fonts.google.com, Adobe Fonts (included with Creative Cloud), DaFont, 1001 Fonts, Font Space (check commercial licence).
  - Colour: Coolors https://coolors.co, Adobe Color, Khroma.
  - Icons: Lordicon, op/al, Font Awesome, SVG Repo, PNG Repo, DrawKit.
  - Audio: Freesound https://freesound.org, YouTube Studio Audio Library, Kevin MacLeod incompetech.com (CC BY 3.0, credit required).
  - 3D: Poly Haven https://polyhaven.com, Quixel Megascans, Sketchfab, Pixel Lab, CGTrader free, Free3D.

