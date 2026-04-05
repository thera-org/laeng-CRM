"use client"

import { useCallback, useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Package } from "lucide-react"
import type { Material, MaterialCatalogFiltersState, MaterialClasse, MaterialGrupo, MaterialManagementMode } from "@/lib/types"
import { GestaoHeader } from "@/components/almoxarifado/gestao-header"
import { MaterialModal } from "@/components/almoxarifado/material-modal"
import { MaterialTable } from "@/components/almoxarifado/material-table"
import { AlmoxarifadoDeleteDialog } from "@/components/almoxarifado/almoxarifado-delete-dialog"
import { deleteMaterialAction } from "@/components/almoxarifado/actions/materialActions"
import { toast } from "@/hooks/use-toast"

interface GestaoPageContentProps {
    materiais: Material[]
    classes: MaterialClasse[]
    groups: MaterialGrupo[]
}

interface DeleteState {
    isOpen: boolean
    material: Material | null
    isDeleting: boolean
}

const INITIAL_FILTERS: MaterialCatalogFiltersState = {
    classe: "all",
    grupo: "all",
}

export default function GestaoPageContent({ materiais, classes, groups }: GestaoPageContentProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalMode, setModalMode] = useState<MaterialManagementMode>("material")
    const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
    const [filters, setFilters] = useState<MaterialCatalogFiltersState>(INITIAL_FILTERS)
    const [deleteState, setDeleteState] = useState<DeleteState>({
        isOpen: false,
        material: null,
        isDeleting: false,
    })

    const filteredMateriais = useMemo(() => {
        return materiais.filter((material) => {
            if (filters.classe !== "all" && material.classe_id !== filters.classe) return false
            if (filters.grupo !== "all" && material.grupo_id !== filters.grupo) return false
            return true
        })
    }, [filters, materiais])

    const updateFilter = (key: keyof MaterialCatalogFiltersState, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }))
    }

    const clearFilters = () => {
        setFilters(INITIAL_FILTERS)
    }

    const handleNewMaterial = () => {
        setModalMode("material")
        setSelectedMaterial(null)
        setIsModalOpen(true)
    }

    const handleNewClasse = () => {
        setModalMode("classe")
        setSelectedMaterial(null)
        setIsModalOpen(true)
    }

    const handleNewGrupo = () => {
        setModalMode("grupo")
        setSelectedMaterial(null)
        setIsModalOpen(true)
    }

    const handleEditMaterial = (material: Material) => {
        setModalMode("material")
        setSelectedMaterial(material)
        setIsModalOpen(true)
    }

    const handleOpenDeleteDialog = useCallback((material: Material) => {
        setDeleteState({ isOpen: true, material, isDeleting: false })
    }, [])

    const handleCloseDeleteDialog = useCallback(() => {
        setDeleteState({ isOpen: false, material: null, isDeleting: false })
    }, [])

    const handleConfirmDelete = useCallback(async () => {
        const { material } = deleteState
        if (!material) return
        setDeleteState((prev) => ({ ...prev, isDeleting: true }))
        try {
            const result = await deleteMaterialAction(material.id)
            if (!result.ok) throw new Error(result.error)
            toast({
                title: "Material excluido!",
                description: "O material foi removido com sucesso.",
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
            <GestaoHeader
                totalMateriais={filteredMateriais.length}
                filters={filters}
                updateFilter={updateFilter}
                clearFilters={clearFilters}
                classes={classes}
                groups={groups}
                onNewMaterial={handleNewMaterial}
                onNewClasse={handleNewClasse}
                onNewGrupo={handleNewGrupo}
            />

            <div className="flex-1 px-2 sm:px-4 lg:px-8 py-3 sm:py-6">
                {filteredMateriais.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                        <Package className="h-12 w-12 mb-4 text-gray-300" />
                        <p className="text-lg font-medium">Nenhum material encontrado.</p>
                        <p className="text-sm mt-1">Ajuste os filtros ou crie um novo cadastro.</p>
                    </div>
                ) : (
                    <Card className="border-0 rounded-xl sm:rounded-2xl shadow-lg min-h-[500px]">
                        <CardContent className="p-0">
                            <MaterialTable
                                data={filteredMateriais}
                                onEdit={handleEditMaterial}
                                onDelete={handleOpenDeleteDialog}
                            />
                        </CardContent>
                    </Card>
                )}
            </div>

            <AlmoxarifadoDeleteDialog
                isOpen={deleteState.isOpen}
                item={deleteState.material ? { id: deleteState.material.id, nome: deleteState.material.nome } : null}
                itemType="material"
                onClose={handleCloseDeleteDialog}
                onConfirm={handleConfirmDelete}
                isDeleting={deleteState.isDeleting}
            />

            <MaterialModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                mode={modalMode}
                material={selectedMaterial}
                classes={classes}
                groups={groups}
            />
        </div>
    )
}
