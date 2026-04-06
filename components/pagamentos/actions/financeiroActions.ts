"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"


export async function createBulkTransactionsAction(transactions: any[]) {
  const supabase = await createClient()
  try {
    if (!transactions || transactions.length === 0) {
      return { ok: true, insertedCount: 0, duplicates: [] }
    }

    // 1. Identificar quais já existem para este cliente
    const clienteId = transactions[0].cliente_id
    const subcatsToCheck = transactions.map((t: any) => t.subcategories_id)

    const { data: existingData, error: checkError } = await supabase
      .from("transactions")
      .select("subcategories_id")
      .eq("cliente_id", clienteId)
      .in("subcategories_id", subcatsToCheck)

    if (checkError) throw checkError

    const existingSet = new Set(existingData?.map((t: any) => t.subcategories_id))

    // 2. Filtrar
    const toInsert = transactions.filter((t: any) => !existingSet.has(t.subcategories_id))
    const duplicates = transactions
      .filter((t: any) => existingSet.has(t.subcategories_id))
      .map((t: any) => ({ subcategories_id: t.subcategories_id }))

    // 3. Inserir somente novos
    if (toInsert.length > 0) {
      const { error } = await supabase.from("transactions").insert(toInsert)
      if (error) throw error
    }

    revalidatePath("/receita")
    revalidatePath("/fluxoDeCaixa")
    return {
      ok: true,
      insertedCount: toInsert.length,
      duplicates: duplicates // array de { subcategories_id }
    }
  } catch (e: any) {
    return { ok: false, error: e.message }
  }
}

export async function getObrasForReceitaAction() {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase
      .from("obras")
      .select(`
        id, 
        codigo,
        cliente_id,
        medicao_01,
        medicao_02,
        medicao_03,
        medicao_04,
        medicao_05,
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
    console.error("❌ ERRO CATCH OBRAS RECEITA:", e.message)
    return { ok: false, error: e.message }
  }
}