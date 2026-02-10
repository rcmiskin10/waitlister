export interface SubscriptionConfirmedEmailProps {
  userName: string
  planName: string
  price: number
  interval: 'month' | 'year'
  appUrl: string
}

export function generateSubscriptionConfirmedEmail({
  userName,
  planName,
  price,
  interval,
  appUrl,
}: SubscriptionConfirmedEmailProps) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Subscription Confirmed</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Subscription Confirmed!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Hi ${userName || 'there'},
              </p>
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                Thank you for upgrading to <strong>${planName}</strong>! Your subscription is now active.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 24px;">
                    <table width="100%">
                      <tr>
                        <td style="color: #6b7280; font-size: 14px; padding-bottom: 8px;">Plan</td>
                        <td style="color: #111827; font-size: 14px; font-weight: 600; text-align: right; padding-bottom: 8px;">${planName}</td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280; font-size: 14px; padding-bottom: 8px;">Amount</td>
                        <td style="color: #111827; font-size: 14px; font-weight: 600; text-align: right; padding-bottom: 8px;">$${price}/${interval}</td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280; font-size: 14px;">Status</td>
                        <td style="color: #10b981; font-size: 14px; font-weight: 600; text-align: right;">Active</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                You now have access to all ${planName} features including unlimited AI agent conversations and more landing pages.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${appUrl}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                      Go to Dashboard
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                Manage your subscription in <a href="${appUrl}/dashboard/billing" style="color: #6366f1; text-decoration: none;">billing settings</a>.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()

  const text = `
Subscription Confirmed!

Hi ${userName || 'there'},

Thank you for upgrading to ${planName}! Your subscription is now active.

Plan Details:
- Plan: ${planName}
- Amount: $${price}/${interval}
- Status: Active

You now have access to all ${planName} features including unlimited AI agent conversations and more landing pages.

Go to your dashboard: ${appUrl}/dashboard
Manage your subscription: ${appUrl}/dashboard/billing
  `.trim()

  return { html, text, subject: `Your ${planName} subscription is confirmed!` }
}
