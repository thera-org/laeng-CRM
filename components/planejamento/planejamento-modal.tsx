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
import { Loader2, Plus, Search, Trash2, Undo2, User } from "lucide-react"
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
  const showFormFields = m.isEditing || !!m.selectedCliente
  const linkedClienteNome = planejamento?.cliente_nome || m.selectedCliente?.nome || ""

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 bg-white">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gray-50/50">
          <DialogTitle className="text-xl font-bold text-[#1E1E1E]">
            {m.isEditing ? "Editar Planejamento" : "Novo Planejamento"}
          </DialogTitle>
          {!m.isEditing && (
            <p className="text-sm text-muted-foreground">
              Selecione um cliente para liberar o preenchimento do planejamento.
            </p>
          )}
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto bg-gray-100 px-6 py-6 space-y-5">
          {m.isEditing ? (
            <>
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                <div className="font-semibold">Cliente vinculado: {linkedClienteNome}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Responsável</Label>
                  <div className="mt-2 flex items-center gap-2 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{m.responsavel}</span>
                  </div>
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
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Responsável</Label>
                <div className="flex items-center gap-2 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{m.responsavel}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Cliente *</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={m.searchTerm}
                    onChange={(e) => {
                      m.clearSaveError()
                      m.setSearchTerm(e.target.value)
                    }}
                    placeholder={m.loadingClientes ? "Carregando..." : "Digite ao menos 2 caracteres"}
                    className="pl-9 bg-white"
                  />
                </div>
                {m.searchTerm.length >= 2 && !m.selectedCliente && (
                  <div className="mt-1 w-full z-50 bg-white border border-gray-200 rounded-md shadow-sm max-h-60 overflow-y-auto">
                    {m.filteredClientes.length === 0 ? (
                      <div className="p-3 text-sm text-gray-500 text-center">Nenhum cliente encontrado.</div>
                    ) : (
                      m.filteredClientes.map((c) => (
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
                      ))
                    )}
                  </div>
                )}
                {m.selectedCliente && (
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-md flex justify-between items-center text-blue-800">
                    <span className="font-bold">{m.selectedCliente.nome}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => m.selectClienteFromSearch("", "")}
                      className="h-6 text-blue-600 hover:text-blue-900"
                    >
                      Trocar
                    </Button>
                  </div>
                )}
              </div>

              {m.selectedCliente && (
                <>
                  <div className="h-[1px] bg-gray-200"></div>

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
                </>
              )}
            </>
          )}

          {showFormFields && (
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
                              className="border-2 border-gray-600 data-[state=checked]:border-[#F5C800] data-[state=checked]:bg-[#F5C800] data-[state=unchecked]:bg-gray-400"
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
          )}

          {!m.isEditing && m.saveError && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 md:hidden">
              <p className="font-semibold">{m.saveError.title}</p>
              {m.saveError.description && (
                <p className="mt-1 text-red-600">{m.saveError.description}</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between items-center px-6 py-4 border-t bg-gray-50 mt-auto w-full">
          <Button variant="outline" onClick={onClose} disabled={m.isSaving}>
            Cancelar
          </Button>
          <Button
            onClick={m.save}
            disabled={m.isSaving || (!m.isEditing && !m.selectedCliente)}
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
