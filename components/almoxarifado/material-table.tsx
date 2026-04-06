"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PagamentosPagination } from "@/components/pagamentos/pagamentos-pagination"
import { usePagination } from "@/lib/table-utils"
import type { Material } from "@/lib/types"
import { Boxes, Package, Pencil, Ruler, Trash2, Warehouse } from "lucide-react"

interface MaterialTableProps {
  data: Material[]
  onEdit: (material: Material) => void
  onDelete: (material: Material) => void
}

function formatQuantity(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 2,
  }).format(value)
}

export function MaterialTable({ data, onEdit, onDelete }: MaterialTableProps) {
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
  } = usePagination(data, 50)

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
        <Package className="h-12 w-12 mb-3 opacity-20" />
        <p>Nenhum material encontrado.</p>
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
                <TableHead className="text-[#F5C800] font-bold py-3 pl-4 min-w-[220px]">MATERIAL</TableHead>
                <TableHead className="text-[#F5C800] font-bold py-3 min-w-[170px]">CLASSE</TableHead>
                <TableHead className="text-[#F5C800] font-bold py-3 min-w-[170px]">GRUPO</TableHead>
                <TableHead className="text-[#F5C800] font-bold py-3 text-center w-[110px]">UNIDADE</TableHead>
                <TableHead className="text-[#F5C800] font-bold py-3 text-center w-[150px]">QTD./OBRA</TableHead>
                <TableHead className="text-[#F5C800] font-bold py-3 text-center w-[150px]">ESTOQUE</TableHead>
                <TableHead className="text-[#F5C800] font-bold py-3 text-right pr-6 w-[130px]">AÇÕES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((material) => (
                <TableRow key={material.id} className="hover:bg-[#F5C800]/5 border-b border-gray-100 transition-colors h-[60px]">
                  <TableCell className="py-3 pl-4">
                    <div className="flex items-center gap-2">
                      <Package className="h-3.5 w-3.5 text-gray-400" />
                      <span className="font-semibold text-gray-800 truncate" title={material.nome}>
                        {material.nome}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Boxes className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-sm text-gray-600 truncate" title={material.classe_nome}>
                        {material.classe_nome}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Boxes className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-sm text-gray-600 truncate" title={material.grupo_nome}>
                        {material.grupo_nome}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    <Badge className="font-mono bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold text-xs px-2 py-1">
                      <Ruler className="h-3 w-3 mr-1" />
                      {material.unidade}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-center">
                    <span className="font-semibold text-sm text-gray-700">{formatQuantity(material.quant_por_obra)}</span>
                  </TableCell>

                  <TableCell className="text-center">
                    <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                      <Warehouse className="h-3.5 w-3.5 text-gray-400" />
                      {formatQuantity(material.estoque_global)}
                    </div>
                  </TableCell>

                  <TableCell className="py-3 text-right pr-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        onClick={() => onEdit(material)}
                        className="bg-[#F5C800] hover:bg-[#F5C800]/90 border-2 border-[#F5C800] h-9 w-9 p-0 transition-colors"
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4 text-[#1E1E1E]" />
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDelete(material)}
                        className="border-2 border-red-300 hover:border-red-500 hover:bg-red-50 h-9 w-9 p-0 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
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