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
import { Loader2, Search } from "lucide-react"
import type { MaterialEntrada } from "@/lib/types"
import { useEntradaModals } from "@/components/almoxarifado/hooks/useEntradaModals"

interface EntradaModalProps {
  isOpen: boolean
  onClose: () => void
  entrada?: MaterialEntrada | null
  materiais: { id: string; nome: string }[]
  clientes: { id: string; nome: string; codigo?: number }[]
}

export function EntradaModal({ isOpen, onClose, entrada, materiais, clientes }: EntradaModalProps) {
  const {
    formData,
    updateField,
    saveEntrada,
    isLoading,
    isEditing,
    searchTerm,
    setSearchTerm,
    filteredClientes,
    selectedCliente,
    setSelectedClienteId,
    selectFromSearch,
  } = useEntradaModals(isOpen, onClose, entrada, clientes)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl min-h-[20vh] max-h-[90vh] flex flex-col p-0 bg-white">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gray-50/50">
          <DialogTitle className="text-2xl font-bold text-[#1E1E1E]">
            {isEditing ? "Editar Entrada" : "Nova Entrada de Material"}
          </DialogTitle>
          {!isEditing && (
            <p className="text-sm text-muted-foreground">
              Selecione um cliente para registrar a entrada de material.
            </p>
          )}
        </DialogHeader>

        <div className="overflow-y-auto px-6 py-6 space-y-6 scrollbar-thin flex-10">

          {/* --- EDIT MODE --- */}
          {isEditing && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="font-semibold text-sm text-gray-700">Material *</Label>
                <Select
                  value={formData.material_id}
                  onValueChange={(v) => updateField("material_id", v)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="border-gray-300 focus:border-[#F5C800]">
                    <SelectValue placeholder="Selecione o material..." />
                  </SelectTrigger>
                  <SelectContent>
                    {materiais.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Label className="font-semibold text-sm text-gray-700">Observação</Label>
                <Textarea
                  placeholder="Observação opcional..."
                  value={formData.observacao}
                  onChange={(e) => updateField("observacao", e.target.value)}
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
                    <Button variant="ghost" size="sm" onClick={() => setSelectedClienteId(null)} className="h-6 text-blue-600 hover:text-blue-900">Trocar</Button>
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
                    <Select
                      value={formData.material_id}
                      onValueChange={(v) => updateField("material_id", v)}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="border-gray-300 focus:border-[#F5C800]">
                        <SelectValue placeholder="Selecione o material..." />
                      </SelectTrigger>
                      <SelectContent>
                        {materiais.map((m) => (
                          <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <Label className="font-semibold text-sm text-gray-700">Observação</Label>
                    <Textarea
                      placeholder="Observação opcional..."
                      value={formData.observacao}
                      onChange={(e) => updateField("observacao", e.target.value)}
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
              onClick={saveEntrada}
              disabled={isLoading}
              className="bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold min-w-[150px]"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : "Salvar Alterações"}
            </Button>
          ) : (
            <Button
              onClick={saveEntrada}
              disabled={isLoading || !selectedCliente}
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
