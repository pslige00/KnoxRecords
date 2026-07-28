export const REQUEST_STATUS_LABELS: Record<string, string> = {
  new: "New",
  in_review: "In Review",
  awaiting_records: "Awaiting Records",
  completed: "Completed",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

/** Ordered "happy path" stages shown in the request stage tracker. */
export const REQUEST_LIFECYCLE_STAGES = [
  "new",
  "in_review",
  "awaiting_records",
  "completed",
] as const;

export const REQUEST_LIFECYCLE_STAGE_LABELS: Record<string, string> = {
  new: "Submitted",
  in_review: "In Review",
  awaiting_records: "Awaiting Records",
  completed: "Completed",
};

/** Statuses that end the lifecycle outside the normal stage progression. */
export const TERMINAL_REQUEST_STATUSES = ["rejected", "withdrawn"] as const;

export const PRIORITY_LABELS: Record<string, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
};

export const ACCOUNT_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

export const ID_VERDICT_LABELS: Record<string, string> = {
  approved: "AI: Approved",
  rejected: "AI: Rejected",
  needs_review: "AI: Needs Review",
};
