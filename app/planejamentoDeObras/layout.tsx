import { getUserContext } from "@/app/auth/context/userContext";
import DashboardLayoutClient from "@/app/dashboard/layout-client";

export default async function PlanejamentoDeObrasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userRole, userPermissions } = await getUserContext();

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
