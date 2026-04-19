"use client";

import {
  LayoutDashboard,
  Users,
  Building2,
  DollarSign,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ScrollText,
  User,
  Shield,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Package,
  PackagePlus,
  PackageMinus,
  ArrowLeftRight,
  ClipboardList,
  CalendarRange
} from 'lucide-react';
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { PermissoesUsuario } from "@/lib/types";
import { Toaster } from "@/components/ui/toaster";

type UserPermissions = Partial<PermissoesUsuario>;

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    group: 1
  },
  {
    title: "Clientes",
    icon: Users,
    href: "/clientes",
    group: 1
  },
  {
    title: "Obras",
    icon: Building2,
    href: "/obras",
    group: 1
  },
  {
    title: "Financeiro",
    icon: DollarSign,
    href: "/financeira",
    group: 1
  },
  {
    title: "Receita",
    icon: TrendingUp,
    href: "/receita",
    group: 2
  },
  {
    title: "Despesas",
    icon: TrendingDown,
    href: "/despesas",
    group: 2
  },
  {
    title: "Fluxo de Caixa",
    icon: BarChart3,
    href: "/fluxoDeCaixa",
    group: 2
  },
  {
    title: "Materiais",
    icon: Package,
    href: "/materiais",
    group: 3
  },
  {
    title: "Entrada",
    icon: PackagePlus,
    href: "/entrada",
    group: 3
  },
  {
    title: "Saida",
    icon: PackageMinus,
    href: "/saida",
    group: 3
  },
  {
    title: "Fluxo Material",
    icon: ArrowLeftRight,
    href: "/fluxoDeMaterial",
    group: 3
  },
  {
    title: "Diário de Obras",
    icon: ClipboardList,
    href: "/diarioDeObras",
    group: 1
  },
  {
    title: "Planejamento",
    icon: CalendarRange,
    href: "/planejamentoDeObras",
    group: 1
  },
  {
    title: "Admin",
    icon: Shield,
    href: "/admin",
    group: 4
  },
  {
    title: "Logs",
    icon: ScrollText,
    href: "/logs",
    group: 4
  },
];

function Logo({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="flex items-center justify-center h-16 border-b border-gray-800 bg-[#1E1E1E]">
      {collapsed ? (
        <div className="w-10 h-10 rounded-lg bg-[#F5C800] flex items-center justify-center">
          <Image
            src="/icon.jpg"
            alt="LA"
            width={40}
            height={40}
          />
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#F5C800] flex items-center justify-center shadow-lg">
            <Image
              src="/icon.jpg"
              alt="LA Engenharia"
              width={50}
              height={50}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-white" style={{ fontFamily: "'Engravers Gothic BT', sans-serif" }}>LA Engenharia</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Sidebar({ collapsed, onToggle, user, userRole, userPermissions }: { collapsed: boolean; onToggle: () => void; user: SupabaseUser; userRole: string, userPermissions: UserPermissions; }) {
  const pathname = usePathname();

  let items =
    userRole === "admin"
      ? menuItems
      : menuItems.filter((i) => i.title !== "Admin" && i.title !== "Receita" && i.title !== "Despesas" && i.title !== "Fluxo de Caixa" && i.title !== "Materiais" && i.title !== "Fluxo Material");

  if (!userPermissions?.dashboard?.view) {
    items = items.filter((i) => i.title !== "Dashboard")
  }

  if (!userPermissions?.clientes?.view) {
    items = items.filter((i) => i.title !== "Clientes")
  }

  if (!userPermissions?.obras?.view) {
    items = items.filter((i) => i.title !== "Obras")
  }

  if (!userPermissions?.financeira?.view) {
    items = items.filter((i) => i.title !== "Financeiro")
  }

  if (!userPermissions?.logs?.view) {
    items = items.filter((i) => i.title !== "Logs")
  }

  if (!userPermissions?.diario?.view && userRole !== "admin") {
    items = items.filter((i) => i.title !== "Diário de Obras")
  }

  if (!userPermissions?.diario?.view && userRole !== "admin") {
    items = items.filter((i) => i.title !== "Planejamento")
  }

  if (!userPermissions?.estoque?.view && userRole !== "admin") {
    items = items.filter((i) => i.title !== "Entrada")
  }

  if (!userPermissions?.estoque?.view && userRole !== "admin") {
    items = items.filter((i) => i.title !== "Saida")
  }

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col h-dvh min-h-0 bg-[#1E1E1E] border-r border-gray-800 transition-all duration-300 ease-in-out relative overflow-visible",
        collapsed ? "w-20" : "w-72"
      )}
    >
      <Logo collapsed={collapsed} />

      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#F5C800] border-2 border-white flex items-center justify-center hover:scale-110 transition-transform z-10 shadow-lg"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3 text-black" />
        ) : (
          <ChevronLeft className="h-3 w-3 text-black" />
        )}
      </button>

      <nav className="flex-1 min-h-0 overflow-y-auto scrollbar-thin p-2 space-y-1">
        {items.map((item, index) => {
          const isActive = pathname === item.href;
          const showSeparator = index > 0 && item.group !== items[index - 1].group;

          return (
            <div key={item.href}>
              {showSeparator && (
                <div className={cn("my-2 h-[1px] bg-[#F5C800] mx-3 opacity-80", collapsed ? "mx-2" : "")} />
              )}
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  collapsed ? "justify-center" : "",
                  isActive
                    ? "bg-[#F5C800] text-black shadow-lg"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                )}
                title={collapsed ? item.title : undefined}
              >
                <item.icon className={cn("h-5 w-5 flex-shrink-0")} />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* Usuário Autenticado */}
      {user && !collapsed && (
        <div className="shrink-0 border-t border-gray-800 p-3 bg-[#2A2A2A]">
          <div className="flex items-center gap-3 p-2 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-[#F5C800] flex items-center justify-center flex-shrink-0">
              <User className="h-5 w-5 text-[#1E1E1E]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário'}
              </p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      {collapsed && user && (
        <div className="shrink-0 border-t border-gray-800 p-3 bg-[#2A2A2A] flex justify-center">
          <div className="w-10 h-10 rounded-full bg-[#F5C800] flex items-center justify-center">
            <User className="h-5 w-5 text-[#1E1E1E]" />
          </div>
        </div>
      )}

      <div className="shrink-0 border-t border-gray-800 p-3">
        <form action="/auth/signout" method="post">
          <Button
            variant="ghost"
            className={cn(
              "w-full text-gray-300 hover:bg-gray-800 hover:text-white",
              collapsed ? "justify-center px-3" : "justify-start"
            )}
            type="submit"
            title={collapsed ? "Sair" : undefined}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span className="ml-3">Sair</span>}
          </Button>
        </form>
      </div>

      {/* Créditos do Desenvolvedor */}
      {!collapsed && (
        <div className="shrink-0 border-t border-gray-800 p-3 bg-[#2A2A2A]">
          <p className="text-xs text-center text-gray-400">
            Desenvolvido por{" "}
            <a
              href="https://www.linkedin.com/company/theralabs/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#F5C800] hover:text-yellow-400 transition-colors"
            >
              Thera
            </a>
          </p>
        </div>
      )}
    </aside>
  );
}

function MobileSidebar({ isOpen, onClose, user, userRole, userPermissions }: { isOpen: boolean; onClose: () => void; user: SupabaseUser; userRole: string, userPermissions: UserPermissions }) {

  const pathname = usePathname();

  let items =
    userRole === "admin"
      ? menuItems
      : menuItems.filter((i) => i.title !== "Admin" && i.title !== "Receita" && i.title !== "Despesas" && i.title !== "Fluxo de Caixa" && i.title !== "Materiais" && i.title !== "Fluxo Material");

  if (!userPermissions?.dashboard?.view) {
    items = items.filter((i) => i.title !== "Dashboard")
  }

  if (!userPermissions?.clientes?.view) {
    items = items.filter((i) => i.title !== "Clientes")
  }

  if (!userPermissions?.obras?.view) {
    items = items.filter((i) => i.title !== "Obras")
  }

  if (!userPermissions?.financeira?.view) {
    items = items.filter((i) => i.title !== "Financeiro")
  }

  if (!userPermissions?.logs?.view) {
    items = items.filter((i) => i.title !== "Logs")
  }

  if (!userPermissions?.diario?.view && userRole !== "admin") {
    items = items.filter((i) => i.title !== "Diário de Obras")
  }

  if (!userPermissions?.diario?.view && userRole !== "admin") {
    items = items.filter((i) => i.title !== "Planejamento")
  }

  if (!userPermissions?.estoque?.view && userRole !== "admin") {
    items = items.filter((i) => i.title !== "Entrada")
  }

  if (!userPermissions?.estoque?.view && userRole !== "admin") {
    items = items.filter((i) => i.title !== "Saida")
  }


  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-72 bg-[#1E1E1E] border-r border-gray-800 z-50 lg:hidden transition-transform duration-300 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-16 border-b border-gray-800 px-4">
          <Logo collapsed={false} />
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {items.map((item, index) => {
            const isActive = pathname === item.href;
            const showSeparator = index > 0 && item.group !== items[index - 1].group;

            return (
              <div key={item.href}>
                {showSeparator && (
                  <div className="my-2 h-[1px] bg-[#F5C800] mx-3 opacity-80" />
                )}
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all",
                    isActive
                      ? "bg-[#F5C800] text-black shadow-lg"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Usuário Autenticado (Mobile) */}
        {user && (
          <div className="border-t border-gray-800 p-3 bg-[#2A2A2A]">
            <div className="flex items-center gap-3 p-2 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-[#F5C800] flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-[#1E1E1E]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.user_metadata?.name || user.email?.split("@")[0] || "Usuário"}
                </p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}


        <div className="border-t border-gray-800 p-3">
          <form action="/auth/signout" method="post">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-300 hover:bg-gray-800 hover:text-white"
              type="submit"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sair
            </Button>
          </form>
        </div>

        {/* Créditos do Desenvolvedor */}
        <div className="border-t border-gray-800 p-3 bg-[#2A2A2A]">
          <p className="text-xs text-center text-gray-400">
            Desenvolvido por{" "}
            <a
              href="https://www.linkedin.com/company/theralabs/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#F5C800] hover:text-yellow-400 transition-colors"
            >
              Thera
            </a>
          </p>
        </div>
      </aside>
    </>
  );
}

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  user: SupabaseUser;
  userRole: string;
  userPermissions: UserPermissions;
}

export default function DashboardLayoutClient({
  children,
  user,
  userRole,
  userPermissions
}: DashboardLayoutClientProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-dvh overflow-hidden bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} user={user} userRole={userRole} userPermissions={userPermissions} />
      <MobileSidebar isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} user={user} userRole={userRole} userPermissions={userPermissions} />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex lg:hidden h-16 items-center border-b bg-white px-4 gap-4 shadow-sm">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#F5C800] flex items-center justify-center">
              <Image
                src="/icon.jpg"
                alt="LA"
                width={32}
                height={32}
              />
            </div>
            <span className="text-sm font-bold" style={{ fontFamily: "'Engravers Gothic BT', sans-serif" }}>LA ENGENHARIA</span>
          </div>
        </header>

        {/* Desktop Header - Removido para melhor visual */}

        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
}

