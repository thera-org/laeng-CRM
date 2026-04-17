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
import type { PlanejamentoComCliente, PlanejamentoFiltersState } from "@/lib/types"

const today = new Date()

export const INITIAL_PLANEJAMENTO_FILTERS: PlanejamentoFiltersState = {
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

  return eachWeekOfInterval({ start, end }, { weekStartsOn: 0 }).map((weekStart) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 })
    const weekIndex = getWeek(weekStart, { weekStartsOn: 0 })
    return {
      value: String(weekIndex),
      label: `Semana ${format(weekStart, "dd/MM", { locale: ptBR })} - ${format(weekEnd, "dd/MM", { locale: ptBR })}`,
    }
  })
}

export function getAvailableYears(plans: PlanejamentoComCliente[]): number[] {
  const years = new Set(
    plans.map((p) => (p.data_inicio ? getYear(parseISO(p.data_inicio)) : new Date().getFullYear()))
  )
  return Array.from(years).sort((a, b) => b - a)
}

export function getAvailableMonth(plans: PlanejamentoComCliente[]): number[] {
  const months = new Set(
    plans.map((p) => (p.data_inicio ? getMonth(parseISO(p.data_inicio)) : new Date().getMonth()))
  )
  return Array.from(months).sort((a, b) => a - b)
}

export function filterPlanejamentos(
  plans: PlanejamentoComCliente[],
  filters: PlanejamentoFiltersState,
  searchTerm: string
): PlanejamentoComCliente[] {
  const term = searchTerm.trim().toLowerCase()
  return plans.filter((p) => {
    if (term) {
      const matches =
        (p.cliente_nome?.toLowerCase() || "").includes(term) ||
        (p.responsavel?.toLowerCase() || "").includes(term) ||
        String(p.codigo || "").includes(term)
      if (!matches) return false
    }
    if (!p.data_inicio) {
      return filters.year === "all" && filters.month === "all" && filters.week === "all"
    }
    const date = parseISO(p.data_inicio)
    if (filters.year !== "all" && getYear(date) !== parseInt(filters.year)) return false
    if (filters.month !== "all" && getMonth(date) !== parseInt(filters.month)) return false
    if (filters.week !== "all" && getWeek(date, { weekStartsOn: 0 }) !== parseInt(filters.week)) return false
    return true
  })
}
