"use client"

import { useState, useMemo, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import type { Material, MaterialSaida, MaterialFiltersState, MaterialGrupo, PermissoesUsuario } from "@/lib/types"
import { SaidaHeader } from "@/components/almoxarifado/saida-header"
import { SaidaTable } from "@/components/almoxarifado/saida-table"
import { SaidaModal } from "@/components/almoxarifado/saida-modal"
import { AlmoxarifadoDeleteDialog } from "@/components/almoxarifado/almoxarifado-delete-dialog"
import { deleteSaidaAction } from "@/components/almoxarifado/actions/saidaActions"
import {
    filterMaterialItems,
    getAvailableYears,
    getAvailableMonth,
    INITIAL_MATERIAL_FILTERS,
} from "@/components/almoxarifado/libs/almoxarifado-filter-logic"
import { toast } from "@/hooks/use-toast"

interface SaidaPageContentProps {
    saidas: MaterialSaida[]
    materiais: Pick<Material, "id" | "nome" | "estoque_global" | "grupo_id" | "grupo_nome">[]
    groups: MaterialGrupo[]
    clientes: { id: string; nome: string; codigo?: number }[]
    currentUser: { id: string; nome: string }
    userPermissions: Partial<PermissoesUsuario>
    userRole: string
}

interface DeleteState {
    isOpen: boolean
    saida: MaterialSaida | null
    isDeleting: boolean
}

export default function SaidaPageContent({
    saidas,
    materiais,
    groups,
    clientes,
    currentUser,
    userPermissions,
    userRole,
}: SaidaPageContentProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [filters, setFilters] = useState<MaterialFiltersState>(INITIAL_MATERIAL_FILTERS)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedSaida, setSelectedSaida] = useState<MaterialSaida | null>(null)
    const [deleteState, setDeleteState] = useState<DeleteState>({
        isOpen: false,
        saida: null,
        isDeleting: false,
    })

    const availableYears = useMemo(() => getAvailableYears(saidas), [saidas])
    const availableMonth = useMemo(() => getAvailableMonth(saidas), [saidas])

    const filteredSaidas = useMemo(() => {
        return filterMaterialItems(saidas, filters, searchTerm)
    }, [saidas, filters, searchTerm])

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

    const handleNewSaida = () => {
        setSelectedSaida(null)
        setIsModalOpen(true)
    }

    const handleEditSaida = (saida: MaterialSaida) => {
        setSelectedSaida(saida)
        setIsModalOpen(true)
    }

    const handleOpenDeleteDialog = useCallback((saida: MaterialSaida) => {
        setDeleteState({ isOpen: true, saida, isDeleting: false })
    }, [])

    const handleCloseDeleteDialog = useCallback(() => {
        setDeleteState({ isOpen: false, saida: null, isDeleting: false })
    }, [])

    const handleConfirmDelete = useCallback(async () => {
        const { saida } = deleteState
        if (!saida) return
        setDeleteState((prev) => ({ ...prev, isDeleting: true }))
        try {
            const result = await deleteSaidaAction(saida.id)
            if (!result.ok) throw new Error(result.error)
            toast({
                title: "Saida excluida!",
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
            <SaidaHeader
                totalSaidas={filteredSaidas.length}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filters={filters}
                updateFilter={updateFilter}
                clearFilters={clearFilters}
                availableYears={availableYears}
                availableMonth={availableMonth}
                materiais={materiaisOptions}
                clientes={clientes}
                onNewSaida={handleNewSaida}
                userPermissions={userPermissions}
                userRole={userRole}
            />

            <div className="flex-1 px-2 sm:px-4 lg:px-8 py-3 sm:py-6">
                <Card className="border-0 rounded-xl sm:rounded-2xl shadow-lg min-h-[500px]">
                    <CardContent className="p-0">
                        <SaidaTable
                            data={filteredSaidas}
                            userPermissions={userPermissions}
                            userRole={userRole}
                            onEdit={handleEditSaida}
                            onDelete={handleOpenDeleteDialog}
                        />
                    </CardContent>
                </Card>
            </div>

            <AlmoxarifadoDeleteDialog
                isOpen={deleteState.isOpen}
                item={
                    deleteState.saida
                        ? {
                              id: deleteState.saida.id,
                              material_nome: deleteState.saida.material_nome,
                              quantidade: deleteState.saida.quantidade,
                          }
                        : null
                }
                itemType="saida"
                onClose={handleCloseDeleteDialog}
                onConfirm={handleConfirmDelete}
                isDeleting={deleteState.isDeleting}
            />

            <SaidaModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                saida={selectedSaida}
                materiais={materiais}
                groups={groups}
                clientes={clientes}
                currentUser={currentUser}
            />
        </div>
    )
}
