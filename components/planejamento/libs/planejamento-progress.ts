import type { PlanejamentoAtividade } from "@/lib/types"

export function calcPlanejamentoProgressPct(atividades: PlanejamentoAtividade[] | null | undefined): number {
  if (!atividades || atividades.length === 0) return 0
  const total = atividades.length
  const done = atividades.reduce((acc, a) => acc + (a.realizado ? 1 : 0), 0)
  return Math.round((done / total) * 100)
}
