# Item Review

Review items exported from a SharePoint list (CSV) in a list and preview layout.
Plain Node.js, no dependencies.

```
node server.js
```

Then open http://localhost:3120 (set `PORT` to use another port). Import a CSV, or use
**Load demo data**. The page must be opened through this server; serving the `public`
folder with any other web server will not work because the data is saved through the
server's `/api` endpoints.

It also works behind a proxy that serves it under a path prefix (for example
`https://host/proxy/3001/`); open that address with the trailing slash.

Click any value in the preview to edit it (Ctrl/Cmd+Enter or clicking away saves, Esc cancels).
The ID column is read-only. Use **Export CSV** to download the data with your edits; comments are included as an extra
`Comments` column (one line per comment: author, date and text).
Rich text cells from SharePoint (HTML) are shown formatted, with scripts and unsafe markup
stripped, and are searched, sorted and filtered as plain text.

Use **+ Add section** under the preview fields to add a section heading; rename it by
clicking its text, drag its ⋮⋮ grip to position it between fields, and remove it with ✕.

Imported data, field choices and reviews are stored in the `data/` folder.
