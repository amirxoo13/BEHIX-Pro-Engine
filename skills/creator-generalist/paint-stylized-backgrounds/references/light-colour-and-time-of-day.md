# Light, colour and time of day

## Reading Map

- Light types and lighting preview
- Coloured two-sun lighting
- Three-point lighting
- Glow and fog glow
- Light rays, lens flare, haze
- Teal-orange grade
- One background for evening, night and rain
- Stars, vignette and night conversion
- Animated light

## Light types and lighting preview

- Preview: Render Engine = EEVEE, Z > Rendered. Solid view has no lighting. World Background strength about 0.1 so lights read clearly. The default point light is 10 W. Raise it to about 100 to see it.
- Types (Object Data properties > Type):
  - Point: only location matters.
  - Sun: only rotation matters. Strength about 5. Parallel rays and sharp shadows.
  - Spot: location and rotation matter. Spot Shape > Size is the cone angle, Blend is the edge softness.
  - Area: Rectangle, Square, Disk or Ellipse. A larger size gives a softer shadow.
- Power is in watts for point, spot and area (about 100 for area, 180 for spot in the demo). Sun uses strength.
- Per-light Diffuse, Specular and Volume sliders scale each effect for that light.
- Shift+T then click a target aims a light at a point. This is faster than rotating by hand.

## Coloured two-sun lighting

This gives the anime look: warm light and blue shadow.

1. Add a Sun and aim it through the window or over the scene. Set a warm orange colour and raise the strength.
2. Add a second Sun named "ambient light". Turn Shadow off. Set a cool bluish colour. Aim it at the shadow area. Raise the strength slightly.
3. Shader Editor > World: change the default grey Background colour to a very dark blue. This tints the darkest values. Step 3 is needed because some shadows still go grey.
4. Optional glow points: add a Point Light with Shadow off, Volume 0 and Specular 0. Raise Diffuse, set a vivid blue colour and a larger Radius. Place it in dark areas and duplicate with Shift+D.

Other styles: Ghibli-like uses a warmer yellow-green fill instead of cold blue. Night swaps to a cool key and warm window point lights. Stylized realistic lowers the strength difference and keeps a believable sky HDRI.

## Three-point lighting

Use it for a figure or a hero prop in the plate. Key: a large Area light (rectangle, about 100 W) in front. Rim: a Sun behind and above, strength about 10. Fill: a Spot light on the shadowed side, with power raised until the shadow lifts. When you paint a figure, use a warm key, a cool rim and a bounced fill.

## Glow and fog glow

Glow is a soft, Screen-blended copy of the whole image.

- Photoshop: select all artwork layers and drag them to New Layer to duplicate. Press Ctrl+E to merge. Apply Filter > Blur > Gaussian Blur sized to the resolution. Set blend mode Screen (or Linear Dodge) and lower the opacity. Add a layer mask with a soft brush to limit it.
- After Effects: Layer > New > Adjustment Layer, Effect > Blur & Sharpen > Gaussian Blur with a high Blurriness, blend Screen, feathered mask.
- Blender compositor: Compositing workspace, Use Nodes, a Viewer node. Use a Glare node (type Bloom or Fog Glow in Blender 5.x, mapped), or a Blur node mixed over Render Layers with a Mix node set to Screen. Connect the Mix to Composite and Viewer.
- Krita: Filter > Blur > Gaussian Blur and layer blend Screen. GIMP: Filters > Blur and layer mode Screen. Fusion: a Blur node merged with Screen apply mode (mapped).
- Lighter Color blend ties character lines into the background colours without brightening everything. Screen and Linear Dodge brighten the whole art. Radial Zoom blur gives light-ray glow.

Ghibli-like: gentle, large radius, low opacity. Stylized realistic: Glare Fog Glow with a high threshold. Retro: skip it, or use hard bloom with few passes.

## Light rays, lens flare, haze

- Glow: new layer in Screen, soft airbrush around bright areas.
- Light rays: draw random shapes where the light enters (a window). Apply Motion Blur (angle and distance) or Radial Blur. Reapply several times to extend the rays. Duplicate and merge the ray layers to strengthen them. Krita: Filters > Blur > Motion Blur. GIMP: Filters > Blur > Directional Blur (mapped).
- Lens flare: put a free lens-flare image on a Screen layer.
- Fog, mist and haze: add a clipping layer to the background layer and paint soft fog with a soft brush. Distant objects get lighter and lower in contrast. For nearer layers, lower the clip-layer opacity so they stay darker and more contrasty.
- New shadows: paint on a separate Multiply layer and apply a slight blur. The blur also helps animation.

Ghibli-like: warm hazy light shafts and soft fog. Stylized realistic: physically based volumetric fog in Blender. Retro: dithered, banded fog.

Distance fog in Grease Pencil, where Mist and volumetrics do not work: Layers tab > Vertex Groups > + named "fog". Add a Vertex Weight Proximity modifier (vertex group = fog, target object = camera, a distance range). Then a Tint modifier with Influence > Vertex Group = fog and the weights button next to Strength on. Lowest and Highest set the start distance and strength.

Use a pale blue to match the sky. The layers must be spread in 3D space. Night: darker, more saturated blue.

## Teal-orange grade

Photoshop: Layer > New Adjustment Layer > Color Balance.

1. Tone = Shadows: slide toward Cyan and add a bit of Blue.
2. Tone = Highlights: toward Red and slightly Yellow.
3. Midtones: a touch of red and blue.
4. Stack a Levels layer to reduce the contrast slightly.

Levels or Curves can also add blue to the shadows. For evening, multiply a soft orange tint. For night, multiply cyan. Adjustment layers keep it non-destructive.

Free tool: Krita Filter Layer > Color Balance or Curves. GIMP Colors > Color Balance. Blender compositor Color Balance node (mapped).

Other styles: Ghibli-like lifts the shadows to green-teal and keeps the highlights creamy. Stylized realistic keeps a subtle split tone. Retro crushes to a limited palette.

## One background for evening, night and rain

1. Paint the base bright, in daytime light, without harsh shadows. Keep it as the master.
2. Split by scene object: sky, clouds, distant buildings, middle buildings, foreground. You can darken and blur the foreground.
3. Per layer, add Layer > New Adjustment Layer > Photo Filter with a warm colour. Adjust Density and keep Preserve Luminosity. Right-click > Create Clipping Mask so it affects only that layer. Fine-tune with Levels and Curves.
4. Repaint the sky for each mood.
5. Evening: warm orange filter, darker layers, a brighter sky, some blue.
6. Night: cold filter, darker layers, new sky, fog. Keep light sources brighter or tint them.
7. Rain: desaturated blue filter, lower contrast for fog, new sky, fog, then rain (CC Rainfall or animated raindrops).
8. Window light: a colour layer in Multiply simulates sunlight through a window. Add glow on a Screen layer.
9. After Effects: Effect > Color Correction > Photo Filter on each layer. Keyframe the parameters for a slow time-of-day change. Animate a Multiply colour layer to move the sunlight.

Free tool: Krita Filter Layer (Color Balance or Hue/Saturation) clipped with Inherit Alpha. Resolve Fusion: a Color Corrector or Color Curves node per layer. Blender compositor: Color Balance and Mix (Multiply) nodes (mapped).

Ghibli-like: warm lamp tones and soft blue dusk. Stylized realistic: graded LUTs. Retro: swap the palette.

## Stars, vignette and night conversion

- Twinkling stars in the World shader: Voronoi Texture with Texture Coordinate (Camera) and Mapping, 4D, Feature F1, Distance Manhattan (hard diamond shapes). Plug the distance into a Color Ramp (star size). Then use a Mix node set to Color Dodge over the vertical sky gradient, and plug it into Background. Animate the Voronoi W value by tiny amounts. Large values move the stars.
- Night conversion in Blender: darken and desaturate the colours and push hues toward blue. Lower the Sun strength from about 5 to just under 2. Remove the clouds. Same source.
- Vignette in the compositor: turn on Use Nodes and add an Ellipse Mask sized to the render. Blur it with a Gaussian Blur. Put it over the image with a Mix node (Multiply).
- Night ocean: warm ramp for sunset, dark cold ramp for night, Emission for glowing foam. See `animate-backgrounds.md`.

## Animated light

Turn on Auto Key. Select the lights and press I > Location, Rotation & Scale on frame 1. At frame 30 move and re-aim the lights.

For a fade, hover over Strength, press I, then key it to 0. A day-to-night change is a colour and value shift. EEVEE updates in real time, so check in Rendered view.

