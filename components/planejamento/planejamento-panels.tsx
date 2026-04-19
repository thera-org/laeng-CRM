"use client"

import { Plus, Trash2 } from "lucide-react"

import { Gauge360 } from "@/components/gauge-360"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { TableCell, TableRow } from "@/components/ui/table"
import { MAX_DESCRICAO_LEN } from "./types/planejamentoTypes"
import type { PlanejamentoAtividade } from "@/lib/types"

interface PlanejamentoExpandedPanelShellProps {
  children: React.ReactNode
}

function PlanejamentoExpandedPanelShell({ children }: PlanejamentoExpandedPanelShellProps) {
  return (
    <TableRow className="border-l-4 border-[#F5C800]">
      <TableCell colSpan={6} className="!p-0 whitespace-normal break-words align-top">
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

interface PlanejamentoExpandedPanelProps {
  atividades: PlanejamentoAtividade[]
  progressPct: number
  busy: boolean
  onAddAtividade: () => Promise<void> | void
  onChangeAtividade: (atividadeId: string, patch: Partial<PlanejamentoAtividade>) => void
  onCommitAtividade: (
    atividadeId: string,
    patch: Partial<Pick<PlanejamentoAtividade, "descricao" | "realizado">>
  ) => Promise<void>
  onRemoveAtividade: (atividadeId: string) => Promise<void>
}

export function PlanejamentoExpandedPanel({
  atividades,
  progressPct,
  busy,
  onAddAtividade,
  onChangeAtividade,
  onCommitAtividade,
  onRemoveAtividade,
}: PlanejamentoExpandedPanelProps) {
  const completedCount = atividades.filter((atividade) => atividade.realizado).length

  return (
    <PlanejamentoExpandedPanelShell>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)] lg:gap-6">
          <div className="min-w-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
            <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h4 className="text-sm font-bold uppercase text-[#1E1E1E]">Atividades</h4>
                <p className="mt-1 text-xs text-gray-500">Edite a descrição ou marque a atividade como concluída.</p>
              </div>
              <Button
                size="sm"
                onClick={() => onAddAtividade()}
                disabled={busy}
                className="h-8 bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90"
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Adicionar
              </Button>
            </div>

            {atividades.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">Nenhuma atividade.</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {atividades.map((atividade) => (
                  <div
                    key={atividade.id}
                    className="grid grid-cols-1 gap-3 p-3 md:grid-cols-[5rem_minmax(0,1fr)_7rem_3rem] md:items-center"
                  >
                    <div className="flex items-center justify-between gap-3 md:block">
                      <Badge className="bg-[#F5C800] px-2 py-1 font-mono text-xs font-bold text-[#1E1E1E] hover:bg-[#F5C800]/90">
                        #{String(atividade.codigo).padStart(3, "0")}
                      </Badge>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onRemoveAtividade(atividade.id)}
                        disabled={busy}
                        className="h-7 w-7 text-red-600 hover:bg-red-50 md:hidden"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <div className="min-w-0">
                        <Input
                          value={atividade.descricao}
                          maxLength={MAX_DESCRICAO_LEN}
                          onChange={(event) =>
                            onChangeAtividade(atividade.id, { descricao: event.target.value })
                          }
                          onBlur={(event) =>
                            onCommitAtividade(atividade.id, { descricao: event.target.value })
                          }
                          className="h-8 border-black/15 bg-white text-xs text-[#1E1E1E] shadow-sm focus-visible:ring-[#1E1E1E]/20"
                        />
                    </div>

                    <div className="flex items-center justify-between rounded-md bg-yellow-50 px-3 py-2 md:justify-center md:bg-transparent md:px-0 md:py-0">
                      <span className="text-xs font-semibold uppercase text-[#1E1E1E] md:hidden">Realizado</span>
                        <Checkbox
                          checked={atividade.realizado}
                          onCheckedChange={async (checked) => {
                            const realizado = !!checked
                            onChangeAtividade(atividade.id, { realizado })
                            await onCommitAtividade(atividade.id, { realizado })
                          }}
                          className="border-2 border-gray-600 data-[state=checked]:border-[#F5C800] data-[state=checked]:bg-[#F5C800] data-[state=unchecked]:bg-gray-400"
                        />
                    </div>

                    <div className="hidden items-center justify-center md:flex">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onRemoveAtividade(atividade.id)}
                          disabled={busy}
                          className="h-7 w-7 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-col items-center justify-center rounded-lg border border-gray-200 bg-yellow-50 p-4">
            <h5 className="mb-4 text-sm font-bold uppercase text-[#1E1E1E]">Progresso</h5>
            <Gauge360 value={progressPct} size={160} label="Concluído" />
            <p className="mt-3 text-center text-xs font-medium text-gray-600">
              {completedCount} de {atividades.length} atividades concluídas
            </p>
          </div>
        </div>
    </PlanejamentoExpandedPanelShell>
  )
}