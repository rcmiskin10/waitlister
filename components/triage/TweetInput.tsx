'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, RefreshCw } from 'lucide-react';
import type { AnalysisGoal, Reply } from '@/types/triage';

// X icon component
function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

interface TweetInputProps {
  onAnalyze: (data: {
    tweetUrl?: string;
    tweetText: string;
    replies: Reply[];
    goal: AnalysisGoal;
    voiceStyle?: string;
    forceRefresh?: boolean;
  }) => void;
  isLoading: boolean;
}

export function TweetInput({ onAnalyze, isLoading }: TweetInputProps) {
  const [tweetUrl, setTweetUrl] = useState('');
  const [goal, setGoal] = useState<AnalysisGoal>('get_replies');
  const [voiceStyle, setVoiceStyle] = useState('');
  const [forceRefresh, setForceRefresh] = useState(false);

  const handleSubmit = () => {
    if (!tweetUrl.trim()) return;
    onAnalyze({
      tweetUrl: tweetUrl.trim(),
      tweetText: '',
      replies: [],
      goal,
      voiceStyle: voiceStyle || undefined,
      forceRefresh,
    });
  };

  const isSubmitDisabled = () => {
    if (isLoading) return true;
    return !tweetUrl.trim();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <XIcon className="h-5 w-5" />
          Reply Triage Copilot
        </CardTitle>
        <CardDescription>
          Analyze any X post to find your next customers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="tweetUrl">Post URL</Label>
          <Input
            id="tweetUrl"
            placeholder="https://x.com/user/status/123..."
            value={tweetUrl}
            onChange={(e) => setTweetUrl(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Paste any X post URL. Grok will fetch the post and replies automatically.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Goal</Label>
          <div className="flex gap-2">
            {[
              { value: 'get_replies', label: 'Get Replies' },
              { value: 'get_clicks', label: 'Get Clicks' },
              { value: 'pre_sell', label: 'Pre-sell' },
            ].map((option) => (
              <Button
                key={option.value}
                type="button"
                variant={goal === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setGoal(option.value as AnalysisGoal)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="voiceStyle">
            Your Voice Style{' '}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Input
            id="voiceStyle"
            placeholder="e.g., casual, direct, uses analogies, occasionally sarcastic"
            value={voiceStyle}
            onChange={(e) => setVoiceStyle(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="forceRefresh"
            checked={forceRefresh}
            onCheckedChange={(checked) => setForceRefresh(checked === true)}
          />
          <Label
            htmlFor="forceRefresh"
            className="text-sm font-normal flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Force refresh (refetch from X API)
          </Label>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isSubmitDisabled()}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Fetching & Analyzing...
            </>
          ) : (
            'Fetch & Analyze'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
