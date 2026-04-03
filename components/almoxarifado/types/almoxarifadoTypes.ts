export const UNIDADES_MEDIDA = [
  { value: "peca", label: "Peca" },
  { value: "metro", label: "Metro" },
  { value: "litro", label: "Litro" },
  { value: "kg", label: "Kg" },
] as const

export const UNIDADE_LABEL: Record<string, string> = {
  peca: "Peca",
  metro: "Metro",
  litro: "Litro",
  kg: "Kg",
}

export const MONTHS = [
  { value: "0", label: "Janeiro" },
  { value: "1", label: "Fevereiro" },
  { value: "2", label: "Marco" },
  { value: "3", label: "Abril" },
  { value: "4", label: "Maio" },
  { value: "5", label: "Junho" },
  { value: "6", label: "Julho" },
  { value: "7", label: "Agosto" },
  { value: "8", label: "Setembro" },
  { value: "9", label: "Outubro" },
  { value: "10", label: "Novembro" },
  { value: "11", label: "Dezembro" },
]
