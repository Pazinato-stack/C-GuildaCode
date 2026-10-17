import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Modalidade } from "@/lib/types";

export const dynamic = "force-dynamic";

const FALLBACK: Pick<Modalidade, "slug" | "nome" | "descricao" | "imagem_url" | "horario" | "local">[] = [
  { slug: "skate", nome: "Skate", descricao: "Do básico ao avançado sobre as rodas.", imagem_url: "https://images.unsplash.com/photo-1547447134-cd3f5c716030?auto=format&fit=crop&w=1200&q=80", horario: "Seg e Qua - 18h", local: "Pista Central" },
  { slug: "karate", nome: "Karatê", descricao: "Disciplina, foco e defesa pessoal.", imagem_url: "https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=1200&q=80", horario: "Ter e Qui - 19h", local: "Dojo" },
  { slug: "violao", nome: "Violão", descricao: "Música do iniciante ao intermediário.", imagem_url: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=1200&q=80", horario: "Sexta - 17h", local: "Sala de Música" },
  { slug: "bale", nome: "Balé", descricao: "Técnica clássica, postura e expressão.", imagem_url: "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?auto=format&fit=crop&w=1200&q=80", horario: "Seg e Qui - 16h", local: "Estúdio de Dança" },
  { slug: "futebol", nome: "Futebol", descricao: "Escolinha para crianças e adolescentes.", imagem_url: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80", horario: "Sábado - 09h", local: "Campo Society" },
];

async function getModalidades() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("modalidades")
      .select("*")
      .order("id", { ascending: true });
    if (data && data.length > 0) return data as Modalidade[];
  } catch {
    // banco indisponível -> usa fallback
  }
  return FALLBACK.map((m, i) => ({ id: i + 1, criado_em: "", ...m })) as Modalidade[];
}

export default async function Home() {
  const modalidades = await getModalidades();

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-lg font-bold text-white">
              PF
            </span>
            <span className="text-lg font-bold text-slate-900">
              Projeto Futuro
            </span>
          </div>
          <nav className="flex items-center gap-2">
            <Link href="#modalidades" className="hidden px-3 py-2 text-sm font-medium text-slate-600 hover:text-brand-700 sm:block">
              Modalidades
            </Link>
            <Link href="/login" className="btn-primary">
              Entrar
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:py-28">
          <span className="badge bg-white/15 text-white ring-1 ring-white/25">
            Escolinha de Esportes e Artes
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">
            Formando futuros campeões e artistas
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/85">
            Cinco modalidades, uma equipe dedicada. Faça a chamada de presença,
            gerencie alunos e professores em um só lugar.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/login" className="btn bg-white text-brand-700 hover:bg-slate-100">
              Acessar o sistema
            </Link>
            <Link href="#modalidades" className="btn bg-white/10 text-white ring-1 ring-white/30 hover:bg-white/20">
              Ver modalidades
            </Link>
          </div>
        </div>
      </section>

      {/* Modalidades */}
      <section id="modalidades" className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-slate-900">Nossas Modalidades</h2>
          <p className="mt-2 text-slate-600">
            Conheça as atividades oferecidas pelo Projeto Futuro.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {modalidades.map((m) => (
            <article key={m.id} className="card group overflow-hidden">
              <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                {m.imagem_url ? (
                  <Image
                    src={m.imagem_url}
                    alt={m.nome}
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-slate-400">
                    Sem imagem
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="text-xl font-bold text-slate-900">{m.nome}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                  {m.descricao}
                </p>
                <dl className="mt-4 space-y-1 text-sm text-slate-500">
                  {m.horario && (
                    <div className="flex items-center gap-2">
                      <span aria-hidden>🕑</span>
                      <span>{m.horario}</span>
                    </div>
                  )}
                  {m.local && (
                    <div className="flex items-center gap-2">
                      <span aria-hidden>📍</span>
                      <span>{m.local}</span>
                    </div>
                  )}
                </dl>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Projeto Futuro — lucianopazinato.com.br
        </div>
      </footer>
    </main>
  );
}
