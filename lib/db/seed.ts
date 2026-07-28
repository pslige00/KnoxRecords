import { eq } from "drizzle-orm";
import { put } from "@vercel/blob";
import bcrypt from "bcryptjs";
import { db } from "./seed-client";
import {
  users,
  departments,
  idVerifications,
  requests,
  requestDocuments,
  requestEvents,
} from "./schema";
import { generateReferenceNumber } from "@/lib/reference-number";

const hashPassword = (password: string) => bcrypt.hash(password, 12);
import { generateLicenseSvg, generateRecordPdfPlaceholder } from "./seed-assets";

const DEMO_PASSWORD = "Password123!";

const DEPARTMENTS = [
  { slug: "air-quality", name: "Air Quality Management" },
  { slug: "benefits", name: "Benefits" },
  { slug: "county-commission", name: "County Commission" },
  { slug: "criminal-court", name: "Criminal Court Clerk" },
  { slug: "election-commission", name: "Election Commission" },
  { slug: "engineering-public-works", name: "Engineering & Public Works" },
  { slug: "environmental-health", name: "Environmental Health" },
  { slug: "finance", name: "Finance" },
  { slug: "grants-community-development", name: "Grants and Community Development" },
  { slug: "human-resources", name: "Human Resources" },
  { slug: "law-department", name: "Law Department" },
  { slug: "mayors-office", name: "Office of the Mayor" },
  { slug: "parks-recreation", name: "Parks & Recreation" },
  { slug: "probation", name: "Probation" },
  { slug: "procurement", name: "Procurement" },
  { slug: "property-assessor", name: "Property Assessor" },
  { slug: "regional-forensic-center", name: "Regional Forensic Center" },
  { slug: "risk-management", name: "Risk Management" },
  { slug: "trustee", name: "Trustee" },
].map((d) => ({ ...d, contactEmail: `${d.slug}@knoxcounty.example` }));

const STAFF = [
  { firstName: "Dana", lastName: "Whitfield", email: "dana.whitfield@knoxrecords.example" },
  { firstName: "Marcus", lastName: "Webb", email: "marcus.webb@knoxrecords.example" },
];

type SeedCitizen = {
  firstName: string;
  lastName: string;
  email: string;
  address1: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  dob: string;
  status: "approved" | "pending" | "rejected";
  verdict: "approved" | "rejected" | "needs_review";
  confidence: number;
  reasoning: string;
};

const CITIZENS: SeedCitizen[] = [
  {
    firstName: "Ava", lastName: "Sorensen", email: "ava.sorensen@example.com",
    address1: "412 Maple Ridge Rd", city: "Knoxville", state: "TN", zip: "37919",
    phone: "865-555-0142", dob: "1991-04-12",
    status: "approved", verdict: "approved", confidence: 0.97,
    reasoning: "Clear Tennessee license image; name matches signup exactly.",
  },
  {
    firstName: "Miguel", lastName: "Torres", email: "miguel.torres@example.com",
    address1: "88 Concord Farragut Rd", city: "Farragut", state: "TN", zip: "37934",
    phone: "865-555-0198", dob: "1985-11-02",
    status: "approved", verdict: "approved", confidence: 0.95,
    reasoning: "Tennessee license, legible, name matches.",
  },
  {
    firstName: "Brianna", lastName: "Cole", email: "brianna.cole@example.com",
    address1: "2210 Powell Station Rd", city: "Powell", state: "TN", zip: "37849",
    phone: "865-555-0173", dob: "1978-07-23",
    status: "approved", verdict: "approved", confidence: 0.93,
    reasoning: "Tennessee license, legible, name matches.",
  },
  {
    firstName: "Devon", lastName: "Ellison", email: "devon.ellison@example.com",
    address1: "17 Corryton Loop", city: "Corryton", state: "TN", zip: "37721",
    phone: "865-555-0110", dob: "1996-01-30",
    status: "approved", verdict: "approved", confidence: 0.9,
    reasoning: "Tennessee license, legible, name matches.",
  },
  {
    firstName: "Priya", lastName: "Nair", email: "priya.nair@example.com",
    address1: "5 Sequoyah Hills Ct", city: "Knoxville", state: "TN", zip: "37919",
    phone: "865-555-0187", dob: "1989-09-14",
    status: "approved", verdict: "approved", confidence: 0.96,
    reasoning: "Tennessee license, legible, name matches.",
  },
  {
    firstName: "Caleb", lastName: "Hutchins", email: "caleb.hutchins@example.com",
    address1: "930 Broadway Ave", city: "Knoxville", state: "TN", zip: "37917",
    phone: "865-555-0166", dob: "1993-03-05",
    status: "pending", verdict: "needs_review", confidence: 0.58,
    reasoning: "Image is a Tennessee license but partially blurry near the name field; recommend manual confirmation.",
  },
  {
    firstName: "Renee", lastName: "Fournier", email: "renee.fournier@example.com",
    address1: "740 Kingston Pike", city: "Knoxville", state: "TN", zip: "37919",
    phone: "865-555-0129", dob: "1982-12-19",
    status: "pending", verdict: "needs_review", confidence: 0.62,
    reasoning: "License name reads \"Renee M. Fournier\" — middle initial present on ID but not entered at signup. Likely the same person; needs confirmation.",
  },
  {
    firstName: "Trevor", lastName: "Baines", email: "trevor.baines@example.com",
    address1: "12 Halls Crossroads", city: "Knoxville", state: "TN", zip: "37938",
    phone: "865-555-0155", dob: "1999-06-08",
    status: "rejected", verdict: "rejected", confidence: 0.81,
    reasoning: "Uploaded image does not appear to be a driver's license or state ID.",
  },
];

const REQUEST_SCENARIOS: {
  citizenEmail: string;
  departmentSlug: string;
  description: string;
  aiSummary: string;
  priority: "low" | "normal" | "high";
  status: "new" | "in_review" | "awaiting_records" | "completed" | "rejected" | "withdrawn";
  withDocument?: boolean;
  createdDaysAgo?: number;
  extended?: boolean;
}[] = [
  {
    citizenEmail: "ava.sorensen@example.com",
    departmentSlug: "property-assessor",
    description:
      "I would like copies of the property assessment records and recent valuation history for parcel 412 Maple Ridge Rd, Knoxville, TN 37919 for tax years 2022-2025.",
    aiSummary: "Property assessment & valuation history, 2022-2025",
    priority: "normal",
    status: "completed",
    withDocument: true,
    createdDaysAgo: 9,
  },
  {
    citizenEmail: "miguel.torres@example.com",
    departmentSlug: "engineering-public-works",
    description:
      "Requesting all road maintenance and repair records for Concord Farragut Rd between mile markers 2 and 4 for the past 18 months, including any citizen complaint logs.",
    aiSummary: "Road maintenance records, Concord Farragut Rd",
    priority: "normal",
    status: "in_review",
    createdDaysAgo: 3,
  },
  {
    citizenEmail: "brianna.cole@example.com",
    departmentSlug: "finance",
    description:
      "I'm a local reporter requesting the adopted county budget line items for the Parks & Recreation department for fiscal year 2025, plus any amendments passed by County Commission this year. This is time-sensitive for a story running next week.",
    aiSummary: "FY2025 Parks & Rec budget line items and amendments",
    priority: "high",
    status: "new",
    createdDaysAgo: 1,
  },
  {
    citizenEmail: "devon.ellison@example.com",
    departmentSlug: "county-commission",
    description:
      "Please provide the meeting minutes and any recorded votes from the last three County Commission meetings related to the Corryton rezoning proposal.",
    aiSummary: "Commission minutes & votes on Corryton rezoning",
    priority: "normal",
    status: "awaiting_records",
    createdDaysAgo: 6,
    extended: true,
  },
  {
    citizenEmail: "priya.nair@example.com",
    departmentSlug: "regional-forensic-center",
    description:
      "Requesting a copy of the autopsy report and death certificate for a family member, case processed earlier this year. I am the next of kin and can provide documentation if needed.",
    aiSummary: "Autopsy report & death certificate (next of kin)",
    priority: "high",
    status: "in_review",
    createdDaysAgo: 12,
  },
  {
    citizenEmail: "ava.sorensen@example.com",
    departmentSlug: "procurement",
    description:
      "Copies of all bids submitted for the recent county IT services solicitation, including the winning proposal and evaluation scoring sheets.",
    aiSummary: "IT services solicitation bids & evaluation scores",
    priority: "low",
    status: "completed",
    withDocument: true,
    createdDaysAgo: 14,
  },
  {
    citizenEmail: "devon.ellison@example.com",
    departmentSlug: "human-resources",
    description:
      "General salary range information for the IT Department director position — not requesting any individual's personnel file.",
    aiSummary: "IT Director position salary range",
    priority: "low",
    status: "rejected",
    createdDaysAgo: 5,
  },
  {
    citizenEmail: "miguel.torres@example.com",
    departmentSlug: "parks-recreation",
    description:
      "Requesting shelter reservation records and payment logs for Concord Park pavilion for the 2025 season.",
    aiSummary: "Concord Park pavilion reservation & payment logs, 2025",
    priority: "low",
    status: "withdrawn",
    createdDaysAgo: 4,
  },
];

async function uploadSvg(pathname: string, svg: string) {
  const blob = await put(pathname, new Blob([svg], { type: "image/svg+xml" }), {
    access: "private",
    addRandomSuffix: true,
  });
  return blob.url;
}

async function uploadTextFile(pathname: string, content: string) {
  const blob = await put(pathname, new Blob([content], { type: "text/plain" }), {
    access: "private",
    addRandomSuffix: true,
  });
  return blob.url;
}

async function main() {
  console.log("Wiping existing data...");
  await db.delete(requestEvents);
  await db.delete(requestDocuments);
  await db.delete(requests);
  await db.delete(idVerifications);
  await db.delete(users);
  await db.delete(departments);

  console.log("Seeding departments...");
  const insertedDepartments = await db.insert(departments).values(DEPARTMENTS).returning();
  const deptBySlug = new Map(insertedDepartments.map((d) => [d.slug, d]));

  console.log("Seeding staff...");
  const passwordHash = await hashPassword(DEMO_PASSWORD);
  const insertedStaff = await db
    .insert(users)
    .values(
      STAFF.map((s) => ({
        email: s.email,
        passwordHash,
        firstName: s.firstName,
        lastName: s.lastName,
        address1: "400 Main St",
        city: "Knoxville",
        state: "TN",
        zip: "37902",
        role: "staff" as const,
        accountStatus: "approved" as const,
      })),
    )
    .returning();

  console.log("Seeding citizens + ID verifications...");
  const citizenByEmail = new Map<string, (typeof insertedStaff)[number]>();
  for (const c of CITIZENS) {
    const [citizen] = await db
      .insert(users)
      .values({
        email: c.email,
        passwordHash,
        firstName: c.firstName,
        lastName: c.lastName,
        phone: c.phone,
        address1: c.address1,
        city: c.city,
        state: c.state,
        zip: c.zip,
        role: "citizen",
        accountStatus: c.status,
      })
      .returning();

    citizenByEmail.set(c.email, citizen);

    const svg = generateLicenseSvg({
      name: `${c.firstName} ${c.lastName}`,
      dob: c.dob,
      licenseNumber: `TN${Math.floor(100000000 + Math.random() * 900000000)}`,
      address: `${c.address1}, ${c.city}, ${c.state} ${c.zip}`,
    });
    const fileUrl = await uploadSvg(`seed/id-verifications/${citizen.id}.svg`, svg);

    const [verification] = await db
      .insert(idVerifications)
      .values({
        userId: citizen.id,
        fileUrl,
        aiVerdict: c.verdict,
        aiConfidence: c.confidence,
        extractedName: `${c.firstName} ${c.lastName}`,
        extractedDob: c.dob,
        extractedLicenseNumber: `TN-${citizen.id.slice(0, 8)}`,
        aiReasoning: c.reasoning,
      })
      .returning();

    if (c.status !== "pending") {
      await db
        .update(idVerifications)
        .set({ reviewedBy: insertedStaff[0].id, reviewedAt: new Date() })
        .where(eq(idVerifications.id, verification.id));
    }
  }

  console.log("Seeding requests...");
  const DAY_MS = 24 * 60 * 60 * 1000;
  for (const scenario of REQUEST_SCENARIOS) {
    const citizen = citizenByEmail.get(scenario.citizenEmail);
    const dept = deptBySlug.get(scenario.departmentSlug);
    if (!citizen || !dept) continue;

    const staffMember = insertedStaff[Math.floor(Math.random() * insertedStaff.length)];
    const isTerminal = scenario.status === "completed" || scenario.status === "rejected";
    const createdAt = new Date(Date.now() - (scenario.createdDaysAgo ?? 0) * DAY_MS);
    const dueDate = new Date(createdAt.getTime() + (scenario.extended ? 14 : 7) * DAY_MS);

    const [request] = await db
      .insert(requests)
      .values({
        referenceNo: generateReferenceNumber(),
        userId: citizen.id,
        departmentId: dept.id,
        description: scenario.description,
        aiSuggestedDepartmentId: dept.id,
        aiPriority: scenario.priority,
        aiSummary: scenario.aiSummary,
        aiReasoning: "Classified from the request description at submission time.",
        status: scenario.status,
        priority: scenario.priority,
        assignedStaffId: scenario.status === "new" ? null : staffMember.id,
        dueDate,
        dueDateExtendedCount: scenario.extended ? 1 : 0,
        createdAt,
        updatedAt: createdAt,
        completedAt: scenario.status === "completed" ? new Date() : null,
      })
      .returning();

    await db.insert(requestEvents).values({
      requestId: request.id,
      authorId: citizen.id,
      message: "Request submitted.",
      isCustomerVisible: true,
      createdAt,
    });

    if (scenario.status !== "new") {
      await db.insert(requestEvents).values({
        requestId: request.id,
        authorId: staffMember.id,
        message: `Routed to ${dept.name} with ${scenario.priority} priority by ${staffMember.firstName} ${staffMember.lastName}.`,
        isCustomerVisible: false,
        createdAt: new Date(createdAt.getTime() + 30 * 60 * 1000),
      });
    }

    if (scenario.extended) {
      const originalDueDate = new Date(createdAt.getTime() + 7 * DAY_MS);
      await db.insert(requestEvents).values({
        requestId: request.id,
        authorId: staffMember.id,
        message: `Response due date extended to ${dueDate.toLocaleDateString(undefined, { dateStyle: "long" })} by ${staffMember.firstName} ${staffMember.lastName}. Reason: Records span multiple archived commission sessions and require additional review time.`,
        isCustomerVisible: true,
        createdAt: new Date(originalDueDate.getTime() - DAY_MS),
      });
    }

    if (scenario.withDocument) {
      const fileUrl = await uploadTextFile(
        `seed/request-documents/${request.id}.txt`,
        generateRecordPdfPlaceholder(scenario.aiSummary),
      );
      await db.insert(requestDocuments).values({
        requestId: request.id,
        fileUrl,
        fileName: `${scenario.aiSummary.slice(0, 40).replace(/[^a-z0-9]+/gi, "-")}.txt`,
        uploadedBy: staffMember.id,
      });
      await db.insert(requestEvents).values({
        requestId: request.id,
        authorId: staffMember.id,
        message: `${staffMember.firstName} ${staffMember.lastName} uploaded responsive records.`,
        isCustomerVisible: false,
      });
    }

    if (isTerminal) {
      const message =
        scenario.status === "completed"
          ? "Your request has been fulfilled. The responsive records are attached below."
          : "After review, this request does not qualify as a public record under the applicable exemptions. Please contact our office if you have questions.";
      await db.insert(requestEvents).values({
        requestId: request.id,
        authorId: staffMember.id,
        message,
        isCustomerVisible: true,
      });
    }

    if (scenario.status === "withdrawn") {
      await db.insert(requestEvents).values({
        requestId: request.id,
        authorId: citizen.id,
        message: "Request withdrawn by the requester.",
        isCustomerVisible: true,
      });
    }
  }

  console.log("\nSeed complete.");
  console.log(`Demo password for all seeded accounts: ${DEMO_PASSWORD}`);
  console.log("Staff logins:");
  for (const s of STAFF) console.log(`  ${s.email}`);
  console.log("Citizen logins:");
  for (const c of CITIZENS) console.log(`  ${c.email} (${c.status})`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
