"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function saveMaterialAction(
  data: { nome: string },
  id?: string
) {
  const supabase = await createClient()
  try {
    // Check for duplicate name (case-insensitive)
    let query = supabase
      .from("material_categoria")
      .select("id")
      .ilike("nome_do_material", data.nome)

    if (id) {
      query = query.neq("id", id)
    }

    const { data: existing } = await query.limit(1)

    if (existing && existing.length > 0) {
      return { ok: false, error: "Ja existe um material com este nome." }
    }

    if (id) {
      const { error } = await supabase
        .from("material_categoria")
        .update({
          nome_do_material: data.nome,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) throw error
    } else {
      const { error } = await supabase.from("material_categoria").insert({
        nome_do_material: data.nome,
      })

      if (error) throw error
    }

    revalidatePath("/materiais")
    revalidatePath("/entrada")
    revalidatePath("/saida")
    revalidatePath("/fluxoDeMaterial")
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e.message }
  }
}

export async function deleteMaterialAction(id: string) {
  const supabase = await createClient()
  try {
    const { error } = await supabase.from("material_categoria").delete().eq("id", id)

    if (error) {
      if (error.message.includes("violates foreign key constraint")) {
        return {
          ok: false,
          error: "Este material possui registros de entrada/saida e nao pode ser excluido.",
        }
      }
      throw error
    }

    revalidatePath("/materiais")
    revalidatePath("/entrada")
    revalidatePath("/saida")
    revalidatePath("/fluxoDeMaterial")
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e.message }
  }
}

export async function getMateriaisAtivosAction() {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase
      .from("material_categoria")
      .select("id, nome_do_material")
      .order("nome_do_material", { ascending: true })

    if (error) throw error
    return { ok: true, data: data || [] }
  } catch (e: any) {
    return { ok: false, error: e.message, data: [] }
  }
}
