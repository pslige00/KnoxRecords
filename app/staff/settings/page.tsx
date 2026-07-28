import { getAppSettingsWithUpdater } from "@/lib/data/settings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SettingsForm } from "@/components/staff/settings-form";
import { Sparkles } from "lucide-react";

export default async function StaffSettingsPage() {
  const settings = await getAppSettingsWithUpdater();
  const thresholdPercent = Math.round(settings.idAutoApproveThreshold * 100);
  const updaterName =
    settings.updatedByFirstName && settings.updatedByLastName
      ? `${settings.updatedByFirstName} ${settings.updatedByLastName}`
      : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure how the AI reviewer handles account verification.
        </p>
      </div>

      <Card>
        <CardHeader className="flex-row items-start gap-3 space-y-0">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-950">
            <Sparkles className="size-4 text-violet-700 dark:text-violet-300" />
          </span>
          <div>
            <CardTitle className="text-base">ID verification auto-approval</CardTitle>
            <CardDescription>
              When a new account&apos;s uploaded driver&apos;s license gets an AI verdict of
              &quot;approved&quot;, the account is only activated automatically if the AI&apos;s
              confidence score is at or above this threshold. Anything below it — along with
              every &quot;needs review&quot; or &quot;rejected&quot; verdict — is routed to the{" "}
              Account Approvals queue for a staff member to decide. Lowering this number
              auto-approves more accounts with less certainty; raising it sends more accounts to
              manual review.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsForm defaultThresholdPercent={thresholdPercent} />
          {updaterName && settings.updatedAt && (
            <p className="text-xs text-muted-foreground">
              Last changed by {updaterName} on{" "}
              {settings.updatedAt.toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
