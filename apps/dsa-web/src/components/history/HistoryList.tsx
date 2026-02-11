import type React from 'react';
import { useRef, useCallback, useEffect } from 'react';
import type { HistoryItem } from '../../types/analysis';
import { getSentimentColor } from '../../types/analysis';
import { formatDateTime } from '../../utils/format';

interface HistoryListProps {
  items: HistoryItem[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  selectedQueryId?: string;
  onItemClick: (queryId: string) => void;
  onLoadMore: () => void;
  /** Provider key → display name lookup */
  displayMap?: Record<string, string>;
  className?: string;
}

/** Produce a short badge label from the display name */
function badgeLabel(displayName: string): string {
  if (/[\u4e00-\u9fff]/.test(displayName)) {
    return displayName.length <= 4 ? displayName : displayName.slice(0, 2);
  }
  return displayName.slice(0, 2).toUpperCase();
}

/** Pick a badge color class pair based on provider key */
function badgeColor(key: string): string {
  const palette: [string, string][] = [
    ['text-blue-300', 'bg-blue-500/10'],
    ['text-purple-300', 'bg-purple-500/10'],
    ['text-emerald-300', 'bg-emerald-500/10'],
    ['text-orange-300', 'bg-orange-500/10'],
    ['text-pink-300', 'bg-pink-500/10'],
    ['text-cyan-300', 'bg-cyan-500/10'],
    ['text-yellow-300', 'bg-yellow-500/10'],
  ];
  if (key === 'openai') return `${palette[0][0]} ${palette[0][1]}`;
  if (key === 'gemini') return `${palette[1][0]} ${palette[1][1]}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = key.charCodeAt(i) + ((hash << 5) - hash);
  const idx = Math.abs(hash) % palette.length;
  return `${palette[idx][0]} ${palette[idx][1]}`;
}

/**
 * History list component - clean minimal style
 */
export const HistoryList: React.FC<HistoryListProps> = ({
  items,
  isLoading,
  isLoadingMore,
  hasMore,
  selectedQueryId,
  onItemClick,
  onLoadMore,
  displayMap = {},
  className = '',
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !isLoading && !isLoadingMore) {
        const container = scrollContainerRef.current;
        if (container && container.scrollHeight > container.clientHeight) {
          onLoadMore();
        }
      }
    },
    [hasMore, isLoading, isLoadingMore, onLoadMore]
  );

  useEffect(() => {
    const trigger = loadMoreTriggerRef.current;
    const container = scrollContainerRef.current;
    if (!trigger || !container) return;

    const observer = new IntersectionObserver(handleObserver, {
      root: container,
      rootMargin: '20px',
      threshold: 0.1,
    });

    observer.observe(trigger);
    return () => observer.disconnect();
  }, [handleObserver]);

  return (
    <aside className={`glass-card overflow-hidden flex flex-col ${className}`}>
      <div ref={scrollContainerRef} className="p-3 flex-1 overflow-y-auto">
        <h2 className="text-xs font-medium text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          历史记录
        </h2>

        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="w-5 h-5 border-2 border-cyan/15 border-t-cyan rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-6 text-muted text-xs">
            暂无历史记录
          </div>
        ) : (
          <div className="space-y-1">
            {items.map((item) => {
              const modelKey = item.modelName;
              const modelDisplay = modelKey ? (displayMap[modelKey] ?? modelKey) : null;

              return (
              <button
                key={item.queryId}
                type="button"
                onClick={() => onItemClick(item.queryId)}
                  className={`history-item w-full text-left ${selectedQueryId === item.queryId ? 'active' : ''}`}
              >
                <div className="flex items-center gap-2 w-full">
                  {item.sentimentScore !== undefined && (
                    <span
                        className="w-0.5 h-7 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: getSentimentColor(item.sentimentScore),
                          boxShadow: `0 0 5px ${getSentimentColor(item.sentimentScore)}30`
                      }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="font-medium text-white truncate text-xs">
                        {item.stockName || item.stockCode}
                      </span>
                      {item.sentimentScore !== undefined && (
                        <span
                          className="text-xs font-mono font-semibold px-1 py-0.5 rounded"
                          style={{
                            color: getSentimentColor(item.sentimentScore),
                              backgroundColor: `${getSentimentColor(item.sentimentScore)}12`
                          }}
                        >
                          {item.sentimentScore}
                        </span>
                      )}
                    </div>
                      <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-xs text-muted font-mono">
                        {item.stockCode}
                      </span>
                        {modelKey && modelDisplay && (
                          <>
                            <span className="text-xs text-muted/40">·</span>
                            <span className={`text-xs font-medium px-1 rounded ${badgeColor(modelKey)}`}>
                              {badgeLabel(modelDisplay)}
                            </span>
                          </>
                        )}
                        <span className="text-xs text-muted/40">·</span>
                      <span className="text-xs text-muted">
                        {formatDateTime(item.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
              );
            })}

            <div ref={loadMoreTriggerRef} className="h-4" />

            {isLoadingMore && (
              <div className="flex justify-center py-3">
                <div className="w-4 h-4 border-2 border-cyan/15 border-t-cyan rounded-full animate-spin" />
              </div>
            )}

            {!hasMore && items.length > 0 && (
              <div className="text-center py-2 text-muted/40 text-xs">
                已加载全部
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
