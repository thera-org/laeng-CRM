"use client"

import { Input } from "@/components/ui/input"
import { Search, Package, Plus, RotateCcw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface GestaoHeaderProps {
  totalMateriais: number
  totalAtivos: number
  searchTerm: string
  setSearchTerm: (term: string) => void
  onNewMaterial: () => void
}

export function GestaoHeader({
  totalMateriais,
  totalAtivos,
  searchTerm,
  setSearchTerm,
  onNewMaterial,
}: GestaoHeaderProps) {
  return (
    <div className="bg-[#1E1E1E] border-b-2 sm:border-b-4 border-[#F5C800] shadow-lg">
      <div className="px-3 sm:px-6 lg:px-8 py-4">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight uppercase flex items-center gap-3">
            <Package className="h-6 w-6 text-[#F5C800]" />
            Gestao de Materiais
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
          <div className="flex items-center bg-gray-800/50 rounded-lg p-1 border border-gray-700">
            <Badge variant="outline" className="border-0 bg-transparent text-[#F5C800] hover:bg-transparent font-bold">
              <Package className="h-3 w-3 mr-1.5" /> Total
            </Badge>
            <div className="h-4 w-[1px] bg-gray-600 mx-1"></div>
            <Badge className="bg-[#F5C800]/20 text-[#F5C800] hover:bg-[#F5C800]/30 border-0 mr-1">
              {totalMateriais} materiais
            </Badge>
          </div>
          <span className="text-gray-500 text-xs font-medium whitespace-nowrap ml-auto sm:ml-2">
            {totalAtivos} ativos
          </span>
        </div>

        <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#F5C800]" />
              <Input
                placeholder="Buscar material por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 bg-white border-0 text-gray-900 placeholder:text-gray-500 rounded-md shadow-sm w-full"
              />
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                onClick={onNewMaterial}
                className="h-10 bg-[#F5C800] sm:w-[160px] hover:bg-[#F5C800]/90 text-[#1E1E1E] font-bold px-4 shadow-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Material
              </Button>

              {searchTerm && (
                <Button
                  variant="destructive"
                  onClick={() => setSearchTerm("")}
                  size="icon"
                  className="h-10 w-10 shrink-0"
                  title="Limpar Busca"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
