"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Package, TrendingUp, TrendingDown } from "lucide-react"
import type { FluxoMaterialResumo } from "@/lib/types"

interface FluxoMaterialDashboardProps {
  data: FluxoMaterialResumo[]
}

export function FluxoMaterialDashboard({ data }: FluxoMaterialDashboardProps) {
  const totalEntradas = data.reduce((sum, d) => sum + d.total_entradas, 0)
  const totalSaidas = data.reduce((sum, d) => sum + d.total_saidas, 0)
  const totalEstoqueAtual = data.reduce((sum, d) => sum + d.estoque_atual, 0)

  return (
    <div className="space-y-6">
      {/* Cards resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <SummaryCard
          title="Total Entradas"
          value={totalEntradas}
          icon={TrendingUp}
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <SummaryCard
          title="Total Saidas"
          value={totalSaidas}
          icon={TrendingDown}
          color="text-red-600"
          bgColor="bg-red-50"
        />
        <SummaryCard
          title="Estoque Atual"
          value={totalEstoqueAtual}
          icon={Package}
          color="text-[#F5C800]"
          bgColor="bg-yellow-50"
        />
      </div>

      {/* Tabela detalhada */}
      <Card className="border-0 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
        <CardHeader className="bg-[#1E1E1E] py-4 px-4 sm:px-6">
          <CardTitle className="text-white text-lg font-bold flex items-center gap-2">
            <Package className="h-5 w-5 text-[#F5C800]" />
            Detalhamento por Material
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-bold py-3">MATERIAL</TableHead>
                  <TableHead className="font-bold py-3 text-center text-green-600">ENTRADAS</TableHead>
                  <TableHead className="font-bold py-3 text-center text-red-600">SAIDAS</TableHead>
                  <TableHead className="font-bold py-3 text-center">ESTOQUE ATUAL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      Nenhum material encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((item) => (
                    <TableRow key={item.material_id} className="hover:bg-[#F5C800]/5">
                      <TableCell className="font-medium">{item.material_nome}</TableCell>
                      <TableCell className="text-center font-semibold text-green-600">
                        +{item.total_entradas}
                      </TableCell>
                      <TableCell className="text-center font-semibold text-red-600">
                        -{item.total_saidas}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-bold ${
                            item.estoque_atual > 0
                              ? "bg-green-100 text-green-700"
                              : item.estoque_atual === 0
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {item.estoque_atual}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SummaryCard({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
}: {
  title: string
  value: number
  icon: any
  color: string
  bgColor: string
}) {
  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">{title}</p>
            <p className={`text-xl sm:text-2xl lg:text-3xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
          <div className={`${bgColor} p-2 sm:p-3 rounded-xl`}>
            <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
