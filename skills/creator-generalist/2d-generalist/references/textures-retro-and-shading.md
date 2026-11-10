# Textures, Retro and Print Looks, Shading, Colour and Blur (After Effects recipes with free-tool routes)

Grain, paper, halftone, dither, CRT, VHS, risograph and misregistration, engraving, boil, duotone and grit finishing stacks, flat shading (form shadow, AO, reflected light, highlights), stacked shadows and glows, chromatic split, psychedelic colour, stop-motion cutout looks and blur tricks. Every entry gives what it makes, the exact After Effects (AE) steps, the principle, free-tool routes (Fusion, Blender, web/SVG/canvas, Remotion), a pitfall, source links and how far it was verified.

## Reading Map

- [How to read an entry](#how-to-read-an-entry)
- [Rules that repeat across every recipe](#rules-that-repeat-across-every-recipe)
- [1. Grain and noise](#1-grain-and-noise)
  - [Gray-solid overlay grain and Noise HLS Auto](#gray-solid-overlay-grain-and-noise-hls-auto)
  - [Noise against banding, and grain to match footage](#noise-against-banding-and-grain-to-match-footage)
  - [Dissolve-mode grain and stipple gradients](#dissolve-mode-grain-and-stipple-gradients)
  - [Animated stipple grain inside the art only](#animated-stipple-grain-inside-the-art-only)
  - [Grain shading with Roughen Edges and Set Matte](#grain-shading-with-roughen-edges-and-set-matte)
  - [Hand-drawn grain loop clipped per part](#hand-drawn-grain-loop-clipped-per-part)
- [2. Paper and texture loops](#2-paper-and-texture-loops)
  - [Looping paper, speck and grit texture](#looping-paper-speck-and-grit-texture)
  - [Texture control: Curves, dark twin, recolour](#texture-control-curves-dark-twin-recolour)
  - [Per-piece paper texture and displacement by the paper](#per-piece-paper-texture-and-displacement-by-the-paper)
  - [Texture fills: hole-punch wear, Motion Tile, jittering plastic](#texture-fills-hole-punch-wear-motion-tile-jittering-plastic)
  - [Watercolour shadow and clipped texturing](#watercolour-shadow-and-clipped-texturing)
- [3. Boil, stepped time and shake](#3-boil-stepped-time-and-shake)
  - [Posterize Time: on twos](#posterize-time-on-twos)
  - [Hand-drawn boil stack (Turbulent Displace)](#hand-drawn-boil-stack-turbulent-displace)
  - [Fine grit on edges and Roughen Edges layering](#fine-grit-on-edges-and-roughen-edges-layering)
  - [Gate weave and misregistered shake](#gate-weave-and-misregistered-shake)
  - [Frame-by-frame sources: flame, traced drawings](#frame-by-frame-sources-flame-traced-drawings)
- [4. Print looks](#4-print-looks)
  - [Halftone from lens blur](#halftone-from-lens-blur)
  - [CMYK colour halftone with overprint](#cmyk-colour-halftone-with-overprint)
  - [Misregistered print (plates split)](#misregistered-print-plates-split)
  - [Photocopy newsprint and collage borders](#photocopy-newsprint-and-collage-borders)
  - [Engraving (banknote) look](#engraving-banknote-look)
- [5. Dither](#5-dither)
  - [Ordered dither (Bayer plus Threshold)](#ordered-dither-bayer-plus-threshold)
  - [Dither at any scale, colour dither, distorted dither](#dither-at-any-scale-colour-dither-distorted-dither)
- [6. Screen and analogue looks](#6-screen-and-analogue-looks)
  - [CRT phosphor dots](#crt-phosphor-dots)
  - [Damaged VHS signal](#damaged-vhs-signal)
  - [LED glitch and block-noise glitch map](#led-glitch-and-block-noise-glitch-map)
  - [Projector-era and logo-era looks (70s, 80s, 90s anime)](#projector-era-and-logo-era-looks-70s-80s-90s-anime)
- [7. Finishing stacks (one adjustment layer)](#7-finishing-stacks-one-adjustment-layer)
  - [The usual three: shake, grain, twos](#the-usual-three-shake-grain-twos)
  - [Retro finish stack with halation](#retro-finish-stack-with-halation)
  - [Gritty duotone stack](#gritty-duotone-stack)
  - [Hand-animated finish stack (bloom, haze, displace, twos)](#hand-animated-finish-stack-bloom-haze-displace-twos)
  - [Glow, noise, tint 80s stack](#glow-noise-tint-80s-stack)
  - [Blur then sharpen to degrade and unify](#blur-then-sharpen-to-degrade-and-unify)
  - [Match a flat character to a plate, then grade](#match-a-flat-character-to-a-plate-then-grade)
- [8. Lighting and shading](#8-lighting-and-shading)
  - [Four-step flat shading formula](#four-step-flat-shading-formula)
  - [Feathered-mask lighting](#feathered-mask-lighting)
  - [Layer styles for volume](#layer-styles-for-volume)
  - [Form shadow clipped to the body](#form-shadow-clipped-to-the-body)
  - [Stacked drop shadows (paper, text, global light)](#stacked-drop-shadows-paper-text-global-light)
  - [Reactive shadows from a light position](#reactive-shadows-from-a-light-position)
  - [Contact shadow and reflections by duplicate layer](#contact-shadow-and-reflections-by-duplicate-layer)
  - [Reflected light and fake sphere reflection (Set Matte plus blur)](#reflected-light-and-fake-sphere-reflection-set-matte-plus-blur)
  - [Stacked glows and hand-placed glow](#stacked-glows-and-hand-placed-glow)
  - [Luma-matte side lights, strobes and pool ripple light](#luma-matte-side-lights-strobes-and-pool-ripple-light)
  - [Lightning and flash light](#lightning-and-flash-light)
  - [Shine sweeps and flash shadows](#shine-sweeps-and-flash-shadows)
  - [Heat shimmer and animated gradient backgrounds](#heat-shimmer-and-animated-gradient-backgrounds)
  - [Thickness and inner glow from one alpha (pumpkin cutout)](#thickness-and-inner-glow-from-one-alpha-pumpkin-cutout)
  - [Soft 80s glow shading by clipped brushes (Photoshop)](#soft-80s-glow-shading-by-clipped-brushes-photoshop)
- [9. Colour and channel looks](#9-colour-and-channel-looks)
  - [Palette from a moodboard in HSB](#palette-from-a-moodboard-in-hsb)
  - [RGB split (chromatic split)](#rgb-split-chromatic-split)
  - [Additive RGB circles and kaleidoscope](#additive-rgb-circles-and-kaleidoscope)
  - [Colorama hyper-colour, rainbow cycle and chrome type](#colorama-hyper-colour-rainbow-cycle-and-chrome-type)
  - [Star glow, stargate slit-scan and Card Wipe glitter](#star-glow-stargate-slit-scan-and-card-wipe-glitter)
- [10. Stop-motion and cutout looks](#10-stop-motion-and-cutout-looks)
  - [Paper cutout boil (Wiggle Paths plus posterizeTime)](#paper-cutout-boil-wiggle-paths-plus-posterizetime)
  - [Cutout utilities: matte from footage, grid warp, cycling fills, spiral stack](#cutout-utilities-matte-from-footage-grid-warp-cycling-fills-spiral-stack)
  - [Strata-cut clay and other real-material sources](#strata-cut-clay-and-other-real-material-sources)
- [11. Blur (shape, depth, look)](#11-blur-shape-depth-look)
  - [Rounded corners and gooey merge (blur plus Levels on alpha)](#rounded-corners-and-gooey-merge-blur-plus-levels-on-alpha)
  - [Depth of field from a blur map](#depth-of-field-from-a-blur-map)
  - [Breathing focus and blurred echo backgrounds](#breathing-focus-and-blurred-echo-backgrounds)
- [12. Organic FX](#12-organic-fx)
  - [Ink and watercolour bleed](#ink-and-watercolour-bleed)
  - [Procedural light leaks](#procedural-light-leaks)
  - [Scan lines and dirt patches](#scan-lines-and-dirt-patches)
- [Licences, paid items and plugin stand-ins](#licences-paid-items-and-plugin-stand-ins)

## How to read an entry

- **Makes**: the look. **AE**: exact effect names, values and expressions as read on frame (feature names current for AE 2024 and later; project-wide settings now sit in the Properties panel). **Free**: Fusion (Resolve), Blender (compositor, 5.x names), web (SVG, CSS, canvas), Remotion. Routes marked "untested" were not run by the source or by us.
- **Check**: `verified` means values were read from a frame; `heard` means narration only. Prefer the verified numbers.
- AE stacks apply top to bottom, so an effect higher in the Effect Controls runs first.

## Rules that repeat across every recipe

- Put the whole look on one top adjustment layer named "Effects" (Ctrl+Alt+Y) so it toggles on and off. Subtlety is the point: flick it off to see the difference.
- Order: colour fixes first, then blur/sharpen, then glow, then displace/shake, then noise, then Tint/duotone, then Posterize Time. Tint collapses colour, so Hue/Saturation after it does nothing.
- Any texture is believable only if it changes a little every 2 to 4 frames, sits inside the shapes, and is tinted into the palette rather than left black or white.
- Match the posterize rate to the rhythm of the art: 12 in a 24 fps comp, 12.5 in 25 fps, 15 in 30 fps.
- Over-size the comp or scale the adjustment's Transform to 101% so shake, displace and rotation do not reveal edges.
- Noise and displace also touch clean vector lines. Use them for rough looks, not crisp ones.

## 1. Grain and noise

### Gray-solid overlay grain and Noise HLS Auto
- Makes: film or print grain without blurring what is underneath.
- AE: Layer > New > Solid, exactly 50% gray, blend mode Overlay (invisible on its own). Add Noise (about 10) or Noise & Grain > Noise HLS Auto (Noise Grain, Lightness 5 to 10, Grain Size 2, Noise Animation Speed 12 or 24) plus Gaussian Blur if softer grain is wanted. Optional Posterize Time 12 on the solid slows the crawl. Built-in alternative: Noise & Grain > Add Grain (Intensity 0.5, viewing mode Final Output; heavy to render). Plain Noise as the last effect: 6% (crime title), 8% (book cover), 10% (moody grade), 20% with Use Color Noise off (neon 80s). Noise on a bare effects adjustment layer softens everything below, hence the gray solid.
- Principle: Overlay leaves mid-gray unchanged, so only the noise variation adds contrast. Add grain last so it unifies stacked elements.
- Free: Fusion Fast Noise plus Blur, Merge Apply Mode Overlay (untested); Blender compositor Noise Texture, Blur, Mix set to Overlay; web `mix-blend-mode: overlay` on a gray `feTurbulence` layer (baseFrequency about 0.8, seed stepped 12 times a second); canvas `globalCompositeOperation = "overlay"`.
- Pitfall: scale the noise layer up (350% seen) so grains are visible at video size; do not stack grain on every layer.
- Check: verified [Noise HLS Auto values, Noise 6% and 20% frames]; the gray-solid Overlay method heard.

### Noise against banding, and grain to match footage
- Makes: dark or full-range gradients without visible steps; a flat element that carries the same grain as a photo or plate.
- AE: project depth 16 bits per channel (Alt-click the depth label in the Project panel), then Noise at 1% (2 to 3% if banding persists, Use Color Noise and Clip Result Values on) above the gradient. To match footage, skip Match Grain: add Noise by eye at 1 to 2%. Gritty red look: Noise HLS Auto (Grain, Lightness 100, Speed 24, Grain Size 1.0), Tint (black to black, white to red), then Levels with the input black dragged right to crush noise in the blacks. Photoshop equivalent: new 50% gray layer, Smart Object, Overlay, Filter > Noise > Add Noise (5 is enough; 10 is too much) with a Screen paper texture above.
- Principle: noise trades visible steps for invisible dither; the colour count is unchanged.
- Free: Blender Output properties > Post Processing > Dither (0 to 1); Fusion low-strength Fast Noise on top (untested); web add 1/255 random offset before quantising, or a tiny noise PNG overlay.
- Pitfall: add noise before compression; a title on noisy footage looks pasted in without it.
- Check: verified [Noise HLS Auto, Tint and Levels frame; Noise 3.0% banding example; Photoshop Add Noise frame]; the 16 bpc step heard.

### Dissolve-mode grain and stipple gradients
- Makes: a soft shadow or rim light turned into one-pixel stipple that follows a light direction (the inside of an iris, a background gradient).
- AE: duplicate the shape layer, fill black, draw an Ellipse mask where the light comes from, tick Inverted, Mask Feather 55 to 65 px, blend mode Dissolve. Add a top adjustment layer with Turbulent Displace (Amount 30, Size 2, Displacement Turbulent) to smudge the pixels. Rim light: duplicate, white, expand the mask, feather 20. For a background: yellow solid with Fill, a feathered Mask Path animated with hold or eased keys, mode Dissolve over a blue solid. For infinite zoom: use tiny feathers (about 6 px); the dissolve grain stays pixel-sharp when scaled, and rendering the result downscaled into a 1080 comp removes harsh noise.
- Principle: Dissolve turns opacity into random per-pixel on/off, so a soft gradient becomes a dither; a little displacement breaks the pixel-perfect look. It re-seeds every frame, so it reads animated; hold keys if a still grain is wanted.
- Free: Krita Dissolve blend mode with Alpha Lock (same method as Photoshop Dissolve brush at size 300 on a 3200 px canvas; canvas size sets grain size); Blender compositor Noise Texture compared to a gradient with Math Greater Than; Fusion Fast Noise through Threshold on a soft Ellipse mask (untested); web `step(noise, gradient)` in canvas, or `feTurbulence` plus `feComponentTransfer` with a discrete table.
- Pitfall: Turbulent Displace on an adjustment layer bumps clean lines too.
- Check: verified [Dissolve layers with inverted mask feather 65; Turbulent Displace 50/100 before change and 30/2; yellow Dissolve gradient layer; 400% grain close-up].

### Animated stipple grain inside the art only
- Makes: a dancing speckle visible only where the artwork is.
- AE: solid exactly 50% gray named "Grain Texture" below the Effects layer. Noise HLS Auto (Noise Uniform, Lightness 100%, Hue 0, Saturation 0, Speed 24). Scale 100 to 350%, blend Overlay, enable Preserve Underlying Transparency (T switch).
- Principle: gray in Overlay does nothing; preserving transparency limits it to the art.
- Free: web SVG noise tile with `mix-blend-mode: overlay` and `mask` of the art; Blender Noise to Mix (Overlay) multiplied by the art alpha; Fusion Merge Overlay with Fast Noise and the art alpha (untested).
- Check: verified [frame 5:20].

### Grain shading with Roughen Edges and Set Matte
- Makes: a halftone-like grainy shadow made from a flat shape, hand-printed riso shading that boils.
- AE: Pen shape for the shadow, parented to the body. Effect order: Set Matte (Take Matte From Layer = body layer, Use For Matte = Alpha Channel, Composite Matte with Original and Premultiply on; both layers Continuously Rasterize), then below it Roughen Edges: Edge Type Roughen, Border 100 to 200 (150 typical, 50 for a highlight), Scale 10, Edge Sharpness 1, Fractal Influence 1, Complexity 2. Roughen must sit below Set Matte so it roughens the shape, not the matte (Set Matte instead of a track matte keeps the stack reorderable). Crush the alpha with Levels, Channel Alpha: black input about 33, white about 215. Boil: Alt-click Random Seed (Evolution Options) and use `time*4`. Rim light: duplicate, fill white, new path, Border 50 to 100. Highlights duplicate the shading path nudged to the edge. Edge Type Spiky or Rusty change the texture.
- Principle: roughening the alpha edge of a gradient shape turns a soft gradient into stipple; stepping the seed makes it boil, which hides that the gradient moves while the texture does not.
- Free: Fusion gradient plus Fast Noise through Threshold, seed `floor(time/4)` (untested); Blender compositor gradient or mask plus Noise Texture and Math Greater Than; web SVG `feTurbulence` plus `feComposite` or `feComponentTransfer` discrete, `seed={Math.floor(frame/4)}` in Remotion.
- Pitfall: longer renders; no effect on adjustment layers (needs alpha); the path must be re-nudged whenever the main shape changes. Pair with 12 fps.
- Check: verified [Set Matte plus Roughen Edges Border 150 and 10 Scale, Levels Alpha, Border 100 and 50 frames].

### Hand-drawn grain loop clipped per part
- Makes: painted grain shading for characters, looping and moving with each part.
- AE: draw dark arcs on 4 to 5 frames with a grain brush in Photoshop, import as Composition with Retain Layer Sizes, set each frame 2 frames long, enable Time Remapping, key the frame before the last, delete the last key, `loopOut()`. Per part: Fill with a darker version of the part colour, Set Matte (part layer, Alpha Channel), Continuously Rasterize, parent to the part, mask out regions with the Pen tool. Shy the grain layers (about 36 on a full character).
- Principle: grain in a darker tone of the local colour reads as shading; a looped texture clipped to a shape travels with it.
- Free: Fusion Loader loop with matte (untested); Blender image sequence texture, cyclic, mixed with Multiply through the part alpha; web CSS `steps(5)` sprite animation with `mask-image`, or `feTurbulence` grain `feComposite in2=part operator=in`.
- Pitfall: many layers slow Ram Preview.
- Check: verified [Fill plus Set Matte plus parent frame]; loopOut heard.

## 2. Paper and texture loops

### Looping paper, speck and grit texture
- Makes: a scanned-paper or speck overlay that crawls like film; the single most reused element of the style.
- AE: scan paper (best painted black) at high resolution. In a 4K comp make 4 layers of 2 to 4 frames each, each a different crop or rotated 90/180 degrees (two different sheets hide repeats). Loop it: Enable Time Remapping, key the frame before the end, delete the last key, Alt-click the stopwatch, Property > Loop Out, giving `loopOut(type = "cycle", numKeyframes = 0)`. In the shot: blend Screen (light specks, black vanishes) at 50% for retro film, or Multiply at about 40% for dark patches. Curves outside the texture comp (steep: black point near 6, white point near 46% input) set strength. Alternatives: import a numbered JPEG sequence, Interpret Footage > Main > frame rate 6, Loop 50 times; Time Stretch 200% to slow the jitter; texture comps trimmed to the work area first. For poster loops, copy and paste the sequence to fill the comp, since a loop expression can drop frames. Single paper frames flashed for one frame at transitions add impact.
- Principle: a few different-looking frames cycled at 6 to 12 fps read as moving physical media; keep control (Curves) outside the comp so one texture serves light, heavy and tinted uses.
- Free: Fusion Loader with Loop, Merge Apply Mode Screen, Color Curves; Blender compositor Image Sequence into Mix (Screen or Multiply) with RGB Curves; Remotion `images[Math.floor(frame/2) % 4]` with `mix-blend-mode: screen`; CSS `animation: grain 0.33s steps(4) infinite` on `background-position` with `transform: rotate()`; ffmpeg `blend=all_mode=screen`.
- Pitfall: crops must differ enough; commercial texture packs are paid, so scan your own.
- Check: verified [four rotated Paper Scan layers; Time Remap loopOut cycle expression; Interpret Footage rate 6 and Curves plus Invert plus Screen at 35% scale; Light_Texture Screen with steep Curves]. Film emulsion double exposure (grayscale Screen texture inside an Alpha Matte of the subject) verified on frame.

### Texture control: Curves, dark twin, recolour
- Makes: sparse specks, light and dark grain from one source, and grain in palette colours instead of black or white.
- AE: above a Screen texture add Curves: pull the black end right (to about 0.2) and the top handle steep (about 0.25) until only speckles remain. Dark twin: duplicate, Multiply, Effect > Invert, rotate 180 so the two do not cancel. Recolour: (a) palette-colour solid under the texture with Track Matte Luma; (b) VC Color Vibrance (free from Video Copilot, pay what you want) with Matte Alpha set to Alpha Matte Only, then Fill; (c) Tint (black to a colour, white to another). Extract (Effect > Keying > Extract, drag the histogram window to keep the brightest values) then Fill in any colour gives controllable density and beats blend modes for colour freedom. Tint dark specks purple (palette-tinted) rather than black.
- Principle: a tone curve decides how much texture shows; luminance can become alpha, then any colour is applied.
- Free: Blender Color Ramp or RGB Curves into Mix, Color Ramp with first stop alpha 0 then Mix with colour; Fusion Luma Keyer or Custom Tool into Background (untested); web `filter: contrast(3) brightness(.8)` then `mix-blend-mode`, SVG `feColorMatrix` luminance-to-alpha (`0 0 0 0 r  0 0 0 0 g  0 0 0 0 b  .3 .6 .1 0 0`), `mask-mode: luminance`.
- Check: verified [Curves values and Tint panel; Fill, VC Color Vibrance and Curves effect list; Extract histogram visible]. The blend mode on the second light texture was unsettled between frame and narration; check on your build.

### Per-piece paper texture and displacement by the paper
- Makes: a texture that moves with each cut piece, and art that bends as if glued over a paper photo.
- AE: per piece, a 50% gray texture on Overlay copied per piece, Effect > Channel > Set Matte (Take Matte From Layer = piece, Alpha Channel, Stretch Matte to Fit, Composite Matte with Original, Premultiply on), Continuously Rasterize on both, parent to the piece; use a second paper source on every other copy (Alt-drag a project item onto selected layers). Pale layers: Brightness & Contrast; very dark layers: Screen plus Curves. Poster warp: duplicate the paper loop as "displacement map" (hidden), Curves to push white up and black down with mid-gray in the middle, then Displacement Map on the effects layer (Map Layer = it, Source Effects & Masks, horizontal and vertical Luminance, Max Horizontal -2 and Max Vertical -2, Center Map, Expand Output on), plus Turbulent Displace Amount 3 Size 30, Random Seed `time*4`, Transform with Position `wiggle(6,1.5)`, Posterize Time 6.
- Principle: gray means no move, white and black push opposite ways; sync the posterize rate (6 fps) with the texture's change rate (every 4 frames at 24 fps) so everything moves on one beat.
- Free: Fusion Displace or Texture node fed by a blurred paper photo (untested); Blender Displace node with the paper as vector, Mix Multiply and Screen; web SVG `feDisplacementMap` fed by `feImage`, `mix-blend-mode`, CSS `steps()`.
- Pitfall: too much map contrast gives fuzzy edges; soften the curve.
- Check: verified [Set Matte panel and Texture 01 on Overlay; six trimmed layers, Curves, Turbulent Displace 3/30, Displacement Map -2/-2, Posterize 6].

### Texture fills: hole-punch wear, Motion Tile, jittering plastic
- Makes: worn paint, tiling fills, a still texture that looks like a new sheet every few frames.
- AE: hole-punch wear: paper texture with Curves (steep, black plus a few white specks), blend mode Silhouette Luma, check on a pink comp background; more contrast gives more holes. Too-small texture: Effect > Stylize > Motion Tile with Mirror Edges and larger Output Width and Height instead of scaling up. Jitter: one cling-wrap image re-seated every 4 frames at a new Position, recoloured copies, an inverted Alpha Matte so it shows only on the art.
- Principle: a luma matte from a texture erodes the art under it; re-seating the same texture at a new offset reads as a fresh sheet.
- Free: Fusion Luma Keyer into Matte Control or a Multiply on alpha (untested); Blender texture as Factor of a Transparent BSDF, stepped Mapping node (F-curve Constant); web `mask-image` with a speckle PNG and `mask-mode: luminance`, `background-position` with `steps(1)`.
- Check: verified [hole-punch checkerboard frame]; Motion Tile Mirror Edges and jittering plastic heard.

### Watercolour shadow and clipped texturing
- Makes: a painted shadow tucked inside a flat shape; texture painted only inside layers.
- AE: four watercolour blobs painted in Photoshop (darker in the middle), imported as a composition with Retain Layer Sizes, stacked above the wall, a duplicate of the wall as Alpha Track Matte; Curves on the Red channel to lift red in the shadows so the texture reads as a warm shade of the wall, not black; opacity 25 to 35%; key Position up while the house is airborne; roof gets curves almost to the bottom. Photoshop: one layer per element, Alt-click between layers for clipping masks, paint texture only on the side away from the light (top-left light means bottom-right shading), rim light on the right edges, Color Overlay to recolour, a scanned paint texture clipped on Multiply with Curves, a distress texture on Screen above everything.
- Principle: clip a layer to a shape so detail never spills; split shading into one layer per light type.
- Free: Krita Inherit Alpha toggle and grain brushes; Fusion Merge with a Matte from the wall (untested); Blender compositor Set Alpha plus Mix Multiply, Grease Pencil layer mask (untested); web CSS `mask-image`, SVG `clip-path`.
- Check: verified [Curves Channel Red on Alpha-matted watercolour layer; clipped layer stack with Alt+Tab; clip layer shadow; Multiply scan with Color Overlay].

## 3. Boil, stepped time and shake

### Posterize Time: on twos
- Makes: smooth digital motion that reads as traditionally animated.
- AE: Effect > Time > Posterize Time, Frame Rate 12 in a 24 fps comp (12.5 in 25 fps, 15 in 30 fps, 6 for chunkier stop motion). On an adjustment layer it steps everything below it; as the first line of an expression, `posterizeTime(6);` steps only that property (the boil but not the art).
- Principle: fewer distinct frames hide tweening, unify layers of different rates, and 12 fps is the traditional hand-drawn rate.
- Free: Remotion `Math.floor(frame/2)*2`; CSS `steps()`; Blender Output Frame Step 2 or Stepped F-curve modifier (Blender 5.x unverified); Fusion Time Speed hold (untested).
- Pitfall: Posterize Time as an effect affects only layers below the adjustment layer.
- Check: verified [Frame Rate 12.0 and 12.5 frames in several comps]. Noise 8% plus Posterize 6 on the stop-motion "Effects" layer verified for the Noise 8% and field; final 6 heard.

### Hand-drawn boil stack (Turbulent Displace)
- Makes: clean vectors that look redrawn every frame.
- AE: adjustment layer "Hand Drawn Effects". Turbulent Displace 1 ("boil"): Displacement Turbulent, Amount 2 to 4 (3 on Size 50 for tattoo-type, 12 on Size 3 for character art, 50 default is too strong), Size 40, Complexity 2. Evolution Options > Random Seed expression `posterizeTime(6); time*1500` for a stepped, fast re-seed, or the shorter `time*4`. Note `time*4` raises the seed 4 per second, so the visible change is about 4 times a second, not every 4 frames; raise the multiplier to 6 or 8 for faster, 2 for calmer. Turbulent Displace 2 ("texture"): Amount 30, Size 2, Complexity 2 to 4 for edge grit. Posterize Time 12 below the whole stack. Optional on the line layer only: Roughen Edges, Edge Type Rusty, Border 1 to 1.5, Scale 200, for pencil. Transform with Position `wiggle(12,2)` added for tattoo-type work; Posterize Time 8 in that piece. Turn off Roughen in Illustrator before import so AE owns the boil.
- Principle: three things make hand-drawn read: line boil (frame-to-frame wobble), line texture (small noisy edge) and low frame rate. Small, loose boil reads as pencil; larger reads looser. Size sets the width of the wave, Amount sets how far.
- Free: Fusion Displace driven by Fast Noise with seed or Z shifted by `floor(time/4)`; Blender Grease Pencil Noise modifier with a stepped seed or compositor Displace with a stepped W (route untested); web SVG `<feTurbulence baseFrequency=... seed={Math.floor(t*6)}>` into `<feDisplacementMap scale=2>` (proved 2026-11-07 at 960x540: `baseFrequency=0.025` numOctaves 2 with `scale=10` shows a clear per-frame wobble; `baseFrequency=0.012` at scale 18 is invisible; the seed must be an integer, `Math.floor(t*4)+1`), plus a second at scale 30 with high baseFrequency, redrawn at 12 fps (Remotion `Math.floor(frame/4)`).
- Pitfall: two Turbulent Displace instances with the same expression move together (intended); over-size the comp because edges shift.
- Check: verified [Amount 2/Size 40/Complexity 2 with the two-line expression; `time*4`, Amount 4, Amount 12/Size 3; second displace 30/2/2; `wiggle(12,2)`]; Posterize 8 heard.

### Fine grit on edges and Roughen Edges layering
- Makes: shapes that lose the clean vector edge (hand-cut paper, rough brush, printed ink).
- AE: Turbulent Displace on an adjustment layer: Amount 30.0, Size 2.0, Complexity 5.0 (1 in other pieces), Evolution 0, Offset 960,540, Pinning Pin All, Displacement Turbulent, Antialiasing Low. For a brush illustration match: Roughen Edges, Edge Type Roughen, Border 6, Edge Sharpness 2.04, Fractal Influence 1, Scale 11, Complexity 3. For layered edges: Roughen Edges twice (large Scale with a larger Border, then small Scale with a small Border) plus Simple Choker (negative then positive) to force rounded corners.
- Principle: multiscale noise on an edge reads as paper or ink. Keep Evolution static for still grit, animate for boil.
- Free: SVG `feTurbulence baseFrequency~0.5 numOctaves=5` plus `feDisplacementMap scale=30` (scale 2 to 4 for subtle); Fusion Displace with Fast Noise; Blender compositor Displace with a noise texture.
- Check: verified [Fine Grit comp values; Roughen Edges panel; always-on distress stack with Posterize 12.5 in a 25 fps comp]; double Roughen heard.

### Gate weave and misregistered shake
- Makes: film moving through a loose gate; a scanned-poster wobble.
- AE: top adjustment layer, Effect > Distort > Transform, Alt-click Position, `wiggle(12,1)` (12 times a second, 1 px; most used), `wiggle(12,3)` stronger, `wiggle(6,2)` or `wiggle(6,1.5)` for misregistration (6 shifts a second), `wiggle(12,12)` for tension trimmed to about 0.5 s, `wiggle(6,15)` for a heavy image-sequence jump. Scale 101% to hide edges. Copy the Transform to a title for parallax at half values. Hand-keyed alternative: a null parented to everything, nudged on each other frame.
- Principle: nothing in old media is perfectly still; the rate should match the animation rate (12 shakes a second for 12 fps).
- Free: Fusion Transform Center with a Perturb modifier; Blender Noise modifier on an empty's location (Strength 1, low Scale) or Transform node with a noise driver; Remotion `random(seed + Math.floor(frame/7))` offsets or `@remotion/noise` `noise2D` at 12 Hz; CSS stepped `translate`.
- Pitfall: do not apply on both comp and title at full strength.
- Check: verified [`wiggle(6,2)`, `wiggle(12,1)` typed on frames]; `wiggle(12,3)` and the 7-frame variant heard.

### Frame-by-frame sources: flame, traced drawings
- Makes: real analogue texture inside a digital piece.
- Flame: sine wave drawn and shifted up per frame as a guide (loops in 7 frames), flame drawn around the wave as its spine with the base still and the tip following (same volume every frame), 14 frames on twos, printed, edges burned with a lighter, photographed on white and yellow card, aligned in AE with rotation and scale; the inverted version (white on black) hides ash specks as film damage. Free: Krita animation, Blender Grease Pencil with onion skin, Fusion image-sequence loader with Invert and Curves.
- Traced loop: build a 12-frame loop, print a pale-grey plan with registration marks and a Timecode counter, render a PNG sequence, trace each frame on a light pad (15 to 20 minutes a frame), scan, set each anchor to the registration mark, Curves and a mask around smudges. Social grid: 12 offset copies of the comp.
- Principle: use the computer for plan (timing, geometry), the hand for surface; the wave is a template for secondary motion (hair, smoke, fire).
- Check: verified [wave, flame-over-wave, 14-scan import and inverted result frames; Curves and mask on a scan]; process steps heard. About 3 to 6 hours of work each.

## 4. Print looks

### Halftone from lens blur
- Makes: dots that grow where the picture is dark, live and animated, with no plugin.
- AE: (1) precomp the animation "Animation Base"; (2) white solid at the bottom; (3) black solid "Dots" with CC Ball Action (Grid Spacing 4, Ball Size 12; Spacing 6 and Size 24 for bigger dots); (4) adjustment layer above with Camera Lens Blur: Blur Map Layer = Animation Base, Effects and Masks, Channel Luminance, tick Invert Blur Map, Blur Radius 5 to 6, Iris Hexagon; (5) Levels on it, pull the black arrow far right so dots stay solid; (6) on Animation Base Curves darkening shadows and Gaussian Blur 8 so lines between dots soften; (7) `wiggle(12,3)` on Dots, Posterize Time 12 on the top layer; (8) for pure whites, duplicate Animation Base above Dots, remove effects, Levels plus grayscale Hue/Saturation, Screen; (9) paper texture loop for newsprint. CC Ball Action is a bundled Cycore effect (Simulation).
- Principle: halftone is blur size controlled by luminance, then clipped to a hard threshold, so dot size becomes tone.
- Free: Blender compositor Voronoi or dot texture, Math Greater Than against blurred luminance, or Pixelate plus Color Ramp; Fusion Dirt/Grid pattern plus Blur with matte (untested); canvas loop drawing circles with radius from sampled luminance; SVG filter with `feColorMatrix` plus a dot-pattern mask; Photoshop Filter > Pixelate > Color Halftone.
- Pitfall: lines fall between dots; blur the base 5 to 8 px. Proved 2026-11-07 (canvas, 960x540): 8 px grid, radius `0.72*8*(1-luminance)^0.8` from the 6 px blurred base, dot origin jittered by a hash stepped per frame (the `wiggle(12,3)`), gave Ben's look: solid in shadows, small dots in lights (his Levels crush lights harder).
- Check: verified [CC Ball Action, Camera Lens Blur, Invert Blur Map, Curves and Gaussian Blur 8 frames].

### CMYK colour halftone with overprint
- Makes: three-ink overprint with a real dot screen on every frame.
- AE: 1080 by 1080, 24 fps, 2 s; three circles cyan, magenta, yellow on Multiply (overlaps make blue, red, green, black); parent all to a "Rotation Null" turning 0 to 360 over the loop; adjustment layer Radial Blur Type Spin, Center 540,540, Amount keyed 10 to 60 and back (F9), duplicated as Zoom. Render a PNG sequence. Photoshop: record an action "CMYK halftone 01" with Filter > Pixelate > Color Halftone (Max Radius 4 to 12; 6 chosen; Screen Angles seen 105, 75, 90, 45), Save As, Close; File > Automate > Batch with Override Action "Save As" Commands (under a second per frame). Back in AE: import as PNG sequence, rough paper on Multiply, distress paper (Light_Texture with Curves lifting the blacks) on Screen, `wiggle(6,15)`, Posterize Time 6 (12 if harsh).
- Principle: each ink plate prints a dot grid at its own angle; Multiply gives overprint; the screen must be applied per frame or the dots slide.
- Free: web canvas, split C, M, Y, rotate the sampling grid per channel angle (textbook 15, 75, 0, 45), circle radius from channel value, composite with `multiply` (route confident, code ours, untested); CSS `mix-blend-mode: multiply` for overprint; Blender has no Color Halftone, build with rotated Wave or Checker textures per channel (untested); ImageMagick ordered dither `-ordered-dither h6x6a` (ImageMagick only; ffmpeg paletteuse has no halftone pattern; untested for CMYK angles).
- Pitfall: the batch needs Photoshop (paid).
- Check: verified [Radial Blur values, Color Halftone dialog and angles, Batch dialog, `wiggle(6,15)`, Posterize 6].

### Misregistered print (plates split)
- Makes: black outlines and colour fills that jitter apart, like a cheap print.
- AE (A, luma-matte split): duplicate the main comp "Main - Matte", Hue/Saturation Master Saturation -100 and a steep Curves (raised black point) to make black and white; set the original's Track Matte to Luma Matte (colour only); duplicate both again and use Luma Inverted Matte for the outlines on their own layer. Parent the fill's matte to the fill and nudge its Position every 2 frames with arrow keys, then copy keys to fill the comp; keep Light_Texture on Screen and Multiply 40% above, Displace and 12 FPS adjustment layers on top.
- AE (B, Extract split): on the finished animation add Extract (Channel Luminance, Black Point 57, White Point 255, softness 0, Invert off) to leave colours only, Ctrl+D, reverse the histogram for the line art, offset Position of either, add a looping texture.
- Principle: print plates are separate inks; shifting one a pixel or two gives the effect. Dark halo leftover is part of the look.
- Free: Blender threshold the render into a mask, multiply to split lines and fills, offset with Translate and a stepped driver; Fusion Luma Keyer (inverted for the copy) plus Transform (untested); web SVG `feColorMatrix` threshold then `feOffset` with `steps()`.
- Pitfall: keep the offset small or it looks wacky.
- Check: verified [Master Saturation -100, steep Curves, Luma and L.Inv layers with position keys; Extract values on the pineapple comp].

### Photocopy newsprint and collage borders
- Makes: high-contrast black and white cutouts with nested flat frames.
- AE: on the precomp, Hue/Saturation Master Saturation -100, then Curves RGB with an S-curve (darker low midtones, brighter highs; the exact bend heard). Borders: double-click the Rectangle tool for a comp-size shape, Fill None, Stroke Solid, width about 250 px (dark) below the cutout and about 100 px (lavender) above it, colours eyedropped from the icon.
- Principle: desaturate then S-curve for punch on the precomp so one effect covers all frames; nested flat frames in palette colours read as printed collage.
- Free: Fusion Color Corrector Saturation 0 plus Color Curves; Blender Hue Saturation Value plus RGB Curves; CSS `filter: grayscale(1) contrast(1.4)`, `border` or `outline` layers.
- Check: verified [Master Saturation -100 frame, Border 1 and Border 2 layers, final lavender and dark blue frames]; widths heard.

### Engraving (banknote) look
- Makes: footage rendered as five bands of progressively thicker wavy hatch lines.
- AE: footage precomp: Tint (grayscale), Curves for contrast, Posterize 5, precomp. Lines: Pen vertical line taller than the comp, 1 px black stroke, add Zig Zag (Size 5, Ridges per segment 30, Points Smooth) then Repeater (about 439 copies, Offset negative to fill left, Transform Position X 10 for tight lines). Make 4 copies with strokes 1, 2, 5, 7. Put footage over each line layer with Extract (Luminance; Black Point 0, White Point 111 for the thinnest band, final band White Point 32 and White Softness 30) and set the line layer's Track Matte to Alpha Matte. Rotate lines 2 and 3 by 45 degrees, line 4 by -45 (cross-hatch). Fix hard islands: turn Posterize off, Gaussian Blur 2 and Levels (move black and white points together) so grays taper to points; break the taper into dashes with Fractal Noise (Scale 10, Contrast 100, Overlay, opacity 50%) inside the footage comp and `time*4` on the seed. Money colour: Tint black to dark green, white to paper green.
- Principle: luminance bands choose which line weight shows; crushed contrast turns gray fades into tapered strokes; noise makes dashes.
- Free: web canvas is the surest route (per-pixel luminance, 5 bands, sine-displaced parallel hatch lines at 0, 45, 90, -45 degrees, thicker for darker); Blender Color Ramp (Constant) to separate bands, Mix Multiply with rotated Wave texture (Bands type, distortion); Fusion per-band Threshold into Merge with line patterns (untested); SVG `feComponentTransfer` discrete for posterize.
- Pitfall: needs a high-contrast source; heavy to render; moire in zoomed-out preview. The source project is paid.
- Check: verified [Zig Zag and Repeater, Extract values at 111 and 32 with softness 30, Fractal Noise Overlay frame].

## 5. Dither

### Ordered dither (Bayer plus Threshold)
- Makes: a retro 1-bit or few-colour dithered look over footage, no plugin.
- AE: footage at the bottom; above it a 4K Bayer 8x8 pattern image (2x2, 4x4, a horizontal-line pattern and a blue-noise image work too) on Overlay; new adjustment layer "Effects" above with Threshold (Level 128 default; animate Level for a pulse). Noise above Threshold gives random dither first. For more gray steps, duplicate the pattern at 50 to 100% opacity.
- Principle: ordered dither compares every pixel to a fixed repeating threshold map; Overlay of a Bayer tile does that before Threshold crushes to 1 bit. Floyd-Steinberg and other error-diffusion types need code or a plugin.
- Free: Blender compositor Image (Bayer, tiled with Mapping) into Mix Overlay then Math Greater Than 0.5 or Color Ramp constant; Fusion Tile of the Bayer image, Merge Overlay, Threshold via Color Corrector (untested); web canvas or WebGL fragment shader comparing luminance to a Bayer matrix (`floor(c*levels+bayer)/levels`); Remotion canvas.
- Pitfall: dither steals the show, so plan it from the start.
- Check: verified [pattern PNGs in the project panel, final Threshold, Tint, Posterize stack]; Overlay and Threshold steps heard.

### Dither at any scale, colour dither, distorted dither
- Makes: big chunky dither pixels that survive compression; two-colour or palette dither; glitchy dither.
- AE (scale): precompose the pattern "Dither Pattern". On the Effects layer add Mosaic with expressions `thisComp.width/effect("Dither Scale")("Slider")` (and `thisComp.height/...`), add Slider Control "Dither Scale" (never 0; integers only; wrap in `Math.round()`), and on the pattern layer set Scale to `transform.scale*effect("Dither Scale")("Slider")` pickwhipped to the slider. Tick Sharp Colors on Mosaic; set the pattern layer's quality to Draft; render with Current Settings (not Best Settings) so the pattern is not re-smoothed.
- AE (colour): after Threshold add Tint (Map White To a colour, Amount below 100% to soften, Swap Colors to invert). For palette dither delete Threshold and Tint and use Posterize (2 per channel gives 8 colours). Frame stack: Mosaic (Sharp Colors), Dither Scale slider 2, Threshold 176, Tint black to green, Posterize 7. Curves on the footage first for contrast.
- AE (distorted): put Wave Warp (low speed and height), Turbulent Displace, CC Lens or Ripple on the pattern layer, not the picture; Glow on top only subtle (dial in then halve).
- Principle: the pattern's pixels must equal the comp's pixels (shrink the comp by N with Mosaic, scale the pattern by N).
- Free: Blender Scale node with Nearest interpolation at 1/N plus Mapping scale; web render to a small canvas (width/N) with `image-rendering: pixelated` then upscale; SVG `feDisplacementMap` on the pattern.
- Pitfall: very slight misalignment from the Bayer file at high scale. Plugin alternatives: Retro Dither (about 50 USD) and Pix Dither (about 20 USD), with Floyd-Steinberg and fixed palettes such as Game Boy (paid).
- Check: verified [Mosaic `thisComp.width`, Dither Scale slider 20 and `transform.scale`, Mosaic 960 by 540 with Sharp Colors, final effects panel]; distorted dither heard.

## 6. Screen and analogue looks

### CRT phosphor dots
- Makes: footage visible only through red, green and blue phosphor dots (CRT when zoomed in, full colour when zoomed out).
- AE: (1) comp "Phosphor Dots" 30 by 23 with three rounded rectangles in pure red, green, blue; (2) nest it in "Phosphor Dots Grid" 3840 by 2160, Stylize > CC RepeTile, drag the handles to fill; (3) offset every other row: white solid with Venetian Blinds (Transition Completion 50%, Direction 0, Width 60, Feather 0), precomp, then Distort > Displacement Map on the dots (Map Layer = that precomp, Horizontal off, Vertical = Alpha Matte, Max Displacement 6); (4) main comp: footage at the bottom, dot grid above with Collapse Transformations on; on the footage Channel > Shift Channels (Take Alpha From Alpha, Red From Red, Green and Blue Full Off) then Channel > Set Matte (Take Matte From the grid, Use For Matte Red Channel); duplicate twice for Green and Blue; (5) grid layer scale 50% sets dot size.
- Principle: a pixel-grid display is a per-channel mask; blur bleeds neighbouring channels into white.
- Free: Blender compositor Separate Color, each channel multiplied by a dot-grid image (rows offset), Combine Color; Fusion Channel Booleans with a tiled dot image (untested); web fragment shader sampling an RGB stripe mask, or CSS `repeating-linear-gradient(90deg, red 0 1px, green 1px 2px, blue 2px 3px)` over the image with `mix-blend-mode: multiply` (idea standard, CSS ours, untested).
- Check: verified [RepeTile grid at 56%, Venetian Blinds 50/0/60/0, Shift Channels and Set Matte panels]; Max Displacement 6 from the transcript.

### Damaged VHS signal
- Makes: the signal a CRT would show: wobble, flicker, colour smear.
- AE (adjustment layers on top): "Distort": Wave Warp (Wave Type Square, Height 8, Width 800, Direction 0, Speed -0.5) then Transform scale 101%. "Flicker": Curves lifted towards the top-left, Opacity `wiggle(12,100)`. Colour bars: blue solids with a rectangle mask, Mask Feather 500, Mask Path keyed from above the comp to the bottom over a little more than 1 s, duplicate with Fill red, nine stepped copies, opacity 50. Gaussian Blur 10 on top; in the main comp Blur 5, three stacked Glows (Threshold 100, Radius 5, 10, 30), Curves brighter. A quick alternative: Noise 25% (Use Color Noise, Clip Result Values), Posterize Time 12, Gaussian Blur, Sharpen 200.
- Principle: layer several small imperfect effects (wave, flicker, colour smear, blur, glow) instead of one big one.
- Free: Fusion Ripple or Transform plus Displace, Fast Noise for flicker, three Glow nodes; Blender Displace plus a noise-driven Brightness/Contrast plus Glare (Fog Glow) three times; web SVG `feTurbulence`+`feDisplacementMap`, CSS flicker animation, canvas bars.
- Check: verified [Wave Warp and Transform, Flicker Curves, layer stack with bars]; `wiggle(12,100)` from the transcript.

### LED glitch and block-noise glitch map
- Makes: a logo that tears sideways, becomes an LED screen, and recolours with the glitch noise; the map also works as an overlay.
- AE (glitch map): black solid, Fractal Noise: Noise Type Block, Fractal Type Basic, Contrast 400, Brightness 0, untick Uniform Scaling, Scale Width 650, Scale Height 72.7, Complexity 6, Sub Influence 70, Sub Scaling 61.9, Evolution `time*500`. Place above the main comp on Overlay 30%.
- AE (LED): Posterize Time 12 on top; Displacement Map (Map Layer = the noise comp, Source, horizontal and vertical Luminance, Max Horizontal keyed 0 to 281 and back, Center Map, Expand Output on); then CC Ball Action (Scatter 0, Grid Spacing 2 to 5, Ball Size 55 to 83, Rotation Axis X, Twist Angle 0); Deep Glow 2 (paid; Radius 300, Exposure 0.60, Screen), which gives a transparent background when exported with alpha. Stacked ordinary Glows are the free stand-in.
- AE (hyper-colour): white logo Fill, Colorama (Get Phase From Intensity, Add Phase = the fractal comp as Source, Add Mode Wrap, Phase Shift 0), Posterize Time 6; a luma-matte copy of the flat logo above keeps original colours.
- Principle: wide short noise cells make horizontal strips; displacement tears the image; a ball grid with gaps turns it into LED pixels.
- Free: Fusion Displace (luminance) plus Tile of circle masks (untested); Blender Displace, Pixelate and a dot mask; web SVG `feTurbulence baseFrequency="0.0015 0.04"` with animated seed, canvas sampling pixels onto circles, CSS radial-gradient dots plus `filter: blur()` glow; Blender Color Ramp (rainbow) for Colorama (route approximate).
- Pitfall: CC Ball Action is a Cycore effect; outside AE use the canvas or SVG dot route.
- Check: verified [Block noise values, Displacement Map 281.1, Ball Action 5/83 and 2/55, Colorama panel].

### Projector-era and logo-era looks (70s, 80s, 90s anime)
- 70s linear logo: simple constrained elements, stripes offset so segments arrive one after another, Exposure keyed up as each stops; over everything one adjustment layer with Deep Glow (paid), Curves, Noise HLS Auto and Transform with `wiggle` for VHS jitter; end by filming a real CRT. Era comes from limits (linear motion, few elements, jitter, analogue capture), not filters alone. Check: verified [Exposure frame]; values heard.
- 80s horror opulence emerald: faceted gem with the same gradient offset per facet, sliding sideways; retro stack (glows, blur then sharpen for halation, small shake, grain); copies of only the brightest highlights blurred horizontally on one and vertically on another for lens-flare cross streaks. Blender Glare (Streaks) does this in one node. Check: verified [Illustrator layers, finished composition].
- 90s anime degrade for UI graphics: drop shadow on the cursor (50%, Direction 111, Distance 4, Softness 5); adjustment "Edges": Find Edges (Invert, Blend With Original 0%), Directional Blur Direction 0 Length about 9 to 10, Screen 50%; adjustment: Directional Blur Direction 90 Length 30, Hue/Saturation Master Saturation -41, Soft Light; top adjustment: CC Vignette Amount 75, Angle of View 49.1, Pin Highlights 42, Transform `wiggle(12,1)` Scale 101, Gaussian Blur 2, Noise HLS Auto (Grain, Lightness 3%, Saturation 4%, Grain Size 1, Speed 24), Posterize Time 12. Palette from stills (milky green, grey, purple). Free: Blender Sobel plus Blur plus Mix Screen, Glare, Ellipse Mask vignette; Fusion Blur, Vignette, FilmGrain, Merge Soft Light; SVG `feConvolveMatrix` edges, `mix-blend-mode: soft-light`. Pitfall: sharp UI icons still need legibility. Check: verified [all values on frames; final Blur Length read about 9 to 10].
- Wiggle-free film shake alone: see Gate weave above.

## 7. Finishing stacks (one adjustment layer)

### The usual three: shake, grain, twos
- AE (adjustment layer "Effects"): Transform with Position `wiggle(12,1)` and Scale 101, Noise HLS Auto (Noise Grain, Hue 0, Saturation 0, Grain Size 1, Speed 24), Posterize Time 12. Variant order from a rain piece, top to bottom: Threshold, Tint, Gaussian Blur, Deep Glow, Transform, Posterize Time, Noise HLS Auto.
- Principle: slightly shaky camera plus 12 fps motion plus grain reads as hand-made and filmic, not computery. It unifies mixed assets.
- Free: Remotion translate by seeded random every second frame, SVG `feTurbulence` grain overlay, held frames; Blender Noise F-curve on the camera or Transform node, Stepped modifier at 2 frames, Noise Texture Overlay; Fusion Transform expression shake plus FilmGrain.
- Pitfall: keep the shake that small; use on flat vector or clean 3D.
- Check: verified [rain frame 6:40 stack and values; `wiggle(12,1)` on the medieval loop].

### Retro finish stack with halation
- Makes: a clean motion graphic that feels like old film, built from many tiny effects you feel but do not see (4K values; soften for 1080p).
- AE (stack order, top to bottom): Gaussian Blur 8 (Repeat Edge Pixels), Sharpen 300, Curves (white point pulled down to offset the glow), Deep Glow (Radius 250, Exposure 0.4, Chromatic Aberration 0.15; paid, so use stacked Glows), Curves 2 (highlights down a touch), Transform (`wiggle(6,2)`, `wiggle(6,1)` at 1080p, Scale 101%), Noise HLS Auto (Grain, Lightness 5, Grain Size 2, Speed 12). Also: Drop Shadow 25% on every animated element ("cel shadow", because cels were thick enough to cast a faint shadow), looping texture Screen 50%.
- Principle: blur then sharpen leaves halo artefacts like old screens; the shake mimics a loose gate.
- Free: Blender Blur then Filter > Sharpen, Glare (Fog Glow), Lens Distortion (small Dispersion), Noise plus Mix Overlay, Translate with a noise driver; Fusion Blur, Sharpen, Glow, channel offsets for chromatic aberration (untested); web SVG `feGaussianBlur`, `feConvolveMatrix`, `feTurbulence`.
- Check: verified [Gaussian Blur 8, Sharpen 300, Deep Glow radius 500 exposure 1 frame and stack order]; later reduced values read from audio.

### Gritty duotone stack
- Makes: artwork that looks scanned, photocopied and gritty in one colour.
- AE (adjustment layer "Effects" over a white solid, top to bottom): Hue/Saturation (Channel Control Reds, Red Lightness about -60, so gums do not turn purple), Noise (40%, Use Color Noise, Clip Result Values), Curves RGB (hard S), Tint (black to black, white to purple, 100%), Posterize Time 15 (30 fps comp) or 12 (24 fps). Copy the layer into each scene comp so scenes preview finished. Punk variant: Curves black point to about 25-30% and white point in to about 75%, then Tint white to bright pink, torn cutouts tinted black and yellow with Preserve Underlying Transparency.
- Principle: colour fixes before Tint; noise before the contrast curve makes grit.
- Free: Blender Hue Correct, Noise into Mix (Overlay), RGB Curves, Color Ramp black to purple as gradient map, scene frame rate 15; Fusion Hue Corrector, Fast Noise, Color Curves, gradient-map duotone (node untested); web `feTurbulence` plus `feComponentTransfer` S-curve table plus `feColorMatrix`.
- Pitfall: noise below about 40% or the shape dies.
- Check: verified [Effects panel frames 6:55 and 7:30; Curves and Tint frame 2:20].

### Hand-animated finish stack (bloom, haze, displace, twos)
- AE (top comp): a duplicated comp with Gaussian Blur 25 px on Pin Light so light/dark edges glow; adjustment "RAMP" with Gradient Ramp on Overlay at 50%; adjustment "Displace - 12 FPS" with Turbulent Displace (Amount 30, Size 2, Complexity 1, Pin All, Antialiasing Low) then Posterize Time 12; texture layers on top.
- Principle: roughen edges, lock to a lower frame rate, then add haze and grit.
- Free: Blender Displace plus Glare for bloom plus Gradient with Mix Overlay; web SVG displace, `mix-blend-mode: overlay` ramp, Remotion frame hold.
- Check: verified [stack frame 13:32, displace and Posterize values; Posterize read 12.5 on frame, 12 in audio].

### Glow, noise, tint 80s stack
- AE (adjustment "Effects", order Glow, Noise, Tint): Glow (Based On Color Channels, Threshold 80%, Radius 200, Intensity 1.0, Composite Original Behind, Operation Add), Noise 10% (Use Color Noise, Clip Result Values: fixes banding), Tint (black to very dark blue, white to red, 100%). The neon-grid version adds three Glows (default, larger, much larger at lower intensity), Noise 20%, Curves to crush blacks and whites so grain lives in the greys, blue and red channel curves, Posterize Time 12.5.
- Principle: glow adds halation, noise dithers banding, tint collapses to a duotone so noise hides at a distance.
- Free: Blender Glare (Bloom or Fog Glow, threshold about 0.8) plus Noise Overlay plus Color Ramp gradient map; Fusion Glow then gradient map (untested); web `drop-shadow` or blurred screen copies, noise layer, SVG duotone.
- Check: verified [Glow values, Noise 10%, Tint, Posterize 12.5 frames].

### Blur then sharpen to degrade and unify
- AE: adjustment layer, Gaussian Blur 4 to 5 (Repeat Edge Pixels), Sharpen amount up to about 300 until as crisp as before (or Unsharp Mask Amount 100 to 150, Radius 4, Threshold 0); optionally paste the pair many times. Add Noise and texture on top (Noise 25% plus Posterize 12 plus Sharpen 200 gives a VHS-like cohesive look); a separate 6% Noise adjustment hides banding, with Curves adding blue to the shadows.
- Principle: sharpening a blurred image over-compensates and creates dark and light halos; reduced fidelity makes 3D models and stock look like they belong together.
- Free: Fusion Blur plus Unsharp Mask; Blender Blur then Filter > Sharpen; web SVG `feGaussianBlur` then `feConvolveMatrix` sharpen kernel (untested).
- Check: verified [Blurriness 5 with Sharpen typed; Unsharp 150/4/0; Noise 25, Posterize 12, Sharpen 200]; 300 heard.

### Match a flat character to a plate, then grade
- AE (in order): Hue/Saturation (Master Saturation -12 to -23, Lightness -10), Curves (slight brightness, Blue down in highlights so whites go yellow, up a little in shadows), Gaussian Blur 2 to 3, Noise HLS Auto (Grain, Lightness 4 to 5%, Speed 24). Then the shared grade on one adjustment layer: CC Vignette (Amount 75, Angle of View 45), per-channel Curves (Red up in highlights, Green down in shadows and back up, Blue up in shadows and down in highlights: purple shadows, yellow highlights), and Camera Lens Blur breathing (see Blur).
- Principle: make the foreground match the plate, not the other way; fix the biggest first problem (too bright, too colourful) first.
- Free: Fusion Color Corrector, Curves, Blur, Fast Noise at low strength; Blender Hue Sat Val, RGB Curves, Blur, Noise plus Mix (Soft Light) at about 4%; web CSS `saturate()`, `blur()`, canvas noise overlay.
- Check: verified [frames 01:20, 04:30, 13:25, 22:30].

## 8. Lighting and shading

### Four-step flat shading formula
- Makes: volume on flat vector animation with four layers: form shadow, ambient occlusion (AO), reflected light, highlights, plus an optional gel layer.
- AE: Form shadow: duplicate the main layer, Fill dark gray with Invert (fills everything not the shape), move up, Preserve Underlying Transparency, blur; for a simple shape duplicate, darken, mask, feather. AO: dark solid with Preserve Underlying Transparency, blend Multiply, Pen mask feathered, a second mask on Subtract where there is no shadow, vary feather along the path with the Mask Feather tool (under the Pen tool group). Reflected light: duplicate to the top, fill black, layer style Inner Glow, blend Screen. Highlights: rounded strokes with Path animated over a few frames; sharp for juicy surfaces, blurred for rough ones. Gel (translucent): Gradient Ramp blue to cyan, a feathered bright cyan solid at the bottom with Turbulent Displace, a white one on that; a blurred duplicate under it is a "magical drop shadow".
- Principle: light cannot reach creases (occlusion), bounces back in the colour of the nearby surface (reflected), glints on glossy parts; translucent objects glow on the side away from the light.
- Free: Blender renders it natively (Ambient Occlusion, Principled BSDF Transmission and Subsurface) or Grease Pencil Shader FX (Rim, Shadow); Fusion Merge Multiply for AO, Soft Glow for reflected light; CSS `box-shadow: inset 0 -10px 20px`, `mix-blend-mode: multiply|screen`, SVG `feGaussianBlur` plus `feComposite operator="out"` for the inverted fill.
- Pitfall: do not shade everything; some projects skip steps.
- Check: verified [layer stack with modes, AO mask feather, gloss sphere, gel with glitter]; feather amounts not given.

### Feathered-mask lighting
- Makes: soft cel shading, rim lights, vignettes and spotlights from masks, no painting.
- AE: duplicate the character layer, Fill a darker palette colour, Pen mask, F for Mask Feather (12 px for a rim on Subtract; 55 to 100 px for head shadows; 500 px for a blob on a circle with a small Rotation key; 1000 px for a passing shadow). Several masks on one layer cover both eyes. Highlight: same with a white fill. Highlight on a sphere: three white layers with different feathering (very soft, medium, tight). Vignette: black solid, double-click Ellipse for a comp-size mask, Inverted, Feather, shape with the Pen, optional Turbulent Displace for grit (more control than the Vignette effect). Spotlight behind a subject: white solid, Ellipse mask with a huge feather, a second solid with a smaller mask and less feather for a brighter centre (not one radial gradient).
- Principle: layered gradients with different softness read as natural falloff; one feathered shape per light or shadow is cheaper than painting.
- Free: Fusion Polygon or Ellipse mask with Soft Edge into a Merge; Blender Grease Pencil with Blur FX, or compositor Ellipse Mask, Blur, Mix; web blurred SVG `<path>` clipped to the shape, stacked CSS `radial-gradient`, `filter: blur(250px)`.
- Check: verified [Mask Feather 500 frame, Shading solids and halo, Vignette and Circle layers, Shading comp with highlight layers]; vignette ellipse steps heard.

### Layer styles for volume
- Makes: a 3D-looking ball, glossy tube or glowing character from layer styles only (Layer > Layer Styles, not Effects; they follow the alpha).
- AE (ball): Inner Shadow (Multiply, black, 75%, Use Global Light off, Angle 120, Distance 85, Size about 100); Inner Glow (Choke 20%, Size 100, a mint slightly greener than the shape); Bevel and Emboss (Inner Bevel, Smooth, Depth 100%, Direction Up, Size 215 and not higher, Soften 0, Angle 120, Altitude 30, Highlight Screen white 75%, Shadow Multiply 75% recoloured bright pink so it multiplies to a blue near the background); Gradient Overlay set to Overlay (Normal goes muddy).
- AE (glossy tube): Inner Shadow white, Normal, 100, Angle -60, Distance 15, Size 15, then Bevel and Emboss Size 75 with the shadow recoloured purple.
- AE (art already animated): on a precomp, Inner Glow Overlay (not Screen, which overexposes linework), 100%, Technique Softer, Source Edge, Size 75, Range 50%, pale yellow; Outer Glow 100%, Size 120 to 125, colour eyedropped from the art.
- Principle: light direction and a tinted multiply shadow carry more colour than gray; each style is a soft layer that flips on and off; changing the base colour re-shades everything.
- Free: Blender Fresnel or Layer Weight with a Color Ramp, or a matcap on a sphere; CSS `box-shadow: inset -20px -20px 60px rgba()`, `radial-gradient(circle at 30% 30%, ...)`; SVG `feSpecularLighting`; Fusion Bump plus Soft Glow (untested).
- Check: verified [Inner Shadow, Bevel, Inner Glow panel values and finished sphere; bevel panel at 8:58].

### Form shadow clipped to the body
- Makes: a drawn shadow shape clipped to the body with a lit rim at the clipped edge and slow drift.
- AE: Pen a loose shadow on the bottom-right, overextending past the edge, named "Body - Shadow" above the body. Stack top to bottom: Wave Warp (Sine, Height 5, Width 80, Direction 60, Speed 0.3, Pinning None), Set Matte (body layer, Alpha Channel, Stretch Matte to Fit, Premultiply), Simple Choker (Choke Matte 20, after Set Matte so the matted edge rounds off while the open edge stays sharp for rim light). Parent the shadow to a light-source null in a controller rig so moving the light lights different parts.
- Principle: clip the shadow to the body alpha, then erode so a thin band of the lit body shows; animate the warp, not the shape.
- Free: SVG shadow `<path>` inside a `clip-path` or `<mask>` of the body with `feMorphology erode` and `feTurbulence` drift; Blender Alpha Over with a body-masked shape and Dilate/Erode; Fusion Merge Operator In then Erode/Dilate (untested).
- Check: verified [Set Matte frame, Wave Warp values and Choke 20, rig comp].

### Stacked drop shadows (paper, text, global light)
- Makes: believable raised paper, layered soft text shadows, and shadows whose direction is one control.
- AE (paper): Drop Shadow 1: 30%, Distance 3, Softness 10; 2: 15%, Distance 6, Softness 25; 3: 10%, Distance 10, Softness 50; Direction 125 to 135; Bevel Alpha above: Edge Thickness 1, Light Intensity 0.20, Light Angle `effect("Drop Shadow")("Direction")+180`. Pickwhip the other Directions to the top shadow. Select all, Edit > Copy with Relative Property Links, paste onto the others so one layer drives the look.
- AE (natural, four shadows, direction 0): 30% distance 2 softness 4; 30% 10 50; 25% 40 140; 20% 80 300. A Slider Control on a "Controller" adjustment layer drives Direction through a pickwhip; keyframe 0 to `360*4` for loops.
- AE (text): Drop Shadow (50%, Direction 135, Distance 5, Softness 0), duplicate and keep raising Distance and Softness; tint the shadow towards the background (a cool dark blue); Bevel Alpha Edge Thickness 1 (never above 2; at 9 it looks like WordArt) Light Angle -30, Intensity 0.40. Paid stand-in: Shadow Studio 2 (Angle 128, Distance 250, Softness 250, Opacity Start 20 End 50, Samples 32).
- Principle: a good shadow is many shadows with growing distance and blur (a falloff), slightly tinted, with a faint edge light; link values so one layer controls all.
- Free: CSS `filter: drop-shadow(0 3px 10px rgba(0,0,0,.3)) drop-shadow(0 6px 25px rgba(0,0,0,.15)) drop-shadow(0 10px 50px rgba(0,0,0,.1))` with x/y from `cos`/`sin` of one `--angle` variable; stacked `text-shadow`; Remotion computes the four offsets from one interpolated angle; Blender area light on a shadow catcher rotated by one driver; Fusion chained Drop Shadow nodes with a linked angle (untested).
- Pitfall: three or four layers is enough; render time rises fast; Bevel Alpha above about 1 px looks bad.
- Check: verified [three-shadow frames with Direction 135 and 125, relative links menu, four-shadow stack, text drop shadow stack and Bevel values].

### Reactive shadows from a light position
- Makes: soft long shadows streaking away from a moving light (also light leaking through windows).
- AE: shape layer: Fill (very dark red), CC Radial Fast Blur (Amount 86 to 94, Zoom Brightest), CC Composite (Composite Original In front, RGB Only on). Alt-click the blur Center stopwatch and pickwhip the Position property (not the layer) of a LIGHT circle. Reuse via Edit > Copy with Property Links. For a gritty edge add Noise Alpha (Amount about 75, Original Alpha Edges).
- Principle: a radial zoom blur on Brightest keeps only the dark smear; compositing the shape back restores it, so it reads as a cast shadow. Strength is Amount.
- Free: Fusion Directional or Radial blur with the centre linked to the light (untested); real shadows in Blender with a Point light and shadow-only geometry (3D route); web canvas stepping N scaled, offset, low-alpha copies along the light-to-object vector (long shadow), or SVG `feGaussianBlur` with `feOffset` from pointer position.
- Pitfall: needs a dark fill; 2D only, no real depth.
- Check: verified [Radial Fast Blur Center and Amount frames, light pickwhip, Fill plus CC Composite]; Noise Alpha step heard.

### Contact shadow and reflections by duplicate layer
- Makes: a ground shadow fading with distance, a passing shadow, a bottom reflected light, and a plate reflection.
- AE (contact): duplicate the character, 3D layer lying flat, effects removed, Fill dark brown, Rectangle mask Feather about 480 to 500, Gaussian Blur 100 to 200 with Repeat Edge Pixels off, opacity 50%, below the character.
- AE (shading layer): duplicate again "Shading", keep Gaussian Blur 3 and Fill (shadow colour from the table). Masks: "Passing Shadow" (Add, Feather 1000, Mask Opacity 50%), "Bottom Shading" (Add, Feather 800), "Bottom Reflected Light" (Subtract, Feather 100, Opacity 36%). Key the Passing Shadow path, copy the key pair per passing shadow, park the mask off-screen between passes. Simple Choker (Choke Matte 0.80) on the main layer removes a light rim from double soft edges.
- AE (reflection): duplicate, Layer > Transform > Flip Vertical, Overlay, rectangle mask Feather 1000, opacity 50%, Gaussian Blur about 50, noise removed.
- Principle: a shadow on an object is the absence of light so it never darkens twice; reflected light lifts the underside but stays below plate brightness; a shadow is soft because the scene light is bounced.
- Free: Blender Cycles shadow catcher or dark flipped blurred copy; Flip node plus Blur plus Mix Overlay plus gradient mask; web CSS `filter: blur() brightness(0)` on a flipped clone with a `mask-image` linear gradient, `-webkit-box-reflect`; Fusion duplicate branch with gradient matte (untested).
- Check: verified [shadow layer feather 478, opacity 50%, mask feather values, reflection Overlay 50%].

### Reflected light and fake sphere reflection (Set Matte plus blur)
- Makes: environment reflection or neighbour bounce light on a circle.
- AE: duplicate the neighbouring layer ("Triangle Pink Reflection", keeps its Gradient Ramp), Set Matte (Take Matte From Layer = the circle, Alpha Channel, Stretch Matte to Fit, Composite Matte with Original, Premultiply on), Gaussian Blur 87 to 150, then a second Set Matte copy below the blur to clip it to the circle. Realistic stack: Set Matte, Gaussian Blur, Set Matte 2. Stylised: blur above Set Matte. Move the neighbour closer so light grows with proximity. Optional Screen or Add blend.
- Principle: blurred, edge-faded copies of nearby colours fake wrapped environment reflection; order matters (matte then blur gives softer edges with less original colour at the rim).
- Free: Blender real sphere with environment, or compositor Blur plus Mix mask; Fusion Blur on a copy then Multiply with the object matte (untested); CSS `backdrop-filter: blur()` with `mask-image: radial-gradient`.
- Check: verified [Set Matte, Gaussian Blur 87.1 and 150, Set Matte 2 stack frames].

### Stacked glows and hand-placed glow
- Makes: believable bloom and light falloff.
- AE: add Glow, duplicate two or three times, raising Radius and lowering Intensity. Values seen: Radius 10/50 (Threshold 60%, Intensity 1.0); lava Threshold 85%, Radii 10/75/300 with Intensity 1.0/0.8/0.5; chrome text Threshold 99%, Intensity 0.7, Radii 10/30/70/200; stargate Radii 30/100/200/400 with Intensity 0.5/0.5/0.7/1.0; lightning Radii (default)/25/100/200. All on Glow Based On Color Channels, Composite Original Behind, Operation Add, Colors Original. Then Curves above to set glow level and threshold, adjustment layer on Screen so contrast stays; Hue/Saturation +40 to enrich colour. Hand-placed: do not stop at the plugin glow; add feathered-mask red and yellow solids on ground and sky behind the subject, a blurred yellow duplicate sun, and warm Hue/Saturation to restore colours the glow washed out.
- Principle: one glow has one falloff shape; several radii add up to the slow tail of real bloom; direct light where it would physically go.
- Free: Blender compositor several Glare nodes (Fog Glow, Threshold, Size) mixed with Add, (EEVEE bloom was removed in 4.2; in 5.x use compositor Glare); Fusion several Glow nodes with growing size; CSS stacked `drop-shadow(0 0 r colour)` or blurred copies with `mix-blend-mode: screen`; Remotion layered blurred screen duplicates.
- Pitfall: AE Glow is slow; scrub for blown areas and lower one glow. Deep Glow and Trapcode plugins are paid.
- Check: verified [Glow 1/2/3 frames, lava, chrome Glow 4, stargate Glow 1 and 2]; hand-placed glow heard.

### Luma-matte side lights, strobes and pool ripple light
- Makes: coloured side lighting from pre-lit renders, looping strobes, and caustic ripples.
- AE (side lights): three images of one statue (main on transparent, lit-left, lit-right). Bust Fill black. For each lit image a new solid under it with Track Matte Luma (red under the left, blue under the right). Brighten with Curves on the luma layer, dim with Fill to dark gray. Opacities then control each side.
- AE (ripple): Fractal Noise (Basic, Soft Linear, Contrast 100, Complexity 6 reduced to 3) on the red solid, Evolution `time*700` (800 to 900 for faster), Scale 100 to 400, luma matte back on.
- AE (strobe): adjustment layer "Strobe" with a subtle S-curve Curves, Opacity keys 0%, 100% (about 3 frames), 0% (about 6 frames), `loopOut("cycle")`; brightness from the curve, speed by dragging keys.
- Principle: a light-direction render is a grayscale mask for any colour; any noise scaled big and moved slowly reads as caustics when it modulates a light.
- Free: Fusion Luma Keyer or Channel Booleans feeding a coloured Background Merge (untested); Blender Noise Texture W `#frame*0.02`, Detail 3 into a Color Ramp driving light strength, F-curve Cycles modifier for the strobe; web CSS `mask-mode: luminance`, `feTurbulence baseFrequency="0.01" numOctaves="3"` with animated seed, `@keyframes` infinite.
- Pitfall: needs a source that is pre-lit from the sides (the mock-up pack used was paid; reproduce with Blender lights).
- Check: verified [luma-matte layer frame, Fractal Noise frame with `time*` typed, Strobe Opacity keys and `loopOut("cycle")`]; 700 heard.

### Lightning and flash light
- Makes: a flash that swaps a dark and a lit painting, a frozen forked bolt, and a flash blob at the strike point.
- AE (flash): paint subject and background twice (dark, lit). Key the lit subject's Opacity 0, 100, 0, 100, 0 with uneven spacing (quick flashes close together, then slower). Link the lit background by pickwhip: `thisComp.layer("Bat Light").transform.opacity`. Eyes at 80% so black eyes sit in the colour. Study slow-motion lightning with Shift+arrow keys (strong flash, slow fade).
- AE (bolt): Effect > Generate > Lightning (listed Obsolete but still present; Advanced Lightning also exists); drag Start and End, precompose "Lightning 1", set the comp to 1 frame (or Time > Freeze Frame), Outer and Inner colour white, Width 2, Core 1, blend Add; glow stack Radii (default)/25/100/200, Threshold 60%, Intensity 1.0, Add; Opacity 100% then 0%; strike reveal: Pen mask over the lower half, Subtract, Feather about 390, key Mask Path. Change Random Seed per bolt (duplicate comps with Ctrl+D in the Project panel, Alt-drag to replace).
- AE (strike light): very pale purple solid, Pen mask at the top, Feather 390, Add, Mask Path moves up and shrinks in a few frames while opacity falls.
- Principle: one driver value, all lights follow; four glows of rising radius give falloff; freezing a procedural effect in a 1-frame precomp is the workaround for effects that do not hold still. For logo-shaped bolts, add many Lightning effects stuck to a rounded mask edge (Advanced Lightning outline alone looked "shocking").
- Free: Blender driver on a light-version Mix factor, point light with keyframed energy, geometry-nodes branching curves with Glare (untested); web one CSS variable `--flash` read by both layers, SVG path from seeded midpoint displacement with layered `feGaussianBlur` glow, canvas random-walk bolts with `shadowBlur`.
- Check: verified [opacity pickwhip text, 1-frame precomp Time Remap, Glow 2 radius 25 and Glow 3 typing 100, Subtract mask feather 390]; logo bolts AE values heard.

### Shine sweeps and flash shadows
- Makes: highlight glints and camera-flash strobes.
- AE (shine): a very long rectangle shape layer with Wave Warp for a wobbly edge, moving across the lens or prop, as the Alpha Matte of the shine target (Set Matte would do too); Curves to brighten the prop with a keyframed mask path along it. The shimmer-sweep final Curves shape was unverified.
- AE (camera flash): four drawings "flash 1 to 4" sequenced end to end, 8 frames each; each with Opacity keys 100 at 0, 0 at frame 4, 100 at frame 6, right-click Toggle Hold Keyframes; a rotated rectangle with a scale pulse as the flash star; looping texture Screen on top.
- Principle: a travelling highlight signals shine and gives anticipation; switch drawings then punch brightness with hold keys.
- Free: Blender emission strip through an alpha-clipped material, Constant-interpolated keys; Fusion Rectangle mask plus Ripple plus Matte Control (untested); web `mask-image` animated linear-gradient, `animation-timing-function: steps(1)`.
- Pitfall: strobes can be intense.
- Check: verified [flash layer opacity keys at 8-frame spacing]; shine sweeps heard or unfrozen.

### Heat shimmer and animated gradient backgrounds
- Makes: atmospheric refraction on a sun, and soft shifting colour fields.
- AE (shimmer): Turbulent Displace warped horizontally on the sun (wavy-edged yellow sun behind a black silhouette; exact values not shown).
- AE (gradients): solid with Fill, Pen mask, Mask Feather very high (511 px), Effect > Distort > Turbulent Displace (Displacement Turbulent, Amount 50, Size 100 or 350, Complexity 1), Evolution `time*200` (`time*100` slower). Duplicate per colour, move the masks, a different Random Seed each (copies warp identically otherwise). Only neighbouring hues on the colour wheel (green into pink makes mud). A vertically flipped copy as an Alpha Matte with Wave Warp (Sine, Height 10, Width 200, Direction 90) gives a wave reflection. A mid-colour tip: add a warmer 50% gray in the middle of a black-to-white gradient fill. Add Noise against banding.
- Principle: feathered colour blobs warped by shared turbulence; different seeds make them drift apart.
- Free: Fusion Displace with Fast Noise on Ellipse with Soft Edge (untested); Blender Noise Texture driving a Gradient vector input; web blurred radial gradients animated, or SVG `feTurbulence` distorting blurred circles; `feTurbulence` plus `feDisplacementMap` for shimmer.
- Check: verified [Fill orange, Turbulent Displace Amount 50 Size 100, `time*200`, Feather 511, Wave Warp 10/200]; shimmer result look verified, values heard.

### Thickness and inner glow from one alpha (pumpkin cutout)
- Makes: a glowing cutout (logo reveal, Halloween title) with thickness, inner gradient, light rays and edge highlight, all driven by one alpha layer.
- AE: comps: Cutout (any shape on transparent, also the matte for the skin), Interior (fire on orange), Exterior skin. Thickness: "Cutout Thick" with Fill Invert; bottom copy scaled about 84%; 10 stacked copies each +2% scale; smooth with Simple Choker (Choke Matte 5, a second at -5). Shading: Fill darker, Multiply, Radial Blur (Zoom, Amount 40) matted by "Cutout Thick"; inner light: "Thick highlights" Fill bright yellow inverted, CC Radial Fast Blur, Add, matted; rays outside: Interior-only comp, CC Radial Fast Blur Amount about 80, Overlay; edge highlight: Bevel Alpha very subtle plus black Fill on Screen so only the highlight remains.
- Principle: thickness is offset copies of one alpha; shade with a blurred inverted copy (zoom blur from the centre); light with radial blur on Add or Overlay.
- Free: Blender Solidify or extrude plus a point light inside (3D route), or compositor Dilate/Erode, zoom Blur, Mix Add/Overlay/Multiply; Fusion Erode/Dilate, Directional Blur Zoom (untested); web canvas drawing the mask at 10 scales, `feMorphology` for choke.
- Pitfall: heavy to preview; a flatter 2D version renders much faster.
- Check: verified [finished frame and Effects panel search]; steps 1:00 to 6:40 heard.

### Soft 80s glow shading by clipped brushes (Photoshop)
- Makes: a planet or character shaded with soft saturated clipped brushes.
- Photoshop: Illustrator > Export As > Photoshop (Write Layers, Maximum Editability). Soft round brush; number keys set brush opacity (5 = 50%) or layer opacity with the Move tool. Alt-click between layers for clipping masks. Shade a crescent on the side away from the light; a more saturated blue clipped layer underneath for the dark falloff and a pink rim; behind the subject a soft blue then pink glow layer under the main layer with a larger brush; drop to a small brush to lose the subject edge; cast shadows with the darkest palette colour at about 30%; add noise and paper texture.
- Principle: stacked, clipped, low-opacity soft brushes in saturated hues (blue shadows, pink rim, yellow highlight).
- Free: Krita Inherit Alpha, same brush workflow; Blender Texture Paint or Grease Pencil Alpha Lock; Fusion Merge with soft Ellipse masks (untested).
- Pitfall: watch banding in soft gradients (fix with noise).
- Check: verified [clipped layers, pink rim at 20%, finished glow with Add Noise and Screen texture].

## 9. Colour and channel looks

### Palette from a moodboard in HSB
- Makes: a five-colour palette that sits together, with one accent for the effect.
- Steps (Illustrator): screenshot the board, paste into a document, scale down, draw five squares, eyedropper from the references into each (black, strong red, flesh, darker shadow, purple for lightning). Colour panel menu > HSB; nudge hue, saturation and brightness together until they relate. Copy the hexes: #181A1F, #632929, #B82A25, #674E99, #F8E9CE (purple read as H 260, S 49, B 60).
- Principle: raw eyedropped colours rarely harmonise; edit all three channels together; few colours, one accent.
- Free: the hexes work anywhere; palette tools Coolors and Lospec; Inkscape and Figma HSV pickers; Blender picker has HSV; CSS `hsl()` (panel names untested).
- Check: verified [Color panel and swatch frames].

### RGB split (chromatic split)
- Makes: chromatic aberration without a plugin; a breathing psychedelic fringe.
- AE: Effect > Channel > Shift Channels on three copies: layer 1 keeps Red (Green and Blue Full Off), 2 keeps Green, 3 keeps Blue. Set all to Add. Nudge: red up-left, blue up-right (1 to 3 px for subtle: yellow and cyan fringes). Directional Blur (length about 10, only in the offset direction) for a CRT gradient fringe. Warped: Optics Compensation with Reverse Lens Distortion, FOV about 15 on red and a little more on green so the split grows toward the edges. Breathing version: Turbulent Displace (Displacement Turbulent, Amount 30, Size 100, Complexity 1, Evolution `time*200`, Amount keyed 0 to 30 each second with F9, a different Random Seed per channel), Posterize Time 12.5, light texture on Screen.
- Principle: additive light recombines to the original (R+G+B = white; R+G yellow, G+B cyan, R+B magenta); misalign or distort each channel and the fringe lives.
- Free: Blender Separate Color, three Translate nodes, Combine Color, or the Lens Distortion node's Dispersion; Fusion Channel Booleans, Transform offsets, Merge Add (untested); web SVG `feColorMatrix` per channel plus `feOffset` plus `feBlend mode="screen"` (or `feComposite operator="arithmetic" k2="1" k3="1"`), CSS `mix-blend-mode: screen` on three tinted copies.
- Check: verified [Shift Channels panel, Turbulent Displace 30/100/1.0 with Add layers, 12 FPS adjustment layer]; offsets and `time*200` heard.

### Additive RGB circles and kaleidoscope
- Makes: hypnotic loops from three colour layers and one adjustment layer; additive light bursts.
- AE (burst): three ellipses filled 255,0,0 / 0,255,0 / 0,0,255 on Add, parented to a centre null, Position out and back, null Rotation 0 to 360, F9. Adjustment "blur": CC Radial Fast Blur Amount 30, 50, 85 (Zoom Standard); "warp": Wave Warp (Height 60, Width 100, Square, Direction 90) and Turbulent Displace (Amount 600, Size 25, Horizontal Displacement, `time*100`); order changes the look.
- AE (kaleidoscope, 10 s, 24 fps): red, green, blue rectangles on three shape layers, Add, Rotation keyed 0 to 90, -360 and 360. Adjustment "Effects" top to bottom: CC Radial Fast Blur (Amount 84, Standard), Gaussian Blur 100, Twirl (Angle 230, Twirl Radius 30), CC Kaleida (Size 50, Mirroring Starlish, Rotation keyed 0 to 360, Floating Center on), CC Lens (Size 107, Convergence 100), Noise HLS Auto (Grain, Lightness 10, Size 2, Speed 24). Lower Twirl Radius removes black pockets; moving a shape a few pixels shifts hues. Logo inside: precomp logo on a 50% gray solid with Screen, Displacement Map (Map = Logo, horizontal 0, vertical -150, Luminance, Wrap Pixels Around, Expand Output on, Source Effects & Masks, blur 30 to 50 on the map). Cyberpunk variant: delete Twirl, CC Lens and Noise; CC Kaleida Mirroring Unfold, Size 80; Mosaic 80 by 45 above the Displacement Map; Gaussian Blur 10 on top.
- Principle: additive layers give wide hue range without mud; blur before twirl before mirror gives soft gradients with some hard edges; gray is no move, white and black push opposite ways; low-res blocks before displacement look digital.
- Free: Fusion Merge Add, Blur, Vortex, Lens Distort, FilmGrain (mirror untested, third-party macros); Blender Blur, Lens Distortion, Mix (mirror with Mapping and Math, untested); web CSS `conic-gradient` or SVG `<use>` with rotate and `scale-x(-1)` in 8 slices, `filter: blur()`, `mix-blend-mode: plus-lighter`, canvas `imageSmoothingEnabled = false` for blocks.
- Pitfall: put the blur above the mirror (AE applies top first); CC Kaleida, CC Lens and CC Radial Fast Blur are bundled Cycore effects, so other apps need the free routes below.
- Check: verified [kaleidoscope stack values on frames, Displacement Map panel, Mosaic and Unfold stack, burst stack frames, Turbulent 600/25 values].

### Colorama hyper-colour, rainbow cycle and chrome type
- Makes: animated rainbow backgrounds and chrome type with moving reflections.
- AE (rainbow): Gradient Ramp (black to white, Linear Ramp), Colorama with Hue Cycle preset, keyframe Input Phase > Phase Shift 0 to 360 over the section.
- AE (chrome): 50% gray text precomp "Type"; solid "Gradient": Gradient Ramp (vertical black to white), Colorama with Phase Shift `time*100`, Output Cycle Golden, Hue/Saturation (desaturate), Curves (more white, more black), precomp, above the type with Preserve Underlying Transparency, Overlay. On the type: Inner Glow (Screen, 75%, Gradient colour type, Softer, Edge, Size 10, Range 50%); duplicate with Bevel Alpha (Edge Thickness 2, Light Angle -60, Intensity 0.40 to 1, Overlay). Works better on thin type.
- Principle: luminance into a hue cycle; gray base in Overlay gets only the shading you add, so a bright/dark cycling gradient becomes reflections.
- Free: Fusion Background gradient plus Color Gain with animated hue; Blender Gradient Texture to Color Ramp (rainbow) with animated offset, Principled BSDF Metallic with a Color Ramp and environment for real chrome; web CSS `linear-gradient` with `hue-rotate` animation, `background-clip: text` with animated `background-position`, `-webkit-text-stroke` plus inset `text-shadow` for the bevel.
- Check: verified [Gradient Ramp and Colorama phase 122.6 keyed; chrome Gradient Ramp plus Colorama stack, Inner Glow panel, Bevel Alpha values].

### Star glow, stargate slit-scan and Card Wipe glitter
- Star glow without Starglow: top copy of the finished comp, Directional Blur Direction 45 Length about 260, Curves with a steep S that crushes everything but the brightest values, Screen; a second copy at Direction -45, Length about 344. Free: Blender Glare Streaks (Streaks 2, Angle Offset 45); canvas stretch. Paid plugin named in the source: Trapcode Starglow. Check: verified [Direction 45 Length 261.3 and -45 Length 343.9].
- 2001 stargate slit-scan: comp "Stargate Gels" 15000 by 1080 filled with coloured dashed lines, a Repeater triangle and Fractal Noise solids (Contrast 3500, Brightness -900, Block, Scale Width 500, Height 80, Complexity 4, Sub Scaling 42) Tint-coloured, Screen, scrolled across 15 s; main comp CC Power Pin for perspective plus a Flip Horizontal copy offset by 1 s; adjustment: Optics Compensation (Reverse Lens Distortion on, FOV 120) and Warp (Fisheye, Bend -35 to -100), Hue/Saturation Master Hue about 200, Noise 5%, Gaussian Blur 3, four Glows (30/100/200/400), pre-render, duplicate, Screen, time-offset, rotate 180, Master Hue 111. Free: Blender long emissive plane through a camera, Lens Distortion, Glare Fog Glow several passes, Mix Screen; three.js tube with scrolling emissive texture and bloom. Pitfall: four Glows slow AE to a crawl; pre-render before layering copies. Check: verified [Block noise values, Power Pin, Optics Compensation FOV 120, Glow values, Master Hue 111].
- Card Wipe as glitter: Effect > Transition > Card Wipe on a white solid (preset "Card Wipe - 2D fractured"), small tiles, random rotation, swirl layer as track matte, Overlay, Curves to boost contrast. Free: Blender instanced thin cards with random rotation; three.js `InstancedMesh` of planes. Check: verified [glitter frame].

## 10. Stop-motion and cutout looks

### Paper cutout boil (Wiggle Paths plus posterizeTime)
- Makes: shape edges and positions that jump like fresh-cut paper every few frames.
- AE (24 fps, shape layers from Illustrator): Add > Wiggle Paths: Size 20, Detail 0 to 10 (0.5 in the other piece), Wiggles/Second 0 (or 6 with Posterize Time 6), Points Corner. Alt-click Random Seed and enter `posterizeTime(6);` newline `time*50+(index*100)` (posterizeTime must be the first line; `index*100` gives each layer its own seed). Copy the Wiggle Paths property to all shape layers. Reused pieces that only shift: `posterizeTime(6)` then `wiggle(6,2)` on Position, Copy Expression Only; Rotation about 1; outer burst layers 0.3. Or Effect > Time > Posterize Time 6 on the layer so it flows through every comp above (light rays react to the changing shape).
- Principle: stepped time plus per-layer random seeds simulates hand-moved paper; paths wiggle only for pieces that would be re-cut, position wiggle for pieces that are reused.
- Free: Blender Grease Pencil Noise modifier with stepped seed or Geometry Nodes Random Value seeded by `floor(frame/4)` plus object index, F-curve Stepped modifier; Fusion Perturb or Shake stepped by `floor(time/4)` (untested); Remotion `random(\`${index}-${Math.floor(frame/4)}\`)` driving SVG `feTurbulence` seed with `feDisplacementMap`.
- Pitfall: Turbulent Displace on an adjustment layer is cheaper but less controllable.
- Check: verified [`posterizeTime(6); time*50+(index*100)` with Seed 1108, Wiggle Paths Size 20 Detail 0; 20/0.5/Corner/6/50% settings]; Posterize 6 value heard.

### Cutout utilities: matte from footage, grid warp, cycling fills, spiral stack
- Matte from footage: adjustment layer "Extract Transparency": Gaussian Blur 25.8 (Repeat Edge Pixels), Threshold 128, Extract White (Luminance, Black 0, White 217) or Extract Black (Black 31, White 255); use only one. Free: Fusion Luma Keyer plus Matte Control; Blender Blur then Color Ramp constant into Set Alpha; SVG discrete `feComponentTransfer` into `feColorMatrix` alpha. Check: verified [both Extract panels].
- Grid plus Bezier Warp: adjustment layer, Effect > Generate > Grid, Effect > Distort > Bezier Warp to wrap the matte (warp the matte, not the artwork), grid off. Free: Blender Lattice or Simple Deform; Fusion Grid Warp; web CSS 3D transform or SVG `feDisplacementMap`. Check: heard.
- Cycling fill colours: Fill effect, Color keyed through three greens at 4-frame steps, `loopOut("cycle");`, copied to the next burst with the colour order offset one step. Free: Blender Color Ramp (Constant) driven by `(frame/4 + index) % 3`; CSS `steps(3)` with `animation-delay`. Check: verified [`loopOut("cycle");` on a Fill Color].
- Spinning-stack spiral: still sequence, each 2 frames, Keyframe Assistant > Sequence Layers, pickwhip each layer to the one beneath, Scale 89% (each 11% smaller). PNG sequence: Interpret Footage > Main frame rate 15 for a 30 fps comp. Free: Blender Array modifier or chained empties; Remotion `scale = 0.89 ** i`. Check: heard.
- Scrolling tile pattern: Effect > Stylize > Motion Tile (Tile 100 by 100, Output Width 510, Output Height 770, Phase 180 offsets rows like bricks, Mirror Edges off), animate Position; larger, closer tiles move faster for depth. Free: Fusion Tile; Blender Mapping repeat or Array; CSS `background-repeat` with animated `background-position`. Check: verified [Motion Tile values].
- Stock turntables: a pre-rendered 360 PNG sequence imported as footage (Interpret Footage rate 24, Loop 20) gives a 3D look without 3D; free stand-in: a Blender turntable render of a free model. Check: heard.

### Strata-cut clay and other real-material sources
- Makes: organic motion from real plasticine slices photographed frame by frame, composited as a logo cut.
- AE: compensate perspective shrink with a scaled comp and rotation; cut the clay with the logo shape (Stencil Alpha, per the transcript); bend the circle with Mesh Distort so the colours flow; Roughen Edges with the Evolution seed expression to boil the edge. Background: duplicate the logo comp scaled up, Gaussian Blur 50 (Repeat Edge Pixels), CC Radial Fast Blur Center 540,540 Amount 51 Standard, gentle S Curves, rotated opposite the logo, a less blurred duplicate on Overlay; text on Difference.
- Principle: real-world texture for organic motion, fix geometry in post; keep the background a soft blurred echo of the subject so the logo stays readable. A mirrored CC Kaleida background looked too digital for hand-made foreground and was dropped.
- Free: Blender Blur, Directional Blur (Spin), RGB Curves, Alpha Over; Fusion Blur plus Radial Blur variants plus Color Curves (untested).
- Check: verified [Strata 03 layer stack, blur and curves values]; Mesh Distort and seed heard. The same video's Y2K glass logo (verified Venetian Blinds Width 21: stacked tinted copies with feathered masks for shadow, mid and highlight, an Inner Glow edge, a feathered white mask highlight, a light-spill duplicate under it, plus a pale grey striped background) shows volume from stacking feathered copies rather than 3D; SVG `feSpecularLighting` on a blurred alpha is the nearest one-filter free route.

## 11. Blur (shape, depth, look)

### Rounded corners and gooey merge (blur plus Levels on alpha)
- Makes: uniform round corners on any shape (inner corners too), and shapes that melt together when close.
- AE: Gaussian Blur about 20, then Levels, Channel Alpha: move the input black and white triangles toward the middle until the edge is crisp (leave a slight gap or it goes jagged). Paste the same pair on an adjustment layer named "Effects" for a gooey merge; different colours mix into a gradient. More blur means a larger radius; re-tighten Levels. Consistent when scaled.
- Principle: blur softens corners, thresholding the alpha re-crisps at a rounded contour (a metaball); Levels does not know about separate shapes so overlapping blurs merge.
- Free: SVG `feGaussianBlur` then `feComponentTransfer` with a steep alpha table (the goo filter); CSS `filter: blur(10px) contrast(20)` on a parent; Blender Blur then Color Ramp (constant) on the alpha; Fusion Blur then threshold on alpha (node names untested).
- Pitfall: crush too far and it goes jagged.
- Check: verified [Blurriness 20 and Levels Alpha frame, rounded star]; adjustment-layer gooey merge is the same stack.

### Depth of field from a blur map
- Makes: shallow depth of field and rack focus from a gray layer.
- AE: duplicate the main comp and make the map: fill the top layer white (Fill effect), paste the Fill onto layers beneath with opacity about 4% and blend Add so layers stack to white in the middle and darker out, plus an adjustment Curves for contrast. In the main comp add Camera Lens Blur (Blur Radius 50) on an adjustment layer: Blur Map Layer = the map comp, Channel Luminance, Placement Center Map, Iris Hexagon, Highlight Threshold 204; tick Invert Blur Map if the wrong areas blur. White is maximum blur, black none; animate Blur Focal Distance for a rack focus. Hide the map.
- Principle: a grayscale map drives blur per pixel, equal to a depth map.
- Free: Blender compositor Defocus with a Z input (a custom mask can be used as Z); Fusion Lens Blur or Variable Blur with a depth input (untested node names); three.js `BokehPass` or a shader blur with a depth texture.
- Pitfall: high render time; Compound Blur takes maps too but looks worse.
- Check: verified [Camera Lens Blur panel with Blur Map layer, Luminance, Center Map, Threshold 204, blurred tunnel result].

### Breathing focus and blurred echo backgrounds
- Camera Lens Blur breathing: Blur Radius 0 at the start, about 4 px at 1 s, back to 0, Easy Ease; repeat with 6 and 8 px at later beats (a shadow passing, a look at camera). Hexagon highlights where Gaussian Blur blurs evenly; renders slower (1.03 s a frame at 75 px). Moody title grade: Glow Radius 100 Intensity 0.5, per-channel Curves (Blue highlights up, RGB and Red highlights down), Hue/Saturation Reds (Saturation 90, Lightness 85), Camera Lens Blur 10 at the start, 1 at 0.5 s, 10 at the end (never fully sharp), Noise 10% last. Free: Blender Defocus (Polygon, 6 blades) plus Glare; web animated CSS `filter: blur` (hexagon bokeh needs WebGL, untested). Use Gaussian Blur when render time matters. Check: verified [Camera Lens Blur panel, Hue/Saturation 90/85, Noise 10%].
- Blurred echo of the subject behind it: see Strata-cut clay (blurred duplicate scaled up with radial blur, rotated opposite).

## 12. Organic FX

### Ink and watercolour bleed
- Makes: text or footage that diffuses like ink on wet paper, re-rollable with one value.
- AE: precomp "Ink Base"; Camera Lens Blur on it; map layer: solid with Fractal Noise (Fractal Type Smeary, Noise Type Soft Linear, Contrast 250, Brightness 0, Scale 500, Complexity 6). On Ink Base, Blur Map Layer = the map, Source Effects and Masks, Blur Radius keyed 0 to 150 over about 2 s with F9, map hidden. New Random Seed gives a new pattern; a Subtract mask on the map (Feather 99 and 300) keeps letters legible. Paper: black-on-paper texture twice (Screen with brightened Curves above; Multiply with Invert above Curves, Rotation 90 below), plus an adjustment layer with Find Edges on Multiply so pigment pools at the edges.
- Principle: spatially varying blur from a noise map looks like pigment diluting; edge pooling is the missing cue of real watercolour.
- Free: Fusion Variable Blur with a Fast Noise mask (untested); Blender Defocus or Bilateral Blur with a Noise texture as depth, Sobel filter for edges; web SVG `feTurbulence` into `feDisplacementMap` or WebGL blur with a noise texture; CSS alone cannot do it.
- Pitfall: high render time.
- Check: verified [blur map dropdown, Fractal Noise values, masked map, dark pigment rims].

### Procedural light leaks
- Makes: fast red and blue colour flashes with organic motion.
- AE: solid, Fractal Noise (Scale 600, Contrast 50, Complexity 1 reduced from 6), Tint (white to pure red), Screen; Ellipse mask Feather 1000, Mask Path keyed about 6 frames following a real leak reference; blue duplicate with changed tint, new Random Seed, shorter; slower corner leak at 50%; real leak footage at 5% optional.
- Principle: use noise, not flat colour, so the light has turbulence; copy real leak timing.
- Free: Fusion Fast Noise plus Color Corrector plus soft Ellipse mask with Screen; Blender Noise Texture, Color Ramp, mask, Mix Screen; CSS animated radial-gradient with `mix-blend-mode: screen`.
- Check: verified [Light Leak Red stack with Fractal Noise, Tint, Mask feather 1000].

### Scan lines and dirt patches
- Makes: a surface that is never clean (titles, screens).
- AE: solid with Fractal Noise (Contrast 200, Brightness -50, Scale 300) plus Venetian Blinds (Transition Completion about 50 to 59%, Direction 90, Width 4, Feather 0), Gaussian Blur 4, Multiply; a second solid with Fractal Noise only on Multiply (Scale 300, slightly higher brightness).
- Principle: stack tiny structured noise and random noise so no layer is clean.
- Free: Fusion Fast Noise plus a Lines pattern on Multiply; Blender Noise plus Wave texture; CSS `repeating-linear-gradient` scanlines with `mix-blend-mode: multiply`.
- Check: verified [Fractal Noise and Venetian Blinds panels, Width 4, Direction 90].

## Licences, paid items and plugin stand-ins

- Free from the source: project files with texture loops, dither patterns and Hand Drawn setups are given behind the creator's email form or description links, with third-party textures removed. Open them yourself; they are not downloaded here, and license terms are the creator's. Photoshop brushes named in the notes (a free grain brush, Kyle T. Webster watercolour, "BM Grain") live behind the creator's links or Adobe; Krita brushes are a free route.
- VC Color Vibrance (Video Copilot) is free, name your price.
- Paid, ideas only: Deep Glow (use stacked Glows or Blender Glare), Trapcode Starglow (use Directional Blur at +45 and -45 or Glare Streaks), Shadow Studio 2 (use stacked Drop Shadows), Retro Dither and Pix Dither (use Bayer plus Threshold), Yellow Images 360 heads and pre-lit bust packs, stock texture packs, Epidemic Sound lightning SFX, the paid engraving project, the Kyle T. Webster brush pack (Adobe subscription).
- AE item status: Lightning is in the Obsolete group (still present); Advanced Lightning is the current one. CC Ball Action, CC Kaleida, CC Lens and CC RepeTile are bundled Cycore effects that still ship. Posterize Time, Turbulent Displace, Roughen Edges, Camera Lens Blur, Noise HLS Auto and layer styles all ship today.
