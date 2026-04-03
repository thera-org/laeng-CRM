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
    'material-entrada': {
      view: permissoes['material-entrada']?.view ?? false,
      create: permissoes['material-entrada']?.create ?? false,
      edit: permissoes['material-entrada']?.edit ?? false,
      delete: permissoes['material-entrada']?.delete ?? false
    },
    'material-saida': {
      view: permissoes['material-saida']?.view ?? false,
      create: permissoes['material-saida']?.create ?? false,
      edit: permissoes['material-saida']?.edit ?? false,
      delete: permissoes['material-saida']?.delete ?? false
    }
  }
}
