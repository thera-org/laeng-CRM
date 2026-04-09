"use client"

import { useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { MaterialGrupo } from "@/lib/types"

interface GroupSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  groups: MaterialGrupo[]
  onConfirm: (groupId: string) => void
}

export function GroupSelectorModal({ isOpen, onClose, groups, onConfirm }: GroupSelectorModalProps) {
  const [selectedGroupId, setSelectedGroupId] = useState("")

  const sortedGroups = useMemo(
    () => [...groups].sort((a, b) => a.nome.localeCompare(b.nome)),
    [groups]
  )

  const handleClose = () => {
    setSelectedGroupId("")
    onClose()
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleClose()
        }
      }}
    >
      <DialogContent className="max-w-md p-0 bg-white">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gray-50/50">
          <DialogTitle className="text-2xl font-bold text-[#1E1E1E]">Selecionar Grupo</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Escolha o grupo que você quer editar.
          </p>
        </DialogHeader>

        <div className="px-6 py-6">
          <div className="space-y-2">
            <Label className="font-semibold text-sm text-gray-700">Grupo</Label>
            <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
              <SelectTrigger className="border-gray-300 focus:border-[#F5C800]">
                <SelectValue placeholder="Selecione um grupo..." />
              </SelectTrigger>
              <SelectContent>
                {sortedGroups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>{group.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex justify-between items-center px-6 py-4 border-t bg-gray-50">
          <Button variant="ghost" onClick={handleClose} className="text-gray-500 hover:text-gray-900">
            Cancelar
          </Button>
          <Button
            onClick={() => onConfirm(selectedGroupId)}
            disabled={!selectedGroupId}
            className="bg-[#1E1E1E] text-white hover:bg-[#333] font-bold min-w-[150px] border border-[#F5C800]"
          >
            Editar Grupo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
