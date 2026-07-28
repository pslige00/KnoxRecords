import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NewRequestForm } from "@/components/dashboard/new-request-form";
import { getDepartments } from "@/lib/data/departments";

export default async function NewRequestPage() {
  const departments = await getDepartments();

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>New Public Records Request</CardTitle>
          <CardDescription>
            Tell us what you&apos;re looking for and we&apos;ll route it to the
            right department.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewRequestForm departments={departments} />
        </CardContent>
      </Card>
    </div>
  );
}
