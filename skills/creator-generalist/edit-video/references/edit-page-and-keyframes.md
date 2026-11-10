<!-- skill-navigation:start -->
## Reading map

Entry headings in this file, in order. Search for the exact name and read the whole entry.

- [Edit page, Anim Curves and keyframes](#edit-page-anim-curves-and-keyframes)
- [Entries](#entries)

Entries: Auto Scene Cut Detection to split source footage; Anim Curves modifier; S-curve beat sync (vertical part of the curve on the marker); Ease Copy script (free); Flowy (paid, Gumroad, RicoVFX; works in Free and Studio); Edit-page controls with Anim Curves (publish to the Inspector); Fast editing with a TourBox controller (macros); Eyeline match; Navigation shortcuts on the Edit page; Adjustment clip with correct frame start; Guides in Edit and Fusion (new Resolve feature, free and Studio); Keyframe a transform and shape it with the Spline panel; Ease-in, ease-out and S curves; Expression links between controls; Inertia / elastic modifier (free fuse); Keyframe Stretcher modifier; Path heading and linking modifiers; Audio for beat edits; Layering clips with scene-flow decisions (Watch Me Edit)
<!-- skill-navigation:end -->

# Edit page, Anim Curves and keyframes

Edit-page work: Anim Curves and splines, beat sync with markers, scene cut detection, editing principles, and the little audio coverage there is.
Entries are merged across both notes. Merged entries keep both notes' steps. Studio-only items are marked. Every entry ends with its source link.

## Entries

### Auto Scene Cut Detection to split source footage
AI cuts an episode into scenes.
  - Steps: Media pool > right-click > New Bin. Media page > right-click the left list > New Location > pick the clip folder. Right-click an episode > Auto Scene Cut Detection. Use I and O to set the range, click "Auto Select Clips". Click each cut; if both viewers show the same scene, select the marker and Delete. Click "Add to Media Pool". On the Edit page, select clips from the second to the second-to-last, drag onto the timeline; scrub with L, K, J; Alt-drag a clip up to set it above the rest.
  - Use when / pitfalls: AMV scene mining. Always inspect the cut list for false cuts.

### Anim Curves modifier
makes keyframe animation scale with the length of an adjustment clip (Resolve 17+).
  - Steps: In Fusion add a Blur (or Transform). Right-click the parameter > Modify With > Anim Curves. Modifiers tab: Source = Duration (animation always spans the clip; "Transition" source shifts when you trim from the left, so avoid it; "Custom" lets you key 0 to 1). Curve = Easing (preset graphs such as Elastic Out), Linear, or Custom (editable spline). Scaling: Offset = start value, Scale = amount added; for a blur 5 down to 0 use Offset 5 and Scale -5. In the custom spline "in" = position along the clip (0 start, 1 end), "out" = how much of the scale is applied. Timing: Time Scale lengthens or shortens the waveform, Time Offset delays or advances it. Mirror and Invert flip the graph. Lock the end value to zero: double-click Offset, type `=`, click +, drag the Scale value in and add a minus sign in front (so the end is always zero).
  - Use when / pitfalls: reusable shakes, blurs, exposure flashes and transitions; extend or shorten the adjustment clip on the Edit page and the keyframes follow. To see the graph: spline panel, tick the parameter.

### S-curve beat sync (vertical part of the curve on the marker)
motion that snaps exactly on the beat.
  - Steps: Put markers on the timeline at beats. Key the value 3 to 5 frames before the beat and at the beat. In the spline panel Ctrl+A, S, then drag handles so the steepest part of the curve sits under the marker (blue line in the graph). Flatten the handles for ease in/out (Ctrl+T toggles handle controls; hold Ctrl and drag one handle to move only that side; Alt keeps the line parallel). Shift+F flattens keyframes. Shift+L makes keyframes linear. Move all keyframes 2 to 3 frames earlier if the result looks off beat. Disable Marker Grab to edit freely.
  - Use when / pitfalls: AMV typography, transitions, speed ramps. Do not make the slope too vertical or it feels sharp; a looser graph with a gentle start reads smoother.

- Second note, same technique (Beat-sync editing with markers): mark the beats on the timeline, snap clips and transitions to them.
    - Steps: drop the song on the timeline, unlink and delete its video (right click > Link Clips off, delete video). Press M with nothing selected at every beat/spike in the waveform (drag the audio track divider taller to see waveforms). Drag clips to the markers and trim ends to fit. In Fusion the markers show in the Spline panel; make the steepest part of a keyframe curve land on the marker so the fastest movement hits the beat. Right click Spline panel > Options > disable "Marker Grab" so markers do not stick to the playhead.
    - Use when / pitfalls: three frames before the beat for the start keyframe is a common offset for impact.

### Ease Copy script (free)
save a spline shape and apply it to other keyframes.
  - Steps: Download the zip (by chfr), extract, put the .lua in the Resolve Scripts > Comp folder (Win+R, paste the path). Fusion: Workspace > Scripts > Comp > run it. Select two keyframes, type a name, Save Ease. Select two other keyframes (playhead between them) and Apply Ease. Pick the parameter under Target (select the tool again to refresh). For a Center point control, modify with XY Path first and use its X and Y controls. Keyframes must lie inside the comp range. The panel only works for the comp it was spawned in. Edit the .lua to set panel size and position. Hotkey: Resolve Essentials > Fusion Hotkey Manager > Views > Flow > New > Ctrl+Shift+G > Actions > Scripts > the script.

### Flowy (paid, Gumroad, RicoVFX; works in Free and Studio)
preset curve library you apply to selected keyframes.
  - Steps: Install, run, open Library page or the Editor + Library page. Select keyframes (Ctrl+A) then click a preset; Ctrl+B applies the curve in the editor. Works on Polyline and Displacement keyframes. Type handle values directly (can go negative to overshoot). Flip and Mirror buttons, "Add to Library", import/export curve sets.
  - Use when / pitfalls: the 15-second window after pressing a preset allows re-adjusting before reselecting keyframes.

### Edit-page controls with Anim Curves (publish to the Inspector)
expose keyframes and curve controls on the Edit page without opening Fusion.
  - Steps: The pack nodes carry an Anim Curves graph under User. To drive a value (e.g. Zoom): right-click the parameter > Connect To > Anim Curves "animation value" (published control). Starting value stays the normal value; animation scale is added at the curve. Remove > "Remove Publish" to unlink. Edit the curve in the Inspector (Source time graph). Never double-click Source Time (removes the link). If the graph vanishes after switching tabs, Ctrl+scroll in the graph to bring it back.

### Fast editing with a TourBox controller (macros)
(product plug but shows workflow) bind keys for compound clip, scroll-wheel razor cut, Shift+Space "transform" macro, and S smoothing.

### Eyeline match
keep the eyes and face of consecutive clips in the same screen area so the viewer's focus does not jump.
  - Steps: Draw a box around the eyes in a close-up; the other scenes should keep eyes and faces inside that box.

### Navigation shortcuts on the Edit page
scroll, zoom, blade, markers, time offsets.
  - Steps: Ctrl+scroll = scroll timeline; Alt+scroll = zoom at playhead; hold scroll wheel and drag = pan; B = blade tool, A = back to selection; arrow keys = frame by frame; M = marker (with nothing selected it lands on the timeline, with a clip selected it lands on the clip, with audio selected on the audio). Type "+" then a number then Enter = move forward N frames; "-" = back; "=" then a timecode = jump to timecode; Shift+Left/Right arrow = jump one second. Ctrl+Alt+L = unlink selected clips; Ctrl+D (default) = change clip duration (type frames to set every selected clip to the same length, e.g. 1 frame).
  - Use when / pitfalls: select the video clip before cutting if you do not want the linked audio cut too.

### Adjustment clip with correct frame start
adjustment clips that start at frame 0 in Fusion so Fusion comps and overlays line up.
  - Steps: Effects Library > Toolbox > Effects > Adjustment Clip, drag on the timeline, then drag it back into the Media Pool and delete the timeline copy; drag the pool copy back. Now the Fusion page starts at frame 0 (a freshly dragged adjustment clip may start on a non-zero frame). Put it above the clips to transform what is underneath. Stack separate adjustment clips for each job (transform, blur, exposure, shake, directional blur) so layers are visible. Resolve dislikes 1-frame adjustment clips; use 2.
  - Use when / pitfalls: adjustment clips do not force render cache; put one more adjustment clip over everything > right click > Render Cache Color Output to force caching, or press D to disable heavy adjustment layers during playback.

### Guides in Edit and Fusion (new Resolve feature, free and Studio)
draggable guides shared between pages.
  - Steps: Edit page viewer > arrow beside the viewer-options button > Rulers and Guides; drag guides from rulers. In Fusion hit Ctrl+G with the viewer selected; right click viewer > Guides > Resolve to show them; also centre/monitor-safe guides. Guides are global (appear in other projects) and cannot be edited from the Fusion page yet.

### Keyframe a transform and shape it with the Spline panel
the basis of every transition and shake.
  - Steps: in Fusion add Transform (Shift+Space "transform", or toolbar), click the diamond next to Size at frame 0, go to the end frame (e.g. 24 or 5 for a quick hit), change value (zoom out starting at 3, zoom in to 2, 1.2 etc.), click the diamond at the first key via the arrow so you can edit it. Open Spline tab (top right), tick the control, Zoom to Fit (Ctrl+F). Ctrl+A to select keys, press S for smooth, drag the handles for an ease. Hold Ctrl to move only one handle side; hold Alt/Ctrl+Alt while dragging to lock horizontal/vertical.
  - Use when / pitfalls: Spline panel menu > "Show only selected tool". Linear keys are stiff. Values should only go in one direction between clips (zoom-out then zoom-in to above 1 hides mirrored edges): outgoing clip zoom in to about 2, incoming starts at 1 and ends 1.2-1.4.

### Ease-in, ease-out and S curves
choose curve shape by role.
  - Steps: transitions in = ease-out curve (starts fast, lands soft); transitions out = ease-in; steady movements (3D camera, zoom on a scene, typography) = S curve (flat, steep middle, flat). Put the steepest part of the graph on the beat marker. A flatter overall line = smoother, a steeper line = snappier. Shortcuts in keyframe editor: Shift+L linear, Shift+S smooth, Shift+F flat (Ctrl+A first), V flip selected keys horizontally, Shift+B shape box (Alt+Y flips vertically), comma/period move selected keys by a frame, Ctrl+T time stretch box, B (point/transform editor), right click > Ease for presets. Right click last key > "Extrapolation: Gradient" keeps motion blur on the final frame of the move.
  - Use when / pitfalls: keyframes at the very end make a stutter; add a later keyframe past the visible end to avoid it.

### Expression links between controls
keep one value tied to another.
  - Steps: double-click a value > type "=" > Enter, then drag the "+" (pick whip) onto another control; or right click a control > Connect To. Example: Ellipse Height = Width. Prefix a minus to invert (for example "-ScaleOfModifier"). In Spline also use Ctrl+Shift+V to paste an instance, then right click > De-instance a control to unlink one.

### Inertia / elastic modifier (free fuse)
one-click elastic bounce on any keyframes (free and Studio).
 - Steps: download the .fuse GitHub (Peej-ent) into Fusion folder: bottom-right numbers > Path Map > Fuses > open folder > Modifiers (create "Modifiers" with an S) > restart. Keyframe a value (for example size 0 at start, normal 3 frames later), right click > Insert > Modifiers > Inertia. Controls: Inertia on/off (keyframeable), Amplitude (about 100% plus 25%), Frequency (2 to 4), Decay (3 to 5; higher = less bounce). Use Ctrl+A, Shift+F to flatten before inserting. Offsetting width and height values gives a squishy shape bounce.

### Keyframe Stretcher modifier
animate in, hold, animate out with only one set of keys.
  - Steps: animate in and out; right click parameter > Insert > Keyframe Stretcher; in Modifiers set Start and End to the frames to stretch between (e.g. 6 to 7 of a 12 frame animation). Extending the clip then holds the middle.

### Path heading and linking modifiers
rotate object along a path; connect parameters.
  - Steps: Transform with a Path modifier on Center; right click Angle > Connect To > Path > Heading; set heading offset (about -90). Right click any control > Connect to (follower modifier, size link between logo transforms). Save a modifier node as a tool and Connect To it from the text.

### Audio for beat edits
no Fairlight techniques covered; audio is handled on the Edit page only.
  - Steps: unlink and delete the song's video, drag the audio track taller to see peaks, mark beats with M, retime the music-sync clips to the markers (see Beat-sync). Fusion Media In set to Background samples the edit-page audio underneath if you cannot hear it in a Fusion clip.

### Layering clips with scene-flow decisions (Watch Me Edit)
editing process, not exact steps.
  - Steps: Scene Cut Detection to split the episode (Edit > Detect Scene Cuts), add clips to a Media Pool, drag the good scenes up a track to pick, copy into the main comp, Ripple Delete the gaps, layer duplicates, put all comps in a "comps" bin, do Twix/retime first and leave extra frames for fades, then transitions on the clip, blur, exposure, shake last. Match eyeline between cuts so the viewer's eyes stay in the same place.
