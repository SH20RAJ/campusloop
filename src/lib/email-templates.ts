/**
 * Clean, responsive, high-contrast HTML email templates adhering to CampusLoop's brand.
 * Strictly no Sparkles/✨ emojis or broken external stylesheets.
 */

interface BaseTemplateOptions {
  title: string;
  previewText: string;
  contentHtml: string;
  actionText?: string;
  actionUrl?: string;
  footerText?: string;
}

function baseEmailTemplate({
  title,
  previewText,
  contentHtml,
  actionText,
  actionUrl,
  footerText,
}: BaseTemplateOptions): string {
  const currentYear = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #090a0f;
      color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #090a0f;
      padding: 40px 16px;
    }
    .card {
      max-width: 560px;
      margin: 0 auto;
      background-color: #11141c;
      border: 1px solid #1e2533;
      border-radius: 16px;
      overflow: hidden;
    }
    .header {
      padding: 28px 32px 20px;
      border-bottom: 1px solid #1e2533;
    }
    .brand {
      font-size: 18px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.5px;
      text-decoration: none;
    }
    .brand span {
      color: #6366f1;
    }
    .body {
      padding: 32px;
      font-size: 15px;
      line-height: 1.6;
      color: #cbd5e1;
    }
    .btn-wrap {
      margin: 28px 0 16px;
    }
    .btn {
      display: inline-block;
      padding: 12px 24px;
      background-color: #4f46e5;
      color: #ffffff !important;
      font-weight: 700;
      font-size: 14px;
      text-decoration: none;
      border-radius: 10px;
    }
    .footer {
      padding: 24px 32px;
      border-top: 1px solid #1e2533;
      font-size: 12px;
      color: #64748b;
      line-height: 1.5;
    }
    .footer a {
      color: #818cf8;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <!-- Preview text -->
  <div style="display:none;font-size:1px;color:#090a0f;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${previewText}
  </div>

  <table class="wrapper" role="presentation" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <div class="card">
          <div class="header">
            <a href="https://campusloop.space" class="brand">
              Campus<span>Loop</span>
            </a>
          </div>

          <div class="body">
            ${contentHtml}

            ${
              actionText && actionUrl
                ? `<div class="btn-wrap">
                     <a href="${actionUrl}" class="btn" target="_blank">${actionText}</a>
                   </div>`
                : ""
            }
          </div>

          <div class="footer">
            <p style="margin: 0 0 8px 0;">
              ${footerText || "You are receiving this because of activity on your verified CampusLoop account."}
            </p>
            <p style="margin: 0;">
              &copy; ${currentYear} CampusLoop Inc. · The verified student network for higher education in India.
              <br/>
              <a href="https://campusloop.space/safety">Safety</a> · <a href="https://campusloop.space/privacy">Privacy</a> · <a href="https://campusloop.space/contact">Contact</a>
            </p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Notification Email Template
 */
export function buildNotificationEmail({
  recipientName,
  actorName,
  type,
  snippet,
  actionUrl = "https://campusloop.space/app/notifications",
}: {
  recipientName: string;
  actorName: string;
  type: "MENTION" | "REPLY" | "LIKE" | "MATCH" | "MESSAGE" | "QUARANTINE";
  snippet?: string;
  actionUrl?: string;
}): { subject: string; html: string; text: string } {
  let subject = "New notification on CampusLoop";
  let headline = "You have a new notification";

  if (type === "MENTION") {
    subject = `@${actorName} mentioned you on CampusLoop`;
    headline = `<strong>@${actorName}</strong> mentioned you in a campus discussion:`;
  } else if (type === "REPLY") {
    subject = `@${actorName} replied to your post on CampusLoop`;
    headline = `<strong>@${actorName}</strong> replied to your post:`;
  } else if (type === "LIKE") {
    subject = `@${actorName} liked your post on CampusLoop`;
    headline = `<strong>@${actorName}</strong> liked your post!`;
  } else if (type === "MATCH") {
    subject = "It's a Mutual Match on Campus Match!";
    headline = `You and <strong>@${actorName}</strong> liked each other!`;
  } else if (type === "MESSAGE") {
    subject = `New message from @${actorName} on CampusLoop`;
    headline = `<strong>@${actorName}</strong> sent you a direct message:`;
  }

  const contentHtml = `
    <h2 style="font-size: 18px; font-weight: 800; color: #ffffff; margin-top: 0; margin-bottom: 16px;">
      Hey ${recipientName || "there"},
    </h2>
    <p style="margin-bottom: 20px; font-size: 15px;">
      ${headline}
    </p>
    ${
      snippet
        ? `<div style="background-color: #0c0e14; border-left: 3px solid #6366f1; padding: 14px 18px; border-radius: 8px; margin: 16px 0; color: #e2e8f0; font-style: italic;">
             "${snippet}"
           </div>`
        : ""
    }
    <p style="font-size: 13px; color: #94a3b8; margin-top: 24px;">
      Tap below to jump directly into the conversation on CampusLoop.
    </p>
  `;

  const html = baseEmailTemplate({
    title: subject,
    previewText: snippet ? `${actorName}: ${snippet}` : subject,
    contentHtml,
    actionText: "View on CampusLoop",
    actionUrl,
  });

  const text = `Hey ${recipientName || "there"},\n\n${headline}\n\n${snippet ? `"${snippet}"\n\n` : ""}View it on CampusLoop: ${actionUrl}`;

  return { subject, html, text };
}

/**
 * Welcome / Verification Email Template
 */
export function buildWelcomeEmail({
  displayName,
  collegeName,
}: {
  displayName: string;
  collegeName: string;
}): { subject: string; html: string; text: string } {
  const subject = `Welcome to CampusLoop — Verified at ${collegeName}!`;
  const contentHtml = `
    <h2 style="font-size: 18px; font-weight: 800; color: #ffffff; margin-top: 0; margin-bottom: 16px;">
      Welcome to your campus network, ${displayName}!
    </h2>
    <p style="margin-bottom: 16px;">
      Your student email has been verified and your account is active at <strong>${collegeName}</strong>.
    </p>
    <p style="margin-bottom: 16px;">
      Here is what you can do right now:
    </p>
    <ul style="padding-left: 20px; margin-bottom: 24px; color: #cbd5e1; line-height: 1.8;">
      <li><strong>Campus Feed:</strong> Participate in college polls, confessions, and discussions.</li>
      <li><strong>Loop Points (LP):</strong> Earn clout by engaging and unlock your verified blue badge at 150 LP.</li>
      <li><strong>Campus Match:</strong> Connect with verified classmates in your college or across India.</li>
      <li><strong>Campus Hubs:</strong> Explore lost &amp; found, peer marketplace, notes, and rideshare.</li>
    </ul>
  `;

  const html = baseEmailTemplate({
    title: subject,
    previewText: `Your student profile at ${collegeName} is verified. Welcome to CampusLoop!`,
    contentHtml,
    actionText: "Open Campus Feed",
    actionUrl: "https://campusloop.space/app",
  });

  const text = `Welcome to CampusLoop, ${displayName}!\n\nYour student profile at ${collegeName} is verified.\n\nOpen your campus feed: https://campusloop.space/app`;

  return { subject, html, text };
}
