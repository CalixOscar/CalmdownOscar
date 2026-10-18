# Website proposals (`/playground/forslag/`)

Each pitch to a business lives in its own folder and is shared by direct link only. `/playground/forslag/` sends `X-Robots-Tag: noindex` (vercel.json), every page also carries a noindex meta tag, and nothing on the site links to individual proposals. The repo is public, so proposal files, including price pages, are readable on GitHub; never commit prospect lists or private notes here.

## Layout

```
playground/forslag/<slug>/index.html      cover page: today's site next to the concept (copy docs/forslag-mal/index.html)
playground/forslag/<slug>/assets/for.jpg   screenshot of the current site, 1440×900
playground/forslag/<slug>/assets/etter.jpg screenshot of the concept, 1440×900
playground/forslag/<slug>/nettside/        the concept site; use absolute paths /playground/forslag/<slug>/nettside/...
playground/forslag/<slug>/tilbud.html      price page; only share after the business replies
```

`<slug>` is the business name in lowercase with hyphens, e.g. `fjordcamp-lofoten`.

## Screenshots

```bash
C="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$C" --headless=new --hide-scrollbars --window-size=1440,900 --virtual-time-budget=8000 --screenshot=for.png https://example.no/
sips -s format jpeg -s formatOptions 75 for.png --out playground/forslag/<slug>/assets/for.jpg
```

Take `etter` the same way from the deployed concept (or a local preview).

## Checklist

- Every page in the proposal has `<meta name="robots" content="noindex, nofollow">`.
- The concept footer says it is a concept preview ("Konseptforslag"), so it can't be mistaken for the business's own site.
- Only the business's own published text and photos are used; record sources and image rights before handover.
- Skaugvoll (Arctic Adventure) still lives at `/playground/arctic_adventures/` and moves to /playground/forslag/ only after the owner replies; keep redirects from the old URLs when it does.
