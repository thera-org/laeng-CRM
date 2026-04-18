"use client"

import { useRef } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  CloudLightning,
  CloudRain,
  CloudSun,
  Loader2,
  Search,
  Sun,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react"
import { isoToBR, brToISO, maskDateInput } from "@/components/pagamentos/libs/pagamentos-financial"
import { useDiarioModal } from "./hooks/useDiarioModal"
import {
  CLIMAS,
  COLABORADOR_ROLES,
  MAX_ATIVIDADE_LEN,
  MAX_FOTOS,
  PROGRESSO_ITEMS,
  TURNOS,
} from "./types/diarioTypes"
import { cn } from "@/lib/utils"
import type { Clima, DiarioComCliente } from "@/lib/types"

interface DiarioModalProps {
  isOpen: boolean
  onClose: () => void
  diario?: DiarioComCliente | null
  defaultResponsavel?: string
}

const CLIMA_ICON: Record<Clima, React.ComponentType<{ className?: string }>> = {
  sol: Sun,
  nublado: CloudSun,
  chuva: CloudRain,
  impraticavel: CloudLightning,
}

export function DiarioModal({ isOpen, onClose, diario, defaultResponsavel }: DiarioModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const m = useDiarioModal(isOpen, onClose, diario, defaultResponsavel)
  const showFormFields = m.isEditing || !!m.selectedCliente
  const linkedClienteNome = diario?.cliente_nome || m.selectedCliente?.nome || ""
  const selectedTurnos = TURNOS.filter((turno) => m.selectedTurnos.includes(turno.value))
  const availableTurnos = TURNOS.filter((turno) => !m.selectedTurnos.includes(turno.value))

  const progressoTotal = PROGRESSO_ITEMS.length
  const progressoChecked = PROGRESSO_ITEMS.reduce(
    (acc, it) => acc + (m.progresso[it.key] ? 1 : 0),
    0
  )
  const progressoPct = progressoTotal === 0 ? 0 : Math.round((progressoChecked / progressoTotal) * 100)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[92vh] flex flex-col p-0 bg-white">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gray-50/50">
          <DialogTitle className="text-2xl font-bold text-[#1E1E1E]">
            {m.isEditing ? "Editar Diário" : "Novo Diário"}
          </DialogTitle>
          {!m.isEditing && (
            <p className="text-sm text-muted-foreground">
              Selecione um cliente para liberar o preenchimento do diário.
            </p>
          )}
        </DialogHeader>

        <div className="overflow-y-auto px-6 py-6 space-y-6 flex-1">
          {m.isEditing ? (
            <>
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                <div className="font-semibold">Cliente vinculado: {linkedClienteNome}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="font-semibold text-sm text-gray-700">Responsável</Label>
                  <div className="flex items-center gap-2 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{m.responsavel}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Data</Label>
                  <Input
                    type="text"
                    placeholder="DD/MM/AAAA"
                    value={isoToBR(m.data)}
                    onChange={(e) => {
                      const masked = maskDateInput(e.target.value)
                      const iso = brToISO(masked)
                      m.setData(iso || masked)
                    }}
                    maxLength={10}
                    className="border-gray-300 focus:border-[#F5C800]"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label className="font-semibold text-sm text-gray-700">Responsável</Label>
                <div className="flex items-center gap-2 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{m.responsavel}</span>
                </div>
              </div>

              <div className="space-y-2 relative">
                <Label className="text-base font-semibold">Cliente</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar cliente por nome..."
                    value={m.searchTerm}
                    onChange={(e) => m.setSearchTerm(e.target.value)}
                    className="pl-9 border-gray-300 focus:border-[#F5C800]"
                  />
                </div>
                {m.searchTerm.length >= 2 && !m.selectedCliente && (
                  <div className="mt-1 w-full z-50 bg-white border border-gray-200 rounded-md shadow-sm max-h-60 overflow-y-auto">
                    {m.loadingClientes ? (
                      <div className="p-4 text-center">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto text-[#F5C800]" />
                      </div>
                    ) : m.filteredClientes.length === 0 ? (
                      <div className="p-3 text-sm text-gray-500 text-center">
                        Nenhum cliente encontrado.
                      </div>
                    ) : (
                      m.filteredClientes.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => m.selectClienteFromSearch(c.id, c.nome)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 border-b last:border-b-0"
                        >
                          <span className="font-medium">{c.nome}</span>
                          <span className="ml-2 text-xs text-gray-500">
                            #{String(c.codigo).padStart(3, "0")}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
                {m.selectedCliente && (
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-md flex justify-between items-center text-blue-800">
                    <div>
                      <span className="font-bold">{m.selectedCliente.nome}</span>
                      <span className="ml-2 text-xs">
                        #{String(m.selectedCliente.codigo).padStart(3, "0")}
                      </span>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => m.selectClienteFromSearch("", "")}
                      className="text-blue-600 hover:bg-blue-100 hover:text-blue-900"
                    >
                      Trocar
                    </Button>
                  </div>
                )}
              </div>

              {m.selectedCliente && (
                <>
                  <div className="h-[1px] bg-gray-200"></div>

                  <div className="space-y-1">
                    <Label>Data</Label>
                    <Input
                      type="text"
                      placeholder="DD/MM/AAAA"
                      value={isoToBR(m.data)}
                      onChange={(e) => {
                        const masked = maskDateInput(e.target.value)
                        const iso = brToISO(masked)
                        m.setData(iso || masked)
                      }}
                      maxLength={10}
                      className="border-gray-300 focus:border-[#F5C800]"
                    />
                  </div>
                </>
              )}
            </>
          )}

          {showFormFields && (
            <>
              {/* Turnos e Clima por turno */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label className="text-xs font-bold uppercase text-gray-500 tracking-wider">
                    Turnos e Clima
                  </Label>
                  {availableTurnos.length > 0 && (
                    <span className="text-[11px] text-gray-500">
                      Adicione apenas os turnos restantes.
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableTurnos.map((turno) => (
                    <button
                      key={turno.value}
                      type="button"
                      onClick={() => m.addTurno(turno.value)}
                      className="px-4 py-2 rounded-full border-2 text-sm font-semibold transition bg-white border-gray-300 text-gray-700 hover:border-[#F5C800]"
                    >
                      {turno.label}
                    </button>
                  ))}
                </div>
                {availableTurnos.length === 0 && (
                  <p className="text-xs text-gray-500">Todos os turnos foram adicionados.</p>
                )}

                <div className="space-y-3">
                  {selectedTurnos.length === 0 ? (
                    <div className="rounded-md border border-dashed border-gray-300 bg-white/80 px-4 py-3 text-sm text-gray-500">
                      Selecione um turno para definir o clima correspondente.
                    </div>
                  ) : (
                    selectedTurnos.map((turno) => {
                      const selectedClima = m.climaPorTurno[turno.value] ?? null

                      return (
                        <div
                          key={turno.value}
                          className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm space-y-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-[#1E1E1E]">{turno.label}</p>
                              <p className="text-xs text-gray-500">
                                Defina o clima deste turno ou deixe como não definido.
                              </p>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => m.removeTurno(turno.value)}
                              className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remover
                            </Button>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => m.setTurnoClima(turno.value, null)}
                              className={cn(
                                "px-4 py-2 rounded-full border-2 text-sm font-semibold transition",
                                selectedClima === null
                                  ? "bg-[#F5C800] border-[#F5C800] text-black"
                                  : "bg-white border-gray-300 text-gray-700 hover:border-[#F5C800]"
                              )}
                            >
                              Não definido
                            </button>
                            {CLIMAS.map((clima) => {
                              const Icon = CLIMA_ICON[clima.value]
                              const active = selectedClima === clima.value

                              return (
                                <button
                                  key={clima.value}
                                  type="button"
                                  title={clima.label}
                                  onClick={() => m.setTurnoClima(turno.value, clima.value)}
                                  className={cn(
                                    "flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-semibold transition",
                                    active
                                      ? "bg-[#F5C800]/10 border-[#F5C800] text-[#1E1E1E]"
                                      : "bg-white border-gray-300 text-gray-600 hover:border-[#F5C800]"
                                  )}
                                >
                                  <Icon className="h-4 w-4" />
                                  {clima.label}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Colaboradores */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-gray-500 tracking-wider">
                  Colaboradores
                </Label>
                <div className="rounded-md border border-gray-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-3 py-2 font-semibold text-gray-700">Colaboradores</th>
                        <th className="text-right px-3 py-2 font-semibold text-gray-700 w-32">Quantidade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {COLABORADOR_ROLES.map((r) => (
                        <tr key={r.key} className="border-t">
                          <td className="px-3 py-2">{r.label}</td>
                          <td className="px-3 py-1 text-right">
                            <Input
                              type="number"
                              min={0}
                              value={m.colaboradores[r.key] ?? 0}
                              onChange={(e) => m.setColaborador(r.key, parseInt(e.target.value || "0"))}
                              className="h-8 text-right [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Atividade */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold uppercase text-gray-500 tracking-wider">
                    Atividade
                  </Label>
                  <span className="text-[11px] text-gray-500">
                    {m.atividade.length}/{MAX_ATIVIDADE_LEN}
                  </span>
                </div>
                <Textarea
                  value={m.atividade}
                  onChange={(e) => m.setAtividadeBounded(e.target.value)}
                  maxLength={MAX_ATIVIDADE_LEN}
                  rows={6}
                  className="resize-none overflow-y-auto border-gray-300 focus:border-[#F5C800]"
                  placeholder="Descreva as atividades realizadas..."
                />
              </div>

              {/* Progresso */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold uppercase text-gray-500 tracking-wider">
                    Progresso da Obra
                  </Label>
                  <Badge className="bg-[#F5C800] text-black hover:bg-[#F5C800]/90 font-bold">
                    {progressoPct}%
                  </Badge>
                </div>
                <div className="rounded-md border border-gray-200 overflow-hidden max-h-72 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="text-left px-3 py-2 font-semibold text-gray-700">Itens</th>
                        <th className="text-center px-3 py-2 font-semibold text-gray-700 w-28">
                          Finalizado
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {PROGRESSO_ITEMS.map((it) => (
                        <tr key={it.key} className="border-t">
                          <td className="px-3 py-2 text-xs">{it.label}</td>
                          <td className="px-3 py-1 text-center">
                            <Checkbox
                              checked={!!m.progresso[it.key]}
                              onCheckedChange={() => m.toggleProgresso(it.key)}
                              className="border-2 border-gray-600 data-[state=checked]:border-[#F5C800] data-[state=checked]:bg-[#F5C800] data-[state=unchecked]:bg-gray-400"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Fotos */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold uppercase text-gray-500 tracking-wider">
                    Registro Fotográfico
                  </Label>
                  <span className="text-[11px] text-gray-500">
                    {m.pendingFotos.length}/{MAX_FOTOS} (JPEG/PNG, máx. 50 MB)
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {m.pendingFotos.map((pf) => (
                    <div key={pf.id} className="relative w-24 h-24 rounded border border-gray-200 overflow-hidden group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={pf.previewUrl} alt={pf.file.name} className="object-cover w-full h-full" />
                      <button
                        type="button"
                        onClick={() => m.removePendingFoto(pf.id)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-90 hover:opacity-100"
                        title="Remover"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {m.pendingFotos.length < MAX_FOTOS && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-24 h-24 rounded border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 hover:border-[#F5C800] hover:text-[#1E1E1E]"
                    >
                      <Upload className="h-5 w-5 mb-1" />
                      <span className="text-[10px] font-semibold">Adicionar</span>
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) m.addFotos(e.target.files)
                    e.target.value = ""
                  }}
                />
                {m.isEditing && (
                  <p className="text-[11px] text-gray-500 italic">
                    Fotos já enviadas são gerenciadas na tabela após salvar.
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex justify-between items-center px-6 py-4 border-t bg-gray-50 mt-auto w-full">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={m.isSaving}
            className="text-gray-500 hover:text-gray-900"
          >
            Cancelar
          </Button>
          <Button
            onClick={m.save}
            disabled={m.isSaving || (!m.isEditing && !m.selectedCliente)}
            className="bg-[#1E1E1E] text-white hover:bg-[#333] font-bold min-w-[150px] border border-[#F5C800]"
          >
            {m.isSaving ? <Loader2 className="animate-spin h-4 w-4" /> : (m.isEditing ? "Salvar Alterações" : "Salvar Diário")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Re-export icon for tests/use elsewhere if needed
export { Trash2 }
