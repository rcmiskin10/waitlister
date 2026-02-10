'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Calendar, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import type { GeneratedPost, PainPoint } from '@/types/triage';

interface TomorrowPostCardProps {
  post?: GeneratedPost;
  painPoints: PainPoint[];
  keywords: string[];
}

export function TomorrowPostCard({ post, painPoints, keywords }: TomorrowPostCardProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Post copied to clipboard');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-green-500" />
          Post This Tomorrow
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {post ? (
          <div className="space-y-3">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <p className="text-sm whitespace-pre-wrap">{post.post}</p>
            </div>
            {post.hook && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Lightbulb className="h-3 w-3" />
                {post.hook}
              </p>
            )}
            <Button size="sm" onClick={() => copyToClipboard(post.post)}>
              <Copy className="h-3 w-3 mr-1" />
              Copy Post
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No post suggestion generated.
          </p>
        )}

        {painPoints.length > 0 && (
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">Lived Pains to Address</p>
            <div className="space-y-2">
              {painPoints.map((point, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between gap-2 text-sm"
                >
                  <span>{point.pain}</span>
                  <Badge
                    variant={
                      point.urgency === 'high'
                        ? 'destructive'
                        : point.urgency === 'medium'
                          ? 'secondary'
                          : 'outline'
                    }
                    className="text-xs shrink-0"
                  >
                    {point.urgency}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {keywords.length > 0 && (
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">Keywords They Use</p>
            <div className="flex flex-wrap gap-1">
              {keywords.map((keyword, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
