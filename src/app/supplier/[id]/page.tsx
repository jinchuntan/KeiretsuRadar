'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Nav } from '@/components/nav';
import { RiskBadge, RiskScoreDisplay } from '@/components/risk-badge';
import { SignalTimeline } from '@/components/dashboard/signal-timeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Supplier, WebSignal } from '@/lib/types';
import {
  ArrowLeft, Globe, MapPin, Building2, ExternalLink,
  TrendingUp, TrendingDown, Minus, Shield,
} from 'lucide-react';

const categoryIcons: Record<string, string> = {
  financial: '💰',
  operational: '⚙️',
  leadership: '👔',
  hiring: '📋',
  regulatory: '⚖️',
  reputation: '📢',
  product_pricing: '📦',
  cyber: '🔒',
};

export default function SupplierDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [signals, setSignals] = useState<WebSignal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/suppliers/${id}`)
      .then(r => r.json())
      .then(data => {
        setSupplier(data.supplier);
        setSignals(data.signals);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Nav />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="min-h-screen flex flex-col">
        <Nav />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-2">Supplier not found</h2>
            <Link href="/dashboard" className="text-sm text-primary hover:underline">Back to Dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  const trendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="h-3.5 w-3.5 text-red-400" />;
    if (trend === 'down') return <TrendingDown className="h-3.5 w-3.5 text-emerald-400" />;
    return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
  };

  const riskColor = (score: number) => {
    if (score >= 70) return 'bg-red-500';
    if (score >= 40) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
          {/* Back link */}
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>

          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{supplier.name}</h1>
                <RiskBadge level={supplier.riskScore.level} />
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> {supplier.industry}</span>
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {supplier.country}</span>
                <span className="flex items-center gap-1"><Globe className="h-3.5 w-3.5" /> {supplier.relationshipType}</span>
                <Badge variant="outline" className="text-xs">{supplier.importance} importance</Badge>
              </div>
              <p className="mt-3 text-sm text-muted-foreground max-w-2xl">{supplier.description}</p>
            </div>
            <div className="text-right">
              <RiskScoreDisplay score={supplier.riskScore.overall} size="lg" />
              <p className="text-xs text-muted-foreground mt-1">
                Updated {new Date(supplier.lastUpdated).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Risk Categories Grid */}
          <div>
            <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4" /> Risk Category Breakdown
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {supplier.riskScore.categories.map(cat => (
                <Card key={cat.category} className="bg-card/50 border-border/50">
                  <CardContent className="pt-4 pb-3 px-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg">{categoryIcons[cat.category]}</span>
                      <div className="flex items-center gap-1">
                        {trendIcon(cat.trend)}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{cat.label}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold tabular-nums">{cat.score}</span>
                      <Progress value={cat.score} className={`flex-1 h-1.5 [&>div]:${riskColor(cat.score)}`} />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{cat.signals} signals</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Explanation */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{supplier.riskScore.explanation}</p>
            </CardContent>
          </Card>

          {/* Signals */}
          <div>
            <h2 className="text-sm font-medium text-muted-foreground mb-3">
              Web Signals ({signals.length})
            </h2>
            {signals.length > 0 ? (
              <SignalTimeline signals={signals} limit={20} />
            ) : (
              <Card className="bg-card/50 border-border/50">
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  No signals found for this supplier.
                </CardContent>
              </Card>
            )}
          </div>

          {/* Source Links */}
          {signals.length > 0 && (
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Source Evidence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5">
                  {signals.slice(0, 8).map(s => (
                    <a
                      key={s.id}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-muted/30 transition-colors"
                    >
                      <span className="text-muted-foreground truncate mr-4">{s.title}</span>
                      <ExternalLink className="h-3 w-3 shrink-0 text-primary/50" />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
