"use client"

import { useState, useEffect, useCallback } from "react"
import type { MaterialSaida } from "@/lib/types"
import { saveSaidaAction } from "@/components/almoxarifado/actions/saidaActions"
import { toast } from "@/hooks/use-toast"
import { format } from "date-fns"

interface SaidaFormData {
  material_id: string
  quantidade: number
  data: string
  cliente_id: string
  observacao: string
}

const INITIAL_FORM: SaidaFormData = {
  material_id: "",
  quantidade: 0,
  data: format(new Date(), "yyyy-MM-dd"),
  cliente_id: "",
  observacao: "",
}

export function useSaidaModals(
  isOpen: boolean,
  onClose: () => void,
  saida?: MaterialSaida | null
) {
  const isEditing = !!saida
  const [formData, setFormData] = useState<SaidaFormData>(INITIAL_FORM)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && saida) {
      setFormData({
        material_id: saida.material_id,
        quantidade: saida.quantidade,
        data: saida.data,
        cliente_id: saida.cliente_id || "",
        observacao: saida.observacao || "",
      })
    } else if (isOpen) {
      setFormData(INITIAL_FORM)
    }
  }, [isOpen, saida])

  const updateField = useCallback(
    (field: keyof SaidaFormData, value: string | number) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
    },
    []
  )

  const saveSaida = useCallback(async () => {
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
      const result = await saveSaidaAction(
        {
          material_id: formData.material_id,
          quantidade: formData.quantidade,
          data: formData.data,
          cliente_id: formData.cliente_id || undefined,
          observacao: formData.observacao || undefined,
        },
        saida?.id
      )

      if (!result.ok) {
        toast({ title: "Erro", description: result.error, variant: "destructive" })
        return
      }

      toast({
        title: isEditing ? "Saida atualizada!" : "Saida registrada!",
        description: "Registro salvo com sucesso.",
      })
      onClose()
    } catch {
      toast({ title: "Erro", description: "Erro ao salvar saida.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }, [formData, saida, isEditing, onClose])

  return {
    formData,
    updateField,
    saveSaida,
    isLoading,
    isEditing,
  }
}
