/**
 * localStorage に保存される小さな外部ストア。
 * React からは useSyncExternalStore で購読する（SSR 時は初期値を返す）。
 *
 * 将来「トレード日誌」「生徒別履歴」などをローカル保存する場合も
 * 同じ仕組みで createPersistentStore を増やすだけでよい。
 */

export interface PersistentStore<T> {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => T;
  getServerSnapshot: () => T;
  set: (next: T | ((prev: T) => T)) => void;
  /** テスト用：メモリ上のキャッシュを破棄して再読込させる */
  reset: () => void;
}

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function defaultStorage(): StorageLike | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

export function createPersistentStore<T>(
  key: string,
  initial: T,
  sanitize: (raw: unknown) => T,
  storage: () => StorageLike | null = defaultStorage,
): PersistentStore<T> {
  let value: T = initial;
  let loaded = false;
  const listeners = new Set<() => void>();

  function load() {
    if (loaded) return;
    loaded = true;
    try {
      const raw = storage()?.getItem(key) ?? null;
      if (raw !== null) value = sanitize(JSON.parse(raw));
    } catch {
      value = initial;
    }
  }

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot() {
      load();
      return value;
    },
    getServerSnapshot() {
      return initial;
    },
    set(next) {
      load();
      const resolved =
        typeof next === "function" ? (next as (prev: T) => T)(value) : next;
      if (Object.is(resolved, value)) return;
      value = resolved;
      try {
        storage()?.setItem(key, JSON.stringify(value));
      } catch {
        // 保存できなくてもアプリは動かす
      }
      listeners.forEach((l) => l());
    },
    reset() {
      loaded = false;
      value = initial;
    },
  };
}
