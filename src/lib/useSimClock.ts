"use client";

import { useEffect, useState } from "react";

export interface SimClock {
  menit: number;
  detik: number;
  ms: number;
  siap: boolean;
}

function menitDariWaktu(ms: number): number {
  const waktu = new Date(ms);
  return waktu.getHours() * 60 + waktu.getMinutes() + waktu.getSeconds() / 60;
}

export function useSimClock(jamSimulasiMenit: number | null): SimClock {
  const [jam, setJam] = useState<SimClock>({
    menit: 0,
    detik: 0,
    ms: 0,
    siap: false,
  });

  useEffect(() => {
    const mulaiMs = Date.now();
    const menitAwal = jamSimulasiMenit ?? menitDariWaktu(mulaiMs);

    const hitung = () => {
      const sekarangMs = Date.now();
      const menit = menitAwal + (sekarangMs - mulaiMs) / 60_000;

      setJam({
        menit,
        detik: Math.floor((menit * 60) % 60),
        ms: sekarangMs,
        siap: true,
      });
    };

    hitung();
    const interval = window.setInterval(hitung, 1_000);
    return () => window.clearInterval(interval);
  }, [jamSimulasiMenit]);

  return jam;
}
