import type { PermissoesUsuario } from "@/lib/types"

const mapAcao = (view?: boolean, create?: boolean, edit?: boolean, del?: boolean) => {
  const obj: any = {}

  if (view !== undefined) obj.ver = view
  if (create !== undefined) obj.criar = create
  if (edit !== undefined) obj.editar = edit
  if (del !== undefined) obj.deletar = del

  return obj
}


export function mapPermissoesToModulos(permissoes: PermissoesUsuario) {
  return {
    dashboard: {
      view: permissoes.dashboard?.view ?? false
    },
    logs: {
      view: permissoes.logs?.view ?? false
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
