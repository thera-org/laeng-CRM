import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formatação de moeda
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

// Formatação de data (sem problemas de timezone)
export function formatDate(date: string | null | undefined): string {
  if (!date) return "-"
  
  // Se a data está no formato YYYY-MM-DD, fazer parse manual para evitar timezone
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }
  
  // Para outros formatos, usar Date normal
  return new Date(date).toLocaleDateString('pt-BR')
}

// Buscar endereço via CEP (ViaCEP API)
export async function buscarCepViaCep(cep: string): Promise<{
  logradouro?: string
  localidade?: string
  uf?: string
  erro?: boolean
} | null> {
  const cepLimpo = cep.replace(/\D/g, '')
  if (cepLimpo.length !== 8) return null

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
    const data = await response.json()
    return data
  } catch (error) {
    // Erro silencioso - CEP inválido ou API indisponível
    return null
  }
}

// Formatar valor para input monetário (com máscara)
export function formatMoneyInput(value: number): string {
  return value.toLocaleString('pt-BR', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })
}

// Converter string de input monetário para número
export function parseMoneyInput(value: string): number {
  if (!value) return 0
  // Se tem vírgula, já está no formato pt-BR (ex: "1.500,00")
  if (value.includes(',')) {
    const cleaned = value.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '')
    return Number(cleaned) || 0
  }
  // Sem vírgula: assume formato de máscara progressiva (ex: "150000" → 1500.00)
  const numericValue = value.replace(/\D/g, '')
  return Number(numericValue) / 100
}

// Formatação de percentual
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}

// Converter data do formato YYYY-MM-DD para o formato do input (sem problemas de timezone)
export function formatDateForInput(dateString: string | null | undefined): string {
  if (!dateString) return new Date().toISOString().split('T')[0];
  
  // Se já está no formato YYYY-MM-DD, retornar direto
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  // Caso contrário, tentar converter
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
}

// Converter data do input para string sem conversão de timezone
// Garante que a data 2025-12-16 seja salva como 2025-12-16, não 2025-12-15
export function parseDateFromInput(dateString: string): string {
  if (!dateString) return new Date().toISOString().split('T')[0];
  
  // Input date já vem no formato YYYY-MM-DD correto
  // Apenas validar e retornar
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  return new Date().toISOString().split('T')[0];
}
