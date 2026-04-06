import { getUserContext } from "@/app/auth/context/userContext";
import DashboardLayoutClient from "@/app/dashboard/layout-client";
import { resolveRedirect } from "@/app/auth/routes/resolveRedirect";

export default async function SaidaLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, userRole, userPermissions } = await getUserContext();

    if (userRole !== "admin") {
        resolveRedirect(userPermissions, (p) => p?.estoque?.view);
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
