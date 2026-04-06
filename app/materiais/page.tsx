import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { Material, MaterialClasse, MaterialGrupo } from "@/lib/types"
import GestaoPageContent from "./gestao-page-content"

export const dynamic = "force-dynamic"

export default async function GestaoPage() {
    const supabase = await createClient()

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser()
    if (error || !user) {
        redirect("/auth/login")
    }

    const [materiaisResult, classesResult, groupsResult] = await Promise.all([
        supabase
            .from("material_categoria")
            .select(
                "id, nome_do_material, material_classe_id, material_grupo_id, unidade, estoque_global, quant_por_obra, created_at, updated_at, material_classe:material_classe_id (id, nome_da_classe), material_grupo:material_grupo_id (id, nome_do_grupo)"
            )
            .order("nome_do_material", { ascending: true }),
        supabase
            .from("material_classe")
            .select("id, nome_da_classe, created_at, updated_at")
            .order("nome_da_classe", { ascending: true }),
        supabase
            .from("material_grupo")
            .select("id, nome_do_grupo, created_at, updated_at")
            .order("nome_do_grupo", { ascending: true }),
    ])

    const materiais: Material[] = (materiaisResult.data || []).map((m: any) => ({
        id: m.id,
        nome: m.nome_do_material,
        classe_id: m.material_classe_id,
        grupo_id: m.material_grupo_id,
        classe_nome: m.material_classe?.nome_da_classe || "-",
        grupo_nome: m.material_grupo?.nome_do_grupo || "-",
        unidade: m.unidade,
        estoque_global: Number(m.estoque_global || 0),
        quant_por_obra: Number(m.quant_por_obra || 0),
        created_at: m.created_at,
        updated_at: m.updated_at,
    }))

    const classes: MaterialClasse[] = (classesResult.data || []).map((materialClass: any) => ({
        id: materialClass.id,
        nome: materialClass.nome_da_classe,
        created_at: materialClass.created_at,
        updated_at: materialClass.updated_at,
    }))

    const groups: MaterialGrupo[] = (groupsResult.data || []).map((group: any) => ({
        id: group.id,
        nome: group.nome_do_grupo,
        created_at: group.created_at,
        updated_at: group.updated_at,
    }))

    return <GestaoPageContent materiais={materiais} classes={classes} groups={groups} />
}
