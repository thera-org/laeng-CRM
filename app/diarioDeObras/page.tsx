import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getUserContext } from "@/app/auth/context/userContext"
import DiarioPageContent from "./diario-page-content"
import type {
  DiarioClimaPorTurno,
  DiarioColaboradores,
  DiarioComCliente,
  DiarioObrasFoto,
  DiarioProgresso,
} from "@/lib/types"

interface DiarioClienteRow {
  id: string
  codigo?: number | null
  nome?: string | null
}

interface DiarioRow {
  id: string
  codigo: number
  cliente_id: string
  responsavel: string
  responsavel_id?: string | null
  data: string
  colaboradores?: DiarioColaboradores | string | null
  atividade?: string | null
  progresso?: DiarioProgresso | string | null
  clima_por_turno?: DiarioClimaPorTurno | string | null
  created_at: string
  updated_at: string
  created_by?: string | null
  updated_by?: string | null
  clientes?: DiarioClienteRow | null
  fotos?: DiarioObrasFoto[] | null
}

function parseJsonField<T>(value: T | string | null | undefined, fallback: T): T {
  if (value == null) return fallback
  if (typeof value !== "string") return value

  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export const dynamic = "force-dynamic"

export default async function DiarioDeObrasPage() {
  const supabase = await createClient()
  const { userPermissions } = await getUserContext()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) redirect("/auth/login")

  // Default responsável: nome_completo of current user
  let defaultResponsavel = ""
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("nome_completo")
      .eq("id", user.id)
      .single()
    defaultResponsavel = profile?.nome_completo || ""
  } catch {}

  const { data: rows, error: rowsError } = await supabase
    .from("diario_obras")
    .select(
      `
      *,
      clientes:cliente_id ( id, codigo, nome ),
      fotos:diario_obras_fotos ( id, diario_id, storage_path, ordem, created_at )
    `
    )
    .order("data", { ascending: false })

  if (rowsError) {
    console.error("Erro ao buscar diários", rowsError)
  }

  const diarios: DiarioComCliente[] = (rows || []).map((row) => {
    const r = row as DiarioRow

    return {
      ...r,
      colaboradores: parseJsonField(r.colaboradores, {}),
      progresso: parseJsonField(r.progresso, {}),
      clima_por_turno: parseJsonField(r.clima_por_turno, {}),
      cliente_codigo: r.clientes?.codigo ?? 0,
      cliente_nome: r.clientes?.nome || "—",
      fotos: (r.fotos || []).sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0)),
    }
  })

  return (
    <DiarioPageContent
      diarios={diarios}
      defaultResponsavel={defaultResponsavel}
      userPermissions={userPermissions}
    />
  )
}
