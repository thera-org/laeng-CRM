"use client"

import type { ReactNode } from "react"
import type { MaterialCatalogFiltersState } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Boxes, Layers3, Package, Plus, RotateCcw } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface GestaoHeaderProps {
  totalMateriais: number
  filters: MaterialCatalogFiltersState
  updateFilter: (key: keyof MaterialCatalogFiltersState, value: string) => void
  clearFilters: () => void
  classes: { id: string; nome: string }[]
  groups: { id: string; nome: string }[]
  onNewMaterial: () => void
  onNewClasse: () => void
  onNewGrupo: () => void
}

export function GestaoHeader({
  totalMateriais,
  filters,
  updateFilter,
  clearFilters,
  classes,
  groups,
  onNewMaterial,
  onNewClasse,
  onNewGrupo,
}: GestaoHeaderProps) {
  const activeFiltersCount = Object.values(filters).filter((value) => value !== "all").length

  return (
    <div className="bg-[#1E1E1E] border-b-2 sm:border-b-4 border-[#F5C800] shadow-lg">
      <div className="px-3 sm:px-6 lg:px-8 py-4">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight uppercase flex items-center gap-3">
            <Package className="h-6 w-6 text-[#F5C800]" />
            Gestão de Materiais
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
          <div className="flex items-center bg-gray-800/50 rounded-lg p-1 border border-gray-700">
            <Badge variant="outline" className="border-0 bg-transparent text-[#F5C800] hover:bg-transparent font-bold">
              <Package className="h-3 w-3 mr-1.5" /> Materiais
            </Badge>
            <div className="h-4 w-[1px] bg-gray-600 mx-1"></div>
            <Badge className="bg-[#F5C800]/20 text-[#F5C800] hover:bg-[#F5C800]/30 border-0 mr-1">
              {totalMateriais} registros
            </Badge>
          </div>
        </div>

        <div className="bg-black-800/30 rounded-lg p-3 border border-gray-700 space-y-3">
          <div className="flex flex-col lg:flex-row gap-2">
            <Button
              onClick={onNewMaterial}
              className="h-10 bg-[#F5C800] hover:bg-[#F5C800]/90 text-[#1E1E1E] font-bold px-4 shadow-sm justify-center lg:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Material
            </Button>
            <Button
              onClick={onNewClasse}
              className="h-10 bg-[#1E1E1E] text-white hover:bg-[#333] font-bold px-4 border border-[#F5C800] justify-center lg:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Classe
            </Button>
            <Button
              onClick={onNewGrupo}
              className="h-10 bg-[#1E1E1E] text-white hover:bg-[#333] font-bold px-4 border border-[#F5C800] justify-center lg:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Grupo
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

          <div className="grid grid-cols-2 gap-2 w-full max-w-[230px]">
            <FilterSelect
              value={filters.classe}
              onChange={(value: string) => updateFilter("classe", value)}
              placeholder="Classe"
              icon={Layers3}
            >
              <SelectItem value="all">Todas Classes</SelectItem>
              {classes.map((materialClass) => (
                <SelectItem key={materialClass.id} value={materialClass.id}>{materialClass.nome}</SelectItem>
              ))}
            </FilterSelect>

            <FilterSelect
              value={filters.grupo}
              onChange={(value: string) => updateFilter("grupo", value)}
              placeholder="Grupo"
              icon={Boxes}
            >
              <SelectItem value="all">Todos Grupos</SelectItem>
              {groups.map((group) => (
                <SelectItem key={group.id} value={group.id}>{group.nome}</SelectItem>
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
