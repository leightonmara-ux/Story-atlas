# Brief: write a Story Atlas case study ("Examples" tab)

Story Atlas (/home/user/story-atlas) is a phone app teaching story structure to a playwright/screenwriter/journalist.
The owner loves this work and wants to understand *why it works*, linked to what the course teaches, and what
people (the makers and critics) have said about it.

Read first: /home/user/story-atlas/CLAUDE.md, /home/user/story-atlas/site/content/curriculum.json (lesson ids and
titles), and the lessons most relevant to this work (skim at least 5).

## Write /home/user/story-atlas/site/content/examples/<id>.md (1,400–2,000 words)
Sections, in order:
1. `## At a glance` — 3–4 sentences: what it is, who made it, when, and the premise. Start the section with the line
   `*Spoilers: this case study discusses the whole film, including the ending.*`
2. `## Why it works` — 4–6 `###` subsections. Each names one technique or principle, shows exactly how the work uses it
   (specific scenes, described precisely), and names the course lesson that teaches it in *italics* using the lesson's
   exact title (e.g. *The face and the cut*, *The cast as a system*). This is the heart of the case study.
3. `## The shape` — the work's overall structure, mapped with whichever course framework fits best (or showing why
   none fits), as a short list or pipe table with approximate positions ("about a third of the way in").
4. `## What people said` — the makers (from memoirs, interviews, books) and critics (named reviewer, outlet, year), mostly
   paraphrased with the source named. At most two short quotes in total, only if you're certain they're verbatim.
   Include at least one dissenting or critical view.
5. `## Watch for` — 5–8 bullet points: specific moments to look for on a rewatch, with approximate positions.
6. `## Try it` — one 20–30 minute exercise applying a lesson from this work to the owner's own writing, with
   **Stage:**, **Screen:** and **Journalism:** bullets and a **Check:** line (same format as the lessons' Try it).

Supported Markdown only: `##`, `###`, paragraphs, `-` and `1.` lists, `**bold**`, `*italic*`, `[text](https://url)`, pipe
tables, blockquotes (last line starting `— ` is the citation). No headings below ###, no nested lists.

## Accuracy is the top priority
- Describe only scenes and details you're confident of. If unsure of a detail, leave it out or choose another scene.
- Never invent quotes, reviews, interviews or dates. Check with web search where you can. Positions in the film are approximate.

## Also write AGENT_OUT_DIR/example-<id>.json
```json
{ "example": { "id": "<id>", "title": "…", "year": 1978, "medium": "Film|Play|TV|Journalism", "by": "maker(s)",
  "summary": "one sentence: why it's worth studying", "lessons": ["lesson-ids", "most relevant first, 4–8"] },
  "doubts": ["anything you weren't sure of and left out or softened"] }
```
Every lesson id must exist in curriculum.json. Don't edit any other file and don't run git.
Reply with the files written and your doubts.
