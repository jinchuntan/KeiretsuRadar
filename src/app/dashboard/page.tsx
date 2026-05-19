'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Nav } from '@/components/nav';
import { ModeBadge } from '@/components/mode-badge';
import { ScanInput } from '@/components/dashboard/scan-input';
import { NetworkGraph } from '@/components/dashboard/network-graph';
import { SupplierTable } from '@/components/dashboard/supplier-table';
import { SignalTimeline } from '@/components/dashboard/signal-timeline';
import { RiskDistributionChart, SignalCategoryChart } from '@/components/dashboard/risk-charts';
import { RiskBadge, RiskScoreDisplay } from '@/components/risk-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScanResult, ScanProgress } from '@/lib/types';
import {
  AlertTriangle, Shield, Users, TrendingUp, FileText, ArrowRight,
  Activity, Network,
} from 'lucide-react';
import Link from 'next/link';
import { OnboardingTour } from '@/components/onboarding-tour';

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';

  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<ScanProgress>({ stage: '', progress: 0, message: '' });
  const [showTour, setShowTour] = useState(false);

  const runScan = useCallback(async (query: string) => {
    setIsLoading(true);
    setScanResult(null);

    const stages = [
      { stage: 'collecting', progress: 20, message: 'Collecting live web signals...' },
      { stage: 'structuring', progress: 45, message: 'Structuring supplier evidence...' },
      { stage: 'scoring', progress: 70, message: 'Scoring operational and compliance risk...' },
      { stage: 'brief', progress: 90, message: 'Generating boardroom brief...' },
    ];

    for (const s of stages) {
      setProgress(s);
      await new Promise(r => setTimeout(r, 600));
    }

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (res.ok) {
        setProgress({ stage: 'complete', progress: 100, message: 'Scan complete' });
        setScanResult(data);
      }
    } catch {
      setProgress({ stage: 'error', progress: 0, message: 'Scan failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialQuery) {
      runScan(initialQuery);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const highRisk = scanResult?.suppliers.filter(s => s.riskScore.level === 'high') || [];
  const negativeSignals = scanResult?.signals.filter(s => s.sentiment === 'negative') || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Nav onHelpClick={() => setShowTour(true)} />
      {scanResult && !isLoading && <OnboardingTour active={showTour} />}

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
          {/* Search + Mode */}
          <div id="tour-search" className="flex items-center gap-3">
            <div className="flex-1">
              <ScanInput onScan={runScan} isLoading={isLoading} defaultQuery={initialQuery} />
            </div>
            {scanResult && <ModeBadge mode={scanResult.mode} />}
          </div>

          {/* Loading State */}
          {isLoading && (
            <Card className="bg-card/50 border-border/50">
              <CardContent className="py-8">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative h-12 w-12">
                    <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                    <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">{progress.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">Stage: {progress.stage}</p>
                  </div>
                  <Progress value={progress.progress} className="w-64 h-1.5" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!isLoading && !scanResult && (
            <Card className="bg-card/50 border-border/50">
              <CardContent className="py-16 text-center">
                <Network className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Start a Supplier Intelligence Scan</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                  Enter a supply chain, industry, or company name to map the supplier network and detect risks.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {['EV Battery Supply Chain', 'Semiconductor Suppliers in Asia', 'Cloud Infrastructure Vendors'].map(q => (
                    <button
                      key={q}
                      onClick={() => runScan(q)}
                      className="rounded-md border border-border/50 bg-card px-3 py-1.5 text-xs hover:border-primary/30 hover:text-primary transition-colors cursor-pointer"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {scanResult && !isLoading && (
            <>
              {/* Stats Row */}
              <div id="tour-stats" className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card className="bg-card/50 border-border/50">
                  <CardContent className="pt-4 pb-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{scanResult.suppliers.length}</p>
                        <p className="text-xs text-muted-foreground">Suppliers</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 border-border/50">
                  <CardContent className="pt-4 pb-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
                        <Activity className="h-4 w-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{scanResult.signals.length}</p>
                        <p className="text-xs text-muted-foreground">Web Signals</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 border-border/50">
                  <CardContent className="pt-4 pb-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10">
                        <AlertTriangle className="h-4 w-4 text-red-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{highRisk.length}</p>
                        <p className="text-xs text-muted-foreground">High Risk</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 border-border/50">
                  <CardContent className="pt-4 pb-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10">
                        <Shield className="h-4 w-4 text-amber-400" />
                      </div>
                      <div>
                        <RiskScoreDisplay
                          score={Math.round(
                            scanResult.suppliers.reduce((sum, s) => sum + s.riskScore.overall, 0) / scanResult.suppliers.length
                          )}
                          size="sm"
                        />
                        <p className="text-xs text-muted-foreground">Avg Risk</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Alerts */}
              {highRisk.length > 0 && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <span className="text-sm font-medium text-red-400">Emerging Risk Alerts</span>
                  </div>
                  <div className="space-y-1.5">
                    {highRisk.map(s => (
                      <div key={s.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <RiskBadge level={s.riskScore.level} />
                          <span>{s.name}</span>
                          <span className="text-xs text-muted-foreground">— {s.riskScore.explanation}</span>
                        </div>
                        <Link href={`/supplier/${s.id}`} className="text-xs text-primary hover:underline flex items-center gap-1">
                          View <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Network Graph */}
              <div id="tour-network">
                <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <Network className="h-4 w-4" /> Keiretsu Network Map
                </h2>
                <NetworkGraph
                  network={scanResult.network}
                  onNodeClick={(id) => router.push(`/supplier/${id}`)}
                />
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RiskDistributionChart suppliers={scanResult.suppliers} />
                <SignalCategoryChart signals={scanResult.signals} />
              </div>

              {/* Supplier Table */}
              <div id="tour-table">
                <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4" /> Supplier Risk Heatmap
                </h2>
                <SupplierTable suppliers={scanResult.suppliers} />
              </div>

              {/* Two Column: Timeline + Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div id="tour-evidence">
                  <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <Activity className="h-4 w-4" /> Evidence Trail
                  </h2>
                  <SignalTimeline signals={negativeSignals.length > 0 ? negativeSignals : scanResult.signals} limit={8} />
                </div>

                <div id="tour-actions">
                  <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" /> Recommended Actions
                  </h2>
                  <Card className="bg-card/50 border-border/50">
                    <CardContent className="pt-4 space-y-3">
                      {scanResult.brief.recommendedActions.map((action, i) => (
                        <div key={i} className="flex gap-3 text-sm">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs text-primary font-medium">
                            {i + 1}
                          </span>
                          <span className="text-muted-foreground">{action}</span>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-border/30">
                        <Link
                          href={`/brief?q=${encodeURIComponent(scanResult.query)}`}
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <FileText className="h-4 w-4" />
                          View Full Boardroom Brief
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}
