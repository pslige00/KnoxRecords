import { requireStaff } from "@/lib/auth/dal";
import { AppHeader } from "@/components/app-header";

const NAV_ITEMS = [
  { href: "/staff/requests", label: "Requests" },
  { href: "/staff/accounts", label: "Account Approvals" },
  { href: "/staff/departments", label: "Departments" },
  { href: "/staff/users", label: "Users" },
  { href: "/staff/audit", label: "Audit Log" },
];

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireStaff();

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <AppHeader
        navItems={NAV_ITEMS}
        userName={`${user.firstName} ${user.lastName}`}
        roleLabel="Staff"
        homeHref="/staff/requests"
      />
      <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
