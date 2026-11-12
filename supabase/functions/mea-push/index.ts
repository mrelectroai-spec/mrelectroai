// mea-push: أنور (أدمن) بيبعت إشعار فوري لكل تلفونات التطبيق عبر Firebase (topic: all).
// السرّ FCM_SERVICE_ACCOUNT = ملف حساب الخدمة تبع Firebase (JSON كامل)، بيتحط بـ Supabase Secrets.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });

const b64url = (buf: ArrayBuffer | Uint8Array | string) => {
  const bytes = typeof buf === "string" ? new TextEncoder().encode(buf) : new Uint8Array(buf as ArrayBuffer);
  let s = ""; for (const x of bytes) s += String.fromCharCode(x);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

async function googleToken(sa: { client_email: string; private_key: string }) {
  const now = Math.floor(Date.now() / 1000);
  const head = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(JSON.stringify({ iss: sa.client_email, scope: "https://www.googleapis.com/auth/firebase.messaging", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 }));
  const pem = sa.private_key.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  const der = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey("pkcs8", der, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(head + "." + claim));
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=" + head + "." + claim + "." + b64url(sig),
  });
  const j = await r.json();
  if (!j.access_token) throw new Error("google auth: " + JSON.stringify(j));
  return j.access_token as string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const auth = req.headers.get("authorization") || "";
    const input = await req.json().catch(() => ({}));
    // فحص بلا إرسال (validate_only): بيتأكد إنو السرّ ومشروع Firebase تمام، وما بيوصل شي لحدا
    const dry = input.dry === true;
    const url = Deno.env.get("SUPABASE_URL")!, anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    // بس الأدمن: منسأل قاعدة البيانات بنفس دخول أنور
    const chk = await fetch(url + "/rest/v1/rpc/is_site_admin", { method: "POST", headers: { apikey: anon, Authorization: auth, "Content-Type": "application/json" }, body: "{}" });
    if (!dry && (!chk.ok || (await chk.json()) !== true)) return json({ ok: false, msg: "لازم تفوت كأدمن" }, 403);

    const raw = Deno.env.get("FCM_SERVICE_ACCOUNT");
    if (!raw) return json({ ok: false, msg: "ناقص سرّ FCM_SERVICE_ACCOUNT" }, 500);
    const sa = JSON.parse(raw);
    const { id, title, body, url: link } = input;
    if (!title) return json({ ok: false, msg: "اكتب عنوان" }, 400);

    const tok = await googleToken(sa);
    const data: Record<string, string> = { id: String(id || "push-" + Date.now()), title: String(title), body: String(body || ""), url: String(link || "") };
    const r = await fetch(`https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`, {
      method: "POST", headers: { Authorization: "Bearer " + tok, "Content-Type": "application/json" },
      body: JSON.stringify({ validate_only: dry, message: { topic: "all", data, android: { priority: "high", ttl: "86400s" } } }),
    });
    const out = await r.json();
    if (!r.ok) return json({ ok: false, msg: "Firebase رفض", detail: out }, 502);
    return json({ ok: true, dry, name: out.name });
  } catch (e) {
    return json({ ok: false, msg: String(e) }, 500);
  }
});
