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
import { Loader2 } from "lucide-react"
import type { Material } from "@/lib/types"
import { useGestaoModals } from "@/components/almoxarifado/hooks/useGestaoModals"

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
      <DialogContent className="max-w-2xl min-h-[20vh] max-h-[90vh] flex flex-col p-0 bg-white">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gray-50/50">
          <DialogTitle className="text-2xl font-bold text-[#1E1E1E]">
            {isEditing ? "Editar Material" : "Novo Material"}
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto px-6 py-6 space-y-6 scrollbar-thin flex-10">
          <div className="space-y-2">
            <Label htmlFor="nome" className="font-semibold text-sm text-gray-700">
              Nome do Material *
            </Label>
            <Input
              id="nome"
              placeholder="Ex: Cimento, Areia, Tijolo..."
              value={formData.nome}
              onChange={(e) => updateField("nome", e.target.value)}
              disabled={isLoading}
              className="border-gray-300 focus:border-[#F5C800]"
            />
          </div>
        </div>

        <DialogFooter className="flex justify-between items-center px-6 py-4 border-t bg-gray-50 mt-auto w-full">
          <Button variant="ghost" onClick={onClose} disabled={isLoading} className="text-gray-500 hover:text-gray-900">
            Cancelar
          </Button>
          <Button
            onClick={saveMaterial}
            disabled={isLoading}
            className={
              isEditing
                ? "bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold min-w-[150px]"
                : "bg-[#1E1E1E] text-white hover:bg-[#333] font-bold min-w-[150px] border border-[#F5C800]"
            }
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
