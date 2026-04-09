import { eachWeekOfInterval, endOfMonth, endOfWeek, format, getMonth, getWeek, getYear, parseISO, startOfMonth, startOfWeek } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { MaterialEntrada, MaterialSaida, MaterialFiltersState } from "@/lib/types"

const today = new Date()

export const INITIAL_MATERIAL_FILTERS: MaterialFiltersState = {
  material: "all",
  grupo: "all",
  month: String(getMonth(today)),
  year: String(getYear(today)),
  week: "all",
}

export function getWeeksOptions(yearStr: string, monthStr: string): { value: string; label: string }[] {
  if (yearStr === "all" || monthStr === "all") return []

  const year = parseInt(yearStr)
  const month = parseInt(monthStr)
  const monthDate = new Date(year, month)
  const startCalendar = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 0 })
  const endCalendar = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 0 })

  const weeks = eachWeekOfInterval(
    { start: startCalendar, end: endCalendar },
    { weekStartsOn: 0 }
  )

  return weeks.map((weekStart) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 })
    const weekIndex = getWeek(weekStart, { weekStartsOn: 0 })
    const startLabel = format(weekStart, "dd/MM", { locale: ptBR })
    const endLabel = format(weekEnd, "dd/MM", { locale: ptBR })
    return {
      value: String(weekIndex),
      label: `Semana ${startLabel} - ${endLabel}`,
    }
  })
}

export function getAvailableYears(items: (MaterialEntrada | MaterialSaida)[]): number[] {
  const years = new Set(
    items.map((i) => (i.data ? getYear(parseISO(i.data)) : new Date().getFullYear()))
  )
  return Array.from(years).sort((a, b) => b - a)
}

export function getAvailableMonth(items: (MaterialEntrada | MaterialSaida)[]): number[] {
  const months = new Set(
    items.map((i) => (i.data ? getMonth(parseISO(i.data)) : new Date().getMonth()))
  )
  return Array.from(months).sort((a, b) => a - b)
}

export function filterMaterialItems<T extends MaterialEntrada | MaterialSaida>(
  items: T[],
  filters: MaterialFiltersState,
  searchTerm: string
): T[] {
  return items.filter((item) => {
    return (
      matchesMaterial(item, filters) &&
      matchesDate(item, filters) &&
      matchesSearch(item, searchTerm)
    )
  })
}

function matchesSearch(item: MaterialEntrada | MaterialSaida, searchTerm: string): boolean {
  if (!searchTerm) return true
  const term = searchTerm.toLowerCase()
  return (
    (item.cliente_nome?.toLowerCase() || "").includes(term) ||
    (item.material_nome?.toLowerCase() || "").includes(term) ||
    (item.observacao?.toLowerCase() || "").includes(term)
  )
}

function matchesMaterial(item: MaterialEntrada | MaterialSaida, filters: MaterialFiltersState): boolean {
  if (filters.material !== "all" && item.material_id !== filters.material) return false
  return true
}

function matchesDate(item: MaterialEntrada | MaterialSaida, filters: MaterialFiltersState): boolean {
  const hasYearFilter = filters.year !== "all"
  const hasMonthFilter = filters.month !== "all"
  const hasWeekFilter = filters.week !== "all"

  if (!hasYearFilter && !hasMonthFilter && !hasWeekFilter) return true
  if (!item.data) return false

  const dateObj = parseISO(item.data)
  const itemYear = getYear(dateObj)

  if (hasYearFilter && itemYear !== parseInt(filters.year)) return false

  if (hasWeekFilter) {
    const itemWeek = getWeek(dateObj, { weekStartsOn: 0 })
    return itemWeek === parseInt(filters.week)
  }

  if (hasMonthFilter && getMonth(dateObj) !== parseInt(filters.month)) return false

  return true
}
