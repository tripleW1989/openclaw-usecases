#!/usr/bin/env node
/**
 * OpenClaw 每日场景报告生成器
 * 生成只包含当天收集场景的简洁 HTML 报告
 */

const fs = require('fs');
const path = require('path');

const REPORTS_DIR = '/Users/wzi/proj/openclaw-usecases/reports';
const DAILY_LOGS_DIR = '/Users/wzi/proj/openclaw-usecases/daily-logs';

function generateDailyReport(rawData, date) {
  // Support both 'scenarios' and 'extractedScenarios' field names
  const scenarios = rawData.extractedScenarios || rawData.scenarios || [];
  const collectDate = rawData.collectDate || date;
  
  // Use all scenarios from the raw data (they were collected on this date)
  const dailyScenarios = scenarios;
  
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
      <h1>🦞 OpenClaw 场景日报</h1>
      <p style="color: #666; margin-top: 10px;">每天自动收集 OpenClaw 实际应用案例</p>
      <div class="meta">
        <span class="meta-item">📅 ${date}</span>
        <span class="meta-item">🔍 新增 ${dailyScenarios.length} 个场景</span>
        <span class="meta-item">⏰ ${new Date().toLocaleTimeString('zh-CN', {hour: '2-digit', minute:'2-digit'})}</span>
      </div>
    </div>
    ${dailyScenarios.length === 0 ? `
    <div class="empty-state">
      <h2>😴 今日暂无新场景</h2>
      <p>明天再来看看吧，AI 世界每天都在进步！</p>
    </div>
    ` : dailyScenarios.map(s => `
    <div class="scenario-card">
      <h2><span>${s.icon || '📋'}</span> ${s.title}</h2>
      <div class="meta">
        <span class="tag">${s.category}</span>
        <span class="tag source">${s.source}</span>
      </div>
      <div class="summary">${s.summary}</div>
      <a href="${s.url}" target="_blank" class="url">🔗 阅读原文 →</a>
    </div>
    `).join('')}
    <div class="footer">
      <p>🤖 Generated by OpenClaw Auto Collector</p>
      <p>📊 数据来源于博查搜索 • 每日自动更新</p>
    </div>
  </div>
</body>
</html>`;
  return html;
}

function updateIndex(allDates) {
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>OpenClaw 场景日报 - 归档</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 40px 20px;
    }
    .container { max-width: 800px; margin: 0 auto; }
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
    }
    .archive-list {
      background: rgba(255,255,255,0.95);
      padding: 30px;
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    }
    .archive-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 20px;
      border-bottom: 1px solid #eee;
      transition: all 0.2s;
    }
    .archive-item:hover { background: #f5f5f5; padding-left: 25px; }
    .archive-item:last-child { border-bottom: none; }
    .archive-item a {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
      font-size: 16px;
    }
    .archive-item .count {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
    }
    .footer {
      text-align: center;
      color: rgba(255,255,255,0.9);
      margin-top: 30px;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📚 OpenClaw 场景日报归档</h1>
      <p style="color: #666; margin-top: 10px;">历史日报索引</p>
    </div>
    <div class="archive-list">
      ${allDates.length === 0 ? '<p style="text-align:center;color:#666;">暂无归档</p>' : allDates.map(d => `
      <div class="archive-item">
        <a href="${d.file}">${d.date} 日报</a>
        <span class="count">${d.count} 个场景</span>
      </div>
      `).join('')}
    </div>
    <div class="footer"><p>🤖 Generated by OpenClaw Auto Collector</p></div>
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
const dailyHtml = generateDailyReport(rawData, today);

const dailyFile = path.join(REPORTS_DIR, `${today}.html`);
fs.writeFileSync(dailyFile, dailyHtml);
console.log(`✅ Daily report saved: ${dailyFile}`);

// Update index
const existingFiles = fs.readdirSync(REPORTS_DIR)
  .filter(f => f.match(/^\d{4}-\d{2}-\d{2}\.html$/))
  .sort()
  .reverse();

const allDates = existingFiles.map(f => {
  const date = f.replace('.html', '');
  const content = fs.readFileSync(path.join(REPORTS_DIR, f), 'utf-8');
  const match = content.match(/新增 (\d+) 个场景/);
  return { date, file: f, count: match ? match[1] : 0 };
});

const indexHtml = updateIndex(allDates);
fs.writeFileSync(path.join(REPORTS_DIR, 'index.html'), indexHtml);
console.log(`✅ Index updated: ${path.join(REPORTS_DIR, 'index.html')}`);

// Support both field names
const newCount = (rawData.extractedScenarios || rawData.scenarios || []).length;
console.log(`\n📊 Summary: ${today} - ${newCount} new scenarios`);
console.log(`::OUTPUT::${JSON.stringify({dailyFile, indexFile: path.join(REPORTS_DIR, 'index.html'), newCount, date: today})}::END::`);
