# Shakes and camera

Shakes, twitches and punch effects.
Entries are merged across both notes. Merged entries keep both notes' steps. Studio-only items are marked. Every entry ends with its source link.

## Entries

### Anim Curves shake (preferred)
elastic out shake with adjustable length.
  - Steps: 24-frame adjustment clip > Fusion > Transform (no XF suffix). Y parameter > Modify With > Anim Curves. Modifiers: Source Duration, Curve Easing, Out = Elastic. Make the end land at zero using the Offset = -Scale expression (see Anim Curves). Do the same on Rotate. Controls tab: Edges = Mirror/Reflect, Motion Blur on. Time Offset skips into the wave so the shake starts near zero when zooming into an already-seen clip. Source Custom plus keyframes 0 to 1 allows timing the shake yourself.

- Second note, same technique (Anim Curves expression shake (elastic bounce shake)): the standard reusable shake.
    - Steps: adjustment clip > Fusion > add Transform (NO XF suffix, the sliders-only one) > Edges set to Reflect in Tools tab (so no black edges). Right click Position Y > Modify With > Anim Curves > Modifiers tab: Source = Duration, Curve = Easing, Out = Elastic. Timing tab: Time Scale 0.1 to 0.35 (lower = softer/looser, 1 = fast), Time Offset moves the start. Scaling tab: Scale = shake amount (0.05 to 0.1 or less), Offset must be the inverse so it settles at zero: double-click Offset, type "=", pick-whip the Scale and put a minus in front. Repeat on Rotation (scale 1 to 3 degrees, offset negated) and optionally Position X. Duplicate the adjustment clip for each hit; lengthen the adjustment clip for softer shakes. Put motion blur 0.5 on the Transform.
    - Use when / pitfalls: place the shake Transform first if you also use the new Transform. If a stack glitches, copy the node and paste it back (re-caches). Zoom in a touch (1.1-1.2) to hide mirrored edges.

### Camera Shake node (constant shake or pre-shake across a cut)
Shift+Space "camera shake" and take the one WITHOUT the "CSH" suffix.
  - Steps: Zero all controls except PTR Speed, Motion Scale and Speed Scale. Raise Tilt amplitude all the way (Y shake) or Pan (X). Key Motion Scale and Speed from 2 at the start to 0 at the end; draw an ease-out. Border type Reflect, Motion Blur on. PTR Speed about 8.5 is the main frequency. Pre-shake: place the adjustment clip across the cut and key Motion Scale 0 at the start, 2 at the cut, 0 at the end. To avoid mirror edges on constant shakes: Pan/Tilt/Rotation 2.7, Zoom to crop 0.1. Two Camera Shake nodes plus an angled Directional Blur (angle 90, key length) gives a stronger shake.
  - Pitfalls: maximum Motion Scale is 2; no spline preview of the shake itself.

### Twitch shake (Shake modifier)
rough, high-energy impact shake.
  - Steps: Transform (no XF) > right-click Y > Modify With > Shake. Modifiers: Smoothness to minimum. Key Minimum -1 at the start to 0 at the end and Maximum 1 to 0. Spline: draw an extremely fast fall to zero. Repeat for X. Shift the Seed until the opening looks right. Controls: Mirrored edges and motion blur on.

- Second note, same technique (Twitch shake with the Shake modifier (reusable via Anim Curves)): sharp camera twitch.
    - Steps: Transform (no XF) > right click Position Y > Modify With > Shake. Modifiers: set Maximum by expression "=" to the Minimum with a negative sign so it is symmetric; Minimum = -1; Smoothness about 1. Keyframe Minimum from a big value to just under 0 (last frame slightly less than zero so it never fully stops), shape with an ease-out curve in Spline. Repeat for Position X and Rotation (rotation min about 1). Tools: motion blur 0.5, Edges reflect. Reuse: delete keyframes, right click Minimum > Modify With > Anim Curves, Source Duration, Curve Custom (1 to 0), then adjust Scale. Re-seed in the Shake modifier to get another random look; judge by the first frame direction (diagonal looks best).

### Sine wave expression shake (decaying)
only for understanding.
  - Steps: Right-click node > Edit Controls > add sliders A1 (amplitude), F1 (frequency) and "graph" on the Controls page. On Y type `=` and link it to graph. On graph type `sin(time*F1)*A1`. Key A1 from 0.1 to 0 for decay; offset F1 for phase.
