'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { MessageSquare, Heart, Repeat2, ExternalLink, Search, Info } from 'lucide-react';
import type { ScoredThread } from '@/lib/thread-finder/types';

interface ThreadCardProps {
  thread: ScoredThread;
  onAnalyze: (thread: ScoredThread) => void;
  isAnalyzing?: boolean;
}

function getRelevanceBadge(score: number): {
  label: string;
  className: string;
  description: string;
} {
  if (score >= 60) {
    return {
      label: 'High Match',
      className: 'bg-green-500 text-white',
      description: 'Strong topic + pain signals detected in tweet text',
    };
  } else if (score >= 40) {
    return {
      label: 'Good Match',
      className: 'bg-blue-500 text-white',
      description: 'Moderate topic relevance with some pain signals',
    };
  } else if (score >= 25) {
    return {
      label: 'Possible',
      className: 'bg-yellow-500/80 text-white',
      description: 'Some relevance - worth checking',
    };
  }
  return {
    label: 'Low Match',
    className: 'bg-gray-400 text-white',
    description: 'Weak match - may not be relevant',
  };
}

export function ThreadCard({ thread, onAnalyze, isAnalyzing }: ThreadCardProps) {
  const relevanceBadge = getRelevanceBadge(thread.score);

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardContent className="p-4 space-y-3">
        {/* Relevance Badge with Tooltip */}
        <div className="flex items-center justify-between">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className={`text-sm font-semibold cursor-help ${relevanceBadge.className}`}>
                  {relevanceBadge.label}
                  <Info className="h-3 w-3 ml-1 opacity-70" />
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[200px]">
                <p className="text-xs">{relevanceBadge.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Relevance score: {thread.score}/100
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <span className="text-xs text-muted-foreground">
            {thread.metrics.replies} replies
          </span>
        </div>

        {/* Why Surfaced - Key Evidence */}
        <p className="text-xs font-medium text-muted-foreground border-l-2 border-primary/50 pl-2">
          {thread.whySurfaced}
        </p>

        {/* Tweet Preview */}
        <p className="text-sm line-clamp-4">
          {thread.text}
        </p>

        {/* Author Info + Metrics */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={thread.author.profileImage} alt={thread.author.name} />
              <AvatarFallback className="text-xs">
                {thread.author.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium text-muted-foreground">
              @{thread.author.username}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {thread.metrics.likes}
            </span>
            <span className="flex items-center gap-1">
              <Repeat2 className="h-3 w-3" />
              {thread.metrics.retweets}
            </span>
          </div>
        </div>

        {/* Matched Keywords - show what was detected */}
        {thread.painSignal.matchedKeywords.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {thread.painSignal.matchedKeywords.slice(0, 5).map((keyword, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {keyword}
              </Badge>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            size="sm"
            onClick={() => onAnalyze(thread)}
            disabled={isAnalyzing}
            className="flex-1"
          >
            <Search className="h-4 w-4 mr-1" />
            {isAnalyzing ? 'Analyzing...' : 'Analyze Thread'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            asChild
          >
            <a href={thread.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
