// MrElectroAI: مساعد AI + ترجمة الموقع للإنجليزي (مع كاش بالداتابيز)
const KEY = Deno.env.get("GEMINI_API_KEY") || "";
const MODELS = (Deno.env.get("GEMINI_MODEL") || "gemini-3.8-flash,gemini-flash-latest").split(",").map((s) => s.trim()).filter(Boolean);
const SB = Deno.env.get("SUPABASE_URL")!;
const SR = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });

const B = "https://mrelectroai-spec.github.io/mrelectroai/";
const SYSTEM = `You are "مساعد MrElectroAI", the assistant inside the MrElectroAI app and website by Anwar Al-Hasan Al-Jasem, an electrician and trainer in Lebanon (13 years of experience).
Language: reply in Lebanese Arabic dialect (simple, friendly, short) unless the user writes in English, then reply in simple English. Keep answers short: 2-6 short lines.
Your job: understand what the visitor needs, answer briefly, and send them to the right page. Always end with the 1-2 most useful links.
Links: write them as markdown [label](url) using ONLY these URLs:
- Solar wiring lab (pick inverter + battery, wire it, run it, program the screen): ${B}sim/
- 3D parts lab (24 classic-control and solar parts, rotate, see inside, TEST): ${B}lab/
- Placement quiz (6 questions, tells you where to start): ${B}quiz.html
- Free electricity course (180 questions, 18 rules, beginners): ${B}course/
- Free classic control course (250 questions, 25 rules: contactors, relays, motor circuits): ${B}classic/
- Free solar course (320 questions, 32 rules, for installers): ${B}solar/
- Free book samples to download: ${B}sample/
- All technician tools: ${B}tools/
- Solar system sizing (loads → inverter, batteries, panels, cables): ${B}tools/load/
- Roof measuring from satellite + panel layout: ${B}tools/roof/
- Solar price quote PDF for a customer: ${B}tools/quote/
- Inverter settings guide (Felicity, Growatt, Voltronic): ${B}tools/inverters/
- Deye hybrid settings, breakers, cables, fault codes: ${B}tools/deye/
- Transformer calculator: ${B}tools/transformer/
- Phase distribution / circuit numbering: ${B}tools/wirephase/
- Materials inventory list for a job (free): ${B}tools/jarde/
- Buy the books (PDF) / in-person course / ask Anwar / hire him: https://wa.me/96179434479
Books (series «بالمختصر المفيد», PDF): 1) الكهرباء بالمختصر المفيد (18 rules, beginners). 2) الكلاسيك كنترول بالمختصر المفيد (25 rules). 3) الطاقة الشمسية بالمختصر المفيد (32 rules). Buy on WhatsApp; payment by Whish, OMT, USDT or bank transfer. Do not invent prices: say Anwar will tell them on WhatsApp.
Electrician course «من الصفر للاحتراف»: PDF, videos, or in-person with practical training (in-person: 30 hours, $300).
Certificates: given by Anwar personally only to students who finish a book's quiz course with 5 mistakes or fewer.
Technical questions: answer correctly and briefly. Safety first: always say to switch off power before working; for dangerous or complex work recommend a qualified electrician (or contacting Anwar). Never give instructions to bypass protection devices.
If you don't know, say so and suggest WhatsApp. Do not discuss topics unrelated to electricity, solar, the app, the books or courses; politely bring the talk back.`;

async function gemini(system: string, contents: unknown[], opts: { json?: boolean; max?: number; temp?: number } = {}) {
  let last = "";
  for (const m of MODELS) {
    let think = true;
    for (let att = 0; att < 4; att++) {
      let r: Response;
      try {
        r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${KEY}`, {
          method: "POST",
          signal: AbortSignal.timeout(opts.json ? 50000 : 40000),
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: system }] },
            contents,
            generationConfig: {
              temperature: opts.temp ?? 0.4, maxOutputTokens: opts.max ?? 2048,
              ...(opts.json ? { responseMimeType: "application/json" } : {}),
              ...(think ? { thinkingConfig: { thinkingLevel: "low" } } : {}),
            },
          }),
        });
      } catch (e) { last = `${m} fetch ${String(e).slice(0, 120)}`; console.error(last); break; }
      if (r.ok) {
        const d = await r.json();
        const t = (d?.candidates?.[0]?.content?.parts || []).filter((p: { thought?: boolean }) => !p.thought).map((p: { text?: string }) => p.text || "").join("").trim();
        if (t) return t;
        last = `${m} empty ${JSON.stringify(d).slice(0, 200)}`;
        console.error(last);
        break;
      }
      last = `${m} ${r.status} ${(await r.text()).slice(0, 300)}`;
      console.error(last);
      if (r.status === 400 && think) { think = false; continue; }
      if ((r.status === 503 || r.status === 429 || r.status === 500) && att < 3) { await new Promise((ok) => setTimeout(ok, 1200 * (att + 1))); continue; }
      break;
    }
    if (/ 40[13] /.test(last)) break;
  }
  throw new Error(last);
}

async function sha(s: string) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("").slice(0, 40);
}
const rest = (path: string, init: RequestInit = {}) =>
  fetch(`${SB}/rest/v1/${path}`, { ...init, headers: { apikey: SR, Authorization: `Bearer ${SR}`, "Content-Type": "application/json", ...(init.headers || {}) } });

async function translate(texts: string[]) {
  const hs = await Promise.all(texts.map(sha));
  const map = new Map<string, string>();
  const uniq = [...new Set(hs)];
  for (let i = 0; i < uniq.length; i += 80) {
    const r = await rest(`tr_cache?select=h,en&h=in.(${uniq.slice(i, i + 80).join(",")})`);
    if (r.ok) for (const row of await r.json()) map.set(row.h, row.en);
  }
  const miss: number[] = [];
  const seen = new Set<string>();
  hs.forEach((h, i) => { if (!map.has(h) && !seen.has(h)) { seen.add(h); miss.push(i); } });
  if (miss.length && KEY) {
    for (let i = 0; i < miss.length; i += 40) {
      const part = miss.slice(i, i + 40);
      const src = part.map((k) => texts[k]);
      let out = "";
      try {
        out = await gemini(
        "You translate Arabic (often Lebanese dialect) website/app UI text about electricity, solar energy, classic control (contactors, relays, motors), books and courses into natural, clear English for technicians. Keep numbers, units, emojis, symbols, punctuation, brand and model names, and English words as they are. Keep it short like UI text. Input is a JSON array of strings. Output ONLY a JSON array of English strings, same length and same order.",
        [{ role: "user", parts: [{ text: JSON.stringify(src) }] }],
        { json: true, temp: 0.1, max: 8192 },
      );
      } catch (e) { console.error("tr", String(e).slice(0, 200)); break; }
      let arr: unknown;
      try { arr = JSON.parse(out); } catch { arr = null; }
      if (!Array.isArray(arr) || arr.length !== src.length) continue;
      const rows = part.map((k, j) => ({ h: hs[k], ar: texts[k], en: String(arr![j] ?? "") })).filter((r) => r.en);
      rows.forEach((r) => map.set(r.h, r.en));
      if (rows.length) await rest("tr_cache", { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify(rows) });
    }
  }
  return hs.map((h) => map.get(h) ?? null);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method" }, 405);
  let b: any;
  try { b = await req.json(); } catch { return json({ error: "bad json" }, 400); }
  try {
    if (b.mode === "tr") {
      const texts = (Array.isArray(b.texts) ? b.texts : []).slice(0, 200).map((t: unknown) => String(t).slice(0, 2000));
      if (!texts.length) return json({ en: [] });
      const en = await translate(texts);
      if (en.every((x) => x == null)) return json({ error: KEY ? "ai" : "nokey", en }, 503);
      return json({ en });
    }
    if (b.mode === "chat") {
      if (!KEY) return json({ error: "nokey" }, 503);
      const msgs = (Array.isArray(b.messages) ? b.messages : []).slice(-10)
        .map((m: any) => ({ role: m.role === "model" ? "model" : "user", parts: [{ text: String(m.text || "").slice(0, 1500) }] }))
        .filter((m: any) => m.parts[0].text);
      if (!msgs.length || msgs[msgs.length - 1].role !== "user") return json({ error: "empty" }, 400);
      const sys = SYSTEM + (b.lang === "en" ? "\nThe app is in English mode: reply in English." : "");
      const text = await gemini(sys, msgs, { temp: 0.5, max: 2048 });
      rest("ai_chats", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ vid: String(b.vid || "").slice(0, 60) || null, q: msgs[msgs.length - 1].parts[0].text, a: text.slice(0, 4000) }) }).catch(() => {});
      return json({ text });
    }
    return json({ error: "mode" }, 400);
  } catch (e) {
    console.error("handler", String(e).slice(0, 300));
    return json({ error: "ai", detail: String(e).slice(0, 200) }, 502);
  }
});
