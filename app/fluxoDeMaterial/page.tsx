import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getFluxoMaterialDashboardDataAction } from "@/components/almoxarifado/actions/fluxoMaterialActions"
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

    const result = await getFluxoMaterialDashboardDataAction()

    if (!result.ok || !result.data) {
        throw new Error(result.error || "Erro ao carregar fluxo de material.")
    }

    return (
        <FluxoMaterialPageContent
            entradas={result.data.entradas}
            saidas={result.data.saidas}
            materiais={result.data.materiais}
        />
    )
}
