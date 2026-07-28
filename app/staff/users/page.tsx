import Link from "next/link";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/dal";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AccountStatusBadge } from "@/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FilterSelect } from "@/components/staff/filter-select";
import { ChangeRoleButton } from "@/components/staff/change-role-button";
import { Search, Users2 } from "lucide-react";

const ROLE_STYLES: Record<string, string> = {
  staff:
    "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  citizen: "bg-muted text-muted-foreground border-border",
};

export default async function StaffUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; q?: string }>;
}) {
  const params = await searchParams;
  const currentUser = await getCurrentUser();
  const q = params.q?.trim();
  const roleFilter = params.role && params.role !== "all" ? params.role : undefined;

  const conditions = [
    roleFilter ? eq(users.role, roleFilter as "citizen" | "staff") : undefined,
    q
      ? or(
          ilike(users.firstName, `%${q}%`),
          ilike(users.lastName, `%${q}%`),
          ilike(users.email, `%${q}%`),
          ilike(users.phone, `%${q}%`),
          ilike(users.city, `%${q}%`),
        )
      : undefined,
  ].filter(Boolean);

  const rows = await db
    .select()
    .from(users)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(users.createdAt));

  const hasFilters = roleFilter || q;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground">
          Manage staff access. Promoting an account to staff grants full access to
          requests, account approvals, and the audit log.
        </p>
      </div>

      <form className="flex flex-wrap items-center gap-3" method="get">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search name, email, phone, city…"
            aria-label="Search users"
            className="h-9 w-72 pl-8"
          />
        </div>
        <FilterSelect
          name="role"
          defaultValue={params.role}
          ariaLabel="Filter by role"
          options={[
            { value: "all", label: "All roles" },
            { value: "staff", label: "Staff" },
            { value: "citizen", label: "Citizen" },
          ]}
        />
        <button
          type="submit"
          className="h-9 cursor-pointer rounded-lg border border-input bg-secondary px-4 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Filter
        </button>
        {hasFilters && (
          <Link
            href="/staff/users"
            className="flex h-9 items-center px-2 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Clear
          </Link>
        )}
      </form>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
            <Users2 className="size-8" />
            <p>No accounts match this filter.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Account status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">
                      {u.firstName} {u.lastName}
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={ROLE_STYLES[u.role]}>
                        {u.role === "staff" ? "Staff" : "Citizen"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <AccountStatusBadge status={u.accountStatus} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {u.createdAt.toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {u.id === currentUser.id ? (
                        <span className="text-xs text-muted-foreground">This is you</span>
                      ) : (
                        <ChangeRoleButton
                          userId={u.id}
                          userName={`${u.firstName} ${u.lastName}`}
                          currentRole={u.role}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
