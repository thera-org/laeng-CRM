"use client"

import React, { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { ObraFinanceiroAggregated } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { formatMoneyInput, parseMoneyInput, formatCurrency, formatPercentage } from "@/lib/utils"
import { getStatusBadge } from "@/lib/status-utils"
import { useSortTable, usePagination, useExpandableRows, ExpandToggleButton } from "@/lib/table-utils"

interface FinanceiraTableProps {
  obras: ObraFinanceiroAggregated[]
  userPermissions: Record<string, any>
}

interface MedicaoData {
  numero: number
  valor: number
  dataComputacao?: string
}

export function FinanceiraTable({ obras , userPermissions}: FinanceiraTableProps) {

  const canEdit = userPermissions?.financeira?.edit === true

  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const [medicaoEditando, setMedicaoEditando] = useState<MedicaoData | null>(null)
  const [obraIdEditando, setObraIdEditando] = useState<string | null>(null)
  const [isLoadingMedicao, setIsLoadingMedicao] = useState(false)
  const [inputValue, setInputValue] = useState<string>('')

  // Hooks centralizados
  const { toggleRow, isExpanded } = useExpandableRows()
  const { handleSort, getSortIcon, sortedData: sortedObras } = useSortTable<ObraFinanceiroAggregated>(obras)
  const { currentPage, setCurrentPage, itemsPerPage, totalPages, startIndex, endIndex, paginatedData: paginatedObras, handleItemsPerPageChange, getPageNumbers } = usePagination(sortedObras, 100)

  // Sincronizar input com medicaoEditando
  useEffect(() => {
    if (medicaoEditando) {
      setInputValue(formatMoneyInput(medicaoEditando.valor))
    }
  }, [medicaoEditando])

  const abrirEditorMedicao = (
    obraId: string,
    numeroMedicao: number,
    valorAtual: number,
    dataComputacao?: string
  ) => {
    if (!canEdit) return

    setObraIdEditando(obraId)
    setMedicaoEditando({
      numero: numeroMedicao,
      valor: valorAtual,
      dataComputacao: dataComputacao || undefined,
    })
  }


  const fecharEditorMedicao = () => {
    setMedicaoEditando(null)
    setObraIdEditando(null)
    setInputValue('')
  }

  const salvarMedicao = async () => {
    if (!medicaoEditando || !obraIdEditando) return

    setIsLoadingMedicao(true)
    try {
      const obraEncontrada = obras.find(o => o.id === obraIdEditando)
      if (!obraEncontrada) throw new Error("Obra não encontrada")

      const dataComputacao = new Date().toISOString()
      const numeroMedicao = medicaoEditando.numero
      const campoMedicao = `medicao_0${numeroMedicao}`
      const campoDataComputacao = `medicao_0${numeroMedicao}_data_computacao`

      // Criar objeto de atualização dinamicamente
      const updateData: Record<string, string | number> = {
        [campoMedicao]: medicaoEditando.valor,
        [campoDataComputacao]: dataComputacao,
        updated_at: new Date().toISOString(),
      }

      // Atualizar a obra no Supabase
      const { error } = await supabase
        .from("obras")
        .update(updateData)
        .eq("id", obraIdEditando)

      if (error) throw error

      toast({
        title: "✅ Medição salva!",
        description: `Medição ${medicaoEditando.numero} atualizada com sucesso.`,
        duration: 3000,
      })

      fecharEditorMedicao()
      
      // Recarregar dados do servidor após um pequeno delay
      // para garantir que o banco de dados foi atualizado
      setTimeout(() => {
        router.refresh()
      }, 500)
    } catch (error) {
      console.error("Erro ao salvar medição:", error)
      toast({
        title: "❌ Erro ao salvar",
        description: "Ocorreu um erro ao salvar a medição. Tente novamente.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsLoadingMedicao(false)
    }
  }

  const formatarDataComputacao = (dataIso?: string) => {
    if (!dataIso) return ""
    const data = new Date(dataIso)
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
  }

  return (
    <div className="rounded-md border-2 border-[#F5C800]/20 overflow-hidden">
      <div className="overflow-x-auto relative">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-[#1E1E1E] shadow-md">
            <TableRow className="bg-[#1E1E1E] hover:bg-[#1E1E1E]">
              <TableHead 
                className="text-[#F5C800] font-bold py-3"
              >
                CÓD.
              </TableHead>
              <TableHead 
                className="text-[#F5C800] font-bold py-3"
              >
                CLIENTE
              </TableHead>
              <TableHead 
                className="text-[#F5C800] font-bold py-3"
              >
                STATUS
              </TableHead>
              <TableHead 
                className="text-left text-[#F5C800] font-bold py-3"
              >
                VALOR CONTRATUAL
              </TableHead>
              <TableHead 
                className="text-left text-[#F5C800] font-bold py-3"
              >
                RECEBIDO
              </TableHead>
              <TableHead 
                className="text-left text-[#F5C800] font-bold py-3"
              >
                A RECEBER
              </TableHead>
              <TableHead 
                className="text-left text-[#F5C800] font-bold py-3"
              >
                CUSTOS
              </TableHead>
              <TableHead 
                className="text-left text-[#F5C800] font-bold cursor-pointer hover:bg-[#F5C800]/10 transition-colors py-3" 
                onClick={() => handleSort('resultado')}
              >
                <div className="flex items-center">
                  RESULTADO
                  {getSortIcon('resultado')}
                </div>
              </TableHead>
              <TableHead 
                className="text-center text-[#F5C800] font-bold py-3"
              >
                PROGRESSO
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedObras.length > 0 ? (
              paginatedObras.map((obra) => {
                const percentualRecebido = obra.percentual_pago || 0
                const resultado = obra.resultado || 0
                
                return (
                  <React.Fragment key={obra.id}>
                    <TableRow className="hover:bg-[#F5C800]/5 border-b">
                      {/* Código */}
                      <TableCell className="py-3">
                        <Badge className="font-mono bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold text-xs px-2 py-1">
                          #{String(obra.codigo).padStart(3, '0')}
                        </Badge>
                      </TableCell>

                      {/* Cliente */}
                      <TableCell className="font-medium py-3">
                        <span className="font-semibold text-sm">{obra.cliente_nome}</span>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-3">
                        {getStatusBadge(obra.status)}
                      </TableCell>

                      {/* Valor Contratual */}
                      <TableCell className="py-3 text-left min-w-[140px]">
                        <span className="text-sm font-bold text-black">
                          {formatCurrency(obra.valor_total || 0)}
                        </span>
                      </TableCell>

                      {/* Recebido = medições + terreno (terreno é quitado no início do contrato) */}
                      <TableCell className="py-3 text-left min-w-[120px]">
                        <div className="flex items-center justify-between gap-1">
                          <div>
                            <div className="text-sm font-bold text-green-600">
                              {formatCurrency((obra.total_medicoes_pagas || 0) + (obra.valor_terreno || 0))}
                            </div>
                            {(obra.valor_terreno || 0) > 0 && (
                              <div className="text-xs text-gray-400 mt-0.5">
                                terreno: {formatCurrency(obra.valor_terreno || 0)}
                              </div>
                            )}
                          </div>
                          <ExpandToggleButton
                            isExpanded={isExpanded(obra.id)}
                            onClick={() => toggleRow(obra.id)}
                            title={isExpanded(obra.id) ? "Recolher detalhes" : "Ver detalhes das medições"}
                          />
                        </div>
                      </TableCell>

                      {/* A Receber */}
                      <TableCell className="py-3 text-left min-w-[160px]">
                        <span className="text-sm font-bold text-blue-600">
                          {formatCurrency(obra.saldo_pendente || 0)}
                        </span>
                      </TableCell>

                      {/* Custos */}
                      <TableCell className="py-3 text-left min-w-[160px]">
                        <span className="text-sm font-bold text-red-600">
                          {formatCurrency(obra.custo_total || 0)}
                        </span>
                      </TableCell>

                      {/* Resultado */}
                      <TableCell className="py-3 text-left min-w-[140px]">
                        <div className="flex flex-col items-start">
                          <span className={`text-sm font-bold ${
                            resultado > 0 ? 'text-green-600' : resultado < 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {formatCurrency(resultado)}
                          </span>
                          <span className={`text-xs font-bold ${
                            obra.margem_lucro > 0 ? 'text-green-600' : obra.margem_lucro < 0 ? 'text-red-600' : 'text-gray-500'
                          }`}>
                            {formatPercentage(obra.margem_lucro || 0)}
                          </span>
                        </div>
                      </TableCell>

                      {/* Progresso */}
                      <TableCell className="py-3">
                        <div className="flex flex-col items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                percentualRecebido === 100
                                  ? 'bg-green-500'
                                  : percentualRecebido >= 50
                                  ? 'bg-blue-500'
                                  : 'bg-yellow-500'
                              }`}
                              style={{ width: `${Math.min(percentualRecebido, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-gray-600">
                            {formatPercentage(percentualRecebido)}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Linha Expandida - Detalhamento de Medições */}
                    {isExpanded(obra.id) && (
                      <TableRow key={`${obra.id}-details`} className="bg-yellow-50 border-l-4 border-[#F5C800]">
                        <TableCell colSpan={9} className="py-6 px-8">
                          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                            <h4 className="text-sm font-bold text-[#1E1E1E] mb-5 uppercase">
                              Detalhamento de Medições
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                              {/* Medição 01 */}
                            <button
                              onClick={
                                canEdit
                                  ? () =>
                                      abrirEditorMedicao(
                                        obra.id,
                                        1,
                                        obra.medicao_01 || 0,
                                        obra.medicao_01_data_computacao
                                      )
                                  : undefined
                              }
                              disabled={!canEdit}
                              title={
                                canEdit
                                  ? "Clique para editar Medição 01"
                                  : "Você não tem permissão para editar medições"
                              }
                              className={`
                                rounded-lg p-4 border border-gray-200 transition-all group relative
                                ${canEdit
                                  ? "bg-[#F5C800] hover:bg-[#F5C800]/90 cursor-pointer hover:shadow-md active:scale-95"
                                  : "bg-gray-200 cursor-not-allowed opacity-60"}
                              `}
                            >
                                <div className="text-left">
                                  <p className="text-xs text-[#1E1E1E] font-semibold mb-1.5 uppercase">MEDIÇÃO 01</p>
                                  <p className="text-base font-bold text-[#1E1E1E]">
                                    {formatCurrency(obra.medicao_01 || 0)}
                                  </p>
                                  {obra.medicao_01_data_computacao && (
                                    <p className="text-xs text-[#1E1E1E] font-semibold mt-2 opacity-75">
                                      {formatarDataComputacao(obra.medicao_01_data_computacao)}
                                    </p>
                                  )}
                                </div>
                              </button>
                              
                              {/* Medição 02 */}
                            <button
                              onClick={
                                canEdit
                                  ? () =>
                                      abrirEditorMedicao(
                                        obra.id,
                                        2,
                                        obra.medicao_02 || 0,
                                        obra.medicao_02_data_computacao
                                      )
                                  : undefined
                              }
                              disabled={!canEdit}
                              title={
                                canEdit
                                  ? "Clique para editar Medição 02"
                                  : "Você não tem permissão para editar medições"
                              }
                              className={`
                                rounded-lg p-4 border border-gray-200 transition-all group relative
                                ${canEdit
                                  ? "bg-[#F5C800] hover:bg-[#F5C800]/90 cursor-pointer hover:shadow-md active:scale-95"
                                  : "bg-gray-200 cursor-not-allowed opacity-60"}
                              `}
                            >
                                <div className="text-left">
                                  <p className="text-xs text-[#1E1E1E] font-semibold mb-1.5 uppercase">MEDIÇÃO 02</p>
                                  <p className="text-base font-bold text-[#1E1E1E]">
                                    {formatCurrency(obra.medicao_02 || 0)}
                                  </p>
                                  {obra.medicao_02_data_computacao && (
                                    <p className="text-xs text-[#1E1E1E] font-semibold mt-2 opacity-75">
                                      {formatarDataComputacao(obra.medicao_02_data_computacao)}
                                    </p>
                                  )}
                                </div>
                              </button>
                              
                              {/* Medição 03 */}
                            <button
                              onClick={
                                canEdit
                                  ? () =>
                                      abrirEditorMedicao(
                                        obra.id,
                                        3,
                                        obra.medicao_03 || 0,
                                        obra.medicao_03_data_computacao
                                      )
                                  : undefined
                              }
                              disabled={!canEdit}
                              title={
                                canEdit
                                  ? "Clique para editar Medição 03"
                                  : "Você não tem permissão para editar medições"
                              }
                              className={`
                                rounded-lg p-4 border border-gray-200 transition-all group relative
                                ${canEdit
                                  ? "bg-[#F5C800] hover:bg-[#F5C800]/90 cursor-pointer hover:shadow-md active:scale-95"
                                  : "bg-gray-200 cursor-not-allowed opacity-60"}
                              `}
                            >
                                <div className="text-left">
                                  <p className="text-xs text-[#1E1E1E] font-semibold mb-1.5 uppercase">MEDIÇÃO 03</p>
                                  <p className="text-base font-bold text-[#1E1E1E]">
                                    {formatCurrency(obra.medicao_03 || 0)}
                                  </p>
                                  {obra.medicao_03_data_computacao && (
                                    <p className="text-xs text-[#1E1E1E] font-semibold mt-2 opacity-75">
                                      {formatarDataComputacao(obra.medicao_03_data_computacao)}
                                    </p>
                                  )}
                                </div>
                              </button>
                              
                              {/* Medição 04 */}
                            <button
                              onClick={
                                canEdit
                                  ? () =>
                                      abrirEditorMedicao(
                                        obra.id,
                                        4,
                                        obra.medicao_04 || 0,
                                        obra.medicao_04_data_computacao
                                      )
                                  : undefined
                              }
                              disabled={!canEdit}
                              title={
                                canEdit
                                  ? "Clique para editar Medição 04"
                                  : "Você não tem permissão para editar medições"
                              }
                              className={`
                                rounded-lg p-4 border border-gray-200 transition-all group relative
                                ${canEdit
                                  ? "bg-[#F5C800] hover:bg-[#F5C800]/90 cursor-pointer hover:shadow-md active:scale-95"
                                  : "bg-gray-200 cursor-not-allowed opacity-60"}
                              `}
                            >
                                <div className="text-left">
                                  <p className="text-xs text-[#1E1E1E] font-semibold mb-1.5 uppercase">MEDIÇÃO 04</p>
                                  <p className="text-base font-bold text-[#1E1E1E]">
                                    {formatCurrency(obra.medicao_04 || 0)}
                                  </p>
                                  {obra.medicao_04_data_computacao && (
                                    <p className="text-xs text-[#1E1E1E] font-semibold mt-2 opacity-75">
                                      {formatarDataComputacao(obra.medicao_04_data_computacao)}
                                    </p>
                                  )}
                                </div>
                              </button>
                              
                              {/* Medição 05 */}
                            <button
                              onClick={
                                canEdit
                                  ? () =>
                                      abrirEditorMedicao(
                                        obra.id,
                                        5,
                                        obra.medicao_05 || 0,
                                        obra.medicao_05_data_computacao
                                      )
                                  : undefined
                              }
                              disabled={!canEdit}
                              title={
                                canEdit
                                  ? "Clique para editar Medição 05"
                                  : "Você não tem permissão para editar medições"
                              }
                              className={`
                                rounded-lg p-4 border border-gray-200 transition-all group relative
                                ${canEdit
                                  ? "bg-[#F5C800] hover:bg-[#F5C800]/90 cursor-pointer hover:shadow-md active:scale-95"
                                  : "bg-gray-200 cursor-not-allowed opacity-60"}
                              `}
                            >
                                <div className="text-left">
                                  <p className="text-xs text-[#1E1E1E] font-semibold mb-1.5 uppercase">MEDIÇÃO 05</p>
                                  <p className="text-base font-bold text-[#1E1E1E]">
                                    {formatCurrency(obra.medicao_05 || 0)}
                                  </p>
                                  {obra.medicao_05_data_computacao && (
                                    <p className="text-xs text-[#1E1E1E] font-semibold mt-2 opacity-75">
                                      {formatarDataComputacao(obra.medicao_05_data_computacao)}
                                    </p>
                                  )}
                                </div>
                              </button>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="px-4 py-12 text-center">
                  <p className="text-gray-600 font-medium mb-2">Nenhuma obra encontrada</p>
                  <p className="text-sm text-gray-500">
                    Ajuste os filtros para ver mais resultados.
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Controles de Paginação */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2 py-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground font-semibold">
            Mostrando {startIndex + 1} - {Math.min(endIndex, sortedObras.length)} de {sortedObras.length} obras
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

      {/* Modal de Edição de Medição */}
      <Dialog open={medicaoEditando !== null} onOpenChange={(open) => !open && fecharEditorMedicao()}>
        <DialogContent className="max-w-sm w-full p-0 rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-[#1E1E1E] text-white px-6 py-4">
            <DialogTitle className="text-xl font-bold uppercase">
              Editar Medição {medicaoEditando?.numero}
            </DialogTitle>
            <p className="text-sm text-gray-300 mt-2">
              Altere o valor e clique em salvar para confirmar.
            </p>
          </div>

          {/* Conteúdo */}
          <div className="px-6 py-6 space-y-6 bg-white">
            {/* Input */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-[#1E1E1E] uppercase block">
                Novo Valor (R$)
              </label>
              <Input
                type="text"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value)
                  const valor = parseMoneyInput(e.target.value)
                  if (medicaoEditando) {
                    setMedicaoEditando({
                      ...medicaoEditando,
                      valor: valor,
                    })
                  }
                }}
                placeholder="0,00"
                disabled={isLoadingMedicao}
                className="border-2 border-gray-300 focus:border-[#F5C800] focus:ring-0 font-mono text-lg h-14 px-4 rounded-lg bg-white"
                autoFocus
              />
            </div>

            {/* Valor Anterior */}
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded px-4 py-4">
              <p className="text-xs font-bold text-blue-900 uppercase mb-2">Valor Anterior</p>
              <p className="text-2xl font-bold text-blue-900">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(medicaoEditando?.valor || 0)}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t px-6 py-4 flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={fecharEditorMedicao}
              disabled={isLoadingMedicao}
              className="border-2 border-gray-300 text-[#1E1E1E] hover:bg-gray-100 font-bold uppercase px-6"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={salvarMedicao}
              disabled={isLoadingMedicao}
              className="bg-[#F5C800] text-[#1E1E1E] hover:bg-[#E5B800] font-bold uppercase px-6"
            >
              {isLoadingMedicao ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
