"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Warehouse, type LucideIcon } from "lucide-react"
import type { FluxoMaterialResumo, MaterialEntrada, MaterialSaida } from "@/lib/types"

const MONTH_LABELS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
]

const CHART_COLORS = {
  entradas: "#22c55e",
  saidas: "#ef4444",
  estoque: "#eab308",
  palette: ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ff7300", "#387908"],
  others: "#94a3b8",
}

const DEFAULT_DISTRIBUTION_ITEMS = 8

interface FluxoMaterialDashboardProps {
  data: FluxoMaterialResumo[]
  entradas: MaterialEntrada[]
  saidas: MaterialSaida[]
  materiais: Array<{ id: string }>
}

export function FluxoMaterialDashboard({ data, entradas, saidas, materiais }: FluxoMaterialDashboardProps) {
  const totalEntradas = data.reduce((sum, d) => sum + d.total_entradas, 0)
  const totalSaidas = data.reduce((sum, d) => sum + d.total_saidas, 0)
  const totalEstoqueAtual = data.reduce((sum, d) => sum + d.estoque_atual, 0)
  const totalMateriaisFiltrados = materiais.length

  const monthlyFlow = useMemo(() => {
    const byMonth = MONTH_LABELS.map((label, index) => ({
      month: label,
      monthIndex: index,
      entradas: 0,
      saidas: 0,
    }))

    entradas.forEach((item) => {
      const month = new Date(item.data).getMonth()
      if (month >= 0) byMonth[month].entradas += Number(item.quantidade || 0)
    })

    saidas.forEach((item) => {
      const month = new Date(item.data).getMonth()
      if (month >= 0) byMonth[month].saidas += Number(item.quantidade || 0)
    })

    return byMonth
  }, [entradas, saidas])

  const categoryBalances = useMemo(() => {
    return [...data].sort((a, b) => b.estoque_atual - a.estoque_atual)
  }, [data])

  const distributionEntradas = useMemo(() => {
    return data
      .filter((item) => item.total_entradas > 0)
      .map((item) => ({ name: item.material_nome, value: item.total_entradas }))
      .sort((a, b) => b.value - a.value)
  }, [data])

  const distributionSaidas = useMemo(() => {
    return data
      .filter((item) => item.total_saidas > 0)
      .map((item) => ({ name: item.material_nome, value: item.total_saidas }))
      .sort((a, b) => b.value - a.value)
  }, [data])

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          title="Total Entradas"
          value={totalEntradas}
          icon={TrendingUp}
          accentClass="border-l-green-500"
          iconClass="text-green-500"
          valueClass="text-green-600"
          description="Volume acumulado de entradas"
        />
        <SummaryCard
          title="Total Saídas"
          value={totalSaidas}
          icon={TrendingDown}
          accentClass="border-l-red-500"
          iconClass="text-red-500"
          valueClass="text-red-600"
          description="Volume acumulado de saídas"
        />
        <SummaryCard
          title="Estoque Atual"
          value={totalEstoqueAtual}
          icon={Warehouse}
          accentClass="border-l-[#F5C800]"
          iconClass="text-[#F5C800]"
          valueClass="text-[#1E1E1E]"
          description="Saldo consolidado em estoque"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-md border-0">
            <CardHeader>
              <CardTitle className="text-lg text-slate-700">Balanço do Período</CardTitle>
              <CardDescription>Resumo consolidado do filtro atual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm items-center border-b pb-2">
                  <span className="text-gray-500">Entradas</span>
                  <span className="font-semibold text-green-600">{formatQuantity(totalEntradas)}</span>
                </div>

                <div className="flex justify-between text-sm items-center border-b pb-2">
                  <span className="text-gray-500">Saídas</span>
                  <span className="font-semibold text-red-600">{formatQuantity(totalSaidas)}</span>
                </div>

                <div className="pt-2 flex justify-between items-center">
                  <span className="font-medium text-gray-900">Estoque Atual</span>
                  <span className={`text-lg font-bold ${totalEstoqueAtual >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatQuantity(totalEstoqueAtual)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md border-0 flex flex-col max-h-[1086px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-slate-700">Balanço por Categoria</CardTitle>
              <CardDescription>Entradas, saídas e saldo por material</CardDescription>
            </CardHeader>
            <CardContent className="overflow-y-auto pr-2 custom-scrollbar space-y-6 pt-2">
              {categoryBalances.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">Sem dados para exibir.</p>
              )}

              {categoryBalances.map((item) => {
                const maxFlow = Math.max(item.total_entradas, item.total_saidas, 1)

                return (
                  <div key={item.material_id} className="space-y-2 border-b border-dashed border-gray-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between items-center mb-1 gap-3">
                      <span className="font-medium text-sm text-slate-700 truncate max-w-[170px]" title={item.material_nome}>
                        {item.material_nome}
                      </span>
                      <span className={`text-xs font-bold ${item.estoque_atual >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {item.estoque_atual > 0 ? "+" : ""}{formatQuantity(item.estoque_atual)}
                      </span>
                    </div>

                    {item.total_entradas > 0 && (
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden flex-1">
                          <div className="h-full bg-green-500/80" style={{ width: `${(item.total_entradas / maxFlow) * 100}%` }} />
                        </div>
                        <span className="text-gray-500 w-16 text-right">{formatQuantity(item.total_entradas)}</span>
                      </div>
                    )}

                    {item.total_saidas > 0 && (
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden flex-1">
                          <div className="h-full bg-red-500/80" style={{ width: `${(item.total_saidas / maxFlow) * 100}%` }} />
                        </div>
                        <span className="text-gray-500 w-16 text-right">{formatQuantity(item.total_saidas)}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-md border-0">
            <CardHeader>
              <CardTitle className="text-lg text-slate-700">Fluxo de Entrada x Saída</CardTitle>
              <CardDescription>Curva mensal consolidada do período filtrado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyFlow} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} interval={0} angle={0} />
                    <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                    <Tooltip formatter={(value: number) => formatQuantity(value)} />
                    <Legend verticalAlign="bottom" height={24} />
                    <Line
                      type="monotone"
                      dataKey="entradas"
                      name="Entradas"
                      stroke={CHART_COLORS.entradas}
                      strokeWidth={3}
                      dot={{ r: 4, fill: CHART_COLORS.entradas }}
                      activeDot={{ r: 6 }}
                      label={{ position: "top", fill: CHART_COLORS.entradas, fontSize: 11 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="saidas"
                      name="Saídas"
                      stroke={CHART_COLORS.saidas}
                      strokeWidth={3}
                      dot={{ r: 4, fill: CHART_COLORS.saidas }}
                      activeDot={{ r: 6 }}
                      label={{ position: "top", fill: CHART_COLORS.saidas, fontSize: 11 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md border-0">
            <CardHeader className="flex flex-row justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg text-slate-700">Distribuição</CardTitle>
                <CardDescription>Participação das movimentações por material</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DistributionChart
                  title="Entradas"
                  titleClass="text-green-600"
                  data={distributionEntradas}
                  emptyText="Sem entradas"
                  totalMateriaisFiltrados={totalMateriaisFiltrados}
                />
                <DistributionChart
                  title="Saídas"
                  titleClass="text-red-600"
                  data={distributionSaidas}
                  emptyText="Sem saídas"
                  totalMateriaisFiltrados={totalMateriaisFiltrados}
                  bordered
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function SummaryCard({
  title,
  value,
  icon: Icon,
  accentClass,
  iconClass,
  valueClass,
  description,
}: {
  title: string
  value: number
  icon: LucideIcon
  accentClass: string
  iconClass: string
  valueClass: string
  description: string
}) {
  return (
    <Card className={`bg-white border-l-4 ${accentClass} shadow-sm`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconClass}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueClass}`}>{formatQuantity(value)}</div>
        <p className="text-xs text-gray-400 mt-1">{description}</p>
      </CardContent>
    </Card>
  )
}

function DistributionChart({
  title,
  titleClass,
  data,
  emptyText,
  totalMateriaisFiltrados,
  bordered = false,
}: {
  title: string
  titleClass: string
  data: Array<{ name: string; value: number }>
  emptyText: string
  totalMateriaisFiltrados: number
  bordered?: boolean
}) {
  const [showAll, setShowAll] = useState(false)
  const hasOverflow = data.length > DEFAULT_DISTRIBUTION_ITEMS

  const chartData = useMemo(() => {
    if (showAll || !hasOverflow) return data

    const visibleItems = data.slice(0, DEFAULT_DISTRIBUTION_ITEMS)
    const remainingTotal = data.slice(DEFAULT_DISTRIBUTION_ITEMS).reduce((sum, item) => sum + item.value, 0)

    return remainingTotal > 0
      ? [...visibleItems, { name: "Outros", value: remainingTotal }]
      : visibleItems
  }, [data, hasOverflow, showAll])

  const legendItems = useMemo(() => {
    if (showAll || !hasOverflow) return data

    const visibleItems = data.slice(0, DEFAULT_DISTRIBUTION_ITEMS)
    const remainingItems = data.slice(DEFAULT_DISTRIBUTION_ITEMS)
    const remainingTotal = remainingItems.reduce((sum, item) => sum + item.value, 0)

    return remainingTotal > 0
      ? [...visibleItems, { name: `Outros (${remainingItems.length})`, value: remainingTotal }]
      : visibleItems
  }, [data, hasOverflow, showAll])

  return (
    <div className={`flex flex-col items-center min-w-0 ${bordered ? "border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-4" : ""}`}>
      <div className="mb-2 flex w-full items-center justify-between gap-3">
        <h4 className={`text-sm font-semibold ${titleClass}`}>{title}</h4>
        {hasOverflow && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAll((prev) => !prev)}
            className="h-8 border-gray-200 text-xs text-slate-600"
          >
            {showAll ? (
              <>
                <ChevronUp className="mr-1 h-3.5 w-3.5" />
                Mostrar menos
              </>
            ) : (
              <>
                <ChevronDown className="mr-1 h-3.5 w-3.5" />
                Ver restantes
              </>
            )}
          </Button>
        )}
      </div>
      <div className="h-[250px] w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={2} dataKey="value">
                {chartData.map((entry, index) => (
                  <Cell key={`${title}-${entry.name}-${index}`} fill={getDistributionColor(entry.name)} stroke="none" />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatQuantity(value)} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center px-4 text-center text-gray-400 text-xs">
            {totalMateriaisFiltrados > 0 ? emptyText : "Sem materiais no filtro atual"}
          </div>
        )}
      </div>
      {data.length > 0 && (
        <div className={`mt-3 w-full rounded-lg border border-slate-100 bg-slate-50/70 p-3 ${showAll ? "max-h-64 overflow-y-auto" : ""}`}>
          <div className="space-y-2">
            {legendItems.map((item, index) => (
              <div key={`${title}-legend-${item.name}-${index}`} className="flex items-start justify-between gap-3 text-xs">
                <div className="flex min-w-0 items-start gap-2">
                  <span
                    className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: getDistributionColor(item.name) }}
                  />
                  <span className="min-w-0 break-words text-slate-600">
                    {item.name}
                  </span>
                </div>
                <span className="shrink-0 font-semibold text-slate-700">{formatQuantity(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function formatQuantity(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 2,
  }).format(value)
}

function getDistributionColor(name: string) {
  if (name.toLowerCase().startsWith("outros")) {
    return CHART_COLORS.others
  }

  let hash = 0
  const normalizedName = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()

  for (let index = 0; index < normalizedName.length; index += 1) {
    hash = (hash * 31 + normalizedName.charCodeAt(index)) >>> 0
  }

  return CHART_COLORS.palette[hash % CHART_COLORS.palette.length]
}
