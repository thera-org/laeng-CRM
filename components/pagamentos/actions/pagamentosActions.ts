"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Definição do tipo para os dados recebidos (pode ser importado de @/lib/types se preferir)
interface TransactionPayload {
  amount: number
  date: string
  type: string
  subcategories_id: string | null
  category_id?: string
}

export async function saveTransactionAction(data: TransactionPayload, id?: string) {
  const supabase = await createClient()

  // Prepara o payload final
  const payload = {
    amount: data.amount,
    date: data.date,
    type: data.type,
    subcategories_id: data.subcategories_id || null,
    updated_at: new Date().toISOString(),
  }

  try {
    if (id) {
      // --- UPDATE ---
      const { error } = await supabase
        .from("transactions")
        .update(payload)
        .eq("id", id)

      if (error) throw error
    } else {
      // --- INSERT ---
      const { error } = await supabase
        .from("transactions")
        .insert({
          ...payload,
          created_at: new Date().toISOString(),
        })

      if (error) throw error
    }

    // Atualiza o cache das rotas que exibem transações
    revalidatePath("/despesas")
    revalidatePath("/receita")
    revalidatePath("/fluxoDeCaixa")

    return { success: true, message: "Salvo com sucesso" }

  } catch (error: any) {
    console.error("Erro na Server Action:", error)
    return { success: false, message: error.message || "Erro desconhecido" }
  }
}

export async function updateTransactionAction(tableId: string, updates: Record<string, any>) {

  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("transactions")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", tableId)

    if (error) throw error

    // Opcional: Revalidar o cache se você souber a rota exata, 
    // mas o router.refresh() no cliente também funciona.
    // revalidatePath("/financeiro") 

    return { success: true }
  } catch (error) {
    console.error("Erro na Server Action:", error)
    return { success: false, error: "Falha ao atualizar o registro." }
  }

}