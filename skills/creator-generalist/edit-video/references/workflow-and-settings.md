<!-- skill-navigation:start -->
## Reading map

Entry headings in this file, in order. Search for the exact name and read the whole entry.

- [Workflow and settings](#workflow-and-settings)
- [Entries](#entries)
- [Free versus Studio table](#free-versus-studio-table)
- [Version notes](#version-notes)
- [Add-ons, assets and tools named](#add-ons-assets-and-tools-named)
- [Coverage notes](#coverage-notes)

Entries: Cache so Edit-page Fusion effects, transitions and Fusion clips play back; Custom keyboard shortcuts for fast editing; Compound clip as the unit for Fusion work; Fusion clip versus compound clip; MediaIn from the track beneath (Resolve 18+); Fusion housekeeping tips; Fusion settings to change first; Put an original Fusion node on the Edit page (Effects Library); Prepare a project to share or sell (DRP plus rendered footage); Install a free macro pack and project files; Install a paid macro pack (.drfx plus macros); Render settings and cleaning render glitches with HandBrake; Render a custom GIF from Fusion; Preferences and project settings for fast AMV playback; Power Bins (cross-project bins) and safe backup; Render only part of the timeline and ignore render errors; Fusion viewer controls and tab cycling; 3D viewport tips; Fusion hotkey manager (Reactor "Resolve Essentials"); Fusion navigation, search and view tips (100 tips highlights); Save defaults and reusable nodes; Resolve 21 additions seen in 100 Tips; Viewer buffers, split compare, histogram sub-views; Fusion playback speed-ups; Cache to Disk in Fusion (newer Resolve, native saver/loader); Common Fusion glitches and fixes
<!-- skill-navigation:end -->

# Workflow and settings

Hotkeys, cache, settings, macros, packs, troubleshooting and the free versus Studio table.
Entries are merged across both notes. Merged entries keep both notes' steps. Studio-only items are marked. Every entry ends with its source link.

## Entries

### Cache so Edit-page Fusion effects, transitions and Fusion clips play back
stops stutter and missing frames on adjustment clips.
  - Steps: Playback > Render Cache > Smart (or User). If User: Project Settings (cog) > Master Settings > Optimize Media > tick "Automatically cache transitions in user mode", "cache composites", "cache Fusion effects in user mode". Then right-click the clip > Render Cache Fusion Effect > On. Wait for the red bar to turn blue.
  - If one frame glitches: disable and re-enable the clip (D), or shorten the clip around the glitch, clear its cache and extend again. In Fusion, set the viewer's "..." menu > "Show All Video Frames" (forces every frame to display, smoother playback) and enable Repeat/loop.
  - Use when / pitfalls: after adding Fusion effects on the Edit page, or red bar never goes blue. Edit-page effects macros should be copied with Ctrl+C/Ctrl+V, not Alt-duplicated (copies keep breaking).

### Custom keyboard shortcuts for fast editing
one-key razor, compound clip and open-in-timeline.
  - Steps: DaVinci Resolve > Keyboard Customization. Search "Split Clip", click + and add `H`. Search "New Compound Clip", bind `C`. Search "Open in Timeline", bind `Ctrl+T`. On the conflict prompt choose Assign and unbind the Trim Mode shortcut. Save.
  - Use when / pitfalls: cutting every frame with Right Arrow then H; `C` makes a compound clip, `T` (the brief's Ctrl+T binding) enters it.

- Second note, same technique (Custom keybinds that speed up AMV editing): remaps for compound clip, open-in-timeline, open-in-Fusion, delete gaps, split.
    - Steps: DaVinci Resolve menu > Keyboard Customization > search the command > Add > press key (overwrite conflicts; append H to the existing split shortcut instead of replacing). Suggested binds: Compound Clip = C, Open in Timeline = T, Open in Fusion = X, Delete Gaps = Ctrl+Backspace, Split Clip = H, Ripple Delete = G, Delete = F. Save the preset when asked.
    - Use when / pitfalls: do before editing; Delete (not Backspace) in the Edit page removes a clip and shuffles the rest left (Ripple), Backspace leaves a gap in default mode.

### Compound clip as the unit for Fusion work
each cut clip becomes a compound so effects and re-timing are contained.
  - Steps: Make bins (e.g. "CC" and "Twix"). Select clip, press C, name it. Condense all compound clips onto the first video layer. Enter with T. Add a Fusion Composition (Effects Library > Toolbox > Effects > Fusion Composition; click the star to favourite it). Put a Fusion composition over the footage in the compound and extend it to the clip length plus one frame. Alt-drag duplicates a clip upward; disable the film-strip icon and lock the layer to keep a reference.
  - Use when / pitfalls: compound clips give a Fusion page starting at frame 0 and keep music markers visible; compound clips cannot be edited after caching without re-entering.

- Second note, same technique (Compound clips for scene prep, nested timelines and tabs): pre-comp each shot so it can be retimed or trimmed without breaking the edit.
    - Steps: select clip > C (or right click > New Compound Clip); put compound clips in a "comps" bin and slow-mo in a "twixtor" bin. Right click compound clip > Open in Timeline (T) to edit its contents in its own tab. Alt-drag clips to duplicate; R for the speed menu, Reverse Speed, then R again > Freeze Frame to hold the last frame.
    - Use when / pitfalls: a compound clip lets you shorten by dragging the end without cutting the inner footage.

### Fusion clip versus compound clip
a Fusion Clip keeps all clips visible on the timeline but they are accessible in the Fusion page, so a scene can be swapped on the timeline without re-importing in Fusion.
  - Steps: Select clips > right-click > New Fusion Clip. Inside Fusion every clip appears as a MediaIn.
  - Use when / pitfalls: a large multi-scene comp (3D scenes, transitions across scenes). A compound clip flattens everything into one timeline.

### MediaIn from the track beneath (Resolve 18+)
reference the clip under an adjustment clip or Fusion clip inside Fusion.
  - Steps: Add a MediaIn node, Inspector > Media Source: change "Timeline" to "Background". It now reads the clip behind it on the timeline.
  - Use when / pitfalls: transitions that need the clip behind (mask opacity transitions, layered shakes). Magic Mask does not import its original mask shape when pasted.

### Fusion housekeeping tips
faster node-graph work.
  - Steps: Alt+click a line adds a Pipe router for tidy lines. Drag one node's input onto another input to auto-create a Merge. Right-click the spline graph > Options > turn off "Marker Grab" so markers do not snag keyframes. Ctrl+T in the spline editor toggles the handle controls. Select keyframes > right-click > "Gradient Extrapolation" so the last value keeps extending (keeps motion blur going on the final keyframe, prevents ghosting). Right-click above the toolbar > Create Custom Toolbar, drag only the nodes you use, then save the toolbar as a clip in the media pool. Node "Versions" (stacked squares on a node) store alternative settings. Copy a node then Ctrl+Shift+V pastes an instance (all parameters linked); right-click a parameter > "De-instance" breaks the link for that parameter only. Workspace > Layout Presets > Fusion Presets > Mid/Left Flow changes layout. Right-click viewer > Save Image saves the current frame (leave the Fusion page afterwards for the file to appear).
  - Use when / pitfalls: all Fusion tutorials below assume these.

- Second note, same technique (Node versions): up to six saved looks on one node.
    - Steps: click the small numbered squares at the top of a node's Inspector, set values, click another square for a fresh version; switching restores that version's values.

### Fusion settings to change first
Double-click the cache/percentage numbers (bottom right) to open Fusion Settings.
  - Steps: Splines > tick "Auto Smooth" (new keyframes get smoothed). Path Map shows the Macros, Fuses and Templates folders (right-click > open). Under Fusion settings > Flow turn OFF "Auto Remove Routers" when using macros that contain pipes, or deleting a macro can delete its internal pipes.
  - Use when / pitfalls: macro nodes show a missing keyframe lines glitch; disable/enable or delete and undo the node to bring keyframes back.

- Second note, same technique (Fusion settings that fix annoyances): keep controls open, bigger grab handles.
    - Steps: double click the frame numbers (bottom right) > Fusion Settings > User Interface: increase Grab Distance (8 works well, default 5), turn off "Auto Control Close Modifiers" and "Auto Control Close Tools" so you can link two nodes by expression; Flow: turn off Auto Remove Routers. Workspace > Layout > Fusion presets > Mid Flow for vertical/portrait edits (viewer left, nodes right).

### Put an original Fusion node on the Edit page (Effects Library)
save any Fusion node as a template effect.
  - Steps: Fusion > double-click the cache numbers > Path Map > Templates > right-click > open the first folder > Edit > Effects > make a new folder. Copy that folder's address. Add the node, rename it to `template` (F2). Right-click it > Settings > Save As > paste the address > name it (e.g. Transform). Delete the node. The effect now shows in the Effects Library search and can be dragged onto a clip.
  - Use when / pitfalls: needs a restart of Resolve in some cases to show.

### Prepare a project to share or sell (DRP plus rendered footage)
others can play the edit without the originals.
  - Steps: Add a new video track on top (Resolve 18.5: Add Tracks; Move Track Up). Disable every effect layer and adjustment clip (Alt+D) so only footage plays. Deliver page: render that pass (e.g. "0 edits / footage.mp4"). Edit page: new bin "relink", import the rendered footage, place it on the lowest track, then disable the original compound clips and re-enable the rest. File > Export Project (Ctrl+E) saves the .drp; send DRP + footage.
  - Use when / pitfalls: footage and fonts used inside Fusion (overlay images, custom fonts) will not relink. Put overlays into a compound clip on the timeline and use that compound inside Fusion, and switch text to Open Sans which every install has.

### Install a free macro pack and project files
macros via Fusion, projects via Project Manager.
  - Steps: Unzip. Drag the installer file into the Fusion node graph and click OK; macros appear (Shift+Space to find). Project files: open Project Manager (home icon bottom right) and drag the .drp into it. Relink media per the readme.

### Install a paid macro pack (.drfx plus macros)
double-click the .drfx to install Edit-page effects; for Fusion macros: Fusion > double-click cache numbers > Path Map > Macros > right-click open > drop the unzipped macro files in.

### Render settings and cleaning render glitches with HandBrake
delivery settings and a lossless pass.
  - Steps: Deliver page > Custom, Single clip, Video export, MP4 (QuickTime gives .mov), H.264 (H.265 optional), Bitrate automatic/best, set resolution and frame rate. HandBrake: drag the file in, enable Web Optimized, Dimensions > Custom to crop a square edit (e.g. 420 px left and right from 1920x1080), Video > same codec, Frame rate "Same as source" + Constant, RF "Placebo" quality maxed (visually lossless, larger file), rename extension from .m4v to .mp4. Start Encode. Scrub the result to check for dropped frames.
  - Use when / pitfalls: removes Resolve render glitches; uploading to Instagram through the Creator Studio avoids it being converted into a Reel.

### Render a custom GIF from Fusion
GIFs cap at 50 fps.
  - Steps: Create a new timeline (media pool right-click > Timelines > Create New Timeline > untick Use Project Settings > Format: 50 fps). Add a Fusion Composition about 1.5 s. Copy the nodes from the original comp and paste them in. Select all in the spline panel, use Time Stretch (button) and drag so the last keyframe lines up with the new end; untick Time Stretch to snap. Add a Saver node: Browse > folder, file type PNG sequence. Fusion render dropdown > Render All Savers. Upload frames to easygif.com > Make GIF (delay 0, stack frames), then Speed to match 50 fps and Save.
  - Pitfalls: the site downsizes resolution.

### Preferences and project settings for fast AMV playback
1 s default clip lengths, stable render cache.
  - Steps: DaVinci Resolve > Preferences > User > Editing > General: set Standard Generator Duration, Transition Duration and Standard Still Duration to 1 s (so adjustment clips and Fusion comps drag in 1 s long). Project Settings (cog) > 1920x1080, 24 fps > Master Settings/Cache: set Render Cache Format to a ProRes/DNxHR flavour (DNxHR LB/SQ/HQ, never uncompressed), point cache to a fast/external drive, tick the cache checkboxes. Playback > Render Cache > Smart (User mode is unreliable in newer builds). Timeline view options > Stack timelines (tabs) so compound clips open as tabs.
  - Use when / pitfalls: uncompressed cache = huge files and worse playback. Enable "Show all video frames" (three dots in viewer) if playback skips frames while caching.

### Power Bins (cross-project bins) and safe backup
reuse adjustment clips, shakes, overlays in any project.
  - Steps: View > Show Power Bins. Right click > New Bin; drop adjustment clips, Fusion comps, photos in. Backup because a glitch (still reported in Resolve 18) can overwrite power bins: new project > select all media in a bin > right click > Insert Selected Clips to Timeline; drag the bin into the Master Media Pool > right click > Export Bin. Re-import by dragging the exported bin file into the media pool.
  - Use when / pitfalls: crashes, third-party plugins other than Reactor, and moving bins inside power bins can trigger the overwrite.

### Render only part of the timeline and ignore render errors
export a marked range.
  - Steps: I/O (or right click > Mark In/Out) on the Edit page; in Deliver choose Render > In/Out Range. To render despite an error: Preferences > User > uncheck the "stop render on error" box at the bottom (risk: glitched frames).

### Fusion viewer controls and tab cycling
manipulate position, size, pivot, rotation from the viewer.
  - Steps: click the red on-screen widget; press Tab to cycle size, rotation, pivot (X), position (L-arrow) ; hold Alt and drag anywhere to move without clicking the centre. Ctrl+scroll zoom, middle drag pan, Ctrl+F re-centre. Press 1/2 on a node to load it into viewer 1/2; click the viewer button to show only one viewer.
  - Use when / pitfalls: while a control is keyframed the widget makes a separate motion-path handle; Tab does not apply.

### 3D viewport tips
use the viewer angle as a camera.
  - Steps: in the 3D viewer drag a Camera3D into the viewer to create a camera at the current view; right click perspective > Camera3D to look through it and keyframe by moving; Alt+middle-drag orbit, Ctrl+scroll zoom.

### Fusion hotkey manager (Reactor "Resolve Essentials")
bind a key to add a node.
  - Steps: Reactor (Workspace > Scripts > Reactor) > search "Resolve Essentials" > tick install, restart. Workspace > Scripts > Resolve Essentials > Fusion Hotkey Manager > Views > Flow > New > press the letter > pick Tool or Action (for example Color Curves) > OK. Suggested: T = Transform, B = Blur, A = Merge, E = Optical Flow, R = Time Stretcher.
  - Use when / pitfalls: if Ctrl+C gets captured, tap the target key a few times. Resolve's own Customize Hotkeys is hidden; open it via the Ctrl+Shift+Space action menu.

### Fusion navigation, search and view tips (100 tips highlights)
faster flow management.
  - Steps: Shift+Space = Select Tool menu; Ctrl+Shift+Space = Select Action menu (also scripts); Ctrl+Shift+E = show real node IDs; Ctrl+E (default P) = pass-through toggle; Ctrl+F = find node in flow; Ctrl+D = add bookmark, Ctrl+Shift+1/2/3 = jump to bookmark; V in flow = navigator overlay, V again to leave; Ctrl+G = group nodes; right click flow > Scale > Scale to Fit; right click > Arrange Tools > To Grid (Alt-drag to skip snap); right click flow > Show Thumbnails. Hold Alt and click a line to add a router/pipe. Middle+left mouse together = pan/zoom.
  - Use when / pitfalls: pipe routers are auto-removed when you delete a node unless Fusion Settings > Flow > "Auto remove routers" is off.

### Save defaults and reusable nodes
your own node defaults and node groups.
  - Steps: set up a node > right click > Settings > Save as Default (shows in all new nodes of that type; folder under Path Map > Defaults). Select nodes > right click > Save As (or Settings > Save As) into Templates / Macros folder so they appear in Shift+Space and in the Edit-page Effects Library after a restart. Select any Fusion tool, rename to "template", Settings > Save to Fusion/Templates/Edit/Tools/Effects to expose it on the Edit page (e.g. the non-XF Transform). Fusion graphs saved into Templates appear under the Effects Library for adjustment clips (needs Resolve run as administrator on Windows to save to the system folder).

### Resolve 21 additions seen in 100 Tips
batch editing nodes and floating panels.
  - Steps: select two nodes > "Combine Selected Tools" button in the Inspector: shared parameters (same tool ID) appear as one panel, edit and keyframe both at once, and a "Set value" align uses parameter values, not on-screen position. Spline and Keyframe panels can pop out as floating windows. Keyframes of Fusion effects are visible on the Edit-page timeline. Mass-change Text+ styles on many titles. Transform node: set Reference Size to 1920x1080 to get pixel values like After Effects. Ctrl-drag on a Rectangle mask edge/corner moves opposite edge, and Ctrl-drag keyframes auto-fill in-between points.
  - Use when / pitfalls: version note: Resolve 21; older builds lack these.

### Viewer buffers, split compare, histogram sub-views
compare before/after inside Fusion.
  - Steps: set viewer buffer A to node 1 (key 1), B to node 2 (key 2) then top-left buffer button > Split; keys: comma = A, period = B, slash = split. Delete the empty node in the buffer when done (extra buffer slows playback). Ctrl+K hides viewer widgets. Click the little light button > long press gives Gain/Gamma view-only boost. V in the mini viewer shows Histogram, Shift+V cycles; right click > Sub View for Navigator, Magnifier, 3D histogram, Waveform, Vectorscope.

### Fusion playback speed-ups
lower quality while editing.
  - Steps: right click the bar by the play button > turn off High Quality and Motion Blur, enable Auto Proxy / Proxy, set "Skip frames" (right click Play arrow, 2 = every other frame), only one viewer active, Playback > Proxy quarter; narrow the yellow ruler range to loop one section; use Use GPU in Displace node settings.
  - Use when / pitfalls: setting a node Blend = 0 makes Fusion skip processing it (keyframe Blend to 0 once the effect is not visible to save render time). An expression linked to an un-keyframed value costs nothing.

### Cache to Disk in Fusion (newer Resolve, native saver/loader)
bake a node branch so downstream edits are smooth.
  - Steps: right click a node > Cache to Disk > (set Cache folder) tick Enable Cache, Lock, and Lock Branch > Pre-render. Everything upstream stays frozen; add more nodes downstream and they play smoothly. Can be done again further down (e.g. on a macro). Also Modes > Force Cache. If a frame glitches: bottom-right Purge Cache or Re-render Current Frame; delete and Ctrl+Z a macro whose parameters vanished; if the viewer stops updating, Workspace > Console and run the unlock command for the comp.
  - Use when / pitfalls: optical flow retime, slit scan, particles. Alternative for heavy effects: Saver node (EXR, only needed channels, Fusion > Render All Savers) then Loader (Instant Saver by Inolator is a $10 helper).

### Common Fusion glitches and fixes
quick fix list.
  - Steps: macro parameters vanish: delete node, Ctrl+Z; frames fail: Purge Cache / Re-render Current Frame; Fusion not updating: Workspace > Console and unlock; Media Out not blending: delete and re-add Media Out/In; no audio from the clip beneath: Media In set to Background; a stuck viewer control: right click it to see its parent macro. Adjustment clip stack glitching: copy and paste the node back.

## Free versus Studio table

Check Help > About Resolve before using any row. Rows come from the notes and are marked "Studio" where the source said so. Anything not listed is assumed to work in free, but verify it by running it once.

| Feature | Edition | Free fallback |
| --- | --- | --- |
| Magic Mask | Studio | Polygon mask with keyframes, Chroma Keyer trick, or Runway ML plus Photopea cutout (see fusion-effects.md) |
| Auto subtitles (18.5) | Studio | Subtitle to Text+ script with an .srt made by Whisper (see text-and-typography.md) |
| Lens Flare node | Studio | Lens Flares fuse from Reactor (MiloLab) or a flare texture on a Merge in Add mode |
| Warp-O-Matic and Tween based macros | Studio | Displace plus Create Bump Map warp (see fusion-effects.md) |
| Speed Warp retime | Studio | Optical Flow retime with a cleaned frame, Render in Place (see retime-and-speed.md) |
| Frame.io keyframe panel | Studio | Ease Copy script or Anim Curves (see edit-page-and-keyframes.md) |
| Reactor package manager | Studio install, free users must download fuses by hand from the We Suck Less forum | Copy .fuse files into the Fuses folder shown in Fusion Settings > Path Map |
| Inertia modifier, Text+ script, Guides | Free and Studio | none needed |

## Version notes

- The notes cover Resolve 17 to 18.5 mostly. The installed version is 21.1.1, so confirm each node name by Shift+Space before relying on it.
- Resolve 21 additions seen in the notes are listed in the entry "Resolve 21 additions seen in 100 Tips" above.
- The old XF Transform and the new Transform behave differently. See the entry "Old (XF) vs new Transform" in fusion-effects.md.

## Add-ons, assets and tools named

| Name | Free or paid | What for | Source |
| --- | --- | --- | --- |
| Reactor (We Suck Less) | Free (GitLab download for Free users) | Package manager for fuses, macros and scripts inside Resolve |, |
| KAS Chrome / Kas shaders, Defocus Gamma, Resolve Essentials, Gradient Mapper, Exclude (Reactor tools) | Free | 3D text materials, best blur, hotkey node insertion, luminance recolour, glow | |
| Tikido scripts (PSD Splitter, Subtitle to Text+, comp utility) | Free scripts | PSD layers, subtitles, batch node insert | |
| Ease Copy (chfr) | Free | Save and apply spline eases | |
| Flowy (RicoVFX) | Paid (Gumroad) | Curve preset panel for Fusion | |
| XF Chroma fuse (Stefan, Reactor) | Free | RGB chromatic shift | |
| Turbulent Noise and Nova (LearnNowFX) | Free | Extra noise types and particle patterns | |
| Modulation, Super Polygon (Oscape) | Free (Gumroad) | Glitch lines, poly-trace and Voronoi | |
| SM Outline 1.2 (Smokey) | Free | Outline macro for Neptune-style effects | |
| Time Displacement fuse (Vision, We Suck Less forum) | Free (login) | Staggered time delay | |
| Vector Snapshot, KA Shape Converter, Rotate SVG Points | Free (rotate script has Free and Studio versions) | SVG morph workflow | |
| Echo, Skew (June), Lens Flares (MiloLab), Milo VHS | Free via Reactor | Trails, skew, flares |, |
| Dehancer | Paid OFX plugin (code PEACHENT type discounts mentioned) | Film emulation grade | |
| DaVinci Resolve Studio features: Magic Mask, subtitle AI (18.5), Lens Flare node, Warp-O-Matic/Tween | Paid | AI masking, auto subtitles | |
| Runway ML, Photopea, easygif.com, calligrapher.com, HandBrake | Free tiers | AI green screen, stills cutout, GIF, font from logo, compress/clean render |, |
| All Effects pack, Edit Page pack, free pack, project files | Paid and free tiers (peejent.com) | AE-style macros, Edit-page effects, project files |, |
| Google Fonts variable fonts (e.g. Montserrat) | Free | Morph typography | |
| TourBox Neo | Paid hardware | Macro controller for Resolve | |

Second note:

- Reactor (Wasuless/We Suck Less) - free - install Fusion tools, Loop nodes, Resolve Essentials, Defocus Gamma, Vector Snapshot, Carter VR Transform Tools, MultiMerge -,
- Echo fuse (by Dell, We Suck Less forum, free with account) - echo for slit scan -
- Time Displacement fuse (We Suck Less forum, unofficial update by Dell) - time displacement and time slice -
- Defocus Gamma (Reactor, free) - bokeh-shaped blur with gamma -
- Smokey (SM) macros: SM Outline, SM Radial, SM Inner Shadow, SM Blinds - free macros (MediaFire links in his videos) -,
- Vision macros (Displacer Pro, scale wipe, 15 macros) - free (Google Drive) -
- Patrick Stirling "Proto" tools and Mr Alex Tech transitions, free pack, Milo VHS, Refraction node from VFXPedia - free -
- GitHub (Peej-ent) - free: Inertia modifier, Macro<->Group script, Rename Inputs, Rotate Polyline, Subtitle to Text+ script, Fusion tools, free pack -,
- All Effects Pack (AE tools for Resolve, 100+ macros) - paid one-time (vendor site) -; Macro pack paid and free versions; slit scan macro sold on site -
- Tekito's resolve script (RS Comp, font panel, text separator, bake, copy parameter; Windows) - free -
- Frame io keyframe panel (Reallusion, via Reactor VFX; Studio only; affiliate/paid with licence key) - drag keyframes, graph presets library, number-key presets -
- Instant Saver (Inolator) - paid about $10 - quicker saver/loader -
- Expression cheat sheet (online since 2021), VFXPedia, We Suck Less, GitHub search "DaVinci Resolve macros/fuses" - free references -
- Photopea (free web), Affinity (free), Figma plus PSD Export plugin (five free exports per month), AutoHotkey, SF Pro fonts - UI import pipeline -
- Whisper (local/cloud, free, via Kevin Stratford videos) - make .srt for subtitle script -
- Real Twixtor (paid third party), BCC lens blur (paid), CC Time Blend (After Effects) - named as the originals these workflows imitate -
- Studio-only items named: Speed Warp, Frame io panel (Studio). Free-version notes: Inertia modifier and Text+ script work in free; Guides are in both; Resolve 21 adds Combine Selected Tools, pop-out spline panel, Spherize/Time Mapper/Rasterize built-ins.

## Coverage notes

- No Fairlight, Cut page, or mixing content in this batch (only beat-marker audio sync on the Edit page).

The Cut page and Fairlight have no source coverage yet. Mix sound in Fairlight by hand or in a DAW.
