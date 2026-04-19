import { getUserContext } from "@/app/auth/context/userContext";
import { resolveRedirect } from "@/app/auth/routes/resolveRedirect";
import DashboardLayoutClient from "@/app/dashboard/layout-client";

export default async function PlanejamentoDeObrasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userRole, userPermissions } = await getUserContext();

  if (userRole !== "admin") {
    resolveRedirect(userPermissions, (p) => p?.diario?.view);
  }

  return (
    <DashboardLayoutClient
      user={user}
      userRole={userRole}
      userPermissions={userPermissions}
    >
      {children}
    </DashboardLayoutClient>
  );
}
