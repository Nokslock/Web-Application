import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS = "Nokslock <no-reply@nokslock.com>";

export async function sendGiftPremiumEmail({
  to,
  planLabel,
  durationDays,
  expiresAt,
}: {
  to: string;
  planLabel: string;
  durationDays: number;
  expiresAt: string;
}) {
  const expDate = new Date(expiresAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `You've been gifted ${planLabel} Premium!`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #db2777); padding: 16px; border-radius: 20px;">
            <span style="font-size: 32px;">🎁</span>
          </div>
        </div>
        <h1 style="text-align: center; font-size: 24px; font-weight: 800; color: #111827; margin: 0 0 8px;">
          You've Been Gifted Premium!
        </h1>
        <p style="text-align: center; color: #6b7280; font-size: 15px; margin: 0 0 32px; line-height: 1.6;">
          Great news — an upgrade to your account has been made! You now have access to the 
          <strong style="color: #111827;">${planLabel}</strong> plan.
        </p>
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Plan</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 700; color: #111827; font-size: 14px;">${planLabel}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Duration</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 700; color: #111827; font-size: 14px;">${durationDays} days</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Valid Until</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 700; color: #111827; font-size: 14px;">${expDate}</td>
            </tr>
          </table>
        </div>
        <div style="text-align: center; margin-bottom: 32px;">
          <a href="https://nokslock.com/dashboard" style="display: inline-block; background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; font-weight: 700; font-size: 15px; text-decoration: none; padding: 14px 32px; border-radius: 12px;">
            Open Your Vault
          </a>
        </div>
        <p style="text-align: center; color: #9ca3af; font-size: 12px; margin: 0;">
          &copy; ${new Date().getFullYear()} Nokslock. All rights reserved.
        </p>
      </div>
    `,
  });
}
