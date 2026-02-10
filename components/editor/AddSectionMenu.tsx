'use client'

import { useEditor } from './EditorContext'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, Layout, Grid3X3, DollarSign, MessageSquareQuote, HelpCircle, Megaphone } from 'lucide-react'
import type { Section } from '@/types/agents'

const SECTION_TEMPLATES: { type: Section['type']; label: string; icon: React.ElementType; template: Section }[] = [
  {
    type: 'hero',
    label: 'Hero Section',
    icon: Layout,
    template: {
      type: 'hero',
      props: {
        headline: 'Your Headline Here',
        subheadline: 'Add your supporting text to explain your value proposition.',
        ctaText: 'Get Started',
        ctaLink: '/signup',
        secondaryCtaText: 'Learn More',
        badge: 'New',
      }
    }
  },
  {
    type: 'features',
    label: 'Features Section',
    icon: Grid3X3,
    template: {
      type: 'features',
      props: {
        headline: 'Powerful Features',
        subheadline: 'Everything you need to succeed',
        features: [
          { icon: 'zap', title: 'Fast', description: 'Lightning quick performance' },
          { icon: 'shield', title: 'Secure', description: 'Enterprise-grade security' },
          { icon: 'rocket', title: 'Scalable', description: 'Grows with your business' },
        ]
      }
    }
  },
  {
    type: 'pricing',
    label: 'Pricing Section',
    icon: DollarSign,
    template: {
      type: 'pricing',
      props: {
        headline: 'Simple Pricing',
        plans: [
          { name: 'Free', price: '$0', interval: '/month', features: ['Basic features', 'Email support'], ctaText: 'Get Started', ctaLink: '/signup' },
          { name: 'Pro', price: '$29', interval: '/month', features: ['All features', 'Priority support', 'API access'], highlighted: true, ctaText: 'Start Free Trial', ctaLink: '/signup' },
          { name: 'Enterprise', price: 'Custom', features: ['Everything in Pro', 'Dedicated support', 'Custom integrations'], ctaText: 'Contact Sales', ctaLink: '/contact' },
        ]
      }
    }
  },
  {
    type: 'testimonials',
    label: 'Testimonials',
    icon: MessageSquareQuote,
    template: {
      type: 'testimonials',
      props: {
        headline: 'What Our Customers Say',
        testimonials: [
          { quote: 'This product has transformed how we work.', author: 'John Doe', role: 'CEO at Company' },
          { quote: 'Incredible results from day one.', author: 'Jane Smith', role: 'Founder at Startup' },
        ]
      }
    }
  },
  {
    type: 'faq',
    label: 'FAQ Section',
    icon: HelpCircle,
    template: {
      type: 'faq',
      props: {
        headline: 'Frequently Asked Questions',
        questions: [
          { question: 'How does it work?', answer: 'Simply sign up and get started in minutes.' },
          { question: 'Is there a free trial?', answer: 'Yes, we offer a 14-day free trial.' },
          { question: 'Can I cancel anytime?', answer: 'Absolutely, no questions asked.' },
        ]
      }
    }
  },
  {
    type: 'cta',
    label: 'CTA Section',
    icon: Megaphone,
    template: {
      type: 'cta',
      props: {
        headline: 'Ready to Get Started?',
        subheadline: 'Join thousands of happy customers today.',
        ctaText: 'Start Free Trial',
        ctaLink: '/signup',
      }
    }
  },
]

interface AddSectionMenuProps {
  afterIndex?: number
}

export function AddSectionMenu({ afterIndex }: AddSectionMenuProps) {
  const { addSection } = useEditor()

  const handleAddSection = (template: Section) => {
    addSection({ ...template }, afterIndex)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Section
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {SECTION_TEMPLATES.map((section) => (
          <DropdownMenuItem
            key={section.type}
            onClick={() => handleAddSection(section.template)}
            className="gap-2"
          >
            <section.icon className="h-4 w-4" />
            {section.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
