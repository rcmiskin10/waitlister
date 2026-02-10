'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Flame, HelpCircle, Sparkles, AlertTriangle } from 'lucide-react';
import type { AnalysisSummary as AnalysisSummaryType } from '@/types/triage';

interface AnalysisSummaryProps {
  summary: AnalysisSummaryType;
}

export function AnalysisSummary({ summary }: AnalysisSummaryProps) {
  const stats = [
    {
      label: 'Lived Pain',
      value: summary.painCount,
      icon: Flame,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      label: 'Interest',
      value: summary.curiosityCount,
      icon: HelpCircle,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Polite Noise',
      value: summary.fluffCount,
      icon: Sparkles,
      color: 'text-gray-500',
      bgColor: 'bg-gray-500/10',
    },
    {
      label: 'Resistance',
      value: summary.objectionCount,
      icon: AlertTriangle,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
  ];

  const highIntentCount = summary.painCount + summary.curiosityCount;
  const highIntentPercentage = Math.round((highIntentCount / summary.totalReplies) * 100);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Analysis Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-2">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`${stat.bgColor} rounded-lg p-3 text-center`}
            >
              <stat.icon className={`h-4 w-4 ${stat.color} mx-auto mb-1`} />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {summary.totalReplies} total replies analyzed
          </span>
          <Badge variant={highIntentPercentage > 30 ? 'default' : 'secondary'}>
            {highIntentPercentage}% high-pull
          </Badge>
        </div>

        {summary.topPainPoint && (
          <div className="bg-muted rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Top Lived Pain</p>
            <p className="text-sm font-medium">{summary.topPainPoint}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
