const fs = require('fs');
const path = require('path');

// Helper to read JSON safely
function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    return null;
  }
}

// Helper to extract thresholds from config files using regex
// (Simpler than importing the TS files which would require transpilation in the runner)
function extractThresholds(configPath) {
  try {
    const content = fs.readFileSync(configPath, 'utf8');

    // We look for a pattern like:
    // thresholds: { lines: 0, functions: 0, ... }
    // or coverageThreshold: { global: { branches: 10, ... } }

    const linesMatch = content.match(/(?:lines|statements|functions|branches)['"]?\s*:\s*(\d+(\.\d+)?)/g);

    const thresholds = { lines: 0, statements: 0, functions: 0, branches: 0 };

    if (linesMatch) {
      linesMatch.forEach(match => {
        const [key, value] = match.split(':').map(s => s.trim().replace(/['"]/g, ''));
        if (thresholds.hasOwnProperty(key)) {
          thresholds[key] = parseFloat(value);
        }
      });
    }

    return thresholds;
  } catch (e) {
    console.error(`Error reading config at ${configPath}:`, e);
    return { lines: 0, statements: 0, functions: 0, branches: 0 };
  }
}

// Generate the message for a single app
function generateAppReport(appName, summaryPath, configPath) {
  const summary = readJson(summaryPath);
  if (!summary || !summary.total) {
    return { report: `### ${appName}\n\n❌ No coverage data found (Tests likely failed).`, improved: false, failed: true };
  }

  const total = summary.total;
  const thresholds = extractThresholds(configPath);
  const metrics = ['lines', 'statements', 'functions', 'branches'];

  let report = `### ${appName} Coverage\n\n`;
  report += `| Metric | Current | Minimum | Status |\n`;
  report += `| :--- | :---: | :---: | :--- |\n`;

  let improved = false;
  let failed = false;

  metrics.forEach(metric => {
    const current = total[metric].pct;
    const min = thresholds[metric];

    let icon = '✅';
    let statusText = 'Stable';

    if (current < min) {
      icon = '❌';
      statusText = `**Failed** (< ${min}%)`;
      failed = true;
    } else if (Math.floor(current) > min) {
      icon = '🎉';
      statusText = `**Improved** (> ${min}%)`;
      improved = true;
    }

    report += `| ${metric.charAt(0).toUpperCase() + metric.slice(1)} | ${current}% | ${min}% | ${icon} ${statusText} |\n`;
  });

  return { report, improved, failed };
}

module.exports = async ({ github, context }) => {
  const webSummaryPath = 'apps/web/coverage/coverage-summary.json';
  const apiSummaryPath = 'apps/api/coverage/coverage-summary.json';

  const webConfigPath = 'apps/web/vitest.config.ts';
  const apiConfigPath = 'apps/api/jest.config.ts';

  const webResult = generateAppReport('Frontend (Web)', webSummaryPath, webConfigPath);
  const apiResult = generateAppReport('Backend (API)', apiSummaryPath, apiConfigPath);

  let body = `## 📊 Test Coverage Report\n\n`;
  body += webResult.report + '\n';
  body += apiResult.report + '\n';

  if (webResult.improved || apiResult.improved) {
    body += `\n### 🚀 Improvements Detected!\n`;
    body += `Congratulations! The coverage has increased above the minimum threshold.\n`;
    body += `**Action Required:** Please update the configuration files (\`jest.config.ts\` / \`vitest.config.ts\`) to lock in these gains and prevent future regressions.`;
  }

  if (webResult.failed || apiResult.failed) {
    body += `\n### ⚠️ Regressions Detected\n`;
    body += `Some coverage metrics have dropped below the allowed minimum. Please check the table above.`;
  }

  // Post the comment
  if (context.payload.pull_request) {
    await github.rest.issues.createComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: context.payload.pull_request.number,
      body: body
    });
  }
};
