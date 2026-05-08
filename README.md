# is-windows-broken

Public Windows patch-readiness viewer backed by a cached JSON API.

![is-windows-broken preview](./app/public/is-win-broke-preview.webp)

## Live

- Site: `https://is-windows-broken.com`
- API: `https://api.is-windows-broken.com/api/v1/patch-status`

## What It Shows

The site displays the latest cached patch assessment for tracked Windows releases, including:

- overall status
- short summary
- confidence
- per-version status
- last update time

The public API returns the latest 10 cached runs. The frontend renders the newest item.

## Public API

`GET /api/v1/patch-status`

Example:

```bash
curl -s https://api.is-windows-broken.com/api/v1/patch-status | jq
```

Response shape:

```json
{
  "ok": true,
  "count": 4,
  "items": [
    {
      "generatedAt": "2026-05-08T08:04:30.018Z",
      "patch": {
        "berlinDate": "2026-05-08",
        "patchTuesday": "2026-05-12",
        "patchDay": "2026-05-20",
        "activeWindow": false
      },
      "overall": {
        "status": "GREEN",
        "should_block_patch": false,
        "summary": "No active blocker issues detected.",
        "confidence": 0.97
      },
      "versions": [
        {
          "version": "Windows Server 2022",
          "status": "GREEN",
          "should_block_patch": false,
          "summary": "No active known issues.",
          "data_date": "2026-05-08"
        }
      ]
    }
  ]
}
```

## Local Development

```bash
cd app
npm ci
npm run dev
```

To test a production build locally:

```bash
cd app
npm run build
npm run preview
```

## Notes

- This repo contains the public frontend only.
- The API intentionally exposes a scrubbed public response, not internal batch or model metadata.
