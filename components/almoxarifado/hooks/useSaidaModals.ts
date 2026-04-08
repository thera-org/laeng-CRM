"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import type { Material, MaterialSaida } from "@/lib/types"
import { saveSaidaAction } from "@/components/almoxarifado/actions/saidaActions"
import { toast } from "@/hooks/use-toast"
import { format } from "date-fns"

interface SaidaFormData {
  material_id: string
  quantidade: number
  data: string
  cliente_id: string
  justificativa: string
}

const INITIAL_FORM: SaidaFormData = {
  material_id: "",
  quantidade: 0,
  data: format(new Date(), "yyyy-MM-dd"),
  cliente_id: "",
  justificativa: "",
}

export function useSaidaModals(
  isOpen: boolean,
  onClose: () => void,
  saida?: MaterialSaida | null,
  clientes?: { id: string; nome: string; codigo?: number }[],
  materiais?: Pick<Material, "id" | "nome" | "estoque_global" | "grupo_id" | "grupo_nome">[],
  currentUser?: { id: string; nome: string }
) {
  const isEditing = !!saida
  const [formData, setFormData] = useState<SaidaFormData>(INITIAL_FORM)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedGrupoId, setSelectedGrupoId] = useState("")

  // Client search state
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClienteId, setSelectedClienteId] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && saida) {
      const selectedMaterial = (materiais || []).find((item) => item.id === saida.material_id)

      setFormData({
        material_id: saida.material_id,
        quantidade: saida.quantidade,
        data: saida.data,
        cliente_id: saida.cliente_id || "",
        justificativa: saida.justificativa || saida.observacao || "",
      })
      setSelectedGrupoId(selectedMaterial?.grupo_id || "")
      setSelectedClienteId(saida.cliente_id || null)
      setSearchTerm("")
    } else if (isOpen) {
      setFormData(INITIAL_FORM)
      setSelectedGrupoId("")
      setSelectedClienteId(null)
      setSearchTerm("")
    }
  }, [isOpen, saida, materiais])

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

  const grupos = useMemo(() => {
    const seen = new Map<string, string>()

    for (const material of materiais || []) {
      if (!material.grupo_id || seen.has(material.grupo_id)) continue
      seen.set(material.grupo_id, material.grupo_nome)
    }

    return Array.from(seen.entries())
      .map(([id, nome]) => ({ id, nome }))
      .sort((a, b) => a.nome.localeCompare(b.nome))
  }, [materiais])

  const filteredMateriais = useMemo(() => {
    if (!selectedGrupoId) return []
    return (materiais || []).filter((material) => material.grupo_id === selectedGrupoId)
  }, [materiais, selectedGrupoId])

  useEffect(() => {
    if (!formData.material_id) return

    const hasSelectedMaterial = filteredMateriais.some((material) => material.id === formData.material_id)
    if (!hasSelectedMaterial) {
      setFormData((prev) => ({ ...prev, material_id: "" }))
    }
  }, [filteredMateriais, formData.material_id])

  const estoqueDisponivel = useMemo(() => {
    const isSameMaterialAsOriginal = !!saida && saida.material_id === formData.material_id
    return isSameMaterialAsOriginal ? selectedEstoque + saida.quantidade : selectedEstoque
  }, [formData.material_id, saida, selectedEstoque])

  const projectedBalance = useMemo(() => {
    if (!formData.quantidade) return estoqueDisponivel
    return estoqueDisponivel - formData.quantidade
  }, [estoqueDisponivel, formData.quantidade])

  const responsavelNome = isEditing
    ? saida?.criado_por_nome || "Não informado"
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
    (field: keyof SaidaFormData, value: string | number) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
    },
    []
  )

  const saveSaida = useCallback(async () => {
    if (!formData.cliente_id) {
      toast({ title: "Erro", description: "Selecione um cliente.", variant: "destructive" })
      return
    }
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
      const result = await saveSaidaAction(
        {
          material_id: formData.material_id,
          quantidade: formData.quantidade,
          data: formData.data,
          cliente_id: formData.cliente_id,
          justificativa: formData.justificativa || undefined,
        },
        saida?.id
      )

      if (!result.ok) {
        toast({ title: "Erro", description: result.error, variant: "destructive" })
        return
      }

      toast({
        title: isEditing ? "Saída atualizada!" : "Saída registrada!",
        description: "Registro salvo com sucesso.",
      })
      onClose()
    } catch {
      toast({ title: "Erro", description: "Erro ao salvar saída.", variant: "destructive" })
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
    estoqueDisponivel,
    projectedBalance,
    selectedClienteId,
    setSelectedClienteId,
    selectFromSearch,
    clearSelectedCliente,
  }
}
