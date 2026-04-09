"use client"

import { useState, useEffect, useCallback } from "react"
import type { Material, MaterialClasse, MaterialGrupo, MaterialManagementMode, TipoUnidadeMedida } from "@/lib/types"
import { saveMaterialAction } from "@/components/almoxarifado/actions/materialActions"
import { toast } from "@/hooks/use-toast"

interface GestaoFormData {
  nome: string
  classeId: string
  grupoId: string
  unidade: TipoUnidadeMedida
  quantPorObra: string
}

const INITIAL_FORM: GestaoFormData = {
  nome: "",
  classeId: "",
  grupoId: "",
  unidade: "UN",
  quantPorObra: "",
}

export function useGestaoModals(
  isOpen: boolean,
  onClose: () => void,
  mode: MaterialManagementMode,
  options?: {
    material?: Material | null
    classe?: MaterialClasse | null
    grupo?: MaterialGrupo | null
  }
) {
  const material = options?.material
  const classe = options?.classe
  const grupo = options?.grupo
  const isEditing =
    mode === "material"
      ? !!material
      : mode === "classe"
        ? !!classe
        : !!grupo
  const entityId =
    mode === "material"
      ? material?.id
      : mode === "classe"
        ? classe?.id
        : grupo?.id
  const [formData, setFormData] = useState<GestaoFormData>(INITIAL_FORM)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    if (mode === "material" && material) {
      setFormData({
        nome: material.nome,
        classeId: material.classe_id,
        grupoId: material.grupo_id,
        unidade: material.unidade,
        quantPorObra: String(material.quant_por_obra),
      })
      return
    }

    if (mode === "classe" && classe) {
      setFormData({ ...INITIAL_FORM, nome: classe.nome })
      return
    }

    if (mode === "grupo" && grupo) {
      setFormData({ ...INITIAL_FORM, nome: grupo.nome })
      return
    }

    if (isOpen) {
      setFormData(INITIAL_FORM)
    }
  }, [classe, grupo, isOpen, material, mode])

  const updateField = useCallback(
    (field: keyof GestaoFormData, value: string | TipoUnidadeMedida) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
    },
    []
  )

  const saveMaterial = useCallback(async () => {
    if (!formData.nome.trim()) {
      toast({
        title: "Erro",
        description: mode === "material" ? "Nome do material e obrigatorio." : `Nome d${mode === "classe" ? "a classe" : "o grupo"} e obrigatorio.`,
        variant: "destructive",
      })
      return
    }

    if (mode === "material") {
      if (!formData.classeId) {
        toast({ title: "Erro", description: "Selecione uma classe.", variant: "destructive" })
        return
      }

      if (!formData.grupoId) {
        toast({ title: "Erro", description: "Selecione um grupo.", variant: "destructive" })
        return
      }

      const quantPorObra = Number(formData.quantPorObra)
      if (!Number.isFinite(quantPorObra) || quantPorObra <= 0) {
        toast({ title: "Erro", description: "Quantidade por obra deve ser maior que zero.", variant: "destructive" })
        return
      }
    }

    setIsLoading(true)
    try {
      const result = await saveMaterialAction(
        mode === "material"
          ? {
              entityType: "material",
              nome: formData.nome.trim(),
              classeId: formData.classeId,
              grupoId: formData.grupoId,
              unidade: formData.unidade,
              quantPorObra: Number(formData.quantPorObra),
            }
          : {
              entityType: mode,
              nome: formData.nome.trim(),
            },
        entityId
      )

      if (!result.ok) {
        toast({ title: "Erro", description: result.error, variant: "destructive" })
        return
      }

      toast({
        title:
          mode === "material"
            ? isEditing
              ? "Material atualizado!"
              : "Material cadastrado!"
            : mode === "classe"
              ? isEditing
                ? "Classe atualizada!"
                : "Classe cadastrada!"
              : isEditing
                ? "Grupo atualizado!"
                : "Grupo cadastrado!",
        description: `${formData.nome} salvo com sucesso.`,
      })
      onClose()
    } catch {
      toast({ title: "Erro", description: "Erro ao salvar cadastro.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }, [entityId, formData, isEditing, mode, onClose])

  return {
    formData,
    updateField,
    saveMaterial,
    isLoading,
    isEditing,
  }
}


//teste