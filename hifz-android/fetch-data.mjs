// بيجيب نص البقرة وآل عمران (عثماني + تجويد) وروابط الصوت، وبيحفظهم بـ hifz/data
// حتى التطبيق ما يتّكل على الـ API وقت أول فتحة.
import { mkdir, writeFile } from 'node:fs/promises';

const API = 'https://api.alquran.cloud/v1';
const SURAHS = [{ n: 2, count: 286 }, { n: 3, count: 200 }];
const RECITERS = ['ar.husary', 'ar.husarymujawwad', 'ar.minshawi', 'ar.alafasy', 'ar.abdulbasitmurattal'];
const OUT = new URL('../hifz/data/', import.meta.url);

async function get(url) {
  for (let i = 1; i <= 4; i++) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(60000) });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const j = await r.json();
      if (j.code !== 200) throw new Error('API ' + j.code);
      return j.data;
    } catch (e) {
      console.log(`try ${i} failed for ${url}: ${e.message}`);
      await new Promise((r) => setTimeout(r, 3000 * i));
    }
  }
  throw new Error('giving up: ' + url);
}

await mkdir(OUT, { recursive: true });
for (const s of SURAHS) {
  const eds = await get(`${API}/surah/${s.n}/editions/quran-uthmani,quran-tajweed`);
  const u = eds.find((e) => e.edition.identifier === 'quran-uthmani');
  const t = eds.find((e) => e.edition.identifier === 'quran-tajweed');
  if (!u || u.ayahs.length !== s.count) throw new Error(`surah ${s.n}: wrong ayah count`);
  const arr = u.ayahs.map((a, i) => ({
    n: a.numberInSurah, g: a.number, p: a.page, j: a.juz,
    t: a.text, tj: t && t.ayahs[i] ? t.ayahs[i].text : ''
  }));
  await writeFile(new URL(`s${s.n}.json`, OUT), JSON.stringify(arr));
  console.log(`surah ${s.n}: ${arr.length} ayat, pages ${arr[0].p}-${arr.at(-1).p}`);
  console.log('  first:', arr[0].t.slice(0, 60));
  console.log('  tajweed sample:', arr[1].tj.slice(0, 80));
  for (const rec of RECITERS) {
    try {
      const d = await get(`${API}/surah/${s.n}/${rec}`);
      const m = {};
      for (const x of d.ayahs) m[x.number] = x.audio || (x.audioSecondary && x.audioSecondary[0]);
      await writeFile(new URL(`aud-${rec}-${s.n}.json`, OUT), JSON.stringify(m));
      console.log(`  audio ${rec}: ok (${Object.values(m)[0]})`);
    } catch (e) { console.log(`  audio ${rec}: skipped (${e.message})`); }
  }
}
