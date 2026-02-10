'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Search, BarChart3, ExternalLink, Clock } from 'lucide-react';
import Link from 'next/link';
import type { ScoredThread } from '@/lib/thread-finder/types';

interface Discovery {
  id: string;
  topic: string;
  audience: string | null;
  language: string;
  painKeywords: string[];
  threadsFound: number;
  results: ScoredThread[];
  createdAt: string;
}

interface Analysis {
  post: {
    id: string;
    tweetUrl: string;
    authorHandle: string;
    authorName: string | null;
    text: string;
    likes: number;
    retweets: number;
    replyCount: number;
  };
  analysis: {
    id: string;
    goal: string;
    summary: {
      totalReplies: number;
      painCount: number;
      curiosityCount: number;
    };
    createdAt: string;
  };
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function HistoryPage() {
  const [discoveries, setDiscoveries] = useState<Discovery[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const response = await fetch('/api/history?type=all&limit=50');
        const data = await response.json();

        if (data.success) {
          setDiscoveries(data.discoveries || []);
          setAnalyses(data.analyses || []);
        }
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchHistory();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">History</h1>
        <p className="text-muted-foreground">
          View your past thread discoveries and analyses.
        </p>
      </div>

      <Tabs defaultValue="discoveries">
        <TabsList>
          <TabsTrigger value="discoveries" className="gap-2">
            <Search className="h-4 w-4" />
            Discoveries ({discoveries.length})
          </TabsTrigger>
          <TabsTrigger value="analyses" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analyses ({analyses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discoveries" className="mt-6">
          {discoveries.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No discoveries yet</p>
                <p className="text-muted-foreground mb-4">
                  Start by searching for pain threads in your niche.
                </p>
                <Button asChild>
                  <Link href="/dashboard/discover">Discover Threads</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {discoveries.map((discovery) => (
                <Card key={discovery.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{discovery.topic}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(discovery.createdAt)}
                          {discovery.audience && (
                            <>
                              <span>•</span>
                              <Badge variant="outline" className="text-xs">
                                {discovery.audience}
                              </Badge>
                            </>
                          )}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">
                        {discovery.threadsFound} threads
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Pain Keywords */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {discovery.painKeywords.slice(0, 6).map((kw, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {kw}
                        </Badge>
                      ))}
                    </div>

                    {/* Top Threads Preview */}
                    {discovery.results.slice(0, 3).map((thread) => (
                      <div
                        key={thread.id}
                        className="flex items-center justify-between py-2 border-t text-sm"
                      >
                        <div className="flex-1 min-w-0">
                          <span className="font-medium">@{thread.author.username}</span>
                          <span className="text-muted-foreground ml-2 truncate">
                            {thread.text.substring(0, 60)}...
                          </span>
                        </div>
                        <a
                          href={thread.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-muted-foreground hover:text-foreground"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analyses" className="mt-6">
          {analyses.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No analyses yet</p>
                <p className="text-muted-foreground mb-4">
                  Analyze a thread to see detailed insights.
                </p>
                <Button asChild>
                  <Link href="/dashboard/discover">Discover Threads</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {analyses.map((item) => (
                <Card key={item.analysis.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">
                          @{item.post.authorHandle}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(item.analysis.createdAt)}
                        </CardDescription>
                      </div>
                      <a
                        href={item.post.tweetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </a>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {item.post.text}
                    </p>
                    <div className="flex gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Replies:</span>{' '}
                        <span className="font-medium">{item.analysis.summary.totalReplies}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Pain:</span>{' '}
                        <span className="font-medium text-red-500">{item.analysis.summary.painCount}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Interest:</span>{' '}
                        <span className="font-medium text-blue-500">{item.analysis.summary.curiosityCount}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
