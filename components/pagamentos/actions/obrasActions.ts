"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createBulkTransactionsAction(transactions: any[]) {
  const supabase = await createClient()
  try {
    if (!transactions || transactions.length === 0) {
      return { ok: true, insertedCount: 0, duplicates: [] }
    }

    // Inserir transações diretamente sem verificação de duplicidade
    const { error } = await supabase.from("transactions").insert(transactions)
    if (error) throw error

    revalidatePath("/despesas")
    revalidatePath("/obras")
    revalidatePath("/fluxoDeCaixa")
    return {
      ok: true,
      insertedCount: transactions.length,
      duplicates: [] // Nenhuma duplicata checada ou retornada
    }
  } catch (e: any) {
    return { ok: false, error: e.message }
  }
}

export async function getObrasForDespesaAction() {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase
      .from("obras")
      .select(`
        id, 
        codigo,
        cliente_id,
        manutencao,
        material,
        empreiteiro_valor_pago,
        pintor,
        gesseiro,
        azulejista,
        eletricista,
        clientes:cliente_id (
          nome
        )
      `)

    if (error) { throw error }

    const formattedData = data.map((item: any) => ({
      ...item,
      cliente_nome: item.clientes?.nome || `Cliente ID: ${item.cliente_id} (Não encontrado)`
    }))

    return { ok: true, data: formattedData }
  } catch (e: any) {
    console.error("❌ ERRO CATCH OBRAS DESPESA:", e.message)
    return { ok: false, error: e.message }
  }
}