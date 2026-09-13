/**
 * Analisis butir soal (psikometri dasar) untuk asesmen objektif & essay.
 *
 * P  = tingkat kesukaran (proporsi skor tercapai, 0–1)
 *      ≥ 0.71 Mudah · 0.30–0.70 Sedang · ≤ 0.29 Sukar
 * D  = daya beda (P kelompok atas 27% − P kelompok bawah 27%)
 *      ≥ 0.40 Baik · 0.20–0.39 Cukup · < 0.20 Kurang (perlu revisi)
 * Pengecoh = sebaran jawaban tiap opsi (khusus PG/BS) — pengecoh baik dipilih
 *      oleh siswa kelompok bawah lebih banyak daripada kelompok atas.
 */

const r2 = (n) => Math.round(n * 100) / 100;

export function analisisButir(soalList, attempts) {
  const ats = attempts.filter((a) => a.status !== 'berlangsung');
  const withTotal = ats
    .map((a) => ({ a, total: a.skorAkhir ?? a.skorObjektif }))
    .filter((x) => x.total != null);
  const sorted = [...withTotal].sort((x, y) => y.total - x.total);
  const nGroup = Math.max(1, Math.round(sorted.length * 0.27));
  const atas = sorted.slice(0, nGroup).map((x) => x.a);
  const bawah = sorted.slice(-nGroup).map((x) => x.a);

  const avgP = (arr, skorMax) =>
    arr.length ? arr.reduce((acc, r) => acc + (r.dapat || 0), 0) / (arr.length * (skorMax || 1)) : 0;

  return soalList.map((s) => {
    const rows = withTotal
      .map(({ a }) => ({ j: (a.jawaban || {})[s.id], per: (a.perSoal || {})[s.id] }))
      .filter((r) => r.per && r.per.max != null);
    const N = rows.length;
    const dasar = {
      soalId: s.id,
      tipe: s.tipe,
      pertanyaan: s.pertanyaan,
      skor: s.skor,
      level: s.level,
      N,
    };
    if (!N) return { ...dasar, P: null, D: null, kesukaran: '-', dayaBeda: '-', pengecoh: null };

    const P = avgP(
      rows.map((r) => r.per),
      s.skor
    );
    const pAtas = atas.map((a) => (a.perSoal || {})[s.id]).filter(Boolean);
    const pBawah = bawah.map((a) => (a.perSoal || {})[s.id]).filter(Boolean);
    const D = avgP(pAtas, s.skor) - avgP(pBawah, s.skor);

    let pengecoh = null;
    if (s.tipe === 'PG') {
      const dist = {};
      (s.opsi || []).forEach((_, i) => (dist[String.fromCharCode(65 + i)] = 0));
      rows.forEach((r) => {
        if (dist[r.j] != null) dist[r.j]++;
      });
      pengecoh = { dist, kunci: s.kunci };
    } else if (s.tipe === 'BS') {
      const dist = { BENAR: 0, SALAH: 0 };
      rows.forEach((r) => {
        if (dist[r.j] != null) dist[r.j]++;
      });
      pengecoh = { dist, kunci: s.kunci };
    }

    return {
      ...dasar,
      P: r2(P),
      D: r2(D),
      kesukaran: P >= 0.71 ? 'Mudah' : P >= 0.31 ? 'Sedang' : 'Sukar',
      dayaBeda: D >= 0.4 ? 'Baik' : D >= 0.2 ? 'Cukup' : 'Kurang',
      pengecoh,
    };
  });
}
