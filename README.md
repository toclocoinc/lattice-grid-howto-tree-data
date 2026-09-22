# How to show parent and child rows as a tree

Nests twelve rows into two departments, four teams and six people, each row naming its parent:
`tree: { parentKey: 'parentId' }` reads that field off every row and builds the hierarchy from it,
drawing one tree column that carries the expander and the indent. Every branch opens by default;
click a row's arrow to collapse or reopen it. Sort by revenue and only the people inside a team
change places, because a sort orders siblings under their own parent rather than the whole
flattened list.

Live demo: https://toclocoinc.github.io/lattice-grid-howto-tree-data/

**Read the how-to:** https://www.latticegrid.dev/docs/how-to/tree-data/

## The snippet

```js
const grid = LatticeGrid.createGrid(document.getElementById('grid'), {
  rowKey: 'id',
  tree: { parentKey: 'parentId', label: 'name', title: 'Team' },
  columns: [
    { field: 'kind', title: 'Kind' },
    { field: 'revenue', title: 'Revenue', type: 'number', format: { style: 'currency', currency: 'USD' } },
  ],
  rows, // two departments, four teams, six people, each naming its parent
});
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
