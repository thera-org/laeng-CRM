"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2 } from "lucide-react"
import type { DiarioComCliente } from "@/lib/types"

interface DiariosDeleteDialogProps {
  diario: DiarioComCliente | null
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isDeleting: boolean
}

export function DiariosDeleteDialog({
  diario,
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}: DiariosDeleteDialogProps) {
  if (!diario) return null

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const [ano, mes, dia] = dateString.split("T")[0].split("-")
    return `${dia}/${mes}/${ano}`
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-gray-100">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold text-red-600">
            Excluir Diário?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base" asChild>
            <div>
              Você está prestes a excluir o diário:
              <div className="bg-white p-3 rounded-md border border-gray-200 shadow-sm mt-2">
                <div className="text-sm font-bold text-[#1E1E1E]">
                  #{String(diario.codigo).padStart(3, "0")} — {diario.cliente_nome}
                </div>
                <div className="mt-1 text-xs text-gray-600">
                  Data: {formatDate(diario.data)} · Responsável: {diario.responsavel}
                </div>
                {(diario.fotos || []).length > 0 && (
                  <div className="mt-1 text-xs text-red-600">
                    {(diario.fotos || []).length} foto(s) também serão removidas.
                  </div>
                )}
              </div>
              <p className="mt-3 text-red-600 font-semibold">Esta ação não pode ser desfeita.</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="hover:bg-gray-200" disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
