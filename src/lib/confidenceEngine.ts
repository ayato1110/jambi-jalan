import type { StatusArmadaAktif, StatusKeyakinan } from "./types";

export const INTERVAL_PING_MS = 10_000;
export const BATAS_KEYAKINAN_MS = 20_000;

export interface KeyakinanPosisi {
  status: StatusKeyakinan;
  label: string;
  pesan: string | null;
  umurPingMs: number;
}

export function evaluasiKeyakinan(
  armada: StatusArmadaAktif | null | undefined,
  sekarangMs: number = Date.now(),
): KeyakinanPosisi {
  if (!armada || armada.statusTrip !== "berjalan") {
    return {
      status: "tidak_aktif",
      label: "Tidak ada trip aktif",
      pesan:
        "Belum ada bus yang berjalan di koridor ini. Waktu tiba mengikuti jadwal keberangkatan.",
      umurPingMs: 0,
    };
  }

  const umurPingMs = Math.max(0, sekarangMs - armada.terakhirDiperbaruiMs);
  const sinyalHilang = armada.sinyalDiputusSimulasi || umurPingMs > BATAS_KEYAKINAN_MS;

  if (sinyalHilang) {
    return {
      status: "perkiraan_jadwal",
      label: "Estimasi Jadwal",
      pesan:
        "Sinyal lokasi bus sedang terputus. Waktu tiba dihitung dari jadwal reguler dan posisi terakhir.",
      umurPingMs,
    };
  }

  return {
    status: "langsung",
    label: "Posisi Langsung",
    pesan: null,
    umurPingMs,
  };
}

export function apakahPosisiLangsung(
  armada: StatusArmadaAktif | null | undefined,
  sekarangMs: number = Date.now(),
): boolean {
  return evaluasiKeyakinan(armada, sekarangMs).status === "langsung";
}
