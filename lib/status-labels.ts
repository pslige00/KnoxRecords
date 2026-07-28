export const REQUEST_STATUS_LABELS: Record<string, string> = {
  new: "New",
  in_review: "In Review",
  awaiting_records: "Awaiting Records",
  completed: "Completed",
  rejected: "Rejected",
};

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
