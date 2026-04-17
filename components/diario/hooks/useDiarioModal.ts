"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "@/hooks/use-toast"
import {
  saveDiarioAction,
  uploadDiarioFotoAction,
  getClientesForDiarioAction,
} from "../actions/diarioActions"
import {
  ALLOWED_FOTO_MIMES,
  MAX_FOTOS,
  MAX_FOTO_BYTES,
  MAX_ATIVIDADE_LEN,
} from "../types/diarioTypes"
import type {
  Clima,
  DiarioColaboradores,
  DiarioComCliente,
  DiarioProgresso,
  Turno,
} from "@/lib/types"

interface ClienteOption {
  id: string
  codigo: number
  nome: string
}

export interface PendingFoto {
  id: string
  file: File
  previewUrl: string
}

export function useDiarioModal(
  isOpen: boolean,
  onClose: () => void,
  diario?: DiarioComCliente | null,
  defaultResponsavel?: string
) {
  const isEditing = !!diario

  // ---------- form state ----------
  const [clienteId, setClienteId] = useState<string>("")
  const [responsavel, setResponsavel] = useState<string>(defaultResponsavel || "")
  const [data, setData] = useState<string>(new Date().toISOString().split("T")[0])
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [climas, setClimas] = useState<Clima[]>([])
  const [colaboradores, setColaboradores] = useState<DiarioColaboradores>({})
  const [atividade, setAtividade] = useState<string>("")
  const [progresso, setProgresso] = useState<DiarioProgresso>({})
  const [pendingFotos, setPendingFotos] = useState<PendingFoto[]>([])
  const [isSaving, setIsSaving] = useState(false)

  // ---------- cliente search ----------
  const [clientes, setClientes] = useState<ClienteOption[]>([])
  const [loadingClientes, setLoadingClientes] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const previewUrlsRef = useRef<string[]>([])

  // Hydrate state on open / diario change
  useEffect(() => {
    if (!isOpen) return
    if (diario) {
      setClienteId(diario.cliente_id)
      setResponsavel(diario.responsavel || defaultResponsavel || "")
      setData(diario.data?.split("T")[0] || new Date().toISOString().split("T")[0])
      setTurnos((diario.turnos as Turno[]) || [])
      setClimas((diario.climas as Clima[]) || [])
      setColaboradores(diario.colaboradores || {})
      setAtividade(diario.atividade || "")
      setProgresso(diario.progresso || {})
      setSearchTerm(diario.cliente_nome || "")
    } else {
      setClienteId("")
      setResponsavel(defaultResponsavel || "")
      setData(new Date().toISOString().split("T")[0])
      setTurnos([])
      setClimas([])
      setColaboradores({})
      setAtividade("")
      setProgresso({})
      setSearchTerm("")
    }
    setPendingFotos([])
  }, [isOpen, diario?.id])

  // Load clientes once when opening
  useEffect(() => {
    if (!isOpen || clientes.length > 0) return
    setLoadingClientes(true)
    getClientesForDiarioAction().then((res) => {
      if (res.ok) setClientes(res.data || [])
      setLoadingClientes(false)
    })
  }, [isOpen])

  // Cleanup blob URLs
  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
      previewUrlsRef.current = []
    }
  }, [])

  // ---------- derived ----------
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

  // ---------- mutators ----------
  const toggleTurno = (t: Turno) => {
    setTurnos((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))
  }

  const toggleClima = (c: Clima) => {
    setClimas((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]))
  }

  const setColaborador = (key: keyof DiarioColaboradores, value: number) => {
    setColaboradores((prev) => ({ ...prev, [key]: Math.max(0, value | 0) }))
  }

  const toggleProgresso = (key: string) => {
    setProgresso((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const setAtividadeBounded = (value: string) => {
    setAtividade(value.slice(0, MAX_ATIVIDADE_LEN))
  }

  const selectClienteFromSearch = (id: string, nome: string) => {
    setClienteId(id)
    setSearchTerm(nome)
  }

  // ---------- fotos (local buffer) ----------
  const addFotos = (files: FileList | File[]) => {
    const incoming = Array.from(files)
    const remainingSlots = MAX_FOTOS - pendingFotos.length
    if (remainingSlots <= 0) {
      toast({ title: "Limite atingido", description: `Máximo de ${MAX_FOTOS} fotos.`, variant: "destructive" })
      return
    }

    const accepted: PendingFoto[] = []
    for (const file of incoming.slice(0, remainingSlots)) {
      if (!ALLOWED_FOTO_MIMES.includes(file.type as any)) {
        toast({ title: "Formato inválido", description: `${file.name} não é JPEG/PNG`, variant: "destructive" })
        continue
      }
      if (file.size > MAX_FOTO_BYTES) {
        toast({ title: "Arquivo muito grande", description: `${file.name} excede 50 MB`, variant: "destructive" })
        continue
      }
      const previewUrl = URL.createObjectURL(file)
      previewUrlsRef.current.push(previewUrl)
      accepted.push({
        id: `tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        previewUrl,
      })
    }

    setPendingFotos((prev) => [...prev, ...accepted])
  }

  const removePendingFoto = (id: string) => {
    setPendingFotos((prev) => {
      const target = prev.find((p) => p.id === id)
      if (target) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((p) => p.id !== id)
    })
  }

  // ---------- save ----------
  const save = async () => {
    if (!clienteId) {
      toast({ title: "Cliente obrigatório", description: "Selecione um cliente", variant: "destructive" })
      return
    }
    if (!responsavel.trim()) {
      toast({ title: "Responsável obrigatório", variant: "destructive" })
      return
    }

    setIsSaving(true)
    const res = await saveDiarioAction(
      {
        cliente_id: clienteId,
        responsavel: responsavel.trim(),
        data,
        turnos,
        climas,
        colaboradores,
        atividade,
        progresso,
      },
      diario?.id
    )

    if (!res.ok) {
      setIsSaving(false)
      toast({ title: "Erro ao salvar", description: res.error, variant: "destructive" })
      return
    }

    // Upload pending fotos sequentially after we have the diario id
    const diarioId = res.data!.id
    let uploadFailures = 0
    for (const pf of pendingFotos) {
      const fd = new FormData()
      fd.append("file", pf.file, pf.file.name)
      const upRes = await uploadDiarioFotoAction(diarioId, fd)
      if (!upRes.ok) uploadFailures += 1
    }

    setIsSaving(false)
    if (uploadFailures > 0) {
      toast({
        title: "Diário salvo com avisos",
        description: `${uploadFailures} foto(s) não foram enviadas.`,
        variant: "destructive",
      })
    } else {
      toast({ title: isEditing ? "Diário atualizado" : "Diário criado" })
    }
    onClose()
  }

  return {
    isEditing,
    // form state
    clienteId,
    responsavel,
    setResponsavel,
    data,
    setData,
    turnos,
    climas,
    colaboradores,
    atividade,
    progresso,
    // cliente search
    clientes,
    loadingClientes,
    searchTerm,
    setSearchTerm,
    filteredClientes,
    selectedCliente,
    selectClienteFromSearch,
    // mutators
    toggleTurno,
    toggleClima,
    setColaborador,
    toggleProgresso,
    setAtividadeBounded,
    // fotos
    pendingFotos,
    addFotos,
    removePendingFoto,
    // save
    isSaving,
    save,
  }
}
