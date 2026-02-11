import type React from 'react';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { HistoryItem, AnalysisReport, TaskInfo, ProviderInfo } from '../types/analysis';
import { historyApi } from '../api/history';
import { analysisApi, DuplicateTaskError } from '../api/analysis';
import { providersApi } from '../api/providers';
import { validateStockCode } from '../utils/validation';
import { getRecentStartDate, toDateInputValue } from '../utils/format';
import { useAnalysisStore } from '../stores/analysisStore';
import { ReportSummary } from '../components/report';
import { HistoryList } from '../components/history';
import { TaskPanel } from '../components/tasks';
import { useTaskStream } from '../hooks';

/**
 * Build a display-name lookup map from an array of ProviderInfo.
 * Keeps legacy keys ("openai" → "DeepSeek", "gemini" → "Gemini") as
 * hard-coded fallbacks so old DB records render a nice name even if the
 * backend provider list hasn't loaded yet.
 */
function buildDisplayMap(providers: ProviderInfo[]): Record<string, string> {
  const map: Record<string, string> = {
    openai: 'DeepSeek',
    gemini: 'Gemini',
  };
  for (const p of providers) {
    map[p.key] = p.displayName;
  }
  return map;
}

/**
 * HomePage - SpaceX-inspired full-width responsive layout
 * Header bar → [History sidebar | Report panel]
 */
const HomePage: React.FC = () => {
  const { setLoading, setError: setStoreError } = useAnalysisStore();

  // --- Dynamic provider list from API ---
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const displayMap = useMemo(() => buildDisplayMap(providers), [providers]);

  // --- Input state ---
  const [stockCode, setStockCode] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [inputError, setInputError] = useState<string>();

  // --- Model selection ---
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const modelDropdownRef = useRef<HTMLDivElement>(null);

  // --- Active model tab ---
  const [activeModelTab, setActiveModelTab] = useState<string>('');

  // --- History list state ---
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // --- Mobile sidebar toggle ---
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // --- Per-model report state (dynamic keys) ---
  const [reportByModel, setReportByModel] = useState<Record<string, AnalysisReport | null>>({});
  const [loadingByModel, setLoadingByModel] = useState<Record<string, boolean>>({});

  // --- Legacy report state (for history items without model info) ---
  const [selectedReport, setSelectedReport] = useState<AnalysisReport | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  // --- Task queue state ---
  const [activeTasks, setActiveTasks] = useState<TaskInfo[]>([]);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);

  // Track current analysis request to avoid race conditions
  const analysisRequestIdRef = useRef<number>(0);

  // ============================================================
  // Fetch providers from API on mount
  // ============================================================
  useEffect(() => {
    let cancelled = false;
    providersApi.list().then((list) => {
      if (cancelled) return;
      setProviders(list);
      if (list.length > 0) {
        setSelectedModels((prev) => (prev.length > 0 ? prev : [list[0].key]));
        setActiveModelTab((prev) => prev || list[0].key);
      }
    }).catch((err) => {
      console.error('Failed to fetch providers:', err);
    });
    return () => { cancelled = true; };
  }, []);

  // ============================================================
  // Close model dropdown when clicking outside
  // ============================================================
  useEffect(() => {
    if (!showModelDropdown) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(e.target as Node)) {
        setShowModelDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showModelDropdown]);

  // Toggle a model in the selection (must keep at least one)
  const toggleModel = (model: string) => {
    setSelectedModels((prev) => {
      if (prev.includes(model)) {
        if (prev.length <= 1) return prev;
        return prev.filter((m) => m !== model);
      }
      return [...prev, model];
    });
  };

  // ============================================================
  // Compute visible tabs: models that are loading or have a report
  // ============================================================
  const visibleTabs = useMemo(() => {
    const keys = new Set<string>();
    for (const [k, v] of Object.entries(loadingByModel)) {
      if (v) keys.add(k);
    }
    for (const [k, v] of Object.entries(reportByModel)) {
      if (v !== null) keys.add(k);
    }
    const ordered: { key: string; label: string }[] = [];
    for (const p of providers) {
      if (keys.has(p.key)) {
        ordered.push({ key: p.key, label: p.displayName });
        keys.delete(p.key);
      }
    }
    for (const k of keys) {
      ordered.push({ key: k, label: displayMap[k] ?? k });
    }
    return ordered;
  }, [loadingByModel, reportByModel, providers, displayMap]);

  // Auto-correct activeModelTab if current tab is not visible
  useEffect(() => {
    const isActiveVisible = loadingByModel[activeModelTab] || reportByModel[activeModelTab] != null;
    if (!isActiveVisible && visibleTabs.length > 0) {
      setActiveModelTab(visibleTabs[0].key);
    }
  }, [loadingByModel, reportByModel, activeModelTab, visibleTabs]);

  // ============================================================
  // Task helpers
  // ============================================================
  const updateTask = useCallback((updatedTask: TaskInfo) => {
    setActiveTasks((prev) => {
      const index = prev.findIndex((t) => t.taskId === updatedTask.taskId);
      if (index >= 0) {
        const newTasks = [...prev];
        newTasks[index] = updatedTask;
        return newTasks;
      }
      return prev;
    });
  }, []);

  const removeTask = useCallback((taskId: string) => {
    setActiveTasks((prev) => prev.filter((t) => t.taskId !== taskId));
  }, []);

  const loadTaskResult = useCallback(async (task: TaskInfo) => {
    const modelKey = task.modelName;
    if (!modelKey) return;
    try {
      const report = await historyApi.getDetail(task.taskId);
      setReportByModel((prev) => ({ ...prev, [modelKey]: report }));
      setLoadingByModel((prev) => ({ ...prev, [modelKey]: false }));
    } catch (err) {
      console.error(`Failed to load result for ${modelKey}:`, err);
      setLoadingByModel((prev) => ({ ...prev, [modelKey]: false }));
    }
  }, []);

  // ============================================================
  // SSE task stream
  // ============================================================
  useTaskStream({
    onTaskCreated: (task) => {
      setActiveTasks((prev) => {
        if (prev.some((t) => t.taskId === task.taskId)) return prev;
        return [...prev, task];
      });
    },
    onTaskStarted: updateTask,
    onTaskCompleted: (task) => {
      fetchHistory();
      loadTaskResult(task);
      setTimeout(() => removeTask(task.taskId), 2000);
    },
    onTaskFailed: (task) => {
      updateTask(task);
      const modelKey = task.modelName;
      if (modelKey) {
        setLoadingByModel((prev) => ({ ...prev, [modelKey]: false }));
      }
      setStoreError(task.error || '分析失败');
      setTimeout(() => removeTask(task.taskId), 5000);
    },
    onError: () => {
      console.warn('SSE connection lost, reconnecting...');
    },
    enabled: true,
  });

  // ============================================================
  // History loading
  // ============================================================
  const fetchHistory = useCallback(async (autoSelectFirst = false, reset = true) => {
    if (reset) {
      setIsLoadingHistory(true);
      setCurrentPage(1);
    } else {
      setIsLoadingMore(true);
    }

    const page = reset ? 1 : currentPage + 1;

    try {
      const response = await historyApi.getList({
        startDate: getRecentStartDate(30),
        endDate: toDateInputValue(new Date()),
        page,
        limit: pageSize,
      });

      if (reset) {
        setHistoryItems(response.items);
      } else {
        setHistoryItems((prev) => [...prev, ...response.items]);
      }

      const totalLoaded = reset ? response.items.length : historyItems.length + response.items.length;
      setHasMore(totalLoaded < response.total);
      setCurrentPage(page);

      if (autoSelectFirst && response.items.length > 0 && !selectedReport) {
        const firstItem = response.items[0];
        setIsLoadingReport(true);
        try {
          const report = await historyApi.getDetail(firstItem.queryId);
          const providerKey = report?.meta?.modelName;
          if (providerKey) {
            setReportByModel((prev) => ({ ...prev, [providerKey]: report }));
            setActiveModelTab(providerKey);
          } else {
          setSelectedReport(report);
          }
        } catch (err) {
          console.error('Failed to fetch first report:', err);
        } finally {
          setIsLoadingReport(false);
        }
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setIsLoadingHistory(false);
      setIsLoadingMore(false);
    }
  }, [selectedReport, currentPage, historyItems.length, pageSize]);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      fetchHistory(false, false);
    }
  }, [fetchHistory, isLoadingMore, hasMore]);

  // Initial load
  useEffect(() => {
    fetchHistory(true);
  }, []);

  // ============================================================
  // Click history item → load report into the correct model tab
  // ============================================================
  const handleHistoryClick = async (queryId: string) => {
    analysisRequestIdRef.current += 1;
    setReportByModel({});
    setLoadingByModel({});
    setSelectedReport(null);
    setIsLoadingReport(true);
    // Close mobile sidebar after selection
    setSidebarOpen(false);

    try {
      const report = await historyApi.getDetail(queryId);
      const providerKey = report?.meta?.modelName;
      if (providerKey) {
        setReportByModel((prev) => ({ ...prev, [providerKey]: report }));
        setActiveModelTab(providerKey);
      } else {
      setSelectedReport(report);
        if (providers.length > 0) {
          setActiveModelTab(providers[0].key);
        }
      }
    } catch (err) {
      console.error('Failed to fetch report:', err);
    } finally {
      setIsLoadingReport(false);
    }
  };

  // ============================================================
  // Submit analysis for selected models only
  // ============================================================
  const handleAnalyze = async () => {
    const { valid, message, normalized } = validateStockCode(stockCode);
    if (!valid) {
      setInputError(message);
      return;
    }

    setInputError(undefined);
    setDuplicateError(null);
    setIsAnalyzing(true);
    setLoading(true);
    setStoreError(null);

    setReportByModel({});
    setSelectedReport(null);
    const newLoading: Record<string, boolean> = {};
    for (const m of selectedModels) {
      newLoading[m] = true;
    }
    setLoadingByModel(newLoading);
    setActiveModelTab(selectedModels[0]);

    const currentRequestId = ++analysisRequestIdRef.current;

    const submitPromises = selectedModels.map(async (modelKey) => {
      const label = displayMap[modelKey] ?? modelKey;
    try {
      const response = await analysisApi.analyzeAsync({
        stockCode: normalized,
        reportType: 'detailed',
          modelName: modelKey,
        });
        console.log(`Task submitted (${label}):`, response.taskId);
      } catch (err) {
        if (currentRequestId === analysisRequestIdRef.current) {
          if (err instanceof DuplicateTaskError) {
            setDuplicateError(`股票 ${err.stockCode} (${label}) 正在分析中，请等待完成`);
          } else {
            console.error(`Analysis failed (${label}):`, err);
          }
        }
      }
    });

    try {
      await Promise.allSettled(submitPromises);
      if (currentRequestId === analysisRequestIdRef.current) {
        setStockCode('');
      }
    } finally {
      setIsAnalyzing(false);
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && stockCode && !isAnalyzing) {
      handleAnalyze();
    }
  };

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className="min-h-screen flex flex-col">
      {/* ===== Header: Input + Model Selection ===== */}
      <header className="flex-shrink-0 px-4 sm:px-6 lg:px-8 pt-5 pb-4">
        <div className="max-w-[1800px] mx-auto">
          {/* Row 1: Input + Analyze button */}
          <div className="flex items-center gap-3 max-w-2xl mb-4">
            {/* Mobile sidebar toggle */}
            <button
              type="button"
              className="lg:hidden flex-shrink-0 w-9 h-9 rounded-lg bg-elevated border border-[#94a3b8]/8 flex items-center justify-center text-muted hover:text-primary transition-colors"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

          <div className="flex-1 relative">
            <input
              type="text"
              value={stockCode}
              onChange={(e) => {
                setStockCode(e.target.value.toUpperCase());
                setInputError(undefined);
              }}
              onKeyDown={handleKeyDown}
              placeholder="输入股票代码，如 600519、00700、AAPL"
              disabled={isAnalyzing}
              className={`input-terminal w-full ${inputError ? 'border-danger/50' : ''}`}
            />
            {inputError && (
                <p className="absolute -bottom-5 left-0 text-xs text-danger">{inputError}</p>
            )}
            {duplicateError && (
                <p className="absolute -bottom-5 left-0 text-xs text-warning">{duplicateError}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleAnalyze}
              disabled={!stockCode || isAnalyzing || selectedModels.length === 0}
              className="btn-primary flex items-center gap-2 whitespace-nowrap"
          >
            {isAnalyzing ? (
              <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                分析中
              </>
            ) : (
                '开始分析'
              )}
            </button>
          </div>

          {/* Row 2: Model selection pills */}
          <div className="flex items-center gap-2 flex-wrap" ref={modelDropdownRef}>
            <span className="label-uppercase mr-1 select-none">Models</span>
            {providers.map((p) => {
              const checked = selectedModels.includes(p.key);
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => toggleModel(p.key)}
                  className={`
                    px-3.5 py-1 rounded-full text-xs font-medium tracking-wide
                    border transition-all duration-150 cursor-pointer select-none
                    ${checked
                      ? 'bg-[#4fc3f7]/10 border-[#4fc3f7]/20 text-[#4fc3f7]'
                      : 'bg-transparent border-[#94a3b8]/8 text-[#64748b] hover:border-[#94a3b8]/15 hover:text-[#94a3b8]'
                    }
                  `}
                >
                  {p.displayName}
                </button>
              );
            })}
            {providers.length === 0 && (
              <span className="text-xs text-muted">加载中...</span>
            )}
          </div>
        </div>
      </header>

      {/* Separator line */}
      <div className="h-px bg-[#94a3b8]/5 mx-4 sm:mx-6 lg:mx-8" />

      {/* ===== Main Content ===== */}
      <main className="flex-1 flex overflow-hidden px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-[1800px] mx-auto flex gap-4 lg:gap-5 w-full">
          {/* Left: Sidebar (history + tasks) */}
          {/* Mobile overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          <div className={`
            flex flex-col gap-3
            /* Mobile: sliding drawer */
            fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
            w-[280px] sm:w-[300px] lg:w-[280px] xl:w-[300px] 2xl:w-[320px]
            flex-shrink-0 overflow-hidden
            transition-transform duration-200 ease-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            lg:transition-none
            bg-base lg:bg-transparent
            p-4 lg:p-0
          `}>
          <TaskPanel tasks={activeTasks} />
          <HistoryList
            items={historyItems}
            isLoading={isLoadingHistory}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
              selectedQueryId={reportByModel[activeModelTab]?.meta?.queryId || selectedReport?.meta?.queryId}
            onItemClick={handleHistoryClick}
            onLoadMore={handleLoadMore}
              displayMap={displayMap}
              className="flex-1 min-h-0"
          />
        </div>

          {/* Right: Report detail with dynamic model tabs */}
          <section className="flex-1 flex flex-col overflow-hidden min-w-0">
            {/* Dynamic Model Tab Bar */}
            {visibleTabs.length > 0 && (
              <div className="flex-shrink-0 flex items-center gap-5 mb-4 border-b border-[#94a3b8]/5 pb-3 overflow-x-auto">
                {visibleTabs.map((tab) => {
                  const isActive = activeModelTab === tab.key;
                  const isTabLoading = loadingByModel[tab.key];
                  const hasReport = !!reportByModel[tab.key];
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => {
                        setActiveModelTab(tab.key);
                        setSelectedReport(null);
                      }}
                      className={`
                        pb-2 text-xs font-medium tracking-wide transition-all duration-150 relative whitespace-nowrap
                        ${isActive
                          ? 'text-[#4fc3f7]'
                          : 'text-[#64748b] hover:text-[#94a3b8]'
                        }
                      `}
                    >
                      <span className="flex items-center gap-2">
                        {tab.label}
                        {isTabLoading && (
                          <svg className="w-3 h-3 animate-spin text-[#4fc3f7]" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        )}
                        {!isTabLoading && hasReport && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
                        )}
                      </span>
                      {isActive && (
                        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#4fc3f7] rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              {(() => {
                const currentReport = reportByModel[activeModelTab] || selectedReport;
                const currentLoading = loadingByModel[activeModelTab] || isLoadingReport;

                if (currentReport) {
                  return (
                    <div className="animate-fade-in">
                      <ReportSummary data={currentReport} isHistory displayMap={displayMap} />
            </div>
                  );
                }

                if (currentLoading) {
                  const tabLabel = displayMap[activeModelTab] ?? activeModelTab;
                  return (
                    <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                      <div className="w-10 h-10 border-[2px] border-[#4fc3f7]/10 border-t-[#4fc3f7] rounded-full animate-spin" />
                      <p className="mt-4 text-[#94a3b8] text-xs">
                        {tabLabel} 分析中...
                      </p>
            </div>
                  );
                }

                // Empty state
                return (
                  <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                    <div className="w-14 h-14 mb-4 rounded-2xl bg-elevated flex items-center justify-center border border-[#94a3b8]/5">
                      <svg className="w-6 h-6 text-[#475569]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
                    <h3 className="text-sm font-medium text-[#e2e8f0] mb-1">开始分析</h3>
                    <p className="text-xs text-[#64748b] max-w-[280px] leading-relaxed">
                      输入股票代码进行 AI 分析<br />或从左侧历史记录查看报告
                    </p>
                  </div>
                );
              })()}
            </div>
        </section>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
