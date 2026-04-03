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
        .from("material_saidas")
        .select("*, materiais:material_id (id, nome, unidade_medida), clientes:cliente_id (id, nome)")
        .order("data", { ascending: false })

    const saidas: MaterialSaida[] = (saidasData || []).map((s: any) => ({
        ...s,
        material_nome: s.materiais?.nome || null,
        material_unidade: s.materiais?.unidade_medida || null,
        cliente_nome: s.clientes?.nome || null,
    }))

    const { data: materiaisData } = await supabase
        .from("materiais")
        .select("id, nome, unidade_medida")
        .eq("ativo", true)
        .order("nome")

    const { data: clientesData } = await supabase
        .from("clientes")
        .select("id, nome")
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
