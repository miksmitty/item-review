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

Imported data, field choices and reviews are stored in the `data/` folder.
