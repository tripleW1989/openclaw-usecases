#!/usr/bin/env node
/**
 * OpenClaw 场景收集 - HTML 生成器
 * 生成详细的 HTML 报告，展示 OpenClaw 可落地场景
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DATE = new Date().toISOString().split('T')[0];
const TIMESTAMP = new Date().toLocaleString('zh-CN');

// 搜索关键词
const KEYWORDS = [
  'OpenClaw 实际应用场景',
  'OpenClaw use cases',
  'OpenClaw 工作流 workflow',
  'OpenClaw 自动化场景',
  'OpenClaw AI agent 用例',
  'OpenClaw 一人公司',
  'OpenClaw 新媒体 内容创作',
  'OpenClaw CRM 客户管理'
];

console.log(`🦞 OpenClaw 场景收集 - ${DATE}`);
console.log('================================\n');

// 存储所有搜索结果
let allScenarios = [];

// 搜索并收集
KEYWORDS.forEach((keyword, index) => {
  console.log(`📊 搜索 [${index + 1}/${KEYWORDS.length}]: ${keyword}`);
  
  try {
    const result = execSync(
      `mcporter call "博查搜索.web_search" query:"${keyword}" count:10 summary:true 2>&1`,
      { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
    );
    
    // 简单解析 JSON（实际应该用更健壮的解析）
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      if (data.result?.webPages?.value) {
        const scenarios = data.result.webPages.value.map(item => ({
          name: item.name || '无标题',
          url: item.url || '#',
          snippet: item.snippet || '',
          summary: item.summary || '',
          siteName: item.siteName || '未知来源',
          datePublished: item.datePublished ? new Date(item.datePublished).toLocaleDateString('zh-CN') : '未知',
          category: keyword
        }));
        
        allScenarios.push(...scenarios);
        console.log(`  ✓ 找到 ${scenarios.length} 条结果`);
      }
    }
  } catch (error) {
    console.log(`  ✗ 搜索失败：${error.message}`);
  }
});

console.log(`\n📝 共收集 ${allScenarios.length} 条场景`);

// 去重（基于 URL）
const uniqueScenarios = allScenarios.filter((v, i, a) => 
  a.findIndex(t => t.url === v.url) === i
);

console.log(`📝 去重后 ${uniqueScenarios.length} 条场景\n`);

// 生成 HTML
const html = generateHTML(uniqueScenarios);

// 保存文件
const reportsDir = path.join(__dirname, '..', 'reports');
const dailyDir = path.join(__dirname, '..', 'daily-logs');

if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
if (!fs.existsSync(dailyDir)) fs.mkdirSync(dailyDir, { recursive: true });

const indexPath = path.join(reportsDir, 'index.html');
const dailyPath = path.join(dailyDir, `${DATE}.html`);

fs.writeFileSync(indexPath, html);
fs.writeFileSync(dailyPath, html);

// 保存原始数据
const rawData = {
  date: DATE,
  timestamp: TIMESTAMP,
  keywords: KEYWORDS,
  totalFound: allScenarios.length,
  uniqueCount: uniqueScenarios.length,
  scenarios: uniqueScenarios
};

fs.writeFileSync(
  path.join(dailyDir, `${DATE}-raw.json`),
  JSON.stringify(rawData, null, 2)
);

console.log('✅ 报告生成完成:');
console.log(`   📄 主页：${indexPath}`);
console.log(`   📄 日报：${dailyPath}`);
console.log(`   📊 数据：${path.join(dailyDir, `${DATE}-raw.json`)}`);
console.log('');

/**
 * 生成 HTML 报告
 */
function generateHTML(scenarios) {
  const scenariosHTML = scenarios.map((scenario, index) => `
    <div class="scenario-card">
      <h2>
        <span class="icon">${getCategoryIcon(scenario.category)}</span>
        <span>${escapeHtml(scenario.name)}</span>
      </h2>
      <div class="meta">
        <span class="tag">${escapeHtml(scenario.category)}</span>
        <span class="tag source">📰 ${escapeHtml(scenario.siteName)}</span>
        <span class="tag">📅 ${scenario.datePublished}</span>
      </div>
      <div class="summary">
        ${formatSummary(scenario.summary || scenario.snippet)}
      </div>
      <a href="${escapeHtml(scenario.url)}" target="_blank" class="url">
        🔗 阅读原文 →
      </a>
    </div>
  `).join('\n');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OpenClaw 可落地场景日报 - ${DATE}</title>
  <style>${getCSS()}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🦞 OpenClaw 可落地场景日报</h1>
      <p class="subtitle">每天自动收集 OpenClaw 实际应用案例和工作流，帮你发现 AI 助手的无限可能</p>
      <div class="meta">
        <span class="meta-item">📅 更新日期：${DATE}</span>
        <span class="meta-item">🔍 场景数量：${scenarios.length}</span>
        <span class="meta-item">⏰ 更新时间：${TIMESTAMP}</span>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${scenarios.length}</div>
        <div class="stat-label">总场景数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${getUniqueCategories(scenarios).length}</div>
        <div class="stat-label">场景分类</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${getUniqueSources(scenarios).length}</div>
        <div class="stat-label">信息来源</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${getTodayCount(scenarios)}</div>
        <div class="stat-label">今日新增</div>
      </div>
    </div>

    <div class="categories">
      <h2 class="section-title">📂 场景分类</h2>
      <div class="category-tags">
        ${getUniqueCategories(scenarios).map(cat => 
          `<span class="category-tag">${escapeHtml(cat.replace('OpenClaw', '').trim())}</span>`
        ).join('')}
      </div>
    </div>

    <div class="scenarios">
      <h2 class="section-title">📋 详细场景列表</h2>
      ${scenariosHTML}
    </div>

    <div class="footer">
      <p>🤖 Generated by OpenClaw Auto Collector</p>
      <p>📊 数据来源于博查搜索 • 每日自动更新</p>
      <p>⏰ 最后更新：${TIMESTAMP}</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * 获取 CSS 样式
 */
function getCSS() {
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 40px 20px;
      line-height: 1.6;
    }
    .container { max-width: 1400px; margin: 0 auto; }
    
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
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }
    .stat-card {
      background: rgba(255,255,255,0.95);
      padding: 30px;
      border-radius: 20px;
      text-align: center;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    }
    .stat-value {
      font-size: 48px;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .stat-label {
      font-size: 15px;
      color: #666;
      margin-top: 10px;
    }
    
    .categories {
      background: rgba(255,255,255,0.95);
      padding: 30px 40px;
      border-radius: 20px;
      margin-bottom: 30px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    }
    .section-title {
      font-size: 28px;
      color: #667eea;
      margin-bottom: 20px;
    }
    .category-tags {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    .category-tag {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
    }
    
    .scenarios {
      background: rgba(255,255,255,0.95);
      padding: 30px 40px;
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    }
    .scenario-card {
      border: 1px solid #e0e0e0;
      border-radius: 16px;
      padding: 25px;
      margin-bottom: 20px;
      transition: all 0.3s;
    }
    .scenario-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 30px rgba(102,126,234,0.2);
      border-color: #667eea;
    }
    .scenario-card h2 {
      font-size: 22px;
      color: #667eea;
      margin-bottom: 15px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    .scenario-card h2 .icon {
      font-size: 28px;
    }
    .scenario-card .meta {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 18px;
    }
    .scenario-card .tag {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      padding: 5px 14px;
      border-radius: 15px;
      font-size: 13px;
      font-weight: 500;
    }
    .scenario-card .tag.source {
      background: #f0f0f0;
      color: #666;
    }
    .scenario-card .summary {
      line-height: 1.9;
      color: #333;
      font-size: 15px;
      background: #fafafa;
      padding: 18px;
      border-radius: 12px;
      border-left: 4px solid #667eea;
    }
    .scenario-card .url {
      display: inline-block;
      margin-top: 18px;
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
      font-size: 15px;
      padding: 10px 20px;
      border: 2px solid #667eea;
      border-radius: 25px;
      transition: all 0.2s;
    }
    .scenario-card .url:hover {
      background: #667eea;
      color: #fff;
    }
    
    .footer {
      text-align: center;
      color: rgba(255,255,255,0.9);
      margin-top: 50px;
      padding: 30px;
      font-size: 15px;
    }
    .footer p { margin: 8px 0; }
    
    @media (max-width: 768px) {
      body { padding: 20px 10px; }
      .header { padding: 30px 20px; }
      .header h1 { font-size: 28px; }
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .scenarios, .categories { padding: 20px; }
    }
  `;
}

// 工具函数
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatSummary(text) {
  if (!text) return '';
  // 处理换行
  return text
    .split('\n')
    .filter(line => line.trim())
    .map(line => `<p>${escapeHtml(line.trim())}</p>`)
    .join('');
}

function getCategoryIcon(category) {
  const icons = {
    'CRM': '💼',
    '工作流': '⚙️',
    '自动化': '🤖',
    '新媒体': '📱',
    '内容创作': '✍️',
    '一人公司': '👤',
    'AI agent': '🧠',
    'use cases': '📋',
    '应用场景': '🎯'
  };
  
  for (const [key, icon] of Object.entries(icons)) {
    if (category.includes(key)) return icon;
  }
  return '📌';
}

function getUniqueCategories(scenarios) {
  return [...new Set(scenarios.map(s => s.category))];
}

function getUniqueSources(scenarios) {
  return [...new Set(scenarios.map(s => s.siteName))];
}

function getTodayCount(scenarios) {
  const today = new Date().toLocaleDateString('zh-CN');
  return scenarios.filter(s => s.datePublished === today).length;
}
