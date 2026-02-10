// Agent system types

export type AgentType =
  | 'landing-generator'
  | 'metrics-analyst'
  | 'market-researcher'
  | 'social-listener'

export type AgentModel = 'sonnet' | 'opus' | 'haiku'

export interface AgentDefinition {
  /** Display name of the agent */
  name: string
  /** Description of when to use this agent (for routing) */
  description: string
  /** System prompt defining agent behavior */
  systemPrompt: string
  /** Allowed tool names */
  tools: string[]
  /** Claude model to use */
  model: AgentModel
  /** Maximum tokens for response */
  maxTokens?: number
}

export interface AgentMessage {
  id: string
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  timestamp: string
  metadata?: {
    toolCalls?: ToolCall[]
    tokens?: number
    durationMs?: number
  }
}

export interface ToolCall {
  id: string
  name: string
  input: Record<string, unknown>
  output?: string
  status: 'pending' | 'completed' | 'error'
}

export interface ChatRequest {
  agentType: AgentType
  prompt: string
  messages?: Array<{ role: 'user' | 'assistant'; content: string }>
  sessionId?: string
  pageId?: string
  context?: ConversationContext
}

// Conversation context for multi-turn chat
export interface ConversationContext {
  currentPage?: LandingPageStructure
  [key: string]: unknown
}

// Multiple choice option parsed from AI response
export interface MultipleChoiceOption {
  key: string // A, B, C, D, etc.
  label: string
  description?: string
}

// Parsed content from AI response
export interface ParsedAIContent {
  text: string
  choices?: MultipleChoiceOption[]
  action?: AIAction
}

// AI action for generation or modification
export interface AIAction {
  action: 'generate' | 'patch'
  // For generate action
  sections?: Section[]
  theme?: LandingPageTheme
  metadata?: LandingPageMetadata
  // For patch action
  changes?: JSONPatchOperation[]
}

// JSON Patch operation (RFC 6902)
export interface JSONPatchOperation {
  op: 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test'
  path: string
  value?: unknown
  from?: string
}

export interface ChatStreamEvent {
  type: 'text' | 'tool_call' | 'tool_result' | 'error' | 'done'
  content?: string
  toolName?: string
  toolInput?: Record<string, unknown>
  toolOutput?: string
  error?: string
}

// Landing page structure types
export type SectionType =
  | 'hero'
  | 'features'
  | 'pricing'
  | 'testimonials'
  | 'cta'
  | 'faq'
  | 'footer'

export interface SectionStyleOverride {
  palette?: ColorPalette
  style?: DesignStyle
  customBackground?: string
}

export interface Section {
  type: SectionType
  props: Record<string, unknown>
  styleOverride?: SectionStyleOverride
}

export type ColorPalette =
  | 'violet'
  | 'ocean'
  | 'sunset'
  | 'forest'
  | 'midnight'
  | 'electric'
  | 'rose'
  | 'aurora'

export type DesignStyle =
  | 'glassmorphic'
  | 'gradient'
  | 'minimal'
  | 'bold'
  | 'dark'

export interface LandingPageTheme {
  primaryColor: string
  secondaryColor: string
  font: string
  palette: ColorPalette
  style: DesignStyle
}

export interface LandingPageMetadata {
  title: string
  description: string
  ogImage?: string
}

export interface LandingPageStructure {
  sections: Section[]
  theme: LandingPageTheme
  metadata: LandingPageMetadata
}

// Hero section props
export interface HeroProps {
  headline: string
  subheadline?: string
  ctaText: string
  ctaLink: string
  secondaryCtaText?: string
  badge?: string
  image?: string
  variant: 'centered' | 'split' | 'video'
}

// Features section props
export interface FeatureItem {
  icon: string
  title: string
  description: string
}

export interface FeaturesProps {
  headline: string
  features: FeatureItem[]
  layout: 'grid' | 'list'
}

// Pricing section props
export interface PricingPlan {
  name: string
  price: number | string
  interval?: string
  features: string[]
  highlighted?: boolean
  ctaText?: string
  ctaLink?: string
}

export interface PricingProps {
  headline: string
  plans: PricingPlan[]
}

// Testimonial section props
export interface Testimonial {
  quote: string
  author: string
  role?: string
  avatar?: string
}

export interface TestimonialsProps {
  headline: string
  testimonials: Testimonial[]
}

// CTA section props
export interface CTAProps {
  headline: string
  subheadline?: string
  ctaText: string
  ctaLink: string
  variant: 'simple' | 'split'
}

// FAQ section props
export interface FAQItem {
  question: string
  answer: string
}

export interface FAQProps {
  headline: string
  questions: FAQItem[]
}

// Footer section props
export interface FooterLink {
  label: string
  href: string
}

export interface FooterProps {
  companyName: string
  links: FooterLink[]
  socials?: {
    twitter?: string
    github?: string
    linkedin?: string
  }
}
