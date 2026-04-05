import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getUserContext } from "@/app/auth/context/userContext"
import type { ClienteMaterialEstoque, MaterialSaida } from "@/lib/types"
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
        .from("material_movimentacoes")
        .select("*, material_categoria:material_categoria_id (id, nome_do_material), clientes:cliente_id (id, nome, codigo)")
        .eq("tipo", "SAIDA")
        .order("data", { ascending: false })

    const saidas: MaterialSaida[] = (saidasData || []).map((s: any) => ({
        id: s.id,
        material_id: s.material_categoria_id,
        quantidade: Number(s.quantidade || 0),
        data: s.data,
        cliente_id: s.cliente_id || undefined,
        observacao: s.observacao || undefined,
        created_at: s.created_at,
        updated_at: s.updated_at,
        type: s.tipo,
        material_nome: s.material_categoria?.nome_do_material || null,
        cliente_nome: s.clientes?.nome || null,
        cliente_codigo: s.clientes?.codigo || null,
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
        <SaidaPageContent
            saidas={saidas}
            materiais={(materiaisData || []).map((material: any) => ({ id: material.id, nome: material.nome_do_material }))}
            clientes={clientesData || []}
            estoques={estoques}
            userPermissions={userPermissions}
        />
    )
}
