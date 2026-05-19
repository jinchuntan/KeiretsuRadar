'use client';

import { WebSignal } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, AlertTriangle, TrendingUp, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

const sentimentConfig = {
  negative: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
  positive: { icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  neutral: { icon: Minus, color: 'text-zinc-400', bg: 'bg-zinc-500/10' },
};

const categoryLabels: Record<string, string> = {
  financial: 'Financial',
  operational: 'Operations',
  leadership: 'Leadership',
  hiring: 'Hiring',
  regulatory: 'Regulatory',
  reputation: 'Reputation',
  product_pricing: 'Product',
  cyber: 'Cyber',
};

export function SignalTimeline({ signals, limit = 10 }: { signals: WebSignal[]; limit?: number }) {
  const sorted = [...signals]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit);

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return '1d ago';
    return `${days}d ago`;
  }

  return (
    <div className="space-y-2">
      {sorted.map(signal => {
        const config = sentimentConfig[signal.sentiment];
        const Icon = config.icon;

        return (
          <div
            key={signal.id}
            className={cn(
              'rounded-lg border border-border/40 p-3 hover:border-border/60 transition-colors',
              signal.sentiment === 'negative' && 'border-l-2 border-l-red-500/40'
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn('mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md', config.bg)}>
                <Icon className={cn('h-3.5 w-3.5', config.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-medium leading-snug">{signal.title}</h4>
                  <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(signal.publishedAt)}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{signal.summary}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {categoryLabels[signal.riskCategory] || signal.riskCategory}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">
                    {signal.sourceType.replace('_', ' ')}
                  </Badge>
                  {signal.url && (
                    <a
                      href={signal.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto flex items-center gap-1 text-[10px] text-primary/70 hover:text-primary"
                    >
                      Source <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
