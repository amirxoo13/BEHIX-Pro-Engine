# Kdenlive and Shotcut

Steps for the two free open-source editors that run on Windows, macOS and Linux. Written from the Kdenlive manual
(docs.kdenlive.org) and Shotcut's documentation (shotcut.org). Menu names change between releases, so check each
path in the installed version. For effects beyond what they offer, use DaVinci Resolve or FFmpeg.

Reading map
- Kdenlive
- Kdenlive: styled titles, shape transitions, green-screen stingers
- A whole video in open source tools
- Shotcut
- Which one

## Kdenlive

**Vertical project**
1. Project > Project Settings (or the first-run dialog): pick a vertical profile such as 1080x1920 at the
   footage frame rate, or make a custom profile.
2. Drag media from the Project Bin to the timeline. Answer "Switch" if it asks to match the clip profile.

**Cutting**
1. Shift+R cuts the clip at the playhead. Right-click an empty gap > Remove Space closes it.
2. Ripple editing: use the Ripple tool or hold the modifier shown in the status bar while trimming.

**Keyframes and effects**
1. Effects panel: drag Transform onto a clip, then add keyframes in the Effect Stack with the keyframe button.
2. Speed: right-click clip > Change Speed, or the Time Remap panel for a ramp (newer versions).
3. Composition (transition): drag a Dissolve or Wipe from Compositions between overlapping clips on two tracks.

**Subtitles**
1. Project > Subtitles > Add Subtitle, or Speech recognition to generate them (needs a speech model download).
2. Edit text and timing in the Subtitle track. Export as SRT or burn in at render.

**Render**
1. Project > Render (Ctrl+Enter). Preset MP4-H264/AAC, quality around 18 to 23, source frame rate.

## Kdenlive: styled titles, shape transitions, green-screen stingers

Read from full-size frames of dacctal's Kdenlive project and checked against docs.kdenlive.org.

**Styled title (heavy italic with outlines and a shadow)**
1. Project Bin > add button > Add Title Clip... In the title editor set font, size 100, weight Black, Italic, and
   Rotate Z -6 for a slanted look. Leave the editor's own Outline at 0 and Shadow off. Click Update Title.
2. Put the title clip on a track above the footage. In the Effects panel, drag Outline onto it three times and
   Drop Shadow once. First Outline in the example: Thickness 16, near-black. Drop Shadow: Blur Radius 16, X Offset 8,
   Y Offset 8, near-black. Stack outlines of different colours and thickness for a layered sticker edge.
- Use when / pitfalls: stacked effects give thicker, cleaner edges than the title editor's outline. Effects run top
  to bottom in the Effect Stack, so keep Drop Shadow after the outlines.

**Shape transition from a colour clip**
1. Project Bin > add button > Add Color Clip..., pick the colour, place it on the top track at the cut.
2. Effects > Alpha, Mask and Keying > Alpha shapes (Mask). Shape: Rectangle, Ellipse, Triangle or Diamond. Set
   Transition width to 0 for a hard edge (default 200 feathers it). Operation stays Write on clear.
3. Add Transform (Transform, Distort and Perspective). Keyframe the start at Scale 100%, then a keyframe at the clip end
   with a larger scale (the example ends at 218%, Position -1134,-638 for 1920x1080). Set the keyframe type to Smooth
   or an ease such as Cubic In/Out.
- Use when / pitfalls: a shape that grows to cover the frame is a free iris or wipe. Alpha shapes reads Position and
  Size on a 0 to 1000 scale.

**Green-screen stinger**
1. Make the transition animation on a pure green background and put it on a track above both shots.
2. Effects > Alpha, Mask and Keying > Chroma Key: Advanced (Color Selection). Pick the green with Color to select.
   Example values: Color Model RGB, Shape Ellipsoid, Edge mode Slope, Operation Min, the three Delta values 200,
   Soften 0, Invert selection on.
3. Fade the stinger in and out with the clip's green and red corner handles. Audio fades show as Volume/Fade out.
- Use when / pitfalls: a long stinger with its own sound gives a channel a recognisable section break. Check the key
  on a frame with motion blur, where green fringes show first.

**Fast cutting**
1. Settings > Configure Shortcuts: bind cut at playhead and ripple delete to keys next to each other. A big ripple
   delete can take a few seconds on a long timeline. Undo restores it.
2. A Compressor/Expander effect on each voice clip evens out the level before the mix.

## A whole video in open source tools

The pipeline dacctal uses for every video, in order. All tools are free and open source.

1. Folder per video: `<name>.kdenlive`, the rendered `<name>.mp4`, `script.md`, `thumbnail.png`. A Markdown script
   with headings per section makes both recording and the cut follow the same structure.
2. Music in BeepBox or its fork froupbox (browser tracker, the song is saved in the URL, exports WAV). He used
   FamiStudio before for NES-style tracks.
3. Record in OBS Studio. Scenes per use (record, webcam, starting, brb, ending). Put the mic and the desktop audio in
   separate sources so each lands on its own track. On Linux with PipeWire, route devices into the OBS inputs with
   qpwgraph.
4. Thumbnail in Inkscape (see the `2d-generalist` skill, `references/inkscape-thumbnails-and-logos.md`), made before
   the edit because it is also the opening frames.
5. Edit in Kdenlive with the techniques above. Diagrams and maths animations come from Manim (Python).
6. Credits: daccfish (an SDL2 C program by iceyrazor) shows the pasted supporter list as an animated credits screen.
   He records it with OBS and places it after the outro song.
7. Fonts: titles use his own build of Iosevka (open source, built with its web customizer) in the Black weight.

## Shotcut

**Vertical project**
1. Settings > Video Mode > Vertical HD 30 fps (or the custom mode matching the footage) before adding clips.

**Cutting**
1. Drag clips to the timeline. S splits at the playhead. Ripple delete is the default when Ripple is on in the toolbar.

**Filters and keyframes**
1. Filters panel > + > Size, Position & Rotate. Click the stopwatch to keyframe, then edit in the Keyframes panel.
2. Speed: Properties > Speed. A curve ramp needs the Time Remap filter in newer versions.
3. Transitions: overlap two clips on the same track to create a crossfade, then pick a wipe in Properties.

**Text and captions**
1. Filters > Text: Simple or Text: Rich for titles.
2. Subtitles panel imports SRT and can generate captions with Speech to Text in newer versions.

**Export**
1. Export > Presets > YouTube or H.264 High Profile. Set the frame rate to match the project.

## Which one

- Kdenlive has deeper keyframing, proxy clips and a subtitle track. Pick it for longer edits.
- Shotcut is lighter and simpler. Pick it for quick cuts and filters on older machines.
- Neither has Resolve's grading or Fusion. Grade in Resolve or apply a LUT when the look matters.
