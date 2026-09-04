import { describe, expect, it } from "vitest";
import { grade28, inicioDaSemana, resumirConsistencia } from "@/lib/streak";

const QUA = new Date(2026, 8, 9, 12); // quarta 09/09/2026
const iso = (y: number, m: number, d: number) => new Date(y, m - 1, d, 10).toISOString();

describe("inicioDaSemana", () => {
  it("volta até a segunda-feira", () => {
    expect(inicioDaSemana(QUA).getDate()).toBe(7);
    expect(inicioDaSemana(new Date(2026, 8, 6)).getDate()).toBe(31); // domingo 06/09 → segunda 31/08
  });
});

describe("resumirConsistencia", () => {
  it("sem treinos: zero em tudo, meta mínima 1", () => {
    const r = resumirConsistencia([], 0, QUA);
    expect(r).toMatchObject({ metaSemanal: 1, treinosEstaSemana: 0, semanasSeguidas: 0, totalTreinos: 0 });
  });
  it("semana atual em curso não quebra a sequência das anteriores", () => {
    const treinos = [iso(2026, 8, 24), iso(2026, 8, 26), iso(2026, 8, 31), iso(2026, 9, 2)]; // 2 semanas anteriores batendo meta 2
    const r = resumirConsistencia(treinos, 2, QUA);
    expect(r.semanasSeguidas).toBe(2);
    expect(r.treinosEstaSemana).toBe(0);
  });
  it("semana atual conta assim que bate a meta", () => {
    const treinos = [iso(2026, 8, 31), iso(2026, 9, 2), iso(2026, 9, 7), iso(2026, 9, 9)];
    expect(resumirConsistencia(treinos, 2, QUA).semanasSeguidas).toBe(2);
  });
  it("uma semana abaixo da meta zera a contagem anterior", () => {
    const treinos = [iso(2026, 8, 17), iso(2026, 8, 19), iso(2026, 8, 26), iso(2026, 9, 1), iso(2026, 9, 3)];
    expect(resumirConsistencia(treinos, 2, QUA).semanasSeguidas).toBe(1); // 31/08-06/09 ok; 24-30/08 só 1 treino → para
  });
  it("dias treinados só dos últimos 28 dias, sem duplicar o mesmo dia", () => {
    const r = resumirConsistencia([iso(2026, 9, 9), iso(2026, 9, 9), iso(2026, 7, 1)], 3, QUA);
    expect(r.diasTreinados).toEqual(["2026-09-09"]);
  });
});

describe("grade28", () => {
  it("são 28 dias terminando no domingo da semana atual", () => {
    const g = grade28(QUA);
    expect(g).toHaveLength(28);
    expect(g[27].data).toBe("2026-09-13");
    expect(g.find((d) => d.hoje)?.data).toBe("2026-09-09");
    expect(g.filter((d) => d.futuro)).toHaveLength(4);
  });
});
