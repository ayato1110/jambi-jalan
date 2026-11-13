import type { Marker } from "maplibre-gl";

const framePerMarker = new WeakMap<Marker, number>();

export function geserMarker(
  marker: Marker,
  tujuan: [number, number],
  durasiMs = 850,
): void {
  const frameLama = framePerMarker.get(marker);
  if (frameLama) window.cancelAnimationFrame(frameLama);

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    marker.setLngLat(tujuan);
    framePerMarker.delete(marker);
    return;
  }

  const awal = marker.getLngLat();
  const mulai = performance.now();

  const langkah = (sekarang: number) => {
    const rasio = Math.min(1, (sekarang - mulai) / durasiMs);
    const halus = 1 - (1 - rasio) ** 3;
    marker.setLngLat([
      awal.lng + (tujuan[0] - awal.lng) * halus,
      awal.lat + (tujuan[1] - awal.lat) * halus,
    ]);

    if (rasio < 1) {
      framePerMarker.set(marker, window.requestAnimationFrame(langkah));
    } else {
      framePerMarker.delete(marker);
    }
  };

  framePerMarker.set(marker, window.requestAnimationFrame(langkah));
}
