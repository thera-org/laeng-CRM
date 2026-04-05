import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getUserContext } from "@/app/auth/context/userContext"
import type { Material, MaterialEntrada } from "@/lib/types"
import EntradaPageContent from "./entrada-page-content"

export const dynamic = "force-dynamic"

export default async function EntradaPage() {
    const supabase = await createClient()
    const { userPermissions, userRole } = await getUserContext()
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser()
    if (error || !user) {
        redirect("/auth/login")
    }

    const { data: entradasData } = await supabase
        .from("material_movimentacoes")
        .select("*, material_categoria:material_categoria_id (id, nome_do_material), clientes:cliente_id (id, nome, codigo)")
        .eq("tipo", "ENTRADA")
        .order("data", { ascending: false })

    const entradas: MaterialEntrada[] = (entradasData || []).map((e: any) => ({
        id: e.id,
        material_id: e.material_categoria_id,
        quantidade: Number(e.quantidade || 0),
        data: e.data,
        cliente_id: e.cliente_id || undefined,
        justificativa: e.justificativa || undefined,
        observacao: e.justificativa || undefined,
        created_at: e.created_at,
        updated_at: e.updated_at,
        type: e.tipo,
        material_nome: e.material_categoria?.nome_do_material || null,
        cliente_nome: e.clientes?.nome || null,
        cliente_codigo: e.clientes?.codigo || null,
    }))

    const { data: materiaisData } = await supabase
        .from("material_categoria")
        .select("id, nome_do_material, estoque_global")
        .order("nome_do_material")

    const materiais: Pick<Material, "id" | "nome" | "estoque_global">[] = (materiaisData || []).map((material: any) => ({
        id: material.id,
        nome: material.nome_do_material,
        estoque_global: Number(material.estoque_global || 0),
    }))

    const { data: clientesData } = await supabase
        .from("clientes")
        .select("id, nome, codigo")
        .order("nome")

    return (
        <EntradaPageContent
            entradas={entradas}
            materiais={materiais}
            clientes={clientesData || []}
            userPermissions={userPermissions}
            userRole={userRole}
        />
    )
}
