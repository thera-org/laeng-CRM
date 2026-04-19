"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, User, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { PermissoesTab } from "./permissoes-tab"
import type { Usuario, PermissoesUsuario } from "@/lib/types"
import { criarUsuarioAction } from "../actions/userAddLogic"
import { editarUsuarioAction } from "../actions/userEditLogic"

interface UsuarioModalProps {
  usuario?: Usuario | null
  isOpen: boolean
  onClose: () => void
}

const PERMISSOES_DEFAULT: PermissoesUsuario = {
  dashboard: { view: true },
  logs: { view: false},
  diario: { view: false },
  obras: { view: true, edit: false},
  financeira: {view: true, edit: false},
  clientes: { view: false, create: false, delete: false, edit: false },
  estoque: { view: false },
}

function normalizePermissoes(permissoes?: Partial<PermissoesUsuario>): PermissoesUsuario {
  return {
    dashboard: { ...PERMISSOES_DEFAULT.dashboard, ...permissoes?.dashboard },
    logs: { view: permissoes?.logs?.view ?? PERMISSOES_DEFAULT.logs?.view ?? false },
    diario: { view: permissoes?.diario?.view ?? PERMISSOES_DEFAULT.diario?.view ?? false },
    obras: { ...PERMISSOES_DEFAULT.obras, ...permissoes?.obras },
    financeira: { ...PERMISSOES_DEFAULT.financeira, ...permissoes?.financeira },
    clientes: { ...PERMISSOES_DEFAULT.clientes, ...permissoes?.clientes },
    estoque: { view: permissoes?.estoque?.view ?? PERMISSOES_DEFAULT.estoque?.view ?? false },
  }
}

interface FormData {
  login: string
  nomeCompleto: string
  cargo: "admin" | "funcionario"
  ativo: boolean
  senha: string
  confirmarSenha: string
}

const CARGO_OPTIONS = [
  { value: "funcionario", label: "Funcionário" },
  { value: "admin", label: "Administrador" },
] as const

export function UsuarioModal({ usuario, isOpen, onClose }: UsuarioModalProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("informacoes")
  const [permissoes, setPermissoes] = useState<PermissoesUsuario>(() => normalizePermissoes())
  const [formData, setFormData] = useState<FormData>({
    login: "",
    nomeCompleto: "",
    cargo: "funcionario",
    ativo: true,
    senha: "",
    confirmarSenha: "",
  })

  const isEditMode = useMemo(() => !!usuario, [usuario])
  const isPasswordRequired = useMemo(() => !isEditMode, [isEditMode])

  // Inicializar formulário
  useEffect(() => {
    if (isOpen) {
      setActiveTab("informacoes")
      if (usuario) {
      setFormData({
        login: usuario?.login || "",
        nomeCompleto: usuario?.nome_completo || "",
        cargo: usuario?.cargo || "funcionario",
        ativo: usuario?.ativo ?? true,
        senha: "",
        confirmarSenha: "",
      })
      
      setPermissoes(normalizePermissoes(usuario.modulos))

      } else {
        setFormData({
          login: "",
          nomeCompleto: "",
          cargo: "funcionario",
          ativo: true,
          senha: "",
          confirmarSenha: "",
        })
      
        setPermissoes(normalizePermissoes())
      }
    }
  }, [isOpen, usuario])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }, [])

  const handleCargoChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, cargo: value as "admin" | "funcionario" }))
  }, [])

  const handlePermissaoChange = useCallback((
    modulo: keyof PermissoesUsuario,
    acao: string,
    checked: boolean
  ) => {
    setPermissoes(prev => ({
      ...prev,
      [modulo]: {
        ...prev[modulo],
        [acao]: checked,
      },
    }))
  }, [])

  const validarFormulario = useCallback((): string | null => {
    if (!formData.login) return "Login é obrigatório"
    if (isPasswordRequired && !formData.senha) return "Senha é obrigatória para novos usuários"
    if (formData.senha && formData.senha.length < 4) return "Senha deve ter no mínimo 4 caracteres"
    if (formData.senha !== formData.confirmarSenha) return "As senhas não coincidem"
    return null
  }, [formData, isPasswordRequired])

 const handleSubmit = useCallback(async (e: React.FormEvent) => {
  e.preventDefault()
  
  const erroValidacao = validarFormulario()
  if (erroValidacao) {
    toast({
      title: "Erro de validação",
      description: erroValidacao,
      variant: "destructive",
    })
    return
  }

  setIsLoading(true)
  try {

  if (!isEditMode) {
    
    const res = await criarUsuarioAction({
      login: formData.login,
      nomeCompleto: formData.nomeCompleto,
      senha: formData.senha!,
      cargo: formData.cargo,
      permissoes,
    })

    if (!res.ok) {
      toast({
        title: "Erro ao criar usuário",
        description: res.error,
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Usuário criado!",
      description: `${formData.login} foi criado com sucesso.`,
    })
  } else {

    const res = await editarUsuarioAction({
      userId: usuario!.id,
      login: formData.login,
      nomeCompleto: formData.nomeCompleto,
      cargo: formData.cargo,
      senha: formData.senha || null, 
      permissoes,
    })

    if (!res.ok) {
      toast({
        title: "Erro ao editar usuário",
        description: res.error,
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Usuário atualizado!",
      description: `${formData.login} foi atualizado com sucesso.`,
    })
  }

onClose()
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro ao salvar o usuário."
    console.error("❌ Erro ao salvar usuário:", error)
    toast({
      title: "Erro ao salvar",
      description: errorMessage,
      variant: "destructive",
    })
  } finally {
    setIsLoading(false)
  }
}, [formData, isEditMode, permissoes, validarFormulario, toast, onClose, usuario])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="pb-4 pt-6 px-6 border-b border-gray-200 flex-row items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#F5C800] flex items-center justify-center flex-shrink-0 shadow-md">
            <Shield className="h-6 w-6 text-[#1E1E1E]" strokeWidth={2.5} />
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-[#1E1E1E]">
            {usuario ? "Editar Usuário" : "Novo Usuário"}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col flex-1 overflow-hidden">
          <div className="flex justify-center px-6 mt-4">
            <TabsList className="inline-flex w-auto bg-gray-100 h-12 rounded-lg">
              <TabsTrigger 
                value="informacoes"
                className="data-[state=active]:bg-[#F5C800] data-[state=active]:text-[#1E1E1E] font-semibold transition-all rounded-lg px-6"
              >
                <User className="h-4 w-4 mr-2" />
              Informações
            </TabsTrigger>
            <TabsTrigger 
              value="permissoes"
              className="data-[state=active]:bg-[#F5C800] data-[state=active]:text-[#1E1E1E] font-semibold transition-all rounded-lg px-6"
            >
              <Shield className="h-4 w-4 mr-2" />
              Permissões
            </TabsTrigger>
          </TabsList>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            {/* ABA: INFORMAÇÕES */}
            <TabsContent value="informacoes" className="space-y-4 mt-4 overflow-y-auto flex-1 px-6 pb-2">
              <div className="grid gap-4">
                {/* Login */}
                <div className="space-y-2">
                  <Label htmlFor="login" className="font-semibold">
                    Login <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="login"
                    name="login"
                    value={formData.login}
                    onChange={handleInputChange}
                    placeholder="Ex: joao.silva"
                    required
                    disabled={isLoading || !!usuario}
                    className="border-2 focus:border-[#F5C800]"
                  />
                </div>
                {/* Nome Completo */}
                <div className="space-y-2">
                  <Label htmlFor="nomeCompleto" className="font-semibold">
                    Nome Completo <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nomeCompleto"
                    name="nomeCompleto"
                    value={formData.nomeCompleto}
                    onChange={handleInputChange}
                    placeholder="Ex: João da Silva"
                    required
                    disabled={isLoading}
                    className="border-2 focus:border-[#F5C800]"
                  />
                </div>
                {/* Senha */}
                <div className="space-y-2">
                  <Label htmlFor="senha" className="font-semibold">
                    Senha {!usuario && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    id="senha"
                    name="senha"
                    type="password"
                    value={formData.senha}
                    onChange={handleInputChange}
                    placeholder={usuario ? "Deixe em branco para não alterar" : "Mínimo 4 caracteres"}
                    required={!usuario}
                    minLength={4}
                    disabled={isLoading}
                    className="border-2 focus:border-[#F5C800]"
                  />
                </div>

                {/* Confirmar Senha */}
                <div className="space-y-2">
                  <Label htmlFor="confirmarSenha" className="font-semibold">
                    Confirmar Senha {!usuario && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    id="confirmarSenha"
                    name="confirmarSenha"
                    type="password"
                    value={formData.confirmarSenha}
                    onChange={handleInputChange}
                    placeholder={usuario ? "Deixe em branco para não alterar" : "Confirme a senha"}
                    required={!usuario}
                    minLength={4}
                    disabled={isLoading}
                    className="border-2 focus:border-[#F5C800]"
                  />
                </div>

                {/* Cargo */}
                <div className="space-y-2">
                  <Label htmlFor="cargo" className="font-semibold">
                    Cargo <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.cargo}
                    onValueChange={handleCargoChange}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="border-2 focus:border-[#F5C800]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CARGO_OPTIONS.map(({ value, label }) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* ABA: PERMISSÕES */}
            <TabsContent value="permissoes" className="mt-4 overflow-y-auto flex-1 py-5 px-6">
              <PermissoesTab
                permissoes={permissoes}
                onChange={handlePermissaoChange}
                isLoading={isLoading}
              />
            </TabsContent>

            <DialogFooter className="mt-4 pt-4 px-6 pb-6 border-t flex-shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="border-2 hover:bg-gray-100"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-[#F5C800] hover:bg-[#F5C800]/90 text-[#1E1E1E] font-bold min-w-[140px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>{isEditMode ? "Salvar Alterações" : "Criar Usuário"}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
