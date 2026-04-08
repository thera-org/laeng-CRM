"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import type { Material, MaterialEntrada, MaterialGrupo } from "@/lib/types"
import { saveEntradaAction } from "@/components/almoxarifado/actions/entradaActions"
import { toast } from "@/hooks/use-toast"
import { format } from "date-fns"

interface EntradaFormData {
  material_id: string
  quantidade: number
  data: string
  cliente_id: string
  justificativa: string
}

const INITIAL_FORM: EntradaFormData = {
  material_id: "",
  quantidade: 0,
  data: format(new Date(), "yyyy-MM-dd"),
  cliente_id: "",
  justificativa: "",
}

const SEM_GRUPO_ID = "__SEM_GRUPO__"

export function useEntradaModals(
  isOpen: boolean,
  onClose: () => void,
  entrada?: MaterialEntrada | null,
  clientes?: { id: string; nome: string; codigo?: number }[],
  materiais?: Pick<Material, "id" | "nome" | "estoque_global" | "grupo_id" | "grupo_nome">[],
  groups?: MaterialGrupo[],
  currentUser?: { id: string; nome: string }
) {
  const isEditing = !!entrada
  const [formData, setFormData] = useState<EntradaFormData>(INITIAL_FORM)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedGrupoId, setSelectedGrupoId] = useState("")

  // Client search state
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClienteId, setSelectedClienteId] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && entrada) {
      const selectedMaterial = (materiais || []).find((item) => item.id === entrada.material_id)

      setFormData({
        material_id: entrada.material_id,
        quantidade: entrada.quantidade,
        data: entrada.data,
        cliente_id: entrada.cliente_id || "",
        justificativa: entrada.justificativa || entrada.observacao || "",
      })
      setSelectedGrupoId(selectedMaterial?.grupo_id || SEM_GRUPO_ID)
      setSelectedClienteId(entrada.cliente_id || null)
      setSearchTerm("")
    } else if (isOpen) {
      setFormData(INITIAL_FORM)
      setSelectedGrupoId("")
      setSelectedClienteId(null)
      setSearchTerm("")
    }
  }, [isOpen, entrada, materiais])

  // Filter clients by search term
  const filteredClientes = useMemo(() => {
    if (searchTerm.length < 2) return []
    return (clientes || []).filter(c =>
      c.nome.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [clientes, searchTerm])

  // Selected client object
  const selectedCliente = useMemo(() =>
    (clientes || []).find(c => c.id === selectedClienteId),
    [clientes, selectedClienteId]
  )

  const selectedEstoque = useMemo(() => {
    if (!formData.material_id) return 0

    const material = (materiais || []).find((item) => item.id === formData.material_id)
    return Number(material?.estoque_global || 0)
  }, [formData.material_id, materiais])

  const grupos = useMemo(
    () =>
      [{ id: SEM_GRUPO_ID, nome: "Sem grupo" }, ...(groups || []).map((group) => ({ id: group.id, nome: group.nome }))]
        .sort((a, b) => a.nome.localeCompare(b.nome)),
    [groups]
  )

  const filteredMateriais = useMemo(() => {
    const allMateriais = materiais || []

    if (!selectedGrupoId) return allMateriais

    if (selectedGrupoId === SEM_GRUPO_ID) {
      return allMateriais.filter((material) => material.grupo_id === null || material.grupo_id === "")
    }

    return allMateriais.filter((material) => material.grupo_id === selectedGrupoId)
  }, [materiais, selectedGrupoId])

  useEffect(() => {
    if (!formData.material_id) return

    const hasSelectedMaterial = filteredMateriais.some((material) => material.id === formData.material_id)
    if (!hasSelectedMaterial) {
      setFormData((prev) => ({ ...prev, material_id: "" }))
    }
  }, [filteredMateriais, formData.material_id])

  const responsavelNome = isEditing
    ? entrada?.criado_por_nome || "Não informado"
    : currentUser?.nome || "Não informado"

  const handleGrupoChange = useCallback((grupoId: string) => {
    setSelectedGrupoId(grupoId)
    setFormData((prev) => ({
      ...prev,
      material_id: "",
    }))
  }, [])

  const selectFromSearch = useCallback((id: string) => {
    setSelectedClienteId(id)
    setFormData(prev => ({ ...prev, cliente_id: id }))
    setSearchTerm("")
  }, [])

  const clearSelectedCliente = useCallback(() => {
    setSelectedClienteId(null)
    setFormData((prev) => ({ ...prev, cliente_id: "" }))
    setSearchTerm("")
  }, [])

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

    setIsLoading(true)
    try {
      const result = await saveEntradaAction(
        {
          material_id: formData.material_id,
          quantidade: formData.quantidade,
          data: formData.data,
          cliente_id: formData.cliente_id || undefined,
          justificativa: formData.justificativa || undefined,
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
    grupos,
    selectedGrupoId,
    setSelectedGrupoId: handleGrupoChange,
    filteredMateriais,
    responsavelNome,
    searchTerm,
    setSearchTerm,
    filteredClientes,
    selectedCliente,
    selectedEstoque,
    selectedClienteId,
    setSelectedClienteId,
    selectFromSearch,
    clearSelectedCliente,
  }
}
