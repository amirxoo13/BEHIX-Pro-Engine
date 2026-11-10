# Retime and speed

Optical-flow retime, Twixtor replacement, time stretch and speed ramps.
Entries are merged across both notes. Merged entries keep both notes' steps. Studio-only items are marked. Every entry ends with its source link.

## Entries

### Fusion composition time-stretch of a whole animation
slow an animated comp down proportionally to get extra frames for retiming.
  - Steps: Select all nodes > spline panel > Time Stretch button > drag the keyframes out proportionally. Add a Time Stretcher node and key Source Time from 0 to the last frame of the comp (e.g. 119), set interpolation to Nearest (no blending), then draw a speed curve. Compound clip it to 24 frames.
  - Use when / pitfalls: frame-perfect fast-slow speed ramps on motion graphics.

- Second note, same technique (Delayed copies of an animation with Time Stretch box): offset the same keyframes for a staggered motion graphic.
    - Steps: copy a node set, paste, open Spline, select all its keys, press the key time stretch tool, drag/enter an offset (for example 0.5 or start at frame 10) so the graph squishes instead of shifting. Alternative: add a Time Speed node with a delay in frames (5-6 for fill, 10 for mask), then pull the shape's Global In left by the delay.

### Optical-flow retime ("better Twixtor")
remove duplicate frames then stretch with optical flow.
  - Steps: Count clip length: shorten the end until the frame count shows, remember the number (+1 frame). Compound clip; enter with T; add a Fusion Composition above footage, equal to that count. Alt-drag a footage copy upward, disable and lock it. Cut each frame (Right Arrow then H); remove duplicate frames (Ctrl+Arrow to select, Delete, ripple closes). Look only at the subject's movement; patterns of duplicates every 2 or 3 frames are fine. Compound the remaining frames. Fusion: drag the compound into MediaIn, Time Stretcher (Shift+Space); untick Source Time keyframe at start, key Source Time 0 at the start and the MediaIn frame count at the end. Spline: ease-in curve; start later to skip a warp at the start. Add Optical Flow node before the Time Stretcher; Time Stretcher Interpolation Mode = Flow; tick Clamp edges and sampling boxes. Return to Edit page and wait for cache (red to blue). For beat-synced retimes: key Source Time under each marker with S-curves where the steepest part lies under the marker; tick Repeat for caching.
  - Pitfalls: heavier than older methods; blinking eyes and mouths warp badly. Fix by duplicating the clip, polygon mask around the eyes with soft edge, line it up with Center and use the masked layer inside the compound that is twixed. Fractional source frames (x.5) warp; use whole numbers.

- Second note, same technique (Free "Twixtor" slow motion (frame cleaning, compound, Render in Place, Optical Flow retime)): smooth 25-50 percent slow motion for anime.
    - Steps: anime animates on twos/threes, so duplicate frames break interpolation. Duplicate the footage into its own timeline, cut at each real change (H plus arrow keys), delete duplicate segments (Ctrl+arrow to select clip, Delete), Ctrl+D set the remaining clips to 1 frame, Ctrl+Backspace to delete gaps. Quick alternative when every shot is on threes: Ctrl+R > set speed 300 percent by dragging the retime handle. Compound clip (C) into a Twix bin, then right click > Render in Place (AVI uncompressed or QuickTime) or Render In/Out range in Deliver. Project Settings > Retime process Optical Flow, Motion Estimation Enhanced Better, Smoother; Ctrl+R > 50% or 25% (or 10% before retime). Version note: Studio's Speed Warp is similar.
    - Use when / pitfalls: pick clips whose frames differ but are similar; large uncompressed files.

### Edit-page Twixtor and speed ramp macro
frame gap, source time graph and Optical Flow on the Edit page.
  - Steps: Frame Gap = number of dead frames (1 for already clean footage). Source Time graph (Anim Curves) controls the speed; End Value = total frames in the clip (use the calculator, e.g. 2 s 1 f at 24 fps = 49). Switch from Blend to Flow and Optical Flow on, cache the Fusion effect.

### Time Stretcher retime inside a Fusion clip (speed ramp)
custom ramp on the cleaned clip.
  - Steps: measure the length needed (double click the clip in the Edit page, count frames to the timeline length, add 1 extra), add Effects > Toolbox > Effects > Fusion Composition of that length, open Fusion, drag the compound/rendered clip to the flow. Add Time Stretcher (playhead at frame 0 so it auto-keys Source Time), go to the end, type the clip's last frame as Source Time. Add Optical Flow before it (Advanced settings: warp, clamp edges; Time Stretcher > Interpolation Mode Flow, Clamp Edges on, Preview back/forward). Open Spline > Source Time: Ctrl+F, Ctrl+A, S to smooth; fast then slow then fast curve (or fast to slow start). Add keys to hit beat points on a whole frame. Use Blend while setting the curve, Flow for final, and check red/blue cache bar. To speed up several clips copy the nodes and paste. Use Time Speed when every N frames: add Time Speed node (speed 3).
  - Use when / pitfalls: Frostbite's velocity curves and Keaton's tutorial are the origins; set clips to cache; Flow only works with enough different frames.

### Freeze frame and reverse speed endings
hold the last frame, play backwards.
  - Steps: select clip > R > Reverse Speed; R again > Freeze Frame; Ctrl+R retime handles.

### Mask fix inside slow motion
remove mouth movement/warp artefacts.
  - Steps: pick a clean frame, mask the mouth with Polygon (pin a track point on a mole, soften edge), Paint node to paint out lower face when needed, copy the nodes and paste on every retimed copy; time stretcher shows frame positions.
