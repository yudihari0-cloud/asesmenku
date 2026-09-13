import { templateSiswa } from '@/lib/excel';

/** GET — unduh template Excel import siswa */
export async function GET() {
  return templateSiswa();
}
