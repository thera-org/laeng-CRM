import {
  eachWeekOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getMonth,
  getWeek,
  getYear,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns"
import { ptBR } from "date-fns/locale"
import type { DiarioComCliente, DiarioFiltersState } from "@/lib/types"

const today = new Date()

export const INITIAL_DIARIO_FILTERS: DiarioFiltersState = {
  month: String(getMonth(today)),
  year: String(getYear(today)),
  week: "all",
}

export function getWeeksOptions(yearStr: string, monthStr: string): { value: string; label: string }[] {
  if (yearStr === "all" || monthStr === "all") return []
  const year = parseInt(yearStr)
  const month = parseInt(monthStr)
  const monthDate = new Date(year, month)
  const start = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 0 })
  const end = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 0 })

  const weeks = eachWeekOfInterval({ start, end }, { weekStartsOn: 0 })
  return weeks.map((weekStart) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 })
    const weekIndex = getWeek(weekStart, { weekStartsOn: 0 })
    return {
      value: String(weekIndex),
      label: `Semana ${format(weekStart, "dd/MM", { locale: ptBR })} - ${format(weekEnd, "dd/MM", { locale: ptBR })}`,
    }
  })
}

export function getAvailableYears(diarios: DiarioComCliente[]): number[] {
  const years = new Set(
    diarios.map((d) => (d.data ? getYear(parseISO(d.data)) : new Date().getFullYear()))
  )
  return Array.from(years).sort((a, b) => b - a)
}

export function getAvailableMonth(diarios: DiarioComCliente[]): number[] {
  const months = new Set(
    diarios.map((d) => (d.data ? getMonth(parseISO(d.data)) : new Date().getMonth()))
  )
  return Array.from(months).sort((a, b) => a - b)
}

export function getAvailableWeek(diarios: DiarioComCliente[]): number[] {
  const weeks = new Set(
    diarios.map((d) => (d.data ? getWeek(parseISO(d.data), { weekStartsOn: 0 }) : 1))
  )
  return Array.from(weeks).sort((a, b) => a - b)
}

export function filterDiarios(
  diarios: DiarioComCliente[],
  filters: DiarioFiltersState,
  searchTerm: string
): DiarioComCliente[] {
  const term = searchTerm.trim().toLowerCase()
  return diarios.filter((d) => {
    if (term) {
      const matches =
        (d.cliente_nome?.toLowerCase() || "").includes(term) ||
        (d.responsavel?.toLowerCase() || "").includes(term) ||
        String(d.codigo || "").includes(term)
      if (!matches) return false
    }

    if (!d.data) return filters.year === "all" && filters.month === "all" && filters.week === "all"

    const date = parseISO(d.data)
    if (filters.year !== "all" && getYear(date) !== parseInt(filters.year)) return false
    if (filters.month !== "all" && getMonth(date) !== parseInt(filters.month)) return false
    if (filters.week !== "all") {
      if (getWeek(date, { weekStartsOn: 0 }) !== parseInt(filters.week)) return false
    }
    return true
  })
}
