"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function registrarChamada(formData: FormData) {
  const supabase = await createClient();

  const alunoId = Number(formData.get("aluno_id"));
  const modalidadeId = Number(formData.get("modalidade_id"));
  const data = String(formData.get("data"));
  const presente = formData.get("presente") === "true";
  const observacao = String(formData.get("observacao") || "").trim() || null;

  const { error } = await supabase.from("chamadas").upsert(
    {
      aluno_id: alunoId,
      modalidade_id: modalidadeId,
      data,
      presente,
      observacao,
    },
    { onConflict: "aluno_id,data,modalidade_id" }
  );

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/chamada");
  revalidatePath("/dashboard");
}

export async function marcarTodosPresentes(formData: FormData) {
  const supabase = await createClient();
  const modalidadeId = Number(formData.get("modalidade_id"));
  const data = String(formData.get("data"));

  const { data: alunos } = await supabase
    .from("alunos")
    .select("id")
    .eq("modalidade_id", modalidadeId)
    .eq("ativo", true);

  if (!alunos || alunos.length === 0) return;

  const rows = alunos.map((a) => ({
    aluno_id: a.id,
    modalidade_id: modalidadeId,
    data,
    presente: true,
  }));

  await supabase
    .from("chamadas")
    .upsert(rows, { onConflict: "aluno_id,data,modalidade_id" });

  revalidatePath("/dashboard/chamada");
  revalidatePath("/dashboard");
}
