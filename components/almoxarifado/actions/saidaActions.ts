"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function saveSaidaAction(
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
        .from("material_saidas")
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
      const { data: userData } = await supabase.auth.getUser()
      const { data: profile } = await supabase
        .from("profiles")
        .select("nome_completo")
        .eq("id", userData.user?.id)
        .single()

      const { error } = await supabase.from("material_saidas").insert({
        material_id: data.material_id,
        quantidade: data.quantidade,
        data: data.data,
        cliente_id: data.cliente_id || null,
        observacao: data.observacao || null,
        created_by: userData.user?.id,
        created_by_name: profile?.nome_completo || null,
      })

      if (error) throw error
    }

    revalidatePath("/saida")
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e.message }
  }
}

export async function deleteSaidaAction(id: string) {
  const supabase = await createClient()
  try {
    const { error } = await supabase.from("material_saidas").delete().eq("id", id)
    if (error) throw error

    revalidatePath("/saida")
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e.message }
  }
}
