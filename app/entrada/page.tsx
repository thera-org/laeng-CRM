import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getUserContext } from "@/app/auth/context/userContext"
import type { ClienteMaterialEstoque, MaterialEntrada } from "@/lib/types"
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
        observacao: e.observacao || undefined,
        created_at: e.created_at,
        updated_at: e.updated_at,
        type: e.tipo,
        material_nome: e.material_categoria?.nome_do_material || null,
        cliente_nome: e.clientes?.nome || null,
        cliente_codigo: e.clientes?.codigo || null,
    }))

    const { data: materiaisData } = await supabase
        .from("material_categoria")
        .select("id, nome_do_material")
        .order("nome_do_material")

    const { data: estoquesData } = await supabase
        .from("clientes_material")
        .select("id, cliente_id, estoque, created_at, updated_at, material_categoria_id, material_categoria:material_categoria_id (id, nome_do_material)")

    const estoques: ClienteMaterialEstoque[] = (estoquesData || []).map((item: any) => ({
        id: item.id,
        cliente_id: item.cliente_id,
        material_id: item.material_categoria_id,
        estoque: Number(item.estoque || 0),
        created_at: item.created_at,
        updated_at: item.updated_at,
        material_nome: item.material_categoria?.nome_do_material || null,
    }))

    const { data: clientesData } = await supabase
        .from("clientes")
        .select("id, nome, codigo")
        .order("nome")

    return (
        <EntradaPageContent
            entradas={entradas}
            materiais={(materiaisData || []).map((material: any) => ({ id: material.id, nome: material.nome_do_material }))}
            clientes={clientesData || []}
            estoques={estoques}
            userPermissions={userPermissions}
        />
    )
}
