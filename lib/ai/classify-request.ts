import "server-only";
import { anthropic, AI_MODEL } from "./client";

export type RequestPriority = "low" | "normal" | "high";

export type RequestClassification = {
  suggestedDepartmentSlug: string | null;
  priority: RequestPriority;
  summary: string;
  reasoning: string;
};

const TOOL_NAME = "report_request_classification";

type ToolInput = {
  suggested_department_slug: string | null;
  priority: RequestPriority;
  summary: string;
  reasoning: string;
};

function isToolInput(value: unknown): value is ToolInput {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.priority === "string" &&
    ["low", "normal", "high"].includes(v.priority) &&
    typeof v.summary === "string" &&
    typeof v.reasoning === "string"
  );
}

/**
 * Suggests a department and priority for a citizen's free-text public
 * records request. Advisory only — staff can accept or override before the
 * request is routed.
 */
export async function classifyRequest({
  description,
  selectedDepartmentSlug,
  departments,
}: {
  description: string;
  selectedDepartmentSlug: string;
  departments: { slug: string; name: string }[];
}): Promise<RequestClassification> {
  const slugs = departments.map((d) => d.slug);

  const message = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 1024,
    system: `You triage incoming public records requests for a Tennessee county government records office.

Given a citizen's free-text description of the records they want and the department they picked, suggest:
- The best-matching department from the provided list (by slug). If the citizen's own selection already looks correct, return that same slug. If no department is a clear improvement, return their original selection rather than guessing.
- A priority: "high" for anything time-sensitive, safety-related, legally time-boxed (e.g. litigation, imminent deadlines), or from a media/legal requester; "low" for vague, very broad, or clearly non-urgent requests; "normal" otherwise.
- A one-line (under 100 characters) plain-English summary of what's being requested, suitable as a queue list title.
- A short reasoning note (1-2 sentences) for the staff member who will review your suggestion.`,
    tools: [
      {
        name: TOOL_NAME,
        description: "Report the triage classification for this request.",
        input_schema: {
          type: "object",
          properties: {
            suggested_department_slug: {
              type: ["string", "null"],
              enum: [...slugs, null],
            },
            priority: {
              type: "string",
              enum: ["low", "normal", "high"],
            },
            summary: { type: "string" },
            reasoning: { type: "string" },
          },
          required: ["priority", "summary", "reasoning"],
        },
      },
    ],
    tool_choice: { type: "tool", name: TOOL_NAME },
    messages: [
      {
        role: "user",
        content: `Department list:\n${departments
          .map((d) => `- ${d.slug}: ${d.name}`)
          .join("\n")}\n\nCitizen selected department: ${selectedDepartmentSlug}\n\nRequest description:\n${description}`,
      },
    ],
  });

  const toolUse = message.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use" || !isToolInput(toolUse.input)) {
    return {
      suggestedDepartmentSlug: selectedDepartmentSlug,
      priority: "normal",
      summary: description.slice(0, 90),
      reasoning: "The AI triage did not return a usable result; using defaults.",
    };
  }

  const input = toolUse.input;
  const suggestedSlug =
    input.suggested_department_slug && slugs.includes(input.suggested_department_slug)
      ? input.suggested_department_slug
      : selectedDepartmentSlug;

  return {
    suggestedDepartmentSlug: suggestedSlug,
    priority: input.priority,
    summary: input.summary.slice(0, 200),
    reasoning: input.reasoning,
  };
}
