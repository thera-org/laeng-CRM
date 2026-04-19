import type { PermissoesUsuario } from "@/lib/types";

type RoutePermissions = Partial<PermissoesUsuario>;

interface AppRoute {
  path: string;
  permission: (p: RoutePermissions) => boolean | undefined;
}

export const ROUTES: AppRoute[] = [
  {
    path: "/dashboard",
    permission: (p) => p?.dashboard?.view,
  },
  {
    path: "/clientes",
    permission: (p) => p?.clientes?.view,
  },
  {
    path: "/financeira",
    permission: (p) => p?.financeira?.view,
  },
  {
    path: "/logs",
    permission: (p) => p?.logs?.view,
  },
  {
    path: "/obras",
    permission: (p) => p?.obras?.view,
  },
  {
    path: "/diarioDeObras",
    permission: (p) => p?.diario?.view,
  },
  {
    path: "/planejamentoDeObras",
    permission: (p) => p?.diario?.view,
  },
  {
    path: "/entrada",
    permission: (p) => p?.estoque?.view,
  },
  {
    path: "/saida",
    permission: (p) => p?.estoque?.view,
  },
];
