# Blog publishing workflow

To ensure new blog posts appear automatically on `blog/index.html`, this repo uses a generated feed file: `blogs.json`.

## What is automated

- A pre-commit hook runs `node scripts/sync-blogs-json.mjs`
- The hook regenerates `blogs.json` and `blogs-data.js` from all files in `blog/*.html` (except `blog/index.html`)
- The hook stages both generated files automatically before commit

## One-time setup (already applied on this machine)

```bash
git config core.hooksPath .githooks
```

## If you add or edit a blog and want to refresh manually

```bash
node scripts/sync-blogs-json.mjs
```
