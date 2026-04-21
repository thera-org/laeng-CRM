import { createClient } from "@/lib/supabase/client"
import type { DiarioObrasFoto } from "@/lib/types"
import { registerDiarioFotoAction } from "../actions/diarioActions"
import {
  ALLOWED_FOTO_MIMES,
  DIARIO_BUCKET,
  MAX_FOTOS,
  MAX_FOTO_BYTES,
} from "../types/diarioTypes"

export interface DiarioFotoUploadProgress {
  current: number
  total: number
  fileName: string
}

interface UploadDiarioFotosOptions {
  diarioId: string
  files: FileList | File[]
  existingCount?: number
  onProgress?: (progress: DiarioFotoUploadProgress | null) => void
}

interface UploadDiarioFotosResult {
  ok: boolean
  added: DiarioObrasFoto[]
  failed: number
  lastError: string
}

export function validateDiarioFotoFile(file: File) {
  if (!ALLOWED_FOTO_MIMES.includes(file.type as (typeof ALLOWED_FOTO_MIMES)[number])) {
    return "Formato inválido. Use JPEG ou PNG."
  }

  if (file.size > MAX_FOTO_BYTES) {
    return `Arquivo excede ${MAX_FOTO_BYTES / 1024 / 1024} MB`
  }

  return ""
}

function createDiarioFotoPath(diarioId: string, file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() || (file.type === "image/png" ? "png" : "jpg")
  const uniqueId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)

  return `${diarioId}/${Date.now()}-${uniqueId}.${extension}`
}

export async function uploadDiarioFotosSequentially({
  diarioId,
  files,
  existingCount = 0,
  onProgress,
}: UploadDiarioFotosOptions): Promise<UploadDiarioFotosResult> {
  const fileList = Array.from(files)

  if (fileList.length === 0) {
    onProgress?.(null)
    return { ok: false, added: [], failed: 0, lastError: "Nenhum arquivo selecionado" }
  }

  const availableSlots = Math.max(0, MAX_FOTOS - existingCount)
  if (availableSlots === 0) {
    onProgress?.(null)
    return {
      ok: false,
      added: [],
      failed: fileList.length,
      lastError: `Máximo de ${MAX_FOTOS} fotos por diário`,
    }
  }

  const queuedFiles = fileList.slice(0, availableSlots)
  const supabase = createClient()
  const added: DiarioObrasFoto[] = []
  let failed = Math.max(0, fileList.length - queuedFiles.length)
  let lastError = failed > 0 ? `Máximo de ${MAX_FOTOS} fotos por diário` : ""

  for (const [index, file] of queuedFiles.entries()) {
    onProgress?.({ current: index + 1, total: queuedFiles.length, fileName: file.name })

    const validationError = validateDiarioFotoFile(file)
    if (validationError) {
      failed += 1
      lastError = validationError
      continue
    }

    const storagePath = createDiarioFotoPath(diarioId, file)
    const { error: uploadError } = await supabase.storage
      .from(DIARIO_BUCKET)
      .upload(storagePath, file, { contentType: file.type, upsert: false })

    if (uploadError) {
      failed += 1
      lastError = uploadError.message || "Erro ao enviar foto"
      continue
    }

    const registerResult = await registerDiarioFotoAction(diarioId, storagePath)
    if (!registerResult.ok || !registerResult.data) {
      failed += 1
      lastError = registerResult.error || "Erro ao registrar foto"
      continue
    }

    added.push(registerResult.data as DiarioObrasFoto)
  }

  onProgress?.(null)

  return {
    ok: failed === 0,
    added,
    failed,
    lastError,
  }
}