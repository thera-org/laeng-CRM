"use client"

import { Input } from "@/components/ui/input"
import { Search, Wallet, TrendingUp, TrendingDown, LayoutDashboard, CheckCircle2, Clock, Calendar, RotateCcw, Layers, Plus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/components/pagamentos/libs/pagamentos-financial"
import type { FinancialMetrics, PaymentFiltersState } from "@/lib/types"
import { MONTHS } from "./types/pagamentosTypes"

interface ReceitasHeaderProps {
  metrics: FinancialMetrics
  searchTerm: string
  setSearchTerm: (term: string) => void
  filters: PaymentFiltersState
  updateFilter: (key: keyof PaymentFiltersState, value: string) => void
  clearFilters: () => void
  availableYears: number[]
  availableMonth: number[]
  onNewPayment: () => void
}

export function ReceitasHeader({
  metrics,
  searchTerm,
  setSearchTerm,
  filters,
  updateFilter,
  clearFilters,
  availableYears,
  availableMonth,
  onNewPayment,
}: ReceitasHeaderProps) {

  const activeFiltersCount = Object.values(filters).filter(v => v !== 'all').length

  return (
    <div className="bg-[#1E1E1E] border-b-2 sm:border-b-4 border-[#F5C800] shadow-lg">
      <div className="px-3 sm:px-6 lg:px-8 py-4">

        {/* Cabeçalho e Métricas*/}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight uppercase flex items-center gap-3">
            <Wallet className="h-6 w-6 text-[#F5C800]" />
            Gestão de RECEITAS
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">

          <div className="flex items-center bg-gray-800/50 rounded-lg p-1 border border-gray-700">
            <Badge variant="outline" className="border-0 bg-transparent text-green-500 hover:bg-transparent font-bold">
              <TrendingUp className="h-3 w-3 mr-1.5" /> Receitas
            </Badge>
            <div className="h-4 w-[1px] bg-gray-600 mx-1"></div>
            <Badge className="bg-green-600/20 text-green-400 hover:bg-green-600/30 border-0 mr-1">
              <CheckCircle2 className="h-3 w-3 mr-1" /> {formatCurrency(metrics.receitaTotal)}
            </Badge>
          </div>
          <span className="text-gray-500 text-xs font-medium whitespace-nowrap ml-auto sm:ml-2">
            {metrics.receitaCount} lançamentos
          </span>
        </div>

        {/* --- ÁREA DE CONTROLES --- */}
        <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700 space-y-3">

          {/* LINHA 1: Busca e Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Busca ocupa todo o espaço disponível */}
            <div className="flex-1 relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#F5C800]" />
              <Input
                placeholder="Buscar por cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 bg-white border-0 text-gray-900 placeholder:text-gray-500 rounded-md shadow-sm w-full"
              />
            </div>

            {/* Botões ficam à direita */}
            <div className="flex gap-2 w-full sm:w-auto">

              <Button
                onClick={onNewPayment}
                className="h-10 bg-[#F5C800] sm:w-[100px] hover:bg-[#F5C800]/90 text-[#1E1E1E] font-bold px-4 shadow-sm">
                <Plus className="h-4 w-4 mr-2" />Novo
              </Button>

              {activeFiltersCount > 0 && (
                <Button variant="destructive" onClick={clearFilters} size="icon" className="h-10 w-10 shrink-0" title="Limpar Filtros">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* LINHA 2: Grid de Filtros (Abaixo da busca) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">
            <FilterSelect
              value={filters.month}
              onChange={(v: string) => {
                updateFilter('month', v);
              }}
              placeholder="Mês"
              icon={Calendar}
            >
              <SelectItem value="all">Todos Meses</SelectItem>
              {availableMonth.map(monthIndex => (
                <SelectItem key={monthIndex} value={String(monthIndex)}>
                  {MONTHS[monthIndex]?.label || monthIndex}
                </SelectItem>
              ))}
            </FilterSelect>

            <FilterSelect value={filters.year} onChange={(v: string) => updateFilter('year', v)} placeholder="Ano" icon={Calendar}>
              <SelectItem value="all">Todos Anos</SelectItem>
              {availableYears.map(year => <SelectItem key={year} value={String(year)}>{year}</SelectItem>)}
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
      <SelectContent>
        {children}
      </SelectContent>
    </Select>
  )
}