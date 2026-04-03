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
        material_id: f.material_id,
        material_nome: f.material_nome,
        unidade_medida: f.unidade_medida,
        estoque_inicial: Number(f.estoque_inicial),
        total_entradas: Number(f.total_entradas),
        total_saidas: Number(f.total_saidas),
        estoque_atual: Number(f.estoque_atual),
    }))

    const { data: entradasData } = await supabase
        .from("material_entradas")
        .select("*, materiais:material_id (id, nome, unidade_medida), clientes:cliente_id (id, nome)")
        .order("data", { ascending: false })

    const entradas: MaterialEntrada[] = (entradasData || []).map((e: any) => ({
        ...e,
        material_nome: e.materiais?.nome || null,
        material_unidade: e.materiais?.unidade_medida || null,
        cliente_nome: e.clientes?.nome || null,
    }))

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
        .select("id, nome")
        .eq("ativo", true)
        .order("nome")

    const { data: clientesData } = await supabase
        .from("clientes")
        .select("id, nome")
        .order("nome")

    return (
        <FluxoMaterialPageContent
            fluxo={fluxo}
            entradas={entradas}
            saidas={saidas}
            materiais={materiaisData || []}
            clientes={clientesData || []}
        />
    )
}
