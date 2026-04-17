import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getUserContext } from "@/app/auth/context/userContext"
import PlanejamentoPageContent from "./planejamento-page-content"
import type { PlanejamentoComCliente } from "@/lib/types"

export const dynamic = "force-dynamic"

export default async function PlanejamentoDeObrasPage() {
  const supabase = await createClient()
  const { userPermissions } = await getUserContext()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) redirect("/auth/login")

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
    .from("planejamento_obras")
    .select(
      `
      *,
      clientes:cliente_id ( id, codigo, nome ),
      atividades:planejamento_atividades ( id, planejamento_id, codigo, descricao, realizado, ordem, created_at, updated_at )
    `
    )
    .order("data_inicio", { ascending: false })

  const planejamentos: PlanejamentoComCliente[] = (rows || []).map((r: any) => ({
    ...r,
    cliente_codigo: r.clientes?.codigo,
    cliente_nome: r.clientes?.nome || "—",
    atividades: (r.atividades || []).sort((a: any, b: any) => (a.ordem ?? 0) - (b.ordem ?? 0)),
  }))

  return (
    <PlanejamentoPageContent
      planejamentos={planejamentos}
      defaultResponsavel={defaultResponsavel}
      userPermissions={userPermissions}
    />
  )
}
