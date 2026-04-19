"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { PlanejamentoAtividade, PlanejamentoObras } from "@/lib/types"

const REVALIDATE_PATHS = ["/planejamentoDeObras"]
function revalidateAll() {
  REVALIDATE_PATHS.forEach((p) => revalidatePath(p))
}

export interface AtividadeInput {
  id?: string // existing id (server-generated UUID); tmp ids are dropped
  codigo: number
  descricao: string
  realizado: boolean
  ordem: number
}

export interface PlanejamentoPayload {
  cliente_id: string
  responsavel: string
  responsavel_id?: string | null
  data_inicio: string
  data_fim: string
  atividades: AtividadeInput[]
}

export async function savePlanejamentoAction(payload: PlanejamentoPayload, id?: string) {
  const supabase = await createClient()
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Check for duplicate planejamento for the same client in the same week
    let duplicateQuery = supabase
      .from("planejamento_obras")
      .select("id", { count: "exact", head: true })
      .eq("cliente_id", payload.cliente_id)
      .lte("data_inicio", payload.data_fim)
      .gte("data_fim", payload.data_inicio)

    if (id) {
      duplicateQuery = duplicateQuery.neq("id", id)
    }

    const { count: duplicateCount, error: dupError } = await duplicateQuery

    if (dupError) throw dupError
    if (duplicateCount && duplicateCount > 0) {
      return {
        ok: false,
        error: "Já existe um planejamento para este cliente na mesma semana. Edite o planejamento existente.",
      }
    }

    const headerBase = {
      cliente_id: payload.cliente_id,
      responsavel: payload.responsavel,
      responsavel_id: payload.responsavel_id ?? user?.id ?? null,
      data_inicio: payload.data_inicio,
      data_fim: payload.data_fim,
      updated_by: user?.id ?? null,
    }

    let planejamentoId = id
    if (id) {
      const { error } = await supabase
        .from("planejamento_obras")
        .update(headerBase)
        .eq("id", id)
      if (error) throw error
    } else {
      const { data, error } = await supabase
        .from("planejamento_obras")
        .insert({ ...headerBase, created_by: user?.id ?? null })
        .select("id")
        .single()
      if (error) throw error
      planejamentoId = data.id
    }

    if (!planejamentoId) throw new Error("Falha ao obter ID do planejamento")

    // Replace atividades: simplest correct path → delete then insert
    const { error: delErr } = await supabase
      .from("planejamento_atividades")
      .delete()
      .eq("planejamento_id", planejamentoId)
    if (delErr) throw delErr

    if (payload.atividades.length > 0) {
      const rows = payload.atividades.map((a, idx) => ({
        planejamento_id: planejamentoId,
        codigo: a.codigo || idx + 1,
        descricao: a.descricao || "",
        realizado: !!a.realizado,
        ordem: a.ordem ?? idx,
      }))
      const { error: insErr } = await supabase.from("planejamento_atividades").insert(rows)
      if (insErr) throw insErr
    }

    revalidateAll()
    return { ok: true, id: planejamentoId }
  } catch (e: any) {
    return { ok: false, error: e.message || "Erro ao salvar planejamento" }
  }
}

export async function deletePlanejamentoAction(id: string) {
  const supabase = await createClient()
  try {
    const { error } = await supabase.from("planejamento_obras").delete().eq("id", id)
    if (error) throw error
    revalidateAll()
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e.message || "Erro ao remover planejamento" }
  }
}

export async function updateAtividadeAction(
  id: string,
  patch: Partial<Pick<PlanejamentoAtividade, "descricao" | "realizado" | "ordem">>
) {
  const supabase = await createClient()
  try {
    const { error } = await supabase
      .from("planejamento_atividades")
      .update(patch)
      .eq("id", id)
    if (error) throw error
    revalidateAll()
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e.message || "Erro ao atualizar atividade" }
  }
}

export async function addAtividadeAction(planejamentoId: string) {
  const supabase = await createClient()
  try {
    // Find next codigo + ordem
    const { data: existing, error: selErr } = await supabase
      .from("planejamento_atividades")
      .select("codigo, ordem")
      .eq("planejamento_id", planejamentoId)
      .order("codigo", { ascending: false })
      .limit(1)
    if (selErr) throw selErr

    const nextCodigo = existing && existing[0] ? (existing[0].codigo as number) + 1 : 1
    const nextOrdem = existing && existing[0] ? (existing[0].ordem as number) + 1 : 0

    const { data, error } = await supabase
      .from("planejamento_atividades")
      .insert({
        planejamento_id: planejamentoId,
        codigo: nextCodigo,
        descricao: "",
        realizado: false,
        ordem: nextOrdem,
      })
      .select("*")
      .single()
    if (error) throw error

    revalidateAll()
    return { ok: true, data: data as PlanejamentoAtividade }
  } catch (e: any) {
    return { ok: false, error: e.message || "Erro ao adicionar atividade" }
  }
}

export async function deleteAtividadeAction(id: string) {
  const supabase = await createClient()
  try {
    const { error } = await supabase.from("planejamento_atividades").delete().eq("id", id)
    if (error) throw error
    revalidateAll()
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e.message || "Erro ao remover atividade" }
  }
}

export async function updatePlanejamentoFieldAction(
  id: string,
  field: "responsavel" | "data_inicio" | "data_fim",
  value: string
) {
  const supabase = await createClient()
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const { error } = await supabase
      .from("planejamento_obras")
      .update({ [field]: value, updated_by: user?.id ?? null })
      .eq("id", id)
    if (error) throw error
    revalidateAll()
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e.message || "Erro ao atualizar campo" }
  }
}

export async function getClientesForPlanejamentoAction() {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase
      .from("clientes")
      .select("id, codigo, nome")
      .order("nome", { ascending: true })
    if (error) throw error
    return { ok: true, data: data || [] }
  } catch (e: any) {
    return { ok: false, error: e.message }
  }
}

// Used by tests if needed; not used at runtime currently.
export async function _planejamentoTypeProbe(_p: PlanejamentoObras) {
  return _p.id
}
