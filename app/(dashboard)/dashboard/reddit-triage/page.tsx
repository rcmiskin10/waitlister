'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { RedditInput, RedditThread } from '@/components/reddit';
import {
  AnalysisSummary,
  HighPullSignalsCard,
  ObjectionsCard,
  ReplyDraftsCard,
  TomorrowPostCard,
  TriageHistory,
} from '@/components/triage';
import type { RedditAnalysis, AnalysisGoal } from '@/types/triage';

export default function RedditTriagePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<RedditAnalysis | null>(null);

  const handleAnalyze = async (data: {
    redditUrl: string;
    goal: AnalysisGoal;
    voiceStyle?: string;
  }) => {
    setIsLoading(true);
    setAnalysis(null);

    try {
      const response = await fetch('/api/reddit-triage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success || !result.analysis) {
        throw new Error(result.error || 'Analysis failed');
      }

      setAnalysis(result.analysis);
      toast.success('Analysis complete!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to analyze Reddit thread';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Convert Reddit analysis to format compatible with existing components
  const getCompatibleReplies = () => {
    if (!analysis) return [];
    return analysis.classifiedComments.map((c) => ({
      id: c.id,
      text: c.text,
      authorHandle: c.author,
      likes: c.upvotes,
      classification: c.classification,
      intentScore: c.intentScore,
      keyQuote: c.keyQuote,
      suggestedAction: c.suggestedAction,
      reason: c.reason,
    }));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Reddit Triage</h1>
        <p className="text-muted-foreground">
          Analyze Reddit threads to find pain points and potential customers.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RedditInput onAnalyze={handleAnalyze} isLoading={isLoading} />
        </div>

        <div className="lg:row-span-2">
          <TriageHistory platform="reddit" limit={5} />
        </div>

        {analysis && (
          <>
            <div className="lg:col-span-2 lg:col-start-1">
              <AnalysisSummary summary={analysis.summary} />
            </div>

            <div className="lg:col-span-2 lg:col-start-1">
              <RedditThread
                post={analysis.post}
                comments={analysis.classifiedComments}
              />
            </div>

            <div className="lg:col-start-1">
              <HighPullSignalsCard
                replies={getCompatibleReplies() as any}
                dmCandidates={analysis.dmCandidates}
              />
            </div>

            <div>
              <ObjectionsCard
                replies={getCompatibleReplies() as any}
                topObjection={analysis.summary.topObjection}
              />
            </div>

            <div className="lg:col-start-1">
              <ReplyDraftsCard drafts={analysis.replyDrafts} />
            </div>

            <div className="lg:col-span-2 lg:col-start-1">
              <TomorrowPostCard
                painPoints={analysis.painPoints}
                keywords={analysis.keywords}
              />
            </div>

            {/* Content Ideas - Reddit specific */}
            {analysis.contentIdeas && analysis.contentIdeas.length > 0 && (
              <div className="lg:col-span-2 lg:col-start-1">
                <div className="rounded-lg border bg-card p-6">
                  <h3 className="font-semibold mb-4">Content Ideas</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {analysis.contentIdeas.map((idea, index) => (
                      <div key={index} className="rounded-lg border p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium uppercase text-muted-foreground bg-muted px-2 py-0.5 rounded">
                            {idea.format}
                          </span>
                        </div>
                        <p className="font-medium mb-2">{idea.idea}</p>
                        <p className="text-sm text-muted-foreground">{idea.why}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Follow-up Post Suggestion */}
            {analysis.followUpPost && (
              <div className="lg:col-span-2 lg:col-start-1">
                <div className="rounded-lg border bg-card p-6">
                  <h3 className="font-semibold mb-4">Suggested Follow-up Post</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs font-medium uppercase text-muted-foreground">
                        Best subreddit
                      </span>
                      <p className="font-medium">r/{analysis.followUpPost.bestSubreddit}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium uppercase text-muted-foreground">
                        Title
                      </span>
                      <p className="font-medium">{analysis.followUpPost.title}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium uppercase text-muted-foreground">
                        Body
                      </span>
                      <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-lg">
                        {analysis.followUpPost.body}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
