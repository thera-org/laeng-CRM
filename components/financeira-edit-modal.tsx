"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import type { ObraFinanceiroAggregated } from "@/lib/types"
import { useRouter } from "next/navigation"
import { formatMoneyInput, parseMoneyInput } from "@/lib/utils"
import { Loader2, DollarSign } from "lucide-react"

interface FinanceiraEditModalProps {
  isOpen: boolean
  onClose: () => void
  obra?: ObraFinanceiroAggregated
}

interface FinanceiraData {
  valor_terreno: number
  entrada: number
  valor_financiado: number
  subsidio: number
  valor_obra: number
  empreiteiro: number
  empreiteiro_nome: string
  empreiteiro_valor_pago: number
  terceirizado: number
  material: number
  mao_de_obra: number
  pintor: number
  eletricista: number
  gesseiro: number
  azulejista: number
  manutencao: number
}

export function FinanceiraEditModal({ isOpen, onClose, obra }: FinanceiraEditModalProps) {
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)

  const [data, setData] = useState<FinanceiraData>({
    valor_terreno: 0,
    entrada: 0,
    valor_financiado: 0,
    subsidio: 0,
    valor_obra: 0,
    empreiteiro: 0,
    empreiteiro_nome: "",
    empreiteiro_valor_pago: 0,
    terceirizado: 0,
    material: 0,
    mao_de_obra: 0,
    pintor: 0,
    eletricista: 0,
    gesseiro: 0,
    azulejista: 0,
    manutencao: 0,
  })

  // Carregar dados da obra quando o modal abrir
  useEffect(() => {
    if (isOpen && obra) {
      setData({
        valor_terreno: Number(obra.valor_terreno) || 0,
        entrada: Number(obra.entrada) || 0,
        valor_financiado: Number(obra.valor_financiado) || 0,
        subsidio: Number(obra.subsidio) || 0,
        valor_obra: Number(obra.valor_obra) || 0,
        empreiteiro: Number(obra.empreiteiro) || 0,
        empreiteiro_nome: obra.empreiteiro_nome || "",
        empreiteiro_valor_pago: Number(obra.empreiteiro_valor_pago) || 0,
        terceirizado: Number(obra.terceirizado) || 0,
        material: Number(obra.material) || 0,
        mao_de_obra: Number(obra.mao_de_obra) || 0,
        pintor: Number(obra.pintor) || 0,
        eletricista: Number(obra.eletricista) || 0,
        gesseiro: Number(obra.gesseiro) || 0,
        azulejista: Number(obra.azulejista) || 0,
        manutencao: Number(obra.manutencao) || 0,
      })
    }
  }, [isOpen, obra])

  const handleSave = async () => {
    if (!obra) return

    setIsLoading(true)
    try {
      // custo_total, resultado e margem_lucro são colunas GERADAS pelo banco — não enviar no update
      // Atualizar dados financeiros da obra
      const { error: obraError } = await supabase
        .from("obras")
        .update({
          valor_terreno: data.valor_terreno,
          entrada: data.entrada,
          valor_financiado: data.valor_financiado,
          subsidio: data.subsidio,
          valor_total: data.entrada + data.valor_financiado + data.subsidio,
          valor_obra: data.valor_obra,
          empreiteiro: data.empreiteiro,
          empreiteiro_nome: data.empreiteiro_nome,
          empreiteiro_valor_pago: data.empreiteiro_valor_pago,
          empreiteiro_saldo: Math.max(0, data.empreiteiro - data.empreiteiro_valor_pago),
          empreiteiro_percentual: data.empreiteiro > 0 ? Math.min(100, (data.empreiteiro_valor_pago / data.empreiteiro) * 100) : 0,
          terceirizado: data.terceirizado,
          material: data.material,
          mao_de_obra: data.mao_de_obra,
          pintor: data.pintor,
          eletricista: data.eletricista,
          gesseiro: data.gesseiro,
          azulejista: data.azulejista,
          manutencao: data.manutencao,
          updated_at: new Date().toISOString()
        })
        .eq("id", obra.id)

      if (obraError) throw obraError

      toast({
        title: "✅ Dados financeiros atualizados!",
        description: `Os dados foram sincronizados em todas as seções.`,
        duration: 3000,
      })

      setIsLoading(false)
      onClose()
      
      // Recarregar dados
      await new Promise(resolve => setTimeout(resolve, 300))
      router.refresh()
      
    } catch (error) {
      console.error("Erro ao salvar:", error)
      const errorMessage = error instanceof Error ? error.message : "Erro ao salvar dados financeiros"
      
      toast({
        title: "❌ Erro ao salvar",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      })
      
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-[#F5C800]" />
            Editar Dados Financeiros
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-2">
            Obra: <span className="font-semibold">{obra?.cliente_nome || "N/A"}</span> • Código: <span className="font-semibold">#{String(obra?.codigo).padStart(3, '0')}</span>
          </p>
        </DialogHeader>

        <form className="overflow-y-auto flex-1 px-6 py-4 space-y-6 scrollbar-thin">
          {/* Seção de Valores Contratuais */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[#1E1E1E]">Valores Contratuais</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valor_terreno" className="text-sm font-semibold">Terreno (R$)</Label>
                <Input
                  id="valor_terreno"
                  type="text"
                  value={formatMoneyInput(data.valor_terreno)}
                  onChange={(e) => setData({ ...data, valor_terreno: parseMoneyInput(e.target.value) })}
                  disabled={isLoading}
                  className="border-2 focus:border-[#F5C800] font-mono"
                  placeholder="0,00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="entrada" className="text-sm font-semibold">Entrada (R$)</Label>
                <Input
                  id="entrada"
                  type="text"
                  value={formatMoneyInput(data.entrada)}
                  onChange={(e) => setData({ ...data, entrada: parseMoneyInput(e.target.value) })}
                  disabled={isLoading}
                  className="border-2 focus:border-[#F5C800] font-mono"
                  placeholder="0,00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valor_financiado" className="text-sm font-semibold">Financiado (R$)</Label>
                <Input
                  id="valor_financiado"
                  type="text"
                  value={formatMoneyInput(data.valor_financiado)}
                  onChange={(e) => setData({ ...data, valor_financiado: parseMoneyInput(e.target.value) })}
                  disabled={isLoading}
                  className="border-2 focus:border-[#F5C800] font-mono"
                  placeholder="0,00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subsidio" className="text-sm font-semibold">Subsídio (R$)</Label>
                <Input
                  id="subsidio"
                  type="text"
                  value={formatMoneyInput(data.subsidio)}
                  onChange={(e) => setData({ ...data, subsidio: parseMoneyInput(e.target.value) })}
                  disabled={isLoading}
                  className="border-2 focus:border-[#F5C800] font-mono"
                  placeholder="0,00"
                />
              </div>
            </div>

            {/* Valor Contratual */}
            <div className="bg-[#F5C800] p-4 rounded-lg">
              <p className="text-sm font-semibold text-[#1E1E1E] mb-1">Valor Contratual</p>
              <p className="text-3xl font-bold text-[#1E1E1E]">
                R$ {formatMoneyInput(data.entrada + data.valor_financiado + data.subsidio)}
              </p>
            </div>
          </div>

          {/* Seção de Custos */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-bold text-[#1E1E1E]">Custos da Obra</h3>
            
            {/* Empreiteiro */}
            <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200 space-y-3">
              <h4 className="font-semibold text-blue-900">Dados do Empreiteiro</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="empreiteiro_nome" className="text-sm">Nome</Label>
                  <Input
                    id="empreiteiro_nome"
                    value={data.empreiteiro_nome}
                    onChange={(e) => setData({ ...data, empreiteiro_nome: e.target.value })}
                    disabled={isLoading}
                    className="border-2 focus:border-blue-500"
                    placeholder="Nome do empreiteiro"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="empreiteiro" className="text-sm">Valor Contratado (R$)</Label>
                  <Input
                    id="empreiteiro"
                    type="text"
                    value={formatMoneyInput(data.empreiteiro)}
                    onChange={(e) => setData({ ...data, empreiteiro: parseMoneyInput(e.target.value) })}
                    disabled={isLoading}
                    className="border-2 focus:border-blue-500 font-mono"
                    placeholder="0,00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="empreiteiro_valor_pago" className="text-sm">Valor Pago (R$)</Label>
                  <Input
                    id="empreiteiro_valor_pago"
                    type="text"
                    value={formatMoneyInput(data.empreiteiro_valor_pago)}
                    onChange={(e) => setData({ ...data, empreiteiro_valor_pago: parseMoneyInput(e.target.value) })}
                    disabled={isLoading}
                    className="border-2 focus:border-blue-500 font-mono"
                    placeholder="0,00"
                  />
                </div>
              </div>
            </div>

            {/* Demais Custos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { key: "terceirizado", label: "Terceirizado (R$)" },
                { key: "material", label: "Material (R$)" },
                { key: "mao_de_obra", label: "Mão de Obra (R$)" },
                { key: "pintor", label: "Pintor (R$)" },
                { key: "eletricista", label: "Eletricista (R$)" },
                { key: "gesseiro", label: "Gesseiro (R$)" },
                { key: "azulejista", label: "Azulejista (R$)" },
                { key: "manutencao", label: "Manutenção (R$)" },
              ].map(({ key, label }) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key} className="text-sm">{label}</Label>
                  <Input
                    id={key}
                    type="text"
                    value={formatMoneyInput(data[key as keyof FinanceiraData] as number)}
                    onChange={(e) => 
                      setData({ 
                        ...data, 
                        [key]: parseMoneyInput(e.target.value) 
                      })
                    }
                    disabled={isLoading}
                    className="border-2 focus:border-[#F5C800] font-mono text-sm"
                    placeholder="0,00"
                  />
                </div>
              ))}
            </div>
            {/* Resumo Financeiro */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Custo Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {formatMoneyInput(
                    data.empreiteiro + data.terceirizado + data.material + data.mao_de_obra +
                    data.pintor + data.eletricista + data.gesseiro + data.azulejista + data.manutencao +
                    data.valor_terreno
                  )}
                </p>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Resultado</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {formatMoneyInput(
                    (data.entrada + data.valor_financiado + data.subsidio) -
                    (data.empreiteiro + data.terceirizado + data.material + data.mao_de_obra +
                     data.pintor + data.eletricista + data.gesseiro + data.azulejista + data.manutencao +
                     data.valor_terreno)
                  )}
                </p>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Margem de Lucro</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.entrada + data.valor_financiado + data.subsidio > 0
                    ? (
                      ((data.entrada + data.valor_financiado + data.subsidio) -
                      (data.empreiteiro + data.terceirizado + data.material + data.mao_de_obra +
                       data.pintor + data.eletricista + data.gesseiro + data.azulejista + data.manutencao +
                       data.valor_terreno)) /
                      (data.entrada + data.valor_financiado + data.subsidio)
                    ) * 100).toFixed(2)
                    : (0).toFixed(2)
                  }
                  %
                </p>
              </div>
            </div>
          </div>
        </form>

        <DialogFooter className="gap-2 sm:gap-0 px-6 py-4 border-t bg-gray-50">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="border-2"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isLoading}
            className="bg-[#F5C800] text-[#1E1E1E] hover:bg-[#F5C800]/90 font-bold"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Alterações"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
