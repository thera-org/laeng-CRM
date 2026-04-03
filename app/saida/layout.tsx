import { getUserContext } from "@/app/auth/context/userContext";
import DashboardLayoutClient from "@/app/dashboard/layout-client";
import { resolveRedirect } from "@/app/auth/routes/resolveRedirect";

export default async function SaidaLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, userRole, userPermissions } = await getUserContext();
    resolveRedirect(userPermissions, (p) => p?.["material-saida"]?.view);
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
