'use client';

import { useState } from 'react';
import { Search, Radar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ScanInputProps {
  onScan: (query: string) => void;
  isLoading: boolean;
  defaultQuery?: string;
}

export function ScanInput({ onScan, isLoading, defaultQuery = '' }: ScanInputProps) {
  const [query, setQuery] = useState(defaultQuery);

  function handleSubmit() {
    const q = query.trim();
    if (q) onScan(q);
  }

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="Enter a supply chain, industry, or company..."
          className="pl-9 h-10 bg-card/50 border-border/50"
          disabled={isLoading}
        />
      </div>
      <Button onClick={handleSubmit} disabled={isLoading || !query.trim()} className="gap-2 h-10">
        {isLoading ? (
          <>
            <Radar className="h-4 w-4 animate-spin" />
            Scanning...
          </>
        ) : (
          <>
            <Radar className="h-4 w-4" />
            Run Scan
          </>
        )}
      </Button>
    </div>
  );
}
