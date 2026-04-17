"use client"

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Search, Trash2, Undo2 } from "lucide-react"
import { usePlanejamentoModal } from "./hooks/usePlanejamentoModal"
import { MAX_DESCRICAO_LEN } from "./types/planejamentoTypes"
import type { PlanejamentoComCliente } from "@/lib/types"

interface PlanejamentoModalProps {
  isOpen: boolean
  onClose: () => void
  planejamento?: PlanejamentoComCliente | null
  defaultResponsavel?: string
}

export function PlanejamentoModal({
  isOpen,
  onClose,
  planejamento,
  defaultResponsavel,
}: PlanejamentoModalProps) {
  const m = usePlanejamentoModal(isOpen, onClose, planejamento, defaultResponsavel)

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-100">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#1E1E1E]">
            {m.isEditing ? "Editar Planejamento" : "Novo Planejamento"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Cliente */}
          <div>
            <Label className="text-sm font-semibold">Cliente *</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={m.searchTerm}
                onChange={(e) => {
                  m.setSearchTerm(e.target.value)
                }}
                placeholder={m.loadingClientes ? "Carregando..." : "Digite ao menos 2 caracteres"}
                className="pl-9 bg-white"
                disabled={m.isEditing}
              />
              {!m.isEditing && m.filteredClientes.length > 0 && (
                <div className="absolute z-20 mt-1 w-full bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {m.filteredClientes.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => m.selectClienteFromSearch(c.id, c.nome)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                    >
                      <span className="font-mono text-xs text-gray-500 mr-2">
                        #{String(c.codigo).padStart(3, "0")}
                      </span>
                      {c.nome}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {m.selectedCliente && (
              <p className="text-xs text-gray-600 mt-1">
                Selecionado: <strong>{m.selectedCliente.nome}</strong>
              </p>
            )}
          </div>

          {/* Responsável + Semana */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold">Responsável *</Label>
              <Input
                value={m.responsavel}
                onChange={(e) => m.setResponsavel(e.target.value)}
                className="bg-white"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold">Semana</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={m.dataInicio}
                  onChange={(e) => e.target.value && m.setWeek(e.target.value)}
                  className="bg-white"
                />
                <span className="text-xs text-gray-600 whitespace-nowrap">{m.weekLabel}</span>
              </div>
            </div>
          </div>

          {/* Atividades */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-semibold">Atividades</Label>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={
                    m.progressoPct >= 100
                      ? "bg-green-100 text-green-700 border-green-300"
                      : m.progressoPct >= 50
                      ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                      : "bg-red-100 text-red-700 border-red-300"
                  }
                >
                  {m.progressoPct}%
                </Badge>
                {m.canUndo && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={m.undoRemove}
                    className="h-8"
                  >
                    <Undo2 className="h-3 w-3 mr-1" />
                    Desfazer
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  onClick={m.addAtividade}
                  className="h-8 bg-[#F5C800] text-[#1E1E1E] hover:bg-yellow-500"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Adicionar
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-md border">
              {m.atividades.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-500">
                  Nenhuma atividade. Clique em &quot;Adicionar&quot; para começar.
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
                    {m.atividades.map((a) => (
                      <tr key={a.id} className="border-b last:border-b-0">
                        <td className="px-2 py-1 text-center font-mono text-xs">
                          #{String(a.codigo).padStart(3, "0")}
                        </td>
                        <td className="px-2 py-1">
                          <Input
                            value={a.descricao}
                            maxLength={MAX_DESCRICAO_LEN}
                            onChange={(e) =>
                              m.updateAtividadeLocal(a.id, { descricao: e.target.value })
                            }
                            className="h-8 bg-white"
                            placeholder="Descreva a atividade..."
                          />
                        </td>
                        <td className="px-2 py-1 text-center">
                          <Checkbox
                            checked={a.realizado}
                            onCheckedChange={(v) =>
                              m.updateAtividadeLocal(a.id, { realizado: !!v })
                            }
                          />
                        </td>
                        <td className="px-2 py-1 text-center">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => m.removeAtividade(a.id)}
                            className="h-7 w-7 text-red-600 hover:bg-red-50"
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={m.isSaving}>
            Cancelar
          </Button>
          <Button
            onClick={m.save}
            disabled={m.isSaving}
            className="bg-[#F5C800] text-[#1E1E1E] hover:bg-yellow-500"
          >
            {m.isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
