import { describe, expect, it } from "vitest";
import { floorLots, floorPips, lotStepDecimals } from "../rounding";

describe("floorLots", () => {
  it("1.876 LOT を 0.1 単位で切り捨てると 1.8（1.9 にはしない）", () => {
    expect(floorLots(1.876, 0.1)).toBe(1.8);
  });
  it("1.876 LOT を 0.01 単位で切り捨てると 1.87", () => {
    expect(floorLots(1.876, 0.01)).toBe(1.87);
  });
  it("1.876 LOT を 1 単位で切り捨てると 1", () => {
    expect(floorLots(1.876, 1)).toBe(1);
  });
  it("ちょうど 2.00 は 2.00 のまま", () => {
    expect(floorLots(2, 0.01)).toBe(2);
  });
  it("浮動小数点誤差（0.29 / 0.01 = 28.999…）で切り下がらない", () => {
    expect(floorLots(0.29, 0.01)).toBe(0.29);
    expect(floorLots(0.57, 0.01)).toBe(0.57);
    expect(floorLots(1.1, 0.1)).toBe(1.1);
  });
  it("最小単位に満たない場合は 0", () => {
    expect(floorLots(0.004, 0.01)).toBe(0);
    expect(floorLots(0.5, 1)).toBe(0);
  });
  it("0 以下や不正値は 0", () => {
    expect(floorLots(0, 0.01)).toBe(0);
    expect(floorLots(-1, 0.01)).toBe(0);
    expect(floorLots(NaN, 0.01)).toBe(0);
    expect(floorLots(Infinity, 0.01)).toBe(0);
  });
});

describe("floorPips", () => {
  it("0.1 pips 単位で切り捨てる", () => {
    expect(floorPips(50)).toBe(50);
    expect(floorPips(33.333)).toBe(33.3);
    expect(floorPips(12.99)).toBe(12.9);
  });
  it("不正値は 0", () => {
    expect(floorPips(NaN)).toBe(0);
    expect(floorPips(-5)).toBe(0);
  });
});

describe("lotStepDecimals", () => {
  it("発注単位ごとの小数桁", () => {
    expect(lotStepDecimals(0.01)).toBe(2);
    expect(lotStepDecimals(0.1)).toBe(1);
    expect(lotStepDecimals(1)).toBe(0);
  });
});
