# Premiere Pro and After Effects

Steps for users who already have Adobe Premiere Pro and After Effects. Written from Adobe's help pages
(helpx.adobe.com/premiere-pro, helpx.adobe.com/after-effects). Panel names move between yearly releases, so check
each path in the installed version. To reach the same look in a free tool, read `paid-to-free.md`.

Reading map
- Premiere: setup and cutting
- Premiere: captions, reframe and speed
- Premiere: colour, audio and export
- After Effects: motion and effects
- Moving work between them

## Premiere: setup and cutting

**Vertical sequence**
1. File > New > Sequence > Settings: Frame Size 1080 x 1920, timebase matched to the footage.
2. Or right-click a clip > New Sequence From Clip, then change the frame size in Sequence Settings.

**Fast cutting**
1. Razor (C) or Add Edit (Ctrl+K at the playhead). Ripple Delete (Shift+Delete) closes gaps.
2. Q and W ripple-trim the clip start or end to the playhead.
3. Mark beats with M while the music plays.

## Premiere: captions, reframe and speed

**Captions**
1. Window > Text > Transcript > Transcribe. Fix names and numbers in the transcript.
2. Create Captions, then style them in the Essential Graphics or Properties panel and save a caption style.
3. Text-based editing: delete words in the transcript to cut the matching footage.

**Auto Reframe**
1. Right-click a sequence > Auto Reframe Sequence, pick 9:16 and motion tracking speed.
2. Check every shot and keyframe Position where the tracker missed the subject.

**Speed ramp**
1. Right-click the clip > Show Clip Keyframes > Time Remapping > Speed.
2. Ctrl-click the rubber band to add keyframes, drag the band up or down, then split the keyframe handles to ease.
3. Set Time Interpolation to Optical Flow for smooth slow motion.

## Premiere: colour, audio and export

**Colour**
1. Lumetri Color panel: Basic Correction for exposure and white balance, then Creative for a look, Curves for contrast.
2. Put the grade on an adjustment layer above all clips when the look is shared.

**Audio**
1. Essential Sound panel: tag Dialogue and Music. Music > Ducking > Generate Keyframes lowers music under voice.
2. Loudness: Essential Sound > Dialogue > Loudness > Auto-Match, then check the export with a meter.

**Export**
1. File > Export > Media (or the Export tab). Format H.264, a preset matching the frame size, bitrate VBR 2-pass.
2. Turn on Use Maximum Render Quality only when scaling.

## After Effects: motion and effects

**Ease and the Graph Editor**
1. Select keyframes > F9 (Easy Ease). Open the Graph Editor and drag handles to shape speed.
2. Use the Speed Graph for snappy motion: a tall peak early means fast start and slow settle.

**Expressions that save time**
1. Alt-click a property stopwatch to add an expression. `wiggle(3, 20)` shakes a position or rotation.
2. `loopOut("cycle")` repeats keyframes. Link properties with the pick whip.

**Track and attach**
1. Window > Tracker > Track Motion (point) or Track Camera (3D camera tracker) on the footage layer.
2. Create a null from the track and parent text or graphics to it.

**Roto and keying**
1. Roto Brush: paint the subject on one frame, propagate, then refine the edge.
2. Keylight for green screen, then Key Cleaner and Advanced Spill Suppressor.

## Moving work between them

**Dynamic Link and render**
1. In Premiere, right-click clips > Replace With After Effects Composition to open them in After Effects.
2. For heavy comps, render from After Effects to an intermediate (ProRes or a high bitrate H.264) and cut that.
- Use when / pitfalls: Dynamic Link slows playback on long comps. Render the finished shot once it is locked.
