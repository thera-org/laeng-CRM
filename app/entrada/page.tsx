import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getUserContext } from "@/app/auth/context/userContext"
import type { MaterialEntrada } from "@/lib/types"
import EntradaPageContent from "./entrada-page-content"

export const dynamic = "force-dynamic"

export default async function EntradaPage() {
    const supabase = await createClient()
    const { userPermissions } = await getUserContext()
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser()
    if (error || !user) {
        redirect("/auth/login")
    }

    const { data: entradasData } = await supabase
        .from("material_movimentacao")
        .select("*, materiais:material_id (id, nome), clientes:cliente_id (id, nome, codigo)")
        .eq("type", "ENTRADA")
        .order("data", { ascending: false })

    const entradas: MaterialEntrada[] = (entradasData || []).map((e: any) => ({
        ...e,
        material_nome: e.materiais?.nome || null,
        cliente_nome: e.clientes?.nome || null,
        cliente_codigo: e.clientes?.codigo || null,
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
        <EntradaPageContent
            entradas={entradas}
            materiais={materiaisData || []}
            clientes={clientesData || []}
            userPermissions={userPermissions}
        />
    )
}
