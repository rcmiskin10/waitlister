'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { ThreadFinder } from '@/components/thread-finder';
import {
  AnalysisSummary,
  HighPullSignalsCard,
  ObjectionsCard,
  ReplyDraftsCard,
  DMTemplatesCard,
  TomorrowPostCard,
  RepliesThread,
} from '@/components/triage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, X, ExternalLink, MessageCircle, Repeat2, Heart } from 'lucide-react';
import type { ScoredThread } from '@/lib/thread-finder/types';
import type { TriageAnalysis, TriageResponse } from '@/types/triage';

export default function DiscoverPage() {
  const [selectedThread, setSelectedThread] = useState<ScoredThread | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<TriageAnalysis | null>(null);
  const [analyzingThreadId, setAnalyzingThreadId] = useState<string | undefined>();

  const handleThreadSelect = async (thread: ScoredThread, url: string) => {
    setSelectedThread(thread);
    setAnalyzingThreadId(thread.id);
    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const response = await fetch('/api/triage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tweetUrl: url,
          goal: 'get_replies',
        }),
      });

      const result: TriageResponse = await response.json();

      if (!result.success || !result.analysis) {
        throw new Error(result.error || 'Analysis failed');
      }

      setAnalysis(result.analysis);
      toast.success('Thread analysis complete!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to analyze thread';
      toast.error(message);
    } finally {
      setIsAnalyzing(false);
      setAnalyzingThreadId(undefined);
    }
  };

  const handleCloseAnalysis = () => {
    setSelectedThread(null);
    setAnalysis(null);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Discover Threads</h1>
        <p className="text-muted-foreground">
          Find X threads with pain signals and analyze them for opportunities.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Panel: Thread Finder */}
        <div className={selectedThread ? '' : 'lg:col-span-2'}>
          <ThreadFinder
            onThreadSelect={handleThreadSelect}
            analyzingThreadId={analyzingThreadId}
          />
        </div>

        {/* Right Panel: Analysis (shows when thread selected) */}
        {selectedThread && (
          <div className="space-y-6">
            {/* X Post Preview */}
            <Card className="overflow-hidden">
              <CardHeader className="pb-2 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    <span className="font-semibold text-sm">Post</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" asChild className="h-8 w-8 p-0">
                      <a href={selectedThread.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleCloseAnalysis} className="h-8 w-8 p-0">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {/* Author Info */}
                <div className="flex items-start gap-3">
                  {selectedThread.author.profileImage ? (
                    <img
                      src={selectedThread.author.profileImage}
                      alt={selectedThread.author.name || selectedThread.author.username}
                      className="h-10 w-10 rounded-full shrink-0"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {selectedThread.author.name?.charAt(0).toUpperCase() || selectedThread.author.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-sm truncate">{selectedThread.author.name || selectedThread.author.username}</span>
                    </div>
                    <span className="text-muted-foreground text-sm">@{selectedThread.author.username}</span>
                  </div>
                </div>

                {/* Tweet Text */}
                <div className="mt-3">
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                    {selectedThread.text}
                  </p>
                </div>

                {/* Engagement Stats */}
                <div className="flex items-center gap-6 mt-4 pt-3 border-t text-muted-foreground">
                  <div className="flex items-center gap-1.5 text-sm">
                    <MessageCircle className="h-4 w-4" />
                    <span>{selectedThread.metrics.replies.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Repeat2 className="h-4 w-4" />
                    <span>{selectedThread.metrics.retweets.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Heart className="h-4 w-4" />
                    <span>{selectedThread.metrics.likes.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loading State */}
            {isAnalyzing && (
              <Card>
                <CardContent className="py-12">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <div className="text-center">
                      <p className="font-medium">Analyzing thread...</p>
                      <p className="text-sm text-muted-foreground">
                        Classifying replies and extracting insights
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Analysis Results */}
            {analysis && !isAnalyzing && (
              <div className="space-y-4">
                <AnalysisSummary summary={analysis.summary} />

                <RepliesThread
                  originalTweet={{
                    text: analysis.tweetText,
                    authorHandle: analysis.tweetAuthor || selectedThread.author.username,
                    authorName: analysis.tweetMetadata?.authorName || selectedThread.author.name,
                    authorProfileImage:
                      analysis.tweetMetadata?.authorProfileImage ||
                      selectedThread.author.profileImage,
                    likes: analysis.tweetMetadata?.likes || selectedThread.metrics.likes,
                    retweets: analysis.tweetMetadata?.retweets || selectedThread.metrics.retweets,
                    replyCount:
                      analysis.tweetMetadata?.replyCount ||
                      analysis.summary.totalReplies ||
                      selectedThread.metrics.replies,
                    url: analysis.tweetUrl || selectedThread.url,
                  }}
                  replies={analysis.classifiedReplies}
                />

                <HighPullSignalsCard
                  replies={analysis.classifiedReplies}
                  dmCandidates={analysis.dmCandidates}
                />

                <ObjectionsCard
                  replies={analysis.classifiedReplies}
                  topObjection={analysis.summary.topObjection}
                  objectionPost={analysis.objectionPost}
                />

                <ReplyDraftsCard drafts={analysis.replyDrafts} />

                <DMTemplatesCard
                  templates={analysis.dmTemplates}
                  candidates={analysis.dmCandidates}
                />

                <TomorrowPostCard
                  post={analysis.tomorrowPost}
                  painPoints={analysis.painPoints}
                  keywords={analysis.keywords}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
