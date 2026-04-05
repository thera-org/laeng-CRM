"use server"

import { createClient } from "@/lib/supabase/server"
import type { Material, MaterialEntrada, MaterialSaida } from "@/lib/types"

interface FluxoMaterialDashboardData {
  entradas: MaterialEntrada[]
  saidas: MaterialSaida[]
  materiais: Pick<Material, "id" | "nome" | "estoque_global" | "classe_id" | "grupo_id" | "classe_nome" | "grupo_nome">[]
}

export async function getFluxoMaterialDashboardDataAction(): Promise<{
  ok: boolean
  data?: FluxoMaterialDashboardData
  error?: string
}> {
  const supabase = await createClient()

  try {
    const [entradasResult, saidasResult, materiaisResult] = await Promise.all([
      supabase
        .from("material_movimentacoes")
        .select("*, material_categoria:material_categoria_id (id, nome_do_material), clientes:cliente_id (id, nome)")
        .eq("tipo", "ENTRADA")
        .order("data", { ascending: false }),
      supabase
        .from("material_movimentacoes")
        .select("*, material_categoria:material_categoria_id (id, nome_do_material), clientes:cliente_id (id, nome)")
        .eq("tipo", "SAIDA")
        .order("data", { ascending: false }),
      supabase
        .from("material_categoria")
        .select("id, nome_do_material, estoque_global, material_classe_id, material_grupo_id, material_classe:material_classe_id (nome_da_classe), material_grupo:material_grupo_id (nome_do_grupo)")
        .order("nome_do_material"),
    ])

    if (entradasResult.error) throw entradasResult.error
    if (saidasResult.error) throw saidasResult.error
    if (materiaisResult.error) throw materiaisResult.error

    const entradas: MaterialEntrada[] = (entradasResult.data || []).map((entry: any) => ({
      id: entry.id,
      material_id: entry.material_categoria_id,
      quantidade: Number(entry.quantidade || 0),
      data: entry.data,
      cliente_id: entry.cliente_id || undefined,
      justificativa: entry.justificativa || undefined,
      observacao: entry.justificativa || undefined,
      created_at: entry.created_at,
      updated_at: entry.updated_at,
      type: entry.tipo,
      material_nome: entry.material_categoria?.nome_do_material || null,
      cliente_nome: entry.clientes?.nome || null,
    }))

    const saidas: MaterialSaida[] = (saidasResult.data || []).map((entry: any) => ({
      id: entry.id,
      material_id: entry.material_categoria_id,
      quantidade: Number(entry.quantidade || 0),
      data: entry.data,
      cliente_id: entry.cliente_id || undefined,
      justificativa: entry.justificativa || undefined,
      observacao: entry.justificativa || undefined,
      created_at: entry.created_at,
      updated_at: entry.updated_at,
      type: entry.tipo,
      material_nome: entry.material_categoria?.nome_do_material || null,
      cliente_nome: entry.clientes?.nome || null,
    }))

    const materiais: Pick<Material, "id" | "nome" | "estoque_global" | "classe_id" | "grupo_id" | "classe_nome" | "grupo_nome">[] = (materiaisResult.data || []).map((material: any) => ({
      id: material.id,
      nome: material.nome_do_material,
      estoque_global: Number(material.estoque_global || 0),
      classe_id: material.material_classe_id,
      grupo_id: material.material_grupo_id,
      classe_nome: material.material_classe?.nome_da_classe || "-",
      grupo_nome: material.material_grupo?.nome_do_grupo || "-",
    }))

    return {
      ok: true,
      data: {
        entradas,
        saidas,
        materiais,
      },
    }
  } catch (error: any) {
    return {
      ok: false,
      error: error.message || "Erro ao carregar dados do fluxo de material.",
    }
  }
}