"use client";

import { Obra } from "@/lib/types";
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Cell } from 'recharts';

interface ObraComClientes extends Obra {
  clientes?: {
    data_contrato?: string;
  };
  created_at?: string;
}

interface DashboardChartsProps {
  obras: ObraComClientes[];
}

export function DashboardCharts({ obras }: DashboardChartsProps) {
  const COLORS = {
    emAndamento: '#E53935',
    finalizado: '#22C55E',
    pendente: '#3B82F6',
    yellow: '#F5C800',
  };

  // Faturamento por Status
  const faturamentoPorStatus = obras.reduce((acc, obra) => {
    const status = obra.status || 'PENDENTE';
    const existing = acc.find(item => item.name === status);
    const valor = Number(obra.valor_total) || 0;
    if (existing) {
      existing.value += valor;
    } else {
      acc.push({ 
        name: status === 'EM ANDAMENTO' ? 'EM ANDAMENTO' : status === 'FINALIZADO' ? 'FINALIZADO' : 'PENDENTE',
        value: valor 
      });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const faturamentoPorStatusOrdenado = [
    faturamentoPorStatus.find(f => f.name === 'FINALIZADO') || { name: 'FINALIZADO', value: 0 },
    faturamentoPorStatus.find(f => f.name === 'EM ANDAMENTO') || { name: 'EM ANDAMENTO', value: 0 },
    faturamentoPorStatus.find(f => f.name === 'PENDENTE') || { name: 'PENDENTE', value: 0 },
  ];

  // Obras por Status
  const obrasPorStatus = obras.reduce((acc, obra) => {
    const status = obra.status || 'PENDENTE';
    const existing = acc.find(item => item.name === status);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: status, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const obrasPorStatusOrdenado = [
    obrasPorStatus.find(o => o.name === 'EM ANDAMENTO') || { name: 'EM ANDAMENTO', value: 0 },
    obrasPorStatus.find(o => o.name === 'FINALIZADO') || { name: 'FINALIZADO', value: 0 },
    obrasPorStatus.find(o => o.name === 'PENDENTE') || { name: 'PENDENTE', value: 0 },
  ];

  // Faturamento por Ano (não utilizado - mantém compatibilidade)

  // Obras por Ano (dinâmico - sem filtro de 5 obras)
  const obrasPorAno = (() => {
    // Agrupar obras por ano extraído de data_contrato do cliente
    const obrasPorAnoMap: { [key: number]: number } = {};
    
    obras.forEach((obra) => {
      // Extrair ano: data_contrato do cliente (preferencial) ou created_at da obra (fallback)
      let ano = new Date(obra.created_at!).getFullYear()
      if (obra.clientes && obra.clientes.data_contrato) {
        ano = new Date(obra.clientes.data_contrato).getFullYear()
      }

      if (!obrasPorAnoMap[ano]) {
        obrasPorAnoMap[ano] = 0;
      }
      obrasPorAnoMap[ano] += 1;
    });

    // Incluir TODOS os anos (sem filtrar)
    return Object.keys(obrasPorAnoMap)
      .map(Number)
      .sort((a, b) => a - b)
      .map(ano => ({
        ano,
        quantidade: obrasPorAnoMap[ano]
      }));
  })();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const getBarColor = (name: string) => {
    if (name === 'EM ANDAMENTO') return COLORS.emAndamento;
    if (name === 'FINALIZADO') return COLORS.finalizado;
    return COLORS.pendente;
  };

  const getPieColors = () => [COLORS.emAndamento, COLORS.finalizado, COLORS.pendente];

  const gerarDadosFaturamentoPorAno = () => {
    // Agrupar obras por ano extraído de data_contrato do cliente
    const obrasPorAno: { [key: number]: number } = {};
    
    obras.forEach((obra) => {
      // Extrair ano: data_contrato do cliente (preferencial) ou created_at da obra (fallback)
      let ano = new Date(obra.created_at!).getFullYear()
      if (obra.clientes && obra.clientes.data_contrato) {
        ano = new Date(obra.clientes.data_contrato).getFullYear()
      }

      const valor = Number(obra.valor_total) || 0;
      
      if (!obrasPorAno[ano]) {
        obrasPorAno[ano] = 0;
      }
      obrasPorAno[ano] += valor;
    });

    // Obter todos os anos únicos e ordenar
    const todosOsAnos = Object.keys(obrasPorAno)
      .map(Number)
      .sort((a, b) => a - b);

    // Se não houver dados, retornar array vazio
    if (todosOsAnos.length === 0) {
      return [];
    }

    // Obter o ano MÁXIMO (mais no futuro)
    const anoMaximo = Math.max(...todosOsAnos);
    
    // Selecionar 4 anos: do (anoMaximo - 3) até anoMaximo
    const anoMinimo = anoMaximo - 3;
    const anosExibicao = todosOsAnos.filter(ano => ano >= anoMinimo && ano <= anoMaximo);

    // Montar dados do gráfico
    const dados = anosExibicao.map(ano => ({
      ano,
      valor: obrasPorAno[ano]
    }));

    return dados;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {/* Card 1: FATURAMENTO x FASE */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-[#1E1E1E] px-6 py-4">
          <h3 className="text-base font-bold text-[#F5C800] uppercase tracking-wide">Faturamento x Fase</h3>
        </div>
        <div className="p-6 bg-white flex flex-col items-center justify-center" style={{ height: '360px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={faturamentoPorStatusOrdenado} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fontSize: 0 }} />
              <Bar dataKey="value" name="Valor" radius={[6, 6, 0, 0]} label={{ position: 'top', formatter: (value: number) => formatCurrency(value), fontSize: 12, fontWeight: 'bold', fill: '#1E1E1E' }}>
                {faturamentoPorStatusOrdenado.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.name)} />
                ))}
              </Bar>
              <Legend 
                wrapperStyle={{ display: 'flex', justifyContent: 'center' }}
                payload={faturamentoPorStatusOrdenado.map((entry) => ({
                  value: entry.name,
                  type: 'circle',
                  color: getBarColor(entry.name)
                }))}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Card 2: OBRAS x FASE */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-[#1E1E1E] px-6 py-4">
          <h3 className="text-base font-bold text-[#F5C800] uppercase tracking-wide">Obras x Fase</h3>
        </div>
        <div className="p-6 bg-white flex flex-col items-center justify-center" style={{ height: '360px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={obrasPorStatusOrdenado}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: { value: number }) => entry.value}
                outerRadius={90}
                dataKey="value"
              >
                {obrasPorStatusOrdenado.map((entry, index) => (
                  <Cell key={`pie-${index}`} fill={getPieColors()[index]} />
                ))}
              </Pie>
              <Legend 
                wrapperStyle={{ paddingTop: '40px', display: 'flex', justifyContent: 'center' }}
                payload={obrasPorStatusOrdenado.map((entry, index) => ({
                  value: entry.name,
                  type: 'circle',
                  color: getPieColors()[index]
                }))}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Card 3: FATURAMENTO x ANO */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-[#1E1E1E] px-6 py-4">
          <h3 className="text-base font-bold text-[#F5C800] uppercase tracking-wide">Faturamento x Ano</h3>
        </div>
        <div className="p-8 bg-white" style={{ height: '480px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={gerarDadosFaturamentoPorAno()} margin={{ top: 50, right: 50, left: 50, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="ano" tick={{ fontSize: 14, fill: '#666' }} />
              <Line 
                type="monotone" 
                dataKey="valor" 
                stroke={COLORS.yellow}
                strokeWidth={3}
                dot={{
                  fill: COLORS.yellow,
                  r: 7,
                  strokeWidth: 2,
                  stroke: '#1E1E1E',
                }}
                activeDot={{ r: 9 }}
                label={{ position: 'top', offset: 20, formatter: (value: number) => formatCurrency(value), fontSize: 11, fontWeight: 'bold', fill: '#1E1E1E' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Card 4: OBRA x ANO */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-[#1E1E1E] px-6 py-4">
          <h3 className="text-base font-bold text-[#F5C800] uppercase tracking-wide">Obra x Ano</h3>
        </div>
        <div className="p-8 bg-white" style={{ height: '480px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={obrasPorAno} margin={{ top: 50, right: 50, left: 50, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="ano" tick={{ fontSize: 14, fill: '#666' }} />
              <Line 
                type="monotone" 
                dataKey="quantidade" 
                stroke={COLORS.yellow}
                strokeWidth={3}
                dot={{ fill: COLORS.yellow, r: 7, strokeWidth: 2, stroke: '#1E1E1E' }}
                activeDot={{ r: 9 }}
                label={{ position: 'top', offset: 20, fontSize: 11, fontWeight: 'bold', fill: '#1E1E1E' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
