import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { ClienteMaterialEstoque, MaterialEntrada, MaterialSaida } from "@/lib/types"
import FluxoMaterialPageContent from "./fluxo-material-page-content"

export const dynamic = "force-dynamic"

export default async function FluxoMaterialPage() {
    const supabase = await createClient()

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser()
    if (error || !user) {
        redirect("/auth/login")
    }

    const { data: entradasData } = await supabase
        .from("material_movimentacoes")
        .select("*, material_categoria:material_categoria_id (id, nome_do_material), clientes:cliente_id (id, nome)")
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
    }))

    const { data: saidasData } = await supabase
        .from("material_movimentacoes")
        .select("*, material_categoria:material_categoria_id (id, nome_do_material), clientes:cliente_id (id, nome)")
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
    }))

    const { data: materiaisData } = await supabase
        .from("material_categoria")
        .select("id, nome_do_material")
        .order("nome_do_material")

    const { data: estoquesData } = await supabase
        .from("clientes_material")
        .select("id, cliente_id, estoque, created_at, updated_at, material_categoria_id, material_categoria:material_categoria_id (id, nome_do_material), clientes:cliente_id (id, nome)")

    const estoques: ClienteMaterialEstoque[] = (estoquesData || []).map((item: any) => ({
        id: item.id,
        cliente_id: item.cliente_id,
        material_id: item.material_categoria_id,
        estoque: Number(item.estoque || 0),
        created_at: item.created_at,
        updated_at: item.updated_at,
        material_nome: item.material_categoria?.nome_do_material || null,
        cliente_nome: item.clientes?.nome || null,
    }))

    return (
        <FluxoMaterialPageContent
            entradas={entradas}
            saidas={saidas}
            estoques={estoques}
            materiais={(materiaisData || []).map((material: any) => ({ id: material.id, nome: material.nome_do_material }))}
        />
    )
}
