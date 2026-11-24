# Brief: fact-check pass

Story Atlas (/home/user/story-atlas) is a phone app teaching story structure. Some details were written without
access to sources. The session's network now allows: en.wikipedia.org, www.bfi.org.uk, www.theguardian.com,
www.newyorker.com, variety.com, www.hollywoodreporter.com, www.screendaily.com, archive.org, www.gutenberg.org,
www.tcm.com. (www.criterion.com, www.rogerebert.com and www.theparisreview.org refuse automated readers; respect that and
don't try to get around it via archive copies or mirrors. Use other reliable sources instead, or mark the item still uncertain.)
Use WebFetch/curl and web search. Read /home/user/story-atlas/CLAUDE.md first.

## For each item you're assigned
1. Find where it appears: `grep -rn` in site/content (lessons/*.md, examples/*.md, quiz/*.json, glossary.json,
   concordance.json, sequences.json).
2. Check it against a primary source or a reliable secondary one (name it).
3. Then:
   - **Confirmed**: leave the text, or tighten hedging that's no longer needed ("often attributed" → plain statement)
     only if the source is solid.
   - **Wrong**: correct every occurrence (lesson, quiz question/answer/explanation, glossary, Compare, ordering game).
     Keep edits minimal and in the existing voice. If a quiz question depended on the wrong fact, fix the question.
   - **Still uncertain**: leave it hedged or soften further; never upgrade a guess into a fact.
4. Never add new quotes unless verified verbatim against the source.
5. Keep JSON valid (check with python -c "import json; json.load(open(...))").

## Output
Write a report to the path you're given: a markdown list, one line per item:
`- **Item** — confirmed / corrected (what changed, which files) / still uncertain — source (URL or citation)`.
Don't run git. Only edit the files your items touch, and only the files you're assigned.
