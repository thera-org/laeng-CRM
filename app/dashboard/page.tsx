import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, DollarSign, Activity } from 'lucide-react';
import Link from "next/link";
import { DashboardAlerts } from "@/components/dashboard-alerts";
import { DashboardCharts } from "@/components/dashboard-charts";
import { calculateDashboardMetrics } from "@/lib/dashboard-metrics";
import { getUserContext } from "../auth/context/userContext";

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Disable caching completely


export default async function DashboardPage() {
  const supabase = await createClient();

  const { userPermissions } = await getUserContext();

  // Buscar dados em paralelo com no-cache
  const [
    { data: clientesData },
    { data: obras },
    { data: avisos }
  ] = await Promise.all([
    supabase
      .from("clientes")
      .select("*"),
    supabase
      .from("obras")
      .select("*, clientes(data_contrato)"),
    supabase
      .from("avisos")
      .select("*")
      .eq("status", "PENDENTE")
      .order("urgencia", { ascending: false })
      .order("created_at", { ascending: false })
  ]);

  // ========== ANÁLISE CLIENTES E OBRAS ==========
  const metrics = calculateDashboardMetrics(clientesData, obras);

  const {
    clientesTotal,
    clientesFinalizados,
    clientesEmAndamento,
    clientesPendentes,
    clientesComObrasList,
    receitaTotal,
    custoTotal,
    lucroTotal,
    totalRecebido,
    ticketMedio,
  } = metrics;

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="space-y-1 sm:space-y-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent uppercase">
          DASHBOARD
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm md:text-base">
          Visão geral do negócio - {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* GRID PRINCIPAL - CARDS + AVISOS */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-3">
        {/* COLUNA ESQUERDA (2/3) - MÉTRICAS */}
        <div className="lg:col-span-2 space-y-6">
          {/* PRIMEIRA LINHA - CLIENTES */}
          <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-4 auto-rows-fr">
            <Card className="border-0 shadow-lg bg-yellow-400 hover:shadow-xl transition-shadow flex flex-col h-full min-h-40">
              <CardHeader className="pb-2 sm:pb-3 flex-shrink-0">
                <CardTitle className="text-xs sm:text-sm font-bold text-black uppercase">Total de Clientes</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex items-center">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-black">{clientesTotal}</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-green-600 hover:shadow-xl transition-shadow flex flex-col h-full min-h-40">
              <CardHeader className="pb-2 sm:pb-3 flex-shrink-0">
                <CardTitle className="text-xs sm:text-sm font-bold text-white uppercase">Finalizados</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex items-center">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">{clientesFinalizados}</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-red-600 hover:shadow-xl transition-shadow flex flex-col h-full min-h-40">
              <CardHeader className="pb-2 sm:pb-3 flex-shrink-0">
                <CardTitle className="text-xs sm:text-sm font-bold text-white uppercase">Em Andamento</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex items-center">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">{clientesEmAndamento}</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-blue-600 hover:shadow-xl transition-shadow flex flex-col h-full min-h-40">
              <CardHeader className="pb-2 sm:pb-3 flex-shrink-0">
                <CardTitle className="text-xs sm:text-sm font-bold text-white uppercase">Pendente</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex items-center">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">{clientesPendentes}</div>
              </CardContent>
            </Card>
          </div>

          {/* SEGUNDA LINHA - FINANCEIRO */}
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 auto-rows-fr">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-slate-100/50 hover:shadow-xl transition-shadow flex flex-col h-full min-h-40">
              <CardHeader className="pb-2 sm:pb-3 flex-shrink-0">
                <CardTitle className="text-xs sm:text-sm font-medium text-slate-600 uppercase">Receita</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex items-center">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-slate-700">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(receitaTotal)}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-indigo-100/50 hover:shadow-xl transition-shadow flex flex-col h-full min-h-40">
              <CardHeader className="pb-2 sm:pb-3 flex-shrink-0">
                <CardTitle className="text-xs sm:text-sm font-medium text-slate-600 uppercase">Ticket Médio</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex items-center">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-indigo-600">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(ticketMedio)}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* COLUNA DIREITA (1/3) - AVISOS */}
        <DashboardAlerts
          avisosPendentes={avisos || []}
        />
      </div>

      {/* GRÁFICOS */}
      <DashboardCharts obras={obras || []} />

      {/* Quick Links */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        { userPermissions?.clientes?.view && (
        <Link href="/clientes" className="group h-full">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all h-full hover:scale-105 transform">
            <CardContent className="p-4 sm:p-6 flex flex-col items-center sm:flex-row sm:items-center gap-3 sm:gap-4 h-full">
              <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-500 transition-colors flex-shrink-0">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <div className="text-center sm:text-left">
                <p className="font-semibold text-xs sm:text-sm uppercase">Clientes</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Gestão</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        )}

        { userPermissions?.obras?.view &&(
        <Link href="/obras" className="group h-full">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all h-full hover:scale-105 transform">
            <CardContent className="p-4 sm:p-6 flex flex-col items-center sm:flex-row sm:items-center gap-3 sm:gap-4 h-full">
              <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-500 transition-colors flex-shrink-0">
                <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 group-hover:text-white transition-colors" />
              </div>
              <div className="text-center sm:text-left">
                <p className="font-semibold text-xs sm:text-sm uppercase">Obras</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Projetos</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        )}

        { userPermissions?.financeira?.view &&(
        <Link href="/financeira" className="group h-full">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all h-full hover:scale-105 transform">
            <CardContent className="p-4 sm:p-6 flex flex-col items-center sm:flex-row sm:items-center gap-3 sm:gap-4 h-full">
              <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-500 transition-colors flex-shrink-0">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 group-hover:text-white transition-colors" />
              </div>
              <div className="text-center sm:text-left">
                <p className="font-semibold text-xs sm:text-sm uppercase">Financeira</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Fluxo</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        )}

        { userPermissions?.logs?.view && ( 
        <Link href="/logs" className="group h-full">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all h-full hover:scale-105 transform">
            <CardContent className="p-4 sm:p-6 flex flex-col items-center sm:flex-row sm:items-center gap-3 sm:gap-4 h-full">
              <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-500 transition-colors flex-shrink-0">
                <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 group-hover:text-white transition-colors" />
              </div>
              <div className="text-center sm:text-left">
                <p className="font-semibold text-xs sm:text-sm uppercase">Logs</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Atividades</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        )}
        
      </div>
    </div>
  );
}
