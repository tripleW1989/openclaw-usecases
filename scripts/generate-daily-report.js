#!/usr/bin/env node
/**
 * OpenClaw 场景报告生成器
 * 1. 每日独立报告 - reports/YYYY-MM-DD.html (只包含当天场景)
 * 2. 总览汇总页 - reports/index.html (包含所有场景，按分类展示)
 * 3. 归档索引页 - reports/archive.html (列出所有日报链接)
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
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700;1,6..72,400;1,6..72,500&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --primary: #2563eb;
      --primary-light: #3b82f6;
      --cta: #f97316;
      --bg: #f8fafc;
      --card-bg: #ffffff;
      --text: #1e293b;
      --text-light: #64748b;
      --border: #e2e8f0;
      --shadow: rgba(0,0,0,0.06);
    }
    body {
      font-family: 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      padding: 40px 20px;
      line-height: 1.6;
    }
    .container { max-width: 1100px; margin: 0 auto; }
    .header {
      background: var(--card-bg);
      padding: 48px 40px;
      border-radius: 4px;
      margin-bottom: 32px;
      box-shadow: 0 1px 3px var(--shadow);
      text-align: center;
      border: 1px solid var(--border);
    }
    .header h1 {
      font-family: 'Newsreader', Georgia, serif;
      font-size: 42px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 8px;
      letter-spacing: -0.5px;
    }
    .header h1 span { color: var(--primary); }
    .header .date {
      font-size: 18px;
      color: var(--text-light);
      margin-bottom: 20px;
    }
    .header .meta {
      display: flex;
      justify-content: center;
      gap: 12px;
      flex-wrap: wrap;
      margin-top: 20px;
    }
    .header .meta-item {
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
      color: #fff;
      padding: 10px 20px;
      border-radius: 24px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 2px 8px rgba(37,99,235,0.3);
    }
    .nav-links {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-bottom: 32px;
      border-bottom: 2px solid var(--text);
      padding-bottom: 12px;
    }
    .nav-links a {
      color: var(--text);
      text-decoration: none;
      padding: 8px 16px;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
      border-radius: 2px;
    }
    .nav-links a:hover {
      color: var(--primary);
    }
    .scenario-card {
      background: var(--card-bg);
      border-radius: 2px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 1px 3px var(--shadow);
      transition: all 0.25s ease;
      border-left: 3px solid var(--primary);
    }
    .scenario-card:hover {
      box-shadow: 0 4px 12px var(--shadow);
      border-left-color: var(--cta);
    }
    .scenario-card h2 {
      font-family: 'Newsreader', Georgia, serif;
      font-size: 22px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 600;
    }
    .scenario-card h2::before {
      content: "✦";
      color: var(--primary);
      font-size: 14px;
    }
    .scenario-card .meta {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 16px;
    }
    .scenario-card .tag {
      background: transparent;
      color: var(--text-light);
      padding: 4px 12px;
      border: 1px solid var(--border);
      border-radius: 2px;
      font-size: 12px;
      font-weight: 400;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .scenario-card .tag.source {
      background: transparent;
      border-color: var(--primary);
      color: var(--primary);
    }
    .scenario-card .summary {
      line-height: 1.8;
      color: var(--text);
      font-size: 15px;
      padding: 16px 0;
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      white-space: pre-line;
    }
    .scenario-card .url {
      display: inline-block;
      margin-top: 12px;
      color: var(--cta);
      text-decoration: none;
      font-weight: 500;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-size: 14px;
      padding: 8px 16px;
      border: 1px solid var(--primary);
      border-radius: 20px;
      transition: all 0.2s;
    }
    .scenario-card .url:hover {
      background: var(--primary);
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
        <a href="index.html">📊 总览汇总</a>
        <a href="archive.html">📚 归档索引</a>
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
      <p><a href="index.html" style="color: #fff;">📊 查看所有场景 →</a></p>
    </div>
  </div>
</body>
</html>`;
  return html;
}

// 生成总览汇总页（包含所有场景，按分类展示）
function generateOverviewPage(allScenarios) {
  const byCategory = {};
  allScenarios.forEach(s => {
    const cat = s.category || '其他';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(s);
  });
  
  const categories = Object.keys(byCategory).sort();
  const totalScenarios = allScenarios.length;
  const totalCategories = categories.length;
  
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OpenClaw 可落地场景汇总</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700;1,6..72,400;1,6..72,500&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --primary: #2563eb;
      --primary-light: #3b82f6;
      --cta: #f97316;
      --bg: #f8fafc;
      --card-bg: #ffffff;
      --text: #1e293b;
      --text-light: #64748b;
      --border: #e2e8f0;
      --shadow: rgba(0,0,0,0.06);
    }
    body {
      font-family: 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      padding: 40px 20px;
      line-height: 1.6;
    }
    .container { max-width: 1100px; margin: 0 auto; }
    .header {
      background: var(--card-bg);
      padding: 48px 40px;
      border-radius: 4px;
      margin-bottom: 32px;
      box-shadow: 0 1px 3px var(--shadow);
      text-align: center;
      border: 1px solid var(--border);
    }
    .header h1 {
      font-family: 'Newsreader', Georgia, serif;
      font-size: 42px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 8px;
    }
    .header h1 span { color: var(--primary); }
    .header .subtitle {
      font-size: 16px;
      color: var(--text-light);
      margin-bottom: 25px;
    }
    .header .meta {
      display: flex;
      justify-content: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .header .meta-item {
      background: var(--primary);
      color: #fff;
      padding: 8px 16px;
      border-radius: 2px;
      font-size: 13px;
      font-weight: 500;
    }
    .nav-links {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-bottom: 24px;
      border-bottom: 2px solid var(--text);
      padding-bottom: 12px;
    }
    .nav-links a {
      color: var(--text);
      text-decoration: none;
      padding: 8px 16px;
      font-size: 14px;
      font-weight: 500;
    }
    .nav-links a:hover { color: var(--primary); }
    
    /* Tab 样式 */
    .tabs {
      display: flex;
      gap: 0;
      margin-bottom: 32px;
      border-bottom: 2px solid var(--border);
      overflow-x: auto;
    }
    .tab {
      padding: 12px 24px;
      cursor: pointer;
      border: none;
      background: none;
      font-size: 14px;
      font-weight: 500;
      color: var(--text-light);
      border-bottom: 2px solid transparent;
      margin-bottom: -2px;
      white-space: nowrap;
    }
    .tab:hover { color: var(--primary); }
    .tab.active {
      color: var(--primary);
      border-bottom-color: var(--primary);
    }
    .tab-content { display: none; }
    .tab-content.active { display: block; }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }
    .stat-card {
      background: var(--card-bg);
      padding: 24px;
      border-radius: 2px;
      text-align: center;
      border: 1px solid var(--border);
    }
    .stat-value {
      font-family: 'Newsreader', Georgia, serif;
      font-size: 36px;
      font-weight: 600;
      color: var(--text);
    }
    .stat-label {
      font-size: 13px;
      color: var(--text-light);
      margin-top: 8px;
    }
    .category-section {
      background: var(--card-bg);
      padding: 24px;
      border-radius: 2px;
      margin-bottom: 24px;
      box-shadow: 0 1px 3px var(--shadow);
      border: 1px solid var(--border);
    }
    .category-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border);
    }
    .category-header h2 {
      font-family: 'Newsreader', Georgia, serif;
      font-size: 22px;
      color: var(--text);
    }
    .category-header .count {
      background: var(--primary);
      color: #fff;
      padding: 4px 10px;
      border-radius: 2px;
      font-size: 12px;
    }
    
    /* 网格布局 - 2列 */
    .scenario-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
    @media (max-width: 768px) {
      .scenario-grid { grid-template-columns: 1fr; }
    }
    .scenario-card {
      border: 1px solid var(--border);
      border-radius: 2px;
      padding: 16px;
      transition: all 0.2s;
      background: #fff;
    }
    .scenario-card:hover {
      box-shadow: 0 4px 12px var(--shadow);
      border-color: var(--primary-light);
    }
    .scenario-card h3 {
      font-size: 16px;
      color: var(--text);
      margin-bottom: 8px;
      font-weight: 600;
    }
    .scenario-card .meta {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 10px;
    }
    .scenario-card .tag {
      background: transparent;
      color: var(--text-light);
      padding: 2px 8px;
      border: 1px solid var(--border);
      border-radius: 2px;
      font-size: 11px;
      text-transform: uppercase;
    }
    .scenario-card .tag.source { border-color: var(--primary); color: var(--primary); }
    .scenario-card .summary {
      line-height: 1.6;
      color: var(--text);
      font-size: 13px;
      padding-top: 10px;
      border-top: 1px solid var(--border);
    }
    .footer {
      text-align: center;
      color: var(--text-light);
      margin-top: 40px;
      padding: 24px;
      font-size: 13px;
    }
    .toc {
      background: var(--card-bg);
      padding: 24px;
      border-radius: 2px;
      margin-bottom: 24px;
      border: 1px solid var(--border);
    }
    .toc h2 {
      font-size: 18px;
      color: var(--text);
      margin-bottom: 16px;
    }
    .toc-links {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .toc-links a {
      background: transparent;
      color: var(--primary);
      padding: 4px 12px;
      border: 1px solid var(--border);
      border-radius: 2px;
      text-decoration: none;
      font-size: 12px;
    }
    .toc-links a:hover { border-color: var(--primary); }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="nav-links">
        <a href="archive.html">📚 归档索引</a>
        <a href="https://github.com/tripleW1989/openclaw-usecases" target="_blank">🐙 GitHub</a>
      </div>
      <h1>🦞 OpenClaw 可落地场景汇总</h1>
      <p class="subtitle">每天自动收集 OpenClaw 实际应用案例和工作流，帮你发现 AI 助手的无限可能</p>
      <div class="meta">
        <span class="meta-item">📊 总场景数：${totalScenarios}</span>
        <span class="meta-item">📂 分类数：${totalCategories}</span>
        <span class="meta-item">⏰ 更新：${new Date().toLocaleString('zh-CN')}</span>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${totalScenarios}</div>
        <div class="stat-label">总场景数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${totalCategories}</div>
        <div class="stat-label">场景分类</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${allScenarios.filter(s => s.source).length}</div>
        <div class="stat-label">信息来源</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${new Set(allScenarios.map(s => s.source)).size}</div>
        <div class="stat-label">唯一来源</div>
      </div>
    </div>

    <!-- Tab 导航 -->
    <div class="tabs">
      <button class="tab active" data-tab="all">全部 ${totalScenarios}</button>
      ${categories.map(cat => `<button class="tab" data-tab="${encodeURIComponent(cat)}">${cat} (${byCategory[cat].length})</button>`).join('')}
    </div>

    <!-- Tab 内容 -->
    <div class="tab-content active" id="tab-all">
      <div class="scenario-grid">
        ${allScenarios.map(s => `
        <div class="scenario-card">
          <h3>${s.title}</h3>
          <div class="meta">
            <span class="tag">${s.category}</span>
            <span class="tag source">${s.source}</span>
          </div>
          <div class="summary">${(s.summary || s.description || '').substring(0, 100)}...</div>
        </div>
        `).join('')}
      </div>
    </div>

    ${categories.map(cat => `
    <div class="tab-content" id="tab-${encodeURIComponent(cat)}">
      <div class="scenario-grid">
        ${byCategory[cat].map(s => `
        <div class="scenario-card">
          <h3>${s.title}</h3>
          <div class="meta">
            <span class="tag">${s.category}</span>
            <span class="tag source">${s.source}</span>
          </div>
          <div class="summary">${(s.summary || s.description || '').substring(0, 100)}...</div>
        </div>
        `).join('')}
      </div>
    </div>
    `).join('')}

    <script>
      document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
          document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
          document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
          tab.classList.add('active');
          const tabId = 'tab-' + encodeURIComponent(tab.dataset.tab);
          document.getElementById(tabId).classList.add('active');
        });
      });
    </script>

    <div class="footer">
      <p>🤖 Generated by OpenClaw Auto Collector</p>
      <p>📊 数据来源于博查搜索 • 每日 22:00 自动更新</p>
      <p>⏰ 最后更新：${new Date().toLocaleString('zh-CN')}</p>
    </div>
  </div>
</body>
</html>`;
  return html;
}

function getCategoryIcon(category) {
  const icons = {
    'CRM 客户管理': '💼',
    '工作流自动化': '⚙️',
    '知识管理': '🧠',
    '信息聚合': '📰',
    '内容创作': '✍️',
    '金融投资': '💰',
    '企业办公': '🏢',
    '社交通讯': '💬',
    '营销获客': '📈',
    '安全审查': '🔒',
    'AI 专家团': '🧑‍💼',
    '日程管理': '📅',
    '新媒体': '📱',
    '电商零售': '🛒',
    '教育培训': '📚',
    '医疗健康': '🏥',
  };
  return icons[category] || '📋';
}

// 生成归档索引页（列出所有日报）
function generateArchivePage(dailyReports) {
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
      <div class="nav-links">
        <a href="index.html">📊 总览汇总</a>
        <a href="https://github.com/tripleW1989/openclaw-usecases" target="_blank">🐙 GitHub</a>
      </div>
      <h1>📚 OpenClaw 场景日报归档</h1>
      <p style="color: #666; margin-top: 10px;">历史日报索引</p>
    </div>
    <div class="archive-list">
      ${dailyReports.length === 0 ? '<p style="text-align:center;color:#666;">暂无归档</p>' : dailyReports.map(d => `
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
const dailyScenarios = rawData.extractedScenarios || rawData.scenarios || [];

// 1. 生成每日独立报告
const dailyHtml = generateDailyReport(rawData, today);
const dailyFile = path.join(REPORTS_DIR, `${today}.html`);
fs.writeFileSync(dailyFile, dailyHtml);
console.log(`✅ Daily report saved: ${dailyFile}`);

// 2. 加载所有历史数据
const allScenarios = [];
const dailyReports = [];

const existingRawFiles = fs.readdirSync(DAILY_LOGS_DIR)
  .filter(f => f.match(/^\d{4}-\d{2}-\d{2}-raw\.json$/))
  .sort()
  .reverse();

existingRawFiles.forEach(f => {
  const date = f.replace('-raw.json', '');
  const data = JSON.parse(fs.readFileSync(path.join(DAILY_LOGS_DIR, f), 'utf-8'));
  const scenarios = data.extractedScenarios || data.scenarios || [];
  scenarios.forEach(s => {
    s.collectDate = date;
    allScenarios.push(s);
  });
  
  const dailyHtmlFile = path.join(REPORTS_DIR, `${date}.html`);
  if (fs.existsSync(dailyHtmlFile)) {
    dailyReports.push({ date, file: `${date}.html`, count: scenarios.length });
  }
});

// 3. 生成总览汇总页 (index.html)
const overviewHtml = generateOverviewPage(allScenarios);
const overviewFile = path.join(REPORTS_DIR, 'index.html');
fs.writeFileSync(overviewFile, overviewHtml);
console.log(`✅ Overview page saved: ${overviewFile}`);

// 4. 生成归档索引页 (archive.html)
const archiveHtml = generateArchivePage(dailyReports);
const archiveFile = path.join(REPORTS_DIR, 'archive.html');
fs.writeFileSync(archiveFile, archiveHtml);
console.log(`✅ Archive page saved: ${archiveFile}`);

const newCount = dailyScenarios.length;
const totalCount = allScenarios.length;

console.log(`\n📊 Summary:`);
console.log(`   今日：${today} - ${newCount} 个场景`);
console.log(`   累计：${totalCount} 个场景 / ${dailyReports.length} 期日报`);
console.log(`::OUTPUT::${JSON.stringify({
  dailyFile,
  overviewFile,
  archiveFile,
  newCount,
  totalCount,
  totalDays: dailyReports.length,
  date: today
})}::END::`);
