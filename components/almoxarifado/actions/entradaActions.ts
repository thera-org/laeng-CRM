"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function saveEntradaAction(
  data: {
    material_id: string
    quantidade: number
    data: string
    cliente_id?: string
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
          cliente_id: data.cliente_id || null,
          justificativa: data.justificativa || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) throw error
    } else {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        throw new Error("Usuário não autenticado.")
      }

      const { error } = await supabase.from("material_movimentacoes").insert({
        material_categoria_id: data.material_id,
        quantidade: data.quantidade,
        data: data.data,
        cliente_id: data.cliente_id || null,
        criado_por: user.id,
        justificativa: data.justificativa || null,
        tipo: "ENTRADA",
      })

      if (error) throw error
    }

    revalidatePath("/entrada")
    revalidatePath("/fluxoDeMaterial")
    return { ok: true }
  } catch (error: unknown) {
    return { ok: false, error: error instanceof Error ? error.message : "Erro ao salvar entrada." }
  }
}

export async function deleteEntradaAction(id: string) {
  const supabase = await createClient()
  try {
    const { error } = await supabase.from("material_movimentacoes").delete().eq("id", id)
    if (error) throw error

    revalidatePath("/entrada")
    revalidatePath("/fluxoDeMaterial")
    return { ok: true }
  } catch (error: unknown) {
    return { ok: false, error: error instanceof Error ? error.message : "Erro ao excluir entrada." }
  }
}
