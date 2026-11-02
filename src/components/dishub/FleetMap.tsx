"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { useEffect, useMemo, useRef, useState } from "react";
import type {
  Map as MapLibreMap,
  Marker as MapLibreMarker,
  StyleSpecification,
} from "maplibre-gl";
import { SkeletonBlock } from "@/components/ui/SkeletonBlock";
import { KORIDOR, KORIDOR_MAP } from "@/data/koridor";
import type { Halte, StatusArmadaAktif } from "@/lib/types";

type ModulPeta = typeof import("maplibre-gl");

const GAYA_OSM: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [
    {
      id: "osm",
      type: "raster",
      source: "osm",
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

export function FleetMap({
  daftarHalte,
  armadaAktif,
}: {
  daftarHalte: Halte[];
  armadaAktif: StatusArmadaAktif[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const modulRef = useRef<ModulPeta | null>(null);
  const busMarkersRef = useRef<MapLibreMarker[]>([]);
  const daftarRef = useRef(daftarHalte);

  const [siap, setSiap] = useState(false);
  const [gagal, setGagal] = useState(false);
  const [percobaan, setPercobaan] = useState(0);

  const rute = useMemo(
    () =>
      KORIDOR.map((koridor) => ({
        koridor,
        halte: daftarHalte
          .filter((halte) => halte.koridorId === koridor.id)
          .sort((a, b) => a.urutan - b.urutan),
      })),
    [daftarHalte],
  );

  useEffect(() => {
    daftarRef.current = daftarHalte;
  }, [daftarHalte]);

  useEffect(() => {
    if (gagal || !containerRef.current) return;

    let dibatalkan = false;
    let batasWaktu = 0;

    const muat = async () => {
      try {
        const maplibregl = await import("maplibre-gl");
        if (dibatalkan || !containerRef.current) return;

        maplibregl.setWorkerUrl("/maplibre-gl-worker.mjs");
        modulRef.current = maplibregl;

        const map = new maplibregl.Map({
          container: containerRef.current,
          style: GAYA_OSM,
          center: [103.598, -1.62],
          zoom: 11,
          attributionControl: false,
        });

        mapRef.current = map;
        map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

        batasWaktu = window.setTimeout(() => {
          if (!dibatalkan && !map.loaded()) setGagal(true);
        }, 9_000);

        map.on("error", () => {
          if (!dibatalkan) setGagal(true);
        });

        map.on("load", () => {
          if (dibatalkan) return;
          window.clearTimeout(batasWaktu);

          const semuaTitik = daftarRef.current;
          for (const { koridor, halte } of rute) {
            if (halte.length < 2) continue;

            map.addSource(`rute-${koridor.id}`, {
              type: "geojson",
              data: {
                type: "Feature",
                properties: {},
                geometry: {
                  type: "LineString",
                  coordinates: halte.map((item) => [item.lng, item.lat]),
                },
              },
            });
            map.addLayer({
              id: `rute-${koridor.id}`,
              type: "line",
              source: `rute-${koridor.id}`,
              paint: {
                "line-color": koridor.warnaHex,
                "line-width": 4,
                "line-opacity": 0.9,
              },
            });
          }

          if (semuaTitik.length > 0) {
            const batas = new maplibregl.LngLatBounds();
            for (const halte of semuaTitik) {
              batas.extend([halte.lng, halte.lat]);
            }
            map.fitBounds(batas, { padding: 36, duration: 0 });
          }

          setSiap(true);
        });
      } catch {
        if (!dibatalkan) setGagal(true);
      }
    };

    void muat();

    return () => {
      dibatalkan = true;
      window.clearTimeout(batasWaktu);
      busMarkersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
      modulRef.current = null;
      setSiap(false);
    };
  }, [gagal, percobaan, rute]);

  useEffect(() => {
    if (!siap) return;

    const map = mapRef.current;
    const maplibregl = modulRef.current;
    if (!map || !maplibregl) return;

    for (const marker of busMarkersRef.current) marker.remove();
    busMarkersRef.current = [];

    for (const armada of armadaAktif) {
      if (armada.statusTrip !== "berjalan") continue;

      const koridor = KORIDOR_MAP[armada.koridorId];
      const elemen = document.createElement("div");
      elemen.className = "jj-map-bus";
      elemen.textContent = "BUS";
      elemen.style.backgroundColor = koridor.warnaHex;
      elemen.setAttribute("role", "img");
      elemen.setAttribute("aria-label", `Posisi ${armada.namaArmada} di ${armada.koridorId}`);

      const marker = new maplibregl.Marker({ element: elemen, anchor: "center" })
        .setLngLat([armada.lng, armada.lat])
        .addTo(map);
      busMarkersRef.current.push(marker);
    }
  }, [armadaAktif, siap]);

  if (gagal) {
    return (
      <section
        aria-label="Bagan status koridor"
        className="rounded-xl border border-line bg-surface p-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-ink">Peta Armada Tidak Tersedia</h2>
          <span className="rounded-md border border-line bg-elevated px-2 py-0.5 text-xs font-semibold text-ink-secondary">
            Mode bagan
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
          Peta tidak dapat dimuat. Ringkasan koridor tetap ditampilkan, dan tabel status di bawah
          tetap berfungsi.
        </p>
        <ul className="mt-4 divide-y divide-line">
          {rute.map(({ koridor, halte }) => {
            const aktif = armadaAktif.filter(
              (armada) => armada.koridorId === koridor.id && armada.statusTrip === "berjalan",
            ).length;
            return (
              <li key={koridor.id} className="flex items-center gap-3 py-3">
                <span
                  className="inline-block size-3 shrink-0 rounded-full"
                  style={{ backgroundColor: koridor.warnaHex }}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">
                    {koridor.id}, {koridor.nama}
                  </p>
                  <p className="text-xs text-ink-muted">
                    {halte.length} halte, {aktif} armada berjalan
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          onClick={() => {
            setGagal(false);
            setSiap(false);
            setPercobaan((nilai) => nilai + 1);
          }}
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg border border-line-strong bg-surface px-4 text-sm font-semibold text-ink hover:bg-elevated active:translate-y-px"
        >
          Coba Muat Peta Lagi
        </button>
      </section>
    );
  }

  return (
    <div className="min-w-0">
      <div
        role="region"
        aria-label="Peta tiga koridor dan posisi armada aktif"
        className="relative min-w-0 overflow-hidden rounded-xl border border-line bg-elevated"
      >
        <div
          ref={containerRef}
          className="h-[320px] w-full md:h-[420px]"
          aria-label="Peta tiga koridor. Penanda BUS menunjukkan posisi armada aktif."
        />
        {!siap ? (
          <div className="absolute inset-0 grid place-items-center p-4">
            <SkeletonBlock className="w-full max-w-sm" baris={4} label="Memuat peta armada" />
          </div>
        ) : null}

        <div className="pointer-events-none absolute left-3 top-3 rounded-md border border-line bg-surface/95 p-2 text-xs">
          <p className="font-semibold text-ink">Koridor</p>
          <ul className="mt-1 space-y-1">
            {rute.map(({ koridor, halte }) => (
              <li key={koridor.id} className="flex items-center gap-1.5 text-ink-secondary">
                <span
                  aria-hidden="true"
                  className="inline-block h-1 w-4 rounded-full"
                  style={{ backgroundColor: koridor.warnaHex }}
                />
                {koridor.id}, {halte.length} halte
              </li>
            ))}
          </ul>
        </div>

        <p className="sr-only">
          Peta visual. Tabel status armada di bawah memuat rincian trip, unit, dan sinyal.
        </p>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-ink-muted">
        Peta:{" "}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center underline decoration-line underline-offset-4 hover:text-ink"
        >
          © OpenStreetMap contributors
        </a>
        . Posisi armada diperbarui dari panel pramudi.
      </p>
    </div>
  );
}
