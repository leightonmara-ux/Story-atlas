# Brief: add "Try it" exercises to Story Atlas lessons

Story Atlas (/home/user/story-atlas) is a phone app teaching story structure for playwrights, screenwriters and
journalists. The owner's top priority is **usage and application**. Your job is to add one practical exercise to
each of your assigned lessons.

Read first: /home/user/story-atlas/CLAUDE.md, then each lesson in full before you edit it
(/home/user/story-atlas/site/content/lessons/<id>.md).

## The edit
Insert a `## Try it` section immediately before the existing `## Check yourself` heading. Change nothing else.

Format:
- One concrete exercise a working writer can do in 20–30 minutes, as a short paragraph or 2–5 numbered steps.
  It must apply *this lesson's* specific idea, not generic writing advice. Prefer exercises on the writer's own
  work-in-progress, or on a well-known work the writer can easily get hold of (a film, a play or a famous article).
- Then bullets beginning **Stage:**, **Screen:** and **Journalism:**, adapting the exercise to each medium in a
  sentence or two. Skip a medium only if it truly doesn't apply.
- Then one line beginning **Check:** with a question the writer can ask of the result, to see whether they've applied the idea.
- 100–200 words in total. Plain, warm, precise English, matching the lesson's voice.
- Supported Markdown only: paragraphs, `-` and `1.` lists, `**bold**`, `*italic*`. No nested lists, no headings below `##`.

Example (for McKee):
## Try it
Take the last five scenes you wrote, or five scenes of a film you love. For each one, write the value at stake and its charge at the start and end, like *+ trust → − trust*.
1. Mark any scene whose charge doesn't change. That's a non-event.
2. For each non-event, find the moment a character could expect one thing and get another (the gap), and rewrite the scene's last beat so it turns.
- **Stage:** do this for one long scene, marking every beat where the value shifts.
- **Screen:** do it from a sequence of the film with the sound off: can you see the turns?
- **Journalism:** for a feature draft, mark the paragraph where each source's expectation met reality.

**Check:** Could a reader say in one word what changed in each scene?

## Rules
- Accuracy: don't attribute anything to a thinker that isn't in the lesson or that you aren't sure of.
- Don't touch any other file. Don't run git.

When finished, reply with the list of lessons you edited, plus any lesson where you were unsure the exercise truly applied its idea.
