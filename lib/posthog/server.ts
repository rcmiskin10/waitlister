import { PostHog } from 'posthog-node'

let posthogClient: PostHog | null = null

export function getPostHogServerClient(): PostHog | null {
  if (!process.env.POSTHOG_API_KEY) {
    return null
  }

  if (!posthogClient) {
    posthogClient = new PostHog(process.env.POSTHOG_API_KEY, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      flushAt: 1,
      flushInterval: 0,
    })
  }

  return posthogClient
}

export function captureServerEvent(
  distinctId: string,
  eventName: string,
  properties?: Record<string, unknown>
) {
  const client = getPostHogServerClient()
  if (client) {
    client.capture({
      distinctId,
      event: eventName,
      properties,
    })
  }
}

export async function shutdownPostHog() {
  if (posthogClient) {
    await posthogClient.shutdown()
  }
}
