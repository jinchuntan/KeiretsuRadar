'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Radar, ArrowRight, Shield, Network, Eye, Zap, Globe, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const features = [
  { icon: Network, title: 'Network Mapping', desc: 'Visualize supplier ecosystems as connected intelligence graphs' },
  { icon: Eye, title: 'Signal Detection', desc: 'Monitor financial, leadership, regulatory, and reputation signals' },
  { icon: Shield, title: 'Risk Scoring', desc: 'Transparent 0–100 scoring across 8 risk categories' },
  { icon: Zap, title: 'Real-Time Alerts', desc: 'Detect disruptions before they impact your operations' },
  { icon: Globe, title: 'Live Web Data', desc: 'Powered by Bright Data for live public web intelligence' },
  { icon: BarChart3, title: 'Executive Briefs', desc: 'AI-generated boardroom-ready risk reports' },
];

const exampleQueries = [
  'EV Battery Supply Chain',
  'Semiconductor Suppliers in Asia',
  'Cloud Infrastructure Vendors',
  'Automotive Parts Supply Chain',
];

export default function HomePage() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  function handleScan() {
    const q = query.trim() || 'EV Battery Supply Chain';
    router.push(`/dashboard?q=${encodeURIComponent(q)}`);
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <header className="border-b border-border/30">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Radar className="h-4.5 w-4.5 text-primary" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Keiretsu Radar</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
            Dashboard
          </Button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="relative overflow-hidden">
          {/* Grid background */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} />

          <div className="relative mx-auto max-w-4xl px-4 pt-24 pb-16 text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
              <Radar className="h-3.5 w-3.5" />
              Supplier Intelligence Platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-5">
              See supplier risk{' '}
              <span className="text-primary">before</span>{' '}
              it sees you
            </h1>

            <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-10">
              Map supplier ecosystems and monitor live web signals to detect financial, operational, and compliance risks across your supply chain.
            </p>

            {/* Search */}
            <div className="mx-auto flex max-w-xl gap-2 mb-4">
              <Input
                placeholder="Enter a supply chain, industry, or company..."
                className="h-12 bg-card border-border/50 text-base"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleScan()}
              />
              <Button size="lg" className="h-12 px-6 gap-2" onClick={handleScan}>
                Scan
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>Try:</span>
              {exampleQueries.map(q => (
                <button
                  key={q}
                  onClick={() => { setQuery(q); router.push(`/dashboard?q=${encodeURIComponent(q)}`); }}
                  className="rounded-md border border-border/50 bg-card/50 px-2.5 py-1 text-xs hover:border-primary/30 hover:text-primary transition-colors cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Keiretsu concept */}
        <section className="border-t border-border/30 bg-card/30">
          <div className="mx-auto max-w-4xl px-4 py-16 text-center">
            <p className="text-sm font-medium text-primary/70 mb-2 tracking-widest uppercase">系列</p>
            <h2 className="text-2xl font-bold mb-4">Inspired by Keiretsu</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              In Japanese business, <em>keiretsu</em> (系列) describes interconnected networks of companies that operate through deep supplier, partner, and affiliate relationships. Keiretsu Radar brings this connected intelligence model to modern supply chain risk management — because risks in your supplier network are never isolated.
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-border/30">
          <div className="mx-auto max-w-5xl px-4 py-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map(f => {
                const Icon = f.icon;
                return (
                  <div key={f.title} className="group rounded-xl border border-border/50 bg-card/50 p-5 hover:border-primary/20 transition-colors">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border/30 bg-card/30">
          <div className="mx-auto max-w-4xl px-4 py-16 text-center">
            <h2 className="text-2xl font-bold mb-3">Ready to scan your supply chain?</h2>
            <p className="text-muted-foreground mb-6">Run your first intelligence scan in under 60 seconds.</p>
            <Button size="lg" className="gap-2" onClick={() => router.push('/dashboard')}>
              Open Dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 py-6">
        <div className="mx-auto max-w-6xl px-4 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Radar className="h-3.5 w-3.5 text-primary/50" />
            Keiretsu Radar
          </div>
          <div>Powered by Bright Data & AI</div>
        </div>
      </footer>
    </div>
  );
}
