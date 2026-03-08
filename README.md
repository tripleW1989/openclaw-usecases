# 🦞 OpenClaw 可落地场景日报

每天自动收集 OpenClaw 实际应用案例和工作流，帮你发现 AI 助手的无限可能。

## 📊 项目说明

本项目通过自动化脚本，每天搜索并整理 OpenClaw 的实际应用场景，生成详细的 HTML 报告。

### 核心功能

- 🔍 **自动搜索** - 使用博查搜索 MCP 收集全网信息
- 📝 **详细报告** - 生成美观的 HTML 日报，包含完整场景描述
- 📅 **每日更新** - 定时任务自动执行，保持内容最新
- 🌐 **在线查看** - 通过 GitHub Pages 随时随地访问

## 📁 目录结构

```
openclaw-usecases/
├── reports/              # HTML 报告
│   └── index.html       # 主页（最新报告）
├── daily-logs/          # 每日日志
│   ├── YYYY-MM-DD.html  # 每日 HTML 报告
│   └── YYYY-MM-DD-raw.json  # 原始数据
├── scripts/             # 脚本
│   ├── collect-daily.sh # Bash 收集脚本
│   └── generate-report.js # Node.js 报告生成器
└── README.md            # 项目说明
```

## 🚀 使用方式

### 手动运行

```bash
# 运行收集脚本
node scripts/generate-report.js

# 或使用 Bash 版本
bash scripts/collect-daily.sh
```

### 自动执行（Cron）

编辑 crontab：
```bash
crontab -e
```

添加以下任务（每天晚上 10 点执行）：
```cron
0 22 * * * cd /Users/wzi/proj/openclaw-usecases && node scripts/generate-report.js && git add -A && git commit -m "Daily update: $(date +\%Y-\%m-\%d)" && git push
```

## 📋 场景分类

当前收集的场景包括但不限于：

| 分类 | 说明 | 示例 |
|------|------|------|
| 💼 CRM 客户管理 | 自动整理联系人、邮件、会议记录 | 自然语言 CRM |
| ✅ 工作流自动化 | 会议行动项追踪、任务管理 | 自动提取行动项 |
| 🧠 知识管理 | 第二大脑、信息保存与检索 | 随时保存灵感 |
| 📰 信息聚合 | 定制简报、新闻监控 | 早间简报 |
| 📱 内容创作 | 新媒体运营、视频选题 | 热点追踪 + 文案生成 |
| 🔒 安全审查 | 文档审查、合规检查 | 自动风险识别 |
| 📅 日程管理 | 日历管理、智能提醒 | 会议自动安排 |
| 🍽️ 健康管理 | 饮食记录、营养分析 | 食物日记 |

## 📊 数据来源

- 博查搜索 MCP（钉钉）
- 全网公开信息
- 技术社区分享
- 用户实践案例

## 🔗 在线查看

通过 GitHub Pages 访问最新报告：

```
https://<你的 GitHub 用户名>.github.io/openclaw-usecases/
```

## 📈 统计信息

<!-- 这里可以放一些统计数据 -->

- 总场景数：10+
- 场景分类：8+
- 信息来源：7+
- 更新频率：每日

## 🤝 贡献

欢迎提交 PR 分享你的 OpenClaw 使用场景！

## 📄 License

MIT

---

**最后更新**: 2026-03-08  
**维护者**: OpenClaw Auto Collector
