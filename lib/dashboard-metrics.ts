/**
 * Funções de cálculo para métricas do Dashboard
 * Centraliza a lógica de agregação de dados financeiros
 */

import type { Cliente, Obra } from "@/lib/types";

export interface DashboardMetrics {
  // Clientes
  clientesTotal: number;
  clientesFinalizados: number;
  clientesEmAndamento: number;
  clientesPendentes: number;
  clientesComObrasList: string[];
  
  // Obras
  totalObras: number;
  obrasFinalizadas: number;
  obrasEmAndamento: number;
  obrasPendentes: number;
  
  // Financeiro
  receitaTotal: number;
  custoTotal: number;
  lucroTotal: number;
  margemLucro: number;
  totalRecebido: number;
  ticketMedio: number;
}

/**
 * Calcula métricas agregadas do dashboard
 * @param clientesData Array de clientes
 * @param obras Array de obras
 * @returns Objeto com todas as métricas calculadas
 */
export function calculateDashboardMetrics(
  clientesData: Cliente[] | null,
  obras: Obra[] | null
): DashboardMetrics {
  // ========== ANÁLISE CLIENTES ==========
  const clientesTotal = clientesData?.length || 0;
  const clientesFinalizados = clientesData?.filter(c => c.status === 'FINALIZADO').length || 0;
  const clientesEmAndamento = clientesData?.filter(c => c.status === 'EM ANDAMENTO').length || 0;
  const clientesPendentes = clientesData?.filter(c => c.status === 'PENDENTE' || !c.status).length || 0;

  // ========== ANÁLISE OBRAS ==========
  const totalObras = obras?.length || 0;
  const obrasFinalizadas = obras?.filter(o => o.status === 'FINALIZADO').length || 0;
  const obrasEmAndamento = obras?.filter(o => o.status === 'EM ANDAMENTO').length || 0;
  const obrasPendentes = obras?.filter(o => o.status === 'PENDENTE' || !o.status).length || 0;

  // ========== ANÁLISE FINANCEIRA ==========
  const receitaTotal = obras?.reduce((sum, obra) => sum + (Number(obra.valor_total) || 0), 0) || 0;
  const custoTotal = obras?.reduce((sum, obra) => sum + (Number(obra.custo_total) || 0), 0) || 0;
  const lucroTotal = receitaTotal - custoTotal;
  const margemLucro = receitaTotal > 0 ? (lucroTotal / receitaTotal) * 100 : 0;

  const totalRecebido = obras?.reduce((sum, obra) => {
    // Usa total_medicoes_pagas da view se disponível, senão soma os campos individuais
    const medicoes = obra.total_medicoes_pagas != null
      ? Number(obra.total_medicoes_pagas)
      : (Number(obra.medicao_01) || 0) + (Number(obra.medicao_02) || 0) +
        (Number(obra.medicao_03) || 0) + (Number(obra.medicao_04) || 0) +
        (Number(obra.medicao_05) || 0);
    return sum + medicoes;
  }, 0) || 0;

  // Clientes com obras ativas
  const clientesComObrasList = [...new Set(obras?.map(o => o.cliente_id) || [])];
  const ticketMedio = clientesComObrasList.length > 0 ? receitaTotal / clientesComObrasList.length : 0;

  return {
    clientesTotal,
    clientesFinalizados,
    clientesEmAndamento,
    clientesPendentes,
    clientesComObrasList,
    totalObras,
    obrasFinalizadas,
    obrasEmAndamento,
    obrasPendentes,
    receitaTotal,
    custoTotal,
    lucroTotal,
    margemLucro,
    totalRecebido,
    ticketMedio,
  };
}
