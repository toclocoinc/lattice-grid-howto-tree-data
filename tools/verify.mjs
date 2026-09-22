/**
 * Load the demo in a real headless browser and check that it works.
 *
 * Serves the project locally and drives it with the same minimal Chrome
 * driver the grid's own test suite uses (tools/browser.js), so this needs no
 * dependency beyond Chrome itself.
 *
 * Checks:
 *   - the library arrived and left the LatticeGrid global behind;
 *   - all 12 rows land in the grid (grid.rows.count()), two departments,
 *     four teams, six people, each branch open by default, and Bob Diaz's
 *     revenue cell reads formatted currency;
 *   - collapsing a department's branch (Engineering, 5 descendants) hides
 *     its members and drops the grid's own display count by exactly 5, and
 *     re-expanding it brings them all back;
 *   - clicking "Sort by revenue" reorders the people within each team
 *     (read through grid.rows.get(i).key, the grid's own display order,
 *     rather than the raw DOM, which recycles row elements and can hold a
 *     stale key on a node currently off screen) without moving the
 *     department or team rows around them, because a sort orders siblings
 *     under their own parent rather than the whole flattened list;
 *   - nothing logged a console error or threw while the page ran.
 *
 * Exits non-zero on any failure, so it can gate a deployment.
 *
 * Usage: node tools/verify.mjs
 */

import { startServer } from './serve.mjs';
import { Browser, available } from './browser.js';

if (!available()) {
  console.log('No headless browser on this machine; skipping verify.mjs.');
  process.exit(0);
}

// The grid's own display order, read through its API rather than the DOM:
// a collapsed or just-reopened branch can leave a recycled row element
// carrying a stale data-key until it is next reused, so querying the DOM
// for a full ordered list is not honest here. A single row's presence by
// key, elsewhere below, is a different (and reliable) question.
const displayOrder = `(() => {
  const n = window.__demoGrid.rows.count();
  const out = [];
  for (let i = 0; i < n; i++) out.push(window.__demoGrid.rows.get(i).key);
  return out;
})()`;

const { server, port } = await startServer();
const browser = new Browser();

try {
  await browser.start();

  await browser.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `
      window.__errs = [];
      addEventListener('error', (e) => window.__errs.push(String(e.message || e)));
      addEventListener('unhandledrejection', (e) => window.__errs.push('unhandledrejection: ' + String(e.reason)));
      const origError = console.error.bind(console);
      console.error = (...args) => { window.__errs.push('console.error: ' + args.map(String).join(' ')); origError(...args); };
    `,
  });

  await browser.open(`http://127.0.0.1:${port}/`);
  await new Promise((r) => setTimeout(r, 500));

  const failures = [];

  const hasGrid = await browser.evaluate(`typeof LatticeGrid !== 'undefined' && typeof LatticeGrid.createGrid === 'function'`);
  if (!hasGrid) failures.push('LatticeGrid.createGrid was not found on the page');

  const totalRows = await browser.evaluate(`window.__demoGrid.rows.count()`);
  if (totalRows !== 12) failures.push(`expected 12 rows (grid.rows.count()), grid reports ${totalRows}`);

  const initialOrder = await browser.evaluate(displayOrder);
  const expectedInitial = ['d1', 't1', 'p1', 'p2', 't2', 'p3', 'd2', 't3', 'p4', 'p5', 't4', 'p6'];
  if (JSON.stringify(initialOrder) !== JSON.stringify(expectedInitial)) {
    failures.push(`initial row order was ${JSON.stringify(initialOrder)}, expected ${JSON.stringify(expectedInitial)}`);
  }

  const d1Expanded = await browser.evaluate(`document.querySelector('.lat-row[data-key="d1"]')?.getAttribute('aria-expanded')`);
  if (d1Expanded !== 'true') failures.push(`expected Engineering (d1) open by default (aria-expanded="true"), was "${d1Expanded}"`);

  // Read while the layout is fresh, before any collapse/expand recycles row
  // elements: confirms the revenue column carries the currency formatting
  // it declares, not just the right number.
  const bobCellText = await browser.evaluate(`document.querySelector('.lat-row[data-key="p1"] .lat-cell[data-col="revenue"]')?.textContent`);
  if (!/340/.test(bobCellText || '') || bobCellText === '340') {
    failures.push(`Bob Diaz's revenue cell read "${bobCellText}", expected a currency-formatted 340 (e.g. "$340" or "US$340")`);
  }

  // Collapse Engineering (d1): its branch holds 5 descendants (t1, p1, p2,
  // t2, p3), so the display count should drop by exactly 5 and a member row
  // should leave the DOM entirely.
  await browser.evaluate(`document.querySelector('.lat-row[data-key="d1"] .lat-expander').click()`);
  await new Promise((r) => setTimeout(r, 300));

  const collapsedExpanded = await browser.evaluate(`document.querySelector('.lat-row[data-key="d1"]')?.getAttribute('aria-expanded')`);
  const countWhileCollapsed = await browser.evaluate(`window.__demoGrid.rows.count()`);
  const memberVisibleWhileCollapsed = await browser.evaluate(`document.querySelector('.lat-row[data-key="p1"]') !== null`);
  if (collapsedExpanded !== 'false') failures.push(`collapsing Engineering did not set aria-expanded="false" (was "${collapsedExpanded}")`);
  if (countWhileCollapsed !== 7) failures.push(`collapsing Engineering left the grid showing ${countWhileCollapsed} rows, expected 7 (12 - 5 descendants)`);
  if (memberVisibleWhileCollapsed) failures.push('Bob Diaz (p1, under Engineering) is still on screen after collapsing its department');

  await browser.evaluate(`document.querySelector('.lat-row[data-key="d1"] .lat-expander').click()`);
  await new Promise((r) => setTimeout(r, 300));

  const reopenedExpanded = await browser.evaluate(`document.querySelector('.lat-row[data-key="d1"]')?.getAttribute('aria-expanded')`);
  const countAfterReopen = await browser.evaluate(`window.__demoGrid.rows.count()`);
  const memberVisibleAfterReopen = await browser.evaluate(`document.querySelector('.lat-row[data-key="p1"]') !== null`);
  const orderAfterReopen = await browser.evaluate(displayOrder);
  if (reopenedExpanded !== 'true') failures.push(`re-expanding Engineering did not set aria-expanded="true" (was "${reopenedExpanded}")`);
  if (countAfterReopen !== 12) failures.push(`re-expanding Engineering left the grid showing ${countAfterReopen} rows, expected 12`);
  if (!memberVisibleAfterReopen) failures.push('Bob Diaz (p1, under Engineering) did not return after re-expanding its department');
  if (JSON.stringify(orderAfterReopen) !== JSON.stringify(expectedInitial)) {
    failures.push(`row order after re-expanding was ${JSON.stringify(orderAfterReopen)}, expected it back to ${JSON.stringify(expectedInitial)}`);
  }

  // Click "Sort by revenue" the way a visitor would, and check the display
  // order the grid itself reports: the people under Platform (t1) and under
  // EMEA (t3) swap into ascending order, while every department and team
  // keeps its place, because a sort orders siblings under their own parent
  // rather than the whole flattened list.
  await browser.evaluate(`document.getElementById('sort').click()`);
  await new Promise((r) => setTimeout(r, 400));
  const orderAfterAsc = await browser.evaluate(displayOrder);

  const expectedAsc = ['d1', 't1', 'p2', 'p1', 't2', 'p3', 'd2', 't3', 'p5', 'p4', 't4', 'p6'];
  if (JSON.stringify(orderAfterAsc) !== JSON.stringify(expectedAsc)) {
    failures.push(`ascending sort by revenue gave ${JSON.stringify(orderAfterAsc)}, expected ${JSON.stringify(expectedAsc)}`);
  }
  // The department and team rows keep their positions: only their people move.
  const structuralBefore = expectedInitial.filter((k) => k.startsWith('d') || k.startsWith('t'));
  const structuralAfter = orderAfterAsc.filter((k) => k.startsWith('d') || k.startsWith('t'));
  if (JSON.stringify(structuralBefore) !== JSON.stringify(structuralAfter)) {
    failures.push(`sorting moved a department or team row: before ${JSON.stringify(structuralBefore)}, after ${JSON.stringify(structuralAfter)}`);
  }

  const errors = await browser.evaluate('window.__errs');
  if (errors.length) failures.push(`console/window errors: ${errors.join(' | ')}`);

  if (failures.length) {
    console.error('FAILED:\n' + failures.map((f) => `  - ${f}`).join('\n'));
    process.exitCode = 1;
  } else {
    console.log(
      'OK: 12 rows in a tree (2 departments, 4 teams, 6 people), all open by default, ' +
      'revenue formatted as currency, collapsing and re-expanding Engineering hid and ' +
      'restored its 5 descendants, sorting by revenue reordered the people within Platform ' +
      'and EMEA without moving any department or team row. 0 console errors.'
    );
  }
} finally {
  await browser.close();
  server.close();
}
