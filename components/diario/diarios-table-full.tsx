"use client"

import { Fragment, useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
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
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePagination, useExpandableRows } from "@/lib/table-utils"
import {
  CLIMA_LABEL,
  COLABORADOR_ROLES,
  PROGRESSO_ITEMS,
  TURNOS,
} from "./types/diarioTypes"
import { calcDiarioProgressPct, totalColaboradores } from "./libs/diario-progress"
import { Gauge360 } from "@/components/gauge-360"
import { useDiarioInlineEdit } from "./hooks/useDiarioInlineEdit"
import { getSignedFotoUrlsAction } from "./actions/diarioActions"
import { FotoViewerModal } from "./foto-viewer-modal"
import type { Clima, DiarioColaboradores, DiarioComCliente, DiarioObrasFoto, DiarioProgresso } from "@/lib/types"

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

export function DiariosTableFull({ diarios, onEdit, onDelete }: DiariosTableFullProps) {
  const inline = useDiarioInlineEdit()
  const expandButtonClassName =
    "h-8 w-8 p-0 bg-[#F5C800] hover:bg-[#F5C800]/90 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center flex-shrink-0"

  const [colaboradoresLocal, setColaboradoresLocal] = useState<Record<string, DiarioColaboradores>>({})
  const [progressoLocal, setProgressoLocal] = useState<Record<string, DiarioProgresso>>({})
  const [atividadeLocal, setAtividadeLocal] = useState<Record<string, string>>({})

  // Sync local mirrors when diarios change
  useEffect(() => {
    const c: Record<string, DiarioColaboradores> = {}
    const p: Record<string, DiarioProgresso> = {}
    const a: Record<string, string> = {}
    for (const d of diarios) {
      c[d.id] = d.colaboradores || {}
      p[d.id] = d.progresso || {}
      a[d.id] = d.atividade || ""
    }
    setColaboradoresLocal(c)
    setProgressoLocal(p)
    setAtividadeLocal(a)
  }, [diarios])

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
                <TableHead className="text-center text-[#F5C800] font-bold py-3">AÇÕES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((d) => {
                const colab = colaboradoresLocal[d.id] || {}
                const prog = progressoLocal[d.id] || {}
                const atv = atividadeLocal[d.id] ?? ""
                const colabTotal = totalColaboradores(colab)
                const progPct = calcDiarioProgressPct(prog)

                const isColabOpen = expandedColab.has(d.id)
                const isAtvOpen = expandedAtv.has(d.id)
                const isFotosOpen = expandedFotos.has(d.id)

                const turnoClimaEntries = TURNOS.map(({ value, label }) => ({
                  turno: value,
                  turnoLabel: label,
                  clima: d.clima_por_turno?.[value] ?? null,
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
                        <span className="font-semibold text-sm">{d.cliente_nome}</span>
                      </TableCell>
                      <TableCell className="py-3 text-sm">{d.responsavel}</TableCell>
                      <TableCell className="py-3 text-xs min-w-[220px]">
                        <button
                          type="button"
                          onClick={() => onEdit(d)}
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
                            <span className="text-sm font-bold text-black">{(d.fotos || []).length}</span>
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
                        <TableCell colSpan={9} className="py-6 px-8">
                          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                            <h4 className="text-sm font-bold text-[#1E1E1E] mb-4 uppercase">
                              Quantidade de cada colaborador
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                              {COLABORADOR_ROLES.map((r) => (
                                <div key={r.key} className="bg-yellow-50 rounded-lg p-3 border border-gray-200">
                                  <div className="text-[11px] uppercase text-gray-500 font-semibold mb-1">
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
                                    className="h-9 text-right font-bold"
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
                        <TableCell colSpan={9} className="py-6 px-8">
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
                        <TableCell colSpan={9} className="py-6 px-8">
                          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                            <h4 className="text-sm font-bold text-[#1E1E1E] mb-4 uppercase">
                              Registro Fotográfico ({(d.fotos || []).length})
                            </h4>
                            <FotosThumbs
                              fotos={d.fotos || []}
                              onOpen={(idx) => openViewer(d.fotos || [], idx)}
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
          if (ok) setViewerFotos((prev) => prev.filter((f) => f.id !== foto.id))
        }}
      />
    </div>
  )
}

function FotosThumbs({
  fotos,
  onOpen,
}: {
  fotos: DiarioObrasFoto[]
  onOpen: (idx: number) => void
}) {
  const [urls, setUrls] = useState<Record<string, string>>({})

  useEffect(() => {
    if (fotos.length === 0) return
    const paths = fotos.map((f) => f.storage_path)
    getSignedFotoUrlsAction(paths).then((res) => {
      if (res.ok) setUrls(res.data || {})
    })
  }, [fotos])

  if (fotos.length === 0) return <p className="text-sm text-gray-500 italic">Nenhuma foto enviada.</p>

  return (
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
    </div>
  )
}
