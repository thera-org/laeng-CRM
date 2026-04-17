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
import type { PlanejamentoComCliente } from "@/lib/types"

interface PlanejamentosDeleteDialogProps {
  planejamento: PlanejamentoComCliente | null
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isDeleting: boolean
}

export function PlanejamentosDeleteDialog({
  planejamento,
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}: PlanejamentosDeleteDialogProps) {
  if (!planejamento) return null

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const [ano, mes, dia] = dateString.split("T")[0].split("-")
    return `${dia}/${mes}/${ano}`
  }

  const ativCount = (planejamento.atividades || []).length

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-gray-100">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold text-red-600">
            Excluir Planejamento?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base" asChild>
            <div>
              Você está prestes a excluir o planejamento:
              <div className="bg-white p-3 rounded-md border border-gray-200 shadow-sm mt-2">
                <div className="text-sm font-bold text-[#1E1E1E]">
                  #{String(planejamento.codigo).padStart(3, "0")} — {planejamento.cliente_nome}
                </div>
                <div className="mt-1 text-xs text-gray-600">
                  Semana: {formatDate(planejamento.data_inicio)} a {formatDate(planejamento.data_fim)}
                </div>
                <div className="mt-1 text-xs text-gray-600">
                  Responsável: {planejamento.responsavel}
                </div>
                {ativCount > 0 && (
                  <div className="mt-1 text-xs text-red-600">
                    {ativCount} atividade(s) também serão removidas.
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
