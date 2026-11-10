<!-- skill-navigation:start -->
## Reading map

Entry headings in this file, in order. Search for the exact name and read the whole entry.

- [Text and typography](#text-and-typography)
- [Entries](#entries)

Entries: 3D camera typography; 2D camera typography; 3D text with extrude and spin animation; Randomised per-letter text animation (character-level styling); Follower (text animator) titles; Morphing typography with variable fonts (SVG morph); Simple shape or text morph (dissolve + blur + BitMap); Text mask effect with colour; Logo to 3D free (logo as a font); Auto subtitles to Text+ (Studio, 18.5, plus Tikido script); PSD import with layers; Text ring wraps around a subject (3D); Text 3D title with outline and elastic bounce; Split text into letters and animate each (Tekito script); Bake animation to keyframes (Tekito); Basic title animation in Fusion; Ring pop animation; 3D mograph rings and bracket pop (Mograph Monday); Line wrap animation with the Paint node; Vectorise an image into SVG with polygons; Figma UI to Fusion layers
<!-- skill-navigation:end -->

# Text and typography

Titles, Text+ and 3D text, morphs, subtitles, imports.
Entries are merged across both notes. Merged entries keep both notes' steps. Studio-only items are marked. Every entry ends with its source link.

## Entries

### 3D camera typography
words placed on image planes in 3D space and flown through.
  - Steps: Compound clip with markers. Fusion: Renderer 3D (OpenGL, antialiasing High Quality, rate 1 and 2 samples for faster playback), Image Plane (scale 2, Z -1), Merge 3D, Camera 3D with Transform 3D (Z 1.66 centres). 2D text: Text node (font e.g. Moonflower), Erode/Dilate (Circle) to thicken, Shadow (soft, alpha 0.5), each into an Image Plane at different Z (about -0.7, X 0.5) merged into the Merge 3D. View navigation: Alt + middle mouse orbit; scroll zooms with Ctrl. Camera Transform 3D keyframes 3 frames before each word (zoom, X, Y), copy values to the first keyframe, Shift+F flatten, Ctrl+A S-curves with steepest part under the marker, ease at the end. Renderer 3D Motion Blur (8) on; Gradient Extrapolation on the last keyframes. Vignette; Camera Shake (Shake 1.2 or 0 motion variable, pan/tilt 2.7, rotation 1.5, Zoom to crop 0.1); character-level styling follower on the text for per-letter move.

### 2D camera typography
words laid out on a big canvas and a transform camera hops between them.
  - Steps: Mark word beats on audio and timeline. Fusion Comp: Background with Auto Resolution off and a larger pixel size; Text nodes merged onto it (copy text+merge for each word, group words so the camera is slow enough to read). Transform: Center keyed at every marker (Inspector key button), Size zoomed per group, Angle keyed for rotated text. Crop after the Transform to show the final frame. Ctrl+F fit, Ctrl+G grid. Spline: S, S-curves between each keyframe, move all keyframes 2 to 3 frames earlier. Second Transform after the crop for zoom. Paint node line with Stroke "Write On" keyed.

### 3D text with extrude and spin animation
Text 3D with bevel, transforms and textures.
  - Steps: Text 3D + Renderer 3D (Merge 3D optional); Transform 3D (3XF) to centre on Y (Ctrl+G), a second 3XF for animation. Extrusion tab: depth plus Bevel custom shape (roundness at the top). Animate before texturing (faster). Z distance 0 at 12 and 31 frames; pivot between; Rotation X/Y spin (-360) and a lean; S-curves angled not flat. Word swap: key the text, step back one frame and key again, change word where unseen. Bender 3D (axis X, angle 90, Group Objects) keyed in/out. Replace Material with a Reactor KAS Chrome shader and own reflection map. Particles: pEmitter (number 100-150, style Ngon circle, region Cube 4-5) + pRender into Merge 3D (text first), tint colour variance, Fast Noise background; Prism Blur (red only) soft glow. A Dent node (strength inverted, 2-3 frames) on an adjustment clip adds a zoom hit.

### Randomised per-letter text animation (character-level styling)
letters animate from random offsets.
  - Steps: Text node > right-click Styled Text > Character Level Styling; Modifiers tab > key the button; select a letter in the viewer; Transform > Rotation (adapt with angle) and Shading > Position > Offset; repeat for letters; go to the end, key and double-click each parameter to reset to normal. For 3D: Text 3D, extrude depth, right-click Styled Text > Connect To > Character Level Styling > the 2D text's modifier. Edit curves in the spline panel.

### Follower (text animator) titles
Neptune-style titles.
  - Steps: Text+ with Open Sans Extra Bold; Transform zoom over about 40 frames with ease-in; Soft Glow gain and Prism Blur aberration keyed over the same frames; fade using Merge + transparent Background (Ctrl+T) key Blend 40 to 60. Follower modifier: right-click Styled Text > Follower; Modifiers > Order random, Delay about 1.2; Brush tab key Opacity over 10 frames; second Transform shrink; flash-out opacity. Complex title: instanced text nodes used as masks over coloured Backgrounds with their own Transform and distortion.

- Second note, same technique (Follower text animation): per-letter animation with the Follower modifier.
    - Steps: Background (alpha off) > Text+ > right click the text box > Follower modifier; Modifiers tab > Follower: Delay about 1 to 1.25 frames; Shading tab > Position > Offset, right click > Modify With > XY Path; keyframe Y over 24 frames; shape curve to a bob in Spline; add a keyframe far beyond the last visible frame to avoid a stutter at the end. Rotation Z in the Follower tab for spin (-90 to 0). Save the Follower box as a tool to reuse (right click > Settings > Save as Tool; add by Shift+Space; Connect To on the text).

### Morphing typography with variable fonts (SVG morph)
vector point morph between weights.
 - Steps: Variable font (Google Fonts filter Technology > Variable, e.g. Montserrat), install. Fusion composition 4 s. Two Text nodes (same word, all caps, thin and extra bold), aligned (Shading > Size, Erode/Dilate). Script "Vector Snapshot" (We Suck Less) runs on the viewer and saves SVGs; Fusion > Import > SVG at 1920x1080 (may need two tries). Ungroup the imported SVG; select the nodes; run "KA Shape Converter" script to rebuild as Shape nodes. Select a polyline and press Shift+T to show point numbers; both shapes must have the same point count and starting point; delete extra points. Key a letter's Points at 0, 12 and 24 and paste the middle keyframe from the other node (Ctrl+C / Ctrl+V in Keyframes panel); repeat per letter. If start points differ: Polyline right-click > Export, run "rotate SVG points" script (free version: edit file path, CW/CCW and step count in the script, UI panels not available in the Free version), then Import. Spline: Shift+F, Ctrl+T, widen handles, Set Ping-Pong or Loop; Time Stretch button to change the duration. Style: Time Displacement fuse with gradient plus Posterize (steps matching gap), Optical Flow, Border, Infinite Shadow, gradient backgrounds, Grain.
  - Use when / pitfalls: keyframes are tedious per letter; prefer this to bitmap/threshold morph. Pre-render/cache to disk (lock the branch) for playback.

### Simple shape or text morph (dissolve + blur + BitMap)
liquid text swap.
  - Steps: Two Text nodes (similar size) into a Dissolve (first on yellow, second on green), key Mix 0 to 1; Blur key 0, 3-6 in the middle, 0; BitMap with high 0.485, low 0.52 so alpha is solid; plug into Background as mask for colour.

### Text mask effect with colour
text controlling brightness of footage.
  - Steps: Merge + Text; Matte Control with text on Garbage Matte (Alt-drag > Garbage Matte), MediaIn on yellow, matte control into Merge green; Brightness/Contrast gain up under the text and Color Corrector for tint.

### Logo to 3D free (logo as a font)
extrude any logo in Text 3D.
  - Steps: calligrapher.com (free account): Create template (minimal English plus numbers, PNG, largest cell size). Put the logo into a template cell (e.g. Google Drawings, set page to the template size, recolour black), export PNG, upload template, Add Characters, Build Font, download TTF, install for all users, restart Resolve. Fusion: Text 3D, type the character the logo sits on, choose the font, Extrusion depth up, Shading untick "use one material" to colour the sides.

### Auto subtitles to Text+ (Studio, 18.5, plus Tikido script)
AI captions into styled Text+.
  - Steps: Timeline > Create Subtitles from Audio, max characters per line 25. Drag a saved Text+ preset above; lock the other tracks. Workspace > Scripts > Comp > "Subtitle to Text Plus" (Tikido scripts, launched through the Tikido launcher), choose subtitle track 1 and the Text+ video layer (e.g. V2), Convert. Disable the original subtitle track.

- Second note, same technique (Subtitle track to Text+ (free script, Studio not required)): styled captions from an SRT.
    - Steps: get an .srt (Whisper cloud/local, free) > File > Import > Subtitle, drag the track to the timeline. Install script: Fusion bottom-right numbers > Path Map > Scripts > open folder > Edit, drop the .lua in. Make a Text+ styled template (Effects Library > Titles > Text+), drop it in the Media Pool, rename it. Workspace > Scripts > the script: type the template name, subtitle track number (1), tick close gaps > OK. Resolve 21 can bulk-edit all generated Text+ at once.
    - Use when / pitfalls: free version of Resolve has no auto-subtitle; the script uses "ask user" dialogue instead of UI Manager.

### PSD import with layers
Tikido "PSD Splitter".
  - Steps: Open Resolve through the Tikido launcher. Workspace > Scripts > PSD Splitter; pick the PSD and a folder for the JSON; Split. Fusion > Workspace > Scripts > RS > Import > Import PSD Splitter; choose the JSON. Each layer becomes its own MediaIn; select all, Ctrl+Shift+Space > Comp Utility > insert a Transform per layer.
  - Pitfalls: restart if you see glitches; Resolve's native PSD import mangles layer blending.

### Text ring wraps around a subject (3D)
text orbiting a masked person.
  - Steps: ImageMask the subject as above, feed Matte Control into Image Plane > Merge3D <- Camera3D, > Renderer3D. Camera Z translation about 1.655 so the plane lines up with the footage. Add Text3D into Merge3D: Layout tab Type = Circle, Rotation X = 90, Transform tab Type = Lines, rotation -9; widen the Layout width to enlarge the ring. Add Transform3D after the text with rotation order Y X Z; keyframe Y rotation from start to end for the spin. Drag the Renderer3D onto the original media in (creates a Merge) to put text on top; text goes behind the head because the mask image plane sits in front of it.

### Text 3D title with outline and elastic bounce
bold extruded title.
  - Steps: Background (alpha off) > Renderer3D <- Text3D. In Text3D: Text tab Extrusion up; Shading tab: turn off Use One Material, pick a Bevel material colour. Transform tab for Z and Y. Outline with SM Outline (Smokey) after the renderer, twice (black, then white). Elastic: Transform on the text, Size keyframes, right click Size > Modify With > Anim Curves > Source Duration, Curve Easing, Out Elastic, scale/offset values (offset 1, scale 0.2) and tweak Time Scale.
  - Use when / pitfalls: SM tools are free Smokey macros from MediaFire links in his videos (outline, radial, blinds, inner shadow).

### Split text into letters and animate each (Tekito script)
per-letter transform nodes.
  - Steps: select Text+, Ctrl+Shift+Space > "separate" (creates one Text node per letter, merged). Select all letter nodes > RS Comp panel > Insert > XF (adds a Transform XF after each). RS Comp > Pivot to centre each letter's pivot by DoD. Animate one transform (size from 0 to 1), then RS Comp > Copy Parameter > Source = size > select all > Set; offset field 1 or 2 = frame stagger between letters. Fonts panel previews all installed fonts with your text.
  - Use when / pitfalls: Windows only. Install: download the resolve script .zip from his GitHub, extract, run the .exe, make a desktop shortcut "launcher"; Workspace > Console, drag the green square in, tick OK; always start Resolve via the launcher. If a node glitches add a router with Alt-click.

### Bake animation to keyframes (Tekito)
turn expression/modifier animation into keys.
  - Steps: Ctrl+Shift+Space > "utility comp" > RS Comp UI > Bake Parameter: Read the node, pick the parameter (size), set render range, Bake.

### Basic title animation in Fusion
rising text and ring, learning the Merge.
  - Steps: Effects Library > Toolbox > Effects > Fusion Composition onto timeline; Background (alpha off) > Merge; Merge inputs: yellow = background, green = foreground, blue = mask; Ctrl+T swaps. Shift-drag a node onto a line to insert it. Ellipse needs an sRender; link Height = Width by expression; animate width from 0, shape in Spline. For a ring, plug a second Ellipse into the sRender Mask input and invert. Ctrl+drag a slider for fine adjust.

### Ring pop animation
expanding ring to hit on a beat.
  - Steps: Background (alpha off) > Merge <- sEllipse + sRender; Height=Width expression; keyframe width 0 to full over 18 frames, ease-in. Send the sRender into the Merge's mask input as well; Merge settings: Mask channel = Luminance, Apply Mask, Invert; add Time Speed node (delay) to offset the hole against the fill; Erode/Dilate at 0.001 with Filter = Circle to remove a hairline edge. Duplicate node (Jitter, Pre-delay -1) for multiple rings. Copy the nodes into the edit clip, add Time Speed delay (e.g. 9 frames) to place it on a beat.

### 3D mograph rings and bracket pop (Mograph Monday)
3D tube, rings, text on a flat plane.
  - Steps: Background > Image Plane > Merge3D > Renderer3D; Templates > 3D Tube Maker; materials: Background node plugged into the tube's material input via Alt-drag (inner material, slices); Transform3D to move and scale; sRender circles and rings (border width thin, solid off) merged under the 3D; Text3D with rounded font (Rounded), extrusion, one material; keyframe positions off-screen with different S curves per element; Motion Blur on the elements; blue line grows via Ellipse length.

### Line wrap animation with the Paint node
animated strokes behind a subject.
  - Steps: Background > Merge <- Paint node (Polyline Stroke), draw a line ring, select points and Shift+S for smoother curves; connect a mask of the character to the Paint's mask input; Bitmap node with Invert for masked sections; keyframe Stroke Controls > Trim End from 0; S curve in Spline; Soft Glow before Paint with gain lowered for brightness.

### Vectorise an image into SVG with polygons
stretchy typography shapes.
  - Steps: Reactor > install "Vector Snapshot". Make the subject white on transparent (Background node set white feeding in; if black and white image set Channel = Luminance), put the image in viewer 1, add Auto Domain, Ctrl+Shift+Space > "Vector snapshot" (second option); SVG is written to a temp folder (save it elsewhere). Fusion > Import > SVG; the group holds masks/polygons per shape.

### Figma UI to Fusion layers
complete UI from Figma as editable Fusion layers.
  - Steps: Figma > community file; plugin "PSD Export" (free tier is five exports a month) at 4x with "Export text as font"; open in Affinity (free): ungroup everything (Ctrl+Shift+G repeatedly); every layer needs a unique name, so run his AutoHotkey script (F11 = layer count, F8 = base name, F9 = run) to rename; export File > Export > PSD preserve editability; Fusion > Import > PSD; add Transform and Crop (1080 square) at the end; Ctrl+F to find text layers. Install SF Pro font from GitHub.
  - Use when / pitfalls: AutoHotkey is Windows only.
