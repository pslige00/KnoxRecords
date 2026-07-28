import { requireApprovedCitizen } from "@/lib/auth/dal";
import { AppHeader } from "@/components/app-header";

const NAV_ITEMS = [
  { href: "/dashboard", label: "My Requests" },
  { href: "/dashboard/requests/new", label: "New Request" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireApprovedCitizen();

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <AppHeader
        navItems={NAV_ITEMS}
        userName={`${user.firstName} ${user.lastName}`}
        roleLabel="Citizen"
        homeHref="/dashboard"
      />
      <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
