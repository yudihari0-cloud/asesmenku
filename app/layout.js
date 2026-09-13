import './globals.css';

export const metadata = {
  title: 'AsesmenKu — Asesmen Kurikulum Merdeka (CP 046)',
  description:
    'Platform asesmen berbasis CP 046 (BSKAP 046/H/KR/2025): kisi-kisi maker, bank soal, ujian online, penilaian otomatis, rekap, leaderboard, dan refleksi.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
