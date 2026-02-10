'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Send } from 'lucide-react';
import { toast } from 'sonner';
import type { DMTemplate, DMCandidate } from '@/types/triage';
import { toPullScore } from '@/types/triage';

interface DMTemplatesCardProps {
  templates: DMTemplate[];
  candidates: DMCandidate[];
}

export function DMTemplatesCard({ templates, candidates }: DMTemplatesCardProps) {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  if (templates.length === 0 && candidates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-purple-500" />
            Who to DM (0)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No DM candidates identified.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5 text-purple-500" />
          Who to DM ({Math.max(templates.length, candidates.length)})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {candidates.length > 0 && templates.length === 0 && (
          <div className="space-y-3">
            {candidates.map((candidate, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-purple-600 dark:text-purple-400">
                    {candidate.handle}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Pull: {toPullScore(candidate.intentScore)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{candidate.reason}</p>
                {candidate.originalReply && (
                  <p className="text-xs border-l-2 pl-2">
                    &ldquo;{candidate.originalReply}&rdquo;
                  </p>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(candidate.handle, 'Handle')}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy Handle
                </Button>
              </div>
            ))}
          </div>
        )}

        {templates.map((template, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <span className="font-medium text-purple-600 dark:text-purple-400">
                To {template.toHandle}
              </span>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
              <p className="text-sm whitespace-pre-wrap">{template.template}</p>
            </div>

            {template.goal && (
              <p className="text-xs text-muted-foreground">
                🎯 Goal: {template.goal}
              </p>
            )}

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => copyToClipboard(template.template, 'DM template')}
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy DM
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(template.toHandle, 'Handle')}
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy Handle
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
