"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, PackagePlus, User, CalendarDays, Package, FileText } from "lucide-react"
import type { MaterialEntrada } from "@/lib/types"
import { usePagination } from "@/lib/table-utils"
import { PagamentosPagination } from "@/components/pagamentos/pagamentos-pagination"
import { format, parseISO } from "date-fns"

interface EntradaTableProps {
  data: MaterialEntrada[]
  userPermissions: Record<string, any>
  userRole: string
  onEdit: (entrada: MaterialEntrada) => void
  onDelete: (entrada: MaterialEntrada) => void
}

export function EntradaTable({ data, userPermissions, userRole, onEdit, onDelete }: EntradaTableProps) {
  const canManage = userRole === "admin" || userPermissions?.estoque?.view

  const {
    currentPage,
    setCurrentPage,
    itemsPerPage,
    startIndex,
    endIndex,
    totalPages,
    paginatedData,
    handleItemsPerPageChange,
    getPageNumbers,
  } = usePagination(data, 100)

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
        <PackagePlus className="h-12 w-12 mb-3 opacity-20" />
        <p>Nenhuma entrada encontrada.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border-2 border-[#F5C800]/20 overflow-hidden shadow-sm bg-white">
        <div className="overflow-x-auto relative">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-[#1E1E1E] shadow-md">
              <TableRow className="hover:bg-[#1E1E1E] border-b border-gray-700">
                <TableHead className="text-[#F5C800] font-bold py-3 pl-4 w-[70px]">CÓD.</TableHead>
                <TableHead className="text-[#F5C800] font-bold py-3 w-[150px]">MATERIAL</TableHead>
                <TableHead className="text-[#F5C800] font-bold py-3 w-[110px]">QUANTIDADE</TableHead>
                <TableHead className="text-[#F5C800] font-bold py-3 min-w-[200px]">CLIENTE</TableHead>
                <TableHead className="text-[#F5C800] font-bold py-3 min-w-[200px]">OBSERVAÇÃO</TableHead>
                <TableHead className="text-[#F5C800] font-bold py-3 text-center w-[110px]">DATA</TableHead>
                <TableHead className="text-[#F5C800] font-bold py-3 text-right pr-6 w-[130px]">AÇÕES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((row) => (
                <TableRow key={row.id} className="hover:bg-[#F5C800]/5 border-b border-gray-100 transition-colors h-[60px]">

                  {/* CÓD. (cliente codigo) */}
                  <TableCell className="py-3 pl-4">
                    <Badge className="font-mono bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold text-xs px-2 py-1">
                      #{String(row.cliente_codigo || 0).padStart(3, '0')}
                    </Badge>
                  </TableCell>

                  {/* MATERIAL */}
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Package className="h-3 w-3 text-gray-400" />
                      <span className="text-sm font-medium text-gray-600">
                        {row.material_nome || "-"}
                      </span>
                    </div>
                  </TableCell>

                  {/* QUANTIDADE */}
                  <TableCell>
                    <span className="font-bold text-sm text-green-600">
                      +{row.quantidade}
                    </span>
                  </TableCell>

                  {/* CLIENTE */}
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <User className="h-3 w-3 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-800 truncate" title={row.cliente_nome}>
                        {row.cliente_nome || "-"}
                      </span>
                    </div>
                  </TableCell>

                  {/* OBSERVAÇÃO */}
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <FileText className="h-3 w-3 text-gray-400" />
                      <span className="text-sm text-gray-600 truncate max-w-[200px]" title={row.observacao || ""}>
                        {row.observacao || "-"}
                      </span>
                    </div>
                  </TableCell>

                  {/* DATA */}
                  <TableCell className="text-center p-2">
                    <div className="text-xs font-medium text-gray-600 flex items-center justify-center gap-1.5 whitespace-nowrap">
                      <CalendarDays className="h-3 w-3 text-gray-400" />
                      {row.data ? (() => {
                        const [ano, mes, dia] = row.data.split('T')[0].split('-');
                        return `${dia}/${mes}/${ano}`;
                      })() : "-"}
                    </div>
                  </TableCell>

                  {/* AÇÕES */}
                  <TableCell className="py-3 text-right pr-4">
                    {canManage && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => onEdit(row)}
                          className="bg-[#F5C800] hover:bg-[#F5C800]/90 border-2 border-[#F5C800] h-9 w-9 p-0 transition-colors"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4 text-[#1E1E1E]" />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onDelete(row)}
                          className="border-2 border-red-300 hover:border-red-500 hover:bg-red-50 h-9 w-9 p-0 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <PagamentosPagination
        startIndex={startIndex}
        endIndex={endIndex}
        totalItems={data.length}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={handleItemsPerPageChange}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        getPageNumbers={getPageNumbers}
      />
    </div>
  )
}
