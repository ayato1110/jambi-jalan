"use client";

import { useSyncExternalStore } from "react";
import { useJambiJalanStore } from "@/store/useJambiJalanStore";

export function useStoreHydrated(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => useJambiJalanStore.persist.onFinishHydration(onStoreChange),
    () => useJambiJalanStore.persist.hasHydrated(),
    () => false,
  );
}
