import { Zap, Users, Clock, BarChart, Globe, Download } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  title: string
  href: string
  external?: boolean
}

export interface FooterLink {
  title: string
  href: string
}

export interface FooterSection {
  title: string
  links: FooterLink[]
}

export interface Feature {
  icon: LucideIcon
  title: string
  description: string
  gradient: string
}

export interface HeroContent {
  badge: string
  headline: string
  headlineHighlight: string
  subheadline: string
  primaryCta: { text: string; href: string }
  secondaryCta: { text: string; href: string }
  socialProof?: { text: string; rating: string }
}

export interface SiteConfig {
  name: string
  tagline: string
  description: string
  url: string
  company: string
  mainNav: NavItem[]
  dashboardNav: NavItem[]
  hero: HeroContent
  features: Feature[]
  techStack: Array<{ name: string; color: string }>
  footerSections: FooterSection[]
  footerCopyright: string
  social: {
    twitter?: string
    github?: string
    discord?: string
  }
}

export const siteConfig: SiteConfig = {
  name: 'Waitlister',
  tagline: 'Launch pages that build hype, not headaches',
  description: 'Waitlist and launch page builder with referral tracking for indie hackers shipping products fast.',
  url: process.env.NEXT_PUBLIC_APP_URL
    || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null)
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
    || 'http://localhost:3000',
  company: 'Waitlister',

  mainNav: [
    { title: 'Features', href: '/features' },
    { title: 'Pricing', href: '/pricing' },
    { title: 'Templates', href: '/features#templates' },
    { title: 'Blog', href: '/blog' }
  ],

  dashboardNav: [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Waitlist Pages', href: '/dashboard/entities' },
    { title: 'Analytics', href: '/dashboard/analytics' },
    { title: 'Settings', href: '/dashboard/settings' }
  ],

  hero: {
    badge: 'Built for indie hackers 🚀',
    headline: 'Launch your waitlist page',
    headlineHighlight: 'In under 5 minutes',
    subheadline: 'Stop stitching together Carrd, Mailchimp, and custom referral hacks. Waitlister gives you a beautiful coming-soon page with built-in email capture, viral referral tracking, and a countdown timer — all for a fraction of what competitors charge.',
    primaryCta: { text: 'Create Your Page Free', href: '/register' },
    secondaryCta: { text: 'See How It Works', href: '/features' },
    socialProof: { text: 'Trusted by 1,200+ indie hackers', rating: '4.9/5' },
  },

  features: [
    {
      icon: Zap,
      title: '5-Minute Page Builder',
      description: 'Pick a template, customize your copy, and publish — your waitlist page is live before your coffee gets cold.',
      gradient: 'from-violet-500 to-purple-500',
    },
    {
      icon: Users,
      title: 'Viral Referral Tracking',
      description: 'Every subscriber gets a unique referral link. They share to move up the waitlist, turning your signups into a growth engine.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Clock,
      title: 'Countdown Timer',
      description: 'Build urgency with a native launch countdown that updates in real-time — no embeds or third-party code required.',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: BarChart,
      title: 'Simple Analytics',
      description: 'Track signups per day, referral conversion rates, and top referrers — actionable metrics without the enterprise dashboard bloat.',
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      icon: Globe,
      title: 'Custom Domains & SSL',
      description: 'Connect your own domain with automatic SSL provisioning. Your launch page, your brand — no Waitlister subdomain required on Pro.',
      gradient: 'from-pink-500 to-rose-500',
    },
    {
      icon: Download,
      title: 'One-Click Email Export',
      description: 'Export your entire waitlist as CSV or JSON anytime. Seamlessly migrate subscribers to ConvertKit, Loops, or Mailchimp when you launch.',
      gradient: 'from-amber-500 to-yellow-500',
    }
  ],

  techStack: [
    { name: 'Next.js', color: 'bg-black text-white' },
    { name: 'Supabase', color: 'bg-emerald-600 text-white' },
    { name: 'Stripe', color: 'bg-purple-600 text-white' },
    { name: 'Tailwind CSS', color: 'bg-sky-500 text-white' },
    { name: 'Vercel', color: 'bg-gray-900 text-white' }
  ],

  footerSections: [
    {
      title: 'Product',
      links: [
        { title: 'Features', href: '/features' },
        { title: 'Pricing', href: '/pricing' },
        { title: 'Templates', href: '/features#templates' },
        { title: 'Changelog', href: '/blog' }
      ],
    },
    {
      title: 'Company',
      links: [
        { title: 'About', href: '/about' },
        { title: 'Blog', href: '/blog' },
        { title: 'Contact', href: '/contact' }
      ],
    },
    {
      title: 'Legal',
      links: [
        { title: 'Privacy Policy', href: '/privacy' },
        { title: 'Terms of Service', href: '/terms' }
      ],
    }
  ],

  footerCopyright: '2026 Waitlister. All rights reserved.',

  social: {
    github: 'https://github.com/waitlister',
    twitter: 'https://twitter.com/waitlister'
  },
}
