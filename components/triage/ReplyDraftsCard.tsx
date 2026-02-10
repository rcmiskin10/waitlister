'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import type { ReplyDraft } from '@/types/triage';

interface ReplyDraftsCardProps {
  drafts: ReplyDraft[];
}

export function ReplyDraftsCard({ drafts }: ReplyDraftsCardProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Reply copied to clipboard');
  };

  if (drafts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-blue-500" />
            Reply Drafts (0)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No reply drafts generated.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Pencil className="h-5 w-5 text-blue-500" />
          Reply Drafts ({drafts.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {drafts.map((draft, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <span className="font-medium text-blue-600 dark:text-blue-400">
                To @{draft.toHandle}
              </span>
            </div>

            {draft.originalReply && (
              <p className="text-xs text-muted-foreground border-l-2 pl-2">
                Their reply: &ldquo;{draft.originalReply}&rdquo;
              </p>
            )}

            <div className="bg-muted rounded-lg p-3">
              <p className="text-sm">{draft.draft}</p>
            </div>

            {draft.why && (
              <p className="text-xs text-muted-foreground">
                💡 {draft.why}
              </p>
            )}

            <Button
              size="sm"
              onClick={() => copyToClipboard(draft.draft)}
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy Reply
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
