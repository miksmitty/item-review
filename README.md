# Item Review

Review items exported from a SharePoint list (CSV) in a list and preview layout.
Plain Node.js, no dependencies.

```
node server.js
```

Then open http://localhost:3120 (set `PORT` to use another port). It also works behind a proxy
that serves it under a path prefix (for example `https://host/proxy/3001/`); open that address
with the trailing slash.

## The CSV is the data

The server only serves the page. It stores nothing: no items, edits, comments or layout.

- **Import CSV** (or drop a file, or **Load demo data**) loads the items into the page.
- A working copy is kept in this browser's own storage so a reload doesn't lose your work.
  Use **Clear data** to remove it. Importing again replaces it (you are asked first).
- **Export CSV** downloads everything: your edits plus all comments, as an extra `Comments`
  column with one line per comment (`Author (yyyy-mm-dd hh:mm): text`).
- Importing an exported file turns that `Comments` column back into live comments, so
  export then import is lossless. A `Comments` column in any other format is treated as
  ordinary data (and the export then names the new column `Review comments`).

## Using it

- Click any value in the preview to edit it (Ctrl/Cmd+Enter or clicking away saves, Esc cancels).
  The ID column is read-only.
- Choose which columns show in the list and the preview with **Fields…**. Drag list headers and
  preview grips (⋮⋮) to reorder, drag edges to resize. Click a header to sort; the ▾ button gives
  Excel-style filters.
- **+ Add section** adds a heading you can rename, drag and remove.
- Rich text cells from SharePoint (HTML) are shown formatted, with scripts and unsafe markup
  stripped, and are searched, sorted and filtered as plain text.
