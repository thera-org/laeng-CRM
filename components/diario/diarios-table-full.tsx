"use client"

import { Fragment, useEffect, useRef, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  CloudLightning,
  CloudRain,
  CloudSun,
  ImageIcon,
  Pencil,
  Sun,
  Trash2,
  Upload,
  User,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePagination, useExpandableRows } from "@/lib/table-utils"
import {
  CLIMA_LABEL,
  COLABORADOR_ROLES,
  MAX_FOTOS,
  PROGRESSO_ITEMS,
  TURNOS,
} from "./types/diarioTypes"
import { calcDiarioProgressPct, totalColaboradores } from "./libs/diario-progress"
import { Gauge360 } from "@/components/gauge-360"
import { useDiarioInlineEdit } from "./hooks/useDiarioInlineEdit"
import { getSignedFotoUrlsAction } from "./actions/diarioActions"
import { FotoViewerModal } from "./foto-viewer-modal"
import { cn } from "@/lib/utils"
import type {
  Clima,
  DiarioClimaPorTurno,
  DiarioColaboradores,
  DiarioComCliente,
  DiarioObrasFoto,
  DiarioProgresso,
  Turno,
} from "@/lib/types"

interface DiariosTableFullProps {
  diarios: DiarioComCliente[]
  onEdit: (diario: DiarioComCliente) => void
  onDelete: (diario: DiarioComCliente) => void
}

const CLIMA_ICON: Record<Clima, React.ComponentType<{ className?: string }>> = {
  sol: Sun,
  nublado: CloudSun,
  chuva: CloudRain,
  impraticavel: CloudLightning,
}

function cloneClimaPorTurno(value?: DiarioClimaPorTurno | null): DiarioClimaPorTurno {
  const next: DiarioClimaPorTurno = {}

  for (const { value: turno } of TURNOS) {
    if (Object.prototype.hasOwnProperty.call(value ?? {}, turno)) {
      next[turno] = value?.[turno] ?? null
    }
  }

  return next
}

function formatDiarioDate(value?: string | null) {
  if (!value) return "-"

  const rawDate = value.split("T")[0]
  const [year, month, day] = rawDate.split("-")

  if (!year || !month || !day) return value

  return `${day}/${month}/${year}`
}

export function DiariosTableFull({ diarios, onEdit, onDelete }: DiariosTableFullProps) {
  const inline = useDiarioInlineEdit()
  const expandButtonClassName =
    "h-8 w-8 p-0 bg-[#F5C800] hover:bg-[#F5C800]/90 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center flex-shrink-0"

  const [climaPorTurnoLocal, setClimaPorTurnoLocal] = useState<Record<string, DiarioClimaPorTurno>>({})
  const [colaboradoresLocal, setColaboradoresLocal] = useState<Record<string, DiarioColaboradores>>({})
  const [progressoLocal, setProgressoLocal] = useState<Record<string, DiarioProgresso>>({})
  const [atividadeLocal, setAtividadeLocal] = useState<Record<string, string>>({})
  const [fotosLocal, setFotosLocal] = useState<Record<string, DiarioObrasFoto[]>>({})
  const [editingClimaDiario, setEditingClimaDiario] = useState<DiarioComCliente | null>(null)
  const [editingClimaValue, setEditingClimaValue] = useState<DiarioClimaPorTurno>({})

  const { expandedRows: expandedColab, toggleRow: toggleColab } = useExpandableRows()
  const { expandedRows: expandedAtv, toggleRow: toggleAtv } = useExpandableRows()
  const { expandedRows: expandedFotos, toggleRow: toggleFotos } = useExpandableRows()

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
  } = usePagination(diarios, 50)

  // ---- foto viewer state ----
  const [viewerFotos, setViewerFotos] = useState<DiarioObrasFoto[]>([])
  const [viewerIndex, setViewerIndex] = useState(0)
  const [viewerOpen, setViewerOpen] = useState(false)

  const openViewer = (fotos: DiarioObrasFoto[], idx: number) => {
    setViewerFotos(fotos)
    setViewerIndex(idx)
    setViewerOpen(true)
  }

  const resetClimaEditor = () => {
    setEditingClimaDiario(null)
    setEditingClimaValue({})
  }

  const openClimaEditor = (diario: DiarioComCliente) => {
    setEditingClimaDiario(diario)
    setEditingClimaValue(cloneClimaPorTurno(climaPorTurnoLocal[diario.id] ?? diario.clima_por_turno))
  }

  const addTurnoToEditor = (turno: Turno) => {
    setEditingClimaValue((prev) => ({ ...prev, [turno]: null }))
  }

  const removeTurnoFromEditor = (turno: Turno) => {
    setEditingClimaValue((prev) => {
      const next = { ...prev }
      delete next[turno]
      return next
    })
  }

  const setTurnoClimaInEditor = (turno: Turno, clima: Clima | null) => {
    setEditingClimaValue((prev) => ({ ...prev, [turno]: clima }))
  }

  const availableTurnosInEditor = TURNOS.filter(
    ({ value }) => !Object.prototype.hasOwnProperty.call(editingClimaValue, value)
  )

  const selectedTurnosInEditor = TURNOS.filter(({ value }) =>
    Object.prototype.hasOwnProperty.call(editingClimaValue, value)
  )

  const isSavingClima = editingClimaDiario
    ? inline.savingField === `${editingClimaDiario.id}:clima_por_turno`
    : false

  const saveClimaEditor = async () => {
    if (!editingClimaDiario) return

    const nextValue = cloneClimaPorTurno(editingClimaValue)
    const ok = await inline.updateField(
      editingClimaDiario.id,
      "clima_por_turno",
      nextValue,
      "Turno / Clima"
    )

    if (!ok) return

    setClimaPorTurnoLocal((prev) => ({ ...prev, [editingClimaDiario.id]: nextValue }))
    resetClimaEditor()
  }

  const handleAddFotos = async (
    diarioId: string,
    files: FileList,
    currentFotos: DiarioObrasFoto[]
  ) => {
    const res = await inline.uploadFotos(diarioId, files)
    if (res.added.length === 0) return

    setFotosLocal((prev) => ({
      ...prev,
      [diarioId]: [...(prev[diarioId] ?? currentFotos), ...res.added].sort((a, b) => a.ordem - b.ordem),
    }))
  }

  if (diarios.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">Nenhum diário cadastrado ainda.</div>
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border-2 border-[#F5C800]/20 overflow-hidden">
        <div className="overflow-x-auto relative">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-[#1E1E1E] shadow-md">
              <TableRow className="bg-[#1E1E1E] hover:bg-[#1E1E1E]">
                <TableHead className="text-[#F5C800] font-bold py-3">CÓD.</TableHead>
                <TableHead className="text-[#F5C800] font-bold py-3">CLIENTE</TableHead>
                <TableHead className="text-[#F5C800] font-bold py-3">RESPONSÁVEL</TableHead>
                <TableHead className="text-[#F5C800] font-bold py-3">TURNO / CLIMA</TableHead>
                <TableHead className="text-center text-[#F5C800] font-bold py-3">COLABORADORES</TableHead>
                <TableHead className="text-[#F5C800] font-bold py-3">ATIVIDADE</TableHead>
                <TableHead className="text-center text-[#F5C800] font-bold py-3">PROGRESSO</TableHead>
                <TableHead className="text-center text-[#F5C800] font-bold py-3">FOTOS</TableHead>
                <TableHead className="text-center text-[#F5C800] font-bold py-3">DATA</TableHead>
                <TableHead className="text-center text-[#F5C800] font-bold py-3">AÇÕES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((d) => {
                const climaPorTurno = climaPorTurnoLocal[d.id] ?? cloneClimaPorTurno(d.clima_por_turno)
                const colab = colaboradoresLocal[d.id] ?? d.colaboradores ?? {}
                const prog = progressoLocal[d.id] ?? d.progresso ?? {}
                const atv = atividadeLocal[d.id] ?? d.atividade ?? ""
                const fotos = fotosLocal[d.id] ?? d.fotos ?? []
                const colabTotal = totalColaboradores(colab)
                const progPct = calcDiarioProgressPct(prog)

                const isColabOpen = expandedColab.has(d.id)
                const isAtvOpen = expandedAtv.has(d.id)
                const isFotosOpen = expandedFotos.has(d.id)

                const turnoClimaEntries = TURNOS.map(({ value, label }) => ({
                  turno: value,
                  turnoLabel: label,
                  clima: climaPorTurno[value] ?? null,
                }))

                return (
                  <Fragment key={d.id}>
                    <TableRow className="hover:bg-[#F5C800]/5 border-b transition-all duration-300">
                      <TableCell className="py-3">
                        <Badge className="font-mono bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold text-xs px-2 py-1">
                          #{String(d.codigo || 0).padStart(3, "0")}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium py-3">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3 w-3 text-gray-400" />
                          <span className="truncate text-sm font-semibold text-gray-800" title={d.cliente_nome}>
                            {d.cliente_nome}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3 w-3 text-gray-400" />
                          <span className="truncate text-sm font-semibold text-gray-800" title={d.responsavel}>
                            {d.responsavel}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 text-xs min-w-[220px]">
                        <button
                          type="button"
                          onClick={() => openClimaEditor(d)}
                          className="w-full rounded-lg border border-transparent px-3 py-2 text-left transition-colors hover:border-[#F5C800]/30 hover:bg-[#F5C800]/10"
                          title="Clique para editar turno e clima"
                        >
                          <div className="space-y-1">
                            {turnoClimaEntries.map(({ turno, turnoLabel, clima }) => {
                              const hasClima = clima !== null
                              const Icon = hasClima ? CLIMA_ICON[clima] : null

                              return (
                                <div key={turno} className="flex items-center gap-2">
                                  <span className="font-semibold">{turnoLabel}</span>
                                  <span className="text-gray-400">:</span>
                                  {hasClima && Icon ? (
                                    <>
                                      <Icon className="h-4 w-4 text-[#F5C800]" />
                                      <span className="text-[10px] text-gray-500">{CLIMA_LABEL[clima]}</span>
                                    </>
                                  ) : (
                                    <span className="text-[10px] text-gray-500">~ Não definido</span>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </button>
                      </TableCell>
                      <TableCell className="text-center py-3">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-sm font-bold text-black min-w-[56px] text-center">
                            {colabTotal}
                          </span>
                          <Button
                            size="sm"
                            onClick={() => toggleColab(d.id)}
                            className={expandButtonClassName}
                            title={isColabOpen ? "Recolher colaboradores" : "Ver colaboradores"}
                          >
                            {isColabOpen ? (
                              <ChevronUp className="h-5 w-5 text-[#1E1E1E] font-bold" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-[#1E1E1E] font-bold" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 max-w-[280px]">
                        <button
                          type="button"
                          onClick={() => toggleAtv(d.id)}
                          className="text-left text-sm text-gray-700 hover:text-[#1E1E1E] line-clamp-2"
                          title="Expandir atividade"
                        >
                          {atv || <span className="italic text-gray-400">Sem descrição</span>}
                        </button>
                      </TableCell>
                      <TableCell className="text-center py-3">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-sm font-bold text-black min-w-[56px] text-center">
                            {progPct}%
                          </span>
                          <Button
                            size="sm"
                            onClick={() => toggleAtv(d.id)}
                            className={expandButtonClassName}
                            title={isAtvOpen ? "Recolher progresso" : "Ver atividade e progresso"}
                          >
                            {isAtvOpen ? (
                              <ChevronUp className="h-5 w-5 text-[#1E1E1E] font-bold" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-[#1E1E1E] font-bold" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-3">
                        <div className="flex items-center justify-center gap-2">
                          <div className="min-w-[56px] text-center flex items-center justify-center gap-1">
                            <ImageIcon className="h-4 w-4 text-black" />
                            <span className="text-sm font-bold text-black">{fotos.length}</span>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => toggleFotos(d.id)}
                            className={expandButtonClassName}
                            title={isFotosOpen ? "Recolher fotos" : "Ver fotos"}
                          >
                            {isFotosOpen ? (
                              <ChevronUp className="h-5 w-5 text-[#1E1E1E] font-bold" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-[#1E1E1E] font-bold" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5 whitespace-nowrap text-xs font-medium text-gray-600">
                          <CalendarDays className="h-3 w-3 text-gray-400" />
                          {formatDiarioDate(d.data)}
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => onEdit(d)}
                            className="bg-[#F5C800] hover:bg-[#F5C800]/90 border-2 border-[#F5C800] h-9 w-9 p-0"
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4 text-[#1E1E1E]" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onDelete(d)}
                            className="border-2 border-red-300 hover:border-red-500 hover:bg-red-50 h-9 w-9 p-0"
                            title="Remover"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* COLABORADORES expandable */}
                    {isColabOpen && (
                      <TableRow className="bg-yellow-50 border-l-4 border-[#F5C800]">
                        <TableCell colSpan={10} className="py-6 px-8">
                          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                            <h4 className="text-sm font-bold text-[#1E1E1E] mb-4 uppercase">
                              Quantidade de cada colaborador
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                              {COLABORADOR_ROLES.map((r) => (
                                <div
                                  key={r.key}
                                  className="rounded-lg border border-gray-200 bg-[#F5C800] p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                                >
                                  <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[#1E1E1E]/70">
                                    {r.label}
                                  </div>
                                  <Input
                                    type="number"
                                    min={0}
                                    value={colab[r.key] ?? 0}
                                    onChange={(e) => {
                                      const value = Math.max(0, parseInt(e.target.value || "0"))
                                      setColaboradoresLocal((prev) => ({
                                        ...prev,
                                        [d.id]: { ...(prev[d.id] || {}), [r.key]: value },
                                      }))
                                    }}
                                    onBlur={async (e) => {
                                      const value = Math.max(0, parseInt(e.target.value || "0"))
                                      const next = { ...(colaboradoresLocal[d.id] || {}), [r.key]: value }
                                      await inline.updateField(d.id, "colaboradores", next, "Colaboradores")
                                    }}
                                    className="h-10 border-black/15 bg-white text-right font-bold text-[#1E1E1E] shadow-sm focus-visible:ring-[#1E1E1E]/20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}

                    {/* ATIVIDADE + PROGRESSO expandable (combined) */}
                    {isAtvOpen && (
                      <TableRow className="bg-yellow-50 border-l-4 border-[#F5C800]">
                        <TableCell colSpan={10} className="py-6 px-8">
                          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              <div className="lg:col-span-2 space-y-4">
                                <div>
                                  <h4 className="text-sm font-bold text-[#1E1E1E] mb-2 uppercase">Atividade</h4>
                                  <Textarea
                                    value={atv}
                                    onChange={(e) =>
                                      setAtividadeLocal((prev) => ({ ...prev, [d.id]: e.target.value.slice(0, 2000) }))
                                    }
                                    onBlur={async (e) =>
                                      inline.updateField(d.id, "atividade", e.target.value.slice(0, 2000), "Atividade")
                                    }
                                    rows={5}
                                    className="resize-none border-gray-300"
                                  />
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold text-[#1E1E1E] mb-2 uppercase">Itens da Obra</h4>
                                  <div className="rounded-md border border-gray-200 max-h-72 overflow-y-auto">
                                    <table className="w-full text-sm">
                                      <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                          <th className="text-left px-3 py-2 font-semibold text-gray-700">Itens</th>
                                          <th className="text-center px-3 py-2 font-semibold text-gray-700 w-24">
                                            Finalizado
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {PROGRESSO_ITEMS.map((it) => (
                                          <tr key={it.key} className="border-t">
                                            <td className="px-3 py-2 text-xs">{it.label}</td>
                                            <td className="px-3 py-1 text-center">
                                              <Checkbox
                                                checked={!!prog[it.key]}
                                                onCheckedChange={async (v) => {
                                                  const next = { ...prog, [it.key]: !!v }
                                                  setProgressoLocal((prev) => ({ ...prev, [d.id]: next }))
                                                  await inline.updateField(d.id, "progresso", next, "Progresso")
                                                }}
                                                className="border-2 border-gray-600 data-[state=checked]:border-[#F5C800] data-[state=checked]:bg-[#F5C800] data-[state=unchecked]:bg-gray-400"
                                              />
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col items-center justify-center bg-yellow-50 rounded-lg p-4 border border-gray-200">
                                <h5 className="text-sm font-bold text-[#1E1E1E] mb-4 uppercase">Progresso</h5>
                                <Gauge360 value={progPct} size={180} strokeWidth={18} label="finalizado" />
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}

                    {/* FOTOS expandable */}
                    {isFotosOpen && (
                      <TableRow className="bg-yellow-50 border-l-4 border-[#F5C800]">
                        <TableCell colSpan={10} className="py-6 px-8">
                          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                            <div className="mb-4 flex items-center justify-between gap-3">
                              <h4 className="text-sm font-bold text-[#1E1E1E] uppercase">
                                Registro Fotográfico ({fotos.length})
                              </h4>
                              <span className="text-[11px] text-gray-500">
                                {fotos.length}/{MAX_FOTOS} (JPEG/PNG, máx. 50 MB)
                              </span>
                            </div>
                            <FotosThumbs
                              fotos={fotos}
                              onOpen={(idx) => openViewer(fotos, idx)}
                              onAdd={(files) => handleAddFotos(d.id, files, fotos)}
                              canAdd={fotos.length < MAX_FOTOS}
                              isUploading={inline.uploadingFotosFor === d.id}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2 py-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground font-semibold">
            Mostrando {startIndex + 1} - {Math.min(endIndex, diarios.length)} de {diarios.length} diários
          </span>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">
              Diários por página:
            </span>
            <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-[80px] h-9 border-[#F5C800]/30 focus:ring-[#F5C800] bg-background font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="min-w-[80px]">
                <SelectItem value="20" className="font-semibold">20</SelectItem>
                <SelectItem value="50" className="font-semibold">50</SelectItem>
                <SelectItem value="100" className="font-semibold">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="border-[#F5C800]/30 hover:bg-[#F5C800]/10 disabled:opacity-50 font-semibold"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {getPageNumbers().map((page, idx) =>
              page === "..." ? (
                <span key={`e-${idx}`} className="px-2 text-muted-foreground font-semibold">...</span>
              ) : (
                <Button
                  key={page}
                  size="sm"
                  variant={currentPage === page ? "default" : "outline"}
                  onClick={() => setCurrentPage(page as number)}
                  className={
                    currentPage === page
                      ? "bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold"
                      : "border-[#F5C800]/30 hover:bg-[#F5C800]/10 font-semibold"
                  }
                >
                  {page}
                </Button>
              )
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="border-[#F5C800]/30 hover:bg-[#F5C800]/10 disabled:opacity-50 font-semibold"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <FotoViewerModal
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        fotos={viewerFotos}
        initialIndex={viewerIndex}
        canDelete
        onDelete={async (foto) => {
          const ok = await inline.removeFoto(foto.id)
          if (ok) {
            setViewerFotos((prev) => prev.filter((f) => f.id !== foto.id))
            setFotosLocal((prev) => ({
              ...prev,
              [foto.diario_id]: (prev[foto.diario_id] ?? viewerFotos).filter((f) => f.id !== foto.id),
            }))
          }
        }}
      />

      <Dialog
        open={!!editingClimaDiario}
        onOpenChange={(open) => {
          if (!open && !isSavingClima) resetClimaEditor()
        }}
      >
        <DialogContent className="gap-0 p-0 sm:max-w-2xl" showCloseButton={!isSavingClima}>
          <DialogHeader className="border-b border-gray-200 bg-[#1E1E1E] px-6 py-5">
            <DialogTitle className="text-[#F5C800]">Editar Turno / Clima</DialogTitle>
            <DialogDescription className="text-white/70">
              {editingClimaDiario
                ? `Diário #${String(editingClimaDiario.codigo || 0).padStart(3, "0")} - ${editingClimaDiario.cliente_nome}`
                : "Ajuste apenas os turnos e seus climas deste diário."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 px-6 py-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#1E1E1E]">Turnos do dia</p>
                <p className="text-xs text-gray-500">
                  Adicione somente os turnos necessários e defina o clima de cada um.
                </p>
              </div>
              {availableTurnosInEditor.length > 0 && (
                <span className="text-[11px] text-gray-500">Turnos restantes disponíveis.</span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {availableTurnosInEditor.map((turno) => (
                <button
                  key={turno.value}
                  type="button"
                  onClick={() => addTurnoToEditor(turno.value)}
                  className="rounded-full border-2 border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-[#F5C800]"
                >
                  {turno.label}
                </button>
              ))}
            </div>

            {selectedTurnosInEditor.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-sm text-gray-500">
                Selecione pelo menos um turno para definir o clima correspondente.
              </div>
            ) : (
              <div className="space-y-3">
                {selectedTurnosInEditor.map((turno) => {
                  const selectedClima = editingClimaValue[turno.value] ?? null

                  return (
                    <div
                      key={turno.value}
                      className="space-y-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[#1E1E1E]">{turno.label}</p>
                          <p className="text-xs text-gray-500">
                            Defina o clima deste turno ou deixe como não definido.
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removeTurnoFromEditor(turno.value)}
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="mr-1 h-4 w-4" />
                          Remover
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setTurnoClimaInEditor(turno.value, null)}
                          className={cn(
                            "rounded-full border-2 px-4 py-2 text-sm font-semibold transition",
                            selectedClima === null
                              ? "border-[#F5C800] bg-[#F5C800] text-black"
                              : "border-gray-300 bg-white text-gray-700 hover:border-[#F5C800]"
                          )}
                        >
                          Não definido
                        </button>
                        {Object.entries(CLIMA_LABEL).map(([climaKey, climaLabel]) => {
                          const clima = climaKey as Clima
                          const Icon = CLIMA_ICON[clima]
                          const active = selectedClima === clima

                          return (
                            <button
                              key={clima}
                              type="button"
                              onClick={() => setTurnoClimaInEditor(turno.value, clima)}
                              className={cn(
                                "flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-semibold transition",
                                active
                                  ? "border-[#F5C800] bg-[#F5C800]/10 text-[#1E1E1E]"
                                  : "border-gray-300 bg-white text-gray-600 hover:border-[#F5C800]"
                              )}
                            >
                              <Icon className="h-4 w-4" />
                              {climaLabel}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <DialogFooter className="border-t border-gray-200 bg-white px-6 py-4">
            <Button type="button" variant="outline" onClick={resetClimaEditor} disabled={isSavingClima}>
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={saveClimaEditor}
              disabled={isSavingClima}
              className="bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90"
            >
              {isSavingClima ? "Salvando..." : "Salvar Turno / Clima"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function FotosThumbs({
  fotos,
  onOpen,
  onAdd,
  canAdd,
  isUploading,
}: {
  fotos: DiarioObrasFoto[]
  onOpen: (idx: number) => void
  onAdd: (files: FileList) => void
  canAdd: boolean
  isUploading: boolean
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [urls, setUrls] = useState<Record<string, string>>({})

  useEffect(() => {
    if (fotos.length === 0) return
    const paths = fotos.map((f) => f.storage_path)
    getSignedFotoUrlsAction(paths).then((res) => {
      if (res.ok) setUrls(res.data || {})
    })
  }, [fotos])

  return (
    <div className="space-y-3">
      {fotos.length === 0 && <p className="text-sm text-gray-500 italic">Nenhuma foto enviada.</p>}

      <div className="flex flex-wrap gap-3">
        {fotos.map((f, idx) => (
          <button
            key={f.id}
            type="button"
            onClick={() => onOpen(idx)}
            className="w-24 h-24 rounded border border-gray-200 overflow-hidden hover:ring-2 hover:ring-[#F5C800]"
          >
            {urls[f.storage_path] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={urls[f.storage_path]} alt="" className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full bg-gray-100 animate-pulse" />
            )}
          </button>
        ))}

        {canAdd && (
          <>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-24 h-24 rounded border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 hover:border-[#F5C800] hover:text-[#1E1E1E] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Upload className="h-5 w-5 mb-1" />
              <span className="text-[10px] font-semibold">{isUploading ? "Enviando..." : "Adicionar"}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) onAdd(e.target.files)
                e.target.value = ""
              }}
            />
          </>
        )}
      </div>
    </div>
  )
}
