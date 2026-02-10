'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowUp, MessageSquare, User } from 'lucide-react';
import type { RedditPost, ClassifiedRedditComment, ReplyClassification } from '@/types/triage';
import { toPullScore } from '@/types/triage';

interface RedditThreadProps {
  post: RedditPost;
  comments: ClassifiedRedditComment[];
}

const classificationColors: Record<ReplyClassification, string> = {
  pain: 'bg-red-500/10 text-red-500 border-red-500/20',
  curiosity: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  feature_request: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  fluff: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  objection: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
};

const classificationLabels: Record<ReplyClassification, string> = {
  pain: 'Lived Pain',
  curiosity: 'Interest',
  feature_request: 'Feature Request',
  fluff: 'Polite Noise',
  objection: 'Resistance',
};

export function RedditThread({ post, comments }: RedditThreadProps) {
  const [filter, setFilter] = useState<ReplyClassification | 'all'>('all');
  const [showAll, setShowAll] = useState(false);

  const filteredComments = comments.filter(
    (comment) => filter === 'all' || comment.classification === filter
  );

  // Sort by intent score descending
  const sortedComments = [...filteredComments].sort((a, b) => b.intentScore - a.intentScore);
  const displayedComments = showAll ? sortedComments : sortedComments.slice(0, 20);

  const counts = {
    all: comments.length,
    pain: comments.filter((c) => c.classification === 'pain').length,
    curiosity: comments.filter((c) => c.classification === 'curiosity').length,
    objection: comments.filter((c) => c.classification === 'objection').length,
    fluff: comments.filter((c) => c.classification === 'fluff').length,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Thread Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Original Post */}
        <div className="rounded-lg border bg-orange-500/5 border-orange-500/20 p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <span className="font-medium text-orange-500">r/{post.subreddit}</span>
            <span>•</span>
            <span>u/{post.author}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ArrowUp className="h-3 w-3" />
              {post.upvotes}
            </span>
            <span>•</span>
            <span>{post.commentCount} comments</span>
          </div>
          <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
          {post.body && (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {post.body.length > 500 ? `${post.body.substring(0, 500)}...` : post.body}
            </p>
          )}
        </div>

        {/* Filter Tabs */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="all" className="text-xs">
              All ({counts.all})
            </TabsTrigger>
            <TabsTrigger value="pain" className="text-xs">
              Pain ({counts.pain})
            </TabsTrigger>
            <TabsTrigger value="curiosity" className="text-xs">
              Interest ({counts.curiosity})
            </TabsTrigger>
            <TabsTrigger value="objection" className="text-xs">
              Resistance ({counts.objection})
            </TabsTrigger>
            <TabsTrigger value="fluff" className="text-xs">
              Noise ({counts.fluff})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Comments */}
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {displayedComments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-lg border p-3 hover:bg-muted/50 transition-colors"
              style={{ marginLeft: `${Math.min(comment.depth * 16, 64)}px` }}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium">u/{comment.author}</span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <ArrowUp className="h-3 w-3" />
                    {comment.upvotes}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`text-xs ${classificationColors[comment.classification]}`}
                  >
                    {classificationLabels[comment.classification]}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Pull: {toPullScore(comment.intentScore)}
                  </Badge>
                </div>
              </div>
              <p className="text-sm">{comment.text}</p>
              {comment.keyQuote && comment.keyQuote !== comment.text && (
                <p className="text-xs text-muted-foreground mt-2 italic">
                  Key: "{comment.keyQuote}"
                </p>
              )}
            </div>
          ))}
        </div>

        {sortedComments.length > 20 && !showAll && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowAll(true)}
          >
            Show all {sortedComments.length} comments
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
