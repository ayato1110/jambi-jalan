"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FeatureCollection, Point } from "geojson";
import type {
  Map as MapLibreMap,
  Marker as MapLibreMarker,
  StyleSpecification,
} from "maplibre-gl";
import { SkeletonBlock } from "@/components/ui/SkeletonBlock";
import type { Halte, Koridor, StatusArmadaAktif } from "@/lib/types";

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

export function CorridorMap({
  koridor,
  daftarHalte,
  selectedHalteId,
  onPilihHalte,
  armadaAktif,
}: {
  koridor: Koridor;
  daftarHalte: Halte[];
  selectedHalteId: string;
  onPilihHalte: (halteId: string) => void;
  armadaAktif: StatusArmadaAktif | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const modulRef = useRef<ModulPeta | null>(null);
  const busMarkerRef = useRef<MapLibreMarker | null>(null);
  const onPilihRef = useRef(onPilihHalte);
  const selectedRef = useRef(selectedHalteId);
  const daftarRef = useRef(daftarHalte);

  const [siap, setSiap] = useState(false);
  const [gagal, setGagal] = useState(false);
  const [percobaan, setPercobaan] = useState(0);

  const kunciHalte = useMemo(
    () => daftarHalte.map((halte) => `${halte.id}:${halte.lat}:${halte.lng}`).join("|"),
    [daftarHalte],
  );

  useEffect(() => {
    onPilihRef.current = onPilihHalte;
  }, [onPilihHalte]);

  useEffect(() => {
    daftarRef.current = daftarHalte;
  }, [daftarHalte]);

  useEffect(() => {
    selectedRef.current = selectedHalteId;
    const map = mapRef.current;
    if (!map || !siap || !map.getLayer("halte-terpilih")) return;

    map.setFilter("halte-terpilih", ["==", ["get", "id"], selectedHalteId]);
  }, [selectedHalteId, siap]);

  useEffect(() => {
    if (gagal || !containerRef.current) return;

    let dibatalkan = false;
    let batasWaktu = 0;
    const daftar = daftarRef.current;

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

          const koordinat = daftar.map((halte) => [halte.lng, halte.lat]);
          if (koordinat.length > 1) {
            map.addSource("rute-koridor", {
              type: "geojson",
              data: {
                type: "Feature",
                properties: {},
                geometry: {
                  type: "LineString",
                  coordinates: koordinat,
                },
              },
            });
            map.addLayer({
              id: "rute-garis",
              type: "line",
              source: "rute-koridor",
              paint: {
                "line-color": koridor.warnaHex,
                "line-width": 4,
                "line-opacity": 0.95,
              },
            });
          }

          if (daftar.length > 0) {
            const fitur: FeatureCollection<Point> = {
              type: "FeatureCollection",
              features: daftar.map((halte) => ({
                type: "Feature",
                properties: {
                  id: halte.id,
                  nama: halte.nama,
                  urutan: halte.urutan,
                },
                geometry: {
                  type: "Point",
                  coordinates: [halte.lng, halte.lat],
                },
              })),
            };

            map.addSource("halte", { type: "geojson", data: fitur });
            map.addLayer({
              id: "halte-lingkaran",
              type: "circle",
              source: "halte",
              paint: {
                "circle-radius": 5,
                "circle-color": koridor.warnaHex,
                "circle-stroke-width": 2,
                "circle-stroke-color": "#FFFFFF",
              },
            });
            map.addLayer({
              id: "halte-hit",
              type: "circle",
              source: "halte",
              paint: {
                "circle-radius": 12,
                "circle-color": koridor.warnaHex,
                "circle-opacity": 0.01,
              },
            });
            map.addLayer({
              id: "halte-terpilih",
              type: "circle",
              source: "halte",
              filter: ["==", ["get", "id"], selectedRef.current],
              paint: {
                "circle-radius": 9,
                "circle-color": koridor.warnaHex,
                "circle-stroke-width": 3,
                "circle-stroke-color": "#111C18",
              },
            });
          }

          map.on("click", (event) => {
            const terpilih = map.queryRenderedFeatures(event.point, {
              layers: ["halte-hit"],
            });
            const id = terpilih[0]?.properties?.id;
            if (typeof id === "string") onPilihRef.current(id);
          });

          map.on("mouseenter", "halte-hit", () => {
            map.getCanvas().style.cursor = "pointer";
          });
          map.on("mouseleave", "halte-hit", () => {
            map.getCanvas().style.cursor = "";
          });

          if (daftar.length > 0) {
            const batas = new maplibregl.LngLatBounds();
            for (const halte of daftar) {
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
      busMarkerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
      modulRef.current = null;
      setSiap(false);
    };
  }, [gagal, koridor.warnaHex, kunciHalte, percobaan]);

  useEffect(() => {
    if (!siap) return;

    const map = mapRef.current;
    const maplibregl = modulRef.current;
    if (!map || !maplibregl) return;

    busMarkerRef.current?.remove();
    busMarkerRef.current = null;

    if (!armadaAktif) return;

    const elemen = document.createElement("div");
    elemen.className = "jj-map-bus";
    elemen.textContent = "BUS";
    elemen.setAttribute("role", "img");
    elemen.setAttribute("aria-label", `Posisi ${armadaAktif.namaArmada}`);

    busMarkerRef.current = new maplibregl.Marker({ element: elemen, anchor: "center" })
      .setLngLat([armadaAktif.lng, armadaAktif.lat])
      .addTo(map);
  }, [armadaAktif, siap]);

  if (gagal) {
    return (
      <section
        aria-label="Bagan rute skematik"
        className="min-w-0 rounded-xl border border-line bg-surface p-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-ink">Bagan Rute Skematik</h2>
          <span className="rounded-md border border-line bg-elevated px-2 py-0.5 text-xs font-semibold text-ink-secondary">
            Peta tidak tersedia
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
          Peta tidak dapat dimuat. Garis koridor dan seluruh titik halte tetap ditampilkan di sini.
        </p>

        {daftarHalte.length > 0 ? (
          <>
            <div className="mt-4 max-w-full overflow-x-auto pb-2">
              <div className="flex min-w-max items-center">
                {daftarHalte.map((halte, indeks) => {
                  const dipilih = halte.id === selectedHalteId;

                  return (
                    <div key={halte.id} className="flex items-center">
                      <button
                        type="button"
                        onClick={() => onPilihHalte(halte.id)}
                        aria-label={`Halte ${halte.urutan}: ${halte.nama}`}
                        aria-current={dipilih ? "true" : undefined}
                        className="grid min-h-11 min-w-11 place-items-center rounded-lg hover:bg-elevated"
                      >
                        <span
                          className="grid size-8 place-items-center rounded-full border-2 text-[0.625rem] font-bold"
                          style={{
                            borderColor: koridor.warnaHex,
                            backgroundColor: dipilih ? koridor.warnaHex : "var(--bg-surface)",
                            color: dipilih ? "#FFFFFF" : "var(--text-primary)",
                          }}
                        >
                          {halte.urutan}
                        </span>
                      </button>
                      {indeks < daftarHalte.length - 1 ? (
                        <span
                          aria-hidden="true"
                          className="h-1 w-5 shrink-0"
                          style={{ backgroundColor: koridor.warnaHex }}
                        />
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-ink-secondary">
              <span>{daftarHalte[0].nama}</span>
              <span>{daftarHalte[daftarHalte.length - 1].nama}</span>
            </div>
          </>
        ) : (
          <p className="mt-4 text-sm text-ink-secondary">Belum ada titik halte untuk koridor ini.</p>
        )}

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
        aria-label={`Peta koridor ${koridor.id}, ${koridor.asal} menuju ${koridor.tujuan}`}
        className="relative min-w-0 overflow-hidden rounded-xl border border-line bg-elevated"
      >
        <div
          ref={containerRef}
          className="h-[300px] w-full sm:h-[380px] lg:h-[440px]"
          aria-label="Peta interaktif. Titik halte dapat diketuk atau dipilih dari daftar Urutan Halte."
        />
        {!siap ? (
          <div className="absolute inset-0 grid place-items-center p-4">
            <SkeletonBlock className="w-full max-w-sm" baris={4} label="Memuat peta koridor" />
          </div>
        ) : null}
        <div className="pointer-events-none absolute left-3 top-3 rounded-md border border-line bg-surface px-2 py-1 text-xs font-semibold text-ink">
          {koridor.id}, via {koridor.via}
        </div>
        <p className="sr-only">
          Peta visual. Untuk memilih halte dengan papan ketik atau pembaca layar, gunakan daftar
          Urutan Halte di bawah peta. Daftar itu memuat semua halte dan ETA.
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
        . Ketuk titik atau nama halte untuk melihat estimasi waktu tiba di setiap pemberhentian.
      </p>
    </div>
  );
}
