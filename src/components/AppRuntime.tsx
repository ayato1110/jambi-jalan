"use client";

import { useEffect } from "react";
import { useJambiJalanStore } from "@/store/useJambiJalanStore";

export function AppRuntime() {
  const modeAksesibel = useJambiJalanStore((state) => state.modeAksesibel);
  const kontrasTinggi = useJambiJalanStore((state) => state.kontrasTinggi);

  useEffect(() => {
    void Promise.resolve(useJambiJalanStore.persist.rehydrate()).catch(() => undefined);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("mode-aksesibel", modeAksesibel);
  }, [modeAksesibel]);

  useEffect(() => {
    document.documentElement.classList.toggle("kontras-tinggi", kontrasTinggi);
  }, [kontrasTinggi]);

  return null;
}
