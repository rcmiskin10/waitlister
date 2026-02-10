'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MessageCircle,
  Heart,
  Repeat2,
  Filter,
  ExternalLink,
  Flame,
  Lightbulb,
  Meh,
  AlertTriangle,
  BarChart2,
  Image as ImageIcon,
  Play,
} from 'lucide-react';
import type { ClassifiedReply, ReplyClassification, TweetMedia } from '@/types/triage';
import { toPullScore } from '@/types/triage';

// X icon component
function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

interface RepliesThreadProps {
  originalTweet: {
    text: string;
    authorHandle: string;
    authorName?: string;
    authorProfileImage?: string;
    likes?: number;
    retweets?: number;
    replyCount?: number;
    createdAt?: string;
    url?: string;
  };
  replies: ClassifiedReply[];
  onForceRefresh?: () => void;
}

const classificationConfig: Record<
  ReplyClassification,
  { label: string; color: string; bgColor: string; icon: React.ReactNode }
> = {
  pain: {
    label: 'Lived Pain',
    color: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-950/20',
    icon: <Flame className="h-3 w-3" />,
  },
  curiosity: {
    label: 'Interest',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    icon: <Lightbulb className="h-3 w-3" />,
  },
  feature_request: {
    label: 'Feature Request',
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    icon: <Lightbulb className="h-3 w-3" />,
  },
  fluff: {
    label: 'Polite Noise',
    color: 'text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-gray-900/20',
    icon: <Meh className="h-3 w-3" />,
  },
  objection: {
    label: 'Resistance',
    color: 'text-amber-500',
    bgColor: 'bg-amber-50 dark:bg-amber-950/20',
    icon: <AlertTriangle className="h-3 w-3" />,
  },
};

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatNumber(num?: number): string {
  if (!num) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function Avatar({ src, name, size = 'md' }: { src?: string; name: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover flex-shrink-0`}
      />
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0`}>
      <span className="text-white font-semibold">
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

function ReplyCard({
  reply,
  replyingTo,
  isOwnReply = false,
  hasChildren = false,
  children,
}: {
  reply: ClassifiedReply;
  replyingTo?: string;
  isOwnReply?: boolean;
  hasChildren?: boolean;
  children?: React.ReactNode;
}) {
  const config = classificationConfig[reply.classification];

  return (
    <div className={`${config.bgColor} hover:bg-muted/30 transition-colors`}>
      <div className="flex">
        {/* Avatar column with threading line */}
        <div className="flex flex-col items-center pl-4 pt-4">
          <Avatar src={reply.authorProfileImage} name={reply.authorHandle} />
          {/* Vertical connecting line to children */}
          {hasChildren && (
            <div className="w-0.5 bg-border flex-1 mt-2 min-h-[20px]" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 p-4 pl-3">
          {/* Replying to */}
          {replyingTo && (
            <div className="text-xs text-muted-foreground mb-1">
              Replying to <span className="text-blue-500 hover:underline cursor-pointer">@{replyingTo}</span>
            </div>
          )}

          {/* Author info row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 min-w-0">
              <span className="font-bold text-sm truncate">
                {reply.authorName || reply.authorHandle}
              </span>
              <span className="text-muted-foreground text-sm truncate">
                @{reply.authorHandle}
              </span>
              {reply.createdAt && (
                <>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground text-sm flex-shrink-0">
                    {formatRelativeTime(reply.createdAt)}
                  </span>
                </>
              )}
            </div>

            {/* External link */}
            <a
              href={`https://x.com/${reply.authorHandle}/status/${reply.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground ml-2 flex-shrink-0"
              title="View on X"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          {/* Reply text */}
          <p className="mt-1 text-[15px] leading-relaxed whitespace-pre-wrap">{reply.text}</p>

          {/* Media preview */}
          {reply.media && reply.media.length > 0 && (
            <div className="mt-3 rounded-xl overflow-hidden border border-border/50">
              <div className={`grid gap-0.5 ${reply.media.length === 1 ? '' : reply.media.length === 2 ? 'grid-cols-2' : reply.media.length === 3 ? 'grid-cols-2' : 'grid-cols-2'}`}>
                {reply.media.slice(0, 4).map((m, i) => (
                  <div key={i} className={`relative bg-muted ${reply.media!.length === 3 && i === 0 ? 'row-span-2' : ''}`}>
                    {m.type === 'photo' ? (
                      <img
                        src={m.url || m.previewUrl}
                        alt=""
                        className="w-full h-full object-cover max-h-[300px]"
                      />
                    ) : (
                      <div className="relative">
                        <img
                          src={m.previewUrl}
                          alt=""
                          className="w-full h-full object-cover max-h-[300px]"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Play className="h-12 w-12 text-white" fill="white" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Engagement row */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-5 text-muted-foreground text-sm">
              <span className="flex items-center gap-1.5 hover:text-blue-500 cursor-pointer">
                <MessageCircle className="h-4 w-4" />
                {(reply.replyCount || 0) > 0 && <span>{reply.replyCount}</span>}
              </span>
              <span className="flex items-center gap-1.5 hover:text-green-500 cursor-pointer">
                <Repeat2 className="h-4 w-4" />
                {(reply.retweets || 0) > 0 && <span>{reply.retweets}</span>}
              </span>
              <span className="flex items-center gap-1.5 hover:text-pink-500 cursor-pointer">
                <Heart className="h-4 w-4" />
                {(reply.likes || 0) > 0 && <span>{reply.likes}</span>}
              </span>
              {reply.views && reply.views > 0 && (
                <span className="flex items-center gap-1.5">
                  <BarChart2 className="h-4 w-4" />
                  <span>{formatNumber(reply.views)}</span>
                </span>
              )}
            </div>

            {isOwnReply && (
              <span className="text-xs text-blue-500">Your reply</span>
            )}
          </div>

          {/* Classification info */}
          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/30">
            <Badge variant="secondary" className={`${config.color} gap-1 text-xs`}>
              {config.icon}
              {config.label}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Pull {toPullScore(reply.intentScore)}
            </span>
            {reply.suggestedAction && (
              <Badge variant="outline" className="text-xs ml-auto">
                {reply.suggestedAction}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Nested replies - no border between parent and children */}
      {children}

      {/* Border only after all children */}
      {!hasChildren && <div className="border-b border-border/50" />}
    </div>
  );
}

// Build a map of replies for quick lookup and threading
interface ReplyWithChildren extends ClassifiedReply {
  children: ReplyWithChildren[];
}

function buildReplyTree(replies: ClassifiedReply[], originalTweetId?: string): ReplyWithChildren[] {
  // Create a map for quick lookup
  const replyMap = new Map<string, ReplyWithChildren>();
  replies.forEach(reply => {
    replyMap.set(reply.id, { ...reply, children: [] });
  });

  const topLevelReplies: ReplyWithChildren[] = [];

  // Build the tree
  replies.forEach(reply => {
    const replyWithChildren = replyMap.get(reply.id)!;
    const parentId = reply.parentTweetId;

    if (parentId && replyMap.has(parentId)) {
      // This is a nested reply - add it to its parent's children
      replyMap.get(parentId)!.children.push(replyWithChildren);
    } else {
      // This is a top-level reply (directly to the original tweet)
      topLevelReplies.push(replyWithChildren);
    }
  });

  return topLevelReplies;
}

// Get the author handle of a reply by its ID
function getReplyAuthor(replies: ClassifiedReply[], replyId: string): string | undefined {
  return replies.find(r => r.id === replyId)?.authorHandle;
}

// Recursive component for rendering threaded replies
function ThreadedReply({
  reply,
  replyingTo,
  allReplies,
}: {
  reply: ReplyWithChildren;
  replyingTo: string;
  allReplies: ClassifiedReply[];
}) {
  // For nested replies, find who they're replying to
  const parentAuthor = reply.parentTweetId
    ? getReplyAuthor(allReplies, reply.parentTweetId)
    : undefined;

  const hasChildren = reply.children.length > 0;

  return (
    <ReplyCard
      key={reply.id}
      reply={reply}
      replyingTo={parentAuthor || replyingTo}
      hasChildren={hasChildren}
    >
      {hasChildren && (
        <>
          {reply.children
            .sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''))
            .map((child) => (
              <ThreadedReply
                key={child.id}
                reply={child}
                replyingTo={reply.authorHandle}
                allReplies={allReplies}
              />
            ))}
        </>
      )}
    </ReplyCard>
  );
}

export function RepliesThread({ originalTweet, replies, onForceRefresh }: RepliesThreadProps) {
  const [filter, setFilter] = useState<ReplyClassification | 'all'>('all');

  const filteredReplies =
    filter === 'all'
      ? replies
      : replies.filter((r) => r.classification === filter);

  // Build tree structure for threading
  const replyTree = buildReplyTree(filteredReplies);

  // Sort top-level by intent score (highest first)
  const sortedTree = [...replyTree].sort(
    (a, b) => b.intentScore - a.intentScore
  );

  const counts = {
    all: replies.length,
    pain: replies.filter((r) => r.classification === 'pain').length,
    curiosity: replies.filter((r) => r.classification === 'curiosity').length,
    fluff: replies.filter((r) => r.classification === 'fluff').length,
    objection: replies.filter((r) => r.classification === 'objection').length,
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <XIcon className="h-5 w-5" />
            Posts & Replies ({replies.length} replies)
          </CardTitle>
          {originalTweet.url && (
            <a
              href={originalTweet.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:underline flex items-center gap-1"
            >
              View on X
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Original Post */}
        <div className="border-b bg-card">
          <div className="p-4">
            <div className="flex gap-3">
              <Avatar
                src={originalTweet.authorProfileImage}
                name={originalTweet.authorHandle}
                size="lg"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold">{originalTweet.authorName || originalTweet.authorHandle}</span>
                  <span className="text-muted-foreground text-sm">@{originalTweet.authorHandle}</span>
                  {originalTweet.createdAt && (
                    <>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-muted-foreground text-sm">
                        {formatRelativeTime(originalTweet.createdAt)}
                      </span>
                    </>
                  )}
                </div>

                <p className="mt-2 text-[15px] leading-relaxed whitespace-pre-wrap">
                  {originalTweet.text}
                </p>

                <div className="flex items-center gap-6 mt-4 pt-3 border-t text-muted-foreground text-sm">
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="h-4 w-4" />
                    <span>{formatNumber(originalTweet.replyCount)}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Repeat2 className="h-4 w-4" />
                    <span>{formatNumber(originalTweet.retweets)}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Heart className="h-4 w-4" />
                    <span>{formatNumber(originalTweet.likes)}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/30 overflow-x-auto">
          <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <Tabs
            value={filter}
            onValueChange={(v) => setFilter(v as ReplyClassification | 'all')}
          >
            <TabsList className="h-8 bg-background/50">
              <TabsTrigger value="all" className="text-xs px-3 h-7">
                All ({counts.all})
              </TabsTrigger>
              <TabsTrigger value="pain" className="text-xs px-3 h-7 data-[state=active]:text-red-500">
                <Flame className="h-3 w-3 mr-1" />
                Lived Pain ({counts.pain})
              </TabsTrigger>
              <TabsTrigger value="curiosity" className="text-xs px-3 h-7 data-[state=active]:text-blue-500">
                <Lightbulb className="h-3 w-3 mr-1" />
                Interest ({counts.curiosity})
              </TabsTrigger>
              <TabsTrigger value="objection" className="text-xs px-3 h-7 data-[state=active]:text-amber-500">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Resistance ({counts.objection})
              </TabsTrigger>
              <TabsTrigger value="fluff" className="text-xs px-3 h-7 data-[state=active]:text-gray-400">
                <Meh className="h-3 w-3 mr-1" />
                Noise ({counts.fluff})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Replies list */}
        <div>
          {sortedTree.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No replies match this filter
            </div>
          ) : (
            sortedTree.map((reply) => (
              <ThreadedReply
                key={reply.id}
                reply={reply}
                replyingTo={originalTweet.authorHandle}
                allReplies={replies}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {replies.length > 0 && (
          <div className="p-4 border-t bg-muted/20 text-sm text-muted-foreground text-center">
            Sorted by Pull Score · High-pull replies are your best opportunities
          </div>
        )}
      </CardContent>
    </Card>
  );
}
