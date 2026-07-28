import "server-only";
import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY environment variable is not set");
}

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || "KnoxRecords <onboarding@resend.dev>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

function wrapper(title: string, bodyHtml: string) {
  return `<!doctype html>
<html>
  <body style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; background:#f4f5f7; margin:0; padding:32px;">
    <table role="presentation" width="100%" style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden;">
      <tr><td style="background:#1e293b; padding:20px 28px;">
        <span style="color:#fff; font-size:18px; font-weight:600;">KnoxRecords</span>
      </td></tr>
      <tr><td style="padding:28px;">
        <h1 style="font-size:18px; margin:0 0 16px; color:#0f172a;">${title}</h1>
        ${bodyHtml}
      </td></tr>
      <tr><td style="padding:16px 28px; color:#94a3b8; font-size:12px; border-top:1px solid #e2e8f0;">
        This is an automated message from the KnoxRecords public records portal.
      </td></tr>
    </table>
  </body>
</html>`;
}

export async function sendSignupReceivedEmail(to: string, firstName: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "We've received your KnoxRecords account request",
    html: wrapper(
      "Account request received",
      `<p style="color:#334155; line-height:1.6;">Hi ${firstName},</p>
       <p style="color:#334155; line-height:1.6;">Thanks for signing up for KnoxRecords. We've received your account request and the driver's license photo you attached.</p>
       <p style="color:#334155; line-height:1.6;">Most accounts are verified within moments; a few need a staff member to take a closer look. Either way, we'll email you as soon as a decision is made.</p>`,
    ),
  });
}

export async function sendAccountApprovedEmail(to: string, firstName: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Your KnoxRecords account has been approved",
    html: wrapper(
      "You're approved",
      `<p style="color:#334155; line-height:1.6;">Hi ${firstName},</p>
       <p style="color:#334155; line-height:1.6;">Your KnoxRecords account has been approved. You can now sign in and submit public records requests.</p>
       <p><a href="${APP_URL}/login" style="display:inline-block; background:#1e293b; color:#fff; padding:10px 20px; border-radius:8px; text-decoration:none;">Sign in</a></p>`,
    ),
  });
}

export async function sendAccountRejectedEmail(to: string, firstName: string, reason: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "KnoxRecords account status update",
    html: wrapper(
      "Account not approved",
      `<p style="color:#334155; line-height:1.6;">Hi ${firstName},</p>
       <p style="color:#334155; line-height:1.6;">We were unable to verify your account: ${reason}</p>
       <p style="color:#334155; line-height:1.6;">If you believe this is a mistake, please contact the records office.</p>`,
    ),
  });
}

export async function sendDepartmentRoutingEmail({
  to,
  departmentName,
  referenceNo,
  requesterName,
  description,
  priority,
  requestId,
}: {
  to: string;
  departmentName: string;
  referenceNo: string;
  requesterName: string;
  description: string;
  priority: string;
  requestId: string;
}) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `New records request routed to ${departmentName}: ${referenceNo}`,
    html: wrapper(
      `New request for ${departmentName}`,
      `<p style="color:#334155; line-height:1.6;">A public records request has been routed to your department.</p>
       <p style="color:#334155; line-height:1.6;"><strong>Reference:</strong> ${referenceNo}<br/>
       <strong>Requester:</strong> ${requesterName}<br/>
       <strong>Priority:</strong> ${priority}</p>
       <p style="color:#334155; line-height:1.6; white-space:pre-wrap;">${description}</p>
       <p><a href="${APP_URL}/staff/requests/${requestId}" style="display:inline-block; background:#1e293b; color:#fff; padding:10px 20px; border-radius:8px; text-decoration:none;">View in KnoxRecords</a></p>`,
    ),
  });
}

export async function sendRequestStatusEmail({
  to,
  firstName,
  referenceNo,
  statusLabel,
  message,
  requestId,
}: {
  to: string;
  firstName: string;
  referenceNo: string;
  statusLabel: string;
  message: string;
  requestId: string;
}) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Update on your records request ${referenceNo}`,
    html: wrapper(
      `Request ${referenceNo}: ${statusLabel}`,
      `<p style="color:#334155; line-height:1.6;">Hi ${firstName},</p>
       <p style="color:#334155; line-height:1.6; white-space:pre-wrap;">${message}</p>
       <p><a href="${APP_URL}/dashboard/requests/${requestId}" style="display:inline-block; background:#1e293b; color:#fff; padding:10px 20px; border-radius:8px; text-decoration:none;">View request &amp; download records</a></p>`,
    ),
  });
}
