# Addendum to the lesson brief (applies to these new tracks)

1. **Try it is now required.** Add a `## Try it` section immediately before `## Check yourself`, following
   docs/briefs/try-it.md (format and McKee example).
   Practical application is the owner's top priority, so make "Use it" and "Try it" concrete.
2. **Credit origins.** When you introduce a concept or term, say who originated or popularized it, in which work and year,
   and flag common misattributions. Never guess: say "often attributed to" or "popularized by" when unsure.
3. **Film examples.** Use widely known films, plays and articles a reader can easily find. Describe the moment precisely
   (scene, roughly where it falls in the work, what you see and hear) so the reader knows what to look for.
   Only describe scenes you're confident about. If unsure of a detail, choose another example.
4. **Avoid repeating existing lessons.** Read the related existing lessons named in your notes and cross-reference
   them by name in *italics* rather than re-explaining them.
5. **Extra output keys** in your agent-out JSON:
   - `"glossary"`: 3–6 new terms per lesson, in the schema of /home/user/story-atlas/site/content/glossary.json
     (term, aka, origin, myth only if relevant, meaning, use, lessons). Don't duplicate terms already in that file;
     check it first.
   - `"scenarios"` (Tools of the Trade writers only): 4–6 per lesson for a game called "What's this doing?". Each is
     `{ "q": "A described film/stage/journalism moment (1–3 sentences), ending with a question like 'What is the
     technique, and what does it do?'", "choices": [4 strings, each naming a technique and its effect], "answer": 0-3,
     "explain": "1–2 sentences", "lesson": "<id>" }`. Vary the answer position. Base them on real, well-known moments
     you're sure of, or clearly hypothetical ones ("A thriller cuts from…").
