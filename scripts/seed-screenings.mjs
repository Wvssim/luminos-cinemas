// Génère les séances du 1 au 30 juin 2026
// - Jours 1-3  : programme maximal — films variés + créneaux denses toute la journée
// - Jours 4-10 : programme dense — 1 film/salle répété 3-5 fois
// - Jours 11-30: programme standard — 7 séances/jour
// node scripts/seed-screenings.mjs

const BASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!BASE_URL || !KEY) { console.error('Missing env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'); process.exit(1); }

// ─── Catalogue films ──────────────────────────────────────────────────────────
const F = {
  killers:   '05aa1083-a0d8-43cd-bfeb-72818135db77', // 206 min
  brutalist: '60daccd3-8ed9-4a7d-84a9-2359da25c0f4', // 215 min
  ironClaw:  '416f31b7-2e08-466d-a6af-e3eabbcb48e2', // 156 min
  anatomy:   'e5784168-c7cf-4503-8e9d-216eccd8ec18', // 149 min
  beekeeper: '7e4d5e2c-92a7-4a3b-8dff-6f2a94d6b6c9', // 110 min
  dune2:     '2adab63c-4a08-45f6-ada3-0cf2e3f7ac95', // 166 min
  duneM:     '83cc1de3-4bed-44e1-81be-d283bfa7781d', // 167 min
  oppen:     '6e20a267-5be9-4717-ad5f-1705f0a56efd', // 180 min
  mickey:    'f426254f-1be4-49db-a808-974d37e446ba', // 137 min
  mega:      '50f1b2a2-0f4c-4c57-afe5-818923f5a35b', // 138 min
  pastLives: 'cd0e0512-b63e-4dca-9036-c5fea449d7dd', // 109 min
  passion:   'a4468d2e-69eb-46ab-a378-a0b06a9c498d', // 128 min
  aftersun:  '2488dff1-039b-4729-8a51-f1d5c9dd27d5', // 101 min
  chambre:   'e38894f1-ac7e-484b-a70d-1011e0591e59', // 107 min
};

// ─── Configs salles ───────────────────────────────────────────────────────────
const S1 = { room: 'Salle 1 · Dolby Atmos',    format: 'VOSTFR · 4K HDR', seats: 168, ps: 12.50, pp: 16.00, pd: 32.00 };
const S2 = { room: 'Salle 2 · IMAX',            format: 'VOSTFR · IMAX',   seats: 220, ps: 16.00, pp: 20.00, pd: 40.00 };
const S3 = { room: 'Salle 3 · Numérique 2K',   format: 'VOSTFR · 2K',     seats: 144, ps: 10.00, pp: 13.00, pd: 26.00 };

// ─── Helpers ──────────────────────────────────────────────────────────────────
const pick = (arr, n) => arr[n % arr.length];

function at(baseDate, h, m = 0) {
  const d = new Date(baseDate);
  d.setUTCHours(h, m, 0, 0);
  return d.toISOString();
}

function show(film_id, starts_at, salle) {
  return { film_id, starts_at, room: salle.room, format: salle.format,
           total_seats: salle.seats, price_standard: salle.ps,
           price_premium: salle.pp, price_duo: salle.pd };
}

// ─── Programme des 3 premiers jours (films variés + créneaux denses) ──────────
// Chaque créneau = film différent dans la même salle
const DENSE_DAYS = [
  // ── JOUR 1 (lundi 1 juin) ──────────────────────────────────────────────────
  (d) => [
    // Salle 1 : 5 films différents sur la journée
    show(F.beekeeper,  at(d,  8,30), S1),
    show(F.ironClaw,   at(d, 11, 0), S1),
    show(F.anatomy,    at(d, 13,30), S1),
    show(F.killers,    at(d, 16, 0), S1),
    show(F.brutalist,  at(d, 19,30), S1),

    // Salle 2 : 4 films IMAX
    show(F.mickey,     at(d,  9,30), S2),
    show(F.mega,       at(d, 12, 0), S2),
    show(F.dune2,      at(d, 14,30), S2),
    show(F.oppen,      at(d, 18, 0), S2),

    // Salle 3 : 6 films d'auteur (films courts → créneaux serrés)
    show(F.aftersun,   at(d,  8, 0), S3),
    show(F.chambre,    at(d, 10, 0), S3),
    show(F.pastLives,  at(d, 12, 0), S3),
    show(F.passion,    at(d, 14, 0), S3),
    show(F.aftersun,   at(d, 16,15), S3),
    show(F.chambre,    at(d, 18,30), S3),
    show(F.pastLives,  at(d, 20,30), S3),
  ],

  // ── JOUR 2 (mardi 2 juin) ─────────────────────────────────────────────────
  (d) => [
    // Salle 1 : 4 films variés
    show(F.anatomy,    at(d,  9, 0), S1),
    show(F.beekeeper,  at(d, 11,30), S1),
    show(F.ironClaw,   at(d, 14, 0), S1),
    show(F.killers,    at(d, 17, 0), S1),
    show(F.brutalist,  at(d, 20,30), S1),

    // Salle 2 : 4 films
    show(F.duneM,      at(d,  9,30), S2),
    show(F.oppen,      at(d, 13, 0), S2),
    show(F.mickey,     at(d, 16,30), S2),
    show(F.mega,       at(d, 20, 0), S2),

    // Salle 3 : 6 créneaux, films alternés
    show(F.passion,    at(d,  8,30), S3),
    show(F.aftersun,   at(d, 10,30), S3),
    show(F.chambre,    at(d, 12,30), S3),
    show(F.pastLives,  at(d, 14,30), S3),
    show(F.passion,    at(d, 17, 0), S3),
    show(F.aftersun,   at(d, 19, 0), S3),
    show(F.chambre,    at(d, 21, 0), S3),
  ],

  // ── JOUR 3 (mercredi 3 juin) ──────────────────────────────────────────────
  (d) => [
    // Salle 1 : 5 films
    show(F.beekeeper,  at(d,  8, 0), S1),
    show(F.ironClaw,   at(d, 10,15), S1),
    show(F.anatomy,    at(d, 13, 0), S1),
    show(F.killers,    at(d, 15,30), S1),
    show(F.brutalist,  at(d, 19, 0), S1),

    // Salle 2 : 4 films
    show(F.dune2,      at(d,  9, 0), S2),
    show(F.duneM,      at(d, 12,30), S2),
    show(F.oppen,      at(d, 16, 0), S2),
    show(F.mega,       at(d, 19,30), S2),

    // Salle 3 : 7 créneaux
    show(F.chambre,    at(d,  8, 0), S3),
    show(F.pastLives,  at(d,  9,50), S3),
    show(F.aftersun,   at(d, 11,45), S3),
    show(F.passion,    at(d, 13,30), S3),
    show(F.chambre,    at(d, 15,45), S3),
    show(F.pastLives,  at(d, 17,45), S3),
    show(F.aftersun,   at(d, 19,45), S3),
    show(F.passion,    at(d, 21,30), S3),
  ],
];

// ─── Listes pour rotation jours 4-10 et 11-30 ────────────────────────────────
const SALLE1_LIST = [F.killers, F.brutalist, F.ironClaw, F.anatomy, F.beekeeper];
const SALLE2_LIST = [F.dune2,   F.duneM,    F.oppen,    F.mickey,  F.mega];
const SALLE3_LIST = [F.pastLives, F.passion, F.aftersun, F.chambre];

// ─── Génération complète ──────────────────────────────────────────────────────
const screenings = [];

for (let dayNum = 0; dayNum < 30; dayNum++) {
  const d = new Date('2026-06-01T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + dayNum);
  const idx = dayNum;

  if (dayNum < 3) {
    // Jours 1-3 : programme maximal avec films variés
    for (const s of DENSE_DAYS[dayNum](d)) screenings.push(s);

  } else if (dayNum < 10) {
    // Jours 4-10 : programme dense (1 film/salle répété)
    const s1Film = pick(SALLE1_LIST, idx);
    const s1Slots = [[[8,30],[11,30],[15,0],[19,0]], [[9,0],[12,30],[16,0],[19,30],[22,0]], [[10,0],[14,0],[20,30]]][idx % 3];
    for (const [h,m] of s1Slots) screenings.push(show(s1Film, at(d,h,m), S1));

    const s2Film = pick(SALLE2_LIST, idx + 2);
    const s2Slots = [[[9,0],[13,30],[18,0],[21,30]], [[10,30],[15,0],[20,0]], [[9,30],[14,0],[17,30],[21,0]]][idx % 3];
    for (const [h,m] of s2Slots) screenings.push(show(s2Film, at(d,h,m), S2));

    const s3Film = pick(SALLE3_LIST, idx + 1);
    const s3Slots = [[[8,0],[10,15],[12,30],[15,0],[17,30],[20,0]], [[9,0],[11,30],[14,0],[16,30],[19,0],[21,30]], [[10,0],[12,30],[15,0],[17,30],[20,30]]][idx % 3];
    for (const [h,m] of s3Slots) screenings.push(show(s3Film, at(d,h,m), S3));

  } else {
    // Jours 11-30 : programme standard
    screenings.push(
      show(pick(SALLE1_LIST, idx),   at(d,12,30), S1),
      show(pick(SALLE1_LIST, idx+1), at(d,18,30), S1),
      show(pick(SALLE2_LIST, idx+2), at(d,13, 0), S2),
      show(pick(SALLE2_LIST, idx+3), at(d,18, 0), S2),
      show(pick(SALLE3_LIST, idx+1), at(d,12, 0), S3),
      show(pick(SALLE3_LIST, idx+2), at(d,14,30), S3),
      show(pick(SALLE3_LIST, idx+3), at(d,17, 0), S3),
    );
  }
}

// ─── Stats ────────────────────────────────────────────────────────────────────
const byDay = {};
for (const s of screenings) {
  const day = s.starts_at.slice(0,10);
  byDay[day] = (byDay[day] || 0) + 1;
}
console.log(`Total séances : ${screenings.length}`);
console.log('Détail par jour :');
Object.entries(byDay).sort().forEach(([d, n]) => {
  const num = parseInt(d.slice(8));
  const tag = num <= 3 ? '⭐ (varié dense)' : num <= 10 ? '(dense)' : '';
  console.log(`  ${d}  →  ${n} séances  ${tag}`);
});

// ─── Clear existant ───────────────────────────────────────────────────────────
console.log('\nNettoyage...');
const existRes = await fetch(`${BASE_URL}/rest/v1/screenings?select=id`, {
  headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
});
const existing = await existRes.json();
if (existing.length) {
  const ids = existing.map(s => s.id).join(',');
  await fetch(`${BASE_URL}/rest/v1/reservations?screening_id=in.(${ids})`, {
    method: 'DELETE', headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
  });
  await fetch(`${BASE_URL}/rest/v1/screenings?id=neq.00000000-0000-0000-0000-000000000000`, {
    method: 'DELETE', headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
  });
}
console.log(`  ${existing.length} séances supprimées`);

// ─── Insertion par batch ──────────────────────────────────────────────────────
let inserted = 0;
for (let i = 0; i < screenings.length; i += 100) {
  const batch = screenings.slice(i, i + 100);
  const res = await fetch(`${BASE_URL}/rest/v1/screenings`, {
    method: 'POST',
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify(batch),
  });
  if (!res.ok) { console.error(await res.text()); process.exit(1); }
  inserted += batch.length;
  process.stdout.write(`\r  Inséré : ${inserted}/${screenings.length}`);
}
console.log('\nDone !');
