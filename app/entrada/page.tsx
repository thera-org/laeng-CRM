import { createClient } from "@/lib/supabase/server"
import { getUserContext } from "@/app/auth/context/userContext"
import type { Material, MaterialEntrada } from "@/lib/types"
import EntradaPageContent from "./entrada-page-content"

export const dynamic = "force-dynamic"

interface EntradaRow {
    id: string
    material_categoria_id: string
    quantidade: number | string | null
    data: string
    cliente_id?: string | null
    criado_por?: string | null
    justificativa?: string | null
    created_at: string
    updated_at: string
    tipo: MaterialEntrada["type"]
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

export default async function EntradaPage() {
    const supabase = await createClient()
    const { userPermissions, userRole, user } = await getUserContext()

    const { data: entradasData } = await supabase
        .from("material_movimentacoes")
        .select("*, material_categoria:material_categoria_id (id, nome_do_material), clientes:cliente_id (id, nome, codigo), responsavel:criado_por (id, nome_completo)")
        .eq("tipo", "ENTRADA")
        .order("data", { ascending: false })

    const entradas: MaterialEntrada[] = ((entradasData || []) as EntradaRow[]).map((e) => ({
        id: e.id,
        material_id: e.material_categoria_id,
        quantidade: Number(e.quantidade || 0),
        data: e.data,
        cliente_id: e.cliente_id || undefined,
        criado_por: e.criado_por || undefined,
        justificativa: e.justificativa || undefined,
        observacao: e.justificativa || undefined,
        created_at: e.created_at,
        updated_at: e.updated_at,
        type: e.tipo,
        material_nome: e.material_categoria?.nome_do_material || undefined,
        cliente_nome: e.clientes?.nome || undefined,
        cliente_codigo: e.clientes?.codigo || undefined,
        criado_por_nome: e.responsavel?.nome_completo || undefined,
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
        <EntradaPageContent
            entradas={entradas}
            materiais={materiais}
            clientes={clientesData || []}
            currentUser={currentUser}
            userPermissions={userPermissions}
            userRole={userRole}
        />
    )
}
