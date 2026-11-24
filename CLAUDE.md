# Notes for working on Story Atlas

- Read ROADMAP.md first. Phase 4 (workshop your own work with AI feedback) is a firm request from the owner. Keep it on the roadmap.
- Static site in `site/`, no build step, deployed to GitHub Pages by `.github/workflows/pages.yml`.
- Lessons: follow the existing structure (Who and when, The big ideas, Use it with stage/screen/journalism, The pushback, Read next, Check yourself) and set `"ready": true` plus a one-sentence `summary` in `curriculum.json`.
- Accuracy matters: explain ideas in your own words, keep quotes short and only use ones you're sure of, and attribute them. Don't invent page numbers or quotations.
- Every lesson has a quiz in `content/quiz/<id>.json` (6–8 questions, exactly 4 choices, plus "ideas" for the Whose idea game).
- When a new framework's lesson is written, add it to `content/concordance.json`, and to `content/sequences.json` if its stages have a fixed order.
- Learning paths live in `site/content/paths.json` (Start here, then Playwright / Screenwriter / Journalist). The owner wants the course focused: prefer improving paths and depth over adding breadth, and add new lessons to a path only if they serve it.
- Bump `VERSION` in `site/sw.js` and `APP_VERSION` at the top of `site/app.js` together (same number) whenever `app.js`, `style.css` or `index.html` change. The number shows on the refresh button in the top bar.
- Check layout at phone width (no horizontal page scroll) in light and dark mode.
