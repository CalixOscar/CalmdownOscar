# PLAN — moving aurora (prototype)

**Intent.** The home header is a real aurora photo set as two CSS 3D layers. It is personal but
static, and a real aurora is never static. Make the curtains in the photo move the way the real
thing does (slow sideways sway, brightness travelling along the rays) while the trees stay
still, so the header feels alive without adding anything that isn't in the photo.

**Tier.** Tier 1 for this prototype: plain WebGL2, no library, one new page in `playground/aurora/`,
the live header (`assets/sky3d.js`) untouched. It becomes tier 2 the moment it replaces the live
header or pulls in three.js: then Codex pre-mortem, and a Decisions Log entry for the spec
exception below.

**Spec conflict to settle before shipping.** `docs/calmdownoscar_spec.md` §1.3: "Nothing loops"
and "Animate transform and opacity only". A drifting aurora is a continuous loop rendered in a
canvas. Prototype first; if it earns its place, write the exception (header only, slow, stops
off-screen, off under reduced motion) into the Decisions Log.

## Approach

- One full-screen quad, one fragment shader, two textures: `assets/aurora-sky.jpg` (sky, trees
  painted out) and `assets/aurora-trees.webp` (trees cut out, alpha).
- Cover-fit the 3:4 photo to the canvas at the same 50% 46% focus the CSS uses.
- Aurora mask from blurred luminance and saturation of the sky texture, so dark sky and single
  stars barely move and the bright curtains do.
- The rays converge near the top centre of the photo (the corona). Displace sky pixels
  perpendicular to the ray direction with slow noise that varies along the ray, plus a faint
  brightness wave travelling down the rays. Amplitude in the order of 0.5% of the image; periods
  of 8–15 s.
- Trees are drawn on top, undisplaced. Mouse / gyro look shifts sky and trees by different
  amounts (2D parallax standing in for today's CSS 3D).
- DPR capped at 1.5; render paused when the header is off-screen or the tab is hidden; not started
  under reduced motion or without WebGL2 — the flat CSS photo stays.

## Checklist

- [x] `planner` — write this plan
- [x] `build` — `playground/aurora/index.html`: the home intro (headline, toddler) over the canvas, a
      Moving / Still toggle to compare, `noindex`
- [x] `build` — `playground/aurora/aurora-gl.js`: WebGL2 setup, shader, input, pause rules, fallback
- [x] `planner` — review the diff; browser check at desktop and 375: renders, no console errors, no
      sideways scroll, Still is pixel-identical over time. Reduced motion checked by reading the code
      only; frame cost on a real phone (unverified)
- [x] `planner` — founder decided (2026-10-29): move it to the home header. Plain WebGL2, no new
      dependency, so tier 1. `assets/aurora-gl.js` replaces `sky3d.js` on home and loads `sky3d.js`
      itself if WebGL2 fails; Apps and How I work keep `sky3d.js`. Spec §1.3 records the loop exception.
