# CalmdownOscar — Public Engineering Log

A curated record of notable changes to calmdownoscar.com. This is the public subset of the
project's working notes; internal planning, process, and operational detail are kept out of
this repository deliberately.

## Site changes

### 2026-07-16 — Rename /rides to /hobbies and apply 5% screenshot blur
- Renamed the motorcycle riding clips directory `/rides` to `/hobbies` to encompass a wider range of activities.
- Reduced screenshot blur to 5% (radius 2.5) to keep the app UI recognizable while obfuscating private text and photos.
- Replaced the YouTube/Facebook links on the Hobbies page with a direct TikTok creator widget embed.

### 2026-07-17 — Adopt smooth scroll-scrub lerp for background video
- Switched the background video scrolling logic on calmdownoscar.com/apps from direct timestamp updates to smooth linear interpolation (lerp) animation to eliminate midway jumps/stutters.

### 2026-07-20 — Swap Obsidian Vault for Unli Rice on /apps/
- Replaced the SVG diagram label and card description references to Obsidian Vault with Unli Rice on the calmdownoscar.com/apps page.
- Updated the card description to highlight Unli Rice as "persistent memory" rather than local plain text markdown files, aligning with the new agent workflow.

### 2026-08-01 — Update Unli Rice status to Mac App Store
- Updated Unli Rice status badge on `/apps/` to "Mac App Store · Open Source" and added the Mac App Store link.
- Updated homepage link text from "Apps coming soon" to "See all apps".

### 2026-08-01 — Update Wedding Concierge / Nuptia status to Mac App Store
- Updated Wedding Concierge card on `/apps/` to status badge "Mac App Store · iOS Awaiting Review" with live blue dot.
- Added `macOS` and `iOS` pills to the card's technology/platform metadata.
- Added direct Mac App Store link (`https://apps.apple.com/app/nuptia-ai-wedding-planner/id6786553019`) alongside `nuptia.wedding`.
- Updated homepage section header from "Soon in the App Store" to "Now in the Mac App Store".

### 2026-08-03 — Move Unli Rice, ClearSpace, and Unli Disk to front homepage in Nuptia format
- Added dedicated hero sections for Unli Rice, ClearSpace, and Unli Disk on the calmdownoscar.com homepage (`index.html`), using the same section label, hero card, hover animation, and link layout format as Nuptia.
- Created interactive hero card components for each app showcasing icons, taglines, platform pills, descriptions, screenshot previews, and direct App Store / page / privacy policy links.

### 2026-08-03 — Move Unli Disk work-in-progress screenshots and text to Unli Disk product page
- Rebuilt `/apps/unlidisk/index.html` with all screenshots (`unlidisk_diskmap.png`, `unlidisk_apps.png`, `unlidisk_shortcuts.png`), showcase window cards, shared photo library engine callout, and architecture & status details originally hosted on `/clearspace/work_in_progress/#unlidisk`.
- Copied screenshot assets directly to `apps/assets/` to ensure robust asset resolution.

### 2026-08-03 — Use Unli Rice official App Store promo screenshot for homepage hero
- Adopted the official Unli Rice App Store promo graphic as `apps/assets/unli-rice-hero.png`.
- Updated Unli Rice section on `index.html` to use the official App Store hero graphic in the exact same format as Nuptia.

### 2026-08-05 — Technical Case Studies & Unified App Cards on /apps/
- Re-architected `calmdownoscar.com/apps` (`apps/index.html`) to merge app showcase cards and 3-step technical case studies (Problem → Architecture & Protocols → Impact) into unified full-width tiles per app.
- Integrated platform/technology pills (`MCP Protocol`, `PhotosKit`, `AppKit`, `CloudKit`, `Vercel Proxy`, `Multi-LLM State`) and direct action links directly within each product card.
- Updated "How I Work" section to highlight multi-agent CI/CD orchestration and persistent state management.

### 2026-08-06 — Add Unli Rice to Vault Sync node and Unli Disk post-release cleanup node on How I Work pipeline
- Updated the pipeline diagram on `/how_I_work/` and `/apps/` to rename the MCP Vault Sync side node to "Unli Rice / MCP Vault Sync" with expanded box boundaries (width 220px).
- Appended a 10th node after Vercel Proxy & App Store Release: "Unli Disk (Frees storage by deleting simulators & dead end repos)", connected via a new forward trace (`p9`) and animated pulse.
- Updated card 04 copy and SVG `aria-label` accessibility text on `/how_I_work/` to document Unli Disk's post-release cleanup phase.

### 2026-08-06 — Site-wide mobile optimization for iOS & Android
- Added `viewport-fit=cover` and Apple web app status-bar meta tags across all site pages to support iOS notch/Dynamic Island devices and Android punch-hole displays.
- Integrated CSS safe-area insets (`env(safe-area-inset-top/bottom/left/right)`) into fixed topbars, body top padding, main container wrappers, and footers.
- Added touch-friendly navigation scrolling (`overflow-x: auto`, `-webkit-overflow-scrolling: touch`) and touch tap highlight resets (`-webkit-tap-highlight-color: transparent`) to ensure seamless navigation on narrow screen viewports.

### 2026-08-06 — Remove Roblox reference from About Me page
- Simplified the game mechanics experience description on the `/aboutme/` page.

### 2026-08-07 — Split /hobbies into pure content page and create /playground for WebLLM demo
- Created dedicated `/playground` labs space (`playground/index.html`) hosting the WebLLM motorcycle-model interactive demo with low-key WebGPU requirement line and in-place loading.
- Rewrote `/hobbies` as a pure content page: removed WebLLM code/terminal, removed "Under Construction" tag, renamed `scrub.mp4` / `scrub2.mp4` to `coastal-ride-scrub.mp4` / `mountain-curves-scrub.mp4` with captions, and simplified TikTok section to a single clean embed.
- Added "Playground" to site-wide topbar navigation between "Hobbies" and "Contact".

### 2026-08-07 — Align About Me typography and color with site-wide design system
- Updated `/aboutme/index.html` body paragraph text color from dark ink (`#202B36`) and weight 450 to muted gray (`#62717C`, `var(--muted)`) and weight 400.
- Unified topbar `.mark` brand, navigation links, and link hover states across `/aboutme/index.html` and `/the_studio/index.html` to match the site-wide design standard.

### 2026-08-27 — Add 2:1 macOS and 9:16 mobile screenshot preview banners to homepage cards
- Integrated screenshot preview banners across all 8 app cards on `index.html`.
- Standardized aspect ratios: 2:1 for macOS apps (Wedding Concierge, Unli Rice, Unli Disk) and 9:16 for iOS/iPadOS apps (Unli Rice Capture, ClearSpace, Shuttle Vision, Kitchen Vision, Architecturally).
- Mobile screenshots sit centered in a subtle dark inset stage (`rgba(0,0,0,0.22)`) with `max-height: 380px` on desktop and `290px` on mobile (375px), preventing vertical layout stretching while maintaining UI legibility.

## Deploying OpenGrail

`/opengrail/` is not built from this repository. It is a vendored copy of the OpenGrail
project's production build. To publish a new version:

```bash
# in the OpenGrail project
npm run verify          # build + tests must pass first
npm run build

# vendor the build into this repository
rsync -a --delete <opengrail>/dist/ ./opengrail/

git add opengrail/ && git commit -m "deploy: ..." && git push
```

Pushing this repository is what triggers the Vercel deploy; pushing OpenGrail does nothing on
its own. Note that most of the artifact images are byte-identical between builds, so a normal
deploy touches only the bundle, `graph.json`, and `index.html`.
