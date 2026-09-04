import { describe, expect, it } from "vitest";
import { destinoSeguro, ehRotaPublica, rotaInicial } from "@/lib/auth/rotas";

describe("rotaInicial", () => {
  it("manda cada papel para a sua casa", () => {
    expect(rotaInicial("personal")).toBe("/personal");
    expect(rotaInicial("aluno")).toBe("/aluno");
  });
  it("sem papel vai para onboarding", () => {
    expect(rotaInicial(null)).toBe("/onboarding");
    expect(rotaInicial(undefined)).toBe("/onboarding");
  });
});

describe("ehRotaPublica", () => {
  it("login, convite e callback são públicos", () => {
    expect(ehRotaPublica("/login")).toBe(true);
    expect(ehRotaPublica("/convite/abc")).toBe(true);
    expect(ehRotaPublica("/auth/callback")).toBe(true);
  });
  it("o resto exige sessão", () => {
    expect(ehRotaPublica("/")).toBe(true); // landing pública
    expect(ehRotaPublica("/personal")).toBe(false);
    expect(ehRotaPublica("/loginx")).toBe(false);
  });
});

describe("destinoSeguro", () => {
  it("aceita só caminhos internos", () => {
    expect(destinoSeguro("/aluno", "/")).toBe("/aluno");
    expect(destinoSeguro("https://mal.com", "/")).toBe("/");
    expect(destinoSeguro("//mal.com", "/")).toBe("/");
    expect(destinoSeguro(null, "/x")).toBe("/x");
  });
});
