# Notes for working on Story Atlas

- Read ROADMAP.md first. Phase 4 (workshop your own work with AI feedback) is a firm request from the owner. Keep it on the roadmap.
- Static site in `site/`, no build step, deployed to GitHub Pages by `.github/workflows/pages.yml`.
- Lessons: follow the existing structure (Who and when, The big ideas, Use it with stage/screen/journalism, The pushback, Read next, Check yourself) and set `"ready": true` plus a one-sentence `summary` in `curriculum.json`.
- Accuracy matters: explain ideas in your own words, keep quotes short and only use ones you're sure of, and attribute them. Don't invent page numbers or quotations.
- When a new framework's lesson is written, add it to `content/concordance.json`.
- Bump `VERSION` in `site/sw.js` whenever `app.js`, `style.css` or `index.html` change.
- Check layout at phone width (no horizontal page scroll) in light and dark mode.
