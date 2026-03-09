#!/usr/bin/env node
/**
 * OpenClaw 场景报告生成器
 * 1. 每日独立报告 - reports/YYYY-MM-DD.html (只包含当天场景)
 * 2. 汇总索引页 - reports/index.html (列出所有日报链接)
 */

const fs = require('fs');
const path = require('path');

const REPORTS_DIR = '/Users/wzi/proj/openclaw-usecases/reports';
const DAILY_LOGS_DIR = '/Users/wzi/proj/openclaw-usecases/daily-logs';

// 生成每日独立报告
function generateDailyReport(rawData, date) {
  const scenarios = rawData.extractedScenarios || rawData.scenarios || [];
  
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OpenClaw 场景日报 - ${date}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 40px 20px;
      line-height: 1.6;
    }
    .container { max-width: 1000px; margin: 0 auto; }
    .header {
      background: rgba(255,255,255,0.98);
      padding: 40px 30px;
      border-radius: 20px;
      margin-bottom: 30px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      text-align: center;
    }
    .header h1 {
      font-size: 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 10px;
    }
    .header .meta {
      display: flex;
      justify-content: center;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 15px;
    }
    .header .meta-item {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
    }
    .nav-links {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin-bottom: 20px;
    }
    .nav-links a {
      color: #667eea;
      text-decoration: none;
      padding: 8px 16px;
      border: 2px solid #667eea;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.2s;
    }
    .nav-links a:hover {
      background: #667eea;
      color: #fff;
    }
    .scenario-card {
      background: rgba(255,255,255,0.95);
      border-radius: 16px;
      padding: 25px;
      margin-bottom: 20px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      transition: all 0.3s;
    }
    .scenario-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 15px 50px rgba(102,126,234,0.3);
    }
    .scenario-card h2 {
      font-size: 20px;
      color: #667eea;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .scenario-card .meta {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 15px;
    }
    .scenario-card .tag {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }
    .scenario-card .tag.source {
      background: #f0f0f0;
      color: #666;
    }
    .scenario-card .summary {
      line-height: 1.8;
      color: #333;
      font-size: 14px;
      background: #fafafa;
      padding: 15px;
      border-radius: 10px;
      border-left: 3px solid #667eea;
      white-space: pre-line;
    }
    .scenario-card .url {
      display: inline-block;
      margin-top: 15px;
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      padding: 8px 16px;
      border: 2px solid #667eea;
      border-radius: 20px;
      transition: all 0.2s;
    }
    .scenario-card .url:hover {
      background: #667eea;
      color: #fff;
    }
    .empty-state {
      background: rgba(255,255,255,0.95);
      padding: 60px 30px;
      border-radius: 20px;
      text-align: center;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    }
    .empty-state h2 { font-size: 24px; color: #667eea; margin-bottom: 10px; }
    .empty-state p { color: #666; font-size: 15px; }
    .footer {
      text-align: center;
      color: rgba(255,255,255,0.9);
      margin-top: 40px;
      padding: 20px;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="nav-links">
        <a href="index.html">📚 所有日报</a>
        <a href="https://github.com/tripleW1989/openclaw-usecases" target="_blank">🐙 GitHub</a>
      </div>
      <h1>🦞 OpenClaw 场景日报</h1>
      <p style="color: #666; margin-top: 10px;">每天自动收集 OpenClaw 实际应用案例</p>
      <div class="meta">
        <span class="meta-item">📅 ${date}</span>
        <span class="meta-item">🔍 新增 ${scenarios.length} 个场景</span>
      </div>
    </div>
    ${scenarios.length === 0 ? `
    <div class="empty-state">
      <h2>😴 今日暂无新场景</h2>
      <p>明天再来看看吧，AI 世界每天都在进步！</p>
    </div>
    ` : scenarios.map(s => `
    <div class="scenario-card">
      <h2><span>${s.icon || '📋'}</span> ${s.title}</h2>
      <div class="meta">
        <span class="tag">${s.category}</span>
        <span class="tag source">${s.source}</span>
      </div>
      <div class="summary">${s.summary || s.description}</div>
      <a href="${s.url}" target="_blank" class="url">🔗 阅读原文 →</a>
    </div>
    `).join('')}
    <div class="footer">
      <p>🤖 Generated by OpenClaw Auto Collector</p>
      <p><a href="index.html" style="color: #fff;">📚 查看所有日报 →</a></p>
    </div>
  </div>
</body>
</html>`;
  return html;
}

// 生成汇总索引页（列出所有日报）
function generateIndexPage(dailyReports) {
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OpenClaw 场景日报 - 汇总</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 40px 20px;
    }
    .container { max-width: 900px; margin: 0 auto; }
    .header {
      background: rgba(255,255,255,0.98);
      padding: 50px 40px;
      border-radius: 24px;
      margin-bottom: 30px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      text-align: center;
    }
    .header h1 {
      font-size: 42px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 15px;
    }
    .header .subtitle {
      font-size: 18px;
      color: #666;
      margin-bottom: 25px;
    }
    .header .meta {
      display: flex;
      justify-content: center;
      gap: 15px;
      flex-wrap: wrap;
    }
    .header .meta-item {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      padding: 10px 20px;
      border-radius: 25px;
      font-size: 15px;
      font-weight: 500;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }
    .stat-card {
      background: rgba(255,255,255,0.95);
      padding: 25px;
      border-radius: 20px;
      text-align: center;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    }
    .stat-value {
      font-size: 42px;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .stat-label {
      font-size: 14px;
      color: #666;
      margin-top: 8px;
    }
    .reports-section {
      background: rgba(255,255,255,0.95);
      padding: 40px;
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    }
    .reports-section h2 {
      font-size: 28px;
      color: #667eea;
      margin-bottom: 25px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .report-list {
      display: grid;
      gap: 15px;
    }
    .report-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 25px;
      background: #fafafa;
      border-radius: 16px;
      border: 2px solid transparent;
      transition: all 0.3s;
      text-decoration: none;
      color: inherit;
    }
    .report-item:hover {
      background: #fff;
      border-color: #667eea;
      transform: translateX(5px);
      box-shadow: 0 5px 20px rgba(102,126,234,0.2);
    }
    .report-item .date {
      font-size: 18px;
      font-weight: 700;
      color: #667eea;
    }
    .report-item .count {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
    }
    .report-item .arrow {
      font-size: 20px;
      color: #667eea;
      margin-left: 15px;
    }
    .footer {
      text-align: center;
      color: rgba(255,255,255,0.9);
      margin-top: 40px;
      padding: 30px;
      font-size: 15px;
    }
    .footer p { margin: 8px 0; }
    .external-links {
      display: flex;
      justify-content: center;
      gap: 15px;
      margin-top: 20px;
    }
    .external-links a {
      color: #fff;
      text-decoration: none;
      padding: 10px 20px;
      background: rgba(255,255,255,0.2);
      border-radius: 20px;
      font-size: 14px;
      transition: all 0.2s;
    }
    .external-links a:hover {
      background: rgba(255,255,255,0.3);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🦞 OpenClaw 场景日报汇总</h1>
      <p class="subtitle">每天自动收集 OpenClaw 实际应用案例和工作流</p>
      <div class="meta">
        <span class="meta-item">📊 共 ${dailyReports.length} 期日报</span>
        <span class="meta-item">📈 累计 ${dailyReports.reduce((sum, r) => sum + r.count, 0)} 个场景</span>
        <span class="meta-item">⏰ 更新：${new Date().toLocaleString('zh-CN')}</span>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${dailyReports.length}</div>
        <div class="stat-label">发布天数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${dailyReports.reduce((sum, r) => sum + r.count, 0)}</div>
        <div class="stat-label">场景总数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${dailyReports.length > 0 ? dailyReports[0].count : 0}</div>
        <div class="stat-label">最新一期</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${dailyReports.length > 0 ? Math.round(dailyReports.reduce((sum, r) => sum + r.count, 0) / dailyReports.length) : 0}</div>
        <div class="stat-label">日均场景</div>
      </div>
    </div>

    <div class="reports-section">
      <h2>📅 历史日报</h2>
      <div class="report-list">
        ${dailyReports.length === 0 ? '<p style="text-align:center;color:#666;padding:40px;">暂无日报，等待首次收集...</p>' : dailyReports.map(r => `
        <a href="${r.file}" class="report-item">
          <span class="date">${r.date} 日报</span>
          <div style="display:flex;align-items:center;gap:10px;">
            <span class="count">${r.count} 个场景</span>
            <span class="arrow">→</span>
          </div>
        </a>
        `).join('')}
      </div>
    </div>

    <div class="footer">
      <p>🤖 Generated by OpenClaw Auto Collector</p>
      <p>📊 数据来源于博查搜索 • 每日 22:00 自动更新</p>
      <div class="external-links">
        <a href="https://github.com/tripleW1989/openclaw-usecases" target="_blank">🐙 GitHub 仓库</a>
        <a href="https://github.com/tripleW1989/openclaw-usecases/actions" target="_blank">⚙️ 构建记录</a>
      </div>
    </div>
  </div>
</body>
</html>`;
  return html;
}

// Main
const today = process.argv[2] || new Date().toISOString().split('T')[0];
const rawFile = path.join(DAILY_LOGS_DIR, `${today}-raw.json`);

if (!fs.existsSync(rawFile)) {
  console.error(`❌ Raw data file not found: ${rawFile}`);
  process.exit(1);
}

const rawData = JSON.parse(fs.readFileSync(rawFile, 'utf-8'));
const dailyScenarios = rawData.extractedScenarios || rawData.scenarios || [];

// 1. 生成每日独立报告
const dailyHtml = generateDailyReport(rawData, today);
const dailyFile = path.join(REPORTS_DIR, `${today}.html`);
fs.writeFileSync(dailyFile, dailyHtml);
console.log(`✅ Daily report saved: ${dailyFile}`);

// 2. 收集所有日报信息，生成汇总索引页
const dailyReports = [];
const existingRawFiles = fs.readdirSync(DAILY_LOGS_DIR)
  .filter(f => f.match(/^\d{4}-\d{2}-\d{2}-raw\.json$/))
  .sort()
  .reverse();

existingRawFiles.forEach(f => {
  const date = f.replace('-raw.json', '');
  const dailyHtmlFile = path.join(REPORTS_DIR, `${date}.html`);
  if (fs.existsSync(dailyHtmlFile)) {
    const data = JSON.parse(fs.readFileSync(path.join(DAILY_LOGS_DIR, f), 'utf-8'));
    const count = (data.extractedScenarios || data.scenarios || []).length;
    dailyReports.push({ date, file: `${date}.html`, count });
  }
});

// 3. 生成汇总索引页
const indexHtml = generateIndexPage(dailyReports);
const indexFile = path.join(REPORTS_DIR, 'index.html');
fs.writeFileSync(indexFile, indexHtml);
console.log(`✅ Index page saved: ${indexFile}`);

const newCount = dailyScenarios.length;
const totalCount = dailyReports.reduce((sum, r) => sum + r.count, 0);

console.log(`\n📊 Summary:`);
console.log(`   今日：${today} - ${newCount} 个场景`);
console.log(`   累计：${dailyReports.length} 期 - ${totalCount} 个场景`);
console.log(`::OUTPUT::${JSON.stringify({
  dailyFile,
  indexFile,
  newCount,
  totalCount,
  totalDays: dailyReports.length,
  date: today
})}::END::`);
