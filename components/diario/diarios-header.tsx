"use client"

import { Input } from "@/components/ui/input"
import { Search, ClipboardList, Calendar, RotateCcw, Plus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useMemo } from "react"
import { getWeeksOptions } from "./libs/diario-filter-logic"
import { MONTHS } from "@/components/pagamentos/types/pagamentosTypes"
import type { DiarioFiltersState } from "@/lib/types"

interface DiariosHeaderProps {
  total: number
  searchTerm: string
  setSearchTerm: (term: string) => void
  filters: DiarioFiltersState
  updateFilter: (key: keyof DiarioFiltersState, value: string) => void
  clearFilters: () => void
  availableYears: number[]
  availableMonth: number[]
  onNew: () => void
}

export function DiariosHeader({
  total,
  searchTerm,
  setSearchTerm,
  filters,
  updateFilter,
  clearFilters,
  availableYears,
  availableMonth,
  onNew,
}: DiariosHeaderProps) {
  const activeFiltersCount = Object.entries(filters).filter(([, v]) => v !== "all").length

  const isWeekEnabled = filters.year !== "all" && filters.month !== "all"

  const weekOptions = useMemo(
    () => getWeeksOptions(filters.year, filters.month),
    [filters.year, filters.month]
  )

  return (
    <div className="bg-[#1E1E1E] border-b-2 sm:border-b-4 border-[#F5C800] shadow-lg">
      <div className="px-3 sm:px-6 lg:px-8 py-4">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight uppercase flex items-center gap-3">
            <ClipboardList className="h-6 w-6 text-[#F5C800]" />
            Diário de Obras
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
          <Badge className="bg-[#F5C800]/20 text-[#F5C800] hover:bg-[#F5C800]/30 border-0">
            {total} {total === 1 ? "diário" : "diários"}
          </Badge>
        </div>

        <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#F5C800]" />
              <Input
                placeholder="Buscar por cliente, responsável ou código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 bg-white border-0 text-gray-900 placeholder:text-gray-500 rounded-md shadow-sm w-full"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                onClick={onNew}
                className="h-10 bg-[#F5C800] sm:w-[100px] hover:bg-[#F5C800]/90 text-[#1E1E1E] font-bold px-4 shadow-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo
              </Button>
              {activeFiltersCount > 0 && (
                <Button
                  variant="destructive"
                  onClick={clearFilters}
                  size="icon"
                  className="h-10 w-10 shrink-0"
                  title="Limpar Filtros"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className={!isWeekEnabled ? "opacity-50 pointer-events-none" : ""}>
              <FilterSelect
                value={filters.week}
                onChange={(v: string) => updateFilter("week", v)}
                placeholder="Semana"
                icon={Calendar}
              >
                <SelectItem value="all">Todas Semanas</SelectItem>
                {weekOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </FilterSelect>
            </div>

            <FilterSelect
              value={filters.month}
              onChange={(v: string) => {
                updateFilter("month", v)
                updateFilter("week", "all")
              }}
              placeholder="Mês"
              icon={Calendar}
            >
              <SelectItem value="all">Todos Meses</SelectItem>
              {availableMonth.map((m) => (
                <SelectItem key={m} value={String(m)}>
                  {MONTHS[m]?.label || m}
                </SelectItem>
              ))}
            </FilterSelect>

            <FilterSelect
              value={filters.year}
              onChange={(v: string) => updateFilter("year", v)}
              placeholder="Ano"
              icon={Calendar}
            >
              <SelectItem value="all">Todos Anos</SelectItem>
              {availableYears.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </FilterSelect>
          </div>
        </div>
      </div>
    </div>
  )
}

function FilterSelect({ value, onChange, placeholder, icon: Icon, children }: any) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="bg-gray-700/50 border-gray-600 text-gray-200 h-10 text-xs w-full px-2">
        <div className="flex items-center truncate">
          <Icon className="h-3 w-3 mr-2 text-[#F5C800] shrink-0" />
          <span className="truncate block text-left">
            <SelectValue placeholder={placeholder} />
          </span>
        </div>
      </SelectTrigger>
      <SelectContent>{children}</SelectContent>
    </Select>
  )
}
