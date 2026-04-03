import { getUserContext } from "@/app/auth/context/userContext";
import DashboardLayoutClient from "@/app/dashboard/layout-client";
import { resolveRedirect } from "@/app/auth/routes/resolveRedirect";

export default async function EntradaLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, userRole, userPermissions } = await getUserContext();
    resolveRedirect(userPermissions, (p) => p?.["material-entrada"]?.view);
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
