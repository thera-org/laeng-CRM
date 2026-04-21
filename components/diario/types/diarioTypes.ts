import type { Clima, DiarioClimaPorTurno, Turno } from "@/lib/types"

export const DIARIO_BUCKET = "diario-imagens"
export const MAX_FOTOS = 12
export const MAX_FOTO_BYTES = 50 * 1024 * 1024 // 50 MB
export const ALLOWED_FOTO_MIMES = ["image/jpeg", "image/png"] as const
export const MAX_ATIVIDADE_LEN = 2000

export const TURNOS: { value: Turno; label: string }[] = [
  { value: "manha", label: "Manhã" },
  { value: "tarde", label: "Tarde" },
]

export function getVisibleClimaPorTurno(value?: DiarioClimaPorTurno | null): DiarioClimaPorTurno {
  const next: DiarioClimaPorTurno = {}

  for (const { value: turno } of TURNOS) {
    if (Object.prototype.hasOwnProperty.call(value ?? {}, turno)) {
      next[turno] = value?.[turno] ?? null
    }
  }

  return next
}

export function toClimaPorTurnoPayload(value?: DiarioClimaPorTurno | null): DiarioClimaPorTurno {
  return {
    ...getVisibleClimaPorTurno(value),
    noite: null,
  }
}

// Icon names from lucide-react. Components import the actual icon by key.
export const CLIMAS: { value: Clima; label: string; icon: "Sun" | "CloudSun" | "CloudRain" | "CloudLightning" }[] = [
  { value: "sol", label: "Sol", icon: "Sun" },
  { value: "nublado", label: "Nublado", icon: "CloudSun" },
  { value: "chuva", label: "Chuva", icon: "CloudRain" },
  { value: "impraticavel", label: "Impraticável", icon: "CloudLightning" },
]

export const COLABORADOR_ROLES: { key: keyof import("@/lib/types").DiarioColaboradores; label: string }[] = [
  { key: "pedreiro", label: "Pedreiro" },
  { key: "ajudante", label: "Ajudante" },
  { key: "gesseiro", label: "Gesseiro" },
  { key: "eletricista", label: "Eletricista" },
  { key: "pintor", label: "Pintor" },
]

export interface ProgressoItem {
  key: string
  label: string
}

export const PROGRESSO_ITEMS: ProgressoItem[] = [
  { key: "infraestrutura", label: "INFRAESTRUTURA" },
  { key: "instalacao_sanitaria_casa", label: "INSTALAÇÃO SANITÁRIA (CASA)" },
  { key: "pisos_casa", label: "PISOS (CASA)" },
  { key: "impermeabilizacao_casa", label: "IMPERMEABILIZAÇÃO (CASA)" },
  { key: "supraestrutura", label: "SUPRAESTRUTURA" },
  { key: "alvenaria", label: "ALVENARIA" },
  { key: "viga_aerea", label: "VIGA AÉREA" },
  { key: "laje", label: "LAJE" },
  { key: "chapisco", label: "CHAPISCO" },
  { key: "instalacao_eletrica_inicial", label: "INSTALAÇÃO ELÉTRICA - INICIAL" },
  { key: "instalacao_hidraulica_casa", label: "INSTALAÇÃO HIDRÁULICA (CASA)" },
  { key: "revestimento_de_gesso", label: "REVESTIMENTO DE GESSO" },
  { key: "forro_de_gesso", label: "FORRO DE GESSO" },
  { key: "coberta", label: "COBERTA" },
  { key: "instalacao_hidraulica_coberta", label: "INSTALAÇÃO HIDRÁULICA (COBERTA)" },
  { key: "impermeabilizacao_coberta", label: "IMPERMEABILIZAÇÃO (COBERTA)" },
  { key: "instalacao_pluvial_corredor", label: "INSTALAÇÃO PLUVIAL (CORREDOR)" },
  { key: "instalacao_sanitaria_corredor", label: "INSTALAÇÃO SANITÁRIA (CORREDOR)" },
  { key: "pisos_corredor", label: "PISOS (CORREDOR)" },
  { key: "reboco_parcial", label: "REBOCO - PARCIAL" },
  { key: "fossa_septica", label: "FOSSA SÉPTICA" },
  { key: "pintura_inicial", label: "PINTURA - INICIAL" },
  { key: "ceramica", label: "CERÂMICA" },
  { key: "janelas", label: "JANELAS" },
  { key: "pintura_parcial", label: "PINTURA - PARCIAL" },
  { key: "marmore", label: "MÁRMORE" },
  { key: "esquadrias_de_vidro", label: "ESQUADRIAS DE VIDRO" },
  { key: "equipamentos", label: "EQUIPAMENTOS" },
  { key: "calcada", label: "CALÇADA" },
  { key: "instalacao_eletrica_final", label: "INSTALAÇÃO ELETRICA - FINAL" },
  { key: "pintura_final", label: "PINTURA - FINAL" },
  { key: "limpeza_final", label: "LIMPEZA - FINAL" },
]

export const TURNO_LABEL: Record<Turno, string> = {
  manha: "Manhã",
  tarde: "Tarde",
  noite: "Noite",
}

export const CLIMA_LABEL: Record<Clima, string> = CLIMAS.reduce(
  (acc, c) => ({ ...acc, [c.value]: c.label }),
  {} as Record<Clima, string>
)
