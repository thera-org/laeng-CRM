"use client"

import { useState, Fragment } from "react"
import type { ObraComCliente } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, ChevronLeft, ChevronRight, Pencil, ChevronUp, ChevronDown } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { ObraEditModal } from "@/components/obra-edit-modal"
import { formatCurrency } from "@/lib/utils"
import { getObraStatusBadge } from "@/lib/status-utils"
import { usePagination, useExpandableRows } from "@/lib/table-utils"
import { ObraTerceirizadoSection } from "@/components/obra-terceirizado-section"
import { EditableValueModal } from "@/components/editable-value-modal"

interface ObrasTableFullProps {
  obras: ObraComCliente[]
  highlightId?: string | null
  userPermissions: Record<string, any>
}

export function ObrasTableFull({ obras, highlightId, userPermissions }: ObrasTableFullProps) {

  const canEdit = userPermissions?.obras?.edit

  const router = useRouter()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedObra, setSelectedObra] = useState<ObraComCliente | null>(null)
  const [editingValue, setEditingValue] = useState<{
    fieldName: string
    title: string
    currentValue: number
    obraId: string
  } | null>(null)

  const handleEditObra = (obra: ObraComCliente) => {
    setSelectedObra(obra)
    setIsEditModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsEditModalOpen(false)
    setSelectedObra(null)
  }

  const handleEditValue = (
    obra: ObraComCliente,
    fieldName: string,
    title: string,
    currentValue: number
  ) => {
    if (!canEdit) return

    setEditingValue({
      fieldName,
      title,
      currentValue,
      obraId: obra.id
    })
  }


  // Hooks centralizados
  const { currentPage, setCurrentPage, itemsPerPage, totalPages, startIndex, endIndex, paginatedData: paginatedObras, handleItemsPerPageChange, getPageNumbers } = usePagination(obras, 100)
  const { expandedRows, toggleRow: toggleRowExpansion } = useExpandableRows()
  const { expandedRows: expandedEmpreiteiro, toggleRow: toggleEmpreiteiroExpansion } = useExpandableRows()

  if (obras.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">Nenhuma obra cadastrada ainda.</div>
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border-2 border-[#F5C800]/20 overflow-hidden">
        <div className="overflow-x-auto relative">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-[#1E1E1E] shadow-md">
              <TableRow className="bg-[#1E1E1E] hover:bg-[#1E1E1E]">
                <TableHead className="text-[#F5C800] font-bold py-3">
                  CÓD.
                </TableHead>
                <TableHead className="text-[#F5C800] font-bold py-3">
                  CLIENTE
                </TableHead>
                <TableHead className="text-[#F5C800] font-bold py-3">
                  STATUS
                </TableHead>
                <TableHead className="text-center text-[#F5C800] font-bold py-3">
                  EMPREITEIRO
                </TableHead>
                <TableHead className="text-center text-[#F5C800] font-bold py-3">
                  TERCEIRIZADO
                </TableHead>
                <TableHead className="text-center text-[#F5C800] font-bold py-3">
                  MATERIAL
                </TableHead>
                <TableHead className="text-center text-[#F5C800] font-bold py-3">
                  TERRENO
                </TableHead>
                <TableHead className="text-center text-[#F5C800] font-bold py-3">
                  VALOR OBRA
                </TableHead>
                <TableHead className="text-center text-[#F5C800] font-bold py-3">AÇÕES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedObras.map((obra) => {
                const isExpanded = expandedRows.has(obra.id)
                const isEmpreiteiroExpanded = expandedEmpreiteiro.has(obra.id)
                // Total Terceirizado = terceirizado base + especialistas (SEM mão de obra, que é o empreiteiro)
                const totalTerceirizado = (obra.terceirizado || 0) + (obra.pintor || 0) + (obra.eletricista || 0) + (obra.gesseiro || 0) + (obra.azulejista || 0) + (obra.manutencao || 0)

                // Calcular dados do empreiteiro (mão de obra = empreiteiro)
                const valorPago = obra.empreiteiro_valor_pago || 0
                const valorContratado = obra.empreiteiro || 0
                // Para exibição no demonstrativo: se contratado não preenchido, usa o pago como referência
                const valorEmpreiteiroDisplay = valorContratado || valorPago
                const saldo = valorEmpreiteiroDisplay - valorPago
                const percentualPago = valorEmpreiteiroDisplay > 0 ? (valorPago / valorEmpreiteiroDisplay) * 100 : 0
                const percentualPagoDisplay = Math.min(100, percentualPago)

                // Valor total da obra = custo_total do banco (autoritativo) ou recálculo incluindo mao_de_obra
                const valorTotalObra = Number(obra.custo_total) || (
                  valorContratado + (obra.material || 0) + (obra.mao_de_obra || 0) + totalTerceirizado + (obra.valor_terreno || 0)
                )

                const isHighlighted = highlightId === obra.id

                return (
                  <Fragment key={obra.id}>
                    <TableRow
                      id={`obra-${obra.id}`}
                      className={`hover:bg-[#F5C800]/5 border-b transition-all duration-300 ${isHighlighted ? 'bg-[#F5C800]/20' : ''}`}
                    >
                      <TableCell className="py-3">
                        <Badge className="font-mono bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold text-xs px-2 py-1">
                          #{String(obra.codigo || 0).padStart(3, '0')}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium py-3">
                        <span className="font-semibold text-sm">{obra.cliente_nome}</span>
                      </TableCell>
                      <TableCell className="py-3">
                        {getObraStatusBadge(obra.status)}
                      </TableCell>
                      <TableCell className="text-center py-3">
                        <div className="flex items-center justify-center gap-2">
                          <div className="min-w-[110px] text-center flex flex-col items-center">
                            <div className="text-xs font-semibold text-gray-600 truncate max-w-[100px]">{obra.empreiteiro_nome || 'SEM EMPREITEIRO'}</div>
                            <div className="text-sm font-bold text-black mt-1">{formatCurrency(valorEmpreiteiroDisplay)}</div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => toggleEmpreiteiroExpansion(obra.id)}
                            className="h-8 w-8 p-0 bg-[#F5C800] hover:bg-[#F5C800]/90 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center flex-shrink-0"
                            title={isEmpreiteiroExpanded ? "Recolher demonstrativo" : "Ver demonstrativo financeiro"}
                          >
                            {isEmpreiteiroExpanded ? (
                              <ChevronUp className="h-5 w-5 text-[#1E1E1E] font-bold" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-[#1E1E1E] font-bold" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-3">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-sm font-bold text-black min-w-[110px] text-center">{formatCurrency(totalTerceirizado)}</span>
                          <Button
                            size="sm"
                            onClick={() => toggleRowExpansion(obra.id)}
                            className="h-8 w-8 p-0 bg-[#F5C800] hover:bg-[#F5C800]/90 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center flex-shrink-0"
                            title={isExpanded ? "Recolher detalhes" : "Ver detalhes dos terceirizados"}
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5 text-[#1E1E1E] font-bold" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-[#1E1E1E] font-bold" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-3 font-bold min-w-[110px]">
                        <span className="text-sm font-bold text-black inline-block">
                          {formatCurrency(obra.material || 0)}
                        </span>

                      </TableCell>
                      <TableCell className="text-center py-3 font-bold min-w-[110px]">
                        <button
                          onClick={
                            canEdit
                              ? () =>
                                handleEditValue(
                                  obra,
                                  "valor_terreno",
                                  "Terreno",
                                  obra.valor_terreno || 0
                                )
                              : undefined
                          }
                          disabled={!canEdit}
                          title={
                            canEdit
                              ? "Clique para editar Terreno"
                              : "Você não tem permissão para editar Terreno"
                          }
                          className={`
                          text-sm font-bold inline-block transition-colors
                          ${canEdit
                              ? "text-black hover:text-[#F5C800] cursor-pointer"
                              : "text-gray-400 cursor-not-allowed"}
                        `}
                        >
                          {formatCurrency(obra.valor_terreno || 0)}
                        </button>

                      </TableCell>
                      <TableCell className="text-center py-3 font-bold min-w-[120px]">
                        <span className="text-sm text-green-700 inline-block">{formatCurrency(valorTotalObra)}</span>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-center justify-center gap-2">
                          {canEdit && (
                            <Button
                              size="sm"
                              onClick={() => handleEditObra(obra)}
                              className="bg-[#F5C800] hover:bg-[#F5C800]/90 border-2 border-[#F5C800] h-9 w-9 p-0 transition-colors"
                              title="Editar Obra"
                            >
                              <Pencil className="h-4 w-4 text-[#1E1E1E]" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/clientes/${obra.cliente_id}`)}
                            className="border-2 border-gray-300 hover:border-[#F5C800] hover:bg-[#F5C800]/10 h-9 w-9 p-0 transition-colors"
                            title="Ver Cliente"
                          >
                            <User className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {isEmpreiteiroExpanded && (
                      <TableRow key={`${obra.id}-empreiteiro`} className="bg-yellow-50 border-l-4 border-[#F5C800]">
                        <TableCell colSpan={9} className="py-6 px-8">
                          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                            <h4 className="text-sm font-bold text-[#1E1E1E] mb-6 uppercase">
                              Demonstrativo Financeiro do Empreiteiro
                            </h4>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Tabela de dados */}
                              <div className="bg-yellow-50 rounded-lg p-4 border border-gray-200">
                                <table className="w-full">
                                  <thead>
                                    <tr className="bg-[#1E1E1E] text-[#F5C800]">
                                      <th className="text-left py-2 px-3 text-sm font-bold uppercase">Item</th>
                                      <th className="text-right py-2 px-3 text-sm font-bold uppercase">Valor</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="border-b border-gray-200">
                                      <td className="py-3 px-3 text-sm font-semibold text-gray-700 uppercase">Empreiteiro</td>
                                      <td className="py-3 px-3 text-sm font-semibold text-right">{obra.empreiteiro_nome || '-'}</td>
                                    </tr>
                                    <tr className="border-b border-gray-200">
                                      <td className="py-3 px-3 text-sm font-semibold text-gray-700 uppercase">Valor da Empreitada</td>
                                      <td className="py-3 px-3 text-sm font-bold text-right text-[#1E1E1E]">{formatCurrency(valorEmpreiteiroDisplay)}</td>
                                    </tr>
                                    <tr className="border-b border-gray-200">
                                      <td className="py-3 px-3 text-sm font-semibold text-gray-700 uppercase">Valor Pago</td>
                                      <td className="py-3 px-3 text-sm font-bold text-right text-green-700">{formatCurrency(valorPago)}</td>
                                    </tr>
                                    <tr className="border-b border-gray-200">
                                      <td className="py-3 px-3 text-sm font-semibold text-gray-700 uppercase">Saldo</td>
                                      <td className="py-3 px-3 text-sm font-bold text-right text-red-700">{formatCurrency(saldo)}</td>
                                    </tr>
                                    <tr className="bg-[#F5C800]">
                                      <td className="py-3 px-3 text-sm font-bold text-[#1E1E1E] uppercase">Percentual Pago</td>
                                      <td className="py-3 px-3 text-sm font-bold text-right text-[#1E1E1E]">{percentualPagoDisplay.toFixed(2)}%</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>

                              {/* Gráfico Pizza */}
                              <div className="flex flex-col items-center justify-center bg-yellow-50 rounded-lg p-4 border border-gray-200">
                                <h5 className="text-sm font-bold text-[#1E1E1E] mb-4 uppercase">Status do Pagamento</h5>
                                <div className="relative w-48 h-48">
                                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                                    {/* Círculo de fundo (saldo) */}
                                    <circle
                                      cx="50"
                                      cy="50"
                                      r="40"
                                      fill="none"
                                      stroke="#e5e7eb"
                                      strokeWidth="20"
                                    />
                                    {/* Círculo de progresso (pago) */}
                                    <circle
                                      cx="50"
                                      cy="50"
                                      r="40"
                                      fill="none"
                                      stroke="#F5C800"
                                      strokeWidth="20"
                                      strokeDasharray={`${percentualPagoDisplay * 2.51327} 251.327`}
                                      className="transition-all duration-500"
                                    />
                                  </svg>
                                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-bold text-[#F5C800]">{percentualPagoDisplay.toFixed(0)}%</span>
                                    <span className="text-xs text-gray-600 mt-1 uppercase">Pago</span>
                                  </div>
                                </div>
                                <div className="flex gap-4 mt-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-[#F5C800] rounded"></div>
                                    <span className="text-xs font-medium text-gray-700">Pago: {formatCurrency(valorPago)}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-gray-300 rounded"></div>
                                    <span className="text-xs font-medium text-gray-700">Saldo: {formatCurrency(saldo)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}

                    {isExpanded && (
                      <TableRow key={`${obra.id}-details`} className="bg-yellow-50 border-l-4 border-[#F5C800]">
                        <TableCell colSpan={9} className="py-6 px-8">
                          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                            <h4 className="text-sm font-bold text-[#1E1E1E] mb-5 uppercase">
                              Detalhamento dos Custos Terceirizados
                            </h4>
                            <ObraTerceirizadoSection
                              obra={obra}
                              userPermissions={{ ...userPermissions, obras: { ...userPermissions?.obras, edit: false } }}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Controles de Paginação */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2 py-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground font-semibold">
            Mostrando {startIndex + 1} - {Math.min(endIndex, obras.length)} de {obras.length} obras
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          {/* Seletor de itens por página */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">
              Obras por página:
            </span>
            <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-[80px] h-9 border-[#F5C800]/30 focus:ring-[#F5C800] bg-background font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="min-w-[80px]">
                <SelectItem value="20" className="cursor-pointer font-semibold">20</SelectItem>
                <SelectItem value="50" className="cursor-pointer font-semibold">50</SelectItem>
                <SelectItem value="100" className="cursor-pointer font-semibold">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Navegação de páginas */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="border-[#F5C800]/30 hover:bg-[#F5C800]/10 disabled:opacity-50 font-semibold"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground font-semibold">...</span>
              ) : (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page as number)}
                  className={
                    currentPage === page
                      ? "bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold"
                      : "border-[#F5C800]/30 hover:bg-[#F5C800]/10 font-semibold"
                  }
                >
                  {page}
                </Button>
              )
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="border-[#F5C800]/30 hover:bg-[#F5C800]/10 disabled:opacity-50 font-semibold"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <ObraEditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        obra={selectedObra || undefined}
      />

      {/* Modal para editar Material e Terreno */}
      {editingValue && canEdit && (
        <EditableValueModal
          isOpen
          onClose={() => setEditingValue(null)}
          title={editingValue.title}
          currentValue={editingValue.currentValue}
          fieldName={editingValue.fieldName}
          tableId={editingValue.obraId}
          tableName="obras"
        />
      )}
    </div>
  )
}
