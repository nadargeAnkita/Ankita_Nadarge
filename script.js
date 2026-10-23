/* The Forward Pass: portfolio logic. Vanilla JS, no dependencies. */
(function () {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const touch = matchMedia('(pointer: coarse)').matches;
const small = innerWidth < 700 || (navigator.hardwareConcurrency || 4) <= 2;
const cssv = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

/* ---------- DATA (EDIT ME) ---------- */
const SKILLS = {
  Languages: [['Python', 'Primary language: RAG apps, ML, FastAPI services.', ['FastAPI', 'Scikit-learn', 'LangChain'], 5], ['SQL', 'Oracle PL/SQL, MySQL, SQL Server: joins, subqueries, triggers.', ['Oracle PL/SQL', 'Power BI'], 4], ['C++', 'Problem solving and data structures.', ['Git'], 3]],
  'ML / DL': [['Scikit-learn', 'Pipelines, tuning and evaluation at Labmentix.', ['Python', 'XGBoost', 'Streamlit'], 4], ['TensorFlow', 'Neural network experiments.', ['Python', 'NLP'], 3], ['XGBoost', 'Gradient boosting on tabular data.', ['Scikit-learn'], 3], ['NLP', 'Sentence-BERT embeddings and semantic matching.', ['Sentence-BERT', 'Python'], 4]],
  'LLM Eng': [['RAG', 'HydroGPT: ingestion, embeddings, retrieval.', ['ChromaDB', 'LangChain', 'Python'], 4], ['LangChain', 'Orchestrating retrieval and LLM calls.', ['RAG', 'Python'], 3], ['Sentence-BERT', 'Resume Screener: cosine-similarity ranking.', ['NLP', 'Scikit-learn'], 4], ['ChromaDB', 'Vector store behind HydroGPT.', ['RAG'], 4], ['Prompt Eng', 'Llama 3 via Groq: reports and a ReAct agent.', ['RAG'], 4]],
  'Backend & Data': [['FastAPI', 'HydroGPT backend.', ['Python', 'Streamlit'], 4], ['Streamlit', 'Prediction apps and interfaces.', ['FastAPI', 'Scikit-learn'], 5], ['Oracle PL/SQL', 'Procedures, triggers and views for the telemedicine system.', ['SQL'], 4], ['Power BI', 'Loan analysis dashboard.', ['SQL'], 4]],
  'Data Analytics': [['Pandas', 'Cleaning, aggregation and EDA in notebooks.', ['Python', 'Plotly', 'Scikit-learn'], 4], ['Plotly', 'Interactive charts for the loan analysis.', ['Pandas', 'Power BI'], 4], ['DAX', 'Measures behind the 8-page vaccination dashboard.', ['Power BI', 'SQL'], 3], ['MySQL', '3NF schema for WHO immunization data.', ['SQL', 'PyMySQL'], 4], ['PyMySQL', 'Python to MySQL loading and queries.', ['MySQL', 'Python'], 3]],
  Tools: [['Git', 'GitHub and GSSoC 2024: 2 merged pull requests.', ['Python'], 4]]
};
const GH = 'https://github.com/nadargeAnkita';
const PROJECTS = [
  { n: 'HydroGPT', tag: 'ai', d: 'AI hydropower forecasting assistant: retrieval-augmented generation with Llama 3.', task: 'rag_forecasting', stack: 'Python, FastAPI, Streamlit, Llama 3, Groq, ChromaDB', m: 'RAG + ReAct agent', c: 90, link: GH, pts: ['Document ingestion, embeddings and semantic retrieval with ChromaDB.', 'FastAPI backend and Streamlit frontend for natural-language forecasting.', 'ReAct reasoning workflow for contextual question answering.', 'Benchmarked several ML models for forecasting; XGBoost reached R² = 0.864.', 'Six-layer architecture, written up as an IEEE-style paper.'] },
  { n: 'AI Resume Screener', tag: 'ai', d: 'Semantic job matching that ranks resumes by meaning, not keywords.', task: 'semantic_matching', stack: 'Python, Streamlit, Sentence-BERT, Llama 3, Groq, Scikit-learn, PDFPlumber, python-docx', m: 'cosine-ranked matching', c: 88, link: GH, pts: ['Sentence-BERT embeddings ranked with cosine similarity.', 'Llama 3 writes candidate evaluation reports.', 'Automated parsing of PDF and DOCX resumes.'] },
  { n: 'Doctor Appointment & Telemedicine System', tag: 'data', d: 'Normalized Oracle database that automates booking, payments and telemedicine sessions.', task: 'database_design', stack: 'Oracle SQL, PL/SQL', m: '9 entities, normalized', c: 92, link: GH + '/Online-Doctor-Appointment-Telemedicine-Booking-System', pts: ['9-entity schema with primary/foreign keys and CHECK constraints.', 'PL/SQL procedures for booking, payment tracking and session creation.', 'Triggers prevent double-booking; views report ratings, open slots and revenue.'] },
  { n: 'Bank Loan Analysis Dashboard', tag: 'data', d: 'SQL analysis, Power BI dashboard and loan outcome prediction.', task: 'analytics_ml', stack: 'SQL Server, Power BI, Plotly, Scikit-learn', m: '38.6K applications', c: 86, link: GH + '/Bank_Loan_Analysis', pts: ['Analyzed 38.6K loan applications with joins, subqueries and aggregates.', 'Interactive Power BI dashboard tracking key loan metrics.', 'Logistic Regression and Random Forest models predict loan outcomes.'] },
  { n: 'Vaccination Data Analysis', tag: 'data', d: 'WHO immunization data for 190+ countries, 1980–2023, in a normalized MySQL schema with an 8-page Power BI dashboard.', task: 'data_modeling_viz', stack: 'MySQL, PyMySQL, Python, Power BI, DAX', m: '190+ countries', c: 87, link: GH + '/Vaccination-Data-Analysis-and-Visualization', pts: ['3NF MySQL schema for WHO immunization data from 1980 to 2023.', 'PyMySQL pipeline to load and query the data from Python.', '8-page Power BI dashboard with DAX measures.'] },
  { n: 'Algorithm Battle', tag: 'ai', d: 'Decision Tree vs Random Forest vs XGBoost on the UCI Adult Income dataset.', task: 'model_benchmarking', stack: 'Python, Scikit-learn, XGBoost, Pandas, Jupyter', m: '3 models compared', c: 84, link: GH, pts: ['Same preprocessing and evaluation for all three models.', 'Full Jupyter notebook with visualizations.'] }
];
const THEMES = ['cyber', 'paper', 'heat'];

/* ---------- Boot / training loop ---------- */
const boot = $('#boot'), lc = $('#loss'), lx = lc.getContext('2d');
let bootDone = false;
function endBoot() { if (bootDone) return; bootDone = true; boot.classList.add('done'); countUp(); setTimeout(() => boot.remove(), 800); }
$('#skip').addEventListener('click', endBoot);
(function runBoot() {
  const log = $('#bootlog'), N = 40, pts = [];
  let e = 0;
  const t = setInterval(() => {
    if (bootDone) return clearInterval(t);
    e++; const loss = 2.2 * Math.exp(-e / 9) + 0.05 + Math.random() * 0.05;
    pts.push(loss);
    lx.clearRect(0, 0, 640, 200); lx.strokeStyle = '#7dffb0'; lx.beginPath();
    pts.forEach((v, i) => lx[i ? 'lineTo' : 'moveTo'](i / N * 640, 190 - v / 2.4 * 180)); lx.stroke();
    log.textContent = `$ python train.py --target ankita\nepoch ${e}/${N}  loss=${loss.toFixed(3)}  acc=${(1 - loss / 2.4).toFixed(3)}`;
    if (e >= N) { clearInterval(t); log.textContent += '\nModel converged. Loading Ankita_v2026.pt…'; setTimeout(endBoot, 500); }
  }, reduce ? 10 : 80);
})();

/* ---------- Soft ambient orbs (reacts gently to the cursor on every section) ---------- */
const nc = $('#net'), nx = nc.getContext('2d');
let orbs = [], dust = [], mouse = { x: -999, y: -999 }, glow = { x: -999, y: -999 }, running = true;
function sizeNet() {
  nc.width = nc.offsetWidth; nc.height = nc.offsetHeight; orbs = []; dust = [];
  for (let i = 0; i < (small ? 8 : 15); i++) orbs.push({ x: Math.random() * nc.width, y: Math.random() * nc.height, r: 60 + Math.random() * 100, c: i % 3, ph: Math.random() * 7, sp: .15 + Math.random() * .25, vx: 0, vy: 0 });
  for (let i = 0; i < (small ? 25 : 60); i++) dust.push({ x: Math.random() * nc.width, y: Math.random() * nc.height, s: .6 + Math.random() * 1.1, ph: Math.random() * 7 });
}
sizeNet(); addEventListener('resize', sizeNet);
addEventListener('pointermove', e => { const r = nc.getBoundingClientRect(); mouse = { x: e.clientX - r.left, y: e.clientY - r.top }; });
document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) loop(performance.now()); });
const rgb = h => { h = h.replace('#', ''); if (h.length === 3) h = [...h].map(c => c + c).join(''); const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255].join(','); };
let last = performance.now(), frames = 0, acc = 0;
function loop(now) {
  if (!running) return;
  acc += now - last; frames++; last = now;
  if (acc > 500) { $('#hFps').textContent = Math.round(frames * 1000 / acc); frames = 0; acc = 0; }
  const cols = [cssv('--a1'), cssv('--a2'), cssv('--a3')].map(rgb), fg = rgb(cssv('--fg')), t = now / 1000, W = nc.width, H = nc.height;
  nx.clearRect(0, 0, W, H);
  if (glow.x < -900) { glow.x = mouse.x; glow.y = mouse.y; }
  glow.x += (mouse.x - glow.x) * .05; glow.y += (mouse.y - glow.y) * .05;
  for (const o of orbs) {
    const dx = o.x - mouse.x, dy = o.y - mouse.y, d = Math.hypot(dx, dy) || 1, near = d < 320 ? 1 - d / 320 : 0;
    if (!reduce) {
      if (d < 260) { o.vx += dx / d * (1 - d / 260) * .06; o.vy += dy / d * (1 - d / 260) * .06; }
      o.vx *= .96; o.vy *= .96;
      o.x += o.vx + Math.sin(t * o.sp + o.ph) * .25; o.y += o.vy + Math.cos(t * o.sp * .8 + o.ph) * .2;
      if (o.x < -o.r) o.x = W + o.r; if (o.x > W + o.r) o.x = -o.r; if (o.y < -o.r) o.y = H + o.r; if (o.y > H + o.r) o.y = -o.r;
    }
    const g = nx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r), c = cols[o.c];
    g.addColorStop(0, `rgba(${c},${.1 + near * .1})`); g.addColorStop(1, `rgba(${c},0)`);
    nx.fillStyle = g; nx.beginPath(); nx.arc(o.x, o.y, o.r, 0, 7); nx.fill();
  }
  if (mouse.x > -900) { const g = nx.createRadialGradient(glow.x, glow.y, 0, glow.x, glow.y, 220); g.addColorStop(0, `rgba(${cols[0]},.12)`); g.addColorStop(1, `rgba(${cols[0]},0)`); nx.fillStyle = g; nx.beginPath(); nx.arc(glow.x, glow.y, 220, 0, 7); nx.fill(); }
  for (const p of dust) {
    if (!reduce) { p.y -= .06; if (p.y < 0) p.y = H; }
    nx.fillStyle = `rgba(${fg},${.12 + .18 * Math.sin(t * .8 + p.ph)})`; nx.beginPath(); nx.arc(p.x, p.y, p.s, 0, 7); nx.fill();
  }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

/* ---------- Typing tags ---------- */
const tags = ['task: python_data_analysis', 'focus: applied_ml', 'stack: python + sql + power_bi', 'llm: rag_apps', 'status: open_to_work'];
(function type(i = 0, c = 0, del = false) {
  const el = $('#typed'), s = tags[i];
  if (reduce) { el.textContent = tags[0]; return; }
  el.textContent = s.slice(0, c);
  let next = del ? 30 : 70;
  if (!del && c === s.length) { del = true; next = 1400; }
  else if (del && c === 0) { del = false; i = (i + 1) % tags.length; next = 300; }
  setTimeout(() => type(i, c + (del ? -1 : 1), del), next);
})();

/* ---------- Skills graph ---------- */
const graph = $('#graph'), tip = $('#tip');
for (const [g, list] of Object.entries(SKILLS)) {
  const d = document.createElement('div'); d.className = 'grp'; d.innerHTML = `<h3>${g}</h3>`;
  list.forEach(([n, use, rel, lv]) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'node'; b.textContent = n; b.dataset.rel = rel.join('|');
    const on = () => { $$('.node', graph).forEach(x => x.classList.toggle('rel', rel.includes(x.textContent))); b.classList.add('on'); tip.innerHTML = `<b>${n}</b> <span class="meter">${'■'.repeat(lv)}${'□'.repeat(5 - lv)}</span> self-rated. ${use} Linked: ${rel.join(', ')}.`; };
    const off = () => $$('.node', graph).forEach(x => x.classList.remove('rel', 'on'));
    b.addEventListener('mouseenter', on); b.addEventListener('focus', on); b.addEventListener('click', on);
    b.addEventListener('mouseleave', off); b.addEventListener('blur', off);
    d.appendChild(b);
  });
  graph.appendChild(d);
}
$('#viewToggle').addEventListener('click', e => { const l = graph.classList.toggle('list'); e.target.setAttribute('aria-pressed', l); e.target.textContent = l ? 'Graph view' : 'List view'; });

/* ---------- Training log accordion ---------- */
$$('.log button').forEach(b => b.addEventListener('click', () => { const o = b.parentElement.classList.toggle('open'); b.setAttribute('aria-expanded', o); }));

/* ---------- Projects ---------- */
function spark(c) {
  let p = '', y = 28;
  for (let i = 0; i < 20; i++) { y = Math.max(3, Math.min(28, y - (Math.random() * 3 - .6 + (c / 100)))); p += `${i * 8},${y.toFixed(1)} `; }
  return `<svg class="spark" width="152" height="30" viewBox="0 0 152 30" role="img" aria-label="Metric trend"><polyline points="${p}" fill="none" stroke="${cssv('--a2')}" stroke-width="1.5"/></svg>`;
}
const plist = $('#plist'), fl = $('#filters'); let flt = 'all';
function renderP() {
  plist.innerHTML = '';
  PROJECTS.filter(p => flt === 'all' || p.tag === flt).forEach(p => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'proj';
    b.innerHTML = `<div class="hd">task=${p.task} · ${p.m}</div><h3>${p.n}</h3><div>${p.d}</div><div class="bar" role="img" aria-label="Self-rated confidence ${p.c}%"><i data-w="${p.c}"></i></div><small>confidence ${p.c}%</small>${spark(p.c)}`;
    b.addEventListener('click', () => openProj(p, b)); plist.appendChild(b);
  });
  requestAnimationFrame(() => requestAnimationFrame(() => $$('.bar i', plist).forEach(i => i.style.width = i.dataset.w + '%')));
}
[['all', 'All'], ['ai', 'AI / LLM'], ['data', 'SQL / Data']].forEach(([k, l]) => {
  const b = document.createElement('button'); b.type = 'button'; b.className = 'node' + (k === 'all' ? ' on' : ''); b.textContent = l;
  b.addEventListener('click', () => { flt = k; $$('button', fl).forEach(x => x.classList.toggle('on', x === b)); renderP(); }); fl.appendChild(b);
});
renderP();
const pover = $('#pover'); let pFrom;
function openProj(p, from) {
  pFrom = from;
  $('#pbody').innerHTML = `<h2 id="pt">${p.n}</h2><p class="hd">task=${p.task} · stack=${p.stack}</p><p>${p.d}</p><ul>${p.pts.map(x => `<li>${x}</li>`).join('')}</ul><a class="btn" href="${p.link}" target="_blank" rel="noopener">GitHub</a>`;
  pover.hidden = false; $('#pclose').focus();
}
function closeProj() { pover.hidden = true; if (pFrom) pFrom.focus(); }
$('#pclose').addEventListener('click', closeProj);
pover.addEventListener('click', e => { if (e.target === pover) closeProj(); });

/* ---------- Contact + backprop animation ---------- */
const bp = $('#bp'), bx = bp.getContext('2d');
function backprop(done) {
  let x = 590; const a1 = cssv('--a1'), a2 = cssv('--a2');
  (function step() {
    bx.clearRect(0, 0, 600, 80);
    for (let l = 0; l < 6; l++) for (let k = 0; k < 4; k++) { bx.fillStyle = Math.abs(x - (l * 110 + 25)) < 60 ? a2 : a1; bx.globalAlpha = .7; bx.beginPath(); bx.arc(l * 110 + 25, 12 + k * 18, 4, 0, 7); bx.fill(); }
    bx.globalAlpha = 1; bx.strokeStyle = a2; bx.beginPath(); bx.moveTo(x, 0); bx.lineTo(x, 80); bx.stroke();
    x -= reduce ? 100 : 9; if (x > 0) requestAnimationFrame(step); else { bx.clearRect(0, 0, 600, 80); done(); }
  })();
}
$('#form').addEventListener('submit', e => {
  e.preventDefault();
  const n = $('#fn').value.trim(), m = $('#fe').value.trim(), t = $('#fm').value.trim(), err = $('#ferr');
  if (!n) return err.textContent = 'Name is required.';
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(m)) return err.textContent = 'Enter a valid email address.';
  if (t.length < 10) return err.textContent = 'Message needs at least 10 characters.';
  err.textContent = '';
  backprop(() => {
    $('#ok').textContent = `Gradient received, ${n}. Your email app should open with the message ready. If not, write to nadargeankita4@gmail.com.`;
    location.href = 'mailto:nadargeankita4@gmail.com?subject=' + encodeURIComponent('Portfolio message from ' + n) + '&body=' + encodeURIComponent(t + '\n\nReply to: ' + m); e.target.reset();
  });
});

/* ---------- Scroll: reveal, HUD ---------- */
const secs = $$('section');
secs.forEach(s => s.querySelector('.wrap')?.classList.add('reveal'));
const io = new IntersectionObserver(es => es.forEach(en => {
  if (!en.isIntersecting) return;
  en.target.querySelector('.wrap')?.classList.add('in');
  $$('.bar i', en.target).forEach(i => i.style.width = i.dataset.w + '%');
  $('#hLayer').textContent = en.target.dataset.layer; $('#hName').textContent = en.target.dataset.name;
}), { threshold: .35 });
secs.forEach(s => io.observe(s));

/* ---------- Theme ---------- */
let ti = 0;
function setTheme(n) { const i = THEMES.indexOf(n); if (i < 0) return false; ti = i; document.documentElement.dataset.theme = n; return true; }

/* ---------- Terminal ---------- */
const term = $('#term'), tout = $('#tout'), tin = $('#tin'); let hist = [], hp = 0, lastFocus;
const out = s => { tout.textContent += s + '\n'; tout.scrollTop = tout.scrollHeight; };
function openTerm() { lastFocus = document.activeElement; term.hidden = false; if (!tout.textContent) out('Python 3.12 (ankita) — type help()'); tin.focus(); }
function closeTerm() { term.hidden = true; lastFocus && lastFocus.focus(); }
$('#termBtn').addEventListener('click', openTerm);
const CMD = {
  help: () => 'commands: help about whoami education skills projects certs github contact resume theme clear import this print("...") exit()',
  about: () => 'Ankita Nadarge: Python data analyst + AI/ML, Pune. B.Tech CS, AI/ML specialization (2026). Data Science with AI intern at Labmentix.',
  whoami: () => 'ankita: CS graduate turning data into dashboards, models and RAG apps',
  education: () => 'B.Tech CS & Tech, Shivaji University, CGPA 7.6 (2022-2026)\nHSC 60% (2022), SSC 94% (2020)',
  certs: () => 'IBM Python for Data Science, AI & Development\nIBM Data Science Professional Certificate\nTCS iON Career Edge\nAccenture and Tata simulations\nDSA with C/C++ (Udemy)\nPrompt Engineering (upGrad)',
  github: () => 'github.com/nadargeAnkita | GSSoC 2024 Extended: AIR 471, 2 merged PRs',
  skills: () => Object.entries(SKILLS).map(([g, l]) => g + ': ' + l.map(x => x[0]).join(', ')).join('\n'),
  projects: () => PROJECTS.map((p, i) => `${i + 1}. ${p.n} (${p.m})`).join('\n'),
  contact: () => 'github.com/nadargeAnkita | nadargeankita4@gmail.com | linkedin.com/in/ankita-nadarge',
  resume: () => 'Ankita_Nadarge.pdf (general) | Ankita_Nadarge_SQL.pdf (SQL roles)',
  theme: () => { setTheme(THEMES[(ti + 1) % 3]); return 'theme -> ' + THEMES[ti]; },
  clear: () => { tout.textContent = ''; return null; },
  'import this': () => 'The Zen of Ankita\nClean data beats clever models.\nValidation is not optional.\nShip it, then measure it.\nReadability counts.',
  'exit()': () => { closeTerm(); return null; }
};
tin.addEventListener('keydown', e => {
  if (e.key === 'ArrowUp') { e.preventDefault(); if (hp > 0) tin.value = hist[--hp]; }
  else if (e.key === 'ArrowDown') { e.preventDefault(); tin.value = hp < hist.length - 1 ? hist[++hp] : ''; hp = Math.min(hp + 0, hist.length); }
  else if (e.key === 'Enter') {
    const v = tin.value.trim(); tin.value = ''; if (!v) return; hist.push(v); hp = hist.length; out('>>> ' + v);
    const pm = v.match(/^print\((["'])(.*)\1\)$/); const k = v.replace(/\(\)$/, '') === 'exit' ? 'exit()' : v.replace(/\(\)$/, '');
    let r;
    if (pm) r = pm[2]; else if (CMD[k]) r = CMD[k](); else r = `NameError: '${v}' is not defined. Try help()`;
    if (r) out(r);
  }
});
addEventListener('keydown', e => {
  if (e.key === '`' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') { e.preventDefault(); term.hidden ? openTerm() : closeTerm(); }
  if (e.key === 'Escape') { if (!term.hidden) closeTerm(); if (!pover.hidden) closeProj(); }
});

/* ---------- Extras: JD matcher, counters, marquee, axon, theme button, keys ---------- */
const MINE = ['python', 'sql', 'c++', 'scikit-learn', 'tensorflow', 'xgboost', 'nlp', 'rag', 'langchain', 'sentence-bert', 'vector database', 'prompt engineering', 'fastapi', 'rest api', 'streamlit', 'power bi', 'excel', 'git', 'jupyter', 'oracle', 'pl/sql', 'mysql', 'sql server', 'stored procedure', 'trigger', 'normalization', 'llm', 'machine learning', 'pandas', 'numpy', 'plotly', 'dax', 'data analysis', 'data visualization', 'eda', 'etl'];
const OTHER = ['java ', 'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'react', 'angular', 'node', 'typescript', 'javascript', 'spark', 'hadoop', 'tableau', 'c#', '.net', 'mongodb', 'postgres', 'airflow', 'pytorch', 'devops'];
$('#jdGo').addEventListener('click', () => {
  const t = ' ' + $('#jd').value.toLowerCase().replace(/[^a-z0-9+#.\/-]+/g, ' ') + ' ', o = $('#jdOut');
  if (t.trim().length < 3) { o.textContent = 'Paste a job description first.'; return; }
  const hit = MINE.filter(k => t.includes(' ' + k)), gap = OTHER.filter(k => t.includes(' ' + k));
  if (!hit.length && !gap.length) { o.textContent = 'No known tech keywords found. Try a fuller description.'; return; }
  const s = Math.round(hit.length / (hit.length + gap.length) * 100), chip = (a, c) => a.map(x => `<span class="chip ${c}">${x.trim()}</span>`).join('');
  o.innerHTML = `Keyword overlap: <b>${s}%</b> (a rough keyword count, not a verdict).<br>Matches on my resume: ${chip(hit, '') || 'none'}<br>Not on my resume yet: ${chip(gap, 'gap') || 'none'}`;
});
function countUp() {
  $$('[data-n]').forEach(el => {
    const to = +el.dataset.n, d = +(el.dataset.d || 0); let s = null;
    (function f(t) { s = s || t; const k = reduce ? 1 : Math.min((t - s) / 1400, 1); el.textContent = (to * k).toFixed(d); if (k < 1) requestAnimationFrame(f); })(performance.now());
  });
}
const mt = 'python / sql / rag / fastapi / streamlit / llama 3 / chromadb / sentence-bert / oracle pl-sql / mysql / pandas / dax / plotly / xgboost / power bi / scikit-learn / langchain / ';
$('.marquee div').textContent = mt + mt;
const ax = document.createElement('div'); ax.id = 'axon'; ax.setAttribute('aria-hidden', 'true'); document.body.appendChild(ax);
addEventListener('scroll', () => { const m = document.documentElement.scrollHeight - innerHeight; ax.style.height = (m > 0 ? scrollY / m * 100 : 0) + 'vh'; }, { passive: true });
$('#themeBtn').addEventListener('click', () => { setTheme(THEMES[(ti + 1) % 3]); $('#themeBtn').title = 'Theme: ' + THEMES[ti]; });
$('#copyMail').addEventListener('click', async e => {
  const b = e.target;
  try { await navigator.clipboard.writeText('nadargeankita4@gmail.com'); b.textContent = 'Copied'; } catch (_) { b.textContent = 'nadargeankita4@gmail.com'; }
  setTimeout(() => b.textContent = 'Copy email', 2500);
});
addEventListener('keydown', e => {
  if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName) || e.ctrlKey || e.metaKey || e.altKey || !term.hidden || !pover.hidden) return;
  const l = +$('#hLayer').textContent;
  if (e.key === 'j' && l < 5) secs[l + 1].scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  if (e.key === 'k' && l > 0) secs[l - 1].scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
});

/* ---------- Cursor gradient trail (non-touch) ---------- */
if (!touch && !reduce) {
  const tc = $('#trail'), tx = tc.getContext('2d'); let pt = null;
  const rs = () => { tc.width = innerWidth; tc.height = innerHeight; }; rs(); addEventListener('resize', rs);
  addEventListener('pointermove', e => {
    if (pt) { const g = tx.createLinearGradient(pt.x, pt.y, e.clientX, e.clientY); g.addColorStop(0, cssv('--a1')); g.addColorStop(1, cssv('--a2')); tx.strokeStyle = g; tx.lineWidth = 2; tx.beginPath(); tx.moveTo(pt.x, pt.y); tx.lineTo(e.clientX, e.clientY); tx.stroke(); }
    pt = { x: e.clientX, y: e.clientY };
  });
  (function fade() { tx.globalCompositeOperation = 'destination-out'; tx.fillStyle = 'rgba(0,0,0,.08)'; tx.fillRect(0, 0, tc.width, tc.height); tx.globalCompositeOperation = 'source-over'; if (!document.hidden) requestAnimationFrame(fade); else setTimeout(fade, 500); })();
}

/* ---------- v3: decode headings, card tilt + spotlight, magnetic buttons, photo parallax, log stagger ---------- */
const GL = '01<>/\\{}[]#$%';
function scramble(el) {
  if (reduce) return;
  const t = el.dataset.t || (el.dataset.t = el.textContent); el.setAttribute('aria-label', t); let f = 0;
  const id = setInterval(() => { f++; el.textContent = [...t].map((c, i) => c === ' ' || i < f / 2 ? c : GL[Math.random() * GL.length | 0]).join(''); if (f >= t.length * 2) { clearInterval(id); el.textContent = t; } }, 30);
}
const io2 = new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { scramble(e.target); o.unobserve(e.target); } }), { threshold: .6 });
$$('h2').forEach(h => io2.observe(h));
plist.addEventListener('pointermove', e => {
  const c = e.target.closest('.proj'); if (!c) return; const r = c.getBoundingClientRect();
  c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
  if (!reduce && !touch) c.style.transform = `perspective(900px) rotateX(${-((e.clientY - r.top) / r.height - .5) * 4}deg) rotateY(${((e.clientX - r.left) / r.width - .5) * 4}deg)`;
});
plist.addEventListener('pointerout', e => { const c = e.target.closest('.proj'); if (c) c.style.transform = ''; });
$$('.btn').forEach(b => {
  b.addEventListener('pointermove', e => { if (reduce || touch) return; const r = b.getBoundingClientRect(); b.style.translate = `${(e.clientX - r.left - r.width / 2) * .2}px ${(e.clientY - r.top - r.height / 2) * .3}px`; });
  b.addEventListener('pointerleave', () => b.style.translate = '');
});
const ph = $('#photo');
if (ph && !reduce && !touch) $('#hero').addEventListener('pointermove', e => { ph.style.setProperty('--px', ((e.clientX / innerWidth) - .5) * -18 + 'px'); ph.style.setProperty('--py', ((e.clientY / innerHeight) - .5) * -18 + 'px'); });
$$('.log li').forEach((l, i) => l.style.animationDelay = i * .1 + 's');
})();
