"use client"

import type { ReactNode } from "react"
import { ArrowLeftRight, RotateCcw, Calendar, Package, Boxes, type LucideIcon } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MONTHS } from "@/components/almoxarifado/types/almoxarifadoTypes"
import { ClientSearchInput } from "@/components/almoxarifado/client-search-input"

interface FluxoMaterialHeaderProps {
  totalMateriais: number
  searchTerm: string
  setSearchTerm: (term: string) => void
  materialFilter: string
  setMaterialFilter: (v: string) => void
  classeFilter: string
  setClasseFilter: (v: string) => void
  grupoFilter: string
  setGrupoFilter: (v: string) => void
  monthFilter: string
  setMonthFilter: (v: string) => void
  yearFilter: string
  setYearFilter: (v: string) => void
  clearFilters: () => void
  materiais: { id: string; nome: string }[]
  classes: { id: string; nome: string }[]
  groups: { id: string; nome: string }[]
  clientes: { id: string; nome: string; codigo?: number }[]
  availableYears: number[]
  availableMonth: number[]
}

export function FluxoMaterialHeader({
  totalMateriais,
  searchTerm,
  setSearchTerm,
  materialFilter,
  setMaterialFilter,
  classeFilter,
  setClasseFilter,
  grupoFilter,
  setGrupoFilter,
  monthFilter,
  setMonthFilter,
  yearFilter,
  setYearFilter,
  clearFilters,
  materiais,
  classes,
  groups,
  clientes,
  availableYears,
  availableMonth,
}: FluxoMaterialHeaderProps) {
  const hasFilters =
    materialFilter !== "all" ||
    classeFilter !== "all" ||
    grupoFilter !== "all" ||
    monthFilter !== "all" ||
    yearFilter !== "all" ||
    !!searchTerm

  return (
    <div className="bg-[#1E1E1E] border-b-2 sm:border-b-4 border-[#F5C800] shadow-lg">
      <div className="px-3 sm:px-6 lg:px-8 py-4">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight uppercase flex items-center gap-3">
            <ArrowLeftRight className="h-6 w-6 text-[#F5C800]" />
            Fluxo de Material
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
          <div className="flex items-center bg-gray-800/50 rounded-lg p-1 border border-gray-700">
            <Badge variant="outline" className="border-0 bg-transparent text-[#F5C800] hover:bg-transparent font-bold">
              <Package className="h-3 w-3 mr-1.5" /> Materiais
            </Badge>
            <div className="h-4 w-[1px] bg-gray-600 mx-1"></div>
            <Badge className="bg-[#F5C800]/20 text-[#F5C800] hover:bg-[#F5C800]/30 border-0 mr-1">
              {totalMateriais} ativos
            </Badge>
          </div>
        </div>

        <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <ClientSearchInput value={searchTerm} onChange={setSearchTerm} clients={clientes} />
            <div className="flex gap-2 w-full sm:w-auto">
              {hasFilters && (
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

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-2">
            <FilterSelect
              value={materialFilter}
              onChange={setMaterialFilter}
              placeholder="Material"
              icon={Package}
            >
              <SelectItem value="all">Todos Materiais</SelectItem>
              {materiais.map((m) => (
                <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>
              ))}
            </FilterSelect>
            <FilterSelect value={classeFilter} onChange={setClasseFilter} placeholder="Classe" icon={Boxes}>
              <SelectItem value="all">Todas Classes</SelectItem>
              {classes.map((materialClass) => (
                <SelectItem key={materialClass.id} value={materialClass.id}>{materialClass.nome}</SelectItem>
              ))}
            </FilterSelect>
            <FilterSelect value={grupoFilter} onChange={setGrupoFilter} placeholder="Grupo" icon={Boxes}>
              <SelectItem value="all">Todos Grupos</SelectItem>
              {groups.map((group) => (
                <SelectItem key={group.id} value={group.id}>{group.nome}</SelectItem>
              ))}
            </FilterSelect>
            <FilterSelect value={monthFilter} onChange={setMonthFilter} placeholder="Mês" icon={Calendar}>
              <SelectItem value="all">Todos Meses</SelectItem>
              {availableMonth.map((monthIndex) => (
                <SelectItem key={monthIndex} value={String(monthIndex)}>
                  {MONTHS[monthIndex]?.label || monthIndex}
                </SelectItem>
              ))}
            </FilterSelect>
            <FilterSelect value={yearFilter} onChange={setYearFilter} placeholder="Ano" icon={Calendar}>
              <SelectItem value="all">Todos Anos</SelectItem>
              {availableYears.map((year) => (
                <SelectItem key={year} value={String(year)}>{year}</SelectItem>
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
}

function FilterSelect({ value, onChange, placeholder, icon: Icon, children }: FilterSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="bg-gray-700/50 border-gray-600 text-gray-200 min-h-10 h-auto w-full px-3 py-2 text-sm">
        <div className="flex min-w-0 items-start gap-2 text-left">
          <Icon className="mt-0.5 h-3 w-3 text-[#F5C800] shrink-0" />
          <span className="min-w-0 flex-1 whitespace-normal break-words leading-tight">
            <SelectValue placeholder={placeholder} />
          </span>
        </div>
      </SelectTrigger>
      <SelectContent>{children}</SelectContent>
    </Select>
  )
}
