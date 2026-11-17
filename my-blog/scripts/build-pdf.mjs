#!/usr/bin/env node
// Builds content/pipeline-audit/pipeline-audit.pdf from audit.md.
//
//   npm run build:pdf
//
// md-to-pdf (and its headless Chrome) is run through npx at a pinned version
// instead of being a devDependency, so CI and Vercel installs stay small. The
// generated PDF is committed; the Vercel build never runs this script.
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const MD_TO_PDF = 'md-to-pdf@5.2.5';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = path.join(root, 'content', 'pipeline-audit');
const output = path.join(contentDir, 'pipeline-audit.pdf');

const config = JSON.parse(readFileSync(path.join(contentDir, 'config.json'), 'utf8'));
const bookingUrl = (config.auditBookingUrl || '').trim();
if (!bookingUrl) {
  console.warn(
    '\n⚠  auditBookingUrl is empty in content/pipeline-audit/config.json.\n'
    + '   The last page will show a placeholder. Fill it in and rebuild before selling.\n',
  );
}

const markdown = readFileSync(path.join(contentDir, 'audit.md'), 'utf8')
  .replaceAll('{{AUDIT_BOOKING_URL}}', bookingUrl || 'https://example.com/audit-booking-link-coming-soon');

const work = mkdtempSync(path.join(tmpdir(), 'pipeline-audit-'));
try {
  const mdPath = path.join(work, 'pipeline-audit.md');
  writeFileSync(mdPath, markdown);

  const pdfOptions = {
    format: 'Letter',
    margin: { top: '18mm', right: '18mm', bottom: '20mm', left: '18mm' },
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate:
      '<div style="font-size:8px;width:100%;text-align:center;color:#9ca3af;">'
      + '<span class="pageNumber"></span> / <span class="totalPages"></span></div>',
  };

  execFileSync('npx', [
    '--yes', MD_TO_PDF, mdPath,
    '--stylesheet', path.join(contentDir, 'style.css'),
    '--pdf-options', JSON.stringify(pdfOptions),
  // stdin is ignored: md-to-pdf otherwise waits for piped input when run
  // from a non-interactive shell or CI.
  ], { stdio: ['ignore', 'inherit', 'inherit'] });

  copyFileSync(path.join(work, 'pipeline-audit.pdf'), output);
  console.log(`Wrote ${path.relative(root, output)} (${Math.round(statSync(output).size / 1024)} KB)`);
} finally {
  rmSync(work, { recursive: true, force: true });
}
