import { describe, expect, it } from "vitest";
import { isEtapa, locksFrom } from "./etapas";

describe("locksFrom", () => {
  it("deixa tudo aberto quando não há linhas", () => {
    expect(locksFrom([])).toEqual({ pre: false, carbon: false, post: false });
  });

  it("tranca só as etapas marcadas e ignora etapas desconhecidas", () => {
    expect(locksFrom([{ stage: "carbon", locked: true }, { stage: "post", locked: false }, { stage: "xyz", locked: true }]))
      .toEqual({ pre: false, carbon: true, post: false });
  });
});

describe("isEtapa", () => {
  it("aceita só as três etapas", () => {
    expect(isEtapa("pre")).toBe(true);
    expect(isEtapa("carbon")).toBe(true);
    expect(isEtapa("post")).toBe(true);
    expect(isEtapa("__proto__")).toBe(false);
    expect(isEtapa(1)).toBe(false);
  });
});
