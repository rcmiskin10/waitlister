'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  TweetInput,
  AnalysisSummary,
  HighPullSignalsCard,
  ObjectionsCard,
  ReplyDraftsCard,
  DMTemplatesCard,
  TomorrowPostCard,
  RepliesThread,
  TriageHistory,
} from '@/components/triage';
import type { TriageAnalysis, TriageRequest, TriageResponse } from '@/types/triage';

export default function TriagePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<TriageAnalysis | null>(null);

  const handleAnalyze = async (data: Omit<TriageRequest, 'tweetUrl'> & { tweetUrl?: string; forceRefresh?: boolean }) => {
    setIsLoading(true);
    setAnalysis(null);

    try {
      const response = await fetch('/api/triage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result: TriageResponse = await response.json();

      if (!result.success || !result.analysis) {
        throw new Error(result.error || 'Analysis failed');
      }

      setAnalysis(result.analysis);
      toast.success('Analysis complete!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to analyze replies';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Reply Triage</h1>
        <p className="text-muted-foreground">
          Turn X replies into actionable insights and find your next customers.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TweetInput onAnalyze={handleAnalyze} isLoading={isLoading} />
        </div>

        <div className="lg:row-span-2">
          <TriageHistory platform="x" limit={5} />
        </div>

        {analysis && (
          <>
            <div className="lg:col-span-2 lg:col-start-1">
              <AnalysisSummary summary={analysis.summary} />
            </div>

            <div className="lg:col-span-2 lg:col-start-1">
              <RepliesThread
                originalTweet={{
                  text: analysis.tweetText,
                  authorHandle: analysis.tweetAuthor || 'unknown',
                  authorName: analysis.tweetMetadata?.authorName,
                  authorProfileImage: analysis.tweetMetadata?.authorProfileImage,
                  likes: analysis.tweetMetadata?.likes,
                  retweets: analysis.tweetMetadata?.retweets,
                  replyCount: analysis.tweetMetadata?.replyCount || analysis.summary.totalReplies,
                  url: analysis.tweetUrl,
                }}
                replies={analysis.classifiedReplies}
              />
            </div>

            <div className="lg:col-start-1">
              <HighPullSignalsCard
                replies={analysis.classifiedReplies}
                dmCandidates={analysis.dmCandidates}
              />
            </div>

            <div>
              <ObjectionsCard
                replies={analysis.classifiedReplies}
                topObjection={analysis.summary.topObjection}
                objectionPost={analysis.objectionPost}
              />
            </div>

            <div className="lg:col-start-1">
              <ReplyDraftsCard drafts={analysis.replyDrafts} />
            </div>

            <div>
              <DMTemplatesCard
                templates={analysis.dmTemplates}
                candidates={analysis.dmCandidates}
              />
            </div>

            <div className="lg:col-span-2 lg:col-start-1">
              <TomorrowPostCard
                post={analysis.tomorrowPost}
                painPoints={analysis.painPoints}
                keywords={analysis.keywords}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
