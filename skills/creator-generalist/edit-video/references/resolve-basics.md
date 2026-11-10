# Resolve: Free vs Studio, Scripting and Checks

Read before any DaVinci Resolve step.

## First check: free or Studio

1. Open Help > About and note the version and the edition (free or Studio).
2. Look up each feature you plan to use in "Free versus Studio table" in
   `workflow-and-settings.md`.
3. Mark every Studio-only feature in your plan and use the free fallback named in that table. Never tell the user
   a Studio feature works until step 1 is done.

## Rules

- Follow an entry's steps in order. Node names are as typed in the Fusion Select Tool dialog (Shift+Space).
- Resolve 21.1.1 is newer than most sources (17 to 18.5). Confirm a node or menu exists before relying on it.
- Run Fusion work on an adjustment clip or Fusion clip, then cache it (Playback > Render Cache) before judging motion.
- The mappings in `paid-to-free.md` are untested. Run the effect once and look at frames.
- Cut page and Fairlight have no source coverage yet. Mix sound in Fairlight by hand or in a DAW.

## Scripting Resolve safely

- Resolve must be running and fully loaded. External scripting needs Studio and
  Preferences > System > General > External scripting set to Local. Free can only run scripts from inside Resolve
  (Workspace > Console or Workspace > Scripts). Keep scripts that run on a user's open project read-mostly.
- Resolve 21.1+ ships its own Python at `C:\Program Files\Blackmagic Design\DaVinci Resolve\ResolvePython\ResolvePython.exe`
  where `import DaVinciResolveScript` works with no setup. Other interpreters need `RESOLVE_SCRIPT_API`
  (`%PROGRAMDATA%\Blackmagic Design\DaVinci Resolve\Support\Developer\Scripting`), `RESOLVE_SCRIPT_LIB`
  (`...\DaVinci Resolve\fusionscript.dll`) and `PYTHONPATH` set to `Modules`.
- Lua: `C:\Program Files\Blackmagic Design\DaVinci Resolve\fuscript.exe`. Use it for Fusion comps and `.setting` macros.
- The API guide is `%PROGRAMDATA%\Blackmagic Design\DaVinci Resolve\Support\Developer\Scripting\README.md`.
  Grep it for the exact signature before calling a method. A call can return False when a feature is Studio only.
- Safe sequence: connect (`resolve = DaVinciResolveScript.scriptapp("Resolve")`), get the project manager, create
  a new throwaway project or load a named one, import media into the media pool, build a timeline, set render
  settings, add a render job, start rendering, then poll render status. Never delete projects or render jobs
  that the script did not create. Save the project once after building.
- Check every return value. A silent False is the usual failure. Print what you got before the next call.
- Python for this repo follows house rules: run scripts as files, never `python -` with a heredoc.

## Resolve checks before handing off

1. Render a short section (about 3 to 5 seconds around each effect) at low quality from the Deliver page,
   or export stills with the viewer's Save Image.
2. Extract frames at the cut, the peak of each effect and the end, and look at them. Check text fits, edges
   show no ghosting, speed ramps land on the beat and no frame glitches (a red cache bar never turning blue is one).
3. If more than five frames need reading, hand them to a subagent that returns what it sees as text.
4. Say which features were Studio only and which fallback was used.
5. Send the user a low quality preview first. Render full quality only after sign off.
