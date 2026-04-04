"use client"

import { Input } from "@/components/ui/input"
import { Search, PackagePlus, Plus, RotateCcw, Calendar, Package } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { MaterialFiltersState } from "@/lib/types"
import { MONTHS } from "@/components/almoxarifado/types/almoxarifadoTypes"

interface EntradaHeaderProps {
  totalEntradas: number
  searchTerm: string
  setSearchTerm: (term: string) => void
  filters: MaterialFiltersState
  updateFilter: (key: keyof MaterialFiltersState, value: string) => void
  clearFilters: () => void
  availableYears: number[]
  availableMonth: number[]
  materiais: { id: string; nome: string }[]
  onNewEntrada: () => void
  userPermissions: Record<string, any>
}

export function EntradaHeader({
  totalEntradas,
  searchTerm,
  setSearchTerm,
  filters,
  updateFilter,
  clearFilters,
  availableYears,
  availableMonth,
  materiais,
  onNewEntrada,
  userPermissions,
}: EntradaHeaderProps) {
  const activeFiltersCount = Object.values(filters).filter(v => v !== "all").length

  const canCreate = userPermissions?.["material-entrada"]?.create

  return (
    <div className="bg-[#1E1E1E] border-b-2 sm:border-b-4 border-[#F5C800] shadow-lg">
      <div className="px-3 sm:px-6 lg:px-8 py-4">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight uppercase flex items-center gap-3">
            <PackagePlus className="h-6 w-6 text-[#F5C800]" />
            Entrada de Material
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
          <div className="flex items-center bg-gray-800/50 rounded-lg p-1 border border-gray-700">
            <Badge variant="outline" className="border-0 bg-transparent text-green-500 hover:bg-transparent font-bold">
              <PackagePlus className="h-3 w-3 mr-1.5" /> Entradas
            </Badge>
            <div className="h-4 w-[1px] bg-gray-600 mx-1"></div>
            <Badge className="bg-green-600/20 text-green-400 hover:bg-green-600/30 border-0 mr-1">
              {totalEntradas} registros
            </Badge>
          </div>
        </div>

        <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700 space-y-3">
          {/* LINHA 1: Busca e Botões */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#F5C800]" />
              <Input
                placeholder="Buscar por cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 bg-white border-0 text-gray-900 placeholder:text-gray-500 rounded-md shadow-sm w-full"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              {canCreate && (
                <Button
                  onClick={onNewEntrada}
                  className="h-10 bg-[#F5C800] sm:w-[180px] hover:bg-[#F5C800]/90 text-[#1E1E1E] font-bold px-4 shadow-sm justify-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Entrada
                </Button>
              )}
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

          {/* LINHA 2: Grid de Filtros */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-2">
            <FilterSelect
              value={filters.month}
              onChange={(v: string) => { updateFilter("month", v); updateFilter("week", "all") }}
              placeholder="Mês"
              icon={Calendar}
            >
              <SelectItem value="all">Todos Meses</SelectItem>
              {availableMonth.map((monthIndex) => (
                <SelectItem key={monthIndex} value={String(monthIndex)}>
                  {MONTHS[monthIndex]?.label || monthIndex}
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
              {availableYears.map((year) => (
                <SelectItem key={year} value={String(year)}>{year}</SelectItem>
              ))}
            </FilterSelect>
            <FilterSelect
              value={filters.material}
              onChange={(v: string) => updateFilter("material", v)}
              placeholder="Material"
              icon={Package}
            >
              <SelectItem value="all">Todos Materiais</SelectItem>
              {materiais.map((m) => (
                <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>
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
