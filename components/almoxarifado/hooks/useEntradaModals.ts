"use client"

import { useState, useEffect, useCallback } from "react"
import type { MaterialEntrada } from "@/lib/types"
import { saveEntradaAction } from "@/components/almoxarifado/actions/entradaActions"
import { toast } from "@/hooks/use-toast"
import { format } from "date-fns"

interface EntradaFormData {
  material_id: string
  quantidade: number
  data: string
  cliente_id: string
  observacao: string
}

const INITIAL_FORM: EntradaFormData = {
  material_id: "",
  quantidade: 0,
  data: format(new Date(), "yyyy-MM-dd"),
  cliente_id: "",
  observacao: "",
}

export function useEntradaModals(
  isOpen: boolean,
  onClose: () => void,
  entrada?: MaterialEntrada | null
) {
  const isEditing = !!entrada
  const [formData, setFormData] = useState<EntradaFormData>(INITIAL_FORM)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && entrada) {
      setFormData({
        material_id: entrada.material_id,
        quantidade: entrada.quantidade,
        data: entrada.data,
        cliente_id: entrada.cliente_id || "",
        observacao: entrada.observacao || "",
      })
    } else if (isOpen) {
      setFormData(INITIAL_FORM)
    }
  }, [isOpen, entrada])

  const updateField = useCallback(
    (field: keyof EntradaFormData, value: string | number) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
    },
    []
  )

  const saveEntrada = useCallback(async () => {
    if (!formData.material_id) {
      toast({ title: "Erro", description: "Selecione um material.", variant: "destructive" })
      return
    }
    if (!formData.quantidade || formData.quantidade <= 0) {
      toast({ title: "Erro", description: "Quantidade deve ser maior que zero.", variant: "destructive" })
      return
    }
    if (!formData.cliente_id) {
      toast({ title: "Erro", description: "Selecione um cliente/obra.", variant: "destructive" })
      return
    }

    setIsLoading(true)
    try {
      const result = await saveEntradaAction(
        {
          material_id: formData.material_id,
          quantidade: formData.quantidade,
          data: formData.data,
          cliente_id: formData.cliente_id || undefined,
          observacao: formData.observacao || undefined,
        },
        entrada?.id
      )

      if (!result.ok) {
        toast({ title: "Erro", description: result.error, variant: "destructive" })
        return
      }

      toast({
        title: isEditing ? "Entrada atualizada!" : "Entrada registrada!",
        description: "Registro salvo com sucesso.",
      })
      onClose()
    } catch {
      toast({ title: "Erro", description: "Erro ao salvar entrada.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }, [formData, entrada, isEditing, onClose])

  return {
    formData,
    updateField,
    saveEntrada,
    isLoading,
    isEditing,
  }
}
