import type { KoridorId } from "@/lib/types";

export const JAM_PERMINTAAN = [
  "05.30",
  "07.00",
  "08.30",
  "10.00",
  "13.00",
  "14.30",
  "16.00",
  "18.00",
] as const;

// Data contoh untuk grafik dan heatmap evaluasi, bukan hasil tap on bus.
export const KETERISIAN_CONTOH: Record<KoridorId, number[]> = {
  K1: [62, 88, 45, 38, 70, 92, 65, 48],
  K2: [55, 78, 50, 42, 68, 86, 60, 44],
  K3: [58, 85, 48, 40, 72, 75, 63, 46],
};

export const PERMINTAAN_CONTOH: Record<
  KoridorId,
  Array<{ halteId: string; nilai: number[] }>
> = {
  K1: [
    { halteId: "K1-01", nilai: [70, 95, 55, 35, 60, 78, 88, 50] },
    { halteId: "K1-09", nilai: [45, 60, 35, 28, 40, 55, 62, 30] },
    { halteId: "K1-11", nilai: [50, 72, 40, 30, 45, 60, 70, 35] },
    { halteId: "K1-19", nilai: [65, 88, 50, 32, 58, 75, 82, 45] },
    { halteId: "K1-31", nilai: [80, 92, 60, 40, 55, 70, 85, 65] },
  ],
  K2: [
    { halteId: "K2-01", nilai: [82, 90, 58, 42, 60, 72, 84, 68] },
    { halteId: "K2-17", nilai: [60, 75, 45, 30, 50, 65, 70, 40] },
    { halteId: "K2-19", nilai: [55, 82, 48, 34, 52, 70, 76, 42] },
    { halteId: "K2-29", nilai: [70, 88, 52, 38, 58, 74, 80, 55] },
    { halteId: "K2-34", nilai: [78, 86, 55, 40, 62, 76, 88, 72] },
  ],
  K3: [
    { halteId: "K3-01", nilai: [80, 94, 58, 38, 62, 78, 86, 70] },
    { halteId: "K3-12", nilai: [62, 80, 46, 32, 50, 66, 72, 48] },
    { halteId: "K3-17", nilai: [55, 68, 42, 28, 45, 60, 65, 38] },
    { halteId: "K3-20", nilai: [48, 62, 38, 25, 40, 55, 60, 35] },
    { halteId: "K3-33", nilai: [70, 84, 52, 36, 55, 70, 78, 60] },
  ],
};
