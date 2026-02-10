import { Resend } from 'resend'

let resendClient: Resend | null = null

export function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null
  }

  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY)
  }

  return resendClient
}

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
  replyTo?: string
}

export async function sendEmail(options: SendEmailOptions) {
  const client = getResendClient()
  if (!client) {
    console.warn('Resend API key not configured, skipping email')
    return null
  }

  const fromAddress = options.from || process.env.RESEND_FROM_EMAIL || 'noreply@example.com'

  try {
    const result = await client.emails.send({
      from: fromAddress,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
    })

    return result
  } catch (error) {
    console.error('Failed to send email:', error)
    throw error
  }
}
