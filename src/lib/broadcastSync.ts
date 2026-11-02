export const NAMA_CHANNEL = "jambi_jalan_sync_v1";
export const KUNCI_PENYIMPANAN = "jambi-jalan-store-v1";

export interface PesanPembaruan {
  type: "STATE_UPDATED";
  sumber: string;
  payload: Record<string, unknown>;
}

export type PenerimaPembaruan = (pesan: PesanPembaruan) => void;
export type PenerimaCadangan = (state: Record<string, unknown>) => void;

export function buatChannel(nama: string = NAMA_CHANNEL): BroadcastChannel | null {
  if (typeof window === "undefined" || !("BroadcastChannel" in window)) return null;
  return new BroadcastChannel(nama);
}

export function kirimPembaruan(
  channel: BroadcastChannel | null,
  payload: Record<string, unknown>,
  sumber: string,
): void {
  if (!channel) return;
  channel.postMessage({ type: "STATE_UPDATED", sumber, payload } satisfies PesanPembaruan);
}

export function berlanggananPembaruan(
  channel: BroadcastChannel | null,
  penerima: PenerimaPembaruan,
): () => void {
  if (!channel) return () => undefined;

  const penanganan = (event: MessageEvent<unknown>) => {
    const data = event.data;
    if (!data || typeof data !== "object") return;

    const pesan = data as Partial<PesanPembaruan>;
    if (pesan.type !== "STATE_UPDATED") return;
    if (typeof pesan.sumber !== "string") return;
    if (!pesan.payload || typeof pesan.payload !== "object") return;

    penerima({
      type: "STATE_UPDATED",
      sumber: pesan.sumber,
      payload: pesan.payload as Record<string, unknown>,
    });
  };

  channel.addEventListener("message", penanganan);
  return () => channel.removeEventListener("message", penanganan);
}

export function pasangCadanganStorage(penerima: PenerimaCadangan): () => void {
  if (typeof window === "undefined") return () => undefined;

  const penanganan = (event: StorageEvent) => {
    if (event.key !== KUNCI_PENYIMPANAN || !event.newValue) return;

    try {
      const hasil = JSON.parse(event.newValue) as unknown;
      if (!hasil || typeof hasil !== "object") return;

      const bungkus = hasil as { state?: unknown };
      const state = bungkus.state;
      if (!state || typeof state !== "object") return;

      penerima(state as Record<string, unknown>);
    } catch {
      // Data localStorage rusak diabaikan supaya tab tetap berjalan.
    }
  };

  window.addEventListener("storage", penanganan);
  return () => window.removeEventListener("storage", penanganan);
}
