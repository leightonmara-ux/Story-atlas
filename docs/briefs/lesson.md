# Brief: write Story Atlas lessons

Story Atlas (/home/user/story-atlas) is a phone app that teaches what the great thinkers say about story
structure, for playwrights, screenwriters and journalists. The owner has read the five finished lessons and
likes them. Your job is to write more lessons in exactly the same style, plus a quiz for each.

## Read first (required)
- /home/user/story-atlas/CLAUDE.md (project rules)
- The five approved lessons, your models for voice, depth and structure:
  /home/user/story-atlas/site/content/lessons/{shared-core,aristotle,three-media,mckee,franklin}.md
- /home/user/story-atlas/site/content/curriculum.json (the course outline: ids, titles, subtitles)

## For each lesson you're assigned, write two files

### 1. site/content/lessons/<id>.md
- Same sections as the approved lessons, in order: `## Who and when` (for a topic rather than a person, use
  `## Where it comes from`), `## The big ideas` (with `###` subsections), `## Use it` (bullets for **Stage**,
  **Screen**, **Journalism**, where each genuinely applies), `## The pushback`, `## Read next`, `## Check yourself`.
- 1,100–1,600 words. Plain, warm, precise English. Explain ideas in your own words. Short paragraphs.
- Don't start with a title or summary; the app shows those from curriculum.json.
- Supported Markdown only: `##`, `###`, paragraphs, `-` and `1.` lists, `**bold**`, `*italic*`,
  `[text](https://url)`, pipe tables, and blockquotes. A blockquote whose last line starts with `— ` becomes the citation.
- Check yourself: 4–5 pairs, each written as a line starting `Q: ` then a line starting `A: `, separated by blank lines.
- Optional diagram: put `{{diagram:<id>}}` on its own line where it belongs, and describe it in your output JSON
  (see below). Only include one if a shape genuinely helps, for example a framework with ordered stages.
- Cross-reference other lessons by name in *italics* where useful (*Aristotle*, *The shared core*).

### 2. site/content/quiz/<id>.json
```json
{
  "questions": [
    { "q": "question", "choices": ["right or wrong", "...", "...", "..."], "answer": 0, "explain": "one or two sentences" }
  ],
  "ideas": ["A one-sentence idea distinctive to this thinker, without naming them", "..."]
}
```
- 6–8 multiple-choice questions, each with exactly 4 choices. Vary which index is correct.
  Wrong choices should be plausible, ideally ideas from *other* thinkers, so the quiz teaches distinctions.
  Test understanding and application ("A writer's scenes keep ending where they started. What would McKee say?"),
  not trivia like publication years. At most one date question per lesson.
- "ideas": 3–4 sentences, each an idea clearly attributable to this lesson's thinker and not to the others in
  the course, never naming them. They feed a "Whose idea is this?" game. For topic lessons (the inverted
  pyramid, television structure, story vs. telling, ethics), word them as "which approach" ideas, or use [] if it doesn't fit.

## Accuracy is the top priority
- Only state facts you're confident about. Check dates, titles and attributions you're unsure of with web search
  if you have it. If you can't verify something, leave it out or phrase it generally.
- Quotations: at most one or two short quotes per lesson, only ones you're certain are verbatim, always attributed.
  Paraphrase otherwise. Never invent a quote or a page number.
- Represent each thinker fairly, including what critics say. Distinguish what they actually wrote from popular myths about them.
- If a widely repeated "fact" is disputed, say so briefly.

## Also write one output file
Write AGENT_OUT_DIR/<group>.json:
```json
{
  "summaries": { "<id>": "One sentence: the lesson's core idea, as in curriculum.json's existing summaries." },
  "diagrams": { "<diagram-id>": { "caption": "…", "points": [[0, 0.1, "Label"], [0.3, 0.4, "Label", "below"]], "steps": false } },
  "sequences": [ { "lesson": "<id>", "title": "Snyder's beat sheet", "steps": ["Opening Image", "Theme Stated", "..."] } ],
  "concordance": [ { "lesson": "<id>", "name": "…", "when": "…", "medium": "Screen|Stage|Journalism|Counterpoint",
                     "note": "optional", "cells": { "setup": {"t": "term", "g": "short gloss"} } } ],
  "doubts": ["Anything you weren't sure of and left out or softened"]
}
```
- diagrams: points are [x, y] in 0..1 (x across, y up), optional "below" puts the label under the point. 4–6 points,
  labels of 16 characters or fewer, alternate above/below so neighboring labels don't collide. "steps": true draws a staircase.
- sequences: for any framework in your lessons with a canonical, well-established order of stages (4–15 steps,
  using the thinker's own stage names), for a "put the stages in order" game. Only include ones you're sure of.
- concordance: for frameworks that map onto the story arc. The moment ids are setup, disruption, rising, midpoint,
  crisis, climax, resolution; see /home/user/story-atlas/site/content/concordance.json for the format and tone.
  Leave out moments with no real equivalent. Skip lessons that don't map onto the arc.

## Don't
- Don't edit curriculum.json, concordance.json, app.js, style.css or anything outside the files named above.
- Don't run git.

When finished, reply with a short list of the files you wrote and anything in "doubts".
