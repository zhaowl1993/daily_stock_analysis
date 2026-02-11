import type React from 'react';
import type { ReportStrategy as ReportStrategyType } from '../../types/analysis';
import { Card } from '../common';

interface ReportStrategyProps {
  strategy?: ReportStrategyType;
}

interface StrategyItemProps {
  label: string;
  value?: string;
  color: string;
}

const StrategyItem: React.FC<StrategyItemProps> = ({ label, value, color }) => (
  <div className="relative overflow-hidden rounded-xl bg-elevated border border-[#94a3b8]/5 p-3.5 hover:border-[#94a3b8]/10 transition-colors">
    <div className="flex flex-col">
      <span className="text-xs text-muted mb-1">{label}</span>
      <span
        className="text-xs font-semibold font-mono leading-snug"
        style={{ color: value ? color : 'var(--text-dim)' }}
      >
        {value || '—'}
      </span>
    </div>
    <div
      className="absolute bottom-0 left-0 right-0 h-[2px] opacity-40"
      style={{ background: `linear-gradient(90deg, ${color}00, ${color}, ${color}00)` }}
    />
  </div>
);

export const ReportStrategy: React.FC<ReportStrategyProps> = ({ strategy }) => {
  if (!strategy) return null;

  const items = [
    { label: '理想买入', value: strategy.idealBuy, color: '#4ade80' },
    { label: '二次买入', value: strategy.secondaryBuy, color: '#4fc3f7' },
    { label: '止损价位', value: strategy.stopLoss, color: '#f87171' },
    { label: '止盈目标', value: strategy.takeProfit, color: '#fbbf24' },
  ];

  return (
    <Card variant="bordered" padding="md">
      <div className="mb-4 flex items-baseline gap-2">
        <span className="label-uppercase">STRATEGY POINTS</span>
        <h3 className="text-sm font-medium text-primary">狙击点位</h3>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {items.map((item) => (
          <StrategyItem key={item.label} {...item} />
        ))}
      </div>
    </Card>
  );
};
