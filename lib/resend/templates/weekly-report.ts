export interface WeeklyReportEmailProps {
  userName: string
  appUrl: string
  stats: {
    totalPageViews: number
    pageViewChange: number
    topPages: Array<{ name: string; views: number }>
    conversions: number
    conversionChange: number
  }
  period: {
    start: string
    end: string
  }
}

export function generateWeeklyReportEmail({
  userName,
  appUrl,
  stats,
  period,
}: WeeklyReportEmailProps) {
  const changeColor = (change: number) => (change >= 0 ? '#10b981' : '#ef4444')
  const changePrefix = (change: number) => (change >= 0 ? '+' : '')

  const topPagesHtml = stats.topPages
    .slice(0, 5)
    .map(
      (page) => `
      <tr>
        <td style="color: #374151; font-size: 14px; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${page.name}</td>
        <td style="color: #374151; font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${page.views.toLocaleString()}</td>
      </tr>
    `
    )
    .join('')

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Weekly Report</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Your Weekly Report</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 14px;">${period.start} - ${period.end}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                Hi ${userName || 'there'}, here's how your landing pages performed this week:
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td width="48%" style="background-color: #f9fafb; border-radius: 8px; padding: 20px; vertical-align: top;">
                    <p style="color: #6b7280; font-size: 12px; text-transform: uppercase; margin: 0 0 8px;">Page Views</p>
                    <p style="color: #111827; font-size: 28px; font-weight: 700; margin: 0;">${stats.totalPageViews.toLocaleString()}</p>
                    <p style="color: ${changeColor(stats.pageViewChange)}; font-size: 14px; margin: 8px 0 0;">
                      ${changePrefix(stats.pageViewChange)}${stats.pageViewChange}% from last week
                    </p>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="background-color: #f9fafb; border-radius: 8px; padding: 20px; vertical-align: top;">
                    <p style="color: #6b7280; font-size: 12px; text-transform: uppercase; margin: 0 0 8px;">Conversions</p>
                    <p style="color: #111827; font-size: 28px; font-weight: 700; margin: 0;">${stats.conversions.toLocaleString()}</p>
                    <p style="color: ${changeColor(stats.conversionChange)}; font-size: 14px; margin: 8px 0 0;">
                      ${changePrefix(stats.conversionChange)}${stats.conversionChange}% from last week
                    </p>
                  </td>
                </tr>
              </table>

              <h2 style="color: #111827; font-size: 18px; font-weight: 600; margin: 0 0 16px;">Top Performing Pages</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <th style="color: #6b7280; font-size: 12px; text-transform: uppercase; text-align: left; padding-bottom: 12px; border-bottom: 2px solid #e5e7eb;">Page</th>
                  <th style="color: #6b7280; font-size: 12px; text-transform: uppercase; text-align: right; padding-bottom: 12px; border-bottom: 2px solid #e5e7eb;">Views</th>
                </tr>
                ${topPagesHtml}
              </table>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${appUrl}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                      View Full Analytics
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                <a href="${appUrl}/dashboard/settings" style="color: #6366f1; text-decoration: none;">Manage email preferences</a>
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

  const topPagesText = stats.topPages
    .slice(0, 5)
    .map((page) => `  - ${page.name}: ${page.views.toLocaleString()} views`)
    .join('\n')

  const text = `
Your Weekly Report
${period.start} - ${period.end}

Hi ${userName || 'there'}, here's how your landing pages performed this week:

Page Views: ${stats.totalPageViews.toLocaleString()} (${changePrefix(stats.pageViewChange)}${stats.pageViewChange}% from last week)
Conversions: ${stats.conversions.toLocaleString()} (${changePrefix(stats.conversionChange)}${stats.conversionChange}% from last week)

Top Performing Pages:
${topPagesText}

View full analytics: ${appUrl}/dashboard

Manage email preferences: ${appUrl}/dashboard/settings
  `.trim()

  return { html, text, subject: `Your weekly Saasify report (${period.start} - ${period.end})` }
}
