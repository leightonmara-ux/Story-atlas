# Story Atlas

A course in what the great thinkers say about story structure, from Aristotle to McKee to Jon Franklin,
for playwriting, screenwriting and journalism. It works on a phone and can be added to the Home Screen.

See [ROADMAP.md](ROADMAP.md) for what's done and what's next.

## Put it on your Home Screen

The site publishes itself to GitHub Pages on every push to `main`.

1. One-time setup: in this repo on GitHub, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
   (Pages for a private repo needs a paid GitHub plan; otherwise make the repo public.)
2. Open the address shown there (usually `https://<your-username>.github.io/story-atlas/`) in Safari.
3. Tap **Share → Add to Home Screen**. It opens full-screen and works offline.

## Run it locally

```
cd site && python3 -m http.server 8000
```

Then open http://localhost:8000.

## How it's built

Plain HTML, CSS and JavaScript, with no build step.

- `site/content/curriculum.json`: tracks and lessons. A lesson with `"ready": true` appears as available.
- `site/content/lessons/<id>.md`: each lesson's text, in Markdown. Supported extras:
  `{{diagram:<id>}}` draws a diagram defined in `app.js` (`DIAGRAMS`); `Q:` / `A:` lines make
  tap-to-reveal "Check yourself" questions; a blockquote whose last line starts with `—` gets a citation.
- `site/content/concordance.json`: the Compare chart.
- `site/sw.js`: offline support. Bump `VERSION` when you change the app's code or styling.
- `tools/make_icons.js`: renders the PNG icons from `site/icon.svg`.

## Content principles

Everything is explained in our own words. Quotes are short and attributed, and every lesson points to the
original books. The app is a companion to reading the thinkers, not a replacement.
