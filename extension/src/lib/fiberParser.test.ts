import { describe, expect, it } from "vitest";
import { normalizeFiberComposition, parseFiberComposition } from "./fiberParser";

describe("parseFiberComposition", () => {
  it("parses percent-first compositions", () => {
    const parsed = parseFiberComposition("80% Cotton, 20% Polyester");
    expect(parsed).toEqual({
      cotton: 80,
      polyester: 20,
    });
  });

  it("parses name-first compositions", () => {
    const parsed = parseFiberComposition("Cotton 65% | Polyester 35%");
    expect(parsed).toEqual({
      cotton: 65,
      polyester: 35,
    });
  });

  it("parses slash-separated material strings", () => {
    const parsed = parseFiberComposition("Material: 70% Viscose / 30% Nylon");
    expect(parsed).toEqual({
      "viscose/rayon": 70,
      nylon: 30,
    });
  });

  it("falls back to a single-fiber 100% guess when no percentages are present", () => {
    const parsed = parseFiberComposition("Fabric: Organic Cotton");
    expect(parsed).toEqual({
      "organic cotton": 100,
    });
  });
});

describe("normalizeFiberComposition", () => {
  it("normalizes totals that exceed 100", () => {
    const normalized = normalizeFiberComposition({
      cotton: 120,
      polyester: 80,
    });
    expect(normalized).toEqual({
      cotton: 60,
      polyester: 40,
    });
  });
});
