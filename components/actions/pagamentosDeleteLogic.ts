"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function deletarPagamentoAction(id: string) {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Erro Supabase:", error)
      return { ok: false, error: "Erro ao excluir o lançamento do banco de dados." }
    }

    revalidatePath("/despesas")
    revalidatePath("/receita")
    revalidatePath("/fluxoDeCaixa")
    return { ok: true }
  } catch (error) {
    console.error("Erro servidor:", error)
    return { ok: false, error: "Erro interno no servidor ao tentar excluir." }
  }
}