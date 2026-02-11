# Changelog

所有重要更改都会记录在此文件中�?
格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)�?版本号遵�?[Semantic Versioning](https://semver.org/lang/zh-CN/)�?
## [3.0.5] - 2026-02-08

### 修复
- 🐛 修复信号 emoji 与建议不一致的问题（复合建议如"卖出/观望"未正确映射）
- 🐛 修复 `*ST` 股票名在微信/Dashboard �?markdown 转义问题
- 🐛 修复 `idx.amount` �?None 时大盘复�?TypeError
- 🐛 修复分析 API 返回 `report=None` �?ReportStrategy 类型不一致问�?- 🐛 修复 Tushare 返回类型错误（dict �?UnifiedRealtimeQuote）及 API 端点指向

### 新增
- 📊 大盘复盘报告注入结构化数据（涨跌统计、指数表格、板块排名）
- 🔍 搜索结果 TTL 缓存�?00 条上限，FIFO 淘汰�?- 🔧 Tushare Token 存在时自动注入实时行情优先级
- 📰 新闻摘要截断长度 50�?00 �?
### 优化
- �?补充行情字段请求限制为最�?1 次，减少无效请求

## [3.0.4] - 2026-02-07

### 新增
- 📈 **回测引擎** (PR #269)
  - 新增基于历史分析记录的回测系统，支持收益率、胜率、最大回撤等指标评估
  - WebUI 集成回测结果展示

## [3.0.3] - 2026-02-07

### 修复
- 🐛 修复狙击点位数据解析错误问题 (PR #271)

## [3.0.2] - 2026-02-06

### 新增
- ✉️ 可配置邮件发送者名�?(PR #272)
- 🌐 外国股票支持英文关键词搜�?
## [3.0.1] - 2026-02-06

### 修复
- 🐛 修复 ETF 实时行情获取、市场数据回退、企业微信消息分块问�?- 🔧 CI 流程简�?
## [3.0.0] - 2026-02-06

### 移除
- 🗑�?**移除旧版 WebUI**
  - 删除基于 `http.server.ThreadingHTTPServer` 的旧�?WebUI（`web/` 包）
  - 旧版 WebUI 的功能已完全�?FastAPI（`api/`�? React 前端替代
  - `--webui` / `--webui-only` 命令行参数标记为弃用，自动重定向�?`--serve` / `--serve-only`
  - `WEBUI_ENABLED` / `WEBUI_HOST` / `WEBUI_PORT` 环境变量保持兼容，自动转发到 FastAPI 服务
  - `webui.py` 保留为兼容入口，启动时直接调�?FastAPI 后端
  - Docker Compose 中移�?`webui` 服务定义，统一使用 `server` 服务

### 变更
- ♻️ **服务层重�?*
  - �?`web/services.py` 中的异步任务服务迁移�?`src/services/task_service.py`
  - Bot 分析命令（`bot/commands/analyze.py`）改为使�?`src.services.task_service`
  - Docker 环境变量 `WEBUI_HOST`/`WEBUI_PORT` 更名�?`API_HOST`/`API_PORT`（旧名仍兼容�?
## [2.3.0] - 2026-02-01

### 新增
- 🇺🇸 **增强美股支持** (Issue #153)
  - 实现基于 Akshare 的美股历史数据获�?(`ak.stock_us_daily()`)
  - 实现基于 Yfinance 的美股实时行情获取（优先策略�?  - 增加对不支持数据源（Tushare/Baostock/Pytdx/Efinance）的美股代码过滤和快速降�?
### 修复
- 🐛 修复 AMD 等美股代码被误识别为 A 股的问题 (Issue #153)

## [2.2.5] - 2026-02-01

### 新增
- 🤖 **AstrBot 消息推�?* (PR #217)
  - 新增 AstrBot 通知渠道，支持推送到 QQ 和微�?  - 支持 HMAC SHA256 签名验证，确保通信安全
  - 通过 `ASTRBOT_URL` �?`ASTRBOT_TOKEN` 配置

## [2.2.4] - 2026-02-01

### 新增
- ⚙️ **可配置数据源优先�?* (PR #215)
  - 支持通过环境变量（如 `YFINANCE_PRIORITY=0`）动态调整数据源优先�?  - 无需修改代码即可优先使用特定数据源（�?Yahoo Finance�?
## [2.2.3] - 2026-01-31

### 修复
- 📦 更新 requirements.txt，增�?`lxml_html_clean` 依赖以解决兼容性问�?
## [2.2.2] - 2026-01-31

### 修复
- 🐛 修复代理配置区分大小写问�?(fixes #211)

## [2.2.1] - 2026-01-31

### 修复
- 🐛 **YFinance 兼容性修�?* (PR #210, fixes #209)
  - 修复新版 yfinance 返回 MultiIndex 列名导致的数据解析错�?
## [2.2.0] - 2026-01-31

### 新增
- 🔄 **多源回退策略增强**
  - 实现了更健壮的数据获取回退机制 (feat: multi-source fallback strategy)
  - 优化了数据源故障时的自动切换逻辑

### 修复
- 🐛 修复 analyzer 运行后无法通过�?.env 文件�?stock_list 内容调整跟踪的股�?
## [2.1.14] - 2026-01-31

### 文档
- 📝 更新 README 和优�?auto-tag 规则

## [2.1.13] - 2026-01-31

### 修复
- 🐛 **Tushare 优先级与实时行情** (Fixed #185)
  - 修复 Tushare 数据源优先级设置问题
  - 修复 Tushare 实时行情获取功能

## [2.1.12] - 2026-01-30

### 修复
- 🌐 修复代理配置在某些情况下的区分大小写问题
- 🌐 修复本地环境禁用代理的逻辑

## [2.1.11] - 2026-01-30

### 优化
- 🚀 **飞书消息流优�?* (PR #192)
  - 优化飞书 Stream 模式的消息类型处�?  - 修改 Stream 消息模式默认为关闭，防止配置错误运行时报�?
## [2.1.10] - 2026-01-30

### 合并
- 📦 合并 PR #154 贡献

## [2.1.9] - 2026-01-30

### 新增
- 💬 **微信文本消息支持** (PR #137)
  - 新增微信推送的纯文本消息类型支�?  - 添加 `WECHAT_MSG_TYPE` 配置�?
## [2.1.8] - 2026-01-30

### 修复
- 🐛 修正日志�?API 提供商显示错�?(PR #197)

## [2.1.7] - 2026-01-30

### 修复
- 🌐 禁用本地环境的代理设置，避免网络连接问题

## [2.1.6] - 2026-01-29

### 新增
- 📡 **Pytdx 数据�?(Priority 2)**
  - 新增通达信数据源，免费无需注册
  - 多服务器自动切换
  - 支持实时行情和历史数�?- 🏷�?**多源股票名称解析**
  - DataFetcherManager 新增 `get_stock_name()` 方法
  - 新增 `batch_get_stock_names()` 批量查询
  - 自动在多数据源间回退
  - Tushare �?Baostock 新增股票名称/列表方法
- 🔍 **增强搜索回退**
  - 新增 `search_stock_price_fallback()` 用于数据源全部失败时
  - 新增搜索维度：市场分析、行业分�?  - 最大搜索次数从 3 增加�?5
  - 改进搜索结果格式（每维度 4 条结果）

### 改进
- 更新搜索查询模板以提高相关�?- 增强 `format_intel_report()` 输出结构

## [2.1.5] - 2026-01-29

### 新增
- 📡 新增 Pytdx 数据源和多源股票名称解析功能

## [2.1.4] - 2026-01-29

### 文档
- 📝 更新赞助商信�?
## [2.1.3] - 2026-01-28

### 文档
- 📝 重构 README 布局
- 🌐 新增繁体中文翻译 (README_CHT.md)

### 修复
- 🐛 修复 WebUI 无法输入美股代码问题
  - 输入框逻辑改成所有字母都转换成大�?  - 支持 `.` 的输入（�?`BRK.B`�?
## [2.1.2] - 2026-01-27

### 修复
- 🐛 修复个股分析推送失败和报告路径问题 (fixes #166)
- 🐛 修改 CR 错误，确保微信消息最大字节配置生�?
## [2.1.1] - 2026-01-26

### 新增
- 🔧 添加 GitHub Actions auto-tag 工作�?- 📡 添加 yfinance 兜底数据源及数据缺失警告

### 修复
- 🐳 修复 docker-compose 路径和文档命�?- 🐳 Dockerfile 补充 copy src 文件�?(fixes #145)

## [2.1.0] - 2026-01-25

### 新增
- 🇺🇸 **美股分析支持**
  - 支持美股代码直接输入（如 `AAPL`, `TSLA`�?  - 使用 YFinance 作为美股数据�?- 📈 **MACD �?RSI 技术指�?*
  - MACD：趋势确认、金叉死叉信号（零轴上金叉⭐、金叉✅、死叉❌�?  - RSI：超买超卖判断（超卖⭐、强势✅、超买⚠️）
  - 指标信号纳入综合评分系统
- 🎮 **Discord 推送支�?* (PR #124, #125, #144)
  - 支持 Discord Webhook �?Bot API 两种方式
  - 通过 `DISCORD_WEBHOOK_URL` �?`DISCORD_BOT_TOKEN` + `DISCORD_CHANNEL_ID` 配置
- 🤖 **机器人命令交�?*
  - 钉钉机器人支�?`/分析 股票代码` 命令触发分析
  - 支持 Stream 长连接模�?- 🌡�?**AI 温度参数可配�?* (PR #142)
  - 支持自定�?AI 模型温度参数
- 🐳 **Zeabur 部署支持**
  - 添加 Zeabur 镜像部署工作�?  - 支持 commit hash �?latest 双标�?
### 重构
- 🏗�?**项目结构优化**
  - 核心代码移至 `src/` 目录，根目录更清�?  - 文档移至 `docs/` 目录
  - Docker 配置移至 `docker/` 目录
  - 修复所�?import 路径，保持向后兼�?- 🔄 **数据源架构升�?*
  - 新增数据源熔断机制，单数据源连续失败自动切换
  - 实时行情缓存优化，批量预取减�?API 调用
  - 网络代理智能分流，国内接口自动直�?- 🤖 Discord 机器人重构为平台适配器架�?
### 修复
- 🌐 **网络稳定性增�?*
  - 自动检测代理配置，对国内行情接口强制直�?  - 修复 EfinanceFetcher 偶发�?`ProtocolError`
  - 增加对底层网络错误的捕获和重试机�?- 📧 **邮件渲染优化**
  - 修复邮件中表格不渲染问题 (#134)
  - 优化邮件排版，更紧凑美观
- 📢 **企业微信推送修�?*
  - 修复大盘复盘推送不完整问题
  - 增强消息分割逻辑，支持更多标题格�?  - 增加分批发送间隔，避免限流丢失
- 👷 **CI/CD 修复**
  - 修复 GitHub Actions 中路径引用的错误

## [2.0.0] - 2026-01-24

### 新增
- 🇺🇸 **美股分析支持**
  - 支持美股代码直接输入（如 `AAPL`, `TSLA`�?  - 使用 YFinance 作为美股数据�?- 🤖 **机器人命令交�?* (PR #113)
  - 钉钉机器人支�?`/分析 股票代码` 命令触发分析
  - 支持 Stream 长连接模�?  - 支持选择精简报告或完整报�?- 🎮 **Discord 推送支�?* (PR #124)
  - 支持 Discord Webhook 推�?  - 添加 Discord 环境变量到工作流

### 修复
- 🐳 修复 WebUI �?Docker 中绑�?0.0.0.0 (fixed #118)
- 🔔 修复飞书长连接通知问题
- 🐛 修复 `analysis_delay` 未定义错�?- 🔧 启动�?config.py 检测通知渠道，修复已配置自定义渠道情况下仍然提示未配置问�?
### 改进
- 🔧 优化 Tushare 优先级判断逻辑，提升封装�?- 🔧 修复 Tushare 优先级提升后仍排�?Efinance 之后的问�?- ⚙️ 配置 TUSHARE_TOKEN 时自动提�?Tushare 数据源优先级
- ⚙️ 实现 4 个用户反�?issue (#112, #128, #38, #119)

## [1.6.0] - 2026-01-19

### 新增
- 🖥�?WebUI 管理界面�?API 支持（PR #72�?  - 全新 Web 架构：分层设计（Server/Router/Handler/Service�?  - 核心 API：支�?`/analysis` (触发分析), `/tasks` (查询进度), `/health` (健康检�?
  - 交互界面：支持页面直接输入代码并触发分析，实时展示进�?  - 运行模式：新�?`--webui-only` 模式，仅启动 Web 服务
  - 解决�?[#70](https://github.com/zhaowl1993/daily_stock_analysis/issues/70) 的核心需求（提供触发分析的接口）
- ⚙️ GitHub Actions 配置灵活性增强（[#79](https://github.com/zhaowl1993/daily_stock_analysis/issues/79)�?  - 支持�?Repository Variables 读取非敏感配置（�?STOCK_LIST, GEMINI_MODEL�?  - 保持�?Secrets 的向下兼�?
### 修复
- 🐛 修复企业微信/飞书报告截断问题（[#73](https://github.com/zhaowl1993/daily_stock_analysis/issues/73)�?  - 移除 notification.py 中不必要的长度硬截断逻辑
  - 依赖底层自动分片机制处理长消�?- 🐛 修复 GitHub Workflow 环境变量缺失（[#80](https://github.com/zhaowl1993/daily_stock_analysis/issues/80)�?  - 修复 `CUSTOM_WEBHOOK_BEARER_TOKEN` 未正确传递到 Runner 的问�?
## [1.5.0] - 2026-01-17

### 新增
- 📲 单股推送模式（[#55](https://github.com/zhaowl1993/daily_stock_analysis/issues/55)�?  - 每分析完一只股票立即推送，不用等全部分析完
  - 命令行参数：`--single-notify`
  - 环境变量：`SINGLE_STOCK_NOTIFY=true`
- 🔐 自定�?Webhook Bearer Token 认证（[#51](https://github.com/zhaowl1993/daily_stock_analysis/issues/51)�?  - 支持需�?Token 认证�?Webhook 端点
  - 环境变量：`CUSTOM_WEBHOOK_BEARER_TOKEN`

## [1.4.0] - 2026-01-17

### 新增
- 📱 Pushover 推送支持（PR #26�?  - 支持 iOS/Android 跨平台推�?  - 通过 `PUSHOVER_USER_KEY` �?`PUSHOVER_API_TOKEN` 配置
- 🔍 博查搜索 API 集成（PR #27�?  - 中文搜索优化，支�?AI 摘要
  - 通过 `BOCHA_API_KEYS` 配置
- 📊 Efinance 数据源支持（PR #59�?  - 新增 efinance 作为数据源选项
- 🇭🇰 港股支持（PR #17�?  - 支持 5 位代码或 HK 前缀（如 `hk00700`、`hk1810`�?
### 修复
- 🔧 飞书 Markdown 渲染优化（PR #34�?  - 使用交互卡片和格式化器修复渲染问�?- ♻️ 股票列表热重载（PR #42 修复�?  - 分析前自动重�?`STOCK_LIST` 配置
- 🐛 钉钉 Webhook 20KB 限制处理
  - 长消息自动分块发送，避免被截�?- 🔄 AkShare API 重试机制增强
  - 添加失败缓存，避免重复请求失败接�?
### 改进
- 📝 README 精简优化
  - 高级配置移至 `docs/full-guide.md`


## [1.3.0] - 2026-01-12

### 新增
- 🔗 自定�?Webhook 支持
  - 支持任意 POST JSON �?Webhook 端点
  - 自动识别钉钉、Discord、Slack、Bark 等常见服务格�?  - 支持配置多个 Webhook（逗号分隔�?  - 通过 `CUSTOM_WEBHOOK_URLS` 环境变量配置

### 修复
- 📝 企业微信长消息分批发�?  - 解决自选股过多时内容超�?4096 字符限制导致推送失败的问题
  - 智能按股票分析块分割，每批添加分页标记（�?1/3, 2/3�?  - 批次间隔 1 秒，避免触发频率限制

## [1.2.0] - 2026-01-11

### 新增
- 📢 多渠道推送支�?  - 企业微信 Webhook
  - 飞书 Webhook（新增）
  - 邮件 SMTP（新增）
  - 自动识别渠道类型，配置更简�?
### 改进
- 统一使用 `NOTIFICATION_URL` 配置，兼容旧�?`WECHAT_WEBHOOK_URL`
- 邮件支持 Markdown �?HTML 渲染

## [1.1.0] - 2026-01-11

### 新增
- 🤖 OpenAI 兼容 API 支持
  - 支持 DeepSeek、通义千问、Moonshot、智�?GLM �?  - Gemini �?OpenAI 格式二选一
  - 自动降级重试机制

## [1.0.0] - 2026-01-10

### 新增
- 🎯 AI 决策仪表盘分�?  - 一句话核心结论
  - 精确买入/止损/目标点位
  - 检查清单（✅⚠️❌�?  - 分持仓建议（空仓�?vs 持仓者）
- 📊 大盘复盘功能
  - 主要指数行情
  - 涨跌统计
  - 板块涨跌�?  - AI 生成复盘报告
- 🔍 多数据源支持
  - AkShare（主数据源，免费�?  - Tushare Pro
  - Baostock
  - YFinance
- 📰 新闻搜索服务
  - Tavily API
  - SerpAPI
- 💬 企业微信机器人推�?- �?定时任务调度
- 🐳 Docker 部署支持
- 🚀 GitHub Actions 零成本部�?
### 技术特�?- Gemini AI 模型（gemini-3-flash-preview�?- 429 限流自动重试 + 模型切换
- 请求间延时防封禁
- �?API Key 负载均衡
- SQLite 本地数据存储

---

[Unreleased]: https://github.com/zhaowl1993/daily_stock_analysis/compare/v2.3.0...HEAD
[2.3.0]: https://github.com/zhaowl1993/daily_stock_analysis/compare/v2.2.5...v2.3.0
[2.2.5]: https://github.com/zhaowl1993/daily_stock_analysis/compare/v2.2.4...v2.2.5
[2.2.4]: https://github.com/zhaowl1993/daily_stock_analysis/compare/v2.2.3...v2.2.4
[2.2.3]: https://github.com/zhaowl1993/daily_stock_analysis/compare/v2.2.2...v2.2.3
[2.2.2]: https://github.com/zhaowl1993/daily_stock_analysis/compare/v2.2.1...v2.2.2
[2.2.1]: https://github.com/zhaowl1993/daily_stock_analysis/compare/v2.2.0...v2.2.1
[2.2.0]: https://github.com/zhaowl1993/daily_stock_analysis/compare/v2.1.14...v2.2.0
[2.1.14]: https://github.com/zhaowl1993/daily_stock_analysis/compare/v2.1.13...v2.1.14
[2.1.13]: https://github.com/zhaowl1993/daily_stock_analysis/compare/v2.1.12...v2.1.13
[2.1.12]: https://github.com/zhaowl1993/daily_stock_analysis/compare/v2.1.11...v2.1.12
[2.1.11]: https://github.com/zhaowl1993/daily_stock_analysis/compare/v2.1.10...v2.1.11
[2.1.10]: https://github.com/zhaowl1993/daily_stock_analysis/compare/v2.1.9...v2.1.10
[2.1.9]: https://github.com/zhaowl1993/daily_stock_analysis/compare/v2.1.8...v2.1.9
[2.1.8]: https://github.com/zhaowl1993/daily_stock_analysis/compare/v2.1.7...v2.1.8
[2.1.7]: https://github.com/zhaowl1993/daily_stock_analysis/compare/v2.1.6...v2.1.7
[2.1.6]: https://github.com/zhaowl1993/daily_stock_analysis/compare/v2.1.5...v2.1.6
[2.1.5]: https://github.com/zhaowl1993/daily_stock_analysis/compare/v2.1.4...v2.1.5
[2.1.4]: https://github.com/zhaowl1993/daily_stock_analysis/compare/v2.1.3...v2.1.4
[2.1.3]: https://github.com/zhaowl1993/daily_stock_analysis/compare/v2.1.2...v2.1.3
[2.1.2]: https://github.com/zhaowl1993/daily_stock_analysis/compare/v2.1.1...v2.1.2
[2.1.1]: https://github.com/zhaowl1993/daily_stock_analysis/compare/v2.1.0...v2.1.1
[2.1.0]: https://github.com/zhaowl1993/daily_stock_analysis/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/zhaowl1993/daily_stock_analysis/compare/v1.6.0...v2.0.0
[1.6.0]: https://github.com/zhaowl1993/daily_stock_analysis/compare/v1.5.0...v1.6.0
[1.5.0]: https://github.com/zhaowl1993/daily_stock_analysis/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/zhaowl1993/daily_stock_analysis/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/zhaowl1993/daily_stock_analysis/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/zhaowl1993/daily_stock_analysis/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/zhaowl1993/daily_stock_analysis/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/zhaowl1993/daily_stock_analysis/releases/tag/v1.0.0
