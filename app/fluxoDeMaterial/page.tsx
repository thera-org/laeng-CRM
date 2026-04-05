import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { FluxoMaterialResumo, MaterialEntrada, MaterialSaida } from "@/lib/types"
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

    const { data: fluxoData } = await supabase
        .from("vw_fluxo_material")
        .select("*")

    const fluxo: FluxoMaterialResumo[] = (fluxoData || []).map((f: any) => ({
        material_id: f.material_categoria_id || f.material_id,
        material_nome: f.material_nome,
        total_entradas: Number(f.total_entradas),
        total_saidas: Number(f.total_saidas),
        estoque_atual: Number(f.estoque_atual),
    }))

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

    const { data: clientesData } = await supabase
        .from("clientes")
        .select("id, nome")
        .order("nome")

    return (
        <FluxoMaterialPageContent
            fluxo={fluxo}
            entradas={entradas}
            saidas={saidas}
            materiais={(materiaisData || []).map((material: any) => ({ id: material.id, nome: material.nome_do_material }))}
            clientes={clientesData || []}
        />
    )
}
