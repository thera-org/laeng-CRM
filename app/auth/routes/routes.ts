export const ROUTES = [
  {
    path: "/dashboard",
    permission: (p: any) => p?.dashboard?.view,
  },
  {
    path: "/clientes",
    permission: (p: any) => p?.clientes?.view,
  },
  {
    path: "/financeira",
    permission: (p: any) => p?.financeira?.view,
  },
  {
    path: "/logs",
    permission: (p: any) => p?.logs?.view,
  },
  {
    path: "/obras",
    permission: (p: any) => p?.obras?.view,
  },
  {
    path: "/entrada",
    permission: (p: any) => p?.estoque?.view,
  },
  {
    path: "/saida",
    permission: (p: any) => p?.estoque?.view,
  },
];
