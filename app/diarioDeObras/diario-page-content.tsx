"use client"

import { useCallback, useMemo, useState } from "react"
import { toast } from "@/hooks/use-toast"
import { DiariosHeader } from "@/components/diario/diarios-header"
import { DiariosTableFull } from "@/components/diario/diarios-table-full"
import { DiarioModal } from "@/components/diario/diario-modal"
import { DiariosDeleteDialog } from "@/components/diario/diarios-delete-dialog"
import {
  INITIAL_DIARIO_FILTERS,
  filterDiarios,
  getAvailableMonth,
  getAvailableYears,
} from "@/components/diario/libs/diario-filter-logic"
import { deleteDiarioAction } from "@/components/diario/actions/diarioActions"
import type { DiarioComCliente, DiarioFiltersState } from "@/lib/types"

interface DiarioPageContentProps {
  diarios: DiarioComCliente[]
  defaultResponsavel: string
  userPermissions: Record<string, any>
}

export default function DiarioPageContent({
  diarios,
  defaultResponsavel,
}: DiarioPageContentProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<DiarioFiltersState>(INITIAL_DIARIO_FILTERS)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selected, setSelected] = useState<DiarioComCliente | null>(null)

  const [deleteState, setDeleteState] = useState<{
    isOpen: boolean
    diario: DiarioComCliente | null
    isDeleting: boolean
  }>({ isOpen: false, diario: null, isDeleting: false })

  const availableYears = useMemo(() => getAvailableYears(diarios), [diarios])
  const availableMonth = useMemo(() => getAvailableMonth(diarios), [diarios])

  const filtered = useMemo(
    () => filterDiarios(diarios, filters, searchTerm),
    [diarios, filters, searchTerm]
  )

  const updateFilter = (key: keyof DiarioFiltersState, value: string) =>
    setFilters((p) => ({ ...p, [key]: value }))

  const clearFilters = () => {
    setFilters(INITIAL_DIARIO_FILTERS)
    setSearchTerm("")
  }

  const handleNew = () => {
    setSelected(null)
    setIsModalOpen(true)
  }

  const handleEdit = (d: DiarioComCliente) => {
    setSelected(d)
    setIsModalOpen(true)
  }

  const openDelete = useCallback((d: DiarioComCliente) => {
    setDeleteState({ isOpen: true, diario: d, isDeleting: false })
  }, [])

  const closeDelete = useCallback(() => {
    setDeleteState({ isOpen: false, diario: null, isDeleting: false })
  }, [])

  const confirmDelete = useCallback(async () => {
    if (!deleteState.diario) return
    setDeleteState((p) => ({ ...p, isDeleting: true }))
    const res = await deleteDiarioAction(deleteState.diario.id)
    if (!res.ok) {
      toast({ title: "Erro ao excluir", description: res.error, variant: "destructive" })
      setDeleteState((p) => ({ ...p, isDeleting: false }))
      return
    }
    toast({ title: "Diário excluído" })
    closeDelete()
  }, [deleteState.diario, closeDelete])

  return (
    <div className="p-4 md:p-6 space-y-4">
      <DiariosHeader
        total={filtered.length}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filters={filters}
        updateFilter={updateFilter}
        clearFilters={clearFilters}
        availableYears={availableYears}
        availableMonth={availableMonth}
        onNew={handleNew}
      />

      <DiariosTableFull diarios={filtered} onEdit={handleEdit} onDelete={openDelete} />

      <DiarioModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        diario={selected}
        defaultResponsavel={defaultResponsavel}
      />

      <DiariosDeleteDialog
        diario={deleteState.diario}
        isOpen={deleteState.isOpen}
        onClose={closeDelete}
        onConfirm={confirmDelete}
        isDeleting={deleteState.isDeleting}
      />
    </div>
  )
}
