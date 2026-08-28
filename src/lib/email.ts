import { getCloudflareContext } from "@opennextjs/cloudflare";

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface SendEmailOptions {
  to: string | string[] | EmailRecipient | EmailRecipient[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  fromName?: string;
  replyTo?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  simulated?: boolean;
  provider?: "cloudflare-worker" | "cloudflare-api" | "simulated";
}

/**
 * Normalizes recipients into a list of EmailRecipient objects
 */
function normalizeRecipients(
  recipients: string | string[] | EmailRecipient | EmailRecipient[]
): EmailRecipient[] {
  if (Array.isArray(recipients)) {
    return recipients.map((r) =>
      typeof r === "string" ? { email: r.trim() } : { email: r.email.trim(), name: r.name }
    );
  }
  if (typeof recipients === "string") {
    return [{ email: recipients.trim() }];
  }
  return [{ email: recipients.email.trim(), name: recipients.name }];
}

/**
 * Universal email sender powered by Cloudflare Email Sending.
 *
 * 1. Inside Cloudflare Workers:
 *    Uses the native `send_email` binding (`env.EMAIL.send(...)`) via OpenNext.
 * 2. In local development / Node fallback:
 *    Uses Cloudflare Email Sending REST API if account credentials are in env,
 *    or simulates delivery with console logging without crashing the process.
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const defaultFrom = process.env.CLOUDFLARE_EMAIL_FROM || "notifications@campusloop.space";
  const defaultFromName = process.env.CLOUDFLARE_EMAIL_NAME || "CampusLoop";
  const replyTo = options.replyTo || process.env.CLOUDFLARE_REPLY_TO || "support@campusloop.space";

  const senderEmail = options.from || defaultFrom;
  const senderName = options.fromName || defaultFromName;

  const recipients = normalizeRecipients(options.to);
  if (recipients.length === 0) {
    return { success: false, error: "No recipients provided" };
  }

  const plainText = options.text || options.html?.replace(/<[^>]*>?/gm, "") || options.subject;
  const htmlContent = options.html || `<p>${plainText.replace(/\n/g, "<br/>")}</p>`;

  // ─── 1. Attempt Native Cloudflare Worker Binding (`env.EMAIL`) ───
  try {
    const ctx = getCloudflareContext();
    const env = ctx?.env as { EMAIL?: { send: (msg: unknown) => Promise<unknown> } } | undefined;

    if (env?.EMAIL && typeof env.EMAIL.send === "function") {
      try {
        await env.EMAIL.send({
          from: { email: senderEmail, name: senderName },
          to: recipients.map((r) => (r.name ? { email: r.email, name: r.name } : { email: r.email })),
          subject: options.subject,
          text: plainText,
          html: htmlContent,
          replyTo: { email: replyTo, name: senderName },
        });

        return {
          success: true,
          provider: "cloudflare-worker",
          messageId: `cfw_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        };
      } catch (workerErr) {
        console.warn("[Cloudflare Email Worker send failed, trying API fallback]:", workerErr);
      }
    }
  } catch {
    // Expected when running outside Cloudflare Worker runtime (e.g. tests or local dev)
  }

  // ─── 2. Attempt Cloudflare Email Sending REST API ───
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN || process.env.CF_AIG_TOKEN;

  if (accountId && apiToken) {
    try {
      const res = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/email/sending/send`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: senderEmail,
            from_name: senderName,
            to: recipients.map((r) => r.email),
            subject: options.subject,
            text: plainText,
            html: htmlContent,
            reply_to: replyTo,
          }),
        }
      );

      if (res.ok) {
        const data = (await res.json()) as { result?: { message_id?: string } };
        return {
          success: true,
          provider: "cloudflare-api",
          messageId: data?.result?.message_id || `cfapi_${Date.now()}`,
        };
      } else {
        const errData = await res.text();
        console.warn("[Cloudflare Email REST API error]:", res.status, errData);
      }
    } catch (apiErr) {
      console.warn("[Cloudflare Email REST API fetch failed]:", apiErr);
    }
  }

  // ─── 3. Local Development Simulation Fallback ───
  console.log("📨 [Simulated Email Delivery]:", {
    from: `${senderName} <${senderEmail}>`,
    to: recipients.map((r) => r.email).join(", "),
    subject: options.subject,
    preview: plainText.slice(0, 100),
  });

  return {
    success: true,
    simulated: true,
    provider: "simulated",
    messageId: `sim_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  };
}
