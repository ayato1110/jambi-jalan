"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Map as MapLibreMap, Marker as MapLibreMarker } from "maplibre-gl";
import { GAYA_OSM } from "@/components/penumpang/CorridorMap";
import { RUTE_JALAN } from "@/data/ruteJalan";
import { geserMarker } from "@/lib/animasiPeta";
import type { Halte, Koridor, StatusArmadaAktif } from "@/lib/types";

export function MiniCorridorMap({
  koridor,
  daftarHalte,
  armadaAktif,
}: {
  koridor: Koridor;
  daftarHalte: Halte[];
  armadaAktif: StatusArmadaAktif | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const busRef = useRef<MapLibreMarker | null>(null);
  const busIdRef = useRef<string | null>(null);
  const [terlihat, setTerlihat] = useState(false);
  const [siap, setSiap] = useState(false);
  const [gagal, setGagal] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || !("IntersectionObserver" in window)) {
      setTerlihat(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTerlihat(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!terlihat || gagal || !containerRef.current) return;

    let dibatalkan = false;
    let batasWaktu = 0;

    const muat = async () => {
      try {
        const maplibregl = await import("maplibre-gl");
        if (dibatalkan || !containerRef.current) return;

        maplibregl.setWorkerUrl("/maplibre-gl-worker.mjs");
        const map = new maplibregl.Map({
          container: containerRef.current,
          style: GAYA_OSM,
          center: [103.598, -1.62],
          zoom: 11,
          interactive: false,
          attributionControl: false,
        });
        mapRef.current = map;

        batasWaktu = window.setTimeout(() => {
          if (!dibatalkan && !map.loaded()) setGagal(true);
        }, 7_000);

        map.on("error", () => {
          if (!dibatalkan) setGagal(true);
        });

        map.on("load", () => {
          if (dibatalkan) return;
          window.clearTimeout(batasWaktu);

          const koordinat =
            RUTE_JALAN[koridor.id]?.koordinat ??
            daftarHalte.map((halte) => [halte.lng, halte.lat] as [number, number]);

          if (koordinat.length > 1) {
            map.addSource("mini-rute", {
              type: "geojson",
              data: {
                type: "Feature",
                properties: {},
                geometry: { type: "LineString", coordinates: koordinat },
              },
            });
            map.addLayer({
              id: "mini-rute",
              type: "line",
              source: "mini-rute",
              paint: {
                "line-color": koridor.warnaHex,
                "line-width": 3.5,
                "line-opacity": 0.95,
              },
            });

            const batas = new maplibregl.LngLatBounds();
            for (const titik of koordinat) batas.extend(titik);
            map.fitBounds(batas, { padding: 24, duration: 0 });
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
      busRef.current = null;
      busIdRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
      setSiap(false);
    };
  }, [daftarHalte, gagal, koridor.id, koridor.warnaHex, terlihat]);

  useEffect(() => {
    if (!siap) return;

    const map = mapRef.current;
    if (!map) return;

    if (!armadaAktif) {
      busRef.current?.remove();
      busRef.current = null;
      busIdRef.current = null;
      return;
    }

    if (busRef.current && busIdRef.current === armadaAktif.busId) {
      geserMarker(busRef.current, [armadaAktif.lng, armadaAktif.lat], 700);
      return;
    }

    busRef.current?.remove();
    const node = document.createElement("div");
    node.className = "jj-map-bus";
    node.textContent = "BUS";
    node.setAttribute("aria-label", `Posisi ${armadaAktif.namaArmada}`);

    import("maplibre-gl").then((maplibregl) => {
      if (!mapRef.current) return;
      busRef.current = new maplibregl.Marker({ element: node, anchor: "center" })
        .setLngLat([armadaAktif.lng, armadaAktif.lat])
        .addTo(mapRef.current);
      busIdRef.current = armadaAktif.busId;
    });
  }, [armadaAktif, siap]);

  if (gagal) {
    return <MiniRouteSketch koridor={koridor} armadaAktif={armadaAktif} />;
  }

  return (
    <section
      aria-label={`Peta mini ${koridor.kode} via ${koridor.via}`}
      className="relative overflow-hidden rounded-xl border border-line bg-surface"
    >
      <div ref={containerRef} className="h-[190px] w-full" />
      {!siap ? (
        <div className="absolute inset-0 grid place-items-center bg-elevated text-xs font-medium text-ink-muted">
          Memuat peta mini...
        </div>
      ) : null}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between gap-2 bg-gradient-to-b from-surface via-surface/80 to-transparent px-3 py-2">
        <span className="rounded bg-surface/95 px-2 py-0.5 text-[0.6875rem] font-semibold text-ink">
          {koridor.kode} via {koridor.via}
        </span>
        <span className="text-[0.6875rem] font-medium text-ink-muted">Peta mini</span>
      </div>
      <Link
        href="/peta"
        className="absolute bottom-2 right-2 inline-flex min-h-9 items-center rounded-lg border border-line bg-surface/95 px-2.5 text-xs font-semibold text-ink hover:bg-elevated"
      >
        Buka peta lengkap
      </Link>
      <span className="pointer-events-none absolute bottom-2 left-2 rounded bg-surface/90 px-1.5 py-0.5 text-[0.6875rem] text-ink-muted">
        © OpenStreetMap
      </span>
    </section>
  );
}

function MiniRouteSketch({
  koridor,
  armadaAktif,
}: {
  koridor: Koridor;
  armadaAktif: StatusArmadaAktif | null;
}) {
  const koordinat = RUTE_JALAN[koridor.id]?.koordinat ?? [];
  if (koordinat.length < 2) return null;

  const lngs = koordinat.map(([lng]) => lng);
  const lats = koordinat.map(([, lat]) => lat);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const lebar = maxLng - minLng || 1;
  const tinggi = maxLat - minLat || 1;
  const proyeksi = ([lng, lat]: [number, number]) =>
    [
      ((lng - minLng) / lebar) * 300 + 10,
      ((maxLat - lat) / tinggi) * 130 + 10,
    ] as const;
  const titik = koordinat.map((item) => proyeksi(item).join(",")).join(" ");
  const awal = proyeksi(koordinat[0]);
  const akhir = proyeksi(koordinat[koordinat.length - 1]);
  const busX = armadaAktif ? proyeksi([armadaAktif.lng, armadaAktif.lat])[0] : null;
  const busY = armadaAktif ? proyeksi([armadaAktif.lng, armadaAktif.lat])[1] : null;

  return (
    <section
      aria-label={`Bagan mini ${koridor.kode} via ${koridor.via}`}
      className="relative overflow-hidden rounded-xl border border-line bg-surface"
    >
      <svg viewBox="0 0 320 160" className="h-[190px] w-full bg-elevated" aria-hidden="true">
        <polyline points={titik} fill="none" stroke={koridor.warnaHex} strokeWidth="4" strokeLinejoin="round" />
        <circle cx={awal[0]} cy={awal[1]} r="5" fill={koridor.warnaHex} />
        <circle cx={akhir[0]} cy={akhir[1]} r="5" fill={koridor.warnaHex} />
        {busX !== null && busY !== null ? (
          <circle cx={busX} cy={busY} r="9" fill="#111C18" stroke="#FFFFFF" strokeWidth="3" />
        ) : null}
      </svg>
      <span className="absolute left-3 top-3 rounded bg-surface/95 px-2 py-0.5 text-[0.6875rem] font-semibold text-ink">
        {koridor.kode} via {koridor.via}
      </span>
      <Link
        href="/peta"
        className="absolute bottom-2 right-2 inline-flex min-h-9 items-center rounded-lg border border-line bg-surface/95 px-2.5 text-xs font-semibold text-ink hover:bg-elevated"
      >
        Buka peta lengkap
      </Link>
      <span className="pointer-events-none absolute bottom-2 left-2 rounded bg-surface/90 px-1.5 py-0.5 text-[0.6875rem] text-ink-muted">
        © OpenStreetMap
      </span>
    </section>
  );
}
