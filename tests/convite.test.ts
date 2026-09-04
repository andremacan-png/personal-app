import { describe, expect, it } from "vitest";
import { linkConvite, linkWhatsApp, mensagemConvite, telefoneWhatsApp } from "@/lib/convite";

describe("telefoneWhatsApp", () => {
  it("aceita formatos brasileiros comuns", () => {
    expect(telefoneWhatsApp("(48) 99999-1234")).toBe("5548999991234");
    expect(telefoneWhatsApp("48 3333-1234")).toBe("554833331234");
    expect(telefoneWhatsApp("+55 48 99999-1234")).toBe("5548999991234");
    expect(telefoneWhatsApp("048999991234")).toBe("5548999991234");
  });
  it("rejeita o que não é telefone", () => {
    expect(telefoneWhatsApp("")).toBeNull();
    expect(telefoneWhatsApp(null)).toBeNull();
    expect(telefoneWhatsApp("1234")).toBeNull();
  });
});

describe("links", () => {
  it("monta o link do convite sem barra dupla", () => {
    expect(linkConvite("https://app.com/", "abc")).toBe("https://app.com/convite/abc");
    expect(linkConvite("http://localhost:3000", "abc")).toBe("http://localhost:3000/convite/abc");
  });
  it("mensagem usa o primeiro nome e inclui o link", () => {
    const m = mensagemConvite("Carla Souza", "Rafael", "https://x/convite/t");
    expect(m).toContain("Oi Carla!");
    expect(m).toContain("https://x/convite/t");
  });
  it("wa.me codifica a mensagem; sem telefone não há link", () => {
    expect(linkWhatsApp("48999991234", "oi você")).toBe("https://wa.me/5548999991234?text=oi%20voc%C3%AA");
    expect(linkWhatsApp(null, "oi")).toBeNull();
  });
});
