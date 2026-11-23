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
- Terms tab: a glossary giving each concept's origin (who, where, when), common misattributions, and how to use it.

## Phase 3: Deepen
- "Diagnose this" exercises: map a known work (*Casablanca*, *Death of a Salesman*, a Pulitzer feature) onto two frameworks and compare.
- Verify the points the lesson writers flagged as uncertain (kept in the commit history and listed below), against the books.

### Flagged for checking against the source books
- Swain: the order of reactions (feeling, action, speech) in a motivation-reaction unit.
- Hart: the exact stage names of his narrative arc (used in Compare and the ordering game).
- Burroway: the line "only trouble is interesting".
- Thompson: her own names for the four parts.
- Vogel: her terms for alternative play structures.
- Natyashastra: where its stages sit on the arc in Compare.
- Glossary origins marked uncertain: dramatic irony (Thirlwall, 1833), "indirect action" (Magarshack, 1952),
  "given circumstances" via Pushkin, the 5 Ws, "lede", "in late, out early", "inciting incident" before McKee.
- Lenses quotes recalled rather than checked: Bakhtin on polyphony, Adichie on stereotypes, Thomas King's
  "that's all we are", Benjamin's "half the art of storytelling" (Zohn translation), Kermode's tick-tock.

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

## Phase 4: Workshop your own work  ← requested, don't drop
Paste a scene, outline or draft and get feedback through a lens you choose
("read this like McKee: does every scene turn?", "where's the nut graf?", "Franklin outline this").
- Uses the Claude API, so it needs an API key and has a small per-use cost.
- Needs a tiny server or serverless function to keep the key private (a static page can't hold it safely).
- Ideas: Socratic mode that quizzes you instead of grading; save drafts and see feedback over time.
