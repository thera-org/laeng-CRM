"use server"

import { createClient } from "@/lib/supabase/server"
import type { MaterialManagementMode, TipoUnidadeMedida } from "@/lib/types"
import { revalidatePath } from "next/cache"

type SaveMaterialEntityData =
  | {
      entityType: "material"
      nome: string
      classeId: string
      grupoId: string
      unidade: TipoUnidadeMedida
      quantPorObra: number
    }
  | {
      entityType: "classe" | "grupo"
      nome: string
    }

const TABLE_CONFIG: Record<Exclude<MaterialManagementMode, "material">, { table: string; column: string }> = {
  classe: { table: "material_classe", column: "nome_da_classe" },
  grupo: { table: "material_grupo", column: "nome_do_grupo" },
}

function revalidateInventoryPaths() {
  revalidatePath("/materiais")
  revalidatePath("/entrada")
  revalidatePath("/saida")
  revalidatePath("/fluxoDeMaterial")
}

export async function saveMaterialAction(data: SaveMaterialEntityData, id?: string) {
  const supabase = await createClient()

  try {
    if (data.entityType === "material") {
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
            material_classe_id: data.classeId,
            material_grupo_id: data.grupoId,
            unidade: data.unidade,
            quant_por_obra: data.quantPorObra,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("material_categoria").insert({
          nome_do_material: data.nome,
          material_classe_id: data.classeId,
          material_grupo_id: data.grupoId,
          unidade: data.unidade,
          quant_por_obra: data.quantPorObra,
          estoque_global: 0,
        })

        if (error) throw error
      }

      revalidateInventoryPaths()
      return { ok: true }
    }

    const config = TABLE_CONFIG[data.entityType]
    let query = supabase
      .from(config.table)
      .select("id")
      .ilike(config.column, data.nome)

    if (id) {
      query = query.neq("id", id)
    }

    const { data: existing } = await query.limit(1)

    if (existing && existing.length > 0) {
      return { ok: false, error: `Ja existe ${data.entityType === "classe" ? "uma classe" : "um grupo"} com este nome.` }
    }

    if (id) {
      const { error } = await supabase
        .from(config.table)
        .update({
          [config.column]: data.nome,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) throw error
    } else {
      const { error } = await supabase.from(config.table).insert({
        [config.column]: data.nome,
      })

      if (error) throw error
    }

    revalidateInventoryPaths()
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

    revalidateInventoryPaths()
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
      .select("id, nome_do_material, unidade, estoque_global, quant_por_obra")
      .order("nome_do_material", { ascending: true })

    if (error) throw error
    return { ok: true, data: data || [] }
  } catch (e: any) {
    return { ok: false, error: e.message, data: [] }
  }
}
