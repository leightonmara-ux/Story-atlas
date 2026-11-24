// Story Atlas: a small single-page app. Content lives in content/ as JSON and Markdown.
'use strict';

const app = document.getElementById('app');
const data = { curriculum: null, concordance: null };

// ---------- storage (per-device progress; never required to render) ----------
const store = {
  get(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode etc. */ }
  },
};
const doneMap = () => store.get('sa.done', {});
function setDone(id, on) {
  const d = doneMap();
  if (on) d[id] = Date.now(); else delete d[id];
  store.set('sa.done', d);
}

// ---------- helpers ----------
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function allLessons() {
  return data.curriculum.tracks.flatMap(t => t.lessons.map(l => ({ ...l, track: t })));
}

async function getJSON(path) {
  const r = await fetch(path);
  if (!r.ok) throw new Error(path + ' ' + r.status);
  return r.json();
}

// ---------- a small Markdown renderer (the subset the lessons use) ----------
function inline(s) {
  s = esc(s);
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, text, url) => {
    const ext = /^https?:/.test(url);
    return `<a href="${url}"${ext ? ' target="_blank" rel="noopener"' : ''}>${text}</a>`;
  });
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g, '$1<em>$2</em>');
  return s;
}

function md(src) {
  const lines = src.replace(/\r/g, '').split('\n');
  const out = [];
  const para = [];
  const flush = () => { if (para.length) { out.push(`<p>${inline(para.join(' '))}</p>`); para.length = 0; } };
  let i = 0, m;

  const takeList = (re, tag) => {
    const items = [];
    while (i < lines.length && re.test(lines[i])) {
      let item = lines[i].replace(re, '');
      i++;
      while (i < lines.length && /^\s{2,}\S/.test(lines[i])) { item += ' ' + lines[i].trim(); i++; }
      items.push(`<li>${inline(item)}</li>`);
    }
    out.push(`<${tag}>${items.join('')}</${tag}>`);
  };

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { flush(); i++; continue; }

    if ((m = line.match(/^(#{1,3})\s+(.*)/))) {
      flush(); const n = Math.max(2, m[1].length); // the page title is the only h1
      out.push(`<h${n}>${inline(m[2])}</h${n}>`); i++; continue;
    }
    if ((m = line.match(/^\{\{diagram:([\w-]+)\}\}$/))) { flush(); out.push(diagram(m[1])); i++; continue; }
    if (/^-{3,}$/.test(line.trim())) { flush(); out.push('<hr>'); i++; continue; }

    if (line.startsWith('>')) {
      flush();
      const q = [];
      while (i < lines.length && lines[i].startsWith('>')) { q.push(lines[i].replace(/^>\s?/, '')); i++; }
      const cite = q.length > 1 && /^—/.test(q[q.length - 1]) ? q.pop() : '';
      out.push(`<blockquote><p>${inline(q.join(' '))}</p>${cite ? `<cite>${inline(cite)}</cite>` : ''}</blockquote>`);
      continue;
    }
    if (/^[-*]\s+/.test(line)) { flush(); takeList(/^[-*]\s+/, 'ul'); continue; }
    if (/^\d+\.\s+/.test(line)) { flush(); takeList(/^\d+\.\s+/, 'ol'); continue; }

    if (line.startsWith('|')) {
      flush();
      const rows = [];
      while (i < lines.length && lines[i].startsWith('|')) { rows.push(lines[i].trim()); i++; }
      const cells = r => r.replace(/^\||\|$/g, '').split('|').map(c => c.trim());
      const head = cells(rows[0]);
      const body = rows.slice(1).filter(r => !/^\|[\s:|-]+\|$/.test(r)).map(cells);
      out.push(`<div class="table-wrap"><table><thead><tr>${head.map(c => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${
        body.map(r => `<tr>${r.map((c, j) => j === 0 ? `<th scope="row">${inline(c)}</th>` : `<td>${inline(c)}</td>`).join('')}</tr>`).join('')
      }</tbody></table></div>`);
      continue;
    }

    if ((m = line.match(/^Q:\s*(.*)/))) {
      flush();
      let q = m[1], a = '';
      i++;
      while (i < lines.length && lines[i].trim() && !/^A:/.test(lines[i])) { q += ' ' + lines[i].trim(); i++; }
      if (i < lines.length && (m = lines[i].match(/^A:\s*(.*)/))) {
        a = m[1]; i++;
        while (i < lines.length && lines[i].trim() && !/^Q:/.test(lines[i])) { a += ' ' + lines[i].trim(); i++; }
      }
      out.push(`<details class="check"><summary>${inline(q)}</summary><p>${inline(a)}</p></details>`);
      continue;
    }

    para.push(line.trim()); i++;
  }
  flush();
  return out.join('\n');
}

// ---------- diagrams: a labeled tension curve. Points are [x, y, label, 'below'?] in 0..1 ----------
const DIAGRAMS = {
  'shared-core': {
    caption: 'The shape most theories share: tension rises through escalating complications to a crisis and climax, then settles into a new balance.',
    points: [[0, .12, 'Balance'], [.24, .3, 'Disruption', 'below'], [.46, .52, 'Escalation'], [.72, .74, 'Crisis', 'below'], [.84, .95, 'Climax'], [1, .3, 'New balance']],
  },
  aristotle: {
    caption: 'Aristotle: the complication (desis) ties the knot up to the turn of fortune; the unraveling (lysis) runs from the turn to the end. The best turn combines reversal and recognition.',
    points: [[0, .1, 'Beginning'], [.3, .4, 'Complication', 'below'], [.66, .9, 'Reversal + recognition'], [.84, .45, 'Unraveling'], [1, .14, 'End', 'below']],
  },
  mckee: {
    caption: 'McKee’s five-part design. The inciting incident upsets the balance; complications widen the gap between expectation and result until a crisis forces a choice.',
    points: [[0, .1, ''], [.18, .22, 'Inciting incident', 'below'], [.45, .55, 'Progressive complications'], [.72, .7, 'Crisis', 'below'], [.84, .95, 'Climax'], [1, .32, 'Resolution']],
  },
  franklin: {
    caption: 'Franklin’s outline: one complication, a few developments (often three), one resolution, each a short active statement.',
    points: [[0, .12, 'Complication'], [.4, .36, 'Development', 'below'], [.6, .56, 'Development', 'below'], [.8, .76, 'Development'], [1, .95, 'Resolution']],
    steps: true,
  },
};

function diagram(id) {
  const d = DIAGRAMS[id] || (data.diagrams || {})[id];
  if (!d) return '';
  const W = 400, H = 220, padX = 14, top = 30, bottom = 30;
  const px = x => padX + x * (W - 2 * padX);
  const py = y => H - bottom - y * (H - top - bottom);
  const pts = d.points.map(([x, y, label, pos]) => ({ x: px(x), y: py(y), label, below: pos === 'below' }));

  let path = `M ${pts[0].x} ${pts[0].y}`;
  if (d.steps) {
    for (let k = 1; k < pts.length; k++) path += ` L ${pts[k].x - 10} ${pts[k - 1].y} L ${pts[k].x} ${pts[k].y}`;
  } else {
    for (let k = 1; k < pts.length; k++) {
      const a = pts[k - 1], b = pts[k], cx = (a.x + b.x) / 2;
      path += ` C ${cx} ${a.y}, ${cx} ${b.y}, ${b.x} ${b.y}`;
    }
  }
  const baseY = H - bottom + 8;
  const area = `${path} L ${pts[pts.length - 1].x} ${baseY} L ${pts[0].x} ${baseY} Z`;
  // Place labels without collisions: try the preferred side, then the other side, then step further out.
  const placed = [];
  const labels = pts.filter(p => p.label).map(p => {
    const w = p.label.length * 7.4 + 6;
    const anchor = p.x < 70 ? 'start' : p.x > W - 70 ? 'end' : 'middle';
    const dx = anchor === 'start' ? -4 : anchor === 'end' ? 4 : 0;
    const x0 = anchor === 'start' ? p.x + dx : anchor === 'end' ? p.x + dx - w : p.x - w / 2;
    const tries = [];
    for (let step = 0; step < 5; step++) {
      tries.push(p.below ? p.y + 22 + step * 15 : p.y - 12 - step * 15);
      tries.push(p.below ? p.y - 12 - step * 15 : p.y + 22 + step * 15);
    }
    const clear = ty => ty > 12 && ty < H + 6 &&
      !placed.some(b => x0 < b.x1 && b.x0 < x0 + w && ty - 12 < b.y1 && b.y0 < ty + 4);
    const ty = tries.find(clear) ?? tries[0];
    placed.push({ x0, x1: x0 + w, y0: ty - 12, y1: ty + 4 });
    return `<text x="${p.x + dx}" y="${ty}" text-anchor="${anchor}">${esc(p.label)}</text>`;
  }).join('');
  return `<figure class="diagram"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(d.caption)}">
    <line class="base" x1="${padX}" x2="${W - padX}" y1="${baseY}" y2="${baseY}"/>
    <path class="area" d="${area}"/><path class="line" d="${path}"/>
    ${pts.map(p => `<circle class="dot" cx="${p.x}" cy="${p.y}" r="4.5"/>`).join('')}
    ${labels}</svg><figcaption>${inline(d.caption)}</figcaption></figure>`;
}

// ---------- views ----------
function renderHome() {
  document.title = 'Story Atlas';
  const lessons = allLessons();
  const ready = lessons.filter(l => l.ready);
  const done = doneMap();
  const doneCount = ready.filter(l => done[l.id]).length;
  const next = ready.find(l => !done[l.id]);
  const pct = ready.length ? Math.round(100 * doneCount / ready.length) : 0;

  const nextCard = next ? `
    <a class="next-card" href="#/lesson/${next.id}">
      <small>${doneCount ? 'Up next' : 'Start here'}</small>
      <strong>${esc(next.title)}</strong>
      <span>${esc(next.subtitle)}</span>
    </a>` : `<p class="muted">You’ve finished every lesson available so far. More are on the way.</p>`;

  let n = 0;
  const tracks = data.curriculum.tracks.map(t => `
    <section class="track">
      <h2>${esc(t.title)}</h2>
      <p>${esc(t.blurb)}</p>
      <ul class="lessons">${t.lessons.map(l => {
        n++;
        const txt = `<span class="txt"><b>${esc(l.title)}</b><i>${esc(l.subtitle)}</i></span>`;
        if (!l.ready) return `<li><div class="soon"><span class="mark">${n}</span>${txt}<span class="tag">Soon</span></div></li>`;
        const isDone = !!done[l.id];
        return `<li class="${isDone ? 'done' : ''}"><a href="#/lesson/${l.id}"><span class="mark">${isDone ? '✓' : n}</span>${txt}</a></li>`;
      }).join('')}</ul>
    </section>`).join('');

  app.innerHTML = `
    <section class="hero">
      <h1>Story Atlas</h1>
      <p class="lede">What the great thinkers say about story structure, and how to use it on the stage, the screen and the page.</p>
      <div class="progress">${doneCount} of ${ready.length} lessons done${ready.length < lessons.length ? ` · ${lessons.length - ready.length} more coming` : ''}
        <div class="bar"><span style="width:${pct}%"></span></div></div>
      ${nextCard}
    </section>
    ${tracks}`;
}

async function renderLesson(id) {
  const lessons = allLessons();
  const idx = lessons.findIndex(l => l.id === id);
  const l = lessons[idx];
  if (!l || !l.ready) { location.hash = '#/'; return; }
  document.title = `${l.title} · Story Atlas`;
  app.innerHTML = '<p class="loading">Loading…</p>';

  let body;
  try {
    const r = await fetch(`content/lessons/${id}.md`);
    if (!r.ok) throw new Error(r.status);
    body = md(await r.text());
  } catch {
    body = '<p class="muted">This lesson couldn’t load. Check your connection and try again.</p>';
  }
  const next = lessons.slice(idx + 1).find(x => x.ready);
  const isDone = !!doneMap()[id];

  app.innerHTML = `
    <a class="back" href="#/">← All lessons</a>
    <p class="eyebrow">${esc(l.track.title)}</p>
    <h1>${esc(l.title)}</h1>
    <p class="lede">${esc(l.subtitle)}</p>
    ${l.summary ? `<blockquote class="summary"><p>${inline(l.summary)}</p><cite>In one sentence</cite></blockquote>` : ''}
    <article class="lesson-body">${body}</article>
    <a class="quiz-cta" href="#/play/quiz/${id}"><b>Quiz yourself on ${esc(l.title)}</b><span>Multiple choice, with explanations →</span></a>
    <div class="lesson-foot">
      <button class="btn ${isDone ? 'is-done' : ''}" id="doneBtn">${isDone ? '✓ Done (tap to undo)' : 'Mark as done'}</button>
      ${next ? `<a class="btn solid" href="#/lesson/${next.id}">Next: ${esc(next.title)} →</a>` : `<a class="btn solid" href="#/compare">Compare the frameworks →</a>`}
    </div>`;

  // Box the "Try it" exercise so the practical part stands out.
  const tryH = [...app.querySelectorAll('.lesson-body h2')].find(h => h.textContent.trim() === 'Try it');
  if (tryH) {
    const box = document.createElement('section');
    box.className = 'tryit';
    tryH.before(box);
    let n = tryH;
    while (n && !(n !== tryH && n.tagName === 'H2')) { const next = n.nextElementSibling; box.appendChild(n); n = next; }
  }

  document.getElementById('doneBtn').addEventListener('click', e => {
    const now = !doneMap()[id];
    setDone(id, now);
    e.currentTarget.classList.toggle('is-done', now);
    e.currentTarget.textContent = now ? '✓ Done (tap to undo)' : 'Mark as done';
  });
}

function renderCompare(momentId) {
  document.title = 'Compare · Story Atlas';
  const c = data.concordance;
  const ready = new Set(allLessons().filter(l => l.ready).map(l => l.id));
  const mode = store.get('sa.compareMode', 'moment');
  const moment = c.moments.find(m => m.id === momentId) || c.moments[1];
  const nameHTML = f => ready.has(f.lesson)
    ? `<a href="#/lesson/${f.lesson}">${esc(f.name)}</a>`
    : `<span class="name">${esc(f.name)}</span>`;

  const byMoment = `
    <nav class="chips" aria-label="Story moments">${c.moments.map(m =>
      `<a href="#/compare/${m.id}" aria-current="${m.id === moment.id}">${esc(m.title)}</a>`).join('')}</nav>
    <p class="moment-gloss">${esc(moment.gloss)}</p>
    <ul class="fw-list">${c.frameworks.map(f => {
      const cell = f.cells[moment.id];
      const head = `<header>${nameHTML(f)}<span>${esc(f.medium)} · ${esc(f.when)}</span></header>`;
      if (!cell) {
        return `<li class="fw empty">${head}<span class="term">No matching beat</span>${f.note ? `<span class="g">${esc(f.note)}</span>` : ''}</li>`;
      }
      return `<li class="fw">${head}<span class="term">${esc(cell.t)}</span>${cell.g ? `<span class="g">${esc(cell.g)}</span>` : ''}</li>`;
    }).join('')}</ul>`;

  const grid = `
    <div class="grid-wrap"><table class="grid">
      <thead><tr><th></th>${c.moments.map(m => `<th>${esc(m.title)}</th>`).join('')}</tr></thead>
      <tbody>${c.frameworks.map(f => {
        const empty = !Object.keys(f.cells).length;
        const head = `<th scope="row">${nameHTML(f)}<small>${esc(f.when)}</small></th>`;
        if (empty) return `<tr>${head}<td class="note" colspan="${c.moments.length}">${esc(f.note || '')}</td></tr>`;
        return `<tr>${head}${c.moments.map((m, k) => {
          const cell = f.cells[m.id];
          const note = k === 0 && f.note ? `<div class="row-note">${esc(f.note)}</div>` : '';
          return `<td>${cell ? `<b>${esc(cell.t)}</b>${cell.g ? `<span>${esc(cell.g)}</span>` : ''}` : '<span>—</span>'}${note}</td>`;
        }).join('')}</tr>`;
      }).join('')}</tbody>
    </table></div>`;

  app.innerHTML = `
    <h1>Compare</h1>
    <p class="lede">${esc(c.intro)}</p>
    <div class="seg" role="group" aria-label="View">
      <button data-mode="moment" aria-pressed="${mode === 'moment'}">By moment</button>
      <button data-mode="grid" aria-pressed="${mode === 'grid'}">Full grid</button>
    </div>
    ${mode === 'grid' ? grid : byMoment}`;

  app.querySelectorAll('.seg button').forEach(b => b.addEventListener('click', () => {
    store.set('sa.compareMode', b.dataset.mode);
    renderCompare(moment.id);
  }));
}

// ---------- Play: quizzes and games ----------
// Every lesson has content/quiz/<id>.json: { questions: [{q, choices[4], answer, explain}], ideas: [..] }.
// Each question is a flashcard with a Leitner box (1–5): right answers move it up, wrong ones send it
// back to box 1, and mixed quizzes pick low boxes more often, so mistakes come back until they stick.

const quizCache = {};
async function getQuiz(id) {
  if (!quizCache[id]) quizCache[id] = getJSON(`content/quiz/${id}.json`).catch(() => ({ questions: [], ideas: [] }));
  return quizCache[id];
}
async function allQuizzes() {
  const ready = allLessons().filter(l => l.ready);
  const quizzes = await Promise.all(ready.map(l => getQuiz(l.id)));
  return ready.map((l, k) => ({ lesson: l, ...quizzes[k] }));
}

const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

function weightedPick(items, n, weight) {
  const pool = items.slice(), out = [];
  while (out.length < n && pool.length) {
    const total = pool.reduce((s, it) => s + weight(it), 0);
    let r = Math.random() * total, k = 0;
    while (k < pool.length - 1 && (r -= weight(pool[k])) > 0) k++;
    out.push(pool.splice(k, 1)[0]);
  }
  return out;
}

const cards = () => store.get('sa.cards', {});
function recordAnswer(key, correct) {
  const c = cards();
  const box = c[key] || 0;
  c[key] = correct ? Math.min(5, Math.max(1, box) + 1) : 1;
  store.set('sa.cards', c);

  const st = store.get('sa.stats', { answered: 0, correct: 0, streak: 0, lastDay: '' });
  st.answered++; if (correct) st.correct++;
  const today = new Date().toDateString();
  if (st.lastDay !== today) {
    const yesterday = new Date(Date.now() - 864e5).toDateString();
    st.streak = st.lastDay === yesterday ? st.streak + 1 : 1;
    st.lastDay = today;
  }
  store.set('sa.stats', st);
}

let timers = [];
function stopTimers() { timers.forEach(clearInterval); timers = []; }

// Questions in a common shape: { key, q, choices, answer, explain, lesson }
async function questionPool({ lessonId, onlyDone } = {}) {
  const qs = await allQuizzes();
  const done = doneMap();
  let pool = [];
  for (const z of qs) {
    if (lessonId && z.lesson.id !== lessonId) continue;
    if (onlyDone && !done[z.lesson.id]) continue;
    z.questions.forEach((q, i) => pool.push({ ...q, key: `${z.lesson.id}#${i}`, lesson: z.lesson }));
  }
  return pool;
}

async function whoseIdeaPool() {
  const qs = await allQuizzes();
  // Only lessons named after a thinker or text; topics like "Television structure" aren't "whose".
  const topics = new Set(['shared-core', 'three-media', 'narrative-order', 'tv', 'well-made-play',
    'inverted-pyramid', 'wsj-formula', 'kishotenketsu', 'point-of-view', 'who-is-the-subject', 'comedy',
    'science-of-story', 'making-us-care', 'side-characters', 'introductions', 'want-need-wound', 'cast-system',
    'dialogue', 'film-sound', 'music-silence', 'allegiance', 'kuleshov', 'editing', 'camera', 'mise-en-scene',
    'stage-tools', 'journalism-tools', 'tragedy-comedy', 'bildungsroman', 'quest-picaresque', 'genre-promise',
    'stage-forms', 'journalism-forms', 'save-the-cat-practice']);
  const people = qs.filter(z => z.ideas && z.ideas.length && !topics.has(z.lesson.id));
  const out = [];
  for (const z of people) {
    z.ideas.forEach((idea, i) => {
      const others = shuffle(people.filter(p => p.lesson.id !== z.lesson.id)).slice(0, 3).map(p => p.lesson.title);
      out.push({
        key: `${z.lesson.id}~${i}`, q: idea, lesson: z.lesson,
        choices: [z.lesson.title, ...others], answer: 0,
        explain: `From the lesson on ${z.lesson.title}.`,
      });
    });
  }
  return out.filter(q => q.choices.length === 4);
}

function shuffledChoices(q) {
  const order = shuffle(q.choices.map((_, i) => i));
  return { choices: order.map(i => q.choices[i]), answer: order.indexOf(q.answer) };
}

// ----- the quiz runner (used by lesson quizzes, mixed quiz and Whose idea?) -----
function runQuiz({ title, questions, back, again }) {
  let i = 0, score = 0;
  const missed = [];
  const view = () => {
    if (i >= questions.length) return finish();
    const q = questions[i];
    const { choices, answer } = shuffledChoices(q);
    app.innerHTML = `
      <a class="back" href="${back.href}">← ${esc(back.label)}</a>
      <p class="eyebrow">${esc(title)}</p>
      <div class="qhead"><span>Question ${i + 1} of ${questions.length}</span><span>Score ${score}</span></div>
      <div class="bar"><span style="width:${100 * i / questions.length}%"></span></div>
      <h2 class="qtext">${inline(q.q)}</h2>
      <div class="choices">${choices.map((c, k) => `<button class="choice" data-k="${k}">${inline(c)}</button>`).join('')}</div>
      <div id="after"></div>`;
    app.querySelectorAll('.choice').forEach(b => b.addEventListener('click', () => {
      const k = +b.dataset.k, right = k === answer;
      recordAnswer(q.key, right);
      if (right) score++; else missed.push(q);
      app.querySelectorAll('.choice').forEach((x, j) => {
        x.disabled = true;
        if (j === answer) x.classList.add('right'); else if (j === k) x.classList.add('wrong');
      });
      document.getElementById('after').innerHTML = `
        <div class="feedback ${right ? 'ok' : 'no'}"><b>${right ? 'Right.' : 'Not quite.'}</b> ${inline(q.explain || '')}
        ${q.lesson ? `<a href="#/lesson/${q.lesson.id}">Lesson: ${esc(q.lesson.title)}</a>` : ''}</div>
        <button class="btn solid" id="nextQ">${i + 1 < questions.length ? 'Next question' : 'See results'}</button>`;
      const n = document.getElementById('nextQ');
      n.addEventListener('click', () => { i++; view(); window.scrollTo(0, 0); });
      n.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }));
  };
  const finish = () => {
    const pct = questions.length ? Math.round(100 * score / questions.length) : 0;
    const verdict = pct === 100 ? 'Perfect.' : pct >= 80 ? 'Excellent.' : pct >= 50 ? 'Getting there.' : 'Worth another read.';
    app.innerHTML = `
      <a class="back" href="${back.href}">← ${esc(back.label)}</a>
      <p class="eyebrow">${esc(title)}</p>
      <div class="result"><strong>${score} / ${questions.length}</strong><span>${verdict}</span></div>
      ${missed.length ? `<h2>To review</h2><p class="muted">These will come up more often in mixed quizzes until you get them right.</p>
        ${missed.map(q => `<details class="check"><summary>${inline(q.q)}</summary><p><b>${inline(q.choices[q.answer])}.</b> ${inline(q.explain || '')}</p></details>`).join('')}` : ''}
      <div class="lesson-foot">
        <a class="btn" href="${back.href}">${esc(back.label)}</a>
        <button class="btn solid" id="againBtn">Play again</button>
      </div>`;
    document.getElementById('againBtn').addEventListener('click', again);
  };
  if (!questions.length) {
    app.innerHTML = `<a class="back" href="${back.href}">← ${esc(back.label)}</a><p class="loading">No questions here yet.</p>`;
    return;
  }
  view();
}

// ----- Put it in order -----
function runOrder(seq, again) {
  const correct = seq.steps;
  const tiles = shuffle(correct.map((s, i) => ({ s, i })));
  let next = 0, mistakes = 0;
  const lesson = allLessons().find(l => l.id === seq.lesson);
  const draw = () => {
    app.innerHTML = `
      <a class="back" href="#/play">← Play</a>
      <p class="eyebrow">Put it in order</p>
      <h1 class="game-title">${esc(seq.title)}</h1>
      <p class="muted">Tap the stages in the order they come. ${next} of ${correct.length} placed · ${mistakes} slip${mistakes === 1 ? '' : 's'}</p>
      <ol class="placed">${correct.slice(0, next).map(s => `<li>${esc(s)}</li>`).join('')}</ol>
      ${next < correct.length
        ? `<div class="tiles">${tiles.filter(t => t.i >= next).map(t => `<button class="tile" data-i="${t.i}">${esc(t.s)}</button>`).join('')}</div>`
        : `<div class="result"><strong>${mistakes === 0 ? 'Flawless.' : `${mistakes} slip${mistakes === 1 ? '' : 's'}`}</strong>
           <span>${esc(seq.title)}, in order.</span></div>
           <div class="lesson-foot">
             ${lesson && lesson.ready ? `<a class="btn" href="#/lesson/${lesson.id}">Lesson: ${esc(lesson.title)}</a>` : '<a class="btn" href="#/play">Play</a>'}
             <button class="btn solid" id="againBtn">Another one</button></div>`}`;
    app.querySelectorAll('.tile').forEach(b => b.addEventListener('click', () => {
      if (+b.dataset.i === next) { next++; draw(); }
      else { mistakes++; b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
        app.querySelector('.muted').textContent = `Tap the stages in the order they come. ${next} of ${correct.length} placed · ${mistakes} slip${mistakes === 1 ? '' : 's'}`; }
    }));
    const a = document.getElementById('againBtn');
    if (a) {
      const st = store.get('sa.order', {});
      st[seq.title] = Math.min(st[seq.title] ?? Infinity, mistakes);
      store.set('sa.order', st);
      a.addEventListener('click', again);
    }
  };
  draw();
}

// ----- Lightning round: 60 seconds -----
async function runLightning() {
  const pool = shuffle(await questionPool());
  if (!pool.length) return;
  let score = 0, idx = 0, left = 60, locked = false;
  const best = store.get('sa.bestLightning', 0);
  const frame = () => {
    const q = pool[idx % pool.length];
    const { choices, answer } = shuffledChoices(q);
    app.innerHTML = `
      <a class="back" href="#/play">← Play</a>
      <div class="qhead lightning"><span id="clock">${left}s</span><span>Score ${score}</span></div>
      <div class="bar"><span id="timebar" style="width:${100 * left / 60}%"></span></div>
      <h2 class="qtext">${inline(q.q)}</h2>
      <div class="choices">${choices.map((c, k) => `<button class="choice" data-k="${k}">${inline(c)}</button>`).join('')}</div>`;
    locked = false;
    app.querySelectorAll('.choice').forEach(b => b.addEventListener('click', () => {
      if (locked) return; locked = true;
      const k = +b.dataset.k, right = k === answer;
      recordAnswer(q.key, right);
      if (right) score++;
      b.classList.add(right ? 'right' : 'wrong');
      if (!right) app.querySelectorAll('.choice')[answer].classList.add('right');
      setTimeout(() => { if (left > 0) { idx++; frame(); } }, right ? 350 : 900);
    }));
  };
  const end = () => {
    stopTimers();
    const newBest = score > best;
    if (newBest) store.set('sa.bestLightning', score);
    app.innerHTML = `
      <a class="back" href="#/play">← Play</a>
      <p class="eyebrow">Lightning round</p>
      <div class="result"><strong>${score}</strong><span>${newBest ? 'A new personal best!' : `Your best: ${best}`}</span></div>
      <div class="lesson-foot"><a class="btn" href="#/play">Play</a><button class="btn solid" id="againBtn">Go again</button></div>`;
    document.getElementById('againBtn').addEventListener('click', runLightning);
  };
  timers.push(setInterval(() => {
    left--;
    const c = document.getElementById('clock'), t = document.getElementById('timebar');
    if (c) c.textContent = left + 's';
    if (t) t.style.width = (100 * left / 60) + '%';
    if (left <= 0) end();
  }, 1000));
  frame();
}

// ----- Play home and routes -----
async function renderPlay(mode, arg) {
  document.title = 'Play · Story Atlas';
  app.innerHTML = '<p class="loading">Loading…</p>';
  const box = cards();
  const weight = q => { const b = box[q.key]; return b ? 6 - b : 3; };

  if (mode === 'quiz' && arg) {
    const l = allLessons().find(x => x.id === arg);
    const go = async () => runQuiz({
      title: `Quiz: ${l ? l.title : ''}`,
      questions: shuffle(await questionPool({ lessonId: arg })),
      back: { href: `#/lesson/${arg}`, label: 'Back to the lesson' },
      again: go,
    });
    return go();
  }
  if (mode === 'mixed') {
    const go = async () => {
      const done = Object.keys(doneMap()).length;
      const pool = await questionPool({ onlyDone: done >= 2 });
      runQuiz({ title: 'Mixed quiz', questions: weightedPick(pool, 10, weight), back: { href: '#/play', label: 'Play' }, again: go });
    };
    return go();
  }
  if (mode === 'whose') {
    const go = async () => runQuiz({
      title: 'Whose idea is this?',
      questions: weightedPick(await whoseIdeaPool(), 10, weight),
      back: { href: '#/play', label: 'Play' }, again: go,
    });
    return go();
  }
  if (mode === 'order') {
    const seqs = data.sequences || [];
    const go = () => runOrder(seqs[Math.floor(Math.random() * seqs.length)], go);
    return seqs.length ? go() : renderPlay();
  }
  if (mode === 'lightning') return runLightning();
  // Scenario games share content/scenarios.json; "game" says which one an item belongs to.
  const scenarioGames = {
    doing: { title: "What's this doing?", game: undefined, n: 8 },
    kind: { title: 'What kind of story?', game: 'type', n: 8 },
    genre: { title: 'Name the genre', game: 'genre', n: 8 },
  };
  if (scenarioGames[mode]) {
    const cfg = scenarioGames[mode];
    const go = async () => {
      const lessons = Object.fromEntries(allLessons().map(l => [l.id, l]));
      const pool = (await getJSON('content/scenarios.json').catch(() => []))
        .map((x, i) => ({ ...x, key: 'scene:' + i, lesson: lessons[x.lesson] }))
        .filter(x => x.game === cfg.game);
      runQuiz({ title: cfg.title, questions: weightedPick(pool, cfg.n, weight), back: { href: '#/play', label: 'Play' }, again: go });
    };
    return go();
  }
  if (mode === 'terms') {
    const go = async () => runQuiz({
      title: 'Name the term',
      questions: weightedPick(await nameTermPool(), 10, weight),
      back: { href: '#/play', label: 'Play' }, again: go,
    });
    return go();
  }

  const st = store.get('sa.stats', { answered: 0, correct: 0, streak: 0, lastDay: '' });
  const today = new Date().toDateString(), yesterday = new Date(Date.now() - 864e5).toDateString();
  const streak = st.lastDay === today || st.lastDay === yesterday ? st.streak : 0;
  const pool = await questionPool();
  const mastered = pool.filter(q => (box[q.key] || 0) >= 4).length;
  const acc = st.answered ? Math.round(100 * st.correct / st.answered) : 0;

  app.innerHTML = `
    <h1>Play</h1>
    <p class="lede">Test yourself. Questions you miss come back more often until they stick.</p>
    <div class="stats">
      <div><strong>${streak}</strong><span>day streak</span></div>
      <div><strong>${mastered}<small>/${pool.length}</small></strong><span>mastered</span></div>
      <div><strong>${st.answered ? acc + '%' : '–'}</strong><span>accuracy</span></div>
    </div>
    <div class="games">
      <a class="game" href="#/play/mixed"><b>Mixed quiz</b><span>10 questions from the lessons you've finished, favoring the ones you've missed.</span></a>
      <a class="game" href="#/play/whose"><b>Whose idea is this?</b><span>Match each idea to the thinker behind it.</span></a>
      <a class="game" href="#/play/doing"><b>What's this doing?</b><span>A scene is described: name the technique and what it does to you.</span></a>
      <a class="game" href="#/play/kind"><b>What kind of story?</b><span>A story is described: is it a bildungsroman, a picaresque, a farce, an obituary…?</span></a>
      <a class="game" href="#/play/genre"><b>Name the genre</b><span>Sort famous films into Blake Snyder's ten Save the Cat genres.</span></a>
      <a class="game" href="#/play/terms"><b>Name the term</b><span>Read a definition, pick the term. Each answer shows who originated it.</span></a>
      <a class="game" href="#/play/order"><b>Put it in order</b><span>Tap a framework's stages in sequence: Snyder's beats, the hero's journey and more.</span></a>
      <a class="game" href="#/play/lightning"><b>Lightning round</b><span>As many as you can in 60 seconds. Best: ${store.get('sa.bestLightning', 0)}</span></a>
    </div>
    <h2>Quiz by lesson</h2>
    <ul class="lessons">${allLessons().filter(l => l.ready).map(l => {
      const qs = pool.filter(q => q.lesson.id === l.id);
      const m = qs.filter(q => (box[q.key] || 0) >= 4).length;
      return `<li><a href="#/play/quiz/${l.id}"><span class="txt"><b>${esc(l.title)}</b><i>${esc(l.track.title)} · ${m}/${qs.length} mastered</i></span></a></li>`;
    }).join('')}</ul>`;
}

// ---------- Terms: who originated each idea, and how to use it ----------
const slug = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function getGlossary() {
  if (!data.glossary) data.glossary = await getJSON('content/glossary.json').catch(() => []);
  return data.glossary;
}

async function renderTerms(openSlug) {
  document.title = 'Terms · Story Atlas';
  const terms = await getGlossary();
  const lessonsById = Object.fromEntries(allLessons().map(l => [l.id, l]));
  if (openSlug) store.set('sa.termFilter', 'all'); // a link to one term must be able to show it
  const filter = store.get('sa.termFilter', 'all');

  app.innerHTML = `
    <h1>Terms</h1>
    <p class="lede">Who originated each idea, and how to use it.</p>
    <input class="search" type="search" id="termSearch" placeholder="Search ${terms.length} terms" autocomplete="off" aria-label="Search terms">
    <div class="seg" role="group" aria-label="Show">
      <button data-f="all" aria-pressed="${filter === 'all'}">All</button>
      <button data-f="myth" aria-pressed="${filter === 'myth'}">Common myths</button>
    </div>
    <div id="termList"></div>`;

  const card = t => {
    const id = slug(t.term);
    const links = (t.lessons || []).filter(l => lessonsById[l] && lessonsById[l].ready)
      .map(l => `<a href="#/lesson/${l}">${esc(lessonsById[l].title)}</a>`).join(' · ');
    return `<details class="term" id="t-${id}" ${id === openSlug ? 'open' : ''}>
      <summary><b>${esc(t.term)}</b>${t.aka && t.aka.length ? `<i>Also: ${esc(t.aka.join(', '))}</i>` : ''}${t.myth ? '<span class="tag myth">Myth</span>' : ''}</summary>
      <div class="term-body">
        <p>${inline(t.meaning || '')}</p>
        <p class="origin"><span>Origin</span>${inline(t.origin || 'Unknown.')}</p>
        ${t.myth ? `<p class="origin myth"><span>Common myth</span>${inline(t.myth)}</p>` : ''}
        <div class="use"><span>How to use it</span>${inline(t.use || '')}</div>
        ${links ? `<p class="term-links">Lessons: ${links}</p>` : ''}
      </div></details>`;
  };

  const draw = () => {
    const q = (document.getElementById('termSearch').value || '').trim().toLowerCase();
    const f = store.get('sa.termFilter', 'all');
    const list = terms.filter(t => (f === 'all' || t.myth) &&
      (!q || [t.term, ...(t.aka || []), t.origin, t.meaning].join(' ').toLowerCase().includes(q)));
    let letter = '';
    document.getElementById('termList').innerHTML = list.length ? list.map(t => {
      const L = t.term.normalize('NFD')[0].toUpperCase().replace(/[^A-Z]/, '#');
      const head = L !== letter ? `<h2 class="letter">${(letter = L)}</h2>` : '';
      return head + card(t);
    }).join('') : `<p class="muted">${terms.length ? 'No terms match.' : 'The glossary is on its way.'}</p>`;
  };
  draw();
  document.getElementById('termSearch').addEventListener('input', draw);
  app.querySelectorAll('.seg button').forEach(b => b.addEventListener('click', () => {
    store.set('sa.termFilter', b.dataset.f);
    app.querySelectorAll('.seg button').forEach(x => x.setAttribute('aria-pressed', x === b));
    draw();
  }));
  if (openSlug) {
    const el = document.getElementById('t-' + openSlug);
    if (el) setTimeout(() => el.scrollIntoView({ block: 'start' }), 50);
  }
}

// "Name the term": a definition, four terms.
async function nameTermPool() {
  const terms = (await getGlossary()).filter(t => t.meaning);
  return terms.map(t => {
    const others = shuffle(terms.filter(o => o !== t)).slice(0, 3).map(o => o.term);
    const firstLesson = allLessons().find(l => (t.lessons || []).includes(l.id) && l.ready);
    return {
      key: 'term:' + slug(t.term), q: t.meaning, choices: [t.term, ...others], answer: 0,
      explain: `${t.origin || ''} [See the term →](#/terms/${slug(t.term)})`.trim(),
      lesson: firstLesson,
    };
  });
}

// ---------- routing ----------
let lastView = '';
async function route() {
  const [view = '', arg, arg2] = location.hash.replace(/^#\/?/, '').split('/');
  const tab = ['compare', 'play', 'terms'].includes(view) ? view : 'learn';
  stopTimers();
  document.querySelectorAll('.tabbar a').forEach(a => {
    if (a.dataset.tab === tab) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  const keepScroll = (view === 'compare' && lastView === 'compare') || (view === 'terms' && arg);
  if (view === 'lesson') await renderLesson(arg);
  else if (view === 'compare') renderCompare(arg);
  else if (view === 'play') await renderPlay(arg, arg2);
  else if (view === 'terms') await renderTerms(arg);
  else renderHome();
  if (!keepScroll) window.scrollTo(0, 0);
  lastView = view;
}

async function start() {
  try {
    [data.curriculum, data.concordance, data.sequences] = await Promise.all([
      getJSON('content/curriculum.json'),
      getJSON('content/concordance.json'),
      getJSON('content/sequences.json').catch(() => []),
    ]);
    data.diagrams = await getJSON('content/diagrams.json').catch(() => ({}));
  } catch {
    app.innerHTML = '<p class="loading">Couldn’t load the course. Check your connection and reload.</p>';
    return;
  }
  window.addEventListener('hashchange', route);
  route();
}

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
start();
