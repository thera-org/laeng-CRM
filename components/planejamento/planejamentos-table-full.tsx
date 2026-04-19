"use client"

import { Fragment, useMemo, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { usePagination, useExpandableRows } from "@/lib/table-utils"
import { calcPlanejamentoProgressPct } from "./libs/planejamento-progress"
import { usePlanejamentoInlineEdit } from "./hooks/usePlanejamentoInlineEdit"
import { PlanejamentoExpandedPanel } from "./planejamento-panels"
import type { PlanejamentoAtividade, PlanejamentoComCliente } from "@/lib/types"

interface PlanejamentosTableFullProps {
  planejamentos: PlanejamentoComCliente[]
  onEdit: (p: PlanejamentoComCliente) => void
  onDelete: (p: PlanejamentoComCliente) => void
}

const formatDate = (d: string) => {
  if (!d) return ""
  const [a, m, dia] = d.split("T")[0].split("-")
  return `${dia}/${m}/${a}`
}

export function PlanejamentosTableFull({
  planejamentos,
  onEdit,
  onDelete,
}: PlanejamentosTableFullProps) {
  const inline = usePlanejamentoInlineEdit()
  const { expandedRows, toggleRow } = useExpandableRows()
  const expandButtonClassName =
    "h-8 w-8 p-0 bg-[#F5C800] hover:bg-[#F5C800]/90 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center flex-shrink-0"

  const baseAtividadesByPlanejamento = useMemo(() => {
    const map: Record<string, PlanejamentoAtividade[]> = {}
    for (const planejamento of planejamentos) {
      map[planejamento.id] = [...(planejamento.atividades || [])].sort((a, b) => a.ordem - b.ordem)
    }
    return map
  }, [planejamentos])

  // Local overrides for optimistic edits
  const [atividadesLocal, setAtividadesLocal] = useState<Record<string, PlanejamentoAtividade[]>>({})

  const {
    currentPage,
    setCurrentPage,
    itemsPerPage,
    totalPages,
    startIndex,
    endIndex,
    paginatedData,
    handleItemsPerPageChange,
    getPageNumbers,
  } = usePagination(planejamentos, 50)

  const updateLocal = (pid: string, aid: string, patch: Partial<PlanejamentoAtividade>) => {
    setAtividadesLocal((prev) => ({
      ...prev,
      [pid]: (prev[pid] ?? baseAtividadesByPlanejamento[pid] ?? []).map((a) =>
        a.id === aid ? { ...a, ...patch } : a
      ),
    }))
  }

  const persistField = async (
    aid: string,
    patch: Partial<Pick<PlanejamentoAtividade, "descricao" | "realizado">>
  ) => {
    await inline.update(aid, patch)
  }

  const handleAdd = async (pid: string) => {
    const created = await inline.add(pid)
    if (created) {
      setAtividadesLocal((prev) => ({
        ...prev,
        [pid]: [...(prev[pid] ?? baseAtividadesByPlanejamento[pid] ?? []), created].sort(
          (a, b) => a.ordem - b.ordem
        ),
      }))
    }
  }

  const handleRemove = async (pid: string, aid: string) => {
    const ok = await inline.remove(aid)
    if (ok) {
      setAtividadesLocal((prev) => ({
        ...prev,
        [pid]: (prev[pid] ?? baseAtividadesByPlanejamento[pid] ?? []).filter((a) => a.id !== aid),
      }))
    }
  }

  if (planejamentos.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">Nenhum planejamento encontrado.</div>
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border-2 border-[#F5C800]/20 overflow-hidden">
        <div className="overflow-x-auto relative">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-[#1E1E1E] shadow-md">
              <TableRow className="bg-[#1E1E1E] hover:bg-[#1E1E1E]">
                <TableHead className="py-3 font-bold text-[#F5C800]">CÓD.</TableHead>
                <TableHead className="py-3 font-bold text-[#F5C800]">CLIENTE</TableHead>
                <TableHead className="py-3 font-bold text-[#F5C800]">RESPONSÁVEL</TableHead>
                <TableHead className="py-3 font-bold text-[#F5C800]">SEMANA</TableHead>
                <TableHead className="py-3 font-bold text-[#F5C800]">ATIVIDADES</TableHead>
                <TableHead className="py-3 text-center font-bold text-[#F5C800]">AÇÕES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((p) => {
                const ativs = atividadesLocal[p.id] ?? baseAtividadesByPlanejamento[p.id] ?? []
                const pct = calcPlanejamentoProgressPct(ativs)
                const isOpen = expandedRows.has(p.id)

                return (
                  <Fragment key={p.id}>
                    <TableRow className="border-b transition-all duration-300 hover:bg-[#F5C800]/5">
                      <TableCell className="py-3">
                        <Badge className="font-mono bg-[#F5C800] px-2 py-1 text-xs font-bold text-[#1E1E1E] hover:bg-[#F5C800]/90">
                          #{String(p.codigo).padStart(3, "0")}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 font-medium">
                        <span
                          className="block max-w-[170px] truncate text-sm font-semibold text-gray-800 md:max-w-[220px]"
                          title={p.cliente_nome}
                        >
                          {p.cliente_nome}
                        </span>
                      </TableCell>
                      <TableCell className="py-3">
                        <span
                          className="block max-w-[150px] truncate text-sm font-semibold text-gray-800 md:max-w-[190px]"
                          title={p.responsavel}
                        >
                          {p.responsavel}
                        </span>
                      </TableCell>
                      <TableCell className="min-w-[165px] py-3 text-xs font-medium text-gray-600 whitespace-nowrap">
                        {formatDate(p.data_inicio)} - {formatDate(p.data_fim)}
                      </TableCell>
                      <TableCell className="min-w-[160px] py-3">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={
                              pct >= 100
                                ? "border-green-300 bg-green-50 font-semibold text-green-700 hover:bg-green-50"
                                : pct >= 50
                                  ? "border-[#F5C800]/40 bg-[#F5C800]/10 font-semibold text-[#8a6500] hover:bg-[#F5C800]/10"
                                  : "border-red-300 bg-red-50 font-semibold text-red-700 hover:bg-red-50"
                            }
                          >
                            {pct}% ({ativs.length})
                          </Badge>
                          <Button
                            size="sm"
                            onClick={() => toggleRow(p.id)}
                            className={expandButtonClassName}
                            title={isOpen ? "Recolher atividades" : "Ver atividades"}
                          >
                            {isOpen ? (
                              <ChevronUp className="h-5 w-5 text-[#1E1E1E] font-bold" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-[#1E1E1E] font-bold" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => onEdit(p)}
                            className="h-9 w-9 border-2 border-[#F5C800] bg-[#F5C800] p-0 hover:bg-[#F5C800]/90"
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4 text-[#1E1E1E]" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onDelete(p)}
                            className="h-9 w-9 border-2 border-red-300 p-0 hover:border-red-500 hover:bg-red-50"
                            title="Remover"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {isOpen && (
                      <PlanejamentoExpandedPanel
                        atividades={ativs}
                        progressPct={pct}
                        busy={inline.busy}
                        onAddAtividade={async () => handleAdd(p.id)}
                        onChangeAtividade={(atividadeId, patch) => {
                          updateLocal(p.id, atividadeId, patch)
                        }}
                        onCommitAtividade={async (atividadeId, patch) => {
                          await persistField(atividadeId, patch)
                        }}
                        onRemoveAtividade={async (atividadeId) => {
                          await handleRemove(p.id, atividadeId)
                        }}
                      />
                    )}
                  </Fragment>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex flex-col items-start justify-between gap-4 px-2 py-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-muted-foreground">
            Mostrando {startIndex + 1} - {Math.min(endIndex, planejamentos.length)} de {planejamentos.length} planejamentos
          </span>
        </div>
        <div className="flex w-full flex-col items-start gap-4 sm:w-auto sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <span className="whitespace-nowrap text-sm font-semibold text-muted-foreground">
              Planejamentos por página:
            </span>
            <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="h-9 w-[80px] border-[#F5C800]/30 bg-background font-semibold focus:ring-[#F5C800]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="min-w-[80px]">
                <SelectItem value="10" className="font-semibold">10</SelectItem>
                <SelectItem value="25" className="font-semibold">25</SelectItem>
                <SelectItem value="50" className="font-semibold">50</SelectItem>
                <SelectItem value="100" className="font-semibold">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="border-[#F5C800]/30 font-semibold hover:bg-[#F5C800]/10 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {getPageNumbers().map((page, idx) =>
              page === "..." ? (
                <span key={`ellipsis-${idx}`} className="px-2 font-semibold text-muted-foreground">...</span>
              ) : (
                <Button
                  key={page}
                  size="sm"
                  variant={currentPage === page ? "default" : "outline"}
                  onClick={() => setCurrentPage(page as number)}
                  className={
                    currentPage === page
                      ? "bg-[#F5C800] font-bold text-[#1E1E1E] hover:bg-[#F5C800]/90"
                      : "border-[#F5C800]/30 font-semibold hover:bg-[#F5C800]/10"
                  }
                >
                  {page}
                </Button>
              )
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              className="border-[#F5C800]/30 font-semibold hover:bg-[#F5C800]/10 disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
