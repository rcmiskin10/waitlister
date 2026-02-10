'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import type { ClassifiedReply, GeneratedPost } from '@/types/triage';

interface ObjectionsCardProps {
  replies: ClassifiedReply[];
  topObjection?: string;
  objectionPost?: GeneratedPost;
}

export function ObjectionsCard({ replies, topObjection, objectionPost }: ObjectionsCardProps) {
  const objectionReplies = replies.filter((r) => r.classification === 'objection');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  if (objectionReplies.length === 0 && !topObjection) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Resistance (0)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No resistance detected. Your message resonated well!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          Resistance to Address ({objectionReplies.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {topObjection && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-1">
              Top Concern
            </p>
            <p className="text-sm">{topObjection}</p>
          </div>
        )}

        {objectionReplies.map((reply) => (
          <div key={reply.id} className="border rounded-lg p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <span className="font-medium">@{reply.authorHandle}</span>
              <Badge variant="outline" className="text-xs">
                resistance
              </Badge>
            </div>
            <p className="text-sm">&ldquo;{reply.text}&rdquo;</p>
            {reply.reason && (
              <p className="text-xs text-muted-foreground">{reply.reason}</p>
            )}
          </div>
        ))}

        {objectionPost && (
          <div className="border-t pt-4 mt-4">
            <p className="text-sm font-medium mb-2">Suggested Follow-up Post</p>
            <div className="bg-muted rounded-lg p-4 space-y-3">
              <p className="text-sm whitespace-pre-wrap">{objectionPost.post}</p>
              {objectionPost.addresses && (
                <p className="text-xs text-muted-foreground">
                  Addresses: {objectionPost.addresses}
                </p>
              )}
              <Button
                size="sm"
                onClick={() => copyToClipboard(objectionPost.post, 'Post')}
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy Post
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
