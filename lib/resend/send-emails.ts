import { sendEmail } from './client'
import {
  generateWelcomeEmail,
  generateSubscriptionConfirmedEmail,
  generatePasswordResetEmail,
  generateWeeklyReportEmail,
  type WelcomeEmailProps,
  type SubscriptionConfirmedEmailProps,
  type PasswordResetEmailProps,
  type WeeklyReportEmailProps,
} from './templates'

const getAppUrl = () => process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function sendWelcomeEmail(to: string, props: Omit<WelcomeEmailProps, 'appUrl'>) {
  const { html, text, subject } = generateWelcomeEmail({
    ...props,
    appUrl: getAppUrl(),
  })

  return sendEmail({
    to,
    subject,
    html,
    text,
  })
}

export async function sendSubscriptionConfirmedEmail(
  to: string,
  props: Omit<SubscriptionConfirmedEmailProps, 'appUrl'>
) {
  const { html, text, subject } = generateSubscriptionConfirmedEmail({
    ...props,
    appUrl: getAppUrl(),
  })

  return sendEmail({
    to,
    subject,
    html,
    text,
  })
}

export async function sendPasswordResetEmail(
  to: string,
  props: Omit<PasswordResetEmailProps, 'appUrl'>
) {
  const { html, text, subject } = generatePasswordResetEmail({
    ...props,
    appUrl: getAppUrl(),
  })

  return sendEmail({
    to,
    subject,
    html,
    text,
  })
}

export async function sendWeeklyReportEmail(
  to: string,
  props: Omit<WeeklyReportEmailProps, 'appUrl'>
) {
  const { html, text, subject } = generateWeeklyReportEmail({
    ...props,
    appUrl: getAppUrl(),
  })

  return sendEmail({
    to,
    subject,
    html,
    text,
  })
}
