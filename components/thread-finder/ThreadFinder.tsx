'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Sparkles, AlertCircle } from 'lucide-react';
import { ThreadCard } from './ThreadCard';
import type { ScoredThread, AudiencePreset } from '@/lib/thread-finder/types';

interface ThreadFinderProps {
  onThreadSelect: (thread: ScoredThread, url: string) => void;
  analyzingThreadId?: string;
}

const AUDIENCE_OPTIONS: { value: AudiencePreset | 'none'; label: string; description: string }[] = [
  { value: 'none', label: 'All of X', description: 'Search broadly across X' },
  { value: 'indie-hackers', label: 'Indie Hackers', description: '@levelsio, #indiehackers, bootstrapped founders' },
  { value: 'build-in-public', label: 'Build in Public', description: '#buildinpublic community' },
  { value: 'solo-founders', label: 'Solo Founders', description: 'Solopreneurs & one-person businesses' },
  { value: 'saas-founders', label: 'SaaS Founders', description: 'B2B SaaS, MRR, churn discussions' },
  { value: 'no-code', label: 'No-Code', description: 'Bubble, Webflow, no-code builders' },
];

interface FinderResponse {
  success: boolean;
  threads: ScoredThread[];
  queryUsed: string[];
  topicKeywords: string[];
  painKeywords: string[];
  stats: {
    candidatesFetched: number;
    stage1Scanned: number;
    stage2Scanned: number;
    totalApiReads: number;
  };
  rateLimitStatus: {
    remaining: number;
    limit: number;
    resetsAt?: string;
    monthlyRemaining: number;
  };
  error?: string;
}

const EXAMPLE_TOPICS = [
  'indie hackers struggling with pricing',
  'SaaS founders frustrated with churn',
  'developers complaining about documentation',
  'startup founders struggling to find customers',
  'people frustrated with no-code tools',
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ja', label: 'Japanese' },
];

export function ThreadFinder({ onThreadSelect, analyzingThreadId }: ThreadFinderProps) {
  const [topic, setTopic] = useState('');
  const [language, setLanguage] = useState('en');
  const [audience, setAudience] = useState<AudiencePreset | 'none'>('indie-hackers'); // Default to indie hackers
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<FinderResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      toast.error('Please enter a topic to search for');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/thread-finder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic.trim(),
          language,
          minReplies: 2,
          audience: audience === 'none' ? undefined : audience,
        }),
      });

      const data: FinderResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to find threads');
      }

      setResult(data);

      if (data.threads.length === 0) {
        toast.info('No threads found with pain signals. Try a different topic.');
      } else {
        toast.success(`Found ${data.threads.length} threads with pain signals`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to find threads';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = (thread: ScoredThread) => {
    onThreadSelect(thread, thread.url);
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Discover Pain Threads
          </CardTitle>
          <CardDescription>
            Find X threads where people express frustration, problems, or unmet needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic or Niche</Label>
              <Input
                id="topic"
                placeholder="e.g., indie hackers struggling with pricing"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isLoading}
              />
              <div className="flex flex-wrap gap-1 mt-2">
                {EXAMPLE_TOPICS.map((example, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="cursor-pointer hover:bg-muted text-xs"
                    onClick={() => setTopic(example)}
                  >
                    {example}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="audience">Target Audience</Label>
                <Select value={audience} onValueChange={(v) => setAudience(v as typeof audience)} disabled={isLoading}>
                  <SelectTrigger id="audience">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AUDIENCE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex flex-col">
                          <span>{opt.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {AUDIENCE_OPTIONS.find(o => o.value === audience)?.description}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={language} onValueChange={setLanguage} disabled={isLoading}>
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-7">
                <Button type="submit" disabled={isLoading || !topic.trim()} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Find Threads
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div className="text-center">
                <p className="font-medium">Searching for pain threads...</p>
                <p className="text-sm text-muted-foreground">
                  This may take a minute. We're scanning hundreds of threads.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && !isLoading && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {result.threads.length} threads found
              </span>
              <Badge variant="outline" className="text-xs">
                {result.stats.candidatesFetched} candidates scanned
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              {result.rateLimitStatus.monthlyRemaining.toLocaleString()} reads remaining
            </div>
          </div>

          {/* Keywords Used */}
          <div className="space-y-2">
            {result.topicKeywords && result.topicKeywords.length > 0 && (
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-xs text-muted-foreground">Topic relevance:</span>
                {result.topicKeywords.slice(0, 6).map((keyword, i) => (
                  <Badge key={i} variant="default" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            )}
            {result.painKeywords.length > 0 && (
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-xs text-muted-foreground">Pain keywords:</span>
                {result.painKeywords.slice(0, 8).map((keyword, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Thread Cards */}
          {result.threads.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {result.threads.map((thread) => (
                <ThreadCard
                  key={thread.id}
                  thread={thread}
                  onAnalyze={handleAnalyze}
                  isAnalyzing={analyzingThreadId === thread.id}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="flex flex-col items-center justify-center gap-2 text-center">
                  <AlertCircle className="h-8 w-8 text-muted-foreground" />
                  <p className="font-medium">No pain threads found</p>
                  <p className="text-sm text-muted-foreground">
                    Try a different topic or broaden your search terms.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
