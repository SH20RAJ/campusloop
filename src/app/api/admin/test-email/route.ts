import { resolveAdminSession } from "@/app/admin/_lib/guard";
import { sendEmail } from "@/lib/email";
import { buildNotificationEmail, buildWelcomeEmail } from "@/lib/email-templates";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface TestEmailBody {
  to?: string;
  type?: string;
  displayName?: string;
  collegeName?: string;
  recipientName?: string;
  actorName?: string;
  notificationType?: "MENTION" | "REPLY" | "MATCH";
  snippet?: string;
  subject?: string;
}

export async function POST(req: NextRequest) {
  try {
    // Ensure admin authorization
    await resolveAdminSession();

    const body = ((await req.json().catch(() => ({}))) || {}) as TestEmailBody;
    const to = body.to?.trim() || "shaswatraj3@gmail.com";
    const type = body.type || "NOTIFICATION";

    let emailPayload: { subject: string; html: string; text: string };

    if (type === "WELCOME") {
      emailPayload = buildWelcomeEmail({
        displayName: body.displayName || "Test Student",
        collegeName: body.collegeName || "Birla Institute of Technology, Mesra",
      });
    } else {
      emailPayload = buildNotificationEmail({
        recipientName: body.recipientName || "Test Student",
        actorName: body.actorName || "campusloop",
        type: body.notificationType || "MENTION",
        snippet: body.snippet || "Hey! Testing the Cloudflare Email notification delivery on CampusLoop.",
      });
    }

    const result = await sendEmail({
      to,
      subject: body.subject || emailPayload.subject,
      html: emailPayload.html,
      text: emailPayload.text,
    });

    return NextResponse.json({
      success: result.success,
      provider: result.provider,
      messageId: result.messageId,
      simulated: result.simulated,
      error: result.error,
      recipient: to,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send test email",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const to = searchParams.get("to") || "shaswatraj3@gmail.com";

  try {
    const result = await sendEmail({
      to,
      subject: "Test from CampusLoop Cloudflare Email",
      text: "Hello! This is a test email sent from CampusLoop via Cloudflare Email Sending.",
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #111;">
          <h2>CampusLoop Cloudflare Email Test</h2>
          <p>Hello! This is an automated diagnostic test of Cloudflare Email Sending on CampusLoop.</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
        </div>
      `,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send test email",
      },
      { status: 500 }
    );
  }
}
