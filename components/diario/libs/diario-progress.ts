import { PROGRESSO_ITEMS } from "../types/diarioTypes"
import type { DiarioColaboradores, DiarioProgresso } from "@/lib/types"

export function calcDiarioProgressPct(progresso: DiarioProgresso | null | undefined): number {
  if (!progresso || PROGRESSO_ITEMS.length === 0) return 0
  const total = PROGRESSO_ITEMS.length
  const done = PROGRESSO_ITEMS.reduce((acc, item) => acc + (progresso[item.key] ? 1 : 0), 0)
  return Math.round((done / total) * 100)
}

export function totalColaboradores(c: DiarioColaboradores | null | undefined): number {
  if (!c) return 0
  return Object.values(c).reduce((acc, n) => acc + (Number(n) || 0), 0)
}
