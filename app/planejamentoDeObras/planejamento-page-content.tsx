"use client"

import { useCallback, useMemo, useState } from "react"
import { toast } from "@/hooks/use-toast"
import { PlanejamentosHeader } from "@/components/planejamento/planejamentos-header"
import { PlanejamentosTableFull } from "@/components/planejamento/planejamentos-table-full"
import { PlanejamentoModal } from "@/components/planejamento/planejamento-modal"
import { PlanejamentosDeleteDialog } from "@/components/planejamento/planejamentos-delete-dialog"
import {
  INITIAL_PLANEJAMENTO_FILTERS,
  filterPlanejamentos,
  getAvailableMonth,
  getAvailableYears,
} from "@/components/planejamento/libs/planejamento-filter-logic"
import { deletePlanejamentoAction } from "@/components/planejamento/actions/planejamentoActions"
import type { PlanejamentoComCliente, PlanejamentoFiltersState } from "@/lib/types"

interface PlanejamentoPageContentProps {
  planejamentos: PlanejamentoComCliente[]
  defaultResponsavel: string
  userPermissions: Record<string, any>
}

export default function PlanejamentoPageContent({
  planejamentos,
  defaultResponsavel,
}: PlanejamentoPageContentProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<PlanejamentoFiltersState>(INITIAL_PLANEJAMENTO_FILTERS)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selected, setSelected] = useState<PlanejamentoComCliente | null>(null)

  const [deleteState, setDeleteState] = useState<{
    isOpen: boolean
    planejamento: PlanejamentoComCliente | null
    isDeleting: boolean
  }>({ isOpen: false, planejamento: null, isDeleting: false })

  const availableYears = useMemo(() => getAvailableYears(planejamentos), [planejamentos])
  const availableMonth = useMemo(() => getAvailableMonth(planejamentos), [planejamentos])

  const filtered = useMemo(
    () => filterPlanejamentos(planejamentos, filters, searchTerm),
    [planejamentos, filters, searchTerm]
  )

  const updateFilter = (key: keyof PlanejamentoFiltersState, value: string) =>
    setFilters((p) => ({ ...p, [key]: value }))

  const clearFilters = () => {
    setFilters(INITIAL_PLANEJAMENTO_FILTERS)
    setSearchTerm("")
  }

  const handleNew = () => {
    setSelected(null)
    setIsModalOpen(true)
  }

  const handleEdit = (p: PlanejamentoComCliente) => {
    setSelected(p)
    setIsModalOpen(true)
  }

  const openDelete = useCallback((p: PlanejamentoComCliente) => {
    setDeleteState({ isOpen: true, planejamento: p, isDeleting: false })
  }, [])

  const closeDelete = useCallback(() => {
    setDeleteState({ isOpen: false, planejamento: null, isDeleting: false })
  }, [])

  const confirmDelete = useCallback(async () => {
    if (!deleteState.planejamento) return
    setDeleteState((p) => ({ ...p, isDeleting: true }))
    const res = await deletePlanejamentoAction(deleteState.planejamento.id)
    if (!res.ok) {
      toast({ title: "Erro ao excluir", description: res.error, variant: "destructive" })
      setDeleteState((p) => ({ ...p, isDeleting: false }))
      return
    }
    toast({ title: "Planejamento excluído" })
    closeDelete()
  }, [deleteState.planejamento, closeDelete])

  return (
    <div className="p-4 md:p-6 space-y-4">
      <PlanejamentosHeader
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

      <PlanejamentosTableFull
        planejamentos={filtered}
        onEdit={handleEdit}
        onDelete={openDelete}
      />

      <PlanejamentoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        planejamento={selected}
        defaultResponsavel={defaultResponsavel}
      />

      <PlanejamentosDeleteDialog
        planejamento={deleteState.planejamento}
        isOpen={deleteState.isOpen}
        onClose={closeDelete}
        onConfirm={confirmDelete}
        isDeleting={deleteState.isDeleting}
      />
    </div>
  )
}
