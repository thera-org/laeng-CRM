"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, User } from "lucide-react"
import type { Material, MaterialEntrada, MaterialGrupo } from "@/lib/types"
import { useEntradaModals } from "@/components/almoxarifado/hooks/useEntradaModals"

interface EntradaModalProps {
  isOpen: boolean
  onClose: () => void
  entrada?: MaterialEntrada | null
  materiais: Pick<Material, "id" | "nome" | "estoque_global" | "grupo_id" | "grupo_nome">[]
  groups: MaterialGrupo[]
  clientes: { id: string; nome: string; codigo?: number }[]
  currentUser: { id: string; nome: string }
}

export function EntradaModal({ isOpen, onClose, entrada, materiais, groups, clientes, currentUser }: EntradaModalProps) {
  const groupSelectTriggerClass =
    "w-full min-w-0 border-gray-300 focus:border-[#F5C800] overflow-hidden [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:flex-1 [&_[data-slot=select-value]]:overflow-hidden [&_[data-slot=select-value]]:text-ellipsis [&_[data-slot=select-value]]:whitespace-nowrap"
  const materialSelectTriggerClass =
    "w-full min-w-0 border-gray-300 focus:border-[#F5C800] overflow-hidden [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:flex-1 [&_[data-slot=select-value]]:overflow-hidden [&_[data-slot=select-value]]:text-ellipsis [&_[data-slot=select-value]]:whitespace-nowrap"

  const {
    formData,
    updateField,
    saveEntrada,
    isLoading,
    isEditing,
    grupos,
    selectedGrupoId,
    setSelectedGrupoId,
    filteredMateriais,
    responsavelNome,
    selectedCliente,
    selectedEstoque,
  } = useEntradaModals(isOpen, onClose, entrada, clientes, materiais, groups, currentUser)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl min-h-[20vh] max-h-[90vh] flex flex-col p-0 bg-white">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gray-50/50">
          <DialogTitle className="text-2xl font-bold text-[#1E1E1E]">
            {isEditing ? "Editar Entrada" : "Nova Entrada de Material"}
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto px-6 py-6 space-y-6 scrollbar-thin flex-10">

          {/* --- EDIT MODE --- */}
          {isEditing && (
            <div className="space-y-6">
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                <div className="font-semibold">
                  {selectedCliente ? `Cliente vinculado: ${selectedCliente.nome}` : "Entrada geral do almoxarifado"}
                </div>
                <div className="mt-1">Estoque global atual do material selecionado: {selectedEstoque}</div>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold text-sm text-gray-700">Responsável</Label>
                <div className="flex items-center gap-2 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{responsavelNome}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold text-sm text-gray-700">Material *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="min-w-0 space-y-2">
                    <Label className="font-semibold text-xs text-gray-500 uppercase tracking-wide">Todos os Grupos</Label>
                    <Select value={selectedGrupoId} onValueChange={setSelectedGrupoId} disabled={isLoading}>
                      <SelectTrigger className={groupSelectTriggerClass}>
                        <SelectValue placeholder="Selecione o grupo..." />
                      </SelectTrigger>
                      <SelectContent>
                        {grupos.map((grupo) => (
                          <SelectItem key={grupo.id} value={grupo.id}>{grupo.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="min-w-0 space-y-2">
                    <Label className="font-semibold text-xs text-gray-500 uppercase tracking-wide">Selecione o Material</Label>
                    <Select
                      value={formData.material_id}
                      onValueChange={(v) => updateField("material_id", v)}
                      disabled={isLoading || !selectedGrupoId}
                    >
                      <SelectTrigger className={materialSelectTriggerClass}>
                        <SelectValue placeholder={selectedGrupoId ? "Selecione o material..." : "Escolha um grupo primeiro"} />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredMateriais.map((m) => (
                          <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.material_id && selectedCliente && (
                  <div className="rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-900">
                    Estoque global atual: <span className="font-bold">{selectedEstoque}</span>
                  </div>
                )}
                {formData.material_id && !selectedCliente && (
                  <div className="rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-900">
                    Estoque global atual: <span className="font-bold">{selectedEstoque}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-semibold text-sm text-gray-700">Quantidade *</Label>
                  <Input
                    type="number"
                    min={0.01}
                    step="any"
                    value={formData.quantidade || ""}
                    onChange={(e) => updateField("quantidade", Number(e.target.value))}
                    disabled={isLoading}
                    placeholder="Ex: 10"
                    className="border-gray-300 focus:border-[#F5C800]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-sm text-gray-700">Data *</Label>
                  <Input
                    type="date"
                    value={formData.data}
                    onChange={(e) => updateField("data", e.target.value)}
                    disabled={isLoading}
                    className="border-gray-300 focus:border-[#F5C800]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold text-sm text-gray-700">Justificativa / Observação</Label>
                <Textarea
                  placeholder="Justificativa opcional..."
                  value={formData.justificativa}
                  onChange={(e) => updateField("justificativa", e.target.value)}
                  disabled={isLoading}
                  rows={3}
                  className="border-gray-300 focus:border-[#F5C800]"
                />
              </div>
            </div>
          )}

          {/* --- NEW MODE --- */}
          {!isEditing && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="font-semibold text-sm text-gray-700">Responsável</Label>
                <div className="flex items-center gap-2 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{responsavelNome}</span>
                </div>
                
              </div>

              <div className="h-[1px] bg-gray-200"></div>

              <div className="space-y-2">
                <Label className="font-semibold text-sm text-gray-700">Data do Registro *</Label>
                <Input
                  type="date"
                  value={formData.data}
                  onChange={(e) => updateField("data", e.target.value)}
                  disabled={isLoading}
                  className="border-gray-300 focus:border-[#F5C800]"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-semibold text-sm text-gray-700">Material *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="min-w-0 space-y-2">
                    <Label className="font-semibold text-xs text-gray-500 uppercase tracking-wide">Todos os Grupos</Label>
                    <Select value={selectedGrupoId} onValueChange={setSelectedGrupoId} disabled={isLoading}>
                      <SelectTrigger className={groupSelectTriggerClass}>
                        <SelectValue placeholder="Selecione o grupo..." />
                      </SelectTrigger>
                      <SelectContent>
                        {grupos.map((grupo) => (
                          <SelectItem key={grupo.id} value={grupo.id}>{grupo.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="min-w-0 space-y-2">
                    <Label className="font-semibold text-xs text-gray-500 uppercase tracking-wide">Selecione o Material</Label>
                    <Select
                      value={formData.material_id}
                      onValueChange={(v) => updateField("material_id", v)}
                      disabled={isLoading || !selectedGrupoId}
                    >
                      <SelectTrigger className={materialSelectTriggerClass}>
                        <SelectValue placeholder={selectedGrupoId ? "Selecione o material..." : "Escolha um grupo primeiro"} />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredMateriais.map((m) => (
                          <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.material_id && (
                  <div className="rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-900">
                    Estoque global atual: <span className="font-bold">{selectedEstoque}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="font-semibold text-sm text-gray-700">Quantidade *</Label>
                <Input
                  type="number"
                  min={0.01}
                  step="any"
                  value={formData.quantidade || ""}
                  onChange={(e) => updateField("quantidade", Number(e.target.value))}
                  disabled={isLoading}
                  placeholder="Ex: 10"
                  className="border-gray-300 focus:border-[#F5C800]"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-semibold text-sm text-gray-700">Justificativa / Observação</Label>
                <Textarea
                  placeholder="Justificativa opcional..."
                  value={formData.justificativa}
                  onChange={(e) => updateField("justificativa", e.target.value)}
                  disabled={isLoading}
                  rows={3}
                  className="border-gray-300 focus:border-[#F5C800]"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between items-center px-6 py-4 border-t bg-gray-50 mt-auto w-full">
          <Button variant="ghost" onClick={onClose} disabled={isLoading} className="text-gray-500 hover:text-gray-900">
            Cancelar
          </Button>

          {isEditing ? (
            <Button
              onClick={saveEntrada}
              disabled={isLoading}
              className="bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold min-w-[150px]"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : "Salvar Alterações"}
            </Button>
          ) : (
            <Button
              onClick={saveEntrada}
              disabled={isLoading}
              className="bg-[#1E1E1E] text-white hover:bg-[#333] font-bold min-w-[150px] border border-[#F5C800]"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : "Registrar Entrada"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
