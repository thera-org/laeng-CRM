"use client"

import { useState, useMemo } from "react"
import type { ClienteMaterialEstoque, FluxoMaterialResumo, MaterialEntrada, MaterialSaida } from "@/lib/types"
import { FluxoMaterialHeader } from "@/components/almoxarifado/fluxo-material-header"
import { FluxoMaterialDashboard } from "@/components/almoxarifado/fluxo-material-dashboard"

interface FluxoMaterialPageContentProps {
    entradas: MaterialEntrada[]
    saidas: MaterialSaida[]
    estoques: ClienteMaterialEstoque[]
    materiais: { id: string; nome: string }[]
}

export default function FluxoMaterialPageContent({
    entradas,
    saidas,
    estoques,
    materiais,
}: FluxoMaterialPageContentProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [materialFilter, setMaterialFilter] = useState("all")
    const [dateFrom, setDateFrom] = useState("")
    const [dateTo, setDateTo] = useState("")

    const clearFilters = () => {
        setSearchTerm("")
        setMaterialFilter("all")
        setDateFrom("")
        setDateTo("")
    }

    const filterItems = useMemo(() => {
        return (items: (MaterialEntrada | MaterialSaida)[]) => {
            return items.filter((item) => {
                if (materialFilter !== "all" && item.material_id !== materialFilter) return false
                if (dateFrom && item.data && item.data < dateFrom) return false
                if (dateTo && item.data && item.data > dateTo) return false

                if (searchTerm) {
                    const term = searchTerm.toLowerCase()
                    const matchesMaterial = (item.material_nome || "").toLowerCase().includes(term)
                    const matchesCliente = (item.cliente_nome || "").toLowerCase().includes(term)
                    const matchesObservacao = (item.observacao || "").toLowerCase().includes(term)

                    if (!matchesMaterial && !matchesCliente && !matchesObservacao) return false
                }

                return true
            })
        }
    }, [dateFrom, dateTo, materialFilter, searchTerm])

    const filteredEntradas = useMemo(() => filterItems(entradas), [entradas, filterItems])
    const filteredSaidas = useMemo(() => filterItems(saidas), [saidas, filterItems])
    const filteredEstoques = useMemo(() => {
        return estoques.filter((item) => {
            if (materialFilter !== "all" && item.material_id !== materialFilter) return false

            if (searchTerm) {
                const term = searchTerm.toLowerCase()
                const matchesMaterial = (item.material_nome || "").toLowerCase().includes(term)
                const matchesCliente = (item.cliente_nome || "").toLowerCase().includes(term)

                if (!matchesMaterial && !matchesCliente) return false
            }

            return true
        })
    }, [estoques, materialFilter, searchTerm])

    const filteredFluxo = useMemo(() => {
        const materialIds = new Set<string>()
        filteredEntradas.forEach((e) => materialIds.add(e.material_id))
        filteredSaidas.forEach((s) => materialIds.add(s.material_id))
        filteredEstoques.forEach((item) => materialIds.add(item.material_id))

        if (materialFilter !== "all") {
            materialIds.add(materialFilter)
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
            const estoqueAtual = filteredEstoques
                .filter((item) => item.material_id === mid)
                .reduce((sum, item) => sum + Number(item.estoque || 0), 0)

            const materialNome = materialMap.get(mid) || filteredEstoques.find((item) => item.material_id === mid)?.material_nome || filteredEntradas.find((item) => item.material_id === mid)?.material_nome || filteredSaidas.find((item) => item.material_id === mid)?.material_nome

            if (!materialNome) return

            if (searchTerm) {
                const term = searchTerm.toLowerCase()
                const hasMovementOrStockMatch =
                    filteredEntradas.some((item) => item.material_id === mid) ||
                    filteredSaidas.some((item) => item.material_id === mid) ||
                    filteredEstoques.some((item) => item.material_id === mid)

                if (!materialNome.toLowerCase().includes(term) && !hasMovementOrStockMatch) return
            }

            if (totalEntradas === 0 && totalSaidas === 0 && estoqueAtual === 0 && materialFilter === "all" && searchTerm) {
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
    }, [filteredEntradas, filteredEstoques, filteredSaidas, materiais, materialFilter, searchTerm])

    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <FluxoMaterialHeader
                totalMateriais={filteredFluxo.length}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                materialFilter={materialFilter}
                setMaterialFilter={setMaterialFilter}
                dateFrom={dateFrom}
                setDateFrom={setDateFrom}
                dateTo={dateTo}
                setDateTo={setDateTo}
                clearFilters={clearFilters}
                materiais={materiais}
            />

            <div className="flex-1 px-2 sm:px-4 lg:px-8 py-3 sm:py-6">
                <FluxoMaterialDashboard
                    data={filteredFluxo}
                    entradas={filteredEntradas}
                    saidas={filteredSaidas}
                />
            </div>
        </div>
    )
}
