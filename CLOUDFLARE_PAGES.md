# Cloudflare Pages Setup

Use Cloudflare Pages, not Workers, for this site.

## Project Settings

- Repository: `StasonJatham/is-windows-broken`
- Production branch: `main`
- Root directory: `app`
- Build command: `npm run build`
- Build output directory: `dist`

## Custom Domains

- `is-windows-broken.com`
- `www.is-windows-broken.com` if you want the `www` hostname

## API

The frontend reads the public patch API from:

- `https://api.is-windows-broken.com/api/v1/patch-status`

If you ever need to override it in Pages, set:

- `VITE_PATCH_API_URL=https://api.is-windows-broken.com/api/v1/patch-status`

## Notes

- `app/public/_redirects` enables SPA fallback.
- `app/public/_headers` adds basic security and asset cache headers.
- Do not commit `dist/`.
- Do not commit built `app/assets/` output for Pages. Pages should build `dist` from source.
