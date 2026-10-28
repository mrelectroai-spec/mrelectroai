/* الطاقة الشمسية بالمختصر المفيد — كورس تفاعلي
   قاعدة قاعدة: كل سؤال غلط بيرجع، وبعدين 5 صح ورا بعض لحتى تنفتح القاعدة يلي بعدها. */
(function () {
  'use strict';

  const WA_NUMBER = '96179434479';           // رقم أنور (واتساب)
  const WA_DISPLAY = '+961 79 434 479';
  const CFG = window.COURSE_CONFIG || {};
  const STREAK_TARGET = CFG.streak || 5;                    // أسئلة صح ورا بعض بآخر كل قاعدة
  const REQUEUE_GAP = 3;                      // السؤال الغلط بيرجع بعد كم سؤال
  const KEY = CFG.storageKey || 'solar-course-v1';
  const BOOK = CFG.book || 'الطاقة الشمسية بالمختصر المفيد';
  const LAB = CFG.lab || '../lab/#';
  const CHALLENGE = CFG.challenge === true;   // التحدّي (خصم عالكتاب) مطفي لهالكورس

  // ---------- الشرط: لازم يخلّص كورس الكتاب الأول ----------
  const PRE_KEY = CFG.preKey || 'electro-course-v1';   // نفس مفتاح الكورس الأول (نفس الموقع)
  const PRE_URL = CFG.preUrl || '../course/';
  const PRE_TOTAL = 18;
  const GATE = CFG.gate === true;   // الشرط مطفي: الكورس مفتوح للكل. لترجّعو: window.COURSE_CONFIG = { gate: true }
  const ADVICE_AT = 4;   // من كم غلطة بقاعدة منقلّو يرجع للكورس الأول
  const BASICS = { 1: 'الفولت، الأمبير، والأوم', 2: 'الشرايط التلاتة (فاز، نتر، تير)', 4: 'سماكة الشرايط', 5: 'الديجنتير العادي والدفرانسير',
    8: 'حسبة الوات والأمبير', 9: 'التايمر والفوتوسيل', 10: 'الكونتاكتور', 13: 'طابة الأتوماتيك', 14: 'حماية الفولت (البرتيزار)',
    16: 'ترتيب التابلو', 17: 'كيف تلاقي العطل', 18: 'الأخطاء الـ 6 القاتلة' };
  // كل قاعدة بالطاقة الشمسية، شو بتحتاج من الكتاب الأول
  const NEEDS = { 1: [1, 8], 2: [1, 8], 3: [1], 4: [1], 6: [8], 7: [1, 8], 9: [8], 10: [8], 11: [8], 12: [5, 16], 13: [14], 14: [8],
    15: [16], 16: [16, 10], 17: [2], 20: [13, 10], 21: [16], 22: [16], 23: [5], 24: [4, 1], 25: [5], 26: [14], 27: [2, 5],
    29: [18], 30: [17], 31: [17], 32: [18] };
  const LEAD = (() => { try { return JSON.parse(localStorage.getItem('mea_lead') || 'null') || {}; } catch (e) { return {}; } })();
  function preData() { try { const raw = localStorage.getItem(PRE_KEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; } }
  function preStatus() {
    const o = preData();
    const passed = o && o.rules ? Object.values(o.rules).filter((r) => r && r.passed).length : 0;
    return { done: !!(o && o.finishedAt), passed, started: !!o, name: o && o.name, phone: o && o.phone };
  }
  function adviceHtml(n) {
    const list = (NEEDS[n] && NEEDS[n].length ? NEEDS[n] : [1, 8]).map((k) => `<li>القاعدة ${k}: ${esc(BASICS[k] || '')}</li>`).join('');
    return `<div class="advice"><b>💡 نصيحة من أنور:</b> عم تغلط كتير بهالقاعدة. غالباً الأساس من الكتاب الأول مش ثابت بعد.
      ارجع راجع هول بالكورس الأول، وبعدين كمّل هون:<ul>${list}</ul>
      <a class="tool" href="${PRE_URL}" target="_blank" rel="noopener">افتح الكورس الأول</a></div>`;
  }
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
  const COURSE_ID = 'solar';
  const CHALLENGE_ON = CHALLENGE;

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
    progress(true);
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

  // ---------- وين وصل بالضبط (بيتحدّث مع كل جواب، كل 15 ثانية بالأكتر) ----------
  function where() {
    if (S.finishedAt) return { cur_rule: null, cur_phase: 'done', cur_done: null, cur_of: null };
    const n = S.current, st = S.rules[n], q = RULES[n - 1] ? RULES[n - 1].q.length : 0;
    if (!st || !st.start) return { cur_rule: n, cur_phase: 'new', cur_done: 0, cur_of: q };
    if (st.phase === 'learn') return { cur_rule: n, cur_phase: 'learn', cur_done: Math.max(0, q - st.queue.length), cur_of: q };
    return { cur_rule: n, cur_phase: 'check', cur_done: st.streak || 0, cur_of: STREAK_TARGET };
  }
  let progT = 0, progTimer = null;
  function progress(now) {
    if (!S || !S.name) return;
    clearTimeout(progTimer);
    const wait = now ? 0 : Math.max(0, 15000 - (Date.now() - progT));
    progTimer = setTimeout(() => {
      progT = Date.now();
      const x = snapshot(); let vid = null; try { vid = localStorage.getItem('mea_vid'); } catch (e) {}
      const body = Object.assign({ client_id: cid(), course: COURSE_ID, vid, name: String(S.name).slice(0, 80), phone: String(S.phone).slice(0, 25),
        rules_done: x.done, total: TOTAL, mistakes: x.m, answers: x.a,
        started_at: S.startedAt ? new Date(S.startedAt).toISOString() : null, finished_at: S.finishedAt ? new Date(S.finishedAt).toISOString() : null,
        data: { rules: x.rules, weak: x.weak, challenge: CHALLENGE_ON ? challengeOk() : null, src: (() => { try { return localStorage.getItem('mea_src'); } catch (e) { return null; } })() } }, where());
      fetch(SB_URL + '/rest/v1/rpc/save_progress', { method: 'POST', keepalive: true,
        headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ p: body }) }).catch(() => {});
    }, wait);
  }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && progTimer) progress(true); });
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
    if (GATE && !S && !preStatus().done) return gate();
    if (!S) return welcome();
    if (GATE && !S.pre && !preStatus().done) return gate();
    if (NEED_KEY && !S.key) return keyOnly();
    if (S.finishedAt) return finalScreen();
    if (view === 'quiz') return quiz();
    return board();
  }

  // ---------- الشرط ----------
  function gate() {
    const p = preStatus();
    const pct = Math.round(100 * p.passed / PRE_TOTAL);
    $app.innerHTML = `
      <img class="cover" src="cover.jpg" alt="غلاف كتاب ${BOOK}">
      <h1>بلّش بالكورس الأول</h1>
      <p>كورس الطاقة الشمسية مبني عالكتاب الأول «الكهرباء بالمختصر المفيد»: الفولت والأمبير، حسبة الوات، الشرايط، القواطع والتابلو.
      إذا هودي مش ثابتين، حسابات السولار رح تطلع صعبة وما رح تفهم معك. لهيك بينفتح بس تخلّص الكورس الأول.</p>
      <div class="challenge">${p.started
        ? `<b>${p.name ? esc(p.name.split(' ')[0]) + '، ' : ''}وصلت للقاعدة ${Math.min(p.passed + 1, PRE_TOTAL)} من ${PRE_TOTAL} بالكورس الأول.</b>
           <div class="premeter" aria-hidden="true"><i style="width:${pct}%"></i></div>
           <span class="muted">باقي ${PRE_TOTAL - p.passed} ${PRE_TOTAL - p.passed === 1 ? 'قاعدة' : 'قواعد'}، وبعدها بينفتحلك كورس الطاقة الشمسية لحالو.</span>`
        : `<b>لسّا ما بلّشت الكورس الأول على هالتلفون.</b> ${PRE_TOTAL} قاعدة، ومجاني.`}</div>
      <a class="btn volt" href="${PRE_URL}">${p.started ? 'كمّل الكورس الأول' : 'ابدأ الكورس الأول'}</a>
      <p class="muted" style="margin-top:16px">خلّصت الكورس الأول على تلفون تاني؟ لازم تكمّل الاتنين عنفس التلفون، أو ابعت لأنور عالواتساب <bdi dir="ltr">${WA_DISPLAY}</bdi>.</p>`;
  }

  // ---------- welcome ----------
  function welcome() {
    $app.innerHTML = `
      <img class="cover" src="cover.jpg" alt="غلاف كتاب ${BOOK}">
      <h1>بصّم الكتاب قاعدة قاعدة</h1>
      ${CFG.banner ? `<p class="err">${CFG.banner}</p>` : ''}
      <p>رح نسألك ${RULES[0].q.length} أسئلة على كل قاعدة من الـ ${TOTAL}. كل سؤال بتغلط فيه بيرجعلك لحتى تجاوبو صح، وبالآخر لازم تجاوب ${STREAK_TARGET} أسئلة صح ورا بعض. ما بتنفتحلك القاعدة يلي بعدها إلا بس تكون باصم يلي قبلها.</p>
      ${CHALLENGE ? `<div class="challenge"><b>🎁 التحدّي:</b> خلّص الـ ${RULES.length * RULES[0].q.length} سؤال بـ ${CHALLENGE_MAX} غلطات أو أقل، وخود الكتاب بخصم: <b>${CHALLENGE_PRICE}$</b> بدل ${BOOK_FULL}$.</div>` : `<div class="challenge"><b>${RULES.length * RULES[0].q.length} سؤال</b> من 6 أنواع: مفهوم، موقف، عطل، أرقام، مخطط، وسلامة. وبكل قاعدة فيك تفتح رسمتها من الكتاب، وتجرّب قطعتها بمختبر القطع.</div>`}
      <p class="muted">بآخر الكورس بتبعت ملخص شغلك لأنور عالواتساب، وإذا خلّصت بـ5 غلطات أو أقل، أنور بيبعتلك شهادة باسمك 🎓</p>
      ${!preStatus().done ? `<p class="muted">جديد بالكهربا؟ الأحسن تبلّش بـ<a href="${PRE_URL}">كورس الكتاب الأول</a> (الفولت والأمبير والتابلو)، بس فيك تبلّش هون إذا حابب.</p>` : ''}
      <form id="f" novalidate>
        <label for="nm">اسمك الكامل</label>
        <input id="nm" type="text" autocomplete="name" placeholder="مثلاً: محمد علي" required value="${esc(preStatus().name || LEAD.name || '')}">
        <label for="ph">رقم تلفونك (واتساب)</label>
        <input id="ph" type="tel" inputmode="tel" autocomplete="tel" placeholder="مثلاً: 70 123 456" dir="ltr" required value="${esc(preStatus().phone || LEAD.phone || '')}">
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
      if (!NEED_KEY) { S = fresh(name, phone); S.pre = true; save(); report(); view = 'board'; render(); top(); return; }
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
    const fp = await fingerprint();
    let r;
    try { r = await sb('rpc/verify_license', { method: 'POST', body: JSON.stringify({ p_code: code, p_device: fp, p_tool: BOOK_TOOL }) }); }
    catch (e) { return { ok: false, msg: 'ما قدرنا نتحقق من المفتاح. تأكد إنك متصل بالإنترنت وجرّب مرة تانية.' }; }
    if (r && r.ok) return { ok: true };
    return { ok: false, msg: (r && r.msg) || 'المفتاح غلط. تأكد منو بالرسالة يلي وصلتك.' };
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
    if (!st.start) { st.start = Date.now(); save(); progress(); }
    const qi = nextIndex(st);
    const item = r.q[qi];
    const correct = item.a[0];
    const opts = shuffle(item.a.slice());
    const GL = window.glossPage ? window.glossPage(esc) : { h: esc, list: () => '' };

    const QN = r.q.length;
    const learned = QN - st.queue.length;
    const progHtml = st.phase === 'learn'
      ? `<div class="meter" aria-hidden="true">${[...Array(QN)].map((_, i) => `<i class="${i < learned ? 'on' : ''}"></i>`).join('')}</div>
         <div class="phase">${learned} من ${QN} أسئلة جاوبتها صح</div>`
      : `<div class="lamps" aria-hidden="true">${[...Array(STREAK_TARGET)].map((_, i) => `<i class="${i < st.streak ? 'on' : ''}"></i>`).join('')}</div>
         <div class="phase">اختبار البصم: ${st.streak} من ${STREAK_TARGET} صح ورا بعض. غلطة وحدة بتطفّي اللمبات.</div>`;

    $app.innerHTML = `
      <div class="rulehead">
        <div class="tag">القاعدة ${n} من ${TOTAL}${r.story ? ' · ' + GL.h(r.story) : ''}</div>
        ${mistakeChip()}
        <h2>${GL.h(r.title)}</h2>
        ${progHtml}
        <div class="tools">
          ${typeof FIGS !== 'undefined' && FIGS[n] ? '<button class="tool" id="figBtn" type="button">📐 شوف رسمة القاعدة</button>' : ''}
          ${r.lab ? `<a class="tool" href="${LAB}${r.lab}" target="_blank" rel="noopener">🧩 جرّب القطعة بالمختبر</a>` : ''}
        </div>
      </div>
      <div class="qcard">
        ${item.t ? `<div class="qtype">${esc(item.t)}</div>` : ''}
        <div class="qtext">${GL.h(item.q)}</div>
        <div id="opts">${opts.map((o, i) => `<button class="opt" data-i="${i}">${GL.h(o)}</button>`).join('')}</div>
        <div id="fb"></div>
        <div id="gl">${GL.list(false)}</div>
      </div>`;

    const figBtn = document.getElementById('figBtn');
    if (figBtn) figBtn.addEventListener('click', () => openFig(n));
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
      progress();

      const fb = document.getElementById('fb');
      const enteringCheck = wasLearn && st.phase === 'check';
      fb.innerHTML = ok
        ? `<div class="fb ok"><b>✔ صح.</b>${GL.h(item.why)}</div>`
        : `<div class="fb no"><b>✘ خطأ.</b>${st.phase === 'learn' ? 'فكّر فيه منيح، هالسؤال رح يرجعلك بعد شوي.' : 'انطفت اللمبات. ركّز وبلّش العدّ من جديد.'}</div>`;
      if (!ok && st.mistakes >= ADVICE_AT && !st.advised) { st.advised = true; save(); fb.insertAdjacentHTML('beforeend', adviceHtml(n)); }
      const $gl = document.getElementById('gl'); if ($gl) $gl.innerHTML = GL.list(ok);
      const next = document.createElement('button');
      next.className = 'btn';
      next.textContent = passedNow ? 'ارفع الديجنتير ⚡' : enteringCheck ? `جاوبت الـ ${r.q.length} صح. عاختبار البصم` : 'كمّل';
      next.addEventListener('click', () => { passedNow ? rulePassed(n) : quiz(); top(); });
      fb.appendChild(next);
      next.focus({ preventScroll: true });
      fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    }
  }

  function openFig(n) {
    const f = typeof FIGS !== 'undefined' ? FIGS[n] : null; if (!f) return;
    const d = document.createElement('div');
    d.className = 'figmodal'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true');
    d.innerHTML = `<div class="figbox"><button class="figx" type="button" aria-label="سكّر">×</button>
      <div class="figsvg">${f.svg}</div><div class="figcap">${esc(f.cap)}</div></div>`;
    const close = () => { d.remove(); document.removeEventListener('keydown', onKey); };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    d.addEventListener('click', (e) => { if (e.target === d) close(); });
    d.querySelector('.figx').addEventListener('click', close);
    document.addEventListener('keydown', onKey);
    document.body.appendChild(d);
    d.querySelector('.figx').focus();
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
      ${st.mistakes >= ADVICE_AT ? adviceHtml(n) : ''}
      <button class="btn volt" id="nx">${last ? 'شوف نتيجتك' : 'عالقاعدة ' + (n + 1)}</button>
      ${last ? '' : '<button class="btn ghost" id="bd">شوف التابلو</button>'}`;
    document.getElementById('nx').addEventListener('click', () => { view = 'quiz'; render(); top(); });
    const bd = document.getElementById('bd');
    if (bd) bd.addEventListener('click', () => { view = 'board'; render(); top(); });
  }

  // ---------- final: summary PDF + WhatsApp ----------
  let pdfBlob = null;
  const pdfName = () => `ملخص ${S.name} - ${BOOK}.pdf`;

  function totalMistakes() {
    let m = 0; Object.values(S.rules).forEach((st) => { m += st.mistakes || 0; }); return m;
  }
  function challengeOk() { return totalMistakes() <= CHALLENGE_MAX; }
  function mistakeChip() {
    const m = totalMistakes();
    if (!CHALLENGE) return `<div class="chip">غلطاتك لهلّق: ${m}</div>`;
    if (m <= CHALLENGE_MAX) return `<div class="chip ${m >= CHALLENGE_MAX - 1 ? 'warn' : ''}">🎁 غلطاتك: ${m} من ${CHALLENGE_MAX}${m === CHALLENGE_MAX ? ' (ولا غلطة كمان!)' : ''}</div>`;
    return `<div class="chip lost">غلطاتك: ${m}. راح خصم التحدّي، بس كمّل للآخر 💪</div>`;
  }

  function totals() {
    let mistakes = 0, answers = 0;
    RULES.forEach((r) => { const st = R(r.n); mistakes += st.mistakes; answers += st.answers; });
    return { mistakes, answers, dur: S.finishedAt - S.startedAt };
  }
  function waText() {
    const t = totals();
    const ch = CHALLENGE ? `\n🎁 تحدّي الـ ${CHALLENGE_MAX} غلطات: ${challengeOk() ? 'نجحت ✅' : 'ما نجحت'}` : '';
    return `مرحبا أستاذ أنور، أنا ${S.name}، رقمي \u2066${S.phone}\u2069.\nخلّصت كورس «${BOOK}» كلو: ${TOTAL} قاعدة ✅\nمجموع الغلطات: ${t.mistakes} من أصل ${t.answers} جواب.\nبلّشت: ${fmtDate(S.startedAt)}\nخلّصت: ${fmtDate(S.finishedAt)}${ch}\nرح ابعتلك ملخص PDF هلّق.\n\n#كورس_الطاقة_الشمسية`;
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
        <p class="muted">بعد ما تبعت الملخص، أنور بيشوف نتيجتك. وإذا غلطاتك 5 أو أقل، بيبعتلك شهادة باسمك 🎓</p>
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
    if (!CHALLENGE) {
      const msg = `مرحبا أنور 👋\nأنا ${S.name}، رقمي \u2066${S.phone}\u2069.\nخلّصت كورس «${BOOK}» وبدي الكتاب.\nكيف بطلبو؟\n\n#طلب_شراء`;
      return `<div class="sendbox">
        <h2>كمّل مع الكتاب والمختبر</h2>
        <p class="muted">الكتاب فيه كل قاعدة بصفحتين، مع رسمة وأسرار الورشة. والمختبر فيه القطع بالـ3D.</p>
        <a class="btn volt" href="https://api.whatsapp.com/send?phone=${WA_NUMBER}&text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">اطلب الكتاب عالواتساب</a>
        <a class="btn ghost" href="${LAB.replace('#', '')}" target="_blank" rel="noopener">افتح مختبر القطع</a>
      </div>`;
    }
    if (challengeOk()) {
      const msg = `مرحبا أنور 👋\nأنا ${S.name}، رقمي \u2066${S.phone}\u2069.\nخلّصت الكورس بـ ${t.mistakes} ${t.mistakes === 1 ? 'غلطة' : 'غلطات'} بس، وربحت خصم التحدّي 🎁\nبدي كتاب «${BOOK}» بـ ${CHALLENGE_PRICE}$.\nكيف بدفع؟\n\n#تحدي_ناجح #طلب_شراء`;
      return `<div class="sendbox win">
        <h2>🎁 ربحت خصم التحدّي!</h2>
        <p>خلّصت بـ ${t.mistakes} ${t.mistakes === 1 ? 'غلطة' : 'غلطات'} بس. الكتاب إلك بـ <b>${CHALLENGE_PRICE}$</b> بدل <s>${BOOK_FULL}$</s> (خصم 30%).</p>
        <a class="btn volt" href="https://api.whatsapp.com/send?phone=${WA_NUMBER}&text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">اطلب الكتاب بـ ${CHALLENGE_PRICE}$</a>
        <p class="muted" style="margin-top:10px">عندك الكتاب من قبل؟ ما عليك شي، نتيجتك محفوظة.</p>
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
        await navigator.share({ files: [file], title: 'ملخص الكورس', text: `ملخص ${S.name} — ${BOOK}` });
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
      <button class="btn volt" id="mine">نزّل ملخص نتيجتك</button>`;
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
      ? `<ol class="weak">${weak.slice(0, 14).map((w) => `<li><b>القاعدة ${w.n}${w.q.t ? ' · ' + esc(w.q.t) : ''} — غلط ${w.c} ${w.c === 1 ? 'مرة' : 'مرات'}:</b> ${esc(w.q.q)}<br><span style="color:#0E8F6E">الجواب الصح: ${esc(w.q.a[0])}</span></li>`).join('')}</ol>`
      : '<p>ولا غلطة بكل الكورس. شغل معلّم!</p>';
    const rev = new Set(); RULES.forEach((r) => { if (R(r.n).mistakes >= ADVICE_AT) (NEEDS[r.n] || []).forEach((k) => rev.add(k)); });
    const revHtml = rev.size ? `<h2 style="margin-top:18px">بيفيدو يراجع من الكتاب الأول</h2><p>${[...rev].sort((a, b) => a - b).map((k) => `القاعدة ${k}: ${esc(BASICS[k] || '')}`).join(' · ')}</p>` : '';
    const foot = (p) => `<div class="foot"><span>${BOOK} — MrElectroAI</span><span>صفحة ${p} من 2</span></div>`;
    return `
      <div class="pg">
        <h2>ملخص شغل الطالب</h2>
        <div class="facts">
          <div><b>الاسم:</b>${esc(S.name)}</div>
          <div><b>التلفون:</b><bdi dir="ltr">${esc(S.phone)}</bdi></div>
          <div><b>بلّش:</b>${fmtDate(S.startedAt)}</div>
          <div><b>خلّص:</b>${fmtDate(S.finishedAt)}</div>
          <div><b>المدة الكاملة:</b>${fmtDur(t.dur)}</div>
          <div><b>الغلطات:</b>${t.mistakes} من ${t.answers} جواب</div>
          ${CHALLENGE ? `<div><b>تحدّي الخصم:</b>${challengeOk() ? 'نجح ✅ (' + CHALLENGE_MAX + ' غلطات أو أقل)' : 'ما نجح'}</div>` : `<div><b>نسبة الصح:</b>${t.answers ? Math.round(100 * (t.answers - t.mistakes) / t.answers) : 0}%</div>`}
        </div>
        <table>
          <thead><tr><th>#</th><th>القاعدة</th><th>غلطات</th><th>أجوبة</th><th>الوقت</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <p style="font-size:13px;color:#5B6B7D;margin-top:10px">الصفوف الحمرا: قواعد غلط فيها 3 مرات أو أكتر. «الوقت» من أول سؤال لآخر سؤال بالقاعدة، ومنها الاستراحات.</p>
        ${foot(1)}
      </div>
      <div class="pg">
        <h2>نقاط الضعف: الأسئلة يلي غلط فيها أكتر شي</h2>
        ${weakHtml}
        ${revHtml}
        ${foot(2)}
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
