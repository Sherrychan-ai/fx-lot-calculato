import { describe, expect, it } from "vitest";
import { createPersistentStore } from "../persistentStore";

function fakeStorage(seed: Record<string, string> = {}) {
  const map = new Map(Object.entries(seed));
  return {
    map,
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => {
      map.set(k, v);
    },
  };
}

type State = { n: number };
const sanitize = (raw: unknown): State =>
  raw && typeof raw === "object" && typeof (raw as State).n === "number"
    ? { n: (raw as State).n }
    : { n: 0 };

describe("createPersistentStore", () => {
  it("保存済みの値を読み込む", () => {
    const st = fakeStorage({ k: JSON.stringify({ n: 5 }) });
    const store = createPersistentStore("k", { n: 0 }, sanitize, () => st);
    expect(store.getServerSnapshot()).toEqual({ n: 0 });
    expect(store.getSnapshot()).toEqual({ n: 5 });
  });

  it("set で保存され、購読者に通知される", () => {
    const st = fakeStorage();
    const store = createPersistentStore("k", { n: 0 }, sanitize, () => st);
    let calls = 0;
    const unsub = store.subscribe(() => calls++);
    store.set({ n: 1 });
    store.set((prev) => ({ n: prev.n + 1 }));
    expect(store.getSnapshot()).toEqual({ n: 2 });
    expect(JSON.parse(st.map.get("k")!)).toEqual({ n: 2 });
    expect(calls).toBe(2);
    unsub();
    store.set({ n: 3 });
    expect(calls).toBe(2);
  });

  it("壊れた JSON でも例外にならず初期値になる", () => {
    const st = fakeStorage({ k: "{not json" });
    const store = createPersistentStore("k", { n: 0 }, sanitize, () => st);
    expect(store.getSnapshot()).toEqual({ n: 0 });
  });

  it("localStorage が使えなくても動く", () => {
    const store = createPersistentStore("k", { n: 0 }, sanitize, () => null);
    expect(store.getSnapshot()).toEqual({ n: 0 });
    expect(() => store.set({ n: 9 })).not.toThrow();
    expect(store.getSnapshot()).toEqual({ n: 9 });
  });
});
