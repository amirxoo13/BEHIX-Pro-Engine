# Render settings and 3D blockout

Blender names follow Blender 5.x. Where a source used an older name (EEVEE legacy, Blender 2.9x or 3.x), the entry gives the current name. The skill author mapped these names and marks them "mapped".

## Reading Map

- Flat-colour render setup
- Colour management
- Shadows, AO, bloom and reflections
- Camera for backgrounds
- Choose the base: photo or render
- Blockout and props
- Trees, bushes and grass
- Toon material
- World colour and sky
- Outlines

## Flat-colour render setup

For a bright, saturated base that you paint over:

1. Render Properties > Render Engine = EEVEE. Set Viewport Shading = Rendered for a live preview.
2. Color Management > View Transform = Standard.
3. Delete the default point light. Light with a Sun (see light reference).
4. Materials: Principled BSDF with a flat base colour, plus image textures where needed.
5. Render Properties > Film > Transparent on. Output Properties > File Format = PNG, Color = RGBA.
6. Optional: ambient occlusion and bloom. Leave both off when you paint the glow later.

Other styles: Ghibli-like keeps Standard but lowers the saturation of light colours. Stylized realistic uses AgX and full lighting. Retro or PS1 uses Standard, low resolution, no AO and no bloom. Cartoon is the same as anime.

Another setup uses a square 1080x1080 canvas. Turn High Bit Depth on and soft shadows to maximum. Use one Sun at strength about 5 (10 for a bright scene). Set Sun angle and shadow bias as low as possible for crisp shadows. Render a video and also single frames for stills.

## Colour management

- Standard for cartoon, anime and NPR. It keeps the saturation.
- AgX for photoreal or arch-viz. Filmic is removed in Blender 5.x (mapped). Khronos PBR Neutral and Standard also remain.
- This is the most common beginner mistake: Filmic or AgX makes stylized plates look desaturated.

## Shadows, AO, bloom and reflections

Legacy EEVEE settings and their Blender 5.x (EEVEE Next) replacements (mapped):

| Legacy setting | Use | Blender 5.x |
| --- | --- | --- |
| Shadows > Cascade Size, Cube Size | Fix pixelated sun shadows | Gone. Virtual shadow maps. Use per-light Shadow options and Render Properties > Shadows > Rays and Steps |
| Ambient Occlusion (Distance, Factor) | Contact darkening in crevices | Gone. Use Raytracing and horizon scan, and tune light Shadow > Jitter and Soft Shadows |
| Bloom (Intensity, Threshold) | Soft glow around bright areas | Gone. Compositor Glare node, type Bloom or Fog Glow |
| Screen Space Reflections | Glossy floor | Raytracing. Raise Metallic and lower Roughness in the floor material |
| Screen Space Refraction (material) | Glass | Material option Raytraced Refraction |
| Contact Shadows (per light) | Small shadows on fingers and neck | Removed. Use Jitter and Soft Shadows |

- Turn viewport denoising off when characters move. It ghosts.
- Glossy interior floor: SSR must be on before reflective materials show anything. For flat cartoon skip it and use roughness 1.
- Image textures (notice boards, pictures): Image Texture node in the Shader Editor, Color to Principled Base Color. UV unwrap the model first.
- Volumetrics and light probes are for realism. Skip them for stylized work.

## Camera for backgrounds

- Camera view: select the camera and press Numpad 0. Camera properties > Viewport Display > Passepartout = 1.0 so framing is never a guess.
- Move the camera three ways. Use G and R on the object. Or use N panel > View > View Lock > Camera to View, and turn it off when done. Or use Shift+` fly mode (WASD, Q down, E up, wheel for speed, Shift fast, Alt slow).
- Camera properties > Lens > Focal Length: 50 mm default, 10 mm fisheye, 150 mm very zoomed. A longer lens flattens depth, which suits a painted plate.
- Depth of field: tick Depth of Field. F-Stop is the blur amount. Focus Distance or Focus Object sets the focus plane. Blades shape the bokeh of bright lights.
- Render a still first. Use Render > Render Image to check one frame.

## Choose the base: photo or render

- Photo: fits a real location and needs little prep. Shoot in daytime with no hard shadows, high resolution and good perspective. You must match the ambient light by painting.
- Render: fits a made-up place or a stylized real one. You control light, composition and perspective, and you can reuse it.
- Cheapest 3D: simple shapes, basic lights and materials, more painting later.
- Middle ground that the source prefers: a slightly detailed model, simple lights, simple materials, all in Blender.
- Painterly or Ghibli-like: lean toward a simple blockout, because heavy painting hides geometry. Stylized realistic: use detailed models or scans.

## Blockout and props

- Symmetrical building or prop: Mirror modifier with X and Y on, then a Bevel modifier. Bevel catches light and removes the hard 3D look. Reuse models from earlier projects.
- Look up a real architectural style for the roof silhouette. The source used a traditional Malay roof.
- UV unwrap every object so you can paint textures in Krita or Photoshop and apply them. Painted textures raise the painterly look.
- Low-poly or retro: skip Bevel and keep flat shading. Realistic: small Bevel width and Weighted Normal.

## Trees, bushes and grass

- Sapling Tree Gen: Edit > Preferences > Add-ons, search "Sapling Tree Gen", enable (bundled add-on, or the extension in Blender 5.x, mapped). Add > Curve > Sapling Tree Gen. Apply a toon or painted material. Paint extra trees in the paint-over to fill empty exteriors.
- Low-poly tree by hand: Cylinder scaled 0.2 then Ctrl+A > Scale. Raise the top face, scale out and extrude the bottom for roots, delete the bottom face. Proportional Editing (O) with Connected Only pulls roots in and out. Alt+click a loop, scale Z 0 to flatten, Ctrl+B to bevel. Move the origin to ground level. Shade Smooth. Leaves: Icosphere subdivisions 4, Ctrl+1 subsurf level 1 and Apply, Shade Smooth, proportional edit for a blobby shape. Displace modifier with a new Clouds texture, strength about 0.25, then Apply. Ctrl+J joins trunk and leaves. Make 3 variants with Shift+D, proportional edits and Z rotation. Put them in Collections.
- Bush from a displaced icosphere: Icosphere with a Displace modifier using a Clouds texture. Set the texture Coordinates to Global so each moved copy has a different shape. Add a Particle System (Emitter), Render As = Object, instance a plane with an alpha PNG leaf texture. Other styles: realistic uses scanned foliage cards. Low-poly uses a plain flat-shaded icosphere with no leaves.
- Grass patch: plane with Particle Properties > new Hair system. Paint a grass texture on the emitter so the hair takes its colour. Render Properties > Curves (Hair) > Shape = Strip to control the width so the hair looks like blades. Tune Clamping. Add grass and leaf models around for variety. Ghibli-like: fewer, wider blades with strong colour variation. Retro: alpha-card grass. Hair curves are the Hair Curves object in Blender 5.x, so check the Strip option exists (mapped, unverified).

## Toon material

- Shader: Diffuse BSDF (or Principled BSDF) > Shader to RGB > Color Ramp > Material Output. Shader to RGB works in EEVEE only, not Cycles.
- Constant interpolation gives hard cel steps. Smooth gives soft gradients.
- Shadow colour: darker, hue shifted slightly toward blue, more saturated.
- Textured version: Diffuse BSDF > Shader to RGB > Color Ramp. Then add a Mix node (Multiply) with the image texture on top and the ramp on the bottom. Make the ramp light colour white so it does not tint the texture. Factor sets the shadow strength.
- Copy a material by clicking the number next to its name. Link it to other objects with Ctrl+L > Link Materials.
- Painterly: Smooth interpolation with 3 or 4 warm and cool stops. Retro: 2 stops, Constant. Stylized realistic: drop Shader to RGB and use Principled with painted textures.

## World colour and sky

Separate the visible background colour from the scene light. In the World shader, duplicate the Background node and join both with a Mix Shader. Plug Light Path > Is Camera Ray into the factor. The top Background is the lighting. The camera-visible one is the colour you see.

For a sky gradient: Gradient Texture with Texture Coordinate and Mapping (Ctrl+T with Node Wrangler), rotate 90 degrees on Y for a vertical gradient, then a Color Ramp.

## Outlines

Inverted hull: the outline material is an Emission shader with a colour, set as the last material slot. In Material settings turn Backface Culling on and set Shadow Mode to None. Add a Solidify modifier: Thickness (negative pushes outward in this setup), Normals > Flip, Material Offset 2 (or 100 to always use the last slot). It holds when the camera orbits, so it suits props and characters.

Line Art outline (Grease Pencil v3): put meshes in a collection. Add > Grease Pencil > Blank (Grease Pencil v3 object type in Blender 4.3+ and 5.x, mapped). Line Art modifier with Source = the collection, Edge Types: Contour off, Individual Silhouette on, Crease off, Material Borders on. Use a deep blue, not black, for the line colour. Tick Combined and Z in View Layer Properties. Lines are camera based and look wrong outside the camera view.

