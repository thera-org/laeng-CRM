/**
 * Biblioteca de Cálculos para Obras
 * Centraliza todas as operações matemáticas relacionadas a obras e financeiro
 * para manter consistência em todo o aplicativo
 */

/**
 * Calcula o saldo devido ao empreiteiro
 * @param empreiteiro Valor total do empreiteiro
 * @param empreiteiro_valor_pago Valor já pago
 * @returns Saldo restante a pagar
 */
export function calculateEmpreiteiroSaldo(
  empreiteiro: number,
  empreiteiro_valor_pago: number
): number {
  return Math.max(0, empreiteiro - empreiteiro_valor_pago);
}

/**
 * Calcula o percentual de pagamento do empreiteiro
 * @param empreiteiro Valor total do empreiteiro
 * @param empreiteiro_valor_pago Valor já pago
 * @returns Percentual de pagamento (0-100)
 */
export function calculateEmpreiteiroPercentual(
  empreiteiro: number,
  empreiteiro_valor_pago: number
): number {
  if (empreiteiro === 0) return 0;
  return (empreiteiro_valor_pago / empreiteiro) * 100;
}

/**
 * Calcula o custo total de uma obra
 * @param custos Objeto contendo todos os custos (empreiteiro, material, mão de obra, etc)
 * @returns Custo total
 */
export function calculateTotalCustos(custos: {
  valor_terreno?: number;
  empreiteiro?: number;
  material?: number;
  mao_de_obra?: number;
  terceirizado?: number;
  pintor?: number;
  eletricista?: number;
  gesseiro?: number;
  azulejista?: number;
  manutencao?: number;
}): number {
  return (
    (custos.valor_terreno || 0) +
    (custos.empreiteiro || 0) +
    (custos.material || 0) +
    (custos.mao_de_obra || 0) +
    (custos.terceirizado || 0) +
    (custos.pintor || 0) +
    (custos.eletricista || 0) +
    (custos.gesseiro || 0) +
    (custos.azulejista || 0) +
    (custos.manutencao || 0)
  );
}

/**
 * Calcula a margem de lucro de uma obra
 * @param valor_total Valor total contratado
 * @param custo_total Custo total da obra
 * @returns Margem em percentual (0-100)
 */
export function calculateMargemLucro(
  valor_total: number,
  custo_total: number
): number {
  if (valor_total === 0) return 0;
  return ((valor_total - custo_total) / valor_total) * 100;
}

/**
 * Calcula o resultado líquido de uma obra
 * @param valor_total Valor total contratado
 * @param custo_total Custo total da obra
 * @returns Resultado (lucro ou prejuízo)
 */
export function calculateResultado(
  valor_total: number,
  custo_total: number
): number {
  return valor_total - custo_total;
}

/**
 * Calcula o valor total contratual da obra
 * @param entrada Entrada/adiantamento
 * @param valor_financiado Valor financiado
 * @param subsidio Subsídio recebido
 * @returns Valor total
 */
export function calculateValorTotal(
  entrada: number = 0,
  valor_financiado: number = 0,
  subsidio: number = 0
): number {
  return entrada + valor_financiado + subsidio;
}

/**
 * Calcula estatísticas agregadas de múltiplas obras
 * @param obras Array de obras com dados financeiros
 * @returns Objeto com estatísticas
 */
export function calculateObraStatistics(obras: Array<{
  valor_total?: number;
  status?: string;
  valor_obra?: number;
  valor_terreno?: number;
  empreiteiro?: number;
  material?: number;
  mao_de_obra?: number;
  terceirizado?: number;
  pintor?: number;
  eletricista?: number;
  gesseiro?: number;
  azulejista?: number;
  manutencao?: number;
}>) {
  const valorTotal = obras.reduce((sum, obra) => sum + (obra.valor_total || 0), 0);
  const obrasEmAndamento = obras.filter(o => o.status === "EM ANDAMENTO").length;
  const obrasFinalizadas = obras.filter(o => o.status === "FINALIZADO").length;
  
  const custoTotal = obras.reduce((sum, obra) => 
    sum + calculateTotalCustos(obra), 
    0
  );
  
  const resultado = valorTotal - custoTotal;
  const margemMedia = valorTotal > 0 ? (resultado / valorTotal) * 100 : 0;

  return {
    valorTotal,
    custoTotal,
    resultado,
    margemMedia,
    obrasEmAndamento,
    obrasFinalizadas,
    totalObras: obras.length,
  };
}
