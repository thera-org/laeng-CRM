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
        .from("materiais")
        .select("*")
        .order("nome", { ascending: true })

    const materiais: Material[] = (materiaisData || []).map((m: any) => ({
        ...m,
    }))

    return <GestaoPageContent materiais={materiais} />
}
