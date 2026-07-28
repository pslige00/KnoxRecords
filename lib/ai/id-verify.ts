import "server-only";
import { anthropic, AI_MODEL } from "./client";

export type IdVerdict = "approved" | "rejected" | "needs_review";

export type IdVerificationResult = {
  verdict: IdVerdict;
  confidence: number;
  extractedName: string | null;
  extractedDob: string | null;
  extractedLicenseNumber: string | null;
  reasoning: string;
};

const TOOL_NAME = "report_id_verification";

type ToolInput = {
  verdict: IdVerdict;
  confidence: number;
  extracted_name: string | null;
  extracted_dob: string | null;
  extracted_license_number: string | null;
  reasoning: string;
};

function isToolInput(value: unknown): value is ToolInput {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.verdict === "string" &&
    ["approved", "rejected", "needs_review"].includes(v.verdict) &&
    typeof v.confidence === "number" &&
    typeof v.reasoning === "string"
  );
}

/**
 * Uses Claude's vision capability to sanity-check an uploaded driver's
 * license image against the name provided at signup. This is advisory only:
 * it is not a forensic document-authentication tool, so anything short of a
 * confident, matching Tennessee license is routed to a human for review
 * rather than auto-rejected.
 */
export async function verifyDriversLicense({
  imageBase64,
  mediaType,
  claimedFirstName,
  claimedLastName,
}: {
  imageBase64: string;
  mediaType: "image/jpeg" | "image/png" | "image/webp";
  claimedFirstName: string;
  claimedLastName: string;
}): Promise<IdVerificationResult> {
  const message = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 1024,
    system: `You are assisting a local government records office in Tennessee with a first-pass, advisory review of driver's license photos uploaded during account signup, as proof of Tennessee residency for public records requests.

You are NOT a forensic document examiner and cannot reliably detect sophisticated forgeries. Your job is a lightweight sanity check:
- "approved": the image clearly shows a Tennessee driver's license (or state ID), the name on it is legible, and it reasonably matches the claimed name.
- "needs_review": the image is a driver's license but something is uncertain — the state isn't clearly Tennessee, the name doesn't clearly match, the image is blurry/partially cropped, or you're otherwise not confident. Default here when in doubt.
- "rejected": the image is clearly not a driver's license or ID card at all (e.g. an unrelated photo, a blank page, a screenshot of something else).

Always extract whatever name, date of birth, and license number are legible, even if you're routing to needs_review. Keep "reasoning" short (1-2 sentences) and written for a human staff reviewer who will make the final call.`,
    tools: [
      {
        name: TOOL_NAME,
        description: "Report the result of reviewing the uploaded ID image.",
        input_schema: {
          type: "object",
          properties: {
            verdict: {
              type: "string",
              enum: ["approved", "rejected", "needs_review"],
            },
            confidence: {
              type: "number",
              description: "0 to 1 confidence in the verdict.",
            },
            extracted_name: { type: ["string", "null"] },
            extracted_dob: { type: ["string", "null"] },
            extracted_license_number: { type: ["string", "null"] },
            reasoning: { type: "string" },
          },
          required: ["verdict", "confidence", "reasoning"],
        },
      },
    ],
    tool_choice: { type: "tool", name: TOOL_NAME },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: imageBase64,
            },
          },
          {
            type: "text",
            text: `The account was signed up under the name "${claimedFirstName} ${claimedLastName}". Review the attached image and report your findings.`,
          },
        ],
      },
    ],
  });

  const toolUse = message.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use" || !isToolInput(toolUse.input)) {
    return {
      verdict: "needs_review",
      confidence: 0,
      extractedName: null,
      extractedDob: null,
      extractedLicenseNumber: null,
      reasoning:
        "The AI reviewer did not return a usable result; routed to manual review.",
    };
  }

  const input = toolUse.input;
  return {
    verdict: input.verdict,
    confidence: Math.max(0, Math.min(1, input.confidence)),
    extractedName: input.extracted_name ?? null,
    extractedDob: input.extracted_dob ?? null,
    extractedLicenseNumber: input.extracted_license_number ?? null,
    reasoning: input.reasoning,
  };
}
