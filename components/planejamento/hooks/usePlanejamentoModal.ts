"use client"

import { useEffect, useMemo, useState } from "react"
import { endOfWeek, format, parseISO, startOfWeek } from "date-fns"
import { toast } from "@/hooks/use-toast"
import {
  getClientesForPlanejamentoAction,
  savePlanejamentoAction,
} from "../actions/planejamentoActions"
import type { PlanejamentoAtividade, PlanejamentoComCliente } from "@/lib/types"

interface ClienteOption {
  id: string
  codigo: number
  nome: string
}

interface UndoEntry {
  index: number
  atividade: PlanejamentoAtividade
}

const isoDay = (d: Date) => format(d, "yyyy-MM-dd")

function defaultWeekRange() {
  const now = new Date()
  return {
    inicio: isoDay(startOfWeek(now, { weekStartsOn: 0 })),
    fim: isoDay(endOfWeek(now, { weekStartsOn: 0 })),
  }
}

export function usePlanejamentoModal(
  isOpen: boolean,
  onClose: () => void,
  planejamento?: PlanejamentoComCliente | null,
  defaultResponsavel?: string
) {
  const isEditing = !!planejamento

  const [clienteId, setClienteId] = useState("")
  const [responsavel, setResponsavel] = useState(defaultResponsavel || "")
  const [dataInicio, setDataInicio] = useState<string>(defaultWeekRange().inicio)
  const [dataFim, setDataFim] = useState<string>(defaultWeekRange().fim)
  const [atividades, setAtividades] = useState<PlanejamentoAtividade[]>([])
  const [isSaving, setIsSaving] = useState(false)

  const [clientes, setClientes] = useState<ClienteOption[]>([])
  const [loadingClientes, setLoadingClientes] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // Undo stack: last deleted atividades for current session
  const [undoStack, setUndoStack] = useState<UndoEntry[]>([])

  // Hydrate
  useEffect(() => {
    if (!isOpen) return
    if (planejamento) {
      // Local form state is rehydrated from the selected planejamento whenever the dialog opens.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setClienteId(planejamento.cliente_id)
      setResponsavel(planejamento.responsavel || defaultResponsavel || "")
      setDataInicio(planejamento.data_inicio?.split("T")[0] || defaultWeekRange().inicio)
      setDataFim(planejamento.data_fim?.split("T")[0] || defaultWeekRange().fim)
      setAtividades(
        [...(planejamento.atividades || [])].sort((a, b) => a.ordem - b.ordem)
      )
      setSearchTerm(planejamento.cliente_nome || "")
    } else {
      const wk = defaultWeekRange()
      setClienteId("")
      setResponsavel(defaultResponsavel || "")
      setDataInicio(wk.inicio)
      setDataFim(wk.fim)
      setAtividades([])
      setSearchTerm("")
    }
    setUndoStack([])
  }, [isOpen, planejamento, defaultResponsavel])

  useEffect(() => {
    if (!isOpen || clientes.length > 0) return
    // The initial fetch is intentionally kicked off from the open transition.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingClientes(true)
    getClientesForPlanejamentoAction().then((res) => {
      if (res.ok) setClientes(res.data || [])
      setLoadingClientes(false)
    })
  }, [isOpen, clientes.length])

  const filteredClientes = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (term.length < 2) return []
    return clientes
      .filter((c) => c.nome.toLowerCase().includes(term) || String(c.codigo).includes(term))
      .slice(0, 8)
  }, [clientes, searchTerm])

  const selectedCliente = useMemo(
    () => clientes.find((c) => c.id === clienteId) || null,
    [clientes, clienteId]
  )

  const selectClienteFromSearch = (id: string, nome: string) => {
    setClienteId(id)
    setSearchTerm(nome)
  }

  // ---------- week pick ----------
  const setWeek = (dateAnyDay: string) => {
    const d = parseISO(dateAnyDay)
    setDataInicio(isoDay(startOfWeek(d, { weekStartsOn: 0 })))
    setDataFim(isoDay(endOfWeek(d, { weekStartsOn: 0 })))
  }

  const weekLabel = useMemo(() => {
    if (!dataInicio || !dataFim) return ""
    return `${format(parseISO(dataInicio), "dd/MM/yyyy")} - ${format(parseISO(dataFim), "dd/MM/yyyy")}`
  }, [dataInicio, dataFim])

  // ---------- atividades CRUD ----------
  const addAtividade = () => {
    setAtividades((prev) => {
      const nextCodigo = prev.reduce((m, a) => Math.max(m, a.codigo), 0) + 1
      const nextOrdem = prev.length
      return [
        ...prev,
        {
          id: `tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          planejamento_id: planejamento?.id || "",
          codigo: nextCodigo,
          descricao: "",
          realizado: false,
          ordem: nextOrdem,
        },
      ]
    })
  }

  const updateAtividadeLocal = (id: string, patch: Partial<PlanejamentoAtividade>) => {
    setAtividades((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)))
  }

  const removeAtividade = (id: string) => {
    setAtividades((prev) => {
      const idx = prev.findIndex((a) => a.id === id)
      if (idx === -1) return prev
      const removed = prev[idx]
      setUndoStack((u) => [...u, { index: idx, atividade: removed }])
      return prev.filter((a) => a.id !== id)
    })
  }

  const undoRemove = () => {
    setUndoStack((u) => {
      if (u.length === 0) return u
      const last = u[u.length - 1]
      setAtividades((prev) => {
        const next = [...prev]
        next.splice(Math.min(last.index, next.length), 0, last.atividade)
        return next
      })
      return u.slice(0, -1)
    })
  }

  const progressoPct = useMemo(() => {
    if (atividades.length === 0) return 0
    const done = atividades.filter((a) => a.realizado).length
    return Math.round((done / atividades.length) * 100)
  }, [atividades])

  // ---------- save ----------
  const save = async () => {
    if (!clienteId) {
      toast({ title: "Cliente obrigatório", variant: "destructive" })
      return
    }
    if (!responsavel.trim()) {
      toast({ title: "Responsável obrigatório", variant: "destructive" })
      return
    }
    setIsSaving(true)
    const res = await savePlanejamentoAction(
      {
        cliente_id: clienteId,
        responsavel: responsavel.trim(),
        data_inicio: dataInicio,
        data_fim: dataFim,
        atividades: atividades.map((a, idx) => ({
          codigo: a.codigo || idx + 1,
          descricao: a.descricao,
          realizado: a.realizado,
          ordem: idx,
        })),
      },
      planejamento?.id
    )
    setIsSaving(false)
    if (!res.ok) {
      toast({ title: "Erro ao salvar", description: res.error, variant: "destructive" })
      return
    }
    toast({ title: isEditing ? "Planejamento atualizado" : "Planejamento criado" })
    onClose()
  }

  return {
    isEditing,
    clienteId,
    responsavel,
    setResponsavel,
    dataInicio,
    dataFim,
    setWeek,
    weekLabel,
    atividades,
    progressoPct,
    addAtividade,
    updateAtividadeLocal,
    removeAtividade,
    undoRemove,
    canUndo: undoStack.length > 0,
    // cliente search
    clientes,
    loadingClientes,
    searchTerm,
    setSearchTerm,
    filteredClientes,
    selectedCliente,
    selectClienteFromSearch,
    isSaving,
    save,
  }
}
