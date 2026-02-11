import type React from 'react';
import type { ReportMeta, ReportSummary as ReportSummaryType } from '../../types/analysis';
import { ScoreGauge, Card } from '../common';
import { formatDateTime } from '../../utils/format';

interface ReportOverviewProps {
  meta: ReportMeta;
  summary: ReportSummaryType;
  isHistory?: boolean;
  displayMap?: Record<string, string>;
}

export const ReportOverview: React.FC<ReportOverviewProps> = ({
  meta,
  summary,
  displayMap = {},
}) => {
  const getPriceChangeColor = (changePct: number | undefined): string => {
    if (changePct === undefined || changePct === null) return 'text-muted';
    if (changePct > 0) return 'text-danger';
    if (changePct < 0) return 'text-success';
    return 'text-muted';
  };

  const formatChangePct = (changePct: number | undefined): string => {
    if (changePct === undefined || changePct === null) return '--';
    const sign = changePct > 0 ? '+' : '';
    return `${sign}${changePct.toFixed(2)}%`;
  };

  return (
    <div className="space-y-4">
      {/* Main overview grid: info left, gauge right */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-4">
        {/* Left: stock info + insights */}
        <div className="space-y-4">
          <Card variant="gradient" padding="md">
            <div className="mb-4">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-lg font-semibold text-primary tracking-tight">
                    {meta.stockName || meta.stockCode}
                  </h2>
                  {meta.currentPrice != null && (
                    <div className="flex items-baseline gap-2">
                    <span className={`text-lg font-bold font-mono ${getPriceChangeColor(meta.changePct)}`}>
                        {meta.currentPrice.toFixed(2)}
                      </span>
                    <span className={`text-xs font-semibold font-mono ${getPriceChangeColor(meta.changePct)}`}>
                        {formatChangePct(meta.changePct)}
                      </span>
                    </div>
                  )}
                </div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="font-mono text-xs text-cyan bg-cyan/8 px-2 py-0.5 rounded-md">
                    {meta.stockCode}
                </span>
                {meta.modelName && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-md text-cyan bg-cyan/8">
                    {displayMap[meta.modelName] ?? meta.modelName}
                  </span>
                )}
                  <span className="text-xs text-muted flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDateTime(meta.createdAt)}
                  </span>
              </div>
            </div>

            <div className="border-t border-[#94a3b8]/5 pt-4">
              <span className="label-uppercase">KEY INSIGHTS</span>
              <p className="text-xs text-secondary leading-relaxed mt-2 whitespace-pre-wrap text-left">
                {summary.analysisSummary || '暂无分析结论'}
              </p>
            </div>
          </Card>

          {/* Action cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Card variant="bordered" padding="sm" hoverable>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-success/8 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-success">操作建议</h4>
                  <p className="text-sm font-medium text-primary">{summary.operationAdvice || '暂无建议'}</p>
                </div>
              </div>
            </Card>

            <Card variant="bordered" padding="sm" hoverable>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-warning/8 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-warning">趋势预测</h4>
                  <p className="text-sm font-medium text-primary">{summary.trendPrediction || '暂无预测'}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Right: Sentiment gauge */}
        <div>
          <Card variant="bordered" padding="md" className="!overflow-visible h-full flex flex-col items-center justify-center">
            <h3 className="label-uppercase mb-3 text-center">Market Sentiment</h3>
              <ScoreGauge score={summary.sentimentScore} size="lg" />
          </Card>
        </div>
      </div>
    </div>
  );
};
