import type { PermissoesUsuario } from "@/lib/types"

export function mapPermissoesToModulos(permissoes: PermissoesUsuario) {
  return {
    dashboard: {
      view: permissoes.dashboard?.view ?? false
    },
    logs: {
      view: permissoes.logs?.view ?? false
    },
    diario: {
      view: permissoes.diario?.view ?? false
    },
    obras: {
      view: permissoes.obras?.view ?? false,
      edit: permissoes.obras?.edit ?? false
    },
    financeira: {
      view: permissoes.financeira?.view ?? false,
      edit: permissoes.financeira?.edit ?? false
    },
    clientes: {
      view: permissoes.clientes?.view ?? false,
      create: permissoes.clientes?.create ?? false,
      edit: permissoes.clientes?.edit ?? false,
      delete: permissoes.clientes?.delete ?? false
    },
    estoque: {
      view: permissoes.estoque?.view ?? false,
    }
  }
}
