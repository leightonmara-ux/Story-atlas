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
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
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
  const d = DIAGRAMS[id];
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
  const labels = pts.filter(p => p.label).map(p => {
    const anchor = p.x < 70 ? 'start' : p.x > W - 70 ? 'end' : 'middle';
    const dx = anchor === 'start' ? -4 : anchor === 'end' ? 4 : 0;
    const ty = p.below ? p.y + 22 : p.y - 12;
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
      <div class="progress">${doneCount} of ${ready.length} available lessons done · ${lessons.length} planned
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
    <div class="lesson-foot">
      <button class="btn ${isDone ? 'is-done' : ''}" id="doneBtn">${isDone ? '✓ Done (tap to undo)' : 'Mark as done'}</button>
      ${next ? `<a class="btn solid" href="#/lesson/${next.id}">Next: ${esc(next.title)} →</a>` : `<a class="btn solid" href="#/compare">Compare the frameworks →</a>`}
    </div>`;

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

// ---------- routing ----------
let lastView = '';
async function route() {
  const [view = '', arg] = location.hash.replace(/^#\/?/, '').split('/');
  const tab = view === 'compare' ? 'compare' : 'learn';
  document.querySelectorAll('.tabbar a').forEach(a => {
    if (a.dataset.tab === tab) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  const keepScroll = view === 'compare' && lastView === 'compare';
  if (view === 'lesson') await renderLesson(arg);
  else if (view === 'compare') renderCompare(arg);
  else renderHome();
  if (!keepScroll) window.scrollTo(0, 0);
  lastView = view;
}

async function start() {
  try {
    [data.curriculum, data.concordance] = await Promise.all([
      getJSON('content/curriculum.json'),
      getJSON('content/concordance.json'),
    ]);
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
