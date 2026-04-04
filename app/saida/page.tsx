import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getUserContext } from "@/app/auth/context/userContext"
import type { MaterialSaida } from "@/lib/types"
import SaidaPageContent from "./saida-page-content"

export const dynamic = "force-dynamic"

export default async function SaidaPage() {
    const supabase = await createClient()
    const { userPermissions } = await getUserContext()
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser()
    if (error || !user) {
        redirect("/auth/login")
    }

    const { data: saidasData } = await supabase
        .from("material_movimentacao")
        .select("*, materiais:material_id (id, nome), clientes:cliente_id (id, nome, codigo)")
        .eq("type", "SAIDA")
        .order("data", { ascending: false })

    const saidas: MaterialSaida[] = (saidasData || []).map((s: any) => ({
        ...s,
        material_nome: s.materiais?.nome || null,
        cliente_nome: s.clientes?.nome || null,
        cliente_codigo: s.clientes?.codigo || null,
    }))

    const { data: materiaisData } = await supabase
        .from("materiais")
        .select("id, nome")
        .order("nome")

    const { data: clientesData } = await supabase
        .from("clientes")
        .select("id, nome, codigo")
        .order("nome")

    return (
        <SaidaPageContent
            saidas={saidas}
            materiais={materiaisData || []}
            clientes={clientesData || []}
            userPermissions={userPermissions}
        />
    )
}
