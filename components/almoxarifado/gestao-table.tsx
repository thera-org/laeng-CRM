"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import type { Material } from "@/lib/types"
import { usePagination } from "@/lib/table-utils"
import { PagamentosPagination } from "@/components/pagamentos/pagamentos-pagination"

interface GestaoTableProps {
  data: Material[]
  onEdit: (material: Material) => void
  onDelete: (material: Material) => void
}

export function GestaoTable({ data, onEdit, onDelete }: GestaoTableProps) {
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
                <TableHead className="text-[#F5C800] font-bold py-3">NOME</TableHead>
                <TableHead className="text-[#F5C800] font-bold py-3 text-right">AÇÕES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-8 text-gray-500">
                    Nenhum material encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((material) => (
                  <TableRow key={material.id} className="hover:bg-[#F5C800]/5">
                    <TableCell className="font-medium">{material.nome}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(material)}
                          title="Editar"
                          className="h-8 w-8 text-[#F5C800] hover:text-[#F5C800]/80"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(material)}
                          title="Excluir"
                          className="h-8 w-8 text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
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
