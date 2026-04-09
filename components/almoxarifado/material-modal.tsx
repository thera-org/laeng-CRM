"use client"

import { UNIDADES_MEDIDA } from "@/components/almoxarifado/types/almoxarifadoTypes"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import type { Material, MaterialClasse, MaterialGrupo, MaterialManagementMode } from "@/lib/types"
import { useGestaoModals } from "@/components/almoxarifado/hooks/useGestaoModals"

interface MaterialModalProps {
  isOpen: boolean
  onClose: () => void
  mode: MaterialManagementMode
  material?: Material | null
  classe?: MaterialClasse | null
  grupo?: MaterialGrupo | null
  classes: MaterialClasse[]
  groups: MaterialGrupo[]
}

const TITLES: Record<MaterialManagementMode, { create: string; edit: string }> = {
  material: { create: "Novo Material", edit: "Editar Material" },
  classe: { create: "Nova Classe", edit: "Editar Classe" },
  grupo: { create: "Novo Grupo", edit: "Editar Grupo" },
}

export function MaterialModal({ isOpen, onClose, mode, material, classe, grupo, classes, groups }: MaterialModalProps) {
  const { formData, updateField, saveMaterial, isLoading, isEditing } = useGestaoModals(
    isOpen,
    onClose,
    mode,
    { material, classe, grupo }
  )

  const title = isEditing ? TITLES[mode].edit : TITLES[mode].create

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl min-h-[20vh] max-h-[90vh] flex flex-col p-0 bg-white">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gray-50/50">
          <DialogTitle className="text-2xl font-bold text-[#1E1E1E]">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto px-6 py-6 space-y-6 scrollbar-thin flex-10">
          <div className="space-y-2">
            <Label htmlFor="nome" className="font-semibold text-sm text-gray-700">
              {mode === "material" ? "Nome do Material *" : mode === "classe" ? "Nome da Classe *" : "Nome do Grupo *"}
            </Label>
            <Input
              id="nome"
              placeholder={
                mode === "material"
                  ? "Ex: Cimento, Areia, Tijolo..."
                  : mode === "classe"
                    ? "Ex: Acabamento"
                    : "Ex: Argamassas"
              }
              value={formData.nome}
              onChange={(e) => updateField("nome", e.target.value)}
              disabled={isLoading}
              className="border-gray-300 focus:border-[#F5C800]"
            />
          </div>

          {mode === "material" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-semibold text-sm text-gray-700">Classe *</Label>
                  <Select value={formData.classeId} onValueChange={(value) => updateField("classeId", value)} disabled={isLoading}>
                    <SelectTrigger className="border-gray-300 focus:border-[#F5C800]">
                      <SelectValue placeholder="Selecione a classe..." />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((materialClass) => (
                        <SelectItem key={materialClass.id} value={materialClass.id}>{materialClass.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold text-sm text-gray-700">Grupo *</Label>
                  <Select value={formData.grupoId} onValueChange={(value) => updateField("grupoId", value)} disabled={isLoading}>
                    <SelectTrigger className="border-gray-300 focus:border-[#F5C800]">
                      <SelectValue placeholder="Selecione o grupo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>{group.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-semibold text-sm text-gray-700">Unidade *</Label>
                  <Select value={formData.unidade} onValueChange={(value) => updateField("unidade", value)} disabled={isLoading}>
                    <SelectTrigger className="border-gray-300 focus:border-[#F5C800]">
                      <SelectValue placeholder="Selecione a unidade..." />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIDADES_MEDIDA.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>{unit.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantPorObra" className="font-semibold text-sm text-gray-700">
                    Quantidade por Obra *
                  </Label>
                  <Input
                    id="quantPorObra"
                    type="number"
                    min={0.01}
                    step="any"
                    placeholder="Ex: 10"
                    value={formData.quantPorObra}
                    onChange={(e) => updateField("quantPorObra", e.target.value)}
                    disabled={isLoading}
                    className="border-gray-300 focus:border-[#F5C800]"
                  />
                </div>
              </div>

              {material && (
                <div className="rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-900">
                  Estoque global atual: <span className="font-bold">{material.estoque_global}</span>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter className="flex justify-between items-center px-6 py-4 border-t bg-gray-50 mt-auto w-full">
          <Button variant="ghost" onClick={onClose} disabled={isLoading} className="text-gray-500 hover:text-gray-900">
            Cancelar
          </Button>
          <Button
            onClick={saveMaterial}
            disabled={isLoading}
            className={
              isEditing
                ? "bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold min-w-[150px]"
                : "bg-[#1E1E1E] text-white hover:bg-[#333] font-bold min-w-[150px] border border-[#F5C800]"
            }
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : isEditing ? (
              "Salvar"
            ) : (
              "Cadastrar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


//teste