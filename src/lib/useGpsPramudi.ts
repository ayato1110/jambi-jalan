"use client";

import { useEffect, useRef, useState } from "react";

export type StatusGps = "nonaktif" | "meminta-izin" | "aktif" | "ditolak" | "tidak-tersedia";

export function useGpsPramudi({
  busId,
  aktif,
  onPosisi,
}: {
  busId: string;
  aktif: boolean;
  onPosisi: (posisi: { lat: number; lng: number; akurasiMeter: number }) => void;
}) {
  const [status, setStatus] = useState<StatusGps>(() =>
    typeof navigator === "undefined" || "geolocation" in navigator ? "nonaktif" : "tidak-tersedia",
  );
  const [akurasi, setAkurasi] = useState<number | null>(null);
  const watchRef = useRef<number | null>(null);
  const onPosisiRef = useRef(onPosisi);

  useEffect(() => {
    onPosisiRef.current = onPosisi;
  }, [onPosisi]);

  useEffect(() => {
    if (!aktif || !busId || !("geolocation" in navigator)) return;

    watchRef.current = navigator.geolocation.watchPosition(
      (posisi) => {
        setStatus("aktif");
        setAkurasi(Math.round(posisi.coords.accuracy));
        onPosisiRef.current({
          lat: posisi.coords.latitude,
          lng: posisi.coords.longitude,
          akurasiMeter: Math.round(posisi.coords.accuracy),
        });
      },
      (error) => {
        setStatus(error.code === error.PERMISSION_DENIED ? "ditolak" : "tidak-tersedia");
        setAkurasi(null);
        if (watchRef.current !== null) {
          navigator.geolocation.clearWatch(watchRef.current);
          watchRef.current = null;
        }
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 5_000 },
    );

    return () => {
      if (watchRef.current !== null) {
        navigator.geolocation.clearWatch(watchRef.current);
        watchRef.current = null;
      }
    };
  }, [aktif, busId]);

  return { status, akurasi };
}
