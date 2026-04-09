"use client"

import { useMemo, type ReactNode } from "react"
import { PackageMinus, Plus, RotateCcw, Calendar, Package, Boxes, type LucideIcon } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { MaterialFiltersState, MaterialGrupo, PermissoesUsuario } from "@/lib/types"
import { MONTHS } from "@/components/almoxarifado/types/almoxarifadoTypes"
import { ClientSearchInput } from "@/components/almoxarifado/client-search-input"

interface SaidaHeaderProps {
  totalSaidas: number
  searchTerm: string
  setSearchTerm: (term: string) => void
  filters: MaterialFiltersState
  updateFilter: (key: keyof MaterialFiltersState, value: string) => void
  clearFilters: () => void
  availableYears: number[]
  availableMonth: number[]
  groups: MaterialGrupo[]
  materiais: { id: string; nome: string; grupo_id: string }[]
  clientes: { id: string; nome: string; codigo?: number }[]
  onNewSaida: () => void
  userPermissions: Partial<PermissoesUsuario>
  userRole: string
}

export function SaidaHeader({
  totalSaidas,
  searchTerm,
  setSearchTerm,
  filters,
  updateFilter,
  clearFilters,
  availableYears,
  availableMonth,
  groups,
  materiais,
  clientes,
  onNewSaida,
  userPermissions,
  userRole,
}: SaidaHeaderProps) {
  const activeFiltersCount = Object.values(filters).filter(v => v !== "all").length

  const canCreate = userRole === "admin" || userPermissions?.estoque?.view
  const selectedGrupoId = filters.grupo === "all" ? "" : filters.grupo

  const grupos = useMemo(
    () => [...groups].sort((a, b) => a.nome.localeCompare(b.nome)),
    [groups]
  )

  const filteredMateriais = useMemo(() => {
    if (!selectedGrupoId) return []
    return materiais
      .filter((material) => material.grupo_id === selectedGrupoId)
      .sort((a, b) => a.nome.localeCompare(b.nome))
  }, [materiais, selectedGrupoId])

  return (
    <div className="bg-[#1E1E1E] border-b-2 sm:border-b-4 border-[#F5C800] shadow-lg">
      <div className="px-3 sm:px-6 lg:px-8 py-4">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight uppercase flex items-center gap-3">
            <PackageMinus className="h-6 w-6 text-[#F5C800]" />
            Saída de Material
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
          <div className="flex items-center bg-gray-800/50 rounded-lg p-1 border border-gray-700">
            <Badge variant="outline" className="border-0 bg-transparent text-red-500 hover:bg-transparent font-bold">
              <PackageMinus className="h-3 w-3 mr-1.5" /> Saídas
            </Badge>
            <div className="h-4 w-[1px] bg-gray-600 mx-1"></div>
            <Badge className="bg-red-600/20 text-red-400 hover:bg-red-600/30 border-0 mr-1">
              {totalSaidas} registros
            </Badge>
          </div>
        </div>

        <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700 space-y-3">
          {/* LINHA 1: Busca e Botões */}
          <div className="flex flex-col sm:flex-row gap-3">
            <ClientSearchInput value={searchTerm} onChange={setSearchTerm} clients={clientes} />
            <div className="flex gap-2 w-full sm:w-auto">
              {canCreate && (
                <Button
                  onClick={onNewSaida}
                  className="h-10 bg-[#F5C800] sm:w-[180px] hover:bg-[#F5C800]/90 text-[#1E1E1E] font-bold px-4 shadow-sm justify-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Saída
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
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">
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
              value={filters.grupo}
              onChange={(v: string) => {
                updateFilter("grupo", v)
                updateFilter("material", "all")
              }}
              placeholder="Grupo"
              icon={Boxes}
            >
              <SelectItem value="all">Todos Grupos</SelectItem>
              {grupos.map((grupo) => (
                <SelectItem key={grupo.id} value={grupo.id}>{grupo.nome}</SelectItem>
              ))}
            </FilterSelect>
            <FilterSelect
              value={filters.material}
              onChange={(v: string) => updateFilter("material", v)}
              placeholder={selectedGrupoId ? "Material" : "Escolha um grupo primeiro"}
              icon={Package}
              disabled={!selectedGrupoId}
            >
              <SelectItem value="all">Todos Materiais</SelectItem>
              {filteredMateriais.map((m) => (
                <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>
              ))}
            </FilterSelect>
          </div>
        </div>
      </div>
    </div>
  )
}

interface FilterSelectProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
  icon: LucideIcon
  children: ReactNode
  disabled?: boolean
}

function FilterSelect({ value, onChange, placeholder, icon: Icon, children, disabled = false }: FilterSelectProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="bg-gray-700/50 border-gray-600 text-gray-200 min-h-10 h-auto w-full px-3 py-2 text-sm">
        <div className="flex min-w-0 items-start w-full gap-2">
          <Icon className="mt-0.5 h-3 w-3 text-[#F5C800] shrink-0" />
          <span className="min-w-0 flex-1 whitespace-normal break-words text-left leading-tight">
            <SelectValue placeholder={placeholder} />
          </span>
        </div>
      </SelectTrigger>
      <SelectContent>{children}</SelectContent>
    </Select>
  )
}
