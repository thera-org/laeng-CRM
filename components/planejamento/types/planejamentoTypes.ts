import type { PlanejamentoAtividade } from "@/lib/types"

export const MAX_DESCRICAO_LEN = 500

export function buildEmptyAtividade(planejamento_id: string, codigo: number, ordem: number): PlanejamentoAtividade {
  return {
    id: `tmp-${Math.random().toString(36).slice(2)}`,
    planejamento_id,
    codigo,
    descricao: "",
    realizado: false,
    ordem,
  }
}
