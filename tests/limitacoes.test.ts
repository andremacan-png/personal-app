import { describe, expect, it } from "vitest";
import { conflitos } from "@/lib/limitacoes";

describe("conflitos", () => {
  it("cruza contraindicações do exercício com limitações ativas, ignorando acento e caixa", () => {
    expect(conflitos(["joelho", "lombar"], ["Joelho"])).toEqual(["joelho"]);
    expect(conflitos(["Hipertensão"], ["hipertensao"])).toEqual(["hipertensao"]);
    expect(conflitos(["ombro"], ["joelho"])).toEqual([]);
    expect(conflitos([], ["joelho"])).toEqual([]);
  });
});
