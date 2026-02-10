'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, ExternalLink, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AnalysisSummary,
  HighPullSignalsCard,
  ObjectionsCard,
  ReplyDraftsCard,
  DMTemplatesCard,
  TomorrowPostCard,
  RepliesThread,
} from '@/components/triage';
import { RedditThread } from '@/components/reddit';
import type { TriageAnalysis, RedditAnalysis } from '@/types/triage';

export default function TriageReportPage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [platform, setPlatform] = useState<'x' | 'reddit' | null>(null);
  const [xAnalysis, setXAnalysis] = useState<TriageAnalysis | null>(null);
  const [redditAnalysis, setRedditAnalysis] = useState<RedditAnalysis | null>(null);

  useEffect(() => {
    fetchAnalysis();
  }, [params.id]);

  const fetchAnalysis = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/triage/${params.id}`);
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to load analysis');
      }

      setPlatform(data.platform);
      if (data.platform === 'x') {
        setXAnalysis(data.analysis);
      } else {
        setRedditAnalysis(data.analysis);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load analysis';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Convert Reddit analysis to format compatible with existing components
  const getCompatibleReplies = () => {
    if (!redditAnalysis) return [];
    return redditAnalysis.classifiedComments.map((c) => ({
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

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-48 lg:col-span-2" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!platform || (!xAnalysis && !redditAnalysis)) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Analysis Not Found</h1>
        </div>
        <p className="text-muted-foreground">
          The analysis you're looking for doesn't exist or has been deleted.
        </p>
        <Button asChild>
          <Link href="/dashboard/triage">Go to X Triage</Link>
        </Button>
      </div>
    );
  }

  // X Report
  if (platform === 'x' && xAnalysis) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/triage">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">X Analysis Report</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{formatDate(xAnalysis.createdAt)}</span>
                <span>•</span>
                <a
                  href={xAnalysis.tweetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  View original <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={fetchAnalysis}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <AnalysisSummary summary={xAnalysis.summary} />
          </div>

          <div className="lg:col-span-2">
            <RepliesThread
              originalTweet={{
                text: xAnalysis.tweetText,
                authorHandle: xAnalysis.tweetAuthor || 'unknown',
                authorName: xAnalysis.tweetMetadata?.authorName,
                authorProfileImage: xAnalysis.tweetMetadata?.authorProfileImage,
                likes: xAnalysis.tweetMetadata?.likes,
                retweets: xAnalysis.tweetMetadata?.retweets,
                replyCount: xAnalysis.tweetMetadata?.replyCount || xAnalysis.summary.totalReplies,
                url: xAnalysis.tweetUrl,
              }}
              replies={xAnalysis.classifiedReplies}
            />
          </div>

          <HighPullSignalsCard
            replies={xAnalysis.classifiedReplies}
            dmCandidates={xAnalysis.dmCandidates}
          />

          <ObjectionsCard
            replies={xAnalysis.classifiedReplies}
            topObjection={xAnalysis.summary.topObjection}
            objectionPost={xAnalysis.objectionPost}
          />

          <ReplyDraftsCard drafts={xAnalysis.replyDrafts} />

          <DMTemplatesCard
            templates={xAnalysis.dmTemplates}
            candidates={xAnalysis.dmCandidates}
          />

          <div className="lg:col-span-2">
            <TomorrowPostCard
              post={xAnalysis.tomorrowPost}
              painPoints={xAnalysis.painPoints}
              keywords={xAnalysis.keywords}
            />
          </div>
        </div>
      </div>
    );
  }

  // Reddit Report
  if (platform === 'reddit' && redditAnalysis) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/reddit-triage">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Reddit Analysis Report</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{formatDate(redditAnalysis.createdAt)}</span>
                <span>•</span>
                <a
                  href={redditAnalysis.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  View original <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={fetchAnalysis}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <AnalysisSummary summary={redditAnalysis.summary} />
          </div>

          <div className="lg:col-span-2">
            <RedditThread
              post={redditAnalysis.post}
              comments={redditAnalysis.classifiedComments}
            />
          </div>

          <HighPullSignalsCard
            replies={getCompatibleReplies() as any}
            dmCandidates={redditAnalysis.dmCandidates}
          />

          <ObjectionsCard
            replies={getCompatibleReplies() as any}
            topObjection={redditAnalysis.summary.topObjection}
          />

          <ReplyDraftsCard drafts={redditAnalysis.replyDrafts} />

          <div className="lg:col-span-2">
            <TomorrowPostCard
              painPoints={redditAnalysis.painPoints}
              keywords={redditAnalysis.keywords}
            />
          </div>

          {/* Content Ideas - Reddit specific */}
          {redditAnalysis.contentIdeas && redditAnalysis.contentIdeas.length > 0 && (
            <div className="lg:col-span-2">
              <div className="rounded-lg border bg-card p-6">
                <h3 className="font-semibold mb-4">Content Ideas</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {redditAnalysis.contentIdeas.map((idea, index) => (
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
          {redditAnalysis.followUpPost && (
            <div className="lg:col-span-2">
              <div className="rounded-lg border bg-card p-6">
                <h3 className="font-semibold mb-4">Suggested Follow-up Post</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-medium uppercase text-muted-foreground">
                      Best subreddit
                    </span>
                    <p className="font-medium">r/{redditAnalysis.followUpPost.bestSubreddit}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium uppercase text-muted-foreground">
                      Title
                    </span>
                    <p className="font-medium">{redditAnalysis.followUpPost.title}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium uppercase text-muted-foreground">
                      Body
                    </span>
                    <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-lg">
                      {redditAnalysis.followUpPost.body}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
