"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { ChevronLeft, ChevronRight, Upload } from "lucide-react"

import { Gauge360 } from "@/components/gauge-360"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { TableCell, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { getSignedFotoUrlsAction } from "./actions/diarioActions"
import { COLABORADOR_ROLES, MAX_FOTOS, PROGRESSO_ITEMS } from "./types/diarioTypes"
import type { DiarioColaboradores, DiarioObrasFoto, DiarioProgresso } from "@/lib/types"

type ColaboradorRoleKey = (typeof COLABORADOR_ROLES)[number]["key"]
type ProgressoItemKey = (typeof PROGRESSO_ITEMS)[number]["key"]

const PROGRESSO_ITEMS_PER_PAGE = 12

interface DiarioExpandedPanelShellProps {
  children: ReactNode
}

function DiarioExpandedPanelShell({ children }: DiarioExpandedPanelShellProps) {
  return (
    <TableRow className="border-l-4 border-[#F5C800]">
      <TableCell colSpan={10} className="!p-0 whitespace-normal break-words align-top">
        <div className="sticky left-0 w-screen max-w-[95vw] overflow-x-auto overscroll-x-contain md:static md:w-full md:max-w-none md:overflow-visible">
          <div className="min-w-full px-3 py-4 sm:px-4 md:px-6 lg:px-8">
            <div className="min-w-0 overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-md sm:p-5 md:p-6">
            {children}
            </div>
          </div>
        </div>
      </TableCell>
    </TableRow>
  )
}

interface DiarioColaboradoresPanelProps {
  colaboradores: DiarioColaboradores
  onChangeColaborador: (roleKey: ColaboradorRoleKey, value: number) => void
  onCommitColaborador: (roleKey: ColaboradorRoleKey, value: number) => Promise<void>
}

export function DiarioColaboradoresPanel({
  colaboradores,
  onChangeColaborador,
  onCommitColaborador,
}: DiarioColaboradoresPanelProps) {
  return (
    <DiarioExpandedPanelShell>
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-bold uppercase text-[#1E1E1E]">Quantidade de cada colaborador</h4>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {COLABORADOR_ROLES.map((role) => (
            <div
              key={role.key}
              className="min-w-0 rounded-lg border border-gray-200 bg-[#F5C800] p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[#1E1E1E]/70">{role.label}</div>
              <Input
                type="number"
                min={0}
                value={colaboradores[role.key] ?? 0}
                onChange={(event) => {
                  const value = Math.max(0, Number.parseInt(event.target.value || "0", 10) || 0)
                  onChangeColaborador(role.key, value)
                }}
                onBlur={async (event) => {
                  const value = Math.max(0, Number.parseInt(event.target.value || "0", 10) || 0)
                  await onCommitColaborador(role.key, value)
                }}
                className="h-10 border-black/15 bg-white text-right font-bold text-[#1E1E1E] shadow-sm focus-visible:ring-[#1E1E1E]/20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>
          ))}
        </div>
      </div>
    </DiarioExpandedPanelShell>
  )
}

interface DiarioAtividadeProgressoPanelProps {
  atividade: string
  progresso: DiarioProgresso
  progressPct: number
  onAtividadeChange: (value: string) => void
  onAtividadeCommit: (value: string) => Promise<void>
  onToggleProgresso: (itemKey: ProgressoItemKey, checked: boolean) => Promise<void>
}

export function DiarioAtividadeProgressoPanel({
  atividade,
  progresso,
  progressPct,
  onAtividadeChange,
  onAtividadeCommit,
  onToggleProgresso,
}: DiarioAtividadeProgressoPanelProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.ceil(PROGRESSO_ITEMS.length / PROGRESSO_ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * PROGRESSO_ITEMS_PER_PAGE
  const endIndex = Math.min(startIndex + PROGRESSO_ITEMS_PER_PAGE, PROGRESSO_ITEMS.length)
  const paginatedItems = PROGRESSO_ITEMS.slice(startIndex, endIndex)

  return (
    <DiarioExpandedPanelShell>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3 xl:gap-6">
        <div className="min-w-0 space-y-4 xl:col-span-2">
          <div className="min-w-0">
            <h4 className="mb-2 text-sm font-bold uppercase text-[#1E1E1E]">Atividade</h4>
            <Textarea
              value={atividade}
              onChange={(event) => onAtividadeChange(event.target.value.slice(0, 2000))}
              onBlur={async (event) => onAtividadeCommit(event.target.value.slice(0, 2000))}
              rows={5}
              className="min-h-32 resize-none border-gray-300"
            />
          </div>

          <div className="min-w-0">
            <h4 className="mb-2 text-sm font-bold uppercase text-[#1E1E1E]">Itens da Obra</h4>
            <div className="overflow-hidden rounded-md border border-gray-200">
              <div className="divide-y divide-gray-200">
                {paginatedItems.map((item) => (
                  <div key={item.key} className="flex items-start justify-between gap-3 p-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-700">{item.label}</p>
                    </div>
                    <Checkbox
                      checked={!!progresso[item.key]}
                      onCheckedChange={async (checked) => {
                        await onToggleProgresso(item.key, !!checked)
                      }}
                      className="mt-0.5 shrink-0 border-2 border-gray-600 data-[state=checked]:border-[#F5C800] data-[state=checked]:bg-[#F5C800] data-[state=unchecked]:bg-gray-400"
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 border-t border-gray-200 bg-gray-50 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-medium text-gray-600">
                  Mostrando {startIndex + 1}-{endIndex} de {PROGRESSO_ITEMS.length} itens
                </p>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                    className="h-8 border-[#F5C800]/30 px-2 hover:bg-[#F5C800]/10 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="min-w-[72px] text-center text-xs font-semibold text-gray-700">
                    Página {currentPage}/{totalPages}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    disabled={currentPage === totalPages}
                    className="h-8 border-[#F5C800]/30 px-2 hover:bg-[#F5C800]/10 disabled:opacity-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-col items-center justify-center rounded-lg border border-gray-200 bg-yellow-50 p-4">
          <h5 className="mb-4 text-sm font-bold uppercase text-[#1E1E1E]">Progresso</h5>
          <Gauge360 value={progressPct} size={180} strokeWidth={18} label="finalizado" />
        </div>
      </div>
    </DiarioExpandedPanelShell>
  )
}

interface DiarioFotosPanelProps {
  fotos: DiarioObrasFoto[]
  onOpen: (idx: number) => void
  onAdd: (files: FileList) => Promise<void> | void
  canAdd: boolean
  isUploading: boolean
}

export function DiarioFotosPanel({
  fotos,
  onOpen,
  onAdd,
  canAdd,
  isUploading,
}: DiarioFotosPanelProps) {
  return (
    <DiarioExpandedPanelShell>
      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h4 className="text-sm font-bold uppercase text-[#1E1E1E]">Registro Fotográfico ({fotos.length})</h4>
          <span className="text-[11px] text-gray-500">{fotos.length}/{MAX_FOTOS} (JPEG/PNG, máx. 50 MB)</span>
        </div>

        <FotosThumbs
          fotos={fotos}
          onOpen={onOpen}
          onAdd={onAdd}
          canAdd={canAdd}
          isUploading={isUploading}
        />
      </div>
    </DiarioExpandedPanelShell>
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
  onAdd: (files: FileList) => Promise<void> | void
  canAdd: boolean
  isUploading: boolean
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [urls, setUrls] = useState<Record<string, string>>({})

  useEffect(() => {
    if (fotos.length === 0) {
      return
    }

    const paths = fotos.map((foto) => foto.storage_path)
    getSignedFotoUrlsAction(paths).then((response) => {
      if (response.ok) {
        setUrls(response.data || {})
      }
    })
  }, [fotos])

  return (
    <div className="space-y-3">
      {fotos.length === 0 && <p className="text-sm italic text-gray-500">Nenhuma foto enviada.</p>}

      <div className="flex flex-wrap gap-3">
        {fotos.map((foto, index) => (
          <button
            key={foto.id}
            type="button"
            onClick={() => onOpen(index)}
            className="h-24 w-24 overflow-hidden rounded border border-gray-200 hover:ring-2 hover:ring-[#F5C800]"
          >
            {urls[foto.storage_path] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={urls[foto.storage_path]} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full animate-pulse bg-gray-100" />
            )}
          </button>
        ))}

        {canAdd && (
          <>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex h-24 w-24 flex-col items-center justify-center rounded border-2 border-dashed border-gray-300 text-gray-500 hover:border-[#F5C800] hover:text-[#1E1E1E] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Upload className="mb-1 h-5 w-5" />
              <span className="text-[10px] font-semibold">{isUploading ? "Enviando..." : "Adicionar"}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={(event) => {
                if (event.target.files?.length) {
                  onAdd(event.target.files)
                }
                event.target.value = ""
              }}
            />
          </>
        )}
      </div>
    </div>
  )
}