'use client';

import { Badge } from '@/components/ui/badge';
import { Radio, Database } from 'lucide-react';

export function ModeBadge({ mode }: { mode: 'live' | 'demo' }) {
  if (mode === 'live') {
    return (
      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 gap-1.5">
        <Radio className="h-3 w-3 animate-pulse" />
        Live — Bright Data
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 gap-1.5">
      <Database className="h-3 w-3" />
      Demo Mode
    </Badge>
  );
}
