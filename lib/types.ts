export interface Cliente {
  id: string;
  codigo: number; // Código único sequencial obrigatório
  nome: string;
  status?: 'FINALIZADO' | 'EM ANDAMENTO' | 'PENDENTE'; // Status do cliente
  endereco?: string; // Endereço ou cidade
  data_contrato?: string; // Data do contrato do cliente
  cpf_cnpj?: string;
  telefone?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  created_by?: string;
  created_by_name?: string;
  updated_by_name?: string;
  created_at: string;
  updated_at: string;
  // Campos agregados das obras (calculados automaticamente pela VIEW)
  valor_total?: number; // Soma de valor_total de todas as obras
  entrada_total?: number; // Soma de entrada de todas as obras
  valor_financiado_total?: number; // Soma de valor_financiado de todas as obras
  subsidio_total?: number; // Soma de subsidio de todas as obras
  total_obras?: number; // Contagem de obras
  obras_finalizadas?: number;
  obras_em_andamento?: number;
  obras_pendentes?: number;
}

// ============ TIPOS BASE DE CUSTOS (COMPARTILHADO ENTRE OBRA E OBRAFINANCEIRO) ============
export interface ObraCustos {
  empreiteiro?: number;
  empreiteiro_nome?: string;
  empreiteiro_valor_pago?: number;
  empreiteiro_saldo?: number;
  empreiteiro_percentual?: number;
  terceirizado?: number;
  material?: number;
  mao_de_obra?: number;
  pintor?: number;
  eletricista?: number;
  gesseiro?: number;
  azulejista?: number;
  manutencao?: number;
}

// ============ TIPOS BASE DE MEDIÇÕES (COMPARTILHADO ENTRE OBRA E OBRAFINANCEIRO) ============
export interface ObraMedicoes {
  medicao_01?: number;
  medicao_02?: number;
  medicao_03?: number;
  medicao_04?: number;
  medicao_05?: number;
  medicao_01_data_computacao?: string;
  medicao_02_data_computacao?: string;
  medicao_03_data_computacao?: string;
  medicao_04_data_computacao?: string;
  medicao_05_data_computacao?: string;
}

// ============ TIPOS BASE DE FINANCEIRO (COMPARTILHADO) ============
export interface ObraFinanceiro {
  valor_terreno: number;
  entrada: number;
  valor_financiado: number;
  subsidio: number;
  valor_total: number;
  valor_obra?: number;
}

export interface Obra extends ObraFinanceiro, ObraCustos, ObraMedicoes {
  id: string;
  codigo: number; // Código da obra
  cliente_id: string; // Foreign key para clientes
  responsavel: string; // Responsável pela obra
  entidade?: string; // CUS., S.J., A.F.G, PARTICULAR, PREFEITURA
  tipo_contrato?: 'PARTICULAR' | 'PREFEITURA' | 'CAIXA' | 'FINANCIAMENTO' | 'OUTRO';
  endereco: string; // Endereço da obra
  endereco_obra?: string;
  cidade_obra?: string;
  estado_obra?: string;
  status: 'FINALIZADO' | 'EM ANDAMENTO' | 'PENDENTE';
  data_conclusao?: string; // Data de conclusão da obra
  local_obra?: string;
  fase?: string;
  created_by?: string;
  created_by_name?: string;
  updated_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface ObraComCliente extends Obra {
  cliente_nome: string;
  cliente_endereco: string;
  cliente_cidade: string;
  cliente_telefone?: string;
}

export interface ObraFinanceiroAggregated extends Pick<Obra, 'id' | 'codigo' | 'status' | 'valor_obra'>, ObraFinanceiro, ObraCustos, ObraMedicoes {
  cliente_nome: string;
  custo_total: number;
  resultado: number;
  margem_lucro: number;
  total_medicoes_pagas: number;
  saldo_pendente: number;
  percentual_pago: number;
}

// ============ TIPOS FINANCEIROS ============

export interface Medicao {
  id: string;
  obra_id: string;
  numero_medicao: number; // 1 a 5
  valor: number;
  data_pagamento: string;
  forma_pagamento?: 'DINHEIRO' | 'PIX' | 'TRANSFERENCIA' | 'CHEQUE' | 'BOLETO';
  observacoes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface FluxoCaixa {
  id: string;
  tipo: 'ENTRADA' | 'SAIDA';
  categoria: string;
  valor: number;
  data_movimentacao: string;
  obra_id?: string;
  cliente_id?: string;
  descricao: string;
  forma_pagamento?: string;
  observacoes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardFinanceiro {
  total_obras: number;
  obras_finalizadas: number;
  obras_em_andamento: number;
  obras_pendentes: number;
  receita_total: number;
  custo_total: number;
  lucro_total: number;
  margem_media: number;
  obras_com_lucro: number;
  obras_com_prejuizo: number;
  obras_empate: number;
}

export interface Aviso {
  id: string;
  titulo: string;
  descricao?: string;
  urgencia: 'BAIXA' | 'MÉDIA' | 'ALTA' | 'CRÍTICA';
  status: 'PENDENTE' | 'CONCLUÍDO';
  criado_por: string;
  criado_por_nome?: string;
  atribuido_para?: string;
  atribuido_para_nome?: string;
  data_vencimento?: string;
  data_conclusao?: string;
  created_at: string;
  updated_at: string;
}

export interface FluxoResumo {
  mes: string;
  total_entradas: number;
  total_saidas: number;
  saldo_periodo: number;
}

// Tipos para administração de usuários
export interface Usuario {
  id: string;
  login: string;
  nome_completo: string;
  cargo: 'admin' | 'funcionario';
  ativo: boolean;
  created_at: string;
  updated_at: string;
  ultimo_acesso?: string;
  modulos: PermissoesUsuario
}

export interface PermissoesUsuario {
  dashboard: {
    view: boolean;
  };
  logs?: {
    view: boolean;
  };
  obras: {
    view: boolean;
    edit: boolean;
  };
  financeira: {
    view: boolean;
    edit: boolean;
  };
  clientes: {
    view: boolean;
    create: boolean;
    delete: boolean;
    edit: boolean;
  };
  'material-entrada'?: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
  'material-saida'?: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
}

//TIPOS PARA O MÓDULO DE PAGAMENTOS


export interface Pagamentos {
  id: string;
  codigo: number;
  description?: string;
  amount: number;
  type?: 'receita' | 'despesa',
  date: string,
  method?: string;
  status?: string;
  category_id?: string,
  cliente_id?: string,
  user_id?: string,
  account_id?: string;
  installments_current?: number;
  installments_total?: number;
  created_at?: string,
  updated_at?: string,
  category_name?: string;
  subcategory_name?: string;
  subcategories_id?: string;
  cliente_nome?: string;
}

export interface PaymentFiltersState {
  type: string
  category: string
  month: string
  year: string
  week: string
}

export interface Account {
  id?: string,
  name?: string,
  created_at?: string
}

export interface Categories {
  id?: string,
  name?: string,
  type?: 'receita' | 'despesa',
  created_at?: string
}

export interface FinancialMetrics {
  totalCount: number;
  receitaTotal: number;
  despesaTotal: number;
  despesaCount: number;
  receitaCount: number;
  saldo: number;
}

// ============ TIPOS PARA O MODULO DE ALMOXARIFADO ============

export interface Material {
  id: string;
  nome: string;
  created_at: string;
  updated_at: string;
}

export interface MaterialEntrada {
  id: string;
  material_id: string;
  quantidade: number;
  data: string;
  cliente_id?: string;
  observacao?: string;
  created_at: string;
  updated_at: string;
  material_nome?: string;
  cliente_nome?: string;
  cliente_codigo?: number;
}

export interface MaterialSaida {
  id: string;
  material_id: string;
  quantidade: number;
  data: string;
  cliente_id?: string;
  observacao?: string;
  created_at: string;
  updated_at: string;
  material_nome?: string;
  cliente_nome?: string;
  cliente_codigo?: number;
}

export interface MaterialFiltersState {
  material: string;
  month: string;
  year: string;
  week: string;
}

export interface FluxoMaterialResumo {
  material_id: string;
  material_nome: string;
  total_entradas: number;
  total_saidas: number;
  estoque_atual: number;
}
