import { Badge } from '@/components/ui/badge';
import { RiskLevel } from '@/lib/types';
import { cn } from '@/lib/utils';

const config: Record<RiskLevel, { label: string; className: string }> = {
  low: { label: 'Low Risk', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  medium: { label: 'Medium Risk', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  high: { label: 'High Risk', className: 'bg-red-500/15 text-red-400 border-red-500/30' },
  critical: { label: 'Critical', className: 'bg-red-600/20 text-red-300 border-red-500/40' },
};

export function RiskBadge({ level, className }: { level: RiskLevel; className?: string }) {
  const c = config[level];
  return (
    <Badge variant="outline" className={cn(c.className, 'font-medium', className)}>
      {c.label}
    </Badge>
  );
}

export function RiskScoreDisplay({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' | 'lg' }) {
  const level: RiskLevel = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';
  const color = level === 'high' ? 'text-red-400' : level === 'medium' ? 'text-amber-400' : 'text-emerald-400';
  const sizeClass = size === 'lg' ? 'text-4xl' : size === 'md' ? 'text-2xl' : 'text-lg';

  return (
    <div className="flex items-baseline gap-1">
      <span className={cn(sizeClass, 'font-bold tabular-nums', color)}>{score}</span>
      <span className="text-xs text-muted-foreground">/100</span>
    </div>
  );
}
