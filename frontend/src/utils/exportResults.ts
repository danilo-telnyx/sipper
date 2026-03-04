import { TestResult } from '../types/index'
import { formatDate, formatDuration, downloadFile } from '../lib/utils'

/**
 * Export test result to JSON format
 */
export function exportToJSON(testResult: TestResult): string {
  const filename = `test-result-${testResult.id}-${Date.now()}.json`
  const content = JSON.stringify(testResult, null, 2)
  downloadFile(content, filename, 'application/json')
  return filename
}

/**
 * Export test result to CSV format
 */
export function exportToCSV(testResult: TestResult): string {
  const filename = `test-result-${testResult.id}-${Date.now()}.csv`
  
  // Main test info
  const rows: string[][] = [
    ['Test Result Export'],
    [''],
    ['Test ID', testResult.id],
    ['Credential', testResult.credentialName],
    ['Test Type', testResult.testType],
    ['Status', testResult.status],
    ['Success', testResult.success ? 'Yes' : 'No'],
    ['Score', testResult.score.toString()],
    ['Started At', formatDate(testResult.startedAt)],
    ['Completed At', testResult.completedAt ? formatDate(testResult.completedAt) : 'N/A'],
    ['Duration', formatDuration(testResult.duration)],
    [''],
    ['Performance Metrics'],
    ['Total Requests', testResult.details.totalRequests.toString()],
    ['Successful Requests', testResult.details.successfulRequests.toString()],
    ['Failed Requests', testResult.details.failedRequests.toString()],
    ['Success Rate', `${testResult.details.successRate.toFixed(2)}%`],
    ['Average Latency', `${testResult.details.averageLatency}ms`],
    ['Min Latency', `${testResult.details.minLatency}ms`],
    ['Max Latency', `${testResult.details.maxLatency}ms`],
    [''],
  ]

  // RFC Compliance
  if (testResult.rfcCompliance.length > 0) {
    rows.push(['RFC Compliance Results'])
    rows.push(['RFC', 'Section', 'Requirement', 'Compliant', 'Severity', 'Details'])
    testResult.rfcCompliance.forEach(rfc => {
      rows.push([
        rfc.rfc,
        rfc.section,
        rfc.requirement,
        rfc.compliant ? 'Yes' : 'No',
        rfc.severity,
        rfc.details,
      ])
    })
    rows.push([''])
  }

  // Timings
  if (testResult.timings.length > 0) {
    rows.push(['Timing Breakdown'])
    rows.push(['Timestamp', 'Event', 'Duration', 'Success'])
    testResult.timings.forEach(timing => {
      rows.push([
        new Date(timing.timestamp).toISOString(),
        timing.event,
        formatDuration(timing.duration),
        timing.success ? 'Yes' : 'No',
      ])
    })
    rows.push([''])
  }

  // Errors
  if (testResult.details.errors.length > 0) {
    rows.push(['Errors'])
    rows.push(['Code', 'Message', 'Timestamp'])
    testResult.details.errors.forEach(error => {
      rows.push([error.code, error.message, new Date(error.timestamp).toISOString()])
    })
    rows.push([''])
  }

  // Warnings
  if (testResult.details.warnings.length > 0) {
    rows.push(['Warnings'])
    rows.push(['Code', 'Message', 'Timestamp'])
    testResult.details.warnings.forEach(warning => {
      rows.push([warning.code, warning.message, new Date(warning.timestamp).toISOString()])
    })
  }

  const csvContent = rows.map(row => 
    row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
  ).join('\n')

  downloadFile(csvContent, filename, 'text/csv')
  return filename
}

/**
 * Export test result to PDF format (simplified HTML-to-PDF)
 * In production, you'd use a library like jsPDF or pdfmake
 */
export async function exportToPDF(testResult: TestResult): Promise<string> {
  const filename = `test-result-${testResult.id}-${Date.now()}.pdf`
  
  // Generate HTML content for PDF
  const html = generateHTMLReport(testResult)
  
  // For now, we'll create a print-friendly HTML and use the browser's print-to-PDF
  // In production, integrate with a proper PDF generation library
  
  // Create a hidden iframe for printing
  const printFrame = document.createElement('iframe')
  printFrame.style.position = 'fixed'
  printFrame.style.right = '0'
  printFrame.style.bottom = '0'
  printFrame.style.width = '0'
  printFrame.style.height = '0'
  printFrame.style.border = '0'
  document.body.appendChild(printFrame)
  
  const doc = printFrame.contentDocument || printFrame.contentWindow?.document
  if (doc) {
    doc.open()
    doc.write(html)
    doc.close()
    
    // Trigger print dialog
    printFrame.contentWindow?.print()
    
    // Clean up after a delay
    setTimeout(() => {
      document.body.removeChild(printFrame)
    }, 1000)
  }
  
  return filename
}

/**
 * Generate HTML report for PDF export
 */
function generateHTMLReport(testResult: TestResult): string {
  const statusColor = testResult.success ? '#10b981' : '#ef4444'
  const scoreColor = testResult.score >= 90 ? '#10b981' : 
                     testResult.score >= 70 ? '#f59e0b' : 
                     testResult.score >= 50 ? '#f97316' : '#ef4444'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Test Result Report - ${testResult.id}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.6;
      color: #1f2937;
      padding: 40px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .header {
      border-bottom: 3px solid #e5e7eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .header .meta {
      color: #6b7280;
      font-size: 14px;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }
    .summary-card {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
    }
    .summary-card .label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .summary-card .value {
      font-size: 28px;
      font-weight: bold;
    }
    .section {
      margin-bottom: 40px;
    }
    .section h2 {
      font-size: 24px;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e5e7eb;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }
    th, td {
      text-align: left;
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    th {
      background-color: #f9fafb;
      font-weight: 600;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
    }
    .badge-success { background-color: #d1fae5; color: #065f46; }
    .badge-error { background-color: #fee2e2; color: #991b1b; }
    .badge-warning { background-color: #fef3c7; color: #92400e; }
    .rfc-item {
      border-left: 4px solid #e5e7eb;
      padding: 15px;
      margin-bottom: 15px;
      background-color: #f9fafb;
    }
    .rfc-item.compliant { border-left-color: #10b981; }
    .rfc-item.non-compliant { border-left-color: #ef4444; }
    @media print {
      body { padding: 20px; }
      .summary-grid { page-break-inside: avoid; }
      .section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Test Result Report</h1>
    <div class="meta">
      Generated on ${formatDate(new Date().toISOString())} • 
      Test ID: ${testResult.id}
    </div>
  </div>

  <div class="summary-grid">
    <div class="summary-card">
      <div class="label">Status</div>
      <div class="value" style="color: ${statusColor}">
        ${testResult.success ? 'PASSED' : 'FAILED'}
      </div>
    </div>
    <div class="summary-card">
      <div class="label">Score</div>
      <div class="value" style="color: ${scoreColor}">${testResult.score}</div>
    </div>
    <div class="summary-card">
      <div class="label">Duration</div>
      <div class="value">${formatDuration(testResult.duration)}</div>
    </div>
    <div class="summary-card">
      <div class="label">Success Rate</div>
      <div class="value">${testResult.details.successRate.toFixed(1)}%</div>
    </div>
  </div>

  <div class="section">
    <h2>Test Information</h2>
    <table>
      <tr><th>Credential</th><td>${testResult.credentialName}</td></tr>
      <tr><th>Test Type</th><td>${testResult.testType.replace(/-/g, ' ')}</td></tr>
      <tr><th>Started At</th><td>${formatDate(testResult.startedAt)}</td></tr>
      <tr><th>Completed At</th><td>${testResult.completedAt ? formatDate(testResult.completedAt) : 'N/A'}</td></tr>
    </table>
  </div>

  <div class="section">
    <h2>Performance Metrics</h2>
    <table>
      <tr><th>Total Requests</th><td>${testResult.details.totalRequests}</td></tr>
      <tr><th>Successful Requests</th><td>${testResult.details.successfulRequests}</td></tr>
      <tr><th>Failed Requests</th><td>${testResult.details.failedRequests}</td></tr>
      <tr><th>Average Latency</th><td>${testResult.details.averageLatency}ms</td></tr>
      <tr><th>Min Latency</th><td>${testResult.details.minLatency}ms</td></tr>
      <tr><th>Max Latency</th><td>${testResult.details.maxLatency}ms</td></tr>
    </table>
  </div>

  ${testResult.rfcCompliance.length > 0 ? `
  <div class="section">
    <h2>RFC Compliance</h2>
    ${testResult.rfcCompliance.map(rfc => `
      <div class="rfc-item ${rfc.compliant ? 'compliant' : 'non-compliant'}">
        <div><strong>RFC ${rfc.rfc} §${rfc.section}</strong></div>
        <div style="margin: 8px 0;">${rfc.requirement}</div>
        <div style="display: flex; gap: 10px; align-items: center;">
          <span class="badge badge-${rfc.compliant ? 'success' : 'error'}">
            ${rfc.compliant ? 'Compliant' : 'Non-Compliant'}
          </span>
          <span class="badge badge-${rfc.severity === 'critical' ? 'error' : rfc.severity === 'warning' ? 'warning' : 'success'}">
            ${rfc.severity}
          </span>
        </div>
        ${rfc.details ? `<div style="margin-top: 8px; color: #6b7280;">${rfc.details}</div>` : ''}
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${testResult.details.errors.length > 0 ? `
  <div class="section">
    <h2>Errors</h2>
    <table>
      <thead>
        <tr>
          <th>Code</th>
          <th>Message</th>
          <th>Timestamp</th>
        </tr>
      </thead>
      <tbody>
        ${testResult.details.errors.map(error => `
          <tr>
            <td><strong>${error.code}</strong></td>
            <td>${error.message}</td>
            <td>${new Date(error.timestamp).toLocaleTimeString()}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  ` : ''}

  ${testResult.details.warnings.length > 0 ? `
  <div class="section">
    <h2>Warnings</h2>
    <table>
      <thead>
        <tr>
          <th>Code</th>
          <th>Message</th>
          <th>Timestamp</th>
        </tr>
      </thead>
      <tbody>
        ${testResult.details.warnings.map(warning => `
          <tr>
            <td><strong>${warning.code}</strong></td>
            <td>${warning.message}</td>
            <td>${new Date(warning.timestamp).toLocaleTimeString()}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  ` : ''}

  ${testResult.timings.length > 0 ? `
  <div class="section">
    <h2>Timing Breakdown</h2>
    <table>
      <thead>
        <tr>
          <th>Event</th>
          <th>Duration</th>
          <th>Success</th>
        </tr>
      </thead>
      <tbody>
        ${testResult.timings.map(timing => `
          <tr>
            <td>${timing.event}</td>
            <td>${formatDuration(timing.duration)}</td>
            <td>
              <span class="badge badge-${timing.success ? 'success' : 'error'}">
                ${timing.success ? 'Success' : 'Failed'}
              </span>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  ` : ''}
</body>
</html>
`
}
