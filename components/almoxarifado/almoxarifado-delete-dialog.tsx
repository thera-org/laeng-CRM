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

interface AlmoxarifadoDeleteDialogProps {
  item: { id: string; nome?: string; quantidade?: number; material_nome?: string } | null
  itemType: "material" | "entrada" | "saida"
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isDeleting: boolean
}

const LABELS: Record<string, string> = {
  material: "Material",
  entrada: "Entrada de Material",
  saida: "Saida de Material",
}

export function AlmoxarifadoDeleteDialog({
  item,
  itemType,
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}: AlmoxarifadoDeleteDialogProps) {
  if (!item) return null

  const label = LABELS[itemType] || "Registro"
  const displayName = item.nome || item.material_nome || ""

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-gray-100">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold text-red-600">
            Excluir {label}?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base" asChild>
            <div>
              Voce esta prestes a excluir:
              <br />
              <br />
              <div className="bg-white p-3 rounded-md border border-gray-200 shadow-sm">
                <div className="font-bold text-gray-800">{displayName}</div>
                {item.quantidade !== undefined && (
                  <div className="text-sm text-gray-600 mt-1">
                    Quantidade: {item.quantidade}
                  </div>
                )}
              </div>
              <br />
              <span className="text-red-600 font-semibold">
                Esta acao nao pode ser desfeita.
              </span>{" "}
              O registro sera permanentemente removido do sistema.
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
            className="bg-red-600 hover:bg-red-700 text-white font-bold"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              "Sim, excluir"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
