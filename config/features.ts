export interface FeaturesConfig {
  auth: boolean
  billing: boolean
  email: boolean
  analytics: boolean
  ai: boolean
  aiChat: boolean
  landingGenerator: boolean
  marketResearch: boolean
  socialListening: boolean
  teams: boolean
  admin: boolean
  waitlist: boolean
  blog: boolean
  api: boolean
  fileUploads: boolean
  notifications: boolean
  entityCrud: boolean
  entityExport: boolean
  entitySearch: boolean
}

export const featuresConfig: FeaturesConfig = {
  admin: true,
  ai: false,
  aiChat: false,
  analytics: true,
  api: false,
  auth: true,
  billing: true,
  blog: true,
  email: true,
  entityCrud: true,
  entityExport: true,
  entitySearch: true,
  fileUploads: false,
  landingGenerator: false,
  marketResearch: false,
  notifications: true,
  socialListening: false,
  teams: false,
  waitlist: false
}

export function isFeatureEnabled(feature: keyof FeaturesConfig): boolean {
  return featuresConfig[feature] === true
}

export function getEnabledFeatures(): (keyof FeaturesConfig)[] {
  return (Object.keys(featuresConfig) as (keyof FeaturesConfig)[]).filter(
    (key) => featuresConfig[key],
  )
}
