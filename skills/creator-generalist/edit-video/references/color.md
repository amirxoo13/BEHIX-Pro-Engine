# Colour

Colour grading, film emulation, overlays and hue tricks.
Entries are merged across both notes. Merged entries keep both notes' steps. Studio-only items are marked. Every entry ends with its source link.

## Entries

### Glowing eyes
mask, key, glow.
  - Steps: Alt-drag footage up; Fusion on the copy with a Polygon/Ellipse mask over the eyes, keyed along the clip; disable the lower track; Color page > qualifier on the iris colour, Add Alpha Output; compound this; enable the bottom track; Fusion: Soft Glow (gain up) and Rays (position over eyes, weight down, blend down, decay), Color Corrector to recolour.

### Rainbow hair or single-colour hue shift
qualifier + alpha output + Hue keyframes.
  - Steps: Duplicate the clip; Color page qualifier for the colour; mask around areas to exclude; Add Alpha Output; compound clip; in Fusion Color Corrector (or Color Wheel) key Hue to cycle; combine with a new compound clip.

### Dehancer (OFX plugin, paid) film grade on the Color page
film emulation after a base grade.
  - Steps: First nodes: white balance and saturation, grade for warmer highlights and cooler shadows, Color Space Transform to Rec.709 to normalise. Add the Dehancer OFX node: Source camera (or Rec.709), Film Developer, Film profile (Fuji Pro 400H/Kodak/Polaroid), Film Print, Grain (ISO lower = less grain; 35 mm 500 ISO), Halation (red glow around highlights, mask mode to preview), Bloom, Film Damage, Vignette. Final Hue change to remove an unwanted colour.
  - Use when / pitfalls: halation and bloom amplify in highlights; check with mask mode.

### Gradient map, toner and colour utilities in Fusion
Reactor Gradient Mapper or toner macros recolour by luminance.

### Orange and teal anime grade with curves and Hue vs Hue
quick colour look.
  - Steps: adjustment clip over the clip; Color page, close extra tabs (keep viewer, nodes, primaries/curves, scopes). Custom Curves: add a point, raise highlights, lower shadows, lift the black point. Hue vs Hue: click Yellow swatch and shift toward orange, click Blue and shift toward teal (move points away from greens/reds; use the spline control to smooth). Hue vs Sat, Hue vs Lum, Lum vs Sat, Sat vs Sat, Sat vs Lum each give targeted control (for example desaturate green, raise blue luminance). Ctrl+D toggles the node before/after; Alt+S adds a serial node. Save the grade to a Power Bin. Vectorscope skin tone indicator: settings > Show Skin Tone Indicator.
  - Use when / pitfalls: colour changes affect the original colour of that hue in the entire frame (a chair turned grey); for 1080x1080 crops it may not show.

### Colour warper teal/orange (fast)
another grade in the AMV walkthrough.
  - Steps: Color page > Colour Warper (spider web icon) > drag values to orange and teal; keep skin tones along the skin line in the vectorscope; greens to teal, blues to teal, reds lighter/golden; Curves > Editable Splines to lift shadows and gain. Crop 1080 square: Crop node (Y size 1080, Keep Centered). Film grain: Filter node type Grain 4, blend 3, animated (disable until final render). Flicker node: Gamma 0.07, Speed 6 for a subtle flicker. Sharpness: Sharpen 0.2 plus Unsharp Mask about 0.5.

### Overlay and light leak compositing
black-background overlays.
  - Steps: Resolve: place the overlay above the clip, Inspector > Composite > Composite Mode: Add (use Screen if a black background; Multiply for white in Premiere). In Fusion: Merge Apply Mode Screen/Add. Transition leaks: trim to the peak, centre on the cut. (CuteCut Pro version: Blending Modes exposure up, hue orange, keying tab with black, sensitivity super low, smoothness up.)
