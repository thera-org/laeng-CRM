"use client"

import { useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Package } from "lucide-react"
import type { Material } from "@/lib/types"
import { GestaoHeader } from "@/components/almoxarifado/gestao-header"
import { MaterialModal } from "@/components/almoxarifado/material-modal"
import { AlmoxarifadoDeleteDialog } from "@/components/almoxarifado/almoxarifado-delete-dialog"
import { deleteMaterialAction } from "@/components/almoxarifado/actions/materialActions"
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
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
    const [deleteState, setDeleteState] = useState<DeleteState>({
        isOpen: false,
        material: null,
        isDeleting: false,
    })

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

    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <GestaoHeader
                totalMateriais={materiais.length}
                onNewMaterial={handleNewMaterial}
            />

            <div className="flex-1 px-2 sm:px-4 lg:px-8 py-3 sm:py-6">
                {materiais.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                        <Package className="h-12 w-12 mb-4 text-gray-300" />
                        <p className="text-lg font-medium">Nenhum material cadastrado.</p>
                        <p className="text-sm mt-1">Clique em &quot;Novo Material&quot; para comecar.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                        {materiais.map((material) => (
                            <Card
                                key={material.id}
                                className="border-2 border-gray-200 hover:border-[#F5C800] transition-all hover:shadow-md rounded-xl"
                            >
                                <CardContent className="p-4 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-lg bg-[#F5C800]/10 flex items-center justify-center flex-shrink-0">
                                            <Package className="h-5 w-5 text-[#F5C800]" />
                                        </div>
                                        <span className="font-semibold text-[#1E1E1E] truncate">
                                            {material.nome}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEditMaterial(material)}
                                            title="Editar"
                                            className="h-8 w-8 text-[#F5C800] hover:text-[#F5C800]/80 hover:bg-[#F5C800]/10"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleOpenDeleteDialog(material)}
                                            title="Excluir"
                                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
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
                material={selectedMaterial}
            />
        </div>
    )
}
