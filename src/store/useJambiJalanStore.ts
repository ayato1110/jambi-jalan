"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  berlanggananPembaruan,
  buatChannel,
  KUNCI_PENYIMPANAN,
  kirimPembaruan,
  pasangCadanganStorage,
} from "@/lib/broadcastSync";
import { HALTE, HALTE_PER_KORIDOR } from "@/data/halte";
import { JADWAL_MAP } from "@/data/jadwal";
import { posisiInterpolasiHalte } from "@/lib/geoUtils";
import { PARAMETER_SIMULASI_AWAL } from "@/lib/simulatorEngine";
import type {
  Halte,
  KoridorId,
  ParameterSimulasi,
  StatusArmadaAktif,
} from "@/lib/types";

export interface UnitArmadaDipilih {
  busId: string;
  namaArmada: string;
  jenis: StatusArmadaAktif["jenis"];
  kapasitas: number;
  koridorId: KoridorId;
  tripId: string;
}

export interface JambiJalanState {
  koridorAktif: KoridorId;
  halteKeberangkatanId: string;
  jamSimulasiMenit: number | null;
  modeAksesibel: boolean;
  kontrasTinggi: boolean;
  suaraOtomatis: boolean;
  unitPramudiId: string | null;
  tripPramudiId: string | null;
  daftarHalte: Halte[];
  armadaAktif: StatusArmadaAktif[];
  parameterSimulasi: ParameterSimulasi;
  revisi: number;
  terakhirDiperbaruiMs: number;
}

export interface JambiJalanActions {
  setKoridorAktif: (koridorId: KoridorId) => void;
  setHalteKeberangkatan: (halteId: string) => void;
  setJamSimulasiMenit: (menit: number | null) => void;
  setModeAksesibel: (aktif: boolean) => void;
  setKontrasTinggi: (aktif: boolean) => void;
  setSuaraOtomatis: (aktif: boolean) => void;
  setUnitPramudiId: (unitId: string | null) => void;
  setTripPramudiId: (tripId: string | null) => void;
  mulaiTrip: (unit: UnitArmadaDipilih) => void;
  akhiriTrip: (busId: string) => void;
  perbaruiPosisi: (busId: string, indeksHalte: number) => void;
  majukanPosisi: (busId: string, deltaIndeks: number) => void;
  setSinyalDiputus: (busId: string, putus: boolean) => void;
  tambahHalte: (halte: Halte) => void;
  ubahHalte: (id: string, perubahan: Partial<Halte>) => void;
  hapusHalte: (id: string) => void;
  kembalikanHaltePublik: () => void;
  setParameterSimulasi: (perubahan: Partial<ParameterSimulasi>) => void;
  resetParameterSimulasi: () => void;
}

export type JambiJalanStore = JambiJalanState & JambiJalanActions;

function buatNilaiAwal(): JambiJalanState {
  return {
    koridorAktif: "K1",
    halteKeberangkatanId: HALTE_PER_KORIDOR.K1[0].id,
    jamSimulasiMenit: null,
    modeAksesibel: false,
    kontrasTinggi: false,
    suaraOtomatis: false,
    unitPramudiId: null,
    tripPramudiId: null,
    daftarHalte: HALTE.map((halte) => ({ ...halte })),
    armadaAktif: [],
    parameterSimulasi: { ...PARAMETER_SIMULASI_AWAL },
    revisi: 0,
    terakhirDiperbaruiMs: 0,
  };
}

function ambilStateTersimpan(state: JambiJalanState): JambiJalanState {
  return {
    koridorAktif: state.koridorAktif,
    halteKeberangkatanId: state.halteKeberangkatanId,
    jamSimulasiMenit: state.jamSimulasiMenit,
    modeAksesibel: state.modeAksesibel,
    kontrasTinggi: state.kontrasTinggi,
    suaraOtomatis: state.suaraOtomatis,
    unitPramudiId: state.unitPramudiId,
    tripPramudiId: state.tripPramudiId,
    daftarHalte: state.daftarHalte,
    armadaAktif: state.armadaAktif,
    parameterSimulasi: state.parameterSimulasi,
    revisi: state.revisi,
    terakhirDiperbaruiMs: state.terakhirDiperbaruiMs,
  };
}

function hitungPosisiArmada(
  daftarHalte: readonly Halte[],
  koridorId: KoridorId,
  indeks: number,
): { indeksHalteSekarang: number; lat: number; lng: number } | null {
  const halteKoridor = daftarHalte
    .filter((halte) => halte.koridorId === koridorId)
    .sort((a, b) => a.urutan - b.urutan);

  if (halteKoridor.length === 0) return null;

  const posisi = Math.min(Math.max(indeks, 1), halteKoridor.length);
  const koordinat = posisiInterpolasiHalte(halteKoridor, posisi);

  return {
    indeksHalteSekarang: posisi,
    lat: koordinat.lat,
    lng: koordinat.lng,
  };
}

export const useJambiJalanStore = create<JambiJalanStore>()(
  persist<JambiJalanStore, [], [], JambiJalanState>(
    (set) => {
      const ubah = (
        perubahan: (state: JambiJalanStore) => Partial<JambiJalanStore>,
      ) =>
        set((state) => {
          const patch = perubahan(state);
          if (Object.keys(patch).length === 0) return {};
          return {
            ...patch,
            revisi: state.revisi + 1,
            terakhirDiperbaruiMs: Date.now(),
          };
        });

      return {
        ...buatNilaiAwal(),

        setKoridorAktif: (koridorId) =>
          ubah((state) => {
            if (state.koridorAktif === koridorId) return {};

            const halteSaatIni = state.daftarHalte.find(
              (halte) =>
                halte.id === state.halteKeberangkatanId && halte.koridorId === koridorId,
            );
            const haltePengganti =
              halteSaatIni ??
              state.daftarHalte.find((halte) => halte.koridorId === koridorId);

            return {
              koridorAktif: koridorId,
              halteKeberangkatanId: haltePengganti?.id ?? "",
            };
          }),

        setHalteKeberangkatan: (halteId) =>
          ubah((state) => {
            const halte = state.daftarHalte.find((item) => item.id === halteId);
            if (!halte) return {};
            return {
              halteKeberangkatanId: halte.id,
              koridorAktif: halte.koridorId,
            };
          }),

        setJamSimulasiMenit: (menit) =>
          ubah(() => ({
            jamSimulasiMenit:
              menit === null ? null : Math.min(Math.max(Math.round(menit), 0), 1439),
          })),

        setModeAksesibel: (aktif) => ubah(() => ({ modeAksesibel: aktif })),
        setKontrasTinggi: (aktif) => ubah(() => ({ kontrasTinggi: aktif })),
        setSuaraOtomatis: (aktif) => ubah(() => ({ suaraOtomatis: aktif })),
        setUnitPramudiId: (unitId) => ubah(() => ({ unitPramudiId: unitId })),
        setTripPramudiId: (tripId) => ubah(() => ({ tripPramudiId: tripId })),

        mulaiTrip: (unit) =>
          ubah((state) => {
            const trip = JADWAL_MAP.get(unit.tripId);
            if (!trip) return {};

            const posisi = hitungPosisiArmada(state.daftarHalte, trip.koridorId, 1);
            if (!posisi) return {};

            const armadaBaru: StatusArmadaAktif = {
              busId: unit.busId,
              namaArmada: unit.namaArmada,
              jenis: unit.jenis,
              kapasitas: unit.kapasitas,
              koridorId: trip.koridorId,
              tripId: trip.id,
              statusTrip: "berjalan",
              indeksHalteSekarang: posisi.indeksHalteSekarang,
              lat: posisi.lat,
              lng: posisi.lng,
              terakhirDiperbaruiMs: Date.now(),
              sinyalDiputusSimulasi: false,
              antreanOfflineCount: 0,
            };

            return {
              armadaAktif: [
                ...state.armadaAktif.filter((armada) => armada.busId !== unit.busId),
                armadaBaru,
              ],
            };
          }),

        akhiriTrip: (busId) =>
          ubah((state) => ({
            armadaAktif: state.armadaAktif.map((armada) =>
              armada.busId === busId
                ? { ...armada, statusTrip: "selesai", terakhirDiperbaruiMs: Date.now() }
                : armada,
            ),
          })),

        perbaruiPosisi: (busId, indeksHalte) =>
          ubah((state) => {
            const armada = state.armadaAktif.find((item) => item.busId === busId);
            if (!armada) return {};

            if (armada.sinyalDiputusSimulasi) {
              return {
                armadaAktif: state.armadaAktif.map((item) =>
                  item.busId === busId
                    ? { ...item, antreanOfflineCount: item.antreanOfflineCount + 1 }
                    : item,
                ),
              };
            }

            const posisi = hitungPosisiArmada(
              state.daftarHalte,
              armada.koridorId,
              indeksHalte,
            );
            if (!posisi) return {};

            return {
              armadaAktif: state.armadaAktif.map((item) =>
                item.busId === busId
                  ? {
                      ...item,
                      ...posisi,
                      terakhirDiperbaruiMs: Date.now(),
                    }
                  : item,
              ),
            };
          }),

        majukanPosisi: (busId, deltaIndeks) =>
          ubah((state) => {
            const armada = state.armadaAktif.find((item) => item.busId === busId);
            if (!armada) return {};

            if (armada.sinyalDiputusSimulasi) {
              return {
                armadaAktif: state.armadaAktif.map((item) =>
                  item.busId === busId
                    ? { ...item, antreanOfflineCount: item.antreanOfflineCount + 1 }
                    : item,
                ),
              };
            }

            const posisi = hitungPosisiArmada(
              state.daftarHalte,
              armada.koridorId,
              armada.indeksHalteSekarang + deltaIndeks,
            );
            if (!posisi) return {};

            return {
              armadaAktif: state.armadaAktif.map((item) =>
                item.busId === busId
                  ? {
                      ...item,
                      ...posisi,
                      terakhirDiperbaruiMs: Date.now(),
                    }
                  : item,
              ),
            };
          }),

        setSinyalDiputus: (busId, putus) =>
          ubah((state) => ({
            armadaAktif: state.armadaAktif.map((armada) =>
              armada.busId === busId
                ? putus
                  ? { ...armada, sinyalDiputusSimulasi: true }
                  : {
                      ...armada,
                      sinyalDiputusSimulasi: false,
                      antreanOfflineCount: 0,
                      terakhirDiperbaruiMs: Date.now(),
                    }
                : armada,
            ),
          })),

        tambahHalte: (halte) =>
          ubah((state) => ({
            daftarHalte: [
              ...state.daftarHalte.filter((item) => item.id !== halte.id),
              { ...halte },
            ],
          })),

        ubahHalte: (id, perubahan) =>
          ubah((state) => ({
            daftarHalte: state.daftarHalte.map((halte) =>
              halte.id === id ? { ...halte, ...perubahan, id: halte.id } : halte,
            ),
          })),

        hapusHalte: (id) =>
          ubah((state) => {
            const sisa = state.daftarHalte.filter((halte) => halte.id !== id);
            const masihAda = sisa.some((halte) => halte.id === state.halteKeberangkatanId);
            const pengganti =
              sisa.find((halte) => halte.koridorId === state.koridorAktif) ?? sisa[0];

            return {
              daftarHalte: sisa,
              halteKeberangkatanId: masihAda
                ? state.halteKeberangkatanId
                : (pengganti?.id ?? ""),
            };
          }),

        kembalikanHaltePublik: () =>
          ubah(() => ({
            daftarHalte: HALTE.map((halte) => ({ ...halte })),
            halteKeberangkatanId: HALTE_PER_KORIDOR.K1[0].id,
            koridorAktif: "K1",
          })),

        setParameterSimulasi: (perubahan) =>
          ubah((state) => ({
            parameterSimulasi: { ...state.parameterSimulasi, ...perubahan },
          })),

        resetParameterSimulasi: () =>
          ubah(() => ({
            parameterSimulasi: { ...PARAMETER_SIMULASI_AWAL },
          })),
      };
    },
    {
      name: KUNCI_PENYIMPANAN,
      version: 1,
      skipHydration: true,
      storage: createJSONStorage(() => localStorage),
      partialize: ambilStateTersimpan,
      merge: (persisted, current) => {
        const tersimpan = (persisted ?? {}) as Partial<JambiJalanState>;
        return {
          ...current,
          ...tersimpan,
          daftarHalte:
            Array.isArray(tersimpan.daftarHalte) && tersimpan.daftarHalte.length > 0
              ? tersimpan.daftarHalte
              : current.daftarHalte,
          armadaAktif: Array.isArray(tersimpan.armadaAktif)
            ? tersimpan.armadaAktif
            : current.armadaAktif,
          parameterSimulasi: {
            ...current.parameterSimulasi,
            ...(tersimpan.parameterSimulasi ?? {}),
          },
        };
      },
    },
  ),
);

const SUMBER_TAB =
  typeof globalThis.crypto?.randomUUID === "function"
    ? globalThis.crypto.randomUUID()
    : `tab-${Math.random().toString(36).slice(2)}`;

let menerapkanEksternal = false;

function terapkanPayloadEksternal(payload: Record<string, unknown>): void {
  const lokal = useJambiJalanStore.getState();
  const revisi = typeof payload.revisi === "number" ? payload.revisi : 0;
  if (revisi <= lokal.revisi) return;

  const patch: Partial<JambiJalanState> = {
    revisi,
    terakhirDiperbaruiMs: Date.now(),
  };

  if (
    payload.koridorAktif === "K1" ||
    payload.koridorAktif === "K2" ||
    payload.koridorAktif === "K3"
  ) {
    patch.koridorAktif = payload.koridorAktif;
  }
  if (typeof payload.halteKeberangkatanId === "string") {
    patch.halteKeberangkatanId = payload.halteKeberangkatanId;
  }
  if (payload.jamSimulasiMenit === null || typeof payload.jamSimulasiMenit === "number") {
    patch.jamSimulasiMenit = payload.jamSimulasiMenit;
  }
  if (typeof payload.modeAksesibel === "boolean") {
    patch.modeAksesibel = payload.modeAksesibel;
  }
  if (typeof payload.kontrasTinggi === "boolean") {
    patch.kontrasTinggi = payload.kontrasTinggi;
  }
  if (typeof payload.suaraOtomatis === "boolean") {
    patch.suaraOtomatis = payload.suaraOtomatis;
  }
  if (payload.unitPramudiId === null || typeof payload.unitPramudiId === "string") {
    patch.unitPramudiId = payload.unitPramudiId;
  }
  if (payload.tripPramudiId === null || typeof payload.tripPramudiId === "string") {
    patch.tripPramudiId = payload.tripPramudiId;
  }
  if (Array.isArray(payload.daftarHalte)) {
    patch.daftarHalte = payload.daftarHalte as Halte[];
  }
  if (Array.isArray(payload.armadaAktif)) {
    patch.armadaAktif = payload.armadaAktif as StatusArmadaAktif[];
  }
  if (payload.parameterSimulasi && typeof payload.parameterSimulasi === "object") {
    patch.parameterSimulasi = {
      ...lokal.parameterSimulasi,
      ...(payload.parameterSimulasi as Partial<ParameterSimulasi>),
    };
  }

  menerapkanEksternal = true;
  try {
    useJambiJalanStore.setState(patch);
  } finally {
    menerapkanEksternal = false;
  }
}

if (typeof window !== "undefined") {
  const channel = buatChannel();

  berlanggananPembaruan(channel, (pesan) => {
    if (pesan.sumber === SUMBER_TAB) return;
    terapkanPayloadEksternal(pesan.payload);
  });

  pasangCadanganStorage((state) => {
    terapkanPayloadEksternal(state);
  });

  useJambiJalanStore.subscribe((state) => {
    if (menerapkanEksternal) return;
    kirimPembaruan(
      channel,
      ambilStateTersimpan(state) as unknown as Record<string, unknown>,
      SUMBER_TAB,
    );
  });
}
