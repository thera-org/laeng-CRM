"use client"

import { useState } from "react"
import { toast } from "@/hooks/use-toast"
import {
  deleteDiarioFotoAction,
  updateDiarioFieldAction,
  uploadDiarioFotoAction,
} from "../actions/diarioActions"
import type { DiarioObrasFoto } from "@/lib/types"

export function useDiarioInlineEdit() {
  const [savingField, setSavingField] = useState<string | null>(null)
  const [uploadingFotosFor, setUploadingFotosFor] = useState<string | null>(null)

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

  const uploadFotos = async (diarioId: string, files: FileList | File[]) => {
    const fileList = Array.from(files)
    if (fileList.length === 0) {
      return { ok: false, added: [] as DiarioObrasFoto[], failed: 0 }
    }

    setUploadingFotosFor(diarioId)
    const added: DiarioObrasFoto[] = []
    let failed = 0
    let lastError = ""

    for (const file of fileList) {
      const formData = new FormData()
      formData.append("file", file, file.name)

      const res = await uploadDiarioFotoAction(diarioId, formData)
      if (res.ok && res.data) {
        added.push(res.data as DiarioObrasFoto)
        continue
      }

      failed += 1
      lastError = res.error || "Erro ao enviar foto"
    }

    setUploadingFotosFor(null)

    if (failed === 0) {
      toast({
        title: added.length === 1 ? "Foto adicionada" : "Fotos adicionadas",
        description: `${added.length} foto(s) enviada(s).`,
      })
      return { ok: true, added, failed }
    }

    toast({
      title: added.length > 0 ? "Fotos adicionadas com avisos" : "Erro ao enviar fotos",
      description:
        added.length > 0
          ? `${added.length} foto(s) enviada(s) e ${failed} falha(s).`
          : lastError,
      variant: "destructive",
    })

    return { ok: false, added, failed }
  }

  return { updateField, removeFoto, uploadFotos, savingField, uploadingFotosFor }
}
