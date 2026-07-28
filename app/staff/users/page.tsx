import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/dal";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AccountStatusBadge } from "@/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChangeRoleButton } from "@/components/staff/change-role-button";
import { Users2 } from "lucide-react";

const ROLE_STYLES: Record<string, string> = {
  staff:
    "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  citizen: "bg-muted text-muted-foreground border-border",
};

export default async function StaffUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const params = await searchParams;
  const currentUser = await getCurrentUser();

  const rows = await db
    .select()
    .from(users)
    .where(params.role ? eq(users.role, params.role as "citizen" | "staff") : undefined)
    .orderBy(desc(users.createdAt));

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
        <select
          name="role"
          defaultValue={params.role ?? ""}
          aria-label="Filter by role"
          className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
        >
          <option value="">All roles</option>
          <option value="staff">Staff</option>
          <option value="citizen">Citizen</option>
        </select>
        <button
          type="submit"
          className="h-9 rounded-lg border border-input bg-secondary px-4 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Filter
        </button>
        {params.role && (
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
