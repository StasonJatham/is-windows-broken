# is-windows-broken.com

[![Website](https://img.shields.io/website?url=https%3A%2F%2Fis-windows-broken.com&label=website)](https://is-windows-broken.com)
[![API](https://img.shields.io/website?url=https%3A%2F%2Fapi.is-windows-broken.com%2Fapi%2Fv1%2Fpatch-status&label=api)](https://api.is-windows-broken.com/api/v1/patch-status)
![Astro](https://img.shields.io/badge/Astro-6-FF5D01?logo=astro&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Free API](https://img.shields.io/badge/API-free-16a34a)

Free Windows patch and release-health status lookup for admins. `is-windows-broken.com` tracks Microsoft release-health signals and publishes a cached go/no-go view for deciding whether Windows Server and Windows 11 rollout looks safe, cautionary, or blocked.

![is-windows-broken.com social preview](https://is-windows-broken.com/og-image.jpg)

No account. No API key. Fast public status checks.

## Live Service

- Website: [https://is-windows-broken.com](https://is-windows-broken.com)
- Public API: [https://api.is-windows-broken.com/api/v1/patch-status](https://api.is-windows-broken.com/api/v1/patch-status)

## What It Tracks

The site displays the newest cached patch assessment for tracked Windows releases, including:

- overall patch status
- short operational summary
- confidence score
- per-version Windows status
- analysis run date
- Microsoft source-page date

Tracked releases currently include:

- Windows Server 2022
- Windows Server 2025
- major Windows 11 release-health pages

## Public API

```text
GET https://api.is-windows-broken.com/api/v1/patch-status
```

Example:

```bash
curl -s https://api.is-windows-broken.com/api/v1/patch-status | jq
```

Example response shape:

```json
{
  "ok": true,
  "count": 4,
  "items": [
    {
      "generatedAt": "2026-05-08T08:04:30.018Z",
      "overall": {
        "status": "GREEN",
        "should_block_patch": false,
        "summary": "No active blocker issues detected.",
        "confidence": 0.97
      }
    }
  ]
}
```

## How It Works

The backend periodically fetches Microsoft Windows release-health pages and related Windows admin sources, summarizes the evidence through an asynchronous batch workflow, and stores the result as a cached JSON history.

The public site never calls a model directly. It only reads the cached API response, which keeps the page fast, predictable, and cheap to serve.

## Frontend

This repository contains the public frontend for `is-windows-broken.com`.

- Framework: Astro 6
- Language: TypeScript
- Deployment target: static hosting / edge CDN

The backend API is served separately at [https://api.is-windows-broken.com](https://api.is-windows-broken.com).

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

- This repository contains the public frontend only.
- The API intentionally exposes a scrubbed public response, not internal batch or model metadata.
- Always validate patching decisions against official Microsoft documentation and your own testing.

## Related Services

- [isbadip.com](https://isbadip.com) — malicious IP and domain reputation lookup
- [isproxy.org](https://isproxy.org) — proxy, VPN, Tor, hosting, and residential-proxy lookup

## Author

Built by Karl — [karl.fail](https://karl.fail) · [karlcom.de](https://karlcom.de)

## License

MIT
