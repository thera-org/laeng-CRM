"use client"

import { useState, useMemo } from "react"
import type { FluxoMaterialResumo, Material, MaterialEntrada, MaterialFiltersState, MaterialSaida } from "@/lib/types"
import { FluxoMaterialHeader } from "@/components/almoxarifado/fluxo-material-header"
import { FluxoMaterialDashboard } from "@/components/almoxarifado/fluxo-material-dashboard"
import {
    filterMaterialItems,
    getAvailableMonth,
    getAvailableYears,
    INITIAL_MATERIAL_FILTERS,
} from "@/components/almoxarifado/libs/almoxarifado-filter-logic"

interface FluxoMaterialPageContentProps {
    entradas: MaterialEntrada[]
    saidas: MaterialSaida[]
    materiais: Pick<Material, "id" | "nome" | "estoque_global" | "classe_id" | "grupo_id" | "classe_nome" | "grupo_nome">[]
}

export default function FluxoMaterialPageContent({
    entradas,
    saidas,
    materiais,
}: FluxoMaterialPageContentProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [filters, setFilters] = useState<MaterialFiltersState>(INITIAL_MATERIAL_FILTERS)

    const combinedItems = useMemo(() => [...entradas, ...saidas], [entradas, saidas])
    const availableYears = useMemo(() => getAvailableYears(combinedItems), [combinedItems])
    const availableMonth = useMemo(() => getAvailableMonth(combinedItems), [combinedItems])

    const clientes = useMemo(() => {
        const clientsMap = new Map<string, { id: string; nome: string; codigo?: number }>()

        combinedItems.forEach((item) => {
            if (!item.cliente_id || !item.cliente_nome) return
            if (!clientsMap.has(item.cliente_id)) {
                clientsMap.set(item.cliente_id, {
                    id: item.cliente_id,
                    nome: item.cliente_nome,
                    codigo: item.cliente_codigo,
                })
            }
        })

        return Array.from(clientsMap.values()).sort((a, b) => a.nome.localeCompare(b.nome))
    }, [combinedItems])

    const clearFilters = () => {
        setSearchTerm("")
        setFilters(INITIAL_MATERIAL_FILTERS)
    }

    const updateFilter = (key: keyof MaterialFiltersState, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }))
    }

    const filteredEntradas = useMemo(() => filterMaterialItems(entradas, filters, searchTerm), [entradas, filters, searchTerm])
    const filteredSaidas = useMemo(() => filterMaterialItems(saidas, filters, searchTerm), [saidas, filters, searchTerm])
    const filteredMateriais = useMemo(() => {
        return materiais.filter((item) => {
            if (filters.material !== "all" && item.id !== filters.material) return false

            if (searchTerm) {
                const term = searchTerm.toLowerCase()
                const matchesMaterial = (item.nome || "").toLowerCase().includes(term)

                if (!matchesMaterial) return false
            }

            return true
        })
    }, [filters.material, materiais, searchTerm])

    const filteredFluxo = useMemo(() => {
        const materialIds = new Set<string>()
        filteredEntradas.forEach((e) => materialIds.add(e.material_id))
        filteredSaidas.forEach((s) => materialIds.add(s.material_id))
        filteredMateriais.forEach((item) => materialIds.add(item.id))

        if (filters.material !== "all") {
            materialIds.add(filters.material)
        }

        const result: FluxoMaterialResumo[] = []
        const materialMap = new Map(materiais.map((item) => [item.id, item.nome]))

        materialIds.forEach((mid) => {
            const totalEntradas = filteredEntradas
                .filter((e) => e.material_id === mid)
                .reduce((sum, e) => sum + e.quantidade, 0)
            const totalSaidas = filteredSaidas
                .filter((s) => s.material_id === mid)
                .reduce((sum, s) => sum + s.quantidade, 0)
            const estoqueAtual = Number(filteredMateriais.find((item) => item.id === mid)?.estoque_global || 0)

            const materialNome = materialMap.get(mid) || filteredEntradas.find((item) => item.material_id === mid)?.material_nome || filteredSaidas.find((item) => item.material_id === mid)?.material_nome

            if (!materialNome) return

            if (searchTerm) {
                const term = searchTerm.toLowerCase()
                const hasMovementOrStockMatch =
                    filteredEntradas.some((item) => item.material_id === mid) ||
                    filteredSaidas.some((item) => item.material_id === mid) ||
                    filteredMateriais.some((item) => item.id === mid)

                if (!materialNome.toLowerCase().includes(term) && !hasMovementOrStockMatch) return
            }

            if (totalEntradas === 0 && totalSaidas === 0 && estoqueAtual === 0 && filters.material === "all" && searchTerm) {
                return
            }

            result.push({
                material_id: mid,
                material_nome: materialNome,
                total_entradas: totalEntradas,
                total_saidas: totalSaidas,
                estoque_atual: estoqueAtual,
            })
        })

        return result.sort((a, b) => a.material_nome.localeCompare(b.material_nome))
    }, [filteredEntradas, filteredMateriais, filteredSaidas, materiais, filters.material, searchTerm])

    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <FluxoMaterialHeader
                totalMateriais={filteredFluxo.length}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                materialFilter={filters.material}
                setMaterialFilter={(value) => updateFilter("material", value)}
                monthFilter={filters.month}
                setMonthFilter={(value) => updateFilter("month", value)}
                yearFilter={filters.year}
                setYearFilter={(value) => updateFilter("year", value)}
                clearFilters={clearFilters}
                materiais={materiais.map((item) => ({ id: item.id, nome: item.nome }))}
                clientes={clientes}
                availableYears={availableYears}
                availableMonth={availableMonth}
            />

            <div className="flex-1 px-2 sm:px-4 lg:px-8 py-3 sm:py-6">
                <FluxoMaterialDashboard
                    data={filteredFluxo}
                    entradas={filteredEntradas}
                    saidas={filteredSaidas}
                    materiais={filteredMateriais}
                />
            </div>
        </div>
    )
}
