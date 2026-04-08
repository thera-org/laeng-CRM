import { createClient } from "@/lib/supabase/server"
import { getUserContext } from "@/app/auth/context/userContext"
import type { Material, MaterialSaida, MaterialGrupo } from "@/lib/types"
import SaidaPageContent from "./saida-page-content"

export const dynamic = "force-dynamic"

interface SaidaRow {
    id: string
    material_categoria_id: string
    quantidade: number | string | null
    data: string
    cliente_id?: string | null
    criado_por?: string | null
    justificativa?: string | null
    created_at: string
    updated_at: string
    tipo: MaterialSaida["type"]
    material_categoria?: { id: string; nome_do_material: string } | null
    clientes?: { id: string; nome: string; codigo?: number | null } | null
    responsavel?: { id: string; nome_completo?: string | null } | null
}

interface MaterialOptionRow {
    id: string
    nome_do_material: string
    estoque_global: number | string | null
    material_grupo_id?: string | null
    material_grupo?:
        | { id: string; nome_do_grupo?: string | null }
        | { id: string; nome_do_grupo?: string | null }[]
        | null
}

export default async function SaidaPage() {
    const supabase = await createClient()
    const { userPermissions, userRole, user } = await getUserContext()

    const { data: saidasData } = await supabase
        .from("material_movimentacoes")
        .select("*, material_categoria:material_categoria_id (id, nome_do_material), clientes:cliente_id (id, nome, codigo), responsavel:criado_por (id, nome_completo)")
        .eq("tipo", "SAIDA")
        .order("data", { ascending: false })

    const saidas: MaterialSaida[] = ((saidasData || []) as SaidaRow[]).map((s) => ({
        id: s.id,
        material_id: s.material_categoria_id,
        quantidade: Number(s.quantidade || 0),
        data: s.data,
        cliente_id: s.cliente_id || undefined,
        criado_por: s.criado_por || undefined,
        justificativa: s.justificativa || undefined,
        observacao: s.justificativa || undefined,
        created_at: s.created_at,
        updated_at: s.updated_at,
        type: s.tipo,
        material_nome: s.material_categoria?.nome_do_material || undefined,
        cliente_nome: s.clientes?.nome || undefined,
        cliente_codigo: s.clientes?.codigo || undefined,
        criado_por_nome: s.responsavel?.nome_completo || undefined,
    }))

    const { data: materiaisData } = await supabase
        .from("material_categoria")
        .select("id, nome_do_material, estoque_global, material_grupo_id, material_grupo:material_grupo_id (id, nome_do_grupo)")
        .order("nome_do_material")

    const materiais: Pick<Material, "id" | "nome" | "estoque_global" | "grupo_id" | "grupo_nome">[] = ((materiaisData || []) as MaterialOptionRow[]).map((material) => {
        const materialGroup = Array.isArray(material.material_grupo) ? material.material_grupo[0] : material.material_grupo

        return {
            id: material.id,
            nome: material.nome_do_material,
            estoque_global: Number(material.estoque_global || 0),
            grupo_id: material.material_grupo_id || "",
            grupo_nome: materialGroup?.nome_do_grupo || "Sem grupo",
        }
    })

    const { data: clientesData } = await supabase
        .from("clientes")
        .select("id, nome, codigo")
        .order("nome")

    const { data: groupsData } = await supabase
        .from("material_grupo")
        .select("id, nome_do_grupo, created_at, updated_at")
        .order("nome_do_grupo")

    const groups: MaterialGrupo[] = (groupsData || []).map((group) => ({
        id: group.id,
        nome: group.nome_do_grupo,
        created_at: group.created_at,
        updated_at: group.updated_at,
    }))

    const { data: profileData } = await supabase
        .from("profiles")
        .select("id, nome_completo, login, email")
        .eq("id", user.id)
        .maybeSingle()

    const currentUser = {
        id: user.id,
        nome:
            profileData?.nome_completo ||
            profileData?.login ||
            profileData?.email ||
            user.email ||
            "Usuário",
    }

    return (
        <SaidaPageContent
            saidas={saidas}
            materiais={materiais}
            groups={groups}
            clientes={clientesData || []}
            currentUser={currentUser}
            userPermissions={userPermissions}
            userRole={userRole}
        />
    )
}
