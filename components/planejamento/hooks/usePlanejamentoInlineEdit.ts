"use client"

import { useState } from "react"
import { toast } from "@/hooks/use-toast"
import {
  addAtividadeAction,
  deleteAtividadeAction,
  updateAtividadeAction,
  updatePlanejamentoFieldAction,
} from "../actions/planejamentoActions"
import type { PlanejamentoAtividade } from "@/lib/types"

export function usePlanejamentoInlineEdit() {
  const [busy, setBusy] = useState(false)

  const update = async (
    id: string,
    patch: Partial<Pick<PlanejamentoAtividade, "descricao" | "realizado" | "ordem">>
  ) => {
    setBusy(true)
    const res = await updateAtividadeAction(id, patch)
    setBusy(false)
    if (!res.ok) {
      toast({ title: "Erro ao salvar", description: res.error, variant: "destructive" })
      return false
    }
    return true
  }

  const add = async (planejamentoId: string) => {
    setBusy(true)
    const res = await addAtividadeAction(planejamentoId)
    setBusy(false)
    if (!res.ok) {
      toast({ title: "Erro ao adicionar", description: res.error, variant: "destructive" })
      return null
    }
    return res.data!
  }

  const remove = async (id: string) => {
    setBusy(true)
    const res = await deleteAtividadeAction(id)
    setBusy(false)
    if (!res.ok) {
      toast({ title: "Erro ao remover", description: res.error, variant: "destructive" })
      return false
    }
    return true
  }

  const updateHeader = async (
    id: string,
    field: "responsavel" | "data_inicio" | "data_fim",
    value: string
  ) => {
    setBusy(true)
    const res = await updatePlanejamentoFieldAction(id, field, value)
    setBusy(false)
    if (!res.ok) {
      toast({ title: "Erro ao salvar", description: res.error, variant: "destructive" })
      return false
    }
    return true
  }

  return { update, add, remove, updateHeader, busy }
}
