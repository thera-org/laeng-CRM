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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import type { Material } from "@/lib/types"
import { useGestaoModals } from "@/components/almoxarifado/hooks/useGestaoModals"
import { UNIDADES_MEDIDA } from "@/components/almoxarifado/types/almoxarifadoTypes"

interface MaterialModalProps {
  isOpen: boolean
  onClose: () => void
  material?: Material | null
}

export function MaterialModal({ isOpen, onClose, material }: MaterialModalProps) {
  const { formData, updateField, saveMaterial, isLoading, isEditing } = useGestaoModals(
    isOpen,
    onClose,
    material
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-bold">
            {isEditing ? "Editar Material" : "Novo Material"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Material *</Label>
            <Input
              id="nome"
              placeholder="Ex: Cimento, Areia, Tijolo..."
              value={formData.nome}
              onChange={(e) => updateField("nome", e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unidade">Unidade de Medida *</Label>
            <Select
              value={formData.unidade_medida}
              onValueChange={(v) => updateField("unidade_medida", v)}
              disabled={isLoading}
            >
              <SelectTrigger id="unidade">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {UNIDADES_MEDIDA.map((u) => (
                  <SelectItem key={u.value} value={u.value}>
                    {u.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estoque">Estoque Inicial</Label>
            <Input
              id="estoque"
              type="number"
              min={0}
              value={formData.estoque_inicial}
              onChange={(e) => updateField("estoque_inicial", Number(e.target.value))}
              disabled={isLoading}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={saveMaterial}
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
              "Cadastrar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
