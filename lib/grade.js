/**
 * Logika penilaian otomatis.
 * Tipe soal: PG (pilihan ganda), BS (benar/salah), MENJODOKAN, ESSAY.
 * PG/BS/MENJODOKAN dinilai otomatis; ESSAY lewat koreksi manual guru.
 */

export const TIPE_SOAL = ['PG', 'BS', 'MENJODOKAN', 'ESSAY'];
export const LEVEL_SOAL = ['L1', 'L2', 'L3'];
export const LEVEL_LABEL = { L1: 'L1 – Memahami', L2: 'L2 – Mengaplikasi', L3: 'L3 – Bermakna' };

const r2 = (n) => Math.round(n * 100) / 100;

/** Nilai satu soal objektif. Mengembalikan {dapat, max} */
export function gradeObjektif(soal, jawaban) {
  const max = soal.skor || 0;
  if (soal.tipe === 'PG' || soal.tipe === 'BS') {
    return { dapat: jawaban === soal.kunci ? max : 0, max };
  }
  if (soal.tipe === 'MENJODOKAN') {
    const kiri = Object.keys(soal.kunci || {});
    if (!kiri.length) return { dapat: 0, max };
    let benar = 0;
    for (const k of kiri) if (jawaban && jawaban[k] === soal.kunci[k]) benar++;
    return { dapat: r2((max * benar) / kiri.length), max };
  }
  return { dapat: 0, max };
}

/**
 * Menilai seluruh attempt. Skor essay yang sudah dikoreksi guru diambil dari
 * attempt.perSoal lama (tidak ditimpa), jadi koreksi guru tidak hilang.
 */
export function gradeAttempt(soalList, attempt) {
  const map = Object.fromEntries(soalList.map((s) => [s.id, s]));
  const lama = attempt.perSoal || {};
  const perSoal = {};
  let dO = 0, mO = 0, dE = 0, mE = 0;

  for (const sid of attempt.soalOrder || []) {
    const s = map[sid];
    if (!s) continue;
    if (s.tipe === 'ESSAY') {
      const sudah = lama[sid];
      const dapat = sudah && sudah.max === s.skor ? sudah.dapat || 0 : 0;
      perSoal[sid] = { dapat, max: s.skor, manual: true };
      dE += dapat;
      mE += s.skor || 0;
    } else {
      const g = gradeObjektif(s, (attempt.jawaban || {})[sid]);
      perSoal[sid] = { dapat: g.dapat, max: g.max };
      dO += g.dapat;
      mO += g.max;
    }
  }

  const skorObjektif = mO ? r2((dO / mO) * 100) : null;
  const skorEssay = mE ? r2((dE / mE) * 100) : null;
  const total = mO + mE;
  const skorAkhir = total ? r2(((dO + dE) / total) * 100) : null;
  return {
    perSoal,
    skorObjektif,
    skorEssay,
    skorAkhir,
    adaEssay: mE > 0,
    status: mE > 0 ? 'selesai' : 'dinilai',
  };
}

/** Skor yang ditampilkan di leaderboard (pakai skorAkhir, fallback skorObjektif) */
export function skorTampil(attempt) {
  if (attempt.skorAkhir != null) return attempt.skorAkhir;
  return attempt.skorObjektif;
}
