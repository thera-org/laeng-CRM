"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function saveMaterialAction(
  data: { nome: string; unidade_medida: string; estoque_inicial: number },
  id?: string
) {
  const supabase = await createClient()
  try {
    // Check for duplicate name (case-insensitive)
    let query = supabase
      .from("materiais")
      .select("id")
      .ilike("nome", data.nome)

    if (id) {
      query = query.neq("id", id)
    }

    const { data: existing } = await query.limit(1)

    if (existing && existing.length > 0) {
      return { ok: false, error: "Ja existe um material com este nome." }
    }

    if (id) {
      const { error } = await supabase
        .from("materiais")
        .update({
          nome: data.nome,
          unidade_medida: data.unidade_medida,
          estoque_inicial: data.estoque_inicial,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) throw error
    } else {
      const { data: userData } = await supabase.auth.getUser()

      const { error } = await supabase.from("materiais").insert({
        nome: data.nome,
        unidade_medida: data.unidade_medida,
        estoque_inicial: data.estoque_inicial,
        created_by: userData.user?.id,
      })

      if (error) throw error
    }

    revalidatePath("/gestao")
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e.message }
  }
}

export async function deleteMaterialAction(id: string) {
  const supabase = await createClient()
  try {
    const { error } = await supabase.from("materiais").delete().eq("id", id)

    if (error) {
      if (error.message.includes("violates foreign key constraint")) {
        return {
          ok: false,
          error: "Este material possui registros de entrada/saida e nao pode ser excluido.",
        }
      }
      throw error
    }

    revalidatePath("/gestao")
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e.message }
  }
}

export async function toggleMaterialAtivoAction(id: string, ativo: boolean) {
  const supabase = await createClient()
  try {
    const { error } = await supabase
      .from("materiais")
      .update({ ativo, updated_at: new Date().toISOString() })
      .eq("id", id)

    if (error) throw error

    revalidatePath("/gestao")
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e.message }
  }
}

export async function getMateriaisAtivosAction() {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase
      .from("materiais")
      .select("id, nome, unidade_medida")
      .eq("ativo", true)
      .order("nome")

    if (error) throw error
    return { ok: true, data: data || [] }
  } catch (e: any) {
    return { ok: false, error: e.message, data: [] }
  }
}
