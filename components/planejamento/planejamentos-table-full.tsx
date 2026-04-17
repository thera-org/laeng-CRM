"use client"

import { Fragment, useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
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
import { Gauge360 } from "@/components/gauge-360"
import { calcPlanejamentoProgressPct } from "./libs/planejamento-progress"
import { usePlanejamentoInlineEdit } from "./hooks/usePlanejamentoInlineEdit"
import { MAX_DESCRICAO_LEN } from "./types/planejamentoTypes"
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

  // Local mirror for atividades to allow optimistic edits
  const [atividadesLocal, setAtividadesLocal] = useState<Record<string, PlanejamentoAtividade[]>>({})

  useEffect(() => {
    const map: Record<string, PlanejamentoAtividade[]> = {}
    for (const p of planejamentos) {
      map[p.id] = [...(p.atividades || [])].sort((a, b) => a.ordem - b.ordem)
    }
    setAtividadesLocal(map)
  }, [planejamentos])

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
      [pid]: (prev[pid] || []).map((a) => (a.id === aid ? { ...a, ...patch } : a)),
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
        [pid]: [...(prev[pid] || []), created],
      }))
    }
  }

  const handleRemove = async (pid: string, aid: string) => {
    const ok = await inline.remove(aid)
    if (ok) {
      setAtividadesLocal((prev) => ({
        ...prev,
        [pid]: (prev[pid] || []).filter((a) => a.id !== aid),
      }))
    }
  }

  if (planejamentos.length === 0) {
    return (
      <div className="bg-white rounded-md border p-12 text-center text-gray-500">
        Nenhum planejamento encontrado.
      </div>
    )
  }

  return (
    <div className="bg-white rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="font-bold text-xs uppercase">Cód.</TableHead>
            <TableHead className="font-bold text-xs uppercase">Cliente</TableHead>
            <TableHead className="font-bold text-xs uppercase">Responsável</TableHead>
            <TableHead className="font-bold text-xs uppercase">Semana</TableHead>
            <TableHead className="font-bold text-xs uppercase">Atividade</TableHead>
            <TableHead className="font-bold text-xs uppercase text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((p) => {
            const ativs = atividadesLocal[p.id] || []
            const pct = calcPlanejamentoProgressPct(ativs)
            const isOpen = expandedRows.has(p.id)
            return (
              <Fragment key={p.id}>
                <TableRow className="hover:bg-gray-50">
                  <TableCell className="font-mono text-xs">
                    #{String(p.codigo).padStart(3, "0")}
                  </TableCell>
                  <TableCell className="text-sm font-medium">{p.cliente_nome}</TableCell>
                  <TableCell className="text-sm">{p.responsavel}</TableCell>
                  <TableCell className="text-xs text-gray-600">
                    {formatDate(p.data_inicio)} - {formatDate(p.data_fim)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleRow(p.id)}
                      className="h-7 px-2 gap-2"
                    >
                      <Badge
                        variant="outline"
                        className={
                          pct >= 100
                            ? "bg-green-100 text-green-700 border-green-300"
                            : pct >= 50
                            ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                            : "bg-red-100 text-red-700 border-red-300"
                        }
                      >
                        {pct}% ({ativs.length})
                      </Badge>
                      {isOpen ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onEdit(p)}
                      className="h-7 w-7"
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onDelete(p)}
                      className="h-7 w-7 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
                {isOpen && (
                  <TableRow className="bg-gray-50">
                    <TableCell colSpan={6} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1 flex flex-col items-center justify-center bg-white rounded-md border p-4">
                          <Gauge360 value={pct} size={160} label="Concluído" />
                          <p className="text-xs text-gray-600 mt-2">
                            {ativs.filter((a) => a.realizado).length} de {ativs.length}
                          </p>
                        </div>
                        <div className="md:col-span-2 bg-white rounded-md border">
                          <div className="flex items-center justify-between px-3 py-2 border-b">
                            <span className="text-sm font-semibold">Atividades</span>
                            <Button
                              size="sm"
                              onClick={() => handleAdd(p.id)}
                              disabled={inline.busy}
                              className="h-7 bg-[#F5C800] text-[#1E1E1E] hover:bg-yellow-500"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Adicionar
                            </Button>
                          </div>
                          {ativs.length === 0 ? (
                            <div className="p-6 text-center text-sm text-gray-500">
                              Nenhuma atividade.
                            </div>
                          ) : (
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50 border-b text-xs uppercase text-gray-600">
                                <tr>
                                  <th className="px-2 py-2 w-16 text-center">Cód.</th>
                                  <th className="px-2 py-2 text-left">Descrição</th>
                                  <th className="px-2 py-2 w-24 text-center">Realizado</th>
                                  <th className="px-2 py-2 w-12"></th>
                                </tr>
                              </thead>
                              <tbody>
                                {ativs.map((a) => (
                                  <tr key={a.id} className="border-b last:border-b-0">
                                    <td className="px-2 py-1 text-center font-mono text-xs">
                                      #{String(a.codigo).padStart(3, "0")}
                                    </td>
                                    <td className="px-2 py-1">
                                      <Input
                                        value={a.descricao}
                                        maxLength={MAX_DESCRICAO_LEN}
                                        onChange={(e) =>
                                          updateLocal(p.id, a.id, { descricao: e.target.value })
                                        }
                                        onBlur={(e) =>
                                          persistField(a.id, { descricao: e.target.value })
                                        }
                                        className="h-7 bg-white text-xs"
                                      />
                                    </td>
                                    <td className="px-2 py-1 text-center">
                                      <Checkbox
                                        checked={a.realizado}
                                        onCheckedChange={(v) => {
                                          const realizado = !!v
                                          updateLocal(p.id, a.id, { realizado })
                                          persistField(a.id, { realizado })
                                        }}
                                      />
                                    </td>
                                    <td className="px-2 py-1 text-center">
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleRemove(p.id, a.id)}
                                        disabled={inline.busy}
                                        className="h-6 w-6 text-red-600 hover:bg-red-50"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            )
          })}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-between p-3 border-t bg-gray-50">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span>Itens por página:</span>
          <Select
            value={String(itemsPerPage)}
            onValueChange={(v) => handleItemsPerPageChange(v)}
          >
            <SelectTrigger className="h-7 w-16 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span>
            {startIndex + 1}–{endIndex} de {planejamentos.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="h-7 w-7"
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
          {getPageNumbers().map((n, i) =>
            n === "..." ? (
              <span key={i} className="px-1 text-xs text-gray-500">
                …
              </span>
            ) : (
              <Button
                key={i}
                size="sm"
                variant={n === currentPage ? "default" : "ghost"}
                onClick={() => setCurrentPage(Number(n))}
                className={
                  n === currentPage
                    ? "h-7 w-7 p-0 bg-[#1E1E1E] text-white"
                    : "h-7 w-7 p-0 text-xs"
                }
              >
                {n}
              </Button>
            )
          )}
          <Button
            size="icon"
            variant="ghost"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="h-7 w-7"
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
