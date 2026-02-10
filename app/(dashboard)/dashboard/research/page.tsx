'use client'

import { ChatInterface } from '@/components/chat/ChatInterface'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ResearchPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Market Research</h1>
        <p className="text-muted-foreground">
          Validate your SaaS idea with AI-powered market research.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 h-[600px] flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle>Research Assistant</CardTitle>
            <CardDescription>
              Describe your idea and I&apos;ll help you research the market.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <ChatInterface
              agentType="market-researcher"
              placeholder="Describe your SaaS idea or ask about a specific market..."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What I Can Help With</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-1">Competitor Analysis</h4>
              <p className="text-sm text-muted-foreground">
                Find and analyze your direct and indirect competitors.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Market Size</h4>
              <p className="text-sm text-muted-foreground">
                Estimate the total addressable market for your idea.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Target Audience</h4>
              <p className="text-sm text-muted-foreground">
                Define and understand your ideal customer profile.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Opportunities & Risks</h4>
              <p className="text-sm text-muted-foreground">
                Identify potential opportunities and risks in your market.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
