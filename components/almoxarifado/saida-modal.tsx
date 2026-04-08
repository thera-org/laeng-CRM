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
import { Loader2, Search, User } from "lucide-react"
import type { Material, MaterialGrupo, MaterialSaida } from "@/lib/types"
import { useSaidaModals } from "@/components/almoxarifado/hooks/useSaidaModals"

interface SaidaModalProps {
  isOpen: boolean
  onClose: () => void
  saida?: MaterialSaida | null
  materiais: Pick<Material, "id" | "nome" | "estoque_global" | "grupo_id" | "grupo_nome">[]
  groups: MaterialGrupo[]
  clientes: { id: string; nome: string; codigo?: number }[]
  currentUser: { id: string; nome: string }
}

export function SaidaModal({ isOpen, onClose, saida, materiais, groups, clientes, currentUser }: SaidaModalProps) {
  const groupSelectTriggerClass =
    "w-full min-w-0 border-gray-300 focus:border-[#F5C800] overflow-hidden [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:flex-1 [&_[data-slot=select-value]]:overflow-hidden [&_[data-slot=select-value]]:text-ellipsis [&_[data-slot=select-value]]:whitespace-nowrap"
  const materialSelectTriggerClass =
    "w-full min-w-0 border-gray-300 focus:border-[#F5C800] overflow-hidden [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:flex-1 [&_[data-slot=select-value]]:overflow-hidden [&_[data-slot=select-value]]:text-ellipsis [&_[data-slot=select-value]]:whitespace-nowrap"

  const {
    formData,
    updateField,
    saveSaida,
    isLoading,
    isEditing,
    grupos,
    selectedGrupoId,
    setSelectedGrupoId,
    filteredMateriais,
    responsavelNome,
    searchTerm,
    setSearchTerm,
    filteredClientes,
    selectedCliente,
    selectedEstoque,
    estoqueDisponivel,
    selectFromSearch,
    projectedBalance,
    clearSelectedCliente,
  } = useSaidaModals(isOpen, onClose, saida, clientes, materiais, groups, currentUser)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl min-h-[20vh] max-h-[90vh] flex flex-col p-0 bg-white">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gray-50/50">
          <DialogTitle className="text-2xl font-bold text-[#1E1E1E]">
            {isEditing ? "Editar Saída" : "Nova Saída de Material"}
          </DialogTitle>
          {!isEditing && (
            <p className="text-sm text-muted-foreground">
              Selecione um cliente para registrar a saída de material.
            </p>
          )}
        </DialogHeader>

        <div className="overflow-y-auto px-6 py-6 space-y-6 scrollbar-thin flex-10">

          {/* --- EDIT MODE --- */}
          {isEditing && (
            <div className="space-y-6">
              {selectedCliente && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                  <div className="font-semibold">Cliente vinculado: {selectedCliente.nome}</div>
                  <div className="mt-1">Estoque global disponível para o material selecionado: {estoqueDisponivel}</div>
                </div>
              )}

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
                    <span className="ml-2 text-yellow-700">Disponível para esta edição: {estoqueDisponivel}</span>
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

              {/* Search Client */}
              <div className="space-y-2 relative">
                <Label className="text-base font-semibold">Cliente</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar cliente por nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 border-gray-300 focus:border-[#F5C800]"
                  />
                </div>

                {searchTerm.length >= 2 && (
                  <div className="mt-1 w-full z-50 bg-white border border-gray-200 rounded-md shadow-sm max-h-60 overflow-y-auto">
                    {filteredClientes.length === 0 ? (
                      <div className="p-3 text-sm text-gray-500 text-center">Nenhum cliente encontrado.</div>
                    ) : (
                      filteredClientes.map((cliente) => (
                        <div
                          key={cliente.id}
                          onClick={() => selectFromSearch(cliente.id)}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm text-[#1E1E1E] border-b border-gray-100 last:border-0 transition-colors"
                        >
                          {cliente.nome}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {selectedCliente && (
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-md flex justify-between items-center text-blue-800">
                    <span className="font-bold">{selectedCliente.nome}</span>
                    <Button variant="ghost" size="sm" onClick={clearSelectedCliente} className="h-6 text-blue-600 hover:text-blue-900">Trocar</Button>
                  </div>
                )}
              </div>

              {selectedCliente && (
                <>
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
                    <p className="text-xs text-gray-500">Disponível para saída: {estoqueDisponivel}</p>
                    {projectedBalance < 0 && (
                      <p className="text-xs text-amber-600">A movimentação deixará o estoque global com saldo negativo.</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="font-semibold text-sm text-gray-700">Justificativa / Observação</Label>
                    <Textarea
                      placeholder="Obrigatória quando exceder o limite por obra."
                      value={formData.justificativa}
                      onChange={(e) => updateField("justificativa", e.target.value)}
                      disabled={isLoading}
                      rows={3}
                      className="border-gray-300 focus:border-[#F5C800]"
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between items-center px-6 py-4 border-t bg-gray-50 mt-auto w-full">
          <Button variant="ghost" onClick={onClose} disabled={isLoading} className="text-gray-500 hover:text-gray-900">
            Cancelar
          </Button>

          {isEditing ? (
            <Button
              onClick={saveSaida}
              disabled={isLoading}
              className="bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold min-w-[150px]"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : "Salvar Alterações"}
            </Button>
          ) : (
            <Button
              onClick={saveSaida}
              disabled={isLoading || !selectedCliente}
              className="bg-[#1E1E1E] text-white hover:bg-[#333] font-bold min-w-[150px] border border-[#F5C800]"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : "Registrar Saída"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
