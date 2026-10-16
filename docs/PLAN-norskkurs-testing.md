# Norsksti course testing on the studio site

The founder authorized changing the course admin password, adding the existing course at `calmdownoscar.com/playground/norskkurs`, and pushing it live for testing. This integration keeps the studio site static and keeps course hosting, server-side admin authentication, and the shared answer JSON file on the existing Norsksti Sites host. Student progress remains on each device; no database or new dependency is introduced.

## Implementation

- [x] `vercel.json`: temporarily redirect `/playground/norskkurs` to `/playground/norskkurs/`, then rewrite that scoped path and its descendants to `https://norsksti-a1-course.chalky-rhino-7996.chatgpt.site/`. Preserve every existing redirect, header, and route. Keep the course service worker uncached by intermediaries.
- [x] `playground/index.html`: add a short Norwegian course testing entry using the existing split layout and link styles. Keep the two existing AI experiments usable.
- [x] Verify JSON parsing, exact route destinations, preservation of existing configuration, and the course entry's accessible heading/link with a local static preview and `git diff --check`. Run the existing site checks.

Verified 2026-10-16: Node assertions parsed the configuration, checked the scoped routes and worker cache header, and deep-compared all previous configuration to the baseline. A temporary localhost HTTP preview returned 200 for Playground and its existing CSS/JS; HTML IDs were unique, labelled sections resolved, and the course link appeared once. `node Scripts/test-webmcp.mjs` passed 12 checks; `node Scripts/test-lastminute.mjs` passed 11 checks; `git diff --check` passed. Browser appearance and the live upstream course flow remain unverified at this integration checkpoint and are checked by the parent deployment task.

## Course-side contract

The course deployment owns the matching URL-prefix changes for browser requests, framework assets, worksheets, PDFs, manifest, and offline cache. Its service worker and install scope must stay inside `/playground/norskkurs/` on the studio domain. Admin mutations remain authenticated upstream; only the exact `https://calmdownoscar.com` and `https://www.calmdownoscar.com` origins are added to the existing server origin checks, and admin cookies on those origins use `Path=/playground/norskkurs/`. No password, signing secret, or server credentials belong in this repository.

## Deployment verification

The parent task publishes the updated course, commits only the intended integration files, pushes the verified studio commit to production, and verifies the public URL. Check that the course opens at the requested path, assets and APIs stay under it, the new password signs in, unauthenticated writes fail, shared answers persist, and PWA registration/offline navigation are scoped correctly. Confirm the existing studio homepage and Playground still load. Record anything not exercised as unverified.

The first live pass confirmed that descendant paths, including `/api/answers`, proxy
correctly, but Vercel did not match the empty course root with the wildcard rule.
An explicit trailing-slash root rewrite is therefore required before the wildcard.

## Classroom dashboard and Norwegian guide

The founder authorized publishing the classroom dashboard and an administrator guide at `/playground/norsksti/user_guide`. The course owns the guide source and manual approval model. The studio integration adds only the guide alias and the Google browser authorization policy for the course route.

- [x] `vercel.json`: rewrite both guide URL slash forms to the existing course host's `/user_guide`; retain the course's asset prefix for shared styles.
- [x] `vercel.json`: give only `/playground/norskkurs/` Google Identity Services script/style/frame access and Google APIs connection access; keep the existing Playground policy for other tools. Set `Cross-Origin-Opener-Policy: same-origin-allow-popups` for Google's account chooser. No Google tokens or client secret enter this repository.
- [x] Verify configuration parsing, route destinations, scoped policies, `git diff --check`, and existing static site checks. Publish the course first, then push the studio integration and confirm the requested guide URL returns its Norwegian content.

Verified locally: route/policy assertions preserve every prior redirect and other Playground security headers; 12 WebMCP checks and 11 existing trial checks pass. Course build and 127 course tests pass. Browser flow confirmed courses 1–3 open together, course 4 stays locked until all six approvals, then course 4 opens while course 5 waits. Guide desktop/mobile layouts fit without horizontal overflow. Course version 5 (source `47dad56d62466a961451b1ff09f5c6c7490bf78f`) published successfully before this studio integration push. Public alias confirmation is performed after Vercel deployment.

Google web OAuth client setup remains a separate owner action. The guide explains the setup and shared Drive file permissions. Publication alone cannot verify a Google consent or Drive save flow without that client configuration.
