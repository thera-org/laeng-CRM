import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getUserContext } from "@/app/auth/context/userContext"
import DiarioPageContent from "./diario-page-content"
import type { DiarioComCliente } from "@/lib/types"

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

  const { data: rows } = await supabase
    .from("diario_obras")
    .select(
      `
      *,
      clientes:cliente_id ( id, codigo, nome ),
      fotos:diario_obras_fotos ( id, diario_id, storage_path, mime_type, size_bytes, ordem, created_at )
    `
    )
    .order("data", { ascending: false })

  const diarios: DiarioComCliente[] = (rows || []).map((r: any) => ({
    ...r,
    cliente_codigo: r.clientes?.codigo,
    cliente_nome: r.clientes?.nome || "—",
    fotos: (r.fotos || []).sort((a: any, b: any) => (a.ordem ?? 0) - (b.ordem ?? 0)),
  }))

  return (
    <DiarioPageContent
      diarios={diarios}
      defaultResponsavel={defaultResponsavel}
      userPermissions={userPermissions}
    />
  )
}
