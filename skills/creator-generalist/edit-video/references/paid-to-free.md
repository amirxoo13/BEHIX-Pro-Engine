<!-- skill-navigation:start -->
## Reading map

Read the quick map first, then open the one technique section you need and read its whole entry.

- [Paid tools to Resolve, Remotion and Blender](#paid-tools-to-resolve-remotion-and-blender)
- [Quick map (untested)](#quick-map-untested)
- [Art direction: the "analog Vox" system (core recipe)](#art-direction-the-analog-vox-system-core-recipe)
- [Texture and colour (applying textures properly)](#texture-and-colour-applying-textures-properly)
- [Film and screen emulation](#film-and-screen-emulation)
- [Line and markup animation](#line-and-markup-animation)
- [Camera, depth and transitions](#camera-depth-and-transitions)
- [3D in After Effects: cinematic documentary pop-up scene](#3d-in-after-effects-bilto-cinematic-documentary-pop-up-scene)
- [Sound design](#sound-design)
- [Workflow and presets](#workflow-and-presets)
- [Add-ons, assets and tools named](#add-ons-assets-and-tools-named)
<!-- skill-navigation:end -->

# Paid tools to Resolve, Remotion and Blender

After Effects, Premiere, Twixtor, Saber and Element 3D style effects mapped to free tools. All mappings are UNTESTED: the first set of lines was written from memory and the replacements come from tutorials, not from a run on this machine. Run an effect once and look at frames before you rely on it. The creative recipe (Vox look, art direction) belongs to `2d-generalist`. This file only says how to build each piece with free tools.

## Quick map (untested)

| Paid tool or effect | Free replacement | Where the steps are |
| --- | --- | --- |
| Twixtor | Resolve Optical Flow retime with cleaned frames, Render in Place | `retime-and-speed.md` |
| CC Time Blend | Fusion Time Blend with Loop nodes | `fusion-effects.md` |
| Saber | Fusion Glow plus Blur on a Text+ or mask, Neptune style glow | `fusion-effects.md` |
| Element 3D, Depth | Fusion 3D (Replicate 3D, Text 3D) or Blender then import GLB or EXR | `fusion-effects.md` |
| Roughen Edges, Halftone, Turbulent Displace | Fusion nodes of the same job | `fusion-effects.md` |
| Lumetri, Dehancer | Resolve Color page (Dehancer is paid OFX) | `color.md` |
| Warp-O-Matic, Tween | Displace plus Create Bump Map (Studio free fallback) | `fusion-effects.md` |
| Premiere and AE transitions | Adjustment-clip Fusion transitions | `transitions.md` |
| AE camera shake, Wiggle | Fusion Camera Shake, Shake modifier, Anim Curves | `shakes-and-camera.md` |
| AE Posterize Time | Frame hold in Resolve Retime or Remotion frame quantising | the technique entry below |

## Art direction: the "analog Vox" system (core recipe)

### Analog-over-digital stack (Vox look)
makes a flat 2D comp read as paper, screen or print instead of vector.
  - Steps: (1) background never pure white: pick a warm or cool tone and nudge about 4% (paper absorbs room light);
    (2) roughen sharp lines: Roughen Edges, border size 2 to 3; (3) texture layer (halftone grunge from texturelabs.org,
    scaled down, 50% grey) on an overlay-family blend mode; (4) adjustment layer "chromatic aberration and vignetting":
    Quick Chromatic Aberration plugin (about 0.8, 1.5 looks amateur) plus Lumetri Color > Vignetting; (5) light-leak
    texture on top, blend mode Add (black background, so use the lighten family); (6) adjustment layer with Posterize
    Time 12 (8 for a collage look).
  - Use when / pitfalls: apply as the last adjustment layers over every comp in a piece; over-strong chromatic
    aberration looks amateur. Vox frame rate sits near 12 and eases are long (1 to 2 s); almost no solid colours, every fill is mapped to a texture.
  - Free equivalent: Fusion: Background (warm grey) > Merge with Loader (halftone) in Overlay mode > custom chromatic
    aberration via three Channel Booleans with offset Transform nodes on R and B > Vignette node > Merge (Add) light leak >
    "Time Speed"/frame-hold via Fusion `Time Stretcher` or a `Fuse` posterize; Remotion: stack `<AbsoluteFill>` layers with
    CSS `mix-blend-mode: overlay|add`, SVG `feColorMatrix` and `feOffset` per channel for aberration, CSS `radial-gradient`
    vignette, and quantise time with `const f = Math.floor(frame/2)*2` (12 fps from 24).

### Posterize Time / cutting on twos or threes
the choppy hand-made frame rate.
  - Steps: Layer > New > Adjustment Layer, name it "posterize", Effect > Time > Posterize Time, frame rate 12 (24 on
    twos); 8 on threes for a stronger collage feel. Put it over everything. Stop-motion versions: 8 fps on page turns,
    4 fps for a macro paper slide.
  - Use when / pitfalls: apply once per comp on a top adjustment layer, not per layer.
  - Free equivalent: Remotion: wrap time (`useCurrentFrame()`, `Math.floor(frame/2)*2`) before computing any animation;
    Fusion: `Fuse`-free approach is Time Speed node set to hold, or Resolve Edit page "Retime" > "Frame Hold on N"; Blender:
    F-curve Stepped Interpolation modifier (Graph Editor > Add F-Curve Modifier > Stepped Interpolation, step size 2).

### Footage homogenization
makes mismatched archival clips look like one source.
  - Steps: adjustment layer 1: Fast Box Blur radius 6, radial mask, invert, feather (edges blur, eye goes to the middle);
    adjustment layer 2: CC Ball Action with grid spacing 0 (pixelation), Quick Chromatic Aberration about 2, Exposure with
    expression `wiggle(24, 0.05)`, Add Grain size 1.4 with viewing mode Final Output. Variants: force black and white,
    heavy grain, blur map, slight aberration. Rule: the exact effects matter less than identical treatment on every clip.
    The Short's own stack, numbered on screen at 0:20: 1. film grain, 2. blur map (edges soft, centre sharp),
    3. chromatic aberration. Its after shots also pull each clip's grade (orange phone sunset, teal cinema, beige home
    video) toward one muted, slightly cool look, so match the grade before the texture. It shows no editor panel, so
    it gives no values.
  - Free equivalent: Fusion: FastNoise grain Merge (Overlay) + Blur with a Ellipse mask + Brightness/Contrast driven by a
    Bezier expression `Time`-based noise; Resolve Color page: Film Grain OFX, Blur, Chromatic aberration in Fusion; Remotion:
    CSS `filter: blur() grayscale()` + an SVG `feTurbulence` grain layer at overlay + `opacity` jitter from `random(frame)`.

### Layered backgrounds instead of flat solids
gives a piece identity.
  - Steps: pull in 2 to 4 images that support the subject (capitol, newspaper scans, architecture), precomp them, add
    Tint on top: map blacks to dark grey (not pure black), whites slightly brighter so contrast stays subtle, add a texture.
  - Free equivalent: Remotion: `<Img>` layers with CSS `filter: grayscale(1) contrast(.7)` and `mix-blend-mode`; Fusion: Loader >
    ColorCorrector (Gain/Lift) > Merge; AE Tint equals Fusion `Duplicate`-free "Color Corrector" with Lift and Gain colours.

### Recurring motif for creator identity
a colour, pattern or signature sound repeated in every video (example: grid
 lines in a "blueprint" series; a gasp sound effect). Several motifs stacked build recognition.

## Texture and colour (applying textures properly)

### Blend mode and texture normalisation
stops a texture shifting colours.
  - Steps: white-background texture: use Darken family (Multiply). Black-background texture: Lighten family (Screen/Add). For
    Overlay or Soft Light: desaturate, then add Levels and move the middle grey (gamma) point to the histogram peak so the
    texture centres on 50% grey; stack a second Levels to strengthen. Control strength with a Curves effect on the texture
    itself, not layer opacity (opacity muddies colours).
  - Free equivalent: Fusion: Loader > ColorCorrector (Saturation 0) > ColorCurves/`Gamma` match to 0.5 > Merge with Apply Mode
    Overlay/Soft Light, strength via Blend slider after curves; Remotion: pre-process the texture with CSS
    `filter: grayscale(1) contrast(x) brightness(y)` then `mix-blend-mode: overlay`; Blender: Compositor Mix node
    (Overlay/Multiply) with a Color Ramp or RGB Curves on the texture.

### Texture scale and tiling (the quarter trick)
believable texture size.
  - Steps: free textures (texturelabs.org) are huge, so scaling them down runs out of texture: tile with CC RepeTile in AE
    (Pattern layer in Photoshop). Drop a quarter (coin) on the design as a real-world size reference, scale texture and
    design until detail sizes look right next to it, delete the coin. Seams are fine for overlays.
  - Free equivalent: Fusion `Tile` node (or Transform with Edges: Wrap); Remotion: CSS `background-repeat: repeat; background-size`;
    Blender: Texture Coordinate > Mapping (Scale) feeding an Image Texture with Extension Repeat.

### Texture as frequency channels
highs, mids, lows each in its own lane.
  - Steps: highs = fine noise; mids = halftone pattern (medium density); lows = animated light refractions (broad soft
    distortions). One texture per band; two mids in the same band go muddy.

### Authentic texture from a physical source
scan a thrift-store magazine, apply a high-pass filter to isolate detail.
  - Steps: scan, Photoshop/AE high-pass, set to Overlay, Levels to tune strength, add Chromatic Aberration on text and
    graphics to mimic colour misregistration.
  - Free equivalent: Fusion: Loader > Blur (large) subtracted via Merge (Subtract/Difference) or Sharpen > ColorCorrector;
    Remotion/CSS: same high-pass with an SVG `feConvolveMatrix`; Blender Compositor: Filter node (Sharpen) + Mix Overlay.

### Make text sit in a textured surface
kills the pasted-on look.
  - Steps: (1) Turbulent Displace with size down to 2 (breaks sharp edges); (2) Displacement Map mapped to the texture layer
    beneath so the text bends with the surface; (3) Noise inside the text with grain size matched to the texture. Never use
    pure white or pure black text; nudge colours off. Text on Multiply.
  - Free equivalent: Fusion: Text+ > Displace (Reference = texture) > FastNoise masked in the Text+ shading > Merge Multiply;
    Remotion: SVG filter `feTurbulence` + `feDisplacementMap` on the text (`filter: url(#id)`), noise overlay with
    `mix-blend-mode: multiply`; Blender: Displace modifier or Shader Noise into text material.

### Print decay (ink bleed on type)
vintage magazine lettering.
  - Steps: Roughen Edges with the scale turned down; letterpress texture with Fractal Noise (lower brightness, reduce scale
    until ink looks pressed in); ink bleed = tiny Gaussian Blur plus a soft Drop Shadow.
  - Free equivalent: Remotion: SVG filter chain `feTurbulence` > `feDisplacementMap` (scale about 2) > `feGaussianBlur stdDeviation=.8`
    on text; Fusion: Text+ > Displace with FastNoise > Blur > Merge Multiply.

### Netflix-documentary typewriter text (full build)
macro paper, aged type, ink flecks, lens blur.
  - Steps: (1) paper texture (Texture Labs), crinkled area, Curves then Tint (sample shadows and highlights from reference for the oxidised look), re-add contrast with Curves; (2) text set to Multiply with letterpress blotch: Fractal Noise with raised contrast, lowered brightness, small scale (HLS Noise in grain mode works but is less controllable); (3) Roughen Edges, low scale and border; (4) ink bleed: Gaussian Blur 2.5 with Repeat Edge Pixels OFF, then stacked Drop Shadows: distance 0, opacity 50% softness 3; copy at lower opacity with more spread; third at 15% opacity more softness; copy all effects to the layer above, both on Multiply; (5) ink flecks: duplicate text, rename "ink fleck", turn fill off, black stroke 13, add Turbulent Displace (default) then Roughen Edges, raise border size, lower scale, raise sharpness; parent the fleck layer's Source Text to the main text; (6) precomp "macro paper", animate position left to right over 1.5 s, add adjustment layer Posterize Time 4 fps, add sound; (7) "sauce" adjustment layer: Quick Chromatic Aberration 0.5, Camera Lens Blur 8 to 13 with a blur map (shape layer, linear gradient black-white-black, layer hidden, Invert Blur Map ticked), then CC Vignette. Camera Lens Blur is very heavy: disable while working.
  - Use when / pitfalls: keep the paper moving with the text (the reference left it static and looked uncanny). Transition: shoot chaotic
    camera shake at the slowest shutter (Blackmagic Camera app) as a flash cut between two similar text comps.
  - Free equivalent: Fusion: Text+ > Blur 2.5 > Merge Multiply + DirectionalBlur/LensBlur node (`LensBlur` in Fusion Studio, Resolve "Lens Blur" OFX) with a Gradient-based Depth map; Remotion: stacked CSS `text-shadow` at 0 offset with increasing blur for ink bleed, SVG filter for roughen, `mask-image: linear-gradient` + `backdrop-filter: blur()` for the lens falloff; Blender: Compositor Defocus node (Z-buffer = gradient image) with Bokeh.

### Paper that looks real
paper assets in animation.
  - Steps: drop paper layer opacity about 5% (real paper leaks light; or two page layers with the top at about 90% so the
    second page shows through); never pure white: Curves, pull highlights down about 10%; tint slightly warm or cool to
    match lighting; add paper fibres or noise; add paper sound effects. For collage: tint paper and push highlights off-white.
  - Free equivalent: Remotion: `opacity: .95`, `filter: sepia(.1) brightness(.92)`, SVG `feTurbulence` fibre overlay; Fusion: Merge
    Blend 0.95 > ColorCorrector Gain highlights.

### Risograph overprint
misaligned ink layers in limited palette.
  - Steps: split animation into two comps (ink one, ink two); tint each with a different ink colour; set both to Multiply
    (overprint); inside each comp add halftone texture on Hard Mix at about 50% opacity; add slight offset between the two
    comps and animate the texture.
  - Free equivalent: Remotion: two `<AbsoluteFill>` layers with CSS `mix-blend-mode: multiply`, `filter` for tint, small
    `translate`, SVG halftone `<pattern>`; Fusion: two Merges (Multiply) with a Dither/Halftone via ColorCorrector Threshold on FastNoise.

### Halftone and moire
printed dots that shimmer.
  - Steps: high-res halftone texture (Texture Labs) over footage, Overlay or Linear Light, strength via Curves; reduce dot size
    with CC RepeTile; add slow camera movement so the overlay "dances" and moire appears.
  - Free equivalent: Fusion: Loader (halftone) > Transform (slow animated Size/Angle) > Merge Overlay; Remotion: CSS
    `radial-gradient` dot pattern with `background-size` animated and `mix-blend-mode: overlay`; Blender: Mix Overlay with tiled Image Texture.

### Collage cohesion and hiding low-res images
unify photos from different sources.
  - Steps: colour system (colour pick from strong references); Tint effect to map whites to one colour and blacks to another
    (dial back for subtle); hide low quality with a halftone or fine grain: use the texture as a luma mat for the photo and tweak Levels;
    less contrast in the background layers, more in the foreground (fake depth); cardboard texture over everything; fragment a photo into overlapping pieces with changed opacity and weave text/shapes between.
  - Free equivalent: Fusion: ColorCorrector Lift/Gain per layer, Merge with Loader as mask via Matte Control; Remotion: CSS `mix-blend-mode`
    and `mask-image` from a halftone PNG.

### Analog crunch (blur plus unsharp)
scans-like edges.
  - Steps: Gaussian Blur 2 px on an adjustment layer (ink bleed), then Unsharp Mask on top, radius about 5, amount to taste.
  - Free equivalent: Fusion: Blur (2) > UnsharpMask node (Size 5); Remotion: SVG `feGaussianBlur` then `feConvolveMatrix` sharpen.

### Animated shadow pattern
window or tree light moving across a still.
  - Steps: white solid, shape layers for window panes and an organic tree cutout; animate slightly; blur; tint cool shadows and
    warm highlights; precomp, layer over the image, Linear Burn, tune opacity.
  - Free equivalent: Fusion: Polygon/Rectangle masks on Background > Blur > Merge (Multiply) with animated Transform; Remotion:
    SVG shapes with `feGaussianBlur`, animated `translate`, `mix-blend-mode: multiply`; Blender: gobo on a Spot Light (Shader Editor image mask on light node).

### Movie title look (halation, grain, softness)
plain text becomes a film title.
  - Steps: halation = reddish glow via Inner and Outer Glow; animated Add Grain; low Gaussian Blur for optical softness.
  - Free equivalent: Fusion: Text+ > Glow (red tint) > Blur > Merge with FastNoise grain; Resolve Color page Halation OFX; Remotion:
    CSS `text-shadow: 0 0 8px rgba(255,60,40,.6)` and `filter: blur(.4px)`.

### Fractal-noise light streaks behind titles
premium moving light.
  - Steps: new solid, Fractal Noise; Transform > turn off Uniform Scaling, compress scale width to get thin streaks; Evolution
    expression `time * 200`; Levels to crush contrast; texture on top.
  - Free equivalent: Fusion: FastNoise with non-uniform Size X/Y, animate Seethe/Detail via Time expression, then Brightness/Contrast;
    Remotion: SVG `feTurbulence` with `baseFrequency="0.002 0.08"` and animated `seed`/`baseFrequency` by frame; Blender: Noise Texture with Mapping scale.

### Photo depth treatments (three-layer)
documentary photo that never looks flat.
  - Steps: fringe blur (soften frame edges, subject sharp), film dust from Texture Labs, vignette, slow zooms. Variant: dust
    overlay or shadow overlay from Adobe Stock in Premiere with a slow keyframe drifting light.
  - Free equivalent: Resolve Edit/Fusion: Blur with Ellipse mask inverted, Loader dust Merge Screen, Vignette node, Transform Size keyframes; Remotion: CSS `mask-image: radial-gradient` + `backdrop-filter`.

## Film and screen emulation

### Gate weave and exposure flicker
old-film jitter for stills and titles (Stranger Things).
  - Steps: Effect > Distort > Transform with a subtle `wiggle` on Position; Effect > Color Correction > Exposure with a tiny
    `wiggle` on Exposure; add grain. Short on position and exposure: two expressions, one each. Example in the longer video: `wiggle(24, 0.05)` on exposure.
  - Free equivalent: Remotion: `translate(random(`x${frame}`)*2-1 px, ...)` per frame plus `filter: brightness(1 + (random(`b${frame}`)-.5)*0.05)`; Fusion: Transform with a Perturb/Random expression, ColorCorrector Gain with `Perturb`/`Random` expression (Fusion modifier "Perturb").

### Screen treatment (monitor and CRT look)
web or laptop recordings feel like a screen.
  - Steps: adjustment layer "screen treatment": Venetian Blinds (Transition Completion about 5%, direction 90 for horizontal
    lines, width about 8, feather 1), Solid Composite with black background so the scan lines show black not transparent;
    duplicate with rotation 180 for a pixel grid; Quick Chromatic Aberration about 1.2; CC Lens for bulge (remove for flat laptop); Lumetri
    vignette; Exposure with expression `wiggle(240, 8)` style (spoken "240 8") for refresh flicker. Old TV: animate a soft black bar sliding top to bottom on loop and shift white balance for phosphor cast; film a real CRT on 50% grey as an overlay set to Overlay; vintage TV frame from Adobe Stock; slow camera move across the screen.
  - Free equivalent: Fusion: Background (black) with stripe via Rectangle repeat (`Duplicate`) or a procedural gradient Merge Multiply for scan lines; LensDistort for bulge; Remotion: CSS `repeating-linear-gradient(0deg, transparent 0 3px, rgba(0,0,0,.25) 3px 4px)` overlay, SVG chromatic offset, `filter: brightness()` flicker via `random(frame)`; Blender: Compositor Lens Distortion + Mix Multiply scan texture.

## Line and markup animation

### Pencil/pen line draw
hand-drawn underline or arrow.
  - Steps: Pen tool, draw a rough path (do not go end to end, nudge points up and down); stroke 5 px; Add > Trim Paths: keyframe End
    from 0 to 100 over 1 s, light easing (Motion plugin handles); Roughen Edges with border size about 3.5 (below stroke width,
    border 8 on a 5 px stroke erases it); pen look blend mode Multiply; edge boil: alt-click Random Seed and type `time*4`; Posterize
    Time 12 adjustment layer. Animate out: keyframe Trim Paths Start 0 to 100. Taper: Stroke Taper "End Length" tuned like a pen lifting; Turbulent Displace amount about 50, scale and complexity 2; Roughen Edges for graphite, Photocopy effect for ink (adjust border).
    Edge boil (hand-drawn look): Roughen Edges border about half stroke width, Turbulent Displace amount 80 size 2, random seed `time*4`; duplicate with larger size and lower amount for more movement.
  - Use when / pitfalls: border size too large deletes the stroke.
  - Free equivalent: Remotion: SVG `<path>` with `strokeDasharray=len` and `strokeDashoffset` animated by `interpolate`, SVG filter `feTurbulence` seed changed every 3 frames (`seed={Math.floor(frame/3)}`) with `feDisplacementMap`; or `@remotion/paths` `evolvePath`; Fusion: Polyline mask with Start/End Stroke animation (Mask `Polyline` > "Write On" start/end) + Displace with FastNoise Seethe; Blender: Grease Pencil with Build modifier and Noise modifier (set Noise frame step 3).

### Marker highlighter
highlight lines of text.
  - Steps: path over the line, yellow stroke, scale about 25 px, blend Multiply so black text shows; Trim Paths End 0 to 100, minimal
    easing (viewer is reading along); duplicate and stagger to next line; Turbulent Displace size 2 (rough edges), duplicate with larger
    size and lower amount (inconsistent hand); copy effects; Posterize Time on top. Scale rule: a highlighter cannot cover a big header.
  - Free equivalent: Remotion: SVG path stroke with `mix-blend-mode: multiply` and `stroke-dashoffset` animation; Fusion: Polyline Mask + Merge Multiply.

### Contrast callout (hard-cut focus)
dims everything but the target.
  - Steps: adjustment layer with Curves: pull the bottom (black) point up to lower contrast (faded look); pen mask around the target,
    Invert, feather; drop contrast to midpoint; hard cut it on with a circuit-breaker or mechanical click SFX; parent label, callout, map and
    texture (Multiply, below label) to a null "controller" and animate scale and position with an ease-in whose velocity peak lines up
    with the callout start (cut at the curve peak).
  - Text version: duplicate text, animate the lower copy opacity 100 to about 20, controller null scale up about 10%; reveal the top copy
    masked around key words with Linear Wipe: angle 270, completion 100 to 0, feather about 55, offset slightly after the zoom; paper texture on Screen.
  - Free equivalent: Remotion: `<div>` dim layer with `backdrop-filter`/`opacity` and an SVG `mask` (evenodd rect + path) with `feGaussianBlur` feather; Fusion: ColorCorrector on a Polygon-masked Merge; Blender: Compositor Mix + Ellipse Mask node with feather.

### Focal callout (focus pull on a map)
sharp pocket, blurred surround.
  - Steps: shape layer, full-size, radial gradient fill (hidden), rename "gradient map", compress the gradient's two stops closer; adjustment
    layer with Compound Blur: Blur Layer = gradient map, Effects and Masks, Invert Blur ticked; animate gradient start point between regions with long extreme easing. Also: Radial gradient Multiply + Compound Blur center point. Camera-search variant ("focus hunting"): adjustment layer Fast Box Blur keyframed like a DSLR refocusing, best on fast motion or zoom.
  - Free equivalent: Fusion: `Blur` node with Blend/Mask input = Ellipse mask animated (Soft Edge high), or `LensBlur`/`DepthOfField` fed by a Gradient depth; Remotion: two layers, sharp image under a `filter: blur()` copy masked with `mask-image: radial-gradient(circle at X Y, transparent, black)`; Blender Compositor: Defocus with Z-pass from gradient.

### Radio-wave call-out (location pulse)
expanding rings on a map.
  - Steps: new solid; Effects and Presets > Radio Waves (built in), white, start width about 8, end width 0 or 1; position keyframed to track the
    point; stroke profile Sawtooth In; 3D layer with orientation set flat for a 3D look; scale up to cover; add Compound Blur
    with the gradient map and Quick Chromatic Aberration about 0.8 to blend. Related built-ins: switchable cursor element (double click to get an
    animatable cursor), number counters (monospace so digits do not jitter).
  - Free equivalent: Remotion: N SVG `<circle>` with `r = interpolate((frame+i*10)%60,[0,60],[0,R])` and fading `opacity`; wrap in CSS `transform: rotateX(70deg)` for 3D; Fusion: Ellipse (Border Width) copies with offset Time via expression `Time%1`; Blender: Array of animated circles/Geometry nodes with Curve Circle and scale keyed by `frame`.

### Ink bleed reveal and logo reveal
crawling ink uncovers art.
  - Steps (luma mat): ink bleed overlay footage above the artwork; artwork layer track matte "Inverted Luma Matte" (bright overlay shows the design).
    Footprint-style spread: Simple Choker animated 100 to 0 then Roughen Edges; logo version: Simple Choker (positive down to 0), Roughen Edges, Posterize Time 12.
  - Free equivalent: Fusion: Loader (ink footage) > Luma Keyer/ChannelBooleans into Merge Effect Mask of the artwork; Matte Control node; Remotion: CSS `mask-image` with a video, `mask-mode: luminance` and `<OffthreadVideo>`; choker equals SVG `feMorphology operator="erode" radius` animated + `feTurbulence` displacement.

### Animated text presets (Vox typography)
Text Animator saved as presets.
  - Steps: Text layer > Animate > per-character properties: yellow brand colour pops then fades to charcoal for legibility; random letters appearing; odometer
    pop-in (letters arrive like a slot machine). Save to a preset. Keep one text animation at a time.
  - Free equivalent: Remotion: split string into `<span>`s, per-index `interpolate` with delay `i*2` frames, colour interpolate yellow to charcoal, slot machine via `translateY` through random glyph list; Fusion: Text+ Write On / Follower modifier with Range.

### Jitter (paper cutout motion) instead of wiggle
stop-motion snaps.
  - Steps: apply on position, rotation or scale via two lines of expression: values snap to a new random offset every few frames rather than smoothly oscillating (a wiggle oscillates, jitter steps). Useful on text for a paper-cutout feel. Equivalent: Posterize Time on the layer.
  - Free equivalent: Remotion: `const step = Math.floor(frame/4); const x = (random(`x${step}`)-.5)*8;` Fusion: Transform Center with a Perturb modifier plus Held Time Speed or Expression `math.floor(time/4)`; Blender: Noise F-Curve modifier + Stepped Interpolation.

### Spotify Wrapped 2025 look
repeating outlines, ripple, difference overlays.
  - Steps: shape layer with stroke, Offset Paths to expand concentric outlines; adjustment layer Wave Warp to ripple the whole frame; stack comps and set the top to Difference for trippy overlays; keep artwork in black, white and 50% grey then Tritone to map to the palette in one pass (mask and invert for variation); scribbles: Turbulent Displace with animated Evolution.
  - Free equivalent: Remotion: loop of SVG paths with `stroke` and CSS `transform: scale()` (or `offsetPath` via `polygon-offset` library) plus SVG `feDisplacementMap` with `feTurbulence`; CSS `mix-blend-mode: difference`; Fusion: Rectangle border copies, Displace, Merge Difference, Color Gradient map via `ColorCurves` or `GradientMap`-style `Gradient` with `Map Range`.

### Audio visualizer (stylised)
reactive waveform.
  - Steps: new solid, Audio Waveform effect, Audio Layer dropdown to the track, display analog lines, dots or digital, raise Maximum Height; duplicate several times with
    different styles and colours, slightly offset; two Glow effects stacked, grain on top.
  - Free equivalent: Remotion: `@remotion/media-utils` `useAudioData` + `visualizeAudio({fps, frame, audioData, numberOfSamples})` drive SVG bar heights; Fusion: no audio waveform node natively but use Fusion's Audio Waveform via Fuse/“Bar” expression with `Audio` modifier; Blender: Bake Sound to F-Curves (Graph Editor > Channel > Bake Sound to F-Curves) driving scale.

## Camera, depth and transitions

### Cutting the curve (seamless cut at peak velocity)
invisible hard cut between two scenes or photos.
  - Steps: keyframe scale/position of the first object with heavy ease in and out; parent the second object to the first so they share the same movement and
    position; open the Graph Editor, find the peak of the velocity curve, make a hard cut there; for Vox look add Posterize Time 12. Gradient sweep plus card rotation
    version (Google-style ads): extreme ease curves (fast acceleration and deceleration), cut mid-curve keeping the same direction. Cut on action: cut wide to tight mid climb of a bar; avoid cutting on stillness.
  - Free equivalent: Remotion: single `interpolate` curve using `Easing.bezier`, reuse the same transform value for the next `<Sequence>` start (`from=cutFrame`); Fusion: Transform keys with Spline velocity at peak then Dissolve with 0 frames; Blender: same F-curve on an Empty parent, camera cut via Timeline marker bound (Ctrl+B).

### 2.5D parallax from a still
depth in a flat photo or design.
  - Steps: choose an image with clear foreground, midground, background; separate layers in Photoshop and patch hidden areas with Clone Stamp (or Generative Fill); AE: enable 3D
    on all layers and space in Z; the free Depth plugin has a one-click Disperse; slowly dolly or pan the camera. Glow on text: free Saber plugin plus Four-Colour Gradient set to Hue (Google ad).
  - Free equivalent: Fusion: Loader per layer > Transform with Z in `Transform3D` (ImagePlane3D) > Merge3D > Camera3D > Renderer3D; Remotion: `@remotion/three` with `ThreeCanvas` planes at different Z and a `PerspectiveCamera` animated, or CSS 3D `perspective` with `translateZ`; Blender: image planes via Import Images as Planes add-on, camera dolly, Shader Principled with alpha.

### Vox-style map animation
clean map with highlighted regions and reveal.
  - Steps: source a clean map (OpenStreetMap, Library of Congress, or Google Earth Studio for non-commercial; B/W map render); shape layer tracing regions, colours per region, blend Overlay
    (drop map saturation first); reveal with CC Burn Film animated 100 to 0; texture overlay; animated clouds/smoke video for depth; match client brand themes; overlays built in Photoshop and revealed with smoke video.
  - Free equivalent: Remotion: SVG regions (`d3-geo` projecting GeoJSON) with `mix-blend-mode: overlay` and a `clip-path`/mask from a noise video for burn reveal; Fusion: Polygon masks, Merge Overlay, Dissolve via noise Luma matte; Blender: BlenderGIS import + emission material.

### Page turn on documents
tactile newspapers and archival photos.
  - Steps: CC Page Turn on the layer; animate Fold Position from one corner to the other; raise Fold Radius to soften; Posterize Time 8 fps on top for stop motion.
  - Free equivalent: Blender: plane with Subdivision + Simple Deform (Bend) or Cloth; Fusion: no built-in page curl, use a Warp/Displace on a Grid3D (Grid3D > Displace3D > Renderer3D); Remotion: CSS 3D with `transform: rotateY()` and `transform-origin: left`, split into strips for curl.

## 3D in After Effects: cinematic documentary pop-up scene

### Pop-up case-file scene (full AE build)
folder opens, a bank building unfolds from paper, camera flies through the door.
  - Steps:
    1. Photoshop: AI artwork for folder front cover, its reverse, back cover and paper (front and back folding edges must match); isolate building
       (Object Selection tool or Pen), Layer via Copy; load selection (Ctrl-click thumbnail), Select > Modify > Expand about 15 px on the background, Generative Fill to remove the
       building from the ground; split building into sections with Rectangular Marquee and Layer via Cut; cut left and right doors, slightly enlarge them; save layered PSD.
    2. AE import: Composition - Retain Layer Sizes (so each cut has its own bounding box). New comp 1920x1080, 24 fps, Advanced 3D renderer. GLB models from Sketchfab (police car, lamp, phone, ashtray), a Substance material and an EXR environment imported; for each model use Make Comp Size; centre anchors with Ctrl + double click on the Pan Behind tool.
    3. Desk: 3D plane, X Rotation -90; apply Substance wood, darken; lower render and shadow quality while working. Folder comp: 3D on, X -90 on the desk; arrange props with top and left views (side view to check contact).
    4. Folder thickness: duplicate paper layer (Ctrl-D) several times with small offset and rotation, 3D on, press P, Ctrl+Alt drag Z to distribute. Front cover has inside and outside layers close together; Pan Behind anchor on the left edge (hinge); parent inside to outside; keyframe Y Rotation 0 to about 180; fix the gap by keyframing Position so both sides sit flush when open (check bottom view).
    5. Bend: Geometry Options on the cover: Curvature 0 at start, -44% at about 90 degrees, +40% at 180 degrees, Segments 44; copy the three keyframes to the inside layer with segments 44.
    6. Building: 3D on sections; anchor each section at the bottom edge fold (doors on outer vertical edges: left door hinge left, right door hinge right); parent each upper section to the one below (bottom is base); keyframe X Rotation upward slightly past 90 then counter-rotate the upper sections back toward zero as the lower rises; keep slight variations for a handmade look; F9 Easy Ease. Enable Collapse Transformations on nested comps (building into folder, folder into main) so 3D stays in one scene. Doors: parent to bottom section, Y rotation inward.
    7. Police car: separate light bar model with Time Remapping and `loopOut()` (alt-click stopwatch); parent to car; car arrives with a position overshoot (go past, return a few frames later) and X rotation 0 to about 1 and back for braking pitch.
    8. Camera rig: 50 mm camera parented to X-rotation null > Y-rotation null > Position null (3D nulls placed away from the camera as pivots, so the camera orbits); two views while animating; shape the spatial motion path with the Pen tool Bezier handles; add an extra null for the final push; arc over the car hood; Easy Ease and sync car arrival, braking and door opening to the camera.
    9. Depth of field: background image 3D behind the desk; camera Depth of Field on, Aperture about 12, Focus Area Width about 30 (start values); "focus target" null: select null then camera, right-click camera > Camera > Link Focus Distance to Layer; animate the null for focus pulls; animate aperture, focus width and near/far blur through the fly-through.
    10. Transition inside: split layers (Ctrl+Shift+D) after the doors open, trim unused desk/folder; bank interior image 3D filling the doorway (flat image, no real parallax); move focus target inside.
    11. Lighting: Environment Light with Poly Haven "studio small" EXR at reduced contribution; main Spotlight (casts shadows, falloff Inverse Square Clamped) near the desk lamp, tune intensity, radius, cone angle, feather; secondary cool blue spotlight; weak third spotlight on the building; finish with grade, vignette, CC Force Motion Blur on an adjustment layer.
  - Use when / pitfalls: front/back cover edges must line up or gaps appear; nested comps need Collapse Transformations; keep supporting lights weaker than the key.
  - Free equivalent: Blender does all of this natively: Import Images as Planes add-on for the cuts, Empty parents for hinges (origin set via Shift+C/Object > Set Origin), Parent-child chain for the building sections, Simple Deform (Bend) modifier for curvature, camera parented to a three-Empty rig (Ctrl+P), Depth of Field with Focus Object = Empty (Camera data > Depth of Field > Focus on Object), Poly Haven HDRI in World nodes (Environment Texture), Spot Lights with Shadow, and Cycles/EEVEE Motion Blur. Fusion route: ImagePlane3D per cutout, Merge3D, Camera3D with Transform3D parents, Renderer3D with Depth of Field via `Z` depth and `DepthBlur` node. Remotion route: `@remotion/three` with `<group>` pivots and `rotation` driven by `interpolate`.

## Sound design

### Vox sound design workflow
tactile layered SFX plus mix.
  - Steps: Soundly (free version) as library index with six folders: mechanical, tech, tactile, ambience, whooshes, miscellaneous; sources Musicbed,
    freesound.org, Soundly Pro; Soundly preference to copy dropped sounds next to the project (Premiere); add about 10 audio tracks; place camera shutter for black-to-white flash, low-frequency whoosh for emerging objects, paper movement
    stacked under whooshes, marker for drawn lines, stopwatch ticks for chart motion with R (rate stretch tool) to pitch-vary, Alt-drag to duplicate; mouse click, laptop keyboard stroke, cloth
    movement for collapsing windows, subtle digital sound for pixelation, projector hum ambience; restraint: sound only the most important element, not every arrow and text; offsets of a few frames are fine for choppy style; J-cut sounds slightly before the scene.
    Levels: dialogue about -6 dB, music about -20 dB, SFX between -10 and -20 dB; on the music track add Special > Mastering effect, preset "Make Room for Vocals" (frequency pocket), music about -20 dB.
  - Free equivalent: DaVinci Resolve Fairlight: Fairlight page tracks, Sound Library, Dialogue Leveler, and an EQ with a dip around 1 to 3 kHz on music (or Fairlight "Ducker"/Dynamics sidechain compression); Remotion: `<Audio volume={...} />` inside `<Sequence from={frame}>` with `volume` callback for ducking; Blender VSE: Sound strips with Volume keyframes.

### Layered illusion sound design
build a scene from textures (rain from bacon): distant wind, light rain ambience, thunder crack (a bowling ball roll), close drops (bacon sizzle); search for audio textures not the literal sound.

### Tactile sound categories
paper rustle, felt marker, film camera snap, set click; layer, adjust levels.

### Documentary music choice
neutral, non-competing with narrator, emotionally neutral library music (KPM-style; Vox's source is expensive); marimba gives curious/playful discovery, pizzicato strings give investigative feel; preview tracks against the timeline before licensing (Adobe Stock panel in Premiere).

## Workflow and presets

### Preset workflow (DRY editing)
build a stack once, reuse.
  - Steps: shift-select the properties and Save to the library as an animation preset; FX Console (free plugin) as a search bar for presets; make a transform preset (overshoot, wiggle)
    so motion stacks non-destructively; Motion plugin for easing instead of the graph editor; keep a "sauce" adjustment layer; quick expression shortcuts via an effects search bar.
  - Free equivalent: Remotion: a library of reusable React components/hooks (`useJitter`, `<InkFilter/>`) in a shared package; Fusion: save macros (right-click a node group > Create Macro) and settings in the Bin; Blender: node groups and Asset Browser.

### Rebus typography
weave images and icons into the text layout, replacing words; match the image scale and alignment to the type (IBM logo letters).

## Add-ons, assets and tools named

| Name | Free or paid | For | Source |
| --- | --- | --- | --- |
| Texture Labs (texturelabs.org) | Free, commercial use | halftone, paper, dust, light-leak, cardboard textures | |
| Quick Chromatic Aberration | Free AE plugin | chromatic aberration adjustment layer | |
| Depth (AE plugin) | Free | one-click 3D Disperse of layers | |
| Saber (AE plugin) | Free | glow on text | |
| FX Console | Free | search bar for effects and presets | |
| Motion (AE) | Paid (named) | easing presets | |
| Soundly | Free tier and Pro | SFX library index | |
| freesound.org | Free | SFX | |
| Musicbed | Paid | music | |
| KPM library | Paid | documentary music source | |
| Adobe Stock panel (Premiere) | Paid | overlays, TV frames, music | |
| Google Earth Studio | Free, non-commercial | black-and-white map and aerial animation | |
| OpenStreetMap, Library of Congress | Free | clean map sources | |
| Poly Haven (studio small EXR) | Free CC0 | environment light | |
| Sketchfab GLB models | Mixed, check licence | props in AE 3D | |
| Substance material | Paid (Adobe) | desk wood | |
| Photoshop (Generative Fill, Object Selection) | Paid | cutouts and clean plates | |
| Blackmagic Camera app | Free | slow-shutter flash transition footage | |

