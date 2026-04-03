"use client"

import { useState, useMemo } from "react"
import type { FluxoMaterialResumo, MaterialEntrada, MaterialSaida } from "@/lib/types"
import { FluxoMaterialHeader } from "@/components/almoxarifado/fluxo-material-header"
import { FluxoMaterialDashboard } from "@/components/almoxarifado/fluxo-material-dashboard"

interface FluxoMaterialPageContentProps {
    fluxo: FluxoMaterialResumo[]
    entradas: MaterialEntrada[]
    saidas: MaterialSaida[]
    materiais: { id: string; nome: string }[]
    clientes: { id: string; nome: string }[]
}

export default function FluxoMaterialPageContent({
    fluxo,
    entradas,
    saidas,
    materiais,
    clientes,
}: FluxoMaterialPageContentProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [materialFilter, setMaterialFilter] = useState("all")
    const [clienteFilter, setClienteFilter] = useState("all")
    const [dateFrom, setDateFrom] = useState("")
    const [dateTo, setDateTo] = useState("")

    const clearFilters = () => {
        setSearchTerm("")
        setMaterialFilter("all")
        setClienteFilter("all")
        setDateFrom("")
        setDateTo("")
    }

    // When filters are applied, compute fluxo dynamically from entradas/saidas
    const filteredFluxo = useMemo(() => {
        const hasAdvancedFilter = clienteFilter !== "all" || dateFrom || dateTo

        if (!hasAdvancedFilter) {
            // Use the view data directly (faster), just apply material and search filters
            return fluxo.filter((item) => {
                if (materialFilter !== "all" && item.material_id !== materialFilter) return false
                if (searchTerm) {
                    const term = searchTerm.toLowerCase()
                    if (!item.material_nome.toLowerCase().includes(term)) return false
                }
                return true
            })
        }

        // Advanced filtering: recompute from raw entradas/saidas
        const filterItems = (items: (MaterialEntrada | MaterialSaida)[]) => {
            return items.filter((item) => {
                if (materialFilter !== "all" && item.material_id !== materialFilter) return false
                if (clienteFilter !== "all" && item.cliente_id !== clienteFilter) return false
                if (dateFrom && item.data && item.data < dateFrom) return false
                if (dateTo && item.data && item.data > dateTo) return false
                return true
            })
        }

        const filteredEntradas = filterItems(entradas)
        const filteredSaidas = filterItems(saidas)

        // Get relevant material IDs
        const materialIds = new Set<string>()
        filteredEntradas.forEach((e) => materialIds.add(e.material_id))
        filteredSaidas.forEach((s) => materialIds.add(s.material_id))

        // Also include materials from fluxo that match the material filter
        if (materialFilter !== "all") {
            materialIds.add(materialFilter)
        }

        // Build aggregated fluxo
        const result: FluxoMaterialResumo[] = []
        const fluxoMap = new Map(fluxo.map((f) => [f.material_id, f]))

        materialIds.forEach((mid) => {
            const original = fluxoMap.get(mid)
            if (!original) return

            if (searchTerm) {
                const term = searchTerm.toLowerCase()
                if (!original.material_nome.toLowerCase().includes(term)) return
            }

            const totalEntradas = filteredEntradas
                .filter((e) => e.material_id === mid)
                .reduce((sum, e) => sum + e.quantidade, 0)
            const totalSaidas = filteredSaidas
                .filter((s) => s.material_id === mid)
                .reduce((sum, s) => sum + s.quantidade, 0)

            result.push({
                material_id: original.material_id,
                material_nome: original.material_nome,
                unidade_medida: original.unidade_medida,
                estoque_inicial: original.estoque_inicial,
                total_entradas: totalEntradas,
                total_saidas: totalSaidas,
                estoque_atual: original.estoque_inicial + totalEntradas - totalSaidas,
            })
        })

        return result.sort((a, b) => a.material_nome.localeCompare(b.material_nome))
    }, [fluxo, entradas, saidas, materialFilter, clienteFilter, dateFrom, dateTo, searchTerm])

    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <FluxoMaterialHeader
                totalMateriais={filteredFluxo.length}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                materialFilter={materialFilter}
                setMaterialFilter={setMaterialFilter}
                clienteFilter={clienteFilter}
                setClienteFilter={setClienteFilter}
                dateFrom={dateFrom}
                setDateFrom={setDateFrom}
                dateTo={dateTo}
                setDateTo={setDateTo}
                clearFilters={clearFilters}
                materiais={materiais}
                clientes={clientes}
            />

            <div className="flex-1 px-2 sm:px-4 lg:px-8 py-3 sm:py-6">
                <FluxoMaterialDashboard data={filteredFluxo} />
            </div>
        </div>
    )
}
