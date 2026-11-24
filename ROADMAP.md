# Roadmap

## Phase 1: Foundations and shape (done)
- App you can add to your phone's Home Screen; works offline.
- Full course outline: 49 lessons across Foundations, Screen, Stage, Journalism and Counterpoints
  (35 at launch, plus 14 added after checking against common MFA and journalism syllabi).
- Five sample lessons: The shared core, Aristotle, Same skeleton three media, Robert McKee, Jon Franklin.
- Compare: the frameworks lined up moment by moment, plus a full grid.
- "Check yourself" questions at the end of each lesson; progress saved on the device.

## Phase 2: All lessons, and play (done)
- All 49 lessons written, each with diagrams where useful, "Check yourself" questions and a quiz.
- Play tab: a quiz for every lesson, a mixed quiz that brings back missed questions (spaced repetition),
  "Whose idea is this?", "Put it in order" (16 frameworks) and a 60-second lightning round. Streaks and mastery tracked on the device.
- Compare now has 22 frameworks.
- Lenses & Critiques track (10 lessons): Sontag, Benjamin, Barthes, White & Didion, endings, point of view,
  who gets to be the subject, comedy, documentary, the science of story.
- Every lesson has a boxed "Try it" exercise with Stage, Screen and Journalism versions.
- Character track (6 lessons) and Tools of the Trade track (9 lessons: sound, music, allegiance, Kuleshov,
  editing, camera, mise-en-scène, mood on stage, mood in journalism), plus the "What's this doing?" game.
- Story Types track (10 lessons), Save the Cat in practice (Die Hard beat by beat), and Jonathan Franzen,
  plus the "What kind of story?" and "Name the genre" games.
- Learning paths on the home screen: Start here (20 core lessons), then Playwright, Screenwriter or Journalist.
  Everything else is under "Browse all lessons" as electives.
- Working Writers track: Keefe, the braided narrative, Caro, Sorkin, Kaufman, Waller-Bridge, Armstrong, Morrison,
  Baldwin, Nottage.
- Examples tab: case studies of works the owner loves (why they work, what people said, what to watch for), linked both ways with the lessons. The owner names works in chat; each is written from docs/briefs/example.md.
- Ingmar Bergman lesson (Screenwriter and Playwright paths).
- Terms tab: a glossary giving each concept's origin (who, where, when), common misattributions, and how to use it.

## Phase 3: Deepen
- "Diagnose this" exercises: map a known work (*Casablanca*, *Death of a Salesman*, a Pulitzer feature) onto two frameworks and compare.
- Verify the points the lesson writers flagged as uncertain (kept in the commit history and listed below), against the books.

### Fact-check status (pass completed November 2026)
Checked against Wikipedia, archive.org full texts, the BFI, the Guardian (via secondary sources) and others.
Corrected: Jeremy Strong (not Armstrong) said "a completely tragic ending"; Thomas King accepted in 2025 that he
has no Indigenous ancestry; Thirlwall wrote "tragic/practical irony", not "dramatic irony"; "lede" per the OED;
"inciting incident" in drama textbooks by the 1920s; Booker's "Destruction or death wish Stage"; Burroway's line has
no comma; Snyder's "Dig, Deep Down"; Natyashastra Compare row; plus scene details in Tony and La Notte, Sorkin,
Kaufman, Baldwin and Morrison.
Confirmed: Swain, Hart, Thompson, Frye, Polti (b. 1867), Pinter 1962, Altman/California Split, Hauge, Bakhtin,
Kermode, Benjamin (Zohn), Magarshack, Pushkin/Stanislavski, Franzen's ten rules, Fleabag S2E3, Sentimental Value's
Oscar and Grand Prix, Murray Smith's "Apparently Perverse Allegiances" (1999).

Still open (sources refuse automated readers or couldn't be found):
- Vogel's own terms for alternative structures (check Ruhl's *100 Essays* or Vogel directly).
- Adichie quote: check against the TED transcript (TED blocks automated readers).
- "In late, out early" origin; Polti's death year (Wikipedia only).
- Kaufman lecture: "no tips" and marketplace paraphrases (BAFTA site unreachable).
- Baldwin's "worked at night" detail; Paris Review interviews generally (site refuses automated readers).
- Reagan et al. 2016 corpus figure (1,327 vs 1,737): check the published paper.
- Save the Cat in practice: consider comparing with Snyder's own Die Hard beat sheet in *Save the Cat! Goes to the Movies*.

## Further voices (for "Read next" lists, not full lessons)
Weave these into the relevant lessons' reading lists:
- Stage: Eric Bentley (*The Life of the Drama*), Peter Brook (*The Empty Space*), Martin Esslin
  (*The Theatre of the Absurd*), Hegel on tragedy as a collision of two rights.
- Screen: William Goldman (*Adventures in the Screen Trade*), Alexander Mackendrick (*On Film-making*),
  Linda Seger, Michael Hauge.
- Journalism: Mark Kramer ("Breakable Rules for Literary Journalists", *Telling True Stories*),
  William Blundell (*The Art and Craft of Feature Writing*, for the feature-formula lesson),
  Lee Gutkind (scene vs. summary), Joan Didion and Gay Talese as models, Jessica Abel (*Out on the Wire*, audio).
- Counterpoints: Kurt Vonnegut's "shapes of stories" lecture (a natural fit for the diagrams).
- Workshop practice: Felicia Rose Chavez, *The Anti-Racist Writing Workshop*. Read before designing Phase 4.

## Later, when the owner starts sending work out
- One durable lesson on the Screenwriter path, "From page to audience": what readers and buyers look for (logline,
  genre promise, comps, first ten pages), how festivals and independent distributors find films, and the stage
  and journalism equivalents (finding a theatre, pitching an editor). Decided against: 2026 industry/business news
  (off-focus and goes stale).

## Phase 4: Workshop your own work  ← requested, don't drop
Paste a scene, outline or draft and get feedback through a lens you choose
("read this like McKee: does every scene turn?", "where's the nut graf?", "Franklin outline this").
- Uses the Claude API, so it needs an API key and has a small per-use cost.
- Needs a tiny server or serverless function to keep the key private (a static page can't hold it safely).
- Ideas: Socratic mode that quizzes you instead of grading; save drafts and see feedback over time.
