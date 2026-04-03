"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Eye, Plus, Trash2, LayoutDashboard, Users, Building2, DollarSign, LogsIcon, Pencil, Package } from "lucide-react"
import type { PermissoesUsuario } from "@/lib/types"
import { icon } from "leaflet"

interface PermissoesTabProps {
  permissoes: PermissoesUsuario
  onChange: (modulo: keyof PermissoesUsuario, acao: string, checked: boolean) => void
  isLoading: boolean
}

const MODULOS = [
  {
    id: "dashboard",
    label: "Dashboard",
    descricao: "Acesso à página inicial",
    icon: LayoutDashboard,
    acoes: ["view"],
  },
  {
    id: "logs",
    label: "Logs",
    descricao: "Acesso aos logs do sistema",
    icon: LogsIcon,
    acoes: ["view"],
  },
  {
    id: "financeira",
    label: "Financeira",
    descricao: "Gerenciamento financeiro",
    icon: DollarSign,
    acoes: ["view", "edit"],
  },
  {
    id: "obras",
    label: "Obras",
    descricao: "Gerenciamento de obras",
    icon: Building2,
    acoes: ["view", "edit"],
  },
  {
    id: "clientes",
    label: "Clientes",
    descricao: "Gerenciamento de clientes",
    icon: Users,
    acoes: ["view", "create", "edit", "delete"],
  },
  {
    id: "material-entrada",
    label: "Entrada de Material",
    descricao: "Registro de entrada de materiais",
    icon: Package,
    acoes: ["view", "create", "edit", "delete"],
  },
  {
    id: "material-saida",
    label: "Saida de Material",
    descricao: "Registro de saida de materiais",
    icon: Package,
    acoes: ["view", "create", "edit", "delete"],
  },
] as const

const ICONS_ACAO = {
  view: Eye,
  create: Plus,
  delete: Trash2,
  edit: Pencil, 
}

const LABELS_ACAO = {
  view: "Ver",
  create: "Criar",
  delete: "Deletar",
  edit: "Editar",  
}

export function PermissoesTab({ permissoes, onChange, isLoading }: PermissoesTabProps) {
  return (
    <div className="space-y-4">
      {MODULOS.map((modulo) => {
        const moduloId = modulo.id as keyof PermissoesUsuario
        const permissaoModulo = permissoes[moduloId]
        const temMultiplasAcoes = modulo.acoes.length > 1
        const IconModulo = modulo.icon
        return (
          <div
            key={modulo.id}
            className="border-2 border-[#F5C800]/60 rounded-xl p-5 bg-[#1E1E1E] hover:border-[#F5C800] hover:shadow-xl hover:shadow-[#F5C800]/20 transition-all"
          >
            {/* Header do Módulo */}
            <div className={`flex items-center ${temMultiplasAcoes ? "gap-3 mb-4" : "justify-between"}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#F5C800] flex items-center justify-center shadow-md">
                  <IconModulo className="h-5 w-5 text-[#1E1E1E]" strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">{modulo.label}</h3>
                  <p className="text-xs text-gray-300 mt-0.5">{modulo.descricao}</p>
                </div>
              </div>

              {/* Checkbox único para módulos com uma ação */}
              {!temMultiplasAcoes && permissaoModulo && (
                <Checkbox
                  id={`${modulo.id}-view`}
                  checked={permissaoModulo.view as boolean}
                  onCheckedChange={(checked) =>
                    onChange(moduloId, "view", checked as boolean)
                  }
                  disabled={isLoading}
                  className="h-5 w-5 rounded-md border-[#F5C800] bg-black/40 data-[state=checked]:bg-[#F5C800] data-[state=checked]:border-[#F5C800] data-[state=checked]:text-blacktransition-all duration-200"
                />
              )}
            </div>

            {/* Grid de Ações */}
            {temMultiplasAcoes && (
              <div className="grid grid-cols-2 gap-2">
                {modulo.acoes.map((acao) => {
                  const IconAcao = ICONS_ACAO[acao as keyof typeof ICONS_ACAO]
                  const labelAcao = LABELS_ACAO[acao as keyof typeof LABELS_ACAO]
                  const isChecked = (permissaoModulo as Record<string, boolean>)[acao]

                  return (
                    <label
                      key={acao}
                      className="flex items-center gap-2 p-2.5 rounded-lg border border-[#F5C800]/30 bg-black/30 hover:border-[#F5C800] hover:bg-black/50 cursor-pointer transition-colors"
                    >
                      <Checkbox
                        id={`${modulo.id}-${acao}`}
                        checked={isChecked}
                        onCheckedChange={(checked) =>
                          onChange(moduloId, acao, checked as boolean)
                        }
                        disabled={isLoading}
                        className="h-4 w-4 border-[#F5C800] data-[state=checked]:bg-[#F5C800]"
                      />
                      <div className="flex items-center gap-1.5">
                        <IconAcao className="h-3.5 w-3.5 text-[#F5C800]" />
                        <span className="text-xs font-semibold text-white">{labelAcao}</span>
                      </div>
                    </label>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
  