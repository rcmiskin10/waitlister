'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, MessageCircle, Flame } from 'lucide-react';
import { toast } from 'sonner';
import type { ClassifiedReply, DMCandidate } from '@/types/triage';
import { toPullScore, CLASSIFICATION_LABELS } from '@/types/triage';

interface HighPullSignalsCardProps {
  replies: ClassifiedReply[];
  dmCandidates: DMCandidate[];
}

function PullBar({ score }: { score: number }) {
  const pullScore = toPullScore(score);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all"
          style={{ width: `${pullScore}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground w-8">{pullScore}</span>
    </div>
  );
}

export function HighPullSignalsCard({ replies, dmCandidates }: HighPullSignalsCardProps) {
  const highPullReplies = replies.filter(
    (r) => r.classification === 'pain' || r.classification === 'curiosity'
  );

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  if (highPullReplies.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            High-Pull Signals (0)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No high-pull replies detected in this thread.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          High-Pull Signals ({highPullReplies.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {highPullReplies.map((reply) => {
          const dmCandidate = dmCandidates.find(
            (d) => d.handle.toLowerCase().replace('@', '') === reply.authorHandle.toLowerCase()
          );
          const isDMWorthy = reply.suggestedAction === 'DM' || dmCandidate;

          return (
            <div key={reply.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">@{reply.authorHandle}</span>
                  {reply.authorFollowers && (
                    <span className="text-xs text-muted-foreground">
                      {reply.authorFollowers.toLocaleString()} followers
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <Badge
                    variant={reply.classification === 'pain' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {CLASSIFICATION_LABELS[reply.classification]}
                  </Badge>
                  {isDMWorthy && (
                    <Badge variant="default" className="text-xs">
                      DM
                    </Badge>
                  )}
                </div>
              </div>

              <p className="text-sm">&ldquo;{reply.text}&rdquo;</p>

              {reply.keyQuote && reply.keyQuote !== reply.text && (
                <p className="text-sm text-muted-foreground italic border-l-2 border-orange-500 pl-2">
                  Key: {reply.keyQuote}
                </p>
              )}

              <PullBar score={reply.intentScore} />

              {reply.reason && (
                <p className="text-xs text-muted-foreground">{reply.reason}</p>
              )}

              <div className="flex gap-2 pt-2">
                {isDMWorthy && (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => copyToClipboard(`@${reply.authorHandle}`, 'Handle')}
                  >
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Copy Handle
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(reply.text, 'Reply')}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy Reply
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
