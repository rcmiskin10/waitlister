'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, ExternalLink, Flame, HelpCircle, Meh, AlertTriangle } from 'lucide-react';

interface HistoryItem {
  id: string;
  platform: 'x' | 'reddit';
  url: string;
  title: string;
  author: string;
  replyCount: number;
  analyzedAt: string;
  summary: {
    painCount: number;
    curiosityCount: number;
    fluffCount: number;
    objectionCount: number;
  };
}

interface TriageHistoryProps {
  platform?: 'x' | 'reddit' | 'all';
  onSelect?: (url: string) => void; // Deprecated, kept for backwards compatibility
  limit?: number;
}

export function TriageHistory({ platform = 'all', onSelect, limit = 10 }: TriageHistoryProps) {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [platform]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/triage/history?platform=${platform}&limit=${limit}`);
      const data = await res.json();
      if (data.success) {
        setHistory(data.history);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getPlatformIcon = (p: 'x' | 'reddit') => {
    if (p === 'reddit') {
      return (
        <svg className="h-4 w-4 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249z"/>
        </svg>
      );
    }
    // X (formerly Twitter) logo
    return (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Analyses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Analyses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No analyses yet. Analyze a thread to see it here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Analyses
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border p-3 hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => router.push(`/dashboard/triage/report/${item.id}`)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {getPlatformIcon(item.platform)}
                  <span className="text-sm font-medium truncate">{item.title}</span>
                </div>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>

              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <span>{item.author}</span>
                <span>•</span>
                <span>{item.replyCount} replies</span>
                <span>•</span>
                <span>{formatDate(item.analyzedAt)}</span>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs bg-red-500/10 text-red-500 border-red-500/20" title="Lived Pain">
                  <Flame className="h-3 w-3 mr-1" />
                  {item.summary.painCount}
                </Badge>
                <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-500 border-blue-500/20" title="Interest">
                  <HelpCircle className="h-3 w-3 mr-1" />
                  {item.summary.curiosityCount}
                </Badge>
                <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-500 border-yellow-500/20" title="Resistance">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {item.summary.objectionCount}
                </Badge>
                <Badge variant="outline" className="text-xs bg-gray-500/10 text-gray-500 border-gray-500/20" title="Polite Noise">
                  <Meh className="h-3 w-3 mr-1" />
                  {item.summary.fluffCount}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {history.length >= limit && (
          <Button variant="ghost" className="w-full mt-3" size="sm">
            View all
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
