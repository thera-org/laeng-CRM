"use client"

import { useState, useMemo, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import type { Material } from "@/lib/types"
import { GestaoHeader } from "@/components/almoxarifado/gestao-header"
import { GestaoTable } from "@/components/almoxarifado/gestao-table"
import { MaterialModal } from "@/components/almoxarifado/material-modal"
import { AlmoxarifadoDeleteDialog } from "@/components/almoxarifado/almoxarifado-delete-dialog"
import { deleteMaterialAction, toggleMaterialAtivoAction } from "@/components/almoxarifado/actions/materialActions"
import { toast } from "@/hooks/use-toast"

interface GestaoPageContentProps {
    materiais: Material[]
}

interface DeleteState {
    isOpen: boolean
    material: Material | null
    isDeleting: boolean
}

export default function GestaoPageContent({ materiais }: GestaoPageContentProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
    const [deleteState, setDeleteState] = useState<DeleteState>({
        isOpen: false,
        material: null,
        isDeleting: false,
    })

    const filteredMateriais = useMemo(() => {
        if (!searchTerm) return materiais
        const term = searchTerm.toLowerCase()
        return materiais.filter((m) => m.nome.toLowerCase().includes(term))
    }, [materiais, searchTerm])

    const totalAtivos = useMemo(() => materiais.filter((m) => m.ativo).length, [materiais])

    const handleNewMaterial = () => {
        setSelectedMaterial(null)
        setIsModalOpen(true)
    }

    const handleEditMaterial = (material: Material) => {
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

    const handleToggleAtivo = useCallback(async (material: Material) => {
        try {
            const result = await toggleMaterialAtivoAction(material.id, !material.ativo)
            if (!result.ok) throw new Error(result.error)
            toast({
                title: material.ativo ? "Material desativado" : "Material ativado",
                description: `${material.nome} foi ${material.ativo ? "desativado" : "ativado"}.`,
            })
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
            toast({
                title: "Erro",
                description: errorMessage,
                variant: "destructive",
            })
        }
    }, [])

    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <GestaoHeader
                totalMateriais={materiais.length}
                totalAtivos={totalAtivos}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onNewMaterial={handleNewMaterial}
            />

            <div className="flex-1 px-2 sm:px-4 lg:px-8 py-3 sm:py-6">
                <Card className="border-0 rounded-xl sm:rounded-2xl shadow-lg min-h-[500px]">
                    <CardContent className="p-0">
                        <GestaoTable
                            data={filteredMateriais}
                            onEdit={handleEditMaterial}
                            onDelete={handleOpenDeleteDialog}
                            onToggleAtivo={handleToggleAtivo}
                        />
                    </CardContent>
                </Card>
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
                material={selectedMaterial}
            />
        </div>
    )
}
