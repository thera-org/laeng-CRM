"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import type { Material, MaterialEntrada } from "@/lib/types"
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

export function useEntradaModals(
  isOpen: boolean,
  onClose: () => void,
  entrada?: MaterialEntrada | null,
  clientes?: { id: string; nome: string; codigo?: number }[],
  materiais?: Pick<Material, "id" | "nome" | "estoque_global">[]
) {
  const isEditing = !!entrada
  const [formData, setFormData] = useState<EntradaFormData>(INITIAL_FORM)
  const [isLoading, setIsLoading] = useState(false)

  // Client search state
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClienteId, setSelectedClienteId] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && entrada) {
      setFormData({
        material_id: entrada.material_id,
        quantidade: entrada.quantidade,
        data: entrada.data,
        cliente_id: entrada.cliente_id || "",
        justificativa: entrada.justificativa || entrada.observacao || "",
      })
      setSelectedClienteId(entrada.cliente_id || null)
      setSearchTerm("")
    } else if (isOpen) {
      setFormData(INITIAL_FORM)
      setSelectedClienteId(null)
      setSearchTerm("")
    }
  }, [isOpen, entrada])

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
