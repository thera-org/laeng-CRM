"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import {
  ALLOWED_FOTO_MIMES,
  DIARIO_BUCKET,
  MAX_FOTOS,
  MAX_FOTO_BYTES,
} from "../types/diarioTypes"
import type {
  Clima,
  DiarioColaboradores,
  DiarioObras,
  DiarioProgresso,
  Turno,
} from "@/lib/types"

const REVALIDATE_PATHS = ["/diarioDeObras"]

function revalidateAll() {
  REVALIDATE_PATHS.forEach((p) => revalidatePath(p))
}

export interface DiarioPayload {
  cliente_id: string
  responsavel: string
  responsavel_id?: string | null
  data: string
  turnos: Turno[]
  climas: Clima[]
  colaboradores: DiarioColaboradores
  atividade?: string | null
  progresso: DiarioProgresso
}

export async function saveDiarioAction(payload: DiarioPayload, id?: string) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const base = {
      cliente_id: payload.cliente_id,
      responsavel: payload.responsavel,
      responsavel_id: payload.responsavel_id ?? user?.id ?? null,
      data: payload.data,
      turnos: payload.turnos ?? [],
      climas: payload.climas ?? [],
      colaboradores: payload.colaboradores ?? {},
      atividade: (payload.atividade ?? "").slice(0, 2000),
      progresso: payload.progresso ?? {},
      updated_by: user?.id ?? null,
    }

    if (id) {
      const { data, error } = await supabase
        .from("diario_obras")
        .update(base)
        .eq("id", id)
        .select("*")
        .single()
      if (error) throw error
      revalidateAll()
      return { ok: true, data: data as DiarioObras }
    }

    const { data, error } = await supabase
      .from("diario_obras")
      .insert({ ...base, created_by: user?.id ?? null })
      .select("*")
      .single()
    if (error) throw error

    revalidateAll()
    return { ok: true, data: data as DiarioObras }
  } catch (e: any) {
    return { ok: false, error: e.message || "Erro ao salvar diário" }
  }
}

export async function deleteDiarioAction(id: string) {
  const supabase = await createClient()
  try {
    // 1) Get foto paths to remove from storage
    const { data: fotos } = await supabase
      .from("diario_obras_fotos")
      .select("storage_path")
      .eq("diario_id", id)

    const paths = (fotos || []).map((f) => f.storage_path).filter(Boolean)

    // 2) Delete diario row (CASCADE removes foto rows)
    const { error } = await supabase.from("diario_obras").delete().eq("id", id)
    if (error) throw error

    // 3) Best-effort storage cleanup
    if (paths.length > 0) {
      await supabase.storage.from(DIARIO_BUCKET).remove(paths)
    }

    revalidateAll()
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e.message || "Erro ao remover diário" }
  }
}

const ALLOWED_INLINE_FIELDS = new Set<string>([
  "responsavel",
  "data",
  "turnos",
  "climas",
  "colaboradores",
  "atividade",
  "progresso",
])

export async function updateDiarioFieldAction(
  id: string,
  field: string,
  value: unknown
) {
  if (!ALLOWED_INLINE_FIELDS.has(field)) {
    return { ok: false, error: `Campo "${field}" não pode ser editado inline` }
  }
  const supabase = await createClient()
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const safeValue =
      field === "atividade" && typeof value === "string" ? value.slice(0, 2000) : value

    const { error } = await supabase
      .from("diario_obras")
      .update({ [field]: safeValue, updated_by: user?.id ?? null })
      .eq("id", id)
    if (error) throw error

    revalidateAll()
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e.message || "Erro ao atualizar campo" }
  }
}

export async function uploadDiarioFotoAction(diarioId: string, formData: FormData) {
  const supabase = await createClient()
  try {
    const file = formData.get("file") as File | null
    if (!file) return { ok: false, error: "Arquivo não enviado" }

    if (file.size > MAX_FOTO_BYTES) {
      return { ok: false, error: `Arquivo excede ${MAX_FOTO_BYTES / 1024 / 1024} MB` }
    }
    if (!ALLOWED_FOTO_MIMES.includes(file.type as any)) {
      return { ok: false, error: "Formato inválido. Use JPEG ou PNG." }
    }

    // Enforce max 12 photos per diario
    const { count } = await supabase
      .from("diario_obras_fotos")
      .select("id", { count: "exact", head: true })
      .eq("diario_id", diarioId)
    if ((count ?? 0) >= MAX_FOTOS) {
      return { ok: false, error: `Máximo de ${MAX_FOTOS} fotos por diário` }
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || (file.type === "image/png" ? "png" : "jpg")
    const path = `${diarioId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const arrayBuf = await file.arrayBuffer()
    const { error: upErr } = await supabase.storage
      .from(DIARIO_BUCKET)
      .upload(path, arrayBuf, { contentType: file.type, upsert: false })
    if (upErr) throw upErr

    const ordem = count ?? 0
    const { data: row, error: rowErr } = await supabase
      .from("diario_obras_fotos")
      .insert({ diario_id: diarioId, storage_path: path, ordem })
      .select("*")
      .single()
    if (rowErr) {
      // rollback storage
      await supabase.storage.from(DIARIO_BUCKET).remove([path])
      throw rowErr
    }

    revalidateAll()
    return { ok: true, data: row }
  } catch (e: any) {
    return { ok: false, error: e.message || "Erro ao enviar foto" }
  }
}

export async function deleteDiarioFotoAction(fotoId: string) {
  const supabase = await createClient()
  try {
    const { data: foto, error: selErr } = await supabase
      .from("diario_obras_fotos")
      .select("storage_path")
      .eq("id", fotoId)
      .single()
    if (selErr) throw selErr

    const { error: delErr } = await supabase
      .from("diario_obras_fotos")
      .delete()
      .eq("id", fotoId)
    if (delErr) throw delErr

    if (foto?.storage_path) {
      await supabase.storage.from(DIARIO_BUCKET).remove([foto.storage_path])
    }

    revalidateAll()
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e.message || "Erro ao remover foto" }
  }
}

export async function getSignedFotoUrlsAction(paths: string[]) {
  const supabase = await createClient()
  try {
    if (!paths.length) return { ok: true, data: {} as Record<string, string> }
    const { data, error } = await supabase.storage
      .from(DIARIO_BUCKET)
      .createSignedUrls(paths, 60 * 30) // 30 minutes
    if (error) throw error
    const map: Record<string, string> = {}
    data?.forEach((entry, i) => {
      const p = paths[i]
      if (entry.signedUrl) map[p] = entry.signedUrl
    })
    return { ok: true, data: map }
  } catch (e: any) {
    return { ok: false, error: e.message || "Erro ao gerar URLs" }
  }
}

export async function getClientesForDiarioAction() {
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
