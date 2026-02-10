export interface WelcomeEmailProps {
  userName: string
  appUrl: string
}

export function generateWelcomeEmail({ userName, appUrl }: WelcomeEmailProps) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Saasify</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Welcome to Saasify</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Hi ${userName || 'there'},
              </p>
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Thank you for joining Saasify! We're excited to have you on board.
              </p>
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                Here's what you can do next:
              </p>
              <ul style="color: #374151; font-size: 16px; line-height: 1.8; margin: 0 0 30px; padding-left: 20px;">
                <li>Create your first AI-generated landing page</li>
                <li>Research your market with our AI agents</li>
                <li>Monitor social mentions and sentiment</li>
                <li>Track your landing page analytics</li>
              </ul>
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
                Need help? Reply to this email or visit our <a href="${appUrl}/docs" style="color: #6366f1; text-decoration: none;">documentation</a>.
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
Welcome to Saasify!

Hi ${userName || 'there'},

Thank you for joining Saasify! We're excited to have you on board.

Here's what you can do next:
- Create your first AI-generated landing page
- Research your market with our AI agents
- Monitor social mentions and sentiment
- Track your landing page analytics

Go to your dashboard: ${appUrl}/dashboard

Need help? Reply to this email or visit our documentation at ${appUrl}/docs.
  `.trim()

  return { html, text, subject: 'Welcome to Saasify!' }
}
