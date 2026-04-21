"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "@/hooks/use-toast"
import {
  saveDiarioAction,
  getClientesForDiarioAction,
} from "../actions/diarioActions"
import {
  ALLOWED_FOTO_MIMES,
  MAX_FOTOS,
  MAX_FOTO_BYTES,
  MAX_ATIVIDADE_LEN,
  TURNOS,
  getVisibleClimaPorTurno,
  toClimaPorTurnoPayload,
} from "../types/diarioTypes"
import { uploadDiarioFotosSequentially } from "../libs/diario-foto-upload"
import type {
  Clima,
  DiarioClimaPorTurno,
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

const VISIBLE_TURNO_KEYS = TURNOS.map(({ value }) => value)

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
  const [climaPorTurno, setClimaPorTurno] = useState<DiarioClimaPorTurno>({})
  const [colaboradores, setColaboradores] = useState<DiarioColaboradores>({})
  const [atividade, setAtividade] = useState<string>("")
  const [progresso, setProgresso] = useState<DiarioProgresso>({})
  const [pendingFotos, setPendingFotos] = useState<PendingFoto[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [uploadProgressLabel, setUploadProgressLabel] = useState<string | null>(null)

  // ---------- cliente search ----------
  const [clientes, setClientes] = useState<ClienteOption[]>([])
  const [loadingClientes, setLoadingClientes] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const previewUrlsRef = useRef<string[]>([])

  // Hydrate state on open / diario change
  useEffect(() => {
    if (!isOpen) return
    if (diario) {
      // Local form state is rehydrated from the selected diario whenever the dialog opens.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setClienteId(diario.cliente_id)
      setResponsavel(diario.responsavel || defaultResponsavel || "")
      setData(diario.data?.split("T")[0] || new Date().toISOString().split("T")[0])
      setClimaPorTurno(getVisibleClimaPorTurno(diario.clima_por_turno))
      setColaboradores(diario.colaboradores || {})
      setAtividade(diario.atividade || "")
      setProgresso(diario.progresso || {})
      setSearchTerm(diario.cliente_nome || "")
    } else {
      setClienteId("")
      setResponsavel(defaultResponsavel || "")
      setData(new Date().toISOString().split("T")[0])
      setClimaPorTurno({})
      setColaboradores({})
      setAtividade("")
      setProgresso({})
      setSearchTerm("")
    }
    setPendingFotos([])
    setUploadProgressLabel(null)
  }, [isOpen, diario, defaultResponsavel])

  // Load clientes once when opening
  useEffect(() => {
    if (!isOpen || clientes.length > 0) return
    // The initial fetch is intentionally kicked off from the open transition.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingClientes(true)
    getClientesForDiarioAction().then((res) => {
      if (res.ok) setClientes(res.data || [])
      setLoadingClientes(false)
    })
  }, [isOpen, clientes.length])

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

  const selectedTurnos = useMemo(
    () => VISIBLE_TURNO_KEYS.filter((turno) => Object.prototype.hasOwnProperty.call(climaPorTurno, turno)),
    [climaPorTurno]
  )

  // ---------- mutators ----------
  const addTurno = (turno: Turno) => {
    setClimaPorTurno((prev) => {
      if (Object.prototype.hasOwnProperty.call(prev, turno)) return prev
      return { ...prev, [turno]: null }
    })
  }

  const removeTurno = (turno: Turno) => {
    setClimaPorTurno((prev) => {
      if (!Object.prototype.hasOwnProperty.call(prev, turno)) return prev

      const next = { ...prev }
      delete next[turno]
      return next
    })
  }

  const setTurnoClima = (turno: Turno, clima: Clima | null) => {
    setClimaPorTurno((prev) => ({ ...prev, [turno]: clima }))
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
      if (!ALLOWED_FOTO_MIMES.includes(file.type as (typeof ALLOWED_FOTO_MIMES)[number])) {
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
        clima_por_turno: toClimaPorTurnoPayload(climaPorTurno),
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
    let lastUploadError = ""

    if (pendingFotos.length > 0) {
      const uploadResult = await uploadDiarioFotosSequentially({
        diarioId,
        files: pendingFotos.map((foto) => foto.file),
        onProgress: (progress) => {
          setUploadProgressLabel(
            progress ? `Enviando ${progress.current}/${progress.total}` : null
          )
        },
      })

      uploadFailures = uploadResult.failed
      lastUploadError = uploadResult.lastError
    }

    setIsSaving(false)
    setUploadProgressLabel(null)
    if (uploadFailures > 0) {
      toast({
        title: "Diário salvo com avisos",
        description: lastUploadError
          ? `${uploadFailures} foto(s) não foram enviadas. ${lastUploadError}`
          : `${uploadFailures} foto(s) não foram enviadas.`,
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
    climaPorTurno,
    selectedTurnos,
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
    addTurno,
    removeTurno,
    setTurnoClima,
    setColaborador,
    toggleProgresso,
    setAtividadeBounded,
    // fotos
    pendingFotos,
    addFotos,
    removePendingFoto,
    // save
    isSaving,
    uploadProgressLabel,
    save,
  }
}
