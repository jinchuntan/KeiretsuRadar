'use client';

import { Nav } from '@/components/nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Key, Globe, Bot, Shield, ExternalLink } from 'lucide-react';

const envVars = [
  { name: 'BRIGHT_DATA_API_KEY', desc: 'Bright Data API authentication token', required: true, category: 'Bright Data' },
  { name: 'BRIGHT_DATA_CUSTOMER_ID', desc: 'Bright Data account/customer ID', required: true, category: 'Bright Data' },
  { name: 'BRIGHT_DATA_SERP_ZONE', desc: 'SERP API zone name (default: "serp")', required: false, category: 'Bright Data' },
  { name: 'BRIGHT_DATA_WEB_UNLOCKER_ZONE', desc: 'Web Unlocker zone name (default: "unlocker")', required: false, category: 'Bright Data' },
  { name: 'OPENAI_API_KEY', desc: 'OpenAI API key for AI-generated briefs', required: false, category: 'AI' },
  { name: 'ANTHROPIC_API_KEY', desc: 'Anthropic API key (alternative to OpenAI)', required: false, category: 'AI' },
];

export default function SettingsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
          <div>
            <h1 className="text-xl font-bold mb-1">Settings & Configuration</h1>
            <p className="text-sm text-muted-foreground">Configure API keys and data sources for live intelligence.</p>
          </div>

          {/* Data Mode */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Globe className="h-4 w-4" /> Data Mode
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs">Demo Mode</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Running with seeded demo data. Add Bright Data credentials to <code className="px-1 py-0.5 rounded bg-muted text-xs">.env.local</code> to activate live web intelligence.
                </p>
              </div>
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 opacity-50">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs">Live Mode</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Connects to Bright Data SERP API and Web Unlocker for real-time public web data collection.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Environment Variables */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Key className="h-4 w-4" /> Environment Variables
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4">
                Create a <code className="px-1 py-0.5 rounded bg-muted">.env.local</code> file in the project root with these variables. Never commit secrets to version control.
              </p>
              <div className="space-y-2">
                {envVars.map(v => (
                  <div key={v.name} className="flex items-start gap-3 rounded-lg border border-border/30 p-3">
                    <code className="shrink-0 text-xs font-mono text-primary bg-primary/5 px-1.5 py-0.5 rounded">{v.name}</code>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">{v.desc}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      {v.required ? 'Required' : 'Optional'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* How to Setup */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" /> Setup Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="space-y-2">
                <p className="font-medium text-foreground">1. Get Bright Data credentials</p>
                <p className="text-xs">Sign up at brightdata.com. Create a SERP API zone and note your API key and customer ID.</p>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-foreground">2. Create .env.local</p>
                <div className="rounded-md bg-muted/50 p-3 font-mono text-xs">
                  BRIGHT_DATA_API_KEY=your_api_key<br />
                  BRIGHT_DATA_CUSTOMER_ID=your_customer_id<br />
                  BRIGHT_DATA_SERP_ZONE=serp<br />
                  OPENAI_API_KEY=sk-...
                </div>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-foreground">3. Restart the dev server</p>
                <p className="text-xs">Run <code className="px-1 py-0.5 rounded bg-muted">npm run dev</code> — the app will automatically detect credentials and switch to live mode.</p>
              </div>
            </CardContent>
          </Card>

          {/* Bright Data Integration */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Bot className="h-4 w-4" /> Bright Data Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p className="text-xs">Keiretsu Radar uses the following Bright Data products:</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">SERP API</Badge>
                  <span className="text-xs">Search engine results for news, financial, and regulatory signals</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">Web Unlocker</Badge>
                  <span className="text-xs">Access public web pages for company data extraction</span>
                </div>
              </div>
              <a
                href="https://brightdata.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
              >
                Learn more about Bright Data <ExternalLink className="h-3 w-3" />
              </a>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
