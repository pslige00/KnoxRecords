import {
  pgTable,
  uuid,
  text,
  varchar,
  timestamp,
  pgEnum,
  boolean,
  real,
  index,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["citizen", "staff"]);
export const accountStatusEnum = pgEnum("account_status", [
  "pending",
  "approved",
  "rejected",
]);
export const idVerdictEnum = pgEnum("id_verdict", [
  "approved",
  "rejected",
  "needs_review",
]);
export const requestStatusEnum = pgEnum("request_status", [
  "new",
  "in_review",
  "awaiting_records",
  "completed",
  "rejected",
]);
export const requestPriorityEnum = pgEnum("request_priority", [
  "low",
  "normal",
  "high",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 320 }).notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    firstName: varchar("first_name", { length: 120 }).notNull(),
    middleName: varchar("middle_name", { length: 120 }),
    lastName: varchar("last_name", { length: 120 }).notNull(),
    phone: varchar("phone", { length: 40 }),
    address1: varchar("address1", { length: 255 }).notNull(),
    address2: varchar("address2", { length: 255 }),
    city: varchar("city", { length: 120 }).notNull(),
    state: varchar("state", { length: 2 }).notNull(),
    zip: varchar("zip", { length: 10 }).notNull(),
    companyName: varchar("company_name", { length: 255 }),
    role: userRoleEnum("role").notNull().default("citizen"),
    accountStatus: accountStatusEnum("account_status")
      .notNull()
      .default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("users_email_idx").on(table.email)],
);

export const idVerifications = pgTable(
  "id_verifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    fileUrl: text("file_url").notNull(),
    aiVerdict: idVerdictEnum("ai_verdict").notNull(),
    aiConfidence: real("ai_confidence").notNull(),
    extractedName: varchar("extracted_name", { length: 255 }),
    extractedDob: varchar("extracted_dob", { length: 40 }),
    extractedLicenseNumber: varchar("extracted_license_number", {
      length: 60,
    }),
    aiReasoning: text("ai_reasoning").notNull(),
    reviewedBy: uuid("reviewed_by").references(() => users.id),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("id_verifications_user_idx").on(table.userId)],
);

export const departments = pgTable("departments", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  name: varchar("name", { length: 160 }).notNull(),
  contactEmail: varchar("contact_email", { length: 320 }).notNull(),
});

export const requests = pgTable(
  "requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    referenceNo: varchar("reference_no", { length: 40 }).notNull().unique(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    departmentId: uuid("department_id")
      .notNull()
      .references(() => departments.id),
    description: text("description").notNull(),
    aiSuggestedDepartmentId: uuid("ai_suggested_department_id").references(
      () => departments.id,
    ),
    aiPriority: requestPriorityEnum("ai_priority"),
    aiSummary: text("ai_summary"),
    aiReasoning: text("ai_reasoning"),
    status: requestStatusEnum("status").notNull().default("new"),
    priority: requestPriorityEnum("priority").notNull().default("normal"),
    assignedStaffId: uuid("assigned_staff_id").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [
    index("requests_user_idx").on(table.userId),
    index("requests_department_idx").on(table.departmentId),
    index("requests_status_idx").on(table.status),
  ],
);

export const requestDocuments = pgTable(
  "request_documents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    requestId: uuid("request_id")
      .notNull()
      .references(() => requests.id, { onDelete: "cascade" }),
    fileUrl: text("file_url").notNull(),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    uploadedBy: uuid("uploaded_by")
      .notNull()
      .references(() => users.id),
    uploadedAt: timestamp("uploaded_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("request_documents_request_idx").on(table.requestId)],
);

export const requestEvents = pgTable(
  "request_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    requestId: uuid("request_id")
      .notNull()
      .references(() => requests.id, { onDelete: "cascade" }),
    authorId: uuid("author_id").references(() => users.id),
    message: text("message").notNull(),
    isCustomerVisible: boolean("is_customer_visible").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("request_events_request_idx").on(table.requestId)],
);
