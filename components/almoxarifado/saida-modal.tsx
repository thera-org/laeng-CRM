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
import { Loader2 } from "lucide-react"
import type { MaterialSaida } from "@/lib/types"
import { useSaidaModals } from "@/components/almoxarifado/hooks/useSaidaModals"

interface SaidaModalProps {
  isOpen: boolean
  onClose: () => void
  saida?: MaterialSaida | null
  materiais: { id: string; nome: string; unidade_medida: string }[]
  clientes: { id: string; nome: string }[]
}

export function SaidaModal({ isOpen, onClose, saida, materiais, clientes }: SaidaModalProps) {
  const { formData, updateField, saveSaida, isLoading, isEditing } = useSaidaModals(
    isOpen,
    onClose,
    saida
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-bold">
            {isEditing ? "Editar Saida" : "Nova Saida de Material"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="material">Material *</Label>
            <Select
              value={formData.material_id}
              onValueChange={(v) => updateField("material_id", v)}
              disabled={isLoading}
            >
              <SelectTrigger id="material">
                <SelectValue placeholder="Selecione o material..." />
              </SelectTrigger>
              <SelectContent>
                {materiais.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantidade">Quantidade *</Label>
            <Input
              id="quantidade"
              type="number"
              min={0.01}
              step="any"
              value={formData.quantidade || ""}
              onChange={(e) => updateField("quantidade", Number(e.target.value))}
              disabled={isLoading}
              placeholder="Ex: 10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="data">Data *</Label>
            <Input
              id="data"
              type="date"
              value={formData.data}
              onChange={(e) => updateField("data", e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cliente">Cliente/Obra *</Label>
            <Select
              value={formData.cliente_id}
              onValueChange={(v) => updateField("cliente_id", v)}
              disabled={isLoading}
            >
              <SelectTrigger id="cliente">
                <SelectValue placeholder="Selecione o cliente/obra..." />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacao">Observacao</Label>
            <Textarea
              id="observacao"
              placeholder="Observacao opcional..."
              value={formData.observacao}
              onChange={(e) => updateField("observacao", e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={saveSaida}
            disabled={isLoading}
            className="bg-[#F5C800] hover:bg-[#F5C800]/90 text-[#1E1E1E] font-bold"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : isEditing ? (
              "Salvar"
            ) : (
              "Registrar Saida"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
