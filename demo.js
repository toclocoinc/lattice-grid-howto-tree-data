/**
 * Nest rows under the parent each one names, and sort within that hierarchy.
 *
 * `tree: { parentKey: 'parentId' }` reads the named field off each row and
 * places it under the row whose id it matches: a department, a team, or a
 * person under their team. The grid draws one tree column carrying the
 * expander and the indent, taking its label from `tree.label`. Every branch
 * opens by default, and a column sort reorders siblings under their own
 * parent rather than the whole flattened list, so sorting by revenue moves
 * the people inside a team without touching the teams or departments
 * around them.
 */

// Tied to toclocoinc.github.io only; has no effect anywhere else and needs
// no key at all to run this page from a local copy.
LatticeGrid.setLicence(
  'LG1.eyJ2IjoxLCJwIjoibGF0dGljZS1ncmlkIiwidCI6IlRPQ0xPQ08gSW5jIC0gcHVibGljIGRlbW9zIiwiZSI6IjIwMzAtMDEtMDEiLCJkIjpbInRvY2xvY29pbmMuZ2l0aHViLmlvIl19.9De42ua3aCGpiMB6EVRP7Tv-upUlDI-0T07rlSPzvCrsqg8t4YJi7SRnStEpAg48uzmcG7il1fR_TfwkUE7iCA'
);

const ROWS = [
  { id: 'd1', parentId: null, name: 'Engineering', kind: 'Department', revenue: null },
  { id: 't1', parentId: 'd1', name: 'Platform', kind: 'Team', revenue: null },
  { id: 'p1', parentId: 't1', name: 'Bob Diaz', kind: 'Person', revenue: 340 },
  { id: 'p2', parentId: 't1', name: 'Alice Chen', kind: 'Person', revenue: 120 },
  { id: 't2', parentId: 'd1', name: 'Product', kind: 'Team', revenue: null },
  { id: 'p3', parentId: 't2', name: 'Carla Nunes', kind: 'Person', revenue: 90 },
  { id: 'd2', parentId: null, name: 'Sales', kind: 'Department', revenue: null },
  { id: 't3', parentId: 'd2', name: 'EMEA', kind: 'Team', revenue: null },
  { id: 'p4', parentId: 't3', name: 'Elin Karlsson', kind: 'Person', revenue: 560 },
  { id: 'p5', parentId: 't3', name: 'Dan Kowalski', kind: 'Person', revenue: 210 },
  { id: 't4', parentId: 'd2', name: 'AMER', kind: 'Team', revenue: null },
  { id: 'p6', parentId: 't4', name: 'Frank Osei', kind: 'Person', revenue: 175 },
];

const grid = LatticeGrid.createGrid(document.getElementById('grid'), {
  rowKey: 'id',
  columnDefaults: { sort: true },
  tree: { parentKey: 'parentId', label: 'name', title: 'Team' },
  columns: [
    { field: 'kind', title: 'Kind', layout: { width: 120 } },
    {
      field: 'revenue', title: 'Revenue', type: 'number',
      format: { style: 'currency', currency: 'USD', decimals: 0 },
      layout: { width: 140 },
    },
  ],
  rows: ROWS,
});
window.__demoGrid = grid; // read by tools/verify.mjs

let ascending = true;
document.getElementById('sort').addEventListener('click', () => {
  grid.sort.set([{ col: 'revenue', dir: ascending ? 'asc' : 'desc' }]);
  ascending = !ascending;
});

document.getElementById('stat').textContent =
  '12 rows: 2 departments, 4 teams, 6 people. Click a row’s arrow to expand or ' +
  'collapse its branch, or sort by revenue to reorder the people inside each team.';
