"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function saveEntradaAction(
  data: {
    material_id: string
    quantidade: number
    data: string
    cliente_id?: string
    observacao?: string
  },
  id?: string
) {
  const supabase = await createClient()
  try {
    if (id) {
      const { error } = await supabase
        .from("material_movimentacao")
        .update({
          material_id: data.material_id,
          quantidade: data.quantidade,
          data: data.data,
          cliente_id: data.cliente_id || null,
          observacao: data.observacao || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) throw error
    } else {
      const { error } = await supabase.from("material_movimentacao").insert({
        material_id: data.material_id,
        quantidade: data.quantidade,
        data: data.data,
        cliente_id: data.cliente_id || null,
        observacao: data.observacao || null,
        type: "ENTRADA",
      })

      if (error) throw error
    }

    revalidatePath("/entrada")
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e.message }
  }
}

export async function deleteEntradaAction(id: string) {
  const supabase = await createClient()
  try {
    const { error } = await supabase.from("material_movimentacao").delete().eq("id", id)
    if (error) throw error

    revalidatePath("/entrada")
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e.message }
  }
}
