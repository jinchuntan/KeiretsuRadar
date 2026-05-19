'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Supplier, WebSignal } from '@/lib/types';

const RISK_COLORS = {
  low: '#22c55e',
  medium: '#f59e0b',
  high: '#ef4444',
};

export function RiskDistributionChart({ suppliers }: { suppliers: Supplier[] }) {
  const data = [
    { name: 'Low', value: suppliers.filter(s => s.riskScore.level === 'low').length, color: RISK_COLORS.low },
    { name: 'Medium', value: suppliers.filter(s => s.riskScore.level === 'medium').length, color: RISK_COLORS.medium },
    { name: 'High', value: suppliers.filter(s => s.riskScore.level === 'high').length, color: RISK_COLORS.high },
  ].filter(d => d.value > 0);

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Risk Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 mt-2">
          {data.map(d => (
            <div key={d.name} className="flex items-center gap-1.5 text-xs">
              <div className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
              <span className="text-muted-foreground">{d.name}: {d.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function SignalCategoryChart({ signals }: { signals: WebSignal[] }) {
  const categories = ['financial', 'operational', 'leadership', 'hiring', 'regulatory', 'reputation', 'product_pricing', 'cyber'];
  const shortLabels: Record<string, string> = {
    financial: 'Financial',
    operational: 'Operations',
    leadership: 'Leadership',
    hiring: 'Hiring',
    regulatory: 'Regulatory',
    reputation: 'Reputation',
    product_pricing: 'Product',
    cyber: 'Cyber',
  };

  const data = categories.map(cat => {
    const catSignals = signals.filter(s => s.riskCategory === cat);
    return {
      name: shortLabels[cat],
      negative: catSignals.filter(s => s.sentiment === 'negative').length,
      positive: catSignals.filter(s => s.sentiment === 'positive').length,
      neutral: catSignals.filter(s => s.sentiment === 'neutral').length,
    };
  }).filter(d => d.negative + d.positive + d.neutral > 0);

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Signal Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 10, right: 10 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
              />
              <Bar dataKey="negative" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} barSize={14} />
              <Bar dataKey="neutral" stackId="a" fill="#6b7280" radius={[0, 0, 0, 0]} barSize={14} />
              <Bar dataKey="positive" stackId="a" fill="#22c55e" radius={[0, 4, 4, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
