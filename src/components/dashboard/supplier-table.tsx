'use client';

import Link from 'next/link';
import { Supplier } from '@/lib/types';
import { RiskBadge, RiskScoreDisplay } from '@/components/risk-badge';
import { ChevronRight, MapPin, ArrowUp, ArrowDown, Minus } from 'lucide-react';

export function SupplierTable({ suppliers }: { suppliers: Supplier[] }) {
  const sorted = [...suppliers].sort((a, b) => b.riskScore.overall - a.riskScore.overall);

  return (
    <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Supplier</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Score</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Signals</th>
              <th className="px-4 py-3 font-medium">Trend</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(supplier => {
              const topCat = supplier.riskScore.categories.sort((a, b) => b.score - a.score)[0];
              const trendIcon = topCat?.trend === 'up'
                ? <ArrowUp className="h-3.5 w-3.5 text-red-400" />
                : topCat?.trend === 'down'
                  ? <ArrowDown className="h-3.5 w-3.5 text-emerald-400" />
                  : <Minus className="h-3.5 w-3.5 text-muted-foreground" />;

              return (
                <tr key={supplier.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium">{supplier.name}</div>
                    <div className="text-xs text-muted-foreground">{supplier.industry}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{supplier.relationshipType}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-muted-foreground text-xs">
                      <MapPin className="h-3 w-3" />
                      {supplier.country}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <RiskScoreDisplay score={supplier.riskScore.overall} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    <RiskBadge level={supplier.riskScore.level} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{supplier.signalCount}</td>
                  <td className="px-4 py-3">{trendIcon}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/supplier/${supplier.id}`}
                      className="flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      Details
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
