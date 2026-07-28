import { redirect } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { idVerifications } from "@/lib/db/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { SignOutButton } from "@/components/sign-out-button";
import { Clock3, ShieldAlert, ShieldCheck } from "lucide-react";

export default async function AccountPendingPage() {
  const user = await getCurrentUser();

  if (user.role === "staff") redirect("/staff/requests");
  if (user.accountStatus === "approved") redirect("/dashboard");

  const [verification] = await db
    .select()
    .from(idVerifications)
    .where(eq(idVerifications.userId, user.id))
    .orderBy(desc(idVerifications.createdAt))
    .limit(1);

  const isRejected = user.accountStatus === "rejected";

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="flex items-center justify-between px-6 py-4">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <SignOutButton />
        </div>
      </header>
      <main id="main-content" className="flex flex-1 items-center justify-center px-4 pb-16">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <div
              className={`mb-2 flex size-10 items-center justify-center rounded-full ${
                isRejected
                  ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
              }`}
            >
              {isRejected ? <ShieldAlert className="size-5" /> : <Clock3 className="size-5" />}
            </div>
            <CardTitle>{isRejected ? "Account not approved" : "Verification in progress"}</CardTitle>
            <CardDescription>
              {isRejected
                ? "We couldn't verify your Tennessee residency from the documentation provided."
                : "Your account is waiting on identity verification before you can submit records requests."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            {verification && (
              <div className="rounded-lg border bg-background p-4">
                <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
                  <ShieldCheck className="size-4" />
                  AI reviewer notes
                </div>
                <p>{verification.aiReasoning}</p>
              </div>
            )}
            <p>
              {isRejected
                ? "If you believe this is a mistake, please contact the records office to resolve it."
                : "This usually only takes a few minutes. You'll receive an email as soon as a decision is made — feel free to check back here anytime."}
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
