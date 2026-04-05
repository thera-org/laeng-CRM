import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { Material } from "@/lib/types"
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

    const { data: materiaisData } = await supabase
        .from("material_categoria")
        .select("id, nome_do_material, created_at, updated_at")
        .order("nome_do_material", { ascending: true })

    const materiais: Material[] = (materiaisData || []).map((m: any) => ({
        id: m.id,
        nome: m.nome_do_material,
        created_at: m.created_at,
        updated_at: m.updated_at,
    }))

    return <GestaoPageContent materiais={materiais} />
}
