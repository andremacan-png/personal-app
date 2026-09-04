import { describe, expect, it } from "vitest";
import { calcularConquistas, houveRecordeRecente } from "@/lib/conquistas";

const base = { metaSemanal: 3, treinosEstaSemana: 0, semanasSeguidas: 0, diasTreinados: [], totalTreinos: 0 };

describe("calcularConquistas", () => {
  it("sem treinos nada conquistado e mostra progresso do próximo marco", () => {
    const c = calcularConquistas(base, false);
    expect(c.every((x) => !x.conquistada)).toBe(true);
    expect(c.find((x) => x.id === "treinos-5")?.progresso).toBeUndefined(); // o próximo marco é o 1º treino
    expect(calcularConquistas({ ...base, totalTreinos: 2 }, false).find((x) => x.id === "treinos-5")?.progresso).toBe("2/5");
  });
  it("marcos de treinos e semanas", () => {
    const c = calcularConquistas({ ...base, totalTreinos: 12, semanasSeguidas: 4, treinosEstaSemana: 3 }, true);
    const ok = c.filter((x) => x.conquistada).map((x) => x.id);
    expect(ok).toEqual(expect.arrayContaining(["primeiro", "treinos-5", "treinos-10", "semanas-2", "semanas-4", "semana-cheia", "recorde"]));
    expect(ok).not.toContain("treinos-25");
    expect(c.find((x) => x.id === "treinos-25")?.progresso).toBe("12/25");
  });
});

describe("houveRecordeRecente", () => {
  const hoje = new Date(2026, 8, 9);
  it("detecta carga máxima maior que todo o histórico anterior", () => {
    expect(houveRecordeRecente([{ pontos: [{ data: "2026-08-20", cargaMax: 40 }, { data: "2026-09-08", cargaMax: 42 }] }], hoje)).toBe(true);
    expect(houveRecordeRecente([{ pontos: [{ data: "2026-08-20", cargaMax: 40 }, { data: "2026-09-08", cargaMax: 40 }] }], hoje)).toBe(false);
  });
  it("primeiro registro não conta como recorde", () => {
    expect(houveRecordeRecente([{ pontos: [{ data: "2026-09-08", cargaMax: 40 }] }], hoje)).toBe(false);
  });
});
