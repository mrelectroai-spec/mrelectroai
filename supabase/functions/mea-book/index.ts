// mea-book: بيعطي رابط تنزيل مؤقت لـ PDF الكتاب، بس للي معو مفتاح شغّال عهالتلفون وفيه PDF.
// كل نسخة بتنطبع عليها رقم المفتاح ورقم الشاري بأسفل كل صفحة (منحفظها مرة وحدة بـ stamped/).
import { PDFDocument, rgb, StandardFonts, degrees } from "https://esm.sh/pdf-lib@1.17.1";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });
const BOOKS: Record<string, string> = { book: "electricity", book2: "classic-control", book3: "solar" };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const url = Deno.env.get("SUPABASE_URL")!, srk = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const H = { apikey: srk, Authorization: "Bearer " + srk };
    const { code, device, book } = await req.json();
    if (!BOOKS[book]) return json({ ok: false, msg: "كتاب غلط" }, 400);
    const c = String(code || "").trim().toUpperCase();
    const q = await fetch(url + "/rest/v1/licenses?select=code,phone,tools,expires,active,device,pdf&code=eq." + encodeURIComponent(c), { headers: H });
    const L = (await q.json())[0];
    if (!L) return json({ ok: false, msg: "المفتاح غلط" }, 403);
    if (!L.active) return json({ ok: false, msg: "المفتاح موقوف" }, 403);
    if (L.expires && L.expires < new Date().toISOString().slice(0, 10)) return json({ ok: false, msg: "المفتاح خلص" }, 403);
    const tools = String(L.tools || "").split(",").map((x: string) => x.trim());
    if (!tools.includes(book)) return json({ ok: false, msg: "المفتاح ما بيشمل هالكتاب" }, 403);
    if (!L.pdf) return json({ ok: false, msg: "هالمفتاح بلا PDF. احكي أنور" }, 403);
    if (!L.device || L.device !== device) return json({ ok: false, msg: "المفتاح مفعّل على تلفون تاني" }, 403);

    const stampedPath = `stamped/${c}-${book}.pdf`;
    const exists = await fetch(url + "/storage/v1/object/info/books/" + stampedPath, { headers: H });
    let path = stampedPath;
    if (!exists.ok) {
      // أول مرة: منطبع النسخة ومنحفظها
      const src = await fetch(url + "/storage/v1/object/books/" + book + ".pdf", { headers: H });
      if (!src.ok) return json({ ok: false, msg: "ملف الكتاب لسّا ما انرفع. احكي أنور" }, 404);
      const bytes = new Uint8Array(await src.arrayBuffer());
      try {
        const doc = await PDFDocument.load(bytes, { updateMetadata: false });
        const font = await doc.embedFont(StandardFonts.Helvetica);
        const tag = `MrElectroAI - licensed copy ${c}${L.phone ? " - " + String(L.phone).replace(/[^\d+ ]/g, "") : ""} - not for sharing`;
        for (const p of doc.getPages()) {
          const { width } = p.getSize();
          const size = Math.max(6, Math.min(8, width / 80));
          const w = font.widthOfTextAtSize(tag, size);
          p.drawText(tag, { x: (width - w) / 2, y: 6, size, font, color: rgb(0.45, 0.45, 0.45), opacity: 0.7 });
          p.drawText(c, { x: width - 14, y: 120, size: 7, font, color: rgb(0.6, 0.6, 0.6), opacity: 0.45, rotate: degrees(90) });
        }
        doc.setTitle(`${BOOKS[book]} - ${c}`);
        const out = await doc.save({ useObjectStreams: true });
        const up = await fetch(url + "/storage/v1/object/books/" + stampedPath, { method: "POST", headers: { ...H, "Content-Type": "application/pdf", "x-upsert": "true" }, body: out });
        if (!up.ok) path = book + ".pdf";
      } catch (_) {
        path = book + ".pdf"; // إذا الطبع ما زبط منعطي الأصلي
      }
    }
    const s = await fetch(url + "/storage/v1/object/sign/books/" + path, { method: "POST", headers: { ...H, "Content-Type": "application/json" }, body: JSON.stringify({ expiresIn: 600 }) });
    const sj = await s.json();
    if (!sj.signedURL) return json({ ok: false, msg: "ما قدرنا نجهّز الرابط" }, 500);
    const name = `MrElectroAI-${BOOKS[book]}.pdf`;
    return json({ ok: true, url: url + "/storage/v1" + sj.signedURL + "&download=" + encodeURIComponent(name) });
  } catch (e) {
    return json({ ok: false, msg: String(e) }, 500);
  }
});
