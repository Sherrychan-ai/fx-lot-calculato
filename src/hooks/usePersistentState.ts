"use client";

import { useSyncExternalStore } from "react";
import type { PersistentStore } from "@/lib/storage/persistentStore";

/**
 * createPersistentStore で作ったストアを React から使う。
 * SSR / hydration 中は初期値、その後 localStorage の値に切り替わる。
 */
export function usePersistentState<T>(
  store: PersistentStore<T>,
): [T, PersistentStore<T>["set"]] {
  const value = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
  return [value, store.set];
}
