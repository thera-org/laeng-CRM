"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function saveSaidaAction(
  data: {
    material_id: string
    quantidade: number
    data: string
    cliente_id: string
    justificativa?: string
  },
  id?: string
) {
  const supabase = await createClient()
  try {
    if (id) {
      const { error } = await supabase
        .from("material_movimentacoes")
        .update({
          material_categoria_id: data.material_id,
          quantidade: data.quantidade,
          data: data.data,
          cliente_id: data.cliente_id,
          justificativa: data.justificativa || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) throw error
    } else {
      const { error } = await supabase.from("material_movimentacoes").insert({
        material_categoria_id: data.material_id,
        quantidade: data.quantidade,
        data: data.data,
        cliente_id: data.cliente_id,
        justificativa: data.justificativa || null,
        tipo: "SAIDA",
      })

      if (error) throw error
    }

    revalidatePath("/saida")
    revalidatePath("/fluxoDeMaterial")
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e.message }
  }
}

export async function deleteSaidaAction(id: string) {
  const supabase = await createClient()
  try {
    const { error } = await supabase.from("material_movimentacoes").delete().eq("id", id)
    if (error) throw error

    revalidatePath("/saida")
    revalidatePath("/fluxoDeMaterial")
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e.message }
  }
}
