"use client"

import { useState } from "react"
import { toast } from "@/hooks/use-toast"
import { updateDiarioFieldAction, deleteDiarioFotoAction } from "../actions/diarioActions"

export function useDiarioInlineEdit() {
  const [savingField, setSavingField] = useState<string | null>(null)

  const updateField = async (id: string, field: string, value: unknown, label?: string) => {
    setSavingField(`${id}:${field}`)
    const res = await updateDiarioFieldAction(id, field, value)
    setSavingField(null)
    if (!res.ok) {
      toast({
        title: `Erro ao atualizar${label ? ` ${label}` : ""}`,
        description: res.error,
        variant: "destructive",
      })
      return false
    }
    return true
  }

  const removeFoto = async (fotoId: string) => {
    const res = await deleteDiarioFotoAction(fotoId)
    if (!res.ok) {
      toast({ title: "Erro ao remover foto", description: res.error, variant: "destructive" })
      return false
    }
    return true
  }

  return { updateField, removeFoto, savingField }
}
