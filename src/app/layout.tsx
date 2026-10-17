import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Projeto Futuro | Escolinha de Esportes e Artes",
  description:
    "Sistema de chamada de presença para as modalidades de Skate, Karatê, Violão, Balé e Futebol.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
