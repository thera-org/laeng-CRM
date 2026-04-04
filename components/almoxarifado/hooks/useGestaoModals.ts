"use client"

import { useState, useEffect, useCallback } from "react"
import type { Material } from "@/lib/types"
import { saveMaterialAction } from "@/components/almoxarifado/actions/materialActions"
import { toast } from "@/hooks/use-toast"

interface GestaoFormData {
  nome: string
}

const INITIAL_FORM: GestaoFormData = {
  nome: "",
}

export function useGestaoModals(
  isOpen: boolean,
  onClose: () => void,
  material?: Material | null
) {
  const isEditing = !!material
  const [formData, setFormData] = useState<GestaoFormData>(INITIAL_FORM)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && material) {
      setFormData({
        nome: material.nome,
      })
    } else if (isOpen) {
      setFormData(INITIAL_FORM)
    }
  }, [isOpen, material])

  const updateField = useCallback(
    (field: keyof GestaoFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
    },
    []
  )

  const saveMaterial = useCallback(async () => {
    if (!formData.nome.trim()) {
      toast({ title: "Erro", description: "Nome do material e obrigatorio.", variant: "destructive" })
      return
    }

    setIsLoading(true)
    try {
      const result = await saveMaterialAction(
        {
          nome: formData.nome.trim(),
        },
        material?.id
      )

      if (!result.ok) {
        toast({ title: "Erro", description: result.error, variant: "destructive" })
        return
      }

      toast({
        title: isEditing ? "Material atualizado!" : "Material cadastrado!",
        description: `${formData.nome} salvo com sucesso.`,
      })
      onClose()
    } catch {
      toast({ title: "Erro", description: "Erro ao salvar material.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }, [formData, material, isEditing, onClose])

  return {
    formData,
    updateField,
    saveMaterial,
    isLoading,
    isEditing,
  }
}
