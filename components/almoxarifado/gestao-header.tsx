"use client"

import { Package, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface GestaoHeaderProps {
  totalMateriais: number
  onNewMaterial: () => void
}

export function GestaoHeader({
  totalMateriais,
  onNewMaterial,
}: GestaoHeaderProps) {
  return (
    <div className="bg-[#1E1E1E] border-b-2 sm:border-b-4 border-[#F5C800] shadow-lg">
      <div className="px-3 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight uppercase flex items-center gap-3">
              <Package className="h-20 w-6 text-[#F5C800]" />
              Gestão de Materiais
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-[#F5C800]/20 text-[#F5C800] hover:bg-[#F5C800]/30 border-0">
                <Package className="h-31 w-3 mr-1.5" />
                {totalMateriais} materiais
              </Badge>
            </div>
          </div>

          <Button
            onClick={onNewMaterial}
            className="h-10 bg-[#F5C800] hover:bg-[#F5C800]/90 text-[#1E1E1E] font-bold px-4 shadow-sm sm:w-auto w-full"
          >
            <Plus className="h-10p w-4 mr-2" />
            Novo Material
          </Button>
        </div>
      </div>
    </div>
  )
}
