# How to show parent and child rows as a tree

Nests twelve rows into two departments, four teams and six people, each row naming its parent:
`tree: { parentKey: 'parentId' }` reads that field off every row and builds the hierarchy from it,
drawing one tree column that carries the expander and the indent. Every branch opens by default;
click a row's arrow to collapse or reopen it. Sort by revenue and only the people inside a team
change places, because a sort orders siblings under their own parent rather than the whole
flattened list.

Live demo: https://toclocoinc.github.io/lattice-grid-howto-tree-data/

**Read the how-to:** https://www.latticegrid.dev/docs/how-to/tree-data/

## The full source

Two files: `index.html` loads the grid and declares the mount point, `demo.js` configures and creates it. Copy both as they are below and it runs.

### index.html

```html
<!doctype html>
<html lang="en-GB">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>How to show parent and child rows as a tree</title>
    <meta
      name="description"
      content="Twelve people sit under their teams and departments in one grid, each branch expanding or collapsing on its own arrow. Sort by revenue and only the people within a team reorder, not the departments around them. Built with Lattice Grid loaded by script tag, no install and no build."
    />
    <link rel="icon" href="data:," />
    <!--
      The grid's stylesheet, from jsDelivr. The address names the exact
      release, 1.68.2, and carries the hash of the file it expects, so the
      page can never quietly pick up a different build than the one it was
      checked against.
    -->
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/@toclocoinc/lattice-grid@1.68.2/lattice-grid.min.css"
      integrity="sha384-mcpd7S8C5nz58bZDAXdYH6rzezEhfN7B4u2SlW426dSe20GnkxTu4TygyOILnCth"
      crossorigin="anonymous"
    />
    <style>
      body { margin: 0; font-family: system-ui, sans-serif; background: #f4f6f9; color: #131a24; }
      header { padding: 1.5rem 1.5rem 0.5rem; max-width: 960px; margin: 0 auto; }
      header p { color: #4a5568; }
      header a { color: #2d6bff; }
      main { max-width: 960px; margin: 0 auto; padding: 0 1.5rem 2.5rem; }
      #toolbar { margin: 0 0 0.75rem; }
      #sort { font: inherit; padding: 0.4rem 0.75rem; border: 1px solid #ccd3dc; border-radius: 4px; background: #fff; cursor: pointer; }
      #grid { height: 360px; }
      #stat { font-size: 0.9rem; color: #4a5568; margin: 0.75rem 0 0; }
    </style>
  </head>
  <body>
    <header>
      <h1>How to show parent and child rows as a tree</h1>
      <p>
        Two departments hold four teams, and each team holds its people, twelve rows in all.
        Click a row's arrow to open or close that branch; the rows beneath it hide or reappear
        with it. Sort by revenue and only the people inside a team change places, because a sort
        orders siblings within their own parent rather than the whole flattened list. Read the
        <a href="https://www.latticegrid.dev/docs/how-to/tree-data/">full how-to</a>
        on latticegrid.dev.
      </p>
    </header>
    <main>
      <div id="toolbar">
        <button id="sort" type="button">Sort by revenue</button>
      </div>
      <div id="grid"></div>
      <p id="stat"></p>
    </main>

    <!--
      The library, as a classic script tag. No npm install, no bundler, no
      type="module": the file runs as it arrives and leaves the LatticeGrid
      global behind.
    -->
    <script
      src="https://cdn.jsdelivr.net/npm/@toclocoinc/lattice-grid@1.68.2/lattice-grid.min.js"
      integrity="sha384-vCzLyFYn0T0lz/vkdH4x0JpJZkOazZgI2LiGui7lm5uerdZd0Z46G9hr3Aq1FFPS"
      crossorigin="anonymous"
    ></script>
    <script src="./demo.js"></script>
  </body>
</html>
```

### demo.js

```js
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
```

Rows that name a parent already in the data are a **parent reference** tree: every node is a real
row. `tree: { path: (row) => row.hierarchy }` builds the other shape instead, where a row carries
its own ancestry as an array and any level missing a row of its own is synthesised. A row whose
named parent is missing, filtered out or wrong is an orphan and still renders, at the root by
default or in a named bucket set with `orphans`, rather than vanishing from the grid.

## Running it yourself

Open `index.html` in a browser, or serve the folder with any static file server. The grid loads
from jsDelivr by script tag, so there is no install and no build step. It runs keyless on
`localhost`; the licence key in `demo.js` is bound to `toclocoinc.github.io` and has no effect
anywhere else.

## Licence

MIT, see [LICENSE](./LICENSE). Lattice Grid itself is licensed separately per domain:
https://www.latticegrid.dev/pricing/
