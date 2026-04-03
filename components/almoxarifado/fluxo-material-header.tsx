"use client"

import { Input } from "@/components/ui/input"
import { Search, ArrowLeftRight, RotateCcw, Calendar, Package, Users } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface FluxoMaterialHeaderProps {
  totalMateriais: number
  searchTerm: string
  setSearchTerm: (term: string) => void
  materialFilter: string
  setMaterialFilter: (v: string) => void
  clienteFilter: string
  setClienteFilter: (v: string) => void
  dateFrom: string
  setDateFrom: (v: string) => void
  dateTo: string
  setDateTo: (v: string) => void
  clearFilters: () => void
  materiais: { id: string; nome: string }[]
  clientes: { id: string; nome: string }[]
}

export function FluxoMaterialHeader({
  totalMateriais,
  searchTerm,
  setSearchTerm,
  materialFilter,
  setMaterialFilter,
  clienteFilter,
  setClienteFilter,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  clearFilters,
  materiais,
  clientes,
}: FluxoMaterialHeaderProps) {
  const hasFilters = materialFilter !== "all" || clienteFilter !== "all" || dateFrom || dateTo || searchTerm

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
            <div className="flex-1 relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#F5C800]" />
              <Input
                placeholder="Buscar por material..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 bg-white border-0 text-gray-900 placeholder:text-gray-500 rounded-md shadow-sm w-full"
              />
            </div>
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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
            <FilterSelect
              value={clienteFilter}
              onChange={setClienteFilter}
              placeholder="Cliente/Obra"
              icon={Users}
            >
              <SelectItem value="all">Todos Clientes</SelectItem>
              {clientes.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
              ))}
            </FilterSelect>
            <div>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-gray-700/50 border-gray-600 text-gray-200 h-10 text-xs"
                placeholder="Data inicio"
              />
            </div>
            <div>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-gray-700/50 border-gray-600 text-gray-200 h-10 text-xs"
                placeholder="Data fim"
              />
            </div>
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
