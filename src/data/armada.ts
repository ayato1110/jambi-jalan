export interface ArmadaUnit {
  id: string;
  nama: string;
  jenis: "bus_medium" | "angkot_listrik";
  kapasitas: number;
  pengadaan: "awal_2025" | "tambahan_oktober_2025";
  sumber: string;
}

export const KAPASITAS_BUS_MEDIUM = 26;
export const KAPASITAS_ANGKOT_LISTRIK = 10;

export const ARMADA_AWAL: ArmadaUnit[] = [
  {
    id: "BUS-01",
    nama: "Bus Listrik Medium 01 (26 Kursi)",
    jenis: "bus_medium",
    kapasitas: KAPASITAS_BUS_MEDIUM,
    pengadaan: "awal_2025",
    sumber: "Kalista, 2025",
  },
  {
    id: "BUS-02",
    nama: "Bus Listrik Medium 02 (26 Kursi)",
    jenis: "bus_medium",
    kapasitas: KAPASITAS_BUS_MEDIUM,
    pengadaan: "awal_2025",
    sumber: "Kalista, 2025",
  },
  {
    id: "BUS-03",
    nama: "Bus Listrik Medium 03 (26 Kursi)",
    jenis: "bus_medium",
    kapasitas: KAPASITAS_BUS_MEDIUM,
    pengadaan: "awal_2025",
    sumber: "Kalista, 2025",
  },
  {
    id: "ANGKOT-01",
    nama: "Angkot Listrik 01 (10 Kursi)",
    jenis: "angkot_listrik",
    kapasitas: KAPASITAS_ANGKOT_LISTRIK,
    pengadaan: "awal_2025",
    sumber: "Kalista, 2025",
  },
  {
    id: "ANGKOT-02",
    nama: "Angkot Listrik 02 (10 Kursi)",
    jenis: "angkot_listrik",
    kapasitas: KAPASITAS_ANGKOT_LISTRIK,
    pengadaan: "awal_2025",
    sumber: "Kalista, 2025",
  },
  {
    id: "ANGKOT-03",
    nama: "Angkot Listrik 03 (10 Kursi)",
    jenis: "angkot_listrik",
    kapasitas: KAPASITAS_ANGKOT_LISTRIK,
    pengadaan: "awal_2025",
    sumber: "Kalista, 2025",
  },
];

export const ARMADA_TAMBAHAN_OKTOBER_2025: ArmadaUnit[] = [
  {
    id: "BUS-04",
    nama: "Bus Listrik Medium 04 (26 Kursi)",
    jenis: "bus_medium",
    kapasitas: KAPASITAS_BUS_MEDIUM,
    pengadaan: "tambahan_oktober_2025",
    sumber: "Kalista, 2025",
  },
  {
    id: "ANGKOT-04",
    nama: "Angkot Listrik 04 (10 Kursi)",
    jenis: "angkot_listrik",
    kapasitas: KAPASITAS_ANGKOT_LISTRIK,
    pengadaan: "tambahan_oktober_2025",
    sumber: "Kalista, 2025",
  },
  {
    id: "ANGKOT-05",
    nama: "Angkot Listrik 05 (10 Kursi)",
    jenis: "angkot_listrik",
    kapasitas: KAPASITAS_ANGKOT_LISTRIK,
    pengadaan: "tambahan_oktober_2025",
    sumber: "Kalista, 2025",
  },
  {
    id: "ANGKOT-06",
    nama: "Angkot Listrik 06 (10 Kursi)",
    jenis: "angkot_listrik",
    kapasitas: KAPASITAS_ANGKOT_LISTRIK,
    pengadaan: "tambahan_oktober_2025",
    sumber: "Kalista, 2025",
  },
];

export const ARMADA_LENGKAP: ArmadaUnit[] = [
  ...ARMADA_AWAL,
  ...ARMADA_TAMBAHAN_OKTOBER_2025,
];

export const JUMLAH_BUS_AWAL = ARMADA_AWAL.filter((unit) => unit.jenis === "bus_medium").length;
export const JUMLAH_ANGKOT_AWAL = ARMADA_AWAL.filter(
  (unit) => unit.jenis === "angkot_listrik",
).length;
export const JUMLAH_BUS_LENGKAP = ARMADA_LENGKAP.filter(
  (unit) => unit.jenis === "bus_medium",
).length;
export const JUMLAH_ANGKOT_LENGKAP = ARMADA_LENGKAP.filter(
  (unit) => unit.jenis === "angkot_listrik",
).length;
