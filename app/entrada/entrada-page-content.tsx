"use client"

import { useState, useMemo, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import type { ClienteMaterialEstoque, MaterialEntrada, MaterialFiltersState } from "@/lib/types"
import { EntradaHeader } from "@/components/almoxarifado/entrada-header"
import { EntradaTable } from "@/components/almoxarifado/entrada-table"
import { EntradaModal } from "@/components/almoxarifado/entrada-modal"
import { AlmoxarifadoDeleteDialog } from "@/components/almoxarifado/almoxarifado-delete-dialog"
import { deleteEntradaAction } from "@/components/almoxarifado/actions/entradaActions"
import {
    filterMaterialItems,
    getAvailableYears,
    getAvailableMonth,
    INITIAL_MATERIAL_FILTERS,
} from "@/components/almoxarifado/libs/almoxarifado-filter-logic"
import { toast } from "@/hooks/use-toast"

interface EntradaPageContentProps {
    entradas: MaterialEntrada[]
    materiais: { id: string; nome: string }[]
    clientes: { id: string; nome: string; codigo?: number }[]
    estoques: ClienteMaterialEstoque[]
    userPermissions: Record<string, any>
}

interface DeleteState {
    isOpen: boolean
    entrada: MaterialEntrada | null
    isDeleting: boolean
}

export default function EntradaPageContent({
    entradas,
    materiais,
    clientes,
    estoques,
    userPermissions,
}: EntradaPageContentProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [filters, setFilters] = useState<MaterialFiltersState>(INITIAL_MATERIAL_FILTERS)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedEntrada, setSelectedEntrada] = useState<MaterialEntrada | null>(null)
    const [deleteState, setDeleteState] = useState<DeleteState>({
        isOpen: false,
        entrada: null,
        isDeleting: false,
    })

    const availableYears = useMemo(() => getAvailableYears(entradas), [entradas])
    const availableMonth = useMemo(() => getAvailableMonth(entradas), [entradas])

    const filteredEntradas = useMemo(() => {
        return filterMaterialItems(entradas, filters, searchTerm)
    }, [entradas, filters, searchTerm])

    const materiaisOptions = useMemo(
        () => materiais.map((m) => ({ id: m.id, nome: m.nome })),
        [materiais]
    )

    const updateFilter = (key: keyof MaterialFiltersState, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }))
    }

    const clearFilters = () => {
        setFilters(INITIAL_MATERIAL_FILTERS)
        setSearchTerm("")
    }

    const handleNewEntrada = () => {
        setSelectedEntrada(null)
        setIsModalOpen(true)
    }

    const handleEditEntrada = (entrada: MaterialEntrada) => {
        setSelectedEntrada(entrada)
        setIsModalOpen(true)
    }

    const handleOpenDeleteDialog = useCallback((entrada: MaterialEntrada) => {
        setDeleteState({ isOpen: true, entrada, isDeleting: false })
    }, [])

    const handleCloseDeleteDialog = useCallback(() => {
        setDeleteState({ isOpen: false, entrada: null, isDeleting: false })
    }, [])

    const handleConfirmDelete = useCallback(async () => {
        const { entrada } = deleteState
        if (!entrada) return
        setDeleteState((prev) => ({ ...prev, isDeleting: true }))
        try {
            const result = await deleteEntradaAction(entrada.id)
            if (!result.ok) throw new Error(result.error)
            toast({
                title: "Entrada excluida!",
                description: "O registro foi removido com sucesso.",
            })
            handleCloseDeleteDialog()
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
            toast({
                title: "Erro ao excluir",
                description: errorMessage,
                variant: "destructive",
            })
            setDeleteState((prev) => ({ ...prev, isDeleting: false }))
        }
    }, [deleteState, handleCloseDeleteDialog])

    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <EntradaHeader
                totalEntradas={filteredEntradas.length}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filters={filters}
                updateFilter={updateFilter}
                clearFilters={clearFilters}
                availableYears={availableYears}
                availableMonth={availableMonth}
                materiais={materiaisOptions}
                onNewEntrada={handleNewEntrada}
                userPermissions={userPermissions}
            />

            <div className="flex-1 px-2 sm:px-4 lg:px-8 py-3 sm:py-6">
                <Card className="border-0 rounded-xl sm:rounded-2xl shadow-lg min-h-[500px]">
                    <CardContent className="p-0">
                        <EntradaTable
                            data={filteredEntradas}
                            userPermissions={userPermissions}
                            onEdit={handleEditEntrada}
                            onDelete={handleOpenDeleteDialog}
                        />
                    </CardContent>
                </Card>
            </div>

            <AlmoxarifadoDeleteDialog
                isOpen={deleteState.isOpen}
                item={
                    deleteState.entrada
                        ? {
                              id: deleteState.entrada.id,
                              material_nome: deleteState.entrada.material_nome,
                              quantidade: deleteState.entrada.quantidade,
                          }
                        : null
                }
                itemType="entrada"
                onClose={handleCloseDeleteDialog}
                onConfirm={handleConfirmDelete}
                isDeleting={deleteState.isDeleting}
            />

            <EntradaModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                entrada={selectedEntrada}
                materiais={materiais}
                clientes={clientes}
                estoques={estoques}
            />
        </div>
    )
}
