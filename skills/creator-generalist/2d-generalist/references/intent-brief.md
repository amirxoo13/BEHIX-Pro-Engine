# Intent brief: ask before you build

A piece that misses what the user wanted is a failed piece, even when it is well made. Run this brief before the
first step of any build. It costs one short round of questions and saves a full rebuild.

## Reading Map

- When to run it
- The five slots
- How to ask
- Write the brief
- Checkpoints while building
- Drift check before delivery

## When to run it

- Run it at the start of every new piece, and when the user changes the goal mid-way.
- Skip the questions, not the brief, when the request already fills every slot. Then write the brief and go.
- When another skill called this one and passed a brief, use that brief. Do not ask again.
- When the user says "just do it", "surprise me" or "you choose", take the defaults, state them in one line, and go.

## The five slots

| Slot | What you need to know | Example options to offer |
|---|---|---|
| Purpose and audience | What the piece is for and who watches or uses it | TikTok or Shorts hook, YouTube explainer, X post, game asset, client pitch, portfolio piece |
| Format | Aspect ratio, length, resolution, file type | 9:16 vertical 30 to 60 s, 16:9 2 to 5 min, 1:1 still, GLB model, PNG set |
| Subject | Exactly what is shown and the facts or story beats that must be in it | the named object, place, period, character, the one moment that must land |
| Look | Style, references, palette, mood | Vox editorial paper and ink, clean flat infographic, archival collage, blueprint; a link or image the user likes |
| Constraints | Must-haves, must-nots, tools, voice and music, language, deadline; whether real people, brands or owned characters appear (name the risk once, follow the answer) | "no voiceover", "use my logo", "Blender only", "Vietnamese captions", "by Friday" |

## How to ask

1. Read everything first: the prompt, attached images and links, files in the project, earlier messages. Fill every slot
   you can infer and mark it as inferred.
2. Do not ask what you can check yourself. Run the tool audit for installed software. Research facts from sources.
3. Ask only about slots that are empty or ambiguous and would change the result. A slot with a safe default needs no
   question: state the default in the brief instead.
4. One round, at most 4 questions. Each question names the slot, gives 2 to 4 concrete options, and puts your
   recommended option first. A second round is allowed only when an answer opens a real fork.
5. Make the options visual when the look is open: two or three named styles with one line each, or quick thumbnails.
6. Where the agent has a question tool (Claude Code: `AskUserQuestion`), use it. Elsewhere, send a numbered list and
   end with: "Reply with numbers, or 'ok' to take the first option of each."
7. Never ask "is this plan OK?" with no options. Ask the decision itself.

## Write the brief

Write `brief.md` in the project folder, 5 to 8 lines:

- Goal in the user's own words, then one line on what done looks like (for example "a 45 s 9:16 MP4 with captions").
- The five slots, each marked given, answered or default.
- Out of scope: what you will not make.
- A `## Progress` section, one line per step of the production spine (`~/.claude/skills/3d-generalist/references/pipeline-spine.md`),
  filled as each step finishes.

Show the brief to the user in one short message and start work. Stop only if the user changes something.

## Checkpoints while building

- The checkpoints are the production spine's two user gates (`~/.claude/skills/3d-generalist/references/pipeline-spine.md`): the look gate before
  the first expensive step (style frames A/B/C plus a blockout or animatic, the user picks, `LOOK.md` is written) and
  the fast preview before the full render. Every other step checks itself.
- When the user gives notes, update `brief.md` (or `LOOK.md`) first, then change the work. Notes that change the
  purpose or format restart the brief.
- Keep previews fast and small. The user judges direction from them, not polish.

## Drift check before delivery

Before handing over, compare the result with `brief.md` slot by slot. Fix what you can. List any slot that still
differs, with the reason, in the delivery message. Never hand over a piece whose purpose or format differs from the
brief without saying so first.
