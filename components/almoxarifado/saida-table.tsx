"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import type { MaterialSaida } from "@/lib/types"
import { UNIDADE_LABEL } from "@/components/almoxarifado/types/almoxarifadoTypes"
import { usePagination } from "@/lib/table-utils"
import { PagamentosPagination } from "@/components/pagamentos/pagamentos-pagination"
import { format, parseISO } from "date-fns"

interface SaidaTableProps {
  data: MaterialSaida[]
  userPermissions: Record<string, any>
  onEdit: (saida: MaterialSaida) => void
  onDelete: (saida: MaterialSaida) => void
}

export function SaidaTable({ data, userPermissions, onEdit, onDelete }: SaidaTableProps) {
  const canEdit = userPermissions?.["material-saida"]?.edit
  const canDelete = userPermissions?.["material-saida"]?.delete

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
  } = usePagination(data, 20)

  return (
    <div>
      <div className="rounded-xl border-2 border-[#F5C800]/20 overflow-hidden shadow-sm">
        <div className="overflow-x-auto relative">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-[#1E1E1E]">
              <TableRow className="hover:bg-[#1E1E1E]">
                <TableHead className="text-[#F5C800] font-bold py-3">DATA</TableHead>
                <TableHead className="text-[#F5C800] font-bold py-3">MATERIAL</TableHead>
                <TableHead className="text-[#F5C800] font-bold py-3">QUANTIDADE</TableHead>
                <TableHead className="text-[#F5C800] font-bold py-3">UNIDADE</TableHead>
                <TableHead className="text-[#F5C800] font-bold py-3">CLIENTE/OBRA</TableHead>
                <TableHead className="text-[#F5C800] font-bold py-3">OBSERVACAO</TableHead>
                <TableHead className="text-[#F5C800] font-bold py-3">REGISTRADO POR</TableHead>
                {(canEdit || canDelete) && (
                  <TableHead className="text-[#F5C800] font-bold py-3 text-right">ACOES</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    Nenhuma saida encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((saida) => (
                  <TableRow key={saida.id} className="hover:bg-[#F5C800]/5">
                    <TableCell className="font-medium whitespace-nowrap">
                      {saida.data ? format(parseISO(saida.data), "dd/MM/yyyy") : "-"}
                    </TableCell>
                    <TableCell className="font-medium">{saida.material_nome || "-"}</TableCell>
                    <TableCell className="font-semibold text-red-600">
                      -{saida.quantidade}
                    </TableCell>
                    <TableCell>
                      {UNIDADE_LABEL[saida.material_unidade || ""] || saida.material_unidade || "-"}
                    </TableCell>
                    <TableCell>{saida.cliente_nome || "-"}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={saida.observacao || ""}>
                      {saida.observacao || "-"}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {saida.created_by_name || "-"}
                    </TableCell>
                    {(canEdit || canDelete) && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {canEdit && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEdit(saida)}
                              title="Editar"
                              className="h-8 w-8 text-[#F5C800] hover:text-[#F5C800]/80"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onDelete(saida)}
                              title="Excluir"
                              className="h-8 w-8 text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {data.length > 0 && (
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
      )}
    </div>
  )
}
