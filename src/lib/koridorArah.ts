import type { KoridorId } from "@/lib/types";

const DASAR: Record<KoridorId, KoridorId> = {
  K1: "K1",
  K1R: "K1",
  K2: "K2",
  K2R: "K2",
  K3: "K3",
  K3R: "K3",
};

export function koridorDasar(id: KoridorId): KoridorId {
  return DASAR[id];
}

export function koridorArah(id: KoridorId, balik: boolean): KoridorId {
  return `${koridorDasar(id)}${balik ? "R" : ""}` as KoridorId;
}
