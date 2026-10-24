/* الكهرباء بالمختصر المفيد — كورس تفاعلي
   قاعدة قاعدة: كل سؤال غلط بيرجع، وبعدين 5 صح ورا بعض لحتى تنفتح القاعدة يلي بعدها. */
(function () {
  'use strict';

  const WA_NUMBER = '96179434479';           // رقم أنور (واتساب)
  const WA_DISPLAY = '+961 79 434 479';
  const CFG = window.COURSE_CONFIG || {};
  const STREAK_TARGET = CFG.streak || 5;                    // أسئلة صح ورا بعض بآخر كل قاعدة
  const REQUEUE_GAP = 3;                      // السؤال الغلط بيرجع بعد كم سؤال
  const KEY = CFG.storageKey || 'electro-course-v1';
  const NEED_KEY = CFG.requireKey === true;   // الكورس صار تحدّي مجاني؛ المفتاح بيرجع إذا انحط requireKey: true

  // تحدّي الكتاب: يلي بيخلّص بـ 5 غلطات أو أقل بياخد الكتاب بخصم 30%
  const CHALLENGE_MAX = 5;
  const CHALLENGE_PRICE = 7;
  const BOOK_FULL = 10;

  // نفس قاعدة مفاتيح أدوات MrElectroAI (tools/lock.js)
  const SB_URL = 'https://utjpvjnhffapbwpbkkuc.supabase.co';
  const SB_KEY = 'sb_publishable_wSY0Oa0SmW_Ipgaerw-zCA_CM_PZQvK';
  const BOOK_TOOL = 'book';
  const TOTAL = RULES.length;

  const $app = document.getElementById('app');
  const $who = document.getElementById('who');

  // ---------- storage ----------
  let S = load();
  function load() {
    try { const raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw); } catch (e) {}
    return null;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  const COURSE_ID = 'electro';
  const CHALLENGE_ON = true;

  // ---------- بيوصل لأنور لحالو: كل قاعدة بتخلص بتنحفظ بقاعدة البيانات (إضافة بس، ما حدا بيقدر يقرا غير أنور) ----------
  function cid() {
    if (!S.cid) { S.cid = (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 12)); save(); }
    return S.cid;
  }
  function snapshot() {
    const rules = RULES.map((r) => { const st = S.rules[r.n] || {}; return { n: r.n, t: r.title, m: st.mistakes || 0, a: st.answers || 0, s: st.start || null, e: st.end || null, p: !!st.passed }; });
    const weak = [];
    RULES.forEach((r) => { const st = S.rules[r.n]; if (!st) return; Object.entries(st.missed || {}).forEach(([qi, c]) => { const q = r.q[qi]; if (q) weak.push({ n: r.n, c, q: q.q, a: q.a[0] }); }); });
    weak.sort((x, y) => y.c - x.c);
    const done = rules.filter((r) => r.p).length;
    return { done, m: rules.reduce((s, r) => s + r.m, 0), a: rules.reduce((s, r) => s + r.a, 0), rules, weak: weak.slice(0, 20) };
  }
  let reporting = false;
  async function report() {
    if (!S || !S.name || reporting) return;
    const x = snapshot();
    const sig = x.done + '|' + (S.finishedAt || 0);
    if (S.repSig === sig) return;
    reporting = true;
    try {
      const res = await fetch(SB_URL + '/rest/v1/course_results', { method: 'POST',
        headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ client_id: cid(), course: COURSE_ID, event: S.finishedAt ? 'finish' : (x.done ? 'rule' : 'start'),
          name: String(S.name).slice(0, 80), phone: String(S.phone).slice(0, 25), rules_done: x.done, total: TOTAL, mistakes: x.m, answers: x.a,
          started_at: S.startedAt ? new Date(S.startedAt).toISOString() : null, finished_at: S.finishedAt ? new Date(S.finishedAt).toISOString() : null,
          data: { rules: x.rules, weak: x.weak, challenge: CHALLENGE_ON ? challengeOk() : null, max: CHALLENGE_ON ? CHALLENGE_MAX : null } }) });
      if (res.ok) { S.repSig = sig; save(); }
    } catch (e) {} finally { reporting = false; }
  }
  window.addEventListener('online', () => report());
  function fresh(name, phone) {
    return { v: 1, name, phone, startedAt: Date.now(), current: 1, finishedAt: null, textSent: false, pdfSent: false, rules: {} };
  }
  function R(n) {
    if (!S.rules[n]) {
      S.rules[n] = { start: null, end: null, mistakes: 0, answers: 0, missed: {}, phase: 'learn', queue: shuffle([...Array(RULES[n - 1].q.length).keys()]), streak: 0, last: -1, pending: null, passed: false };
    }
    return S.rules[n];
  }

  // ---------- helpers ----------
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function esc(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function rule(n) { return RULES[n - 1]; }
  function fmtDate(t) {
    if (!t) return '—';
    const d = new Date(t);
    return d.toLocaleDateString('ar-LB-u-nu-latn', { year: 'numeric', month: 'long', day: 'numeric' }) + ' — ' + d.toLocaleTimeString('ar-LB-u-nu-latn', { hour: '2-digit', minute: '2-digit' });
  }
  function fmtDur(ms) {
    if (!ms || ms < 0) return '—';
    const m = Math.max(1, Math.round(ms / 60000));
    const h = Math.floor(m / 60), r = m % 60;
    if (h && r) return `${h} س و${r} د`;
    if (h) return `${h} ساعة`;
    return `${r} دقيقة`;
  }
  function header() { $who.textContent = S ? S.name : ''; }
  function top() { window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' }); }

  // ---------- router ----------
  let view = 'board';
  function render() {
    header();
    if (!S) return welcome();
    if (NEED_KEY && !S.key) return keyOnly();
    if (S.finishedAt) return finalScreen();
    if (view === 'quiz') return quiz();
    return board();
  }

  // ---------- welcome ----------
  function welcome() {
    $app.innerHTML = `
      <img class="cover" src="cover.jpg" alt="غلاف كتاب الكهرباء بالمختصر المفيد">
      <h1>بصّم الكتاب قاعدة قاعدة</h1>
      ${CFG.banner ? `<p class="err">${CFG.banner}</p>` : ''}
      <p>رح نسألك ${RULES[0].q.length} أسئلة على كل قاعدة من الـ ${TOTAL}. كل سؤال بتغلط فيه بيرجعلك لحتى تجاوبو صح، وبالآخر لازم تجاوب ${STREAK_TARGET} أسئلة صح ورا بعض. ما بتنفتحلك القاعدة يلي بعدها إلا بس تكون باصم يلي قبلها.</p>
      <div class="challenge"><b>🎁 التحدّي:</b> خلّص الـ ${RULES.length * RULES[0].q.length} سؤال بـ ${CHALLENGE_MAX} غلطات أو أقل، وخود كتاب «الكهرباء بالمختصر المفيد» بخصم 30%: <b>${CHALLENGE_PRICE}$</b> بدل ${BOOK_FULL}$.</div>
      <p class="muted">بآخر الكورس بتبعت ملخص شغلك لأنور عالواتساب، وبتاخد شهادة باسمك.</p>
      <form id="f" novalidate>
        <label for="nm">اسمك الكامل</label>
        <input id="nm" type="text" autocomplete="name" placeholder="مثلاً: محمد علي" required>
        <label for="ph">رقم تلفونك (واتساب)</label>
        <input id="ph" type="tel" inputmode="tel" autocomplete="tel" placeholder="مثلاً: 70 123 456" dir="ltr" required>
        <div class="hint">الاسم بينكتب عالشهادة متل ما بتكتبو هون.</div>
        ${NEED_KEY ? keyField() : ''}
        <div class="err" id="err" role="alert"></div>
        <p class="muted" style="font-size:14px;margin:6px 0 10px">اسمك ورقمك ونتيجتك بيوصلو لأنور لحالو، ليتابع معك. ما حدا غيرو بيشوفهن.</p>
        <button class="btn volt" type="submit">ابدأ الكورس</button>
      </form>
      ${NEED_KEY ? buyHint() : ''}`;
    document.getElementById('f').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('nm').value.trim().replace(/\s+/g, ' ');
      const phone = document.getElementById('ph').value.trim();
      const digits = phone.replace(/\D/g, '');
      const err = document.getElementById('err');
      if (name.length < 3) { err.textContent = 'اكتب اسمك الكامل (3 حروف عالأقل).'; return; }
      if (digits.length < 7) { err.textContent = 'اكتب رقم تلفونك كامل.'; return; }
      if (!NEED_KEY) { S = fresh(name, phone); save(); report(); view = 'board'; render(); top(); return; }
      activate(e.submitter || document.querySelector('#f button[type=submit]'), (code) => {
        S = fresh(name, phone); S.key = code; save(); report(); view = 'board'; render(); top();
      });
    });
  }

  // ---------- مفتاح الكتاب ----------
  function keyField() {
    return `<label for="ky">مفتاح الكورس</label>
        <input id="ky" type="text" autocomplete="off" spellcheck="false" placeholder="MEA-XXXX-XXXX" dir="ltr" style="text-transform:uppercase;font-family:'JetBrains Mono',monospace;letter-spacing:2px">
        <div class="hint">المفتاح بيوصلك عالواتساب مع الكتاب.</div>`;
  }
  function buyHint() {
    return `<p class="muted" style="text-align:center;margin-top:18px">ما عندك مفتاح؟ <a href="../#books" style="color:var(--volt);font-weight:600">اشتري الكتاب</a> وبيوصلك معو.</p>`;
  }
  // طالب بلّش قبل ما ينحط المفتاح: منطلب المفتاح بس، وتقدّمو بيضل
  function keyOnly() {
    $app.innerHTML = `
      <h1>حط مفتاح الكورس</h1>
      <p>أهلا ${esc(S.name.split(' ')[0])}. الكورس صار للي اشتروا الكتاب، وتقدّمك محفوظ متل ما هو.</p>
      <form id="f" novalidate>
        ${keyField()}
        <div class="err" id="err" role="alert"></div>
        <button class="btn volt" type="submit">كمّل الكورس</button>
      </form>
      ${buyHint()}`;
    document.getElementById('f').addEventListener('submit', (e) => {
      e.preventDefault();
      activate(document.querySelector('#f button[type=submit]'), (code) => { S.key = code; save(); view = 'board'; render(); top(); });
    });
  }
  async function activate(btn, onOk) {
    const err = document.getElementById('err');
    const code = (document.getElementById('ky').value || '').trim().toUpperCase().replace(/\s+/g, '');
    if (code.length < 8) { err.textContent = 'اكتب مفتاح الكورس كامل.'; return; }
    const label = btn.textContent; btn.disabled = true; btn.textContent = 'عم نتحقق من المفتاح…';
    const r = await verifyKey(code);
    btn.disabled = false; btn.textContent = label;
    if (!r.ok) { err.textContent = r.msg; return; }
    onOk(code);
  }
  async function sb(path, opts) {
    const res = await fetch(SB_URL + '/rest/v1/' + path, Object.assign({}, opts, { headers: {
      apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY, 'Content-Type': 'application/json', Prefer: 'return=representation' } }));
    if (!res.ok) throw new Error(await res.text());
    return res.status === 204 ? null : res.json();
  }
  async function fingerprint() {
    const s = [navigator.userAgent, navigator.language, screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(), navigator.hardwareConcurrency || 0].join('|');
    const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
    return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('').slice(0, 24);
  }
  async function verifyKey(code) {
    let rows;
    try { rows = await sb('licenses?code=eq.' + encodeURIComponent(code) + '&select=*'); }
    catch (e) { return { ok: false, msg: 'ما قدرنا نتحقق من المفتاح. تأكد إنك متصل بالإنترنت وجرّب مرة تانية.' }; }
    if (!rows || !rows.length) return { ok: false, msg: 'المفتاح غلط. تأكد منو بالرسالة يلي وصلتك.' };
    const L = rows[0];
    if (!L.active) return { ok: false, msg: 'هالمفتاح موقوف. تواصل مع أنور عالواتساب.' };
    if (L.expires && new Date(L.expires) < new Date(new Date().toDateString())) return { ok: false, msg: 'هالمفتاح منتهي.' };
    const tools = String(L.tools || '').split(',').map((t) => t.trim());
    if (!tools.includes(BOOK_TOOL)) return { ok: false, msg: 'هالمفتاح للأدوات، مش للكتاب. مفتاح الكورس بيوصلك مع الكتاب.' };
    const fp = await fingerprint();
    if (L.device && L.device !== fp) return { ok: false, msg: 'هالمفتاح مفعّل على تلفون تاني. إذا بدّلت تلفون، تواصل مع أنور ليفكّو.' };
    try { await sb('licenses?code=eq.' + encodeURIComponent(code), { method: 'PATCH',
      body: JSON.stringify({ device: L.device || fp, uses: (L.uses || 0) + 1, last_seen: new Date().toISOString() }) }); } catch (e) {}
    return { ok: true };
  }

  // ---------- the board (18 breakers) ----------
  function board() {
    const done = Object.values(S.rules).filter((r) => r.passed).length;
    const mods = RULES.map((r) => {
      const st = R(r.n).passed ? 'done' : r.n === S.current ? 'now' : 'locked';
      const label = st === 'done' ? 'مبصومة' : st === 'now' ? 'هلّق' : 'مسكّرة';
      return `<div class="mod ${st}" ${st === 'now' ? 'role="button" tabindex="0" data-go' : ''} aria-label="القاعدة ${r.n}: ${esc(r.title)} — ${label}">
        <span class="lever"></span><span class="num">${r.n}</span><span class="lbl">${esc(r.title)}</span></div>`;
    }).join('');
    const cur = rule(S.current);
    $app.innerHTML = `
      <h1>${done === 0 ? 'أهلا ' + esc(S.name.split(' ')[0]) : 'كمّل من وين وقفت'}</h1>
      <p class="muted">هيدا التابلو تبعك: كل قاعدة بتبصمها بيرتفع الديجنتير تبعها.</p>
      <section class="board">
        <div class="board-title"><span>التابلو تبعك</span><span>${done} من ${TOTAL}</span></div>
        <div class="rail">${mods}</div>
      </section>
      <button class="btn volt" id="go">ابدأ القاعدة ${cur.n}: ${esc(cur.title)}</button>
      <button class="btn ghost" id="reset">مش إنت ${esc(S.name.split(' ')[0])}؟ بلّش من جديد</button>`;
    const go = () => { view = 'quiz'; render(); top(); };
    document.getElementById('go').addEventListener('click', go);
    const now = $app.querySelector('[data-go]');
    if (now) { now.addEventListener('click', go); now.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } }); }
    document.getElementById('reset').addEventListener('click', () => {
      if (confirm('أكيد؟ كل التقدم يلي على هالتلفون رح ينمحى.')) { try { localStorage.removeItem(KEY); } catch (e) {} S = null; render(); top(); }
    });
  }

  // ---------- quiz ----------
  function nextIndex(st) {
    if (st.phase === 'learn') return st.queue[0];
    if (st.pending === null || st.pending === undefined) {
      const len = rule(S.current).q.length;
      let i; do { i = Math.floor(Math.random() * len); } while (len > 1 && i === st.last);
      st.pending = i; save();
    }
    return st.pending;
  }

  function quiz() {
    const n = S.current, r = rule(n), st = R(n);
    if (!st.start) { st.start = Date.now(); save(); }
    const qi = nextIndex(st);
    const item = r.q[qi];
    const correct = item.a[0];
    const opts = shuffle(item.a.slice());

    const QN = r.q.length;
    const learned = QN - st.queue.length;
    const progress = st.phase === 'learn'
      ? `<div class="meter" aria-hidden="true">${[...Array(QN)].map((_, i) => `<i class="${i < learned ? 'on' : ''}"></i>`).join('')}</div>
         <div class="phase">${learned} من ${QN} أسئلة جاوبتها صح</div>`
      : `<div class="lamps" aria-hidden="true">${[...Array(STREAK_TARGET)].map((_, i) => `<i class="${i < st.streak ? 'on' : ''}"></i>`).join('')}</div>
         <div class="phase">اختبار البصم: ${st.streak} من ${STREAK_TARGET} صح ورا بعض. غلطة وحدة بتطفّي اللمبات.</div>`;

    $app.innerHTML = `
      <div class="rulehead">
        <div class="tag">القاعدة ${n} من ${TOTAL} · ${esc(r.story)}</div>
        ${mistakeChip()}
        <h2>${esc(r.title)}</h2>
        ${progress}
      </div>
      <div class="qcard">
        <div class="qtext">${esc(item.q)}</div>
        <div id="opts">${opts.map((o, i) => `<button class="opt" data-i="${i}">${esc(o)}</button>`).join('')}</div>
        <div id="fb"></div>
      </div>`;

    const btns = [...$app.querySelectorAll('.opt')];
    btns.forEach((b) => b.addEventListener('click', () => answer(b, opts[+b.dataset.i] === correct)));

    function answer(btn, ok) {
      btns.forEach((b) => { b.disabled = true; });
      if (ok) btn.classList.add('right');   // الغلط ما بيكشف الجواب الصح: الطالب لازم يفكّر
      if (!ok) btn.classList.add('wrong');
      st.answers++;
      let passedNow = false;
      const wasLearn = st.phase === 'learn';
      if (st.phase === 'learn') {
        st.queue.shift();
        if (!ok) { st.mistakes++; st.missed[qi] = (st.missed[qi] || 0) + 1; st.queue.splice(Math.min(REQUEUE_GAP, st.queue.length), 0, qi); }
        if (st.queue.length === 0) { st.phase = 'check'; st.streak = 0; }
      } else {
        st.last = qi; st.pending = null;
        if (ok) { st.streak++; if (st.streak >= STREAK_TARGET) { st.passed = true; st.end = Date.now(); passedNow = true; } }
        else { st.mistakes++; st.missed[qi] = (st.missed[qi] || 0) + 1; st.streak = 0; }
      }
      save();   // بينحفظ قبل ما يطلع الشرح: الريفريش ما بيمحي الغلطة

      const fb = document.getElementById('fb');
      const enteringCheck = wasLearn && st.phase === 'check';
      fb.innerHTML = ok
        ? `<div class="fb ok"><b>✔ صح.</b>${esc(item.why)}</div>`
        : `<div class="fb no"><b>✘ خطأ.</b>${st.phase === 'learn' ? 'فكّر فيه منيح، هالسؤال رح يرجعلك بعد شوي.' : 'انطفت اللمبات. ركّز وبلّش العدّ من جديد.'}</div>`;
      const next = document.createElement('button');
      next.className = 'btn';
      next.textContent = passedNow ? 'ارفع الديجنتير ⚡' : enteringCheck ? `جاوبت الـ ${r.q.length} صح. عاختبار البصم` : 'كمّل';
      next.addEventListener('click', () => { passedNow ? rulePassed(n) : quiz(); top(); });
      fb.appendChild(next);
      next.focus({ preventScroll: true });
      fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    }
  }

  function rulePassed(n) {
    const r = rule(n), st = R(n);
    const last = n === TOTAL;
    if (!last) { S.current = n + 1; } else { S.finishedAt = Date.now(); }
    save();
    report();
    $app.innerHTML = `
      <div class="switch-on">
        <div class="big-lever" aria-hidden="true"></div>
        <h1>بصمت القاعدة ${n}</h1>
        <p>${esc(r.title)}. غلطت فيها ${st.mistakes === 0 ? 'ولا مرة' : st.mistakes + ' ' + (st.mistakes === 1 ? 'مرة' : 'مرات')}.</p>
        ${last ? '<p>هيدي كانت آخر قاعدة. خلّصت الكتاب كلو!</p>' : `<p class="muted">القاعدة ${n + 1} انفتحتلك: ${esc(rule(n + 1).title)}.</p>`}
      </div>
      <button class="btn volt" id="nx">${last ? 'شوف شهادتك' : 'عالقاعدة ' + (n + 1)}</button>
      ${last ? '' : '<button class="btn ghost" id="bd">شوف التابلو</button>'}`;
    document.getElementById('nx').addEventListener('click', () => { view = 'quiz'; render(); top(); });
    const bd = document.getElementById('bd');
    if (bd) bd.addEventListener('click', () => { view = 'board'; render(); top(); });
  }

  // ---------- final: summary PDF + WhatsApp ----------
  let pdfBlob = null;
  const pdfName = () => `ملخص ${S.name} - الكهرباء بالمختصر المفيد.pdf`;

  function totalMistakes() {
    let m = 0; Object.values(S.rules).forEach((st) => { m += st.mistakes || 0; }); return m;
  }
  function challengeOk() { return totalMistakes() <= CHALLENGE_MAX; }
  function mistakeChip() {
    const m = totalMistakes();
    if (m <= CHALLENGE_MAX) return `<div class="chip ${m >= CHALLENGE_MAX - 1 ? 'warn' : ''}">🎁 غلطاتك: ${m} من ${CHALLENGE_MAX}${m === CHALLENGE_MAX ? ' (ولا غلطة كمان!)' : ''}</div>`;
    return `<div class="chip lost">غلطاتك: ${m}. راح خصم التحدّي، بس كمّل لتاخد الشهادة 💪</div>`;
  }

  function totals() {
    let mistakes = 0, answers = 0;
    RULES.forEach((r) => { const st = R(r.n); mistakes += st.mistakes; answers += st.answers; });
    return { mistakes, answers, dur: S.finishedAt - S.startedAt };
  }
  function waText() {
    const t = totals();
    return `مرحبا أستاذ أنور، أنا ${S.name}، رقمي \u2066${S.phone}\u2069.\nخلّصت كورس «الكهرباء بالمختصر المفيد» كلو: ${TOTAL} قاعدة ✅\nمجموع الغلطات: ${t.mistakes} من أصل ${t.answers} جواب.\nبلّشت: ${fmtDate(S.startedAt)}\nخلّصت: ${fmtDate(S.finishedAt)}\n🎁 تحدّي الـ ${CHALLENGE_MAX} غلطات: ${challengeOk() ? 'نجحت ✅ (الكتاب بـ ' + CHALLENGE_PRICE + '$)' : 'ما نجحت'}\nرح ابعتلك ملخص PDF هلّق.\n\n${challengeOk() ? '#تحدي_ناجح' : '#تحدي'}`;
  }

  function finalScreen() {
    const t = totals();
    const step2 = S.textSent;
    $app.innerHTML = `
      <div class="switch-on">
        <div class="big-lever" aria-hidden="true"></div>
        <h1>مبروك ${esc(S.name.split(' ')[0])}! بصمت الكتاب كلو</h1>
        <p>${TOTAL} قاعدة، ${t.mistakes} غلطة من أصل ${t.answers} جواب، بـ ${fmtDur(t.dur)}.</p>
      </div>
      <div class="sendbox">
        <h2>آخر خطوة: ابعت ملخصك لأنور</h2>
        <p class="muted">شهادتك بتنفتحلك بس تبعت الملخص.</p>
        <button class="btn wa" id="s1">1. افتح محادثة أنور وابعت الرسالة</button>
        <button class="btn wa" id="s2" ${step2 ? '' : 'disabled'}>2. ابعت ملف الملخص PDF</button>
        <div class="status" id="st">${step2 ? '' : 'بلّش بالخطوة 1.'}</div>
        <div id="after"></div>
      </div>
      ${challengeBox(t)}`;
    if (S.pdfSent) afterSent();

    document.getElementById('s1').addEventListener('click', () => {
      window.open(`https://api.whatsapp.com/send?phone=${WA_NUMBER}&text=${encodeURIComponent(waText())}`, '_blank');
      S.textSent = true; save();
      const s2 = document.getElementById('s2'); s2.disabled = false;
      document.getElementById('st').textContent = 'بعتت الرسالة؟ هلّق اكبس الخطوة 2، واختار واتساب ← محادثة أنور (' + WA_DISPLAY + ').';
    });
    document.getElementById('s2').addEventListener('click', sendPdf);

    // نحضّر الـ PDF من هلّق لحتى زر المشاركة يشتغل دغري عالتلفون
    buildPdf().then(() => { if (S.textSent) document.getElementById('st').textContent = 'الملخص جاهز. اكبس الخطوة 2.'; })
      .catch(() => { document.getElementById('st').textContent = 'ما قدرنا نحضّر الملف. تأكد إنك متصل بالإنترنت وحدّث الصفحة.'; });
  }

  function challengeBox(t) {
    if (challengeOk()) {
      const msg = `مرحبا أنور 👋\nأنا ${S.name}، رقمي \u2066${S.phone}\u2069.\nخلّصت الكورس بـ ${t.mistakes} ${t.mistakes === 1 ? 'غلطة' : 'غلطات'} بس، وربحت خصم التحدّي 🎁\nبدي كتاب «الكهرباء بالمختصر المفيد» بـ ${CHALLENGE_PRICE}$.\nكيف بدفع؟\n\n#تحدي_ناجح #طلب_شراء`;
      return `<div class="sendbox win">
        <h2>🎁 ربحت خصم التحدّي!</h2>
        <p>خلّصت بـ ${t.mistakes} ${t.mistakes === 1 ? 'غلطة' : 'غلطات'} بس. الكتاب إلك بـ <b>${CHALLENGE_PRICE}$</b> بدل <s>${BOOK_FULL}$</s> (خصم 30%).</p>
        <a class="btn volt" href="https://api.whatsapp.com/send?phone=${WA_NUMBER}&text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">اطلب الكتاب بـ ${CHALLENGE_PRICE}$</a>
        <p class="muted" style="margin-top:10px">عندك الكتاب من قبل؟ ما عليك شي، شهادتك محفوظة.</p>
      </div>`;
    }
    return `<div class="sendbox">
        <h2>قرّبت!</h2>
        <p class="muted">غلطت ${t.mistakes} مرات، وخصم التحدّي للي بيغلط ${CHALLENGE_MAX} أو أقل. بس الكتاب لسا عليه خصم الإطلاق، وبيفيدك تثبّت يلي غلطت فيه.</p>
        <a class="btn volt" href="../#books">شوف الكتاب</a>
      </div>`;
  }

  async function sendPdf() {
    const st = document.getElementById('st');
    if (!pdfBlob) { st.textContent = 'عم نحضّر الملخص، لحظة…'; try { await buildPdf(); } catch (e) { st.textContent = 'ما قدرنا نحضّر الملف. حدّث الصفحة وجرّب مرة تانية.'; return; } }
    const file = new File([pdfBlob], pdfName(), { type: 'application/pdf' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'ملخص الكورس', text: `ملخص ${S.name} — الكهرباء بالمختصر المفيد` });
        S.pdfSent = true; save(); afterSent();
      } catch (e) {
        st.textContent = 'ما انبعت الملف. اكبس الخطوة 2 مرة تانية واختار واتساب ← محادثة أنور.';
      }
    } else {
      // كمبيوتر أو متصفح ما بيدعم المشاركة: منزّل الملف ومنفتح المحادثة
      download(pdfBlob, pdfName());
      window.open(`https://wa.me/${WA_NUMBER}`, '_blank');
      st.innerHTML = `نزل الملف عندك باسم «${esc(pdfName())}». بمحادثة أنور اكبس 📎 وارفقو.`;
      S.pdfSent = true; save(); afterSent();
    }
  }

  function afterSent() {
    const box = document.getElementById('after');
    if (!box) return;
    box.innerHTML = `<p class="status">✔ تمام، وصل الملخص لأنور (إذا ما وصل، كرّر الخطوة 2).</p>
      <button class="btn volt" id="mine">نزّل شهادتك والملخص إلك</button>
      <div class="sendbox win" style="margin-top:14px">
        <h2>⚡ انفتحلك الكورس التاني</h2>
        <p>خلّصت الأساس. هلّق فيك تكمّل عكورس «الكلاسيك كنترول بالمختصر المفيد»: 25 قاعدة على بناية وحدة، من الكونتاكتور لمضخة الحريق.</p>
        <a class="btn volt" href="../classic/">كمّل عكورس الكلاسيك كنترول</a>
      </div>`;
    document.getElementById('mine').addEventListener('click', async () => { if (!pdfBlob) await buildPdf(); download(pdfBlob, pdfName()); });
  }

  function download(blob, name) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }

  // ---------- PDF pages ----------
  function pagesHtml() {
    const t = totals();
    const rows = RULES.map((r) => {
      const st = R(r.n);
      return `<tr class="${st.mistakes >= 3 ? 'hot' : ''}"><td>${r.n}</td><td>${esc(r.title)}</td><td>${st.mistakes}</td><td>${st.answers}</td><td>${fmtDur(st.end - st.start)}</td></tr>`;
    }).join('');
    const weak = [];
    RULES.forEach((r) => { const st = R(r.n); Object.entries(st.missed).forEach(([qi, c]) => weak.push({ n: r.n, c, q: r.q[qi] })); });
    weak.sort((a, b) => b.c - a.c);
    const weakHtml = weak.length
      ? `<ol class="weak">${weak.slice(0, 14).map((w) => `<li><b>القاعدة ${w.n} — غلط ${w.c} ${w.c === 1 ? 'مرة' : 'مرات'}:</b> ${esc(w.q.q)}<br><span style="color:#0E8F6E">الجواب الصح: ${esc(w.q.a[0])}</span></li>`).join('')}</ol>`
      : '<p>ولا غلطة بكل الكورس. شغل معلّم!</p>';
    const foot = (p) => `<div class="foot"><span>الكهرباء بالمختصر المفيد — MrElectroAI</span><span>صفحة ${p} من 3</span></div>`;
    return `
      <div class="pg cert">
        <div class="bolt"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linejoin="round"><path d="M13 2 3 14h8l-1 8 10-12h-8l1-8z"/></svg></div>
        <h1>شهادة إتمام</h1>
        <p>هالشهادة بتأكّد إنو</p>
        <div class="name">${esc(S.name)}</div>
        <p>بصم كل القواعد الـ ${TOTAL} بكتاب «الكهرباء بالمختصر المفيد»، وجاوب على كل الأسئلة صح، وعدّى اختبار البصم (${STREAK_TARGET} أجوبة صح ورا بعض) بكل قاعدة.</p>
        <p style="font-size:17px;color:#5B6B7D">تاريخ الإتمام: ${fmtDate(S.finishedAt)}</p>
        <div class="sig">أنور الحسن الجاسم — <b>MrElectroAI</b></div>
      </div>
      <div class="pg">
        <h2>ملخص شغل الطالب</h2>
        <div class="facts">
          <div><b>الاسم:</b>${esc(S.name)}</div>
          <div><b>التلفون:</b><bdi dir="ltr">${esc(S.phone)}</bdi></div>
          <div><b>بلّش:</b>${fmtDate(S.startedAt)}</div>
          <div><b>خلّص:</b>${fmtDate(S.finishedAt)}</div>
          <div><b>المدة الكاملة:</b>${fmtDur(t.dur)}</div>
          <div><b>الغلطات:</b>${t.mistakes} من ${t.answers} جواب</div>
          <div><b>تحدّي الخصم:</b>${challengeOk() ? 'نجح ✅ (' + CHALLENGE_MAX + ' غلطات أو أقل)' : 'ما نجح'}</div>
        </div>
        <table>
          <thead><tr><th>#</th><th>القاعدة</th><th>غلطات</th><th>أجوبة</th><th>الوقت</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <p style="font-size:13px;color:#5B6B7D;margin-top:10px">الصفوف الحمرا: قواعد غلط فيها 3 مرات أو أكتر. «الوقت» من أول سؤال لآخر سؤال بالقاعدة، ومنها الاستراحات.</p>
        ${foot(2)}
      </div>
      <div class="pg">
        <h2>نقاط الضعف: الأسئلة يلي غلط فيها أكتر شي</h2>
        ${weakHtml}
        ${foot(3)}
      </div>`;
  }

  async function buildPdf() {
    if (pdfBlob) return pdfBlob;
    if (!window.html2canvas || !window.jspdf) throw new Error('libs');
    const stage = document.getElementById('pdfStage');
    stage.innerHTML = pagesHtml();
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
    const pages = [...stage.querySelectorAll('.pg')];
    for (let i = 0; i < pages.length; i++) {
      const canvas = await html2canvas(pages[i], { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false });
      if (i) pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.9), 'JPEG', 0, 0, 210, 297);
    }
    stage.innerHTML = '';
    pdfBlob = pdf.output('blob');
    return pdfBlob;
  }

  render();
  if (S) report();
})();
