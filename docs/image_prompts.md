# Image prompts — calmdownoscar.com

**Purpose:** replace every placeholder vector, decorative SVG, and empty visual slot with restrained editorial photography. Generated where a real photo isn't practical; shot where it is.

## Rules before you generate anything

1. **Never generate a product screenshot.** Every app UI on this site must be a real capture from a real build. A generated "app interface" is a fabricated product claim, not a design asset. Screenshots already in `assets/` stay.
2. **Never generate a portrait of the founder or his son.** Use real photos. `assets/Oscar.jpeg` and `assets/oscar-crawl.mp4` exist and are real.
3. **Never generate text, logos, UI chrome, or readable code.** Models render these as garbage and it's the single fastest tell. All type comes from HTML.
4. **Prefer shooting over generating** for anything on the desk. An iPhone photo of the actual workspace in window light beats a synthetic one, and it's true.
5. **Every generated image gets a `data-generated` attribute in the markup** and is disclosed in the page source comment. Ambient plates only — never as evidence of anything.

## Global style contract

Append to every Midjourney prompt:

```
shot on Leica Q3, 28mm, f/4, natural window light, muted neutral palette, warm off-white and deep slate, single warm accent, high micro-contrast, matte finish, editorial documentary photography, no people unless specified, no text, no logos, no screens showing UI --style raw --stylize 150 --ar 16:9 --v 7
```

Universal negative (Midjourney `--no`, or Flux negative prompt):

```
--no text, letters, watermark, logo, ui, interface, screenshot, illustration, vector, 3d render, cgi, cartoon, isometric, lens flare, bokeh balls, hdr, oversaturated, teal and orange grade, purple, violet, neon, glow, plastic sheen, stock photo smile, hands with wrong fingers, floating objects, glass morphism
```

Flux (dev/pro) note: drop the `--` params, keep the descriptive body, add `natural imperfect detail, slight sensor grain, unretouched` and run at `guidance 2.8–3.2` — higher guidance is what produces the plastic AI sheen.

---

## 1. Hero ambient plate — `assets/hero-plate.avif`
Sits behind the H1 at `opacity .14`, grayscale. Must read as texture, not subject.

**Midjourney**
```
Pre-dawn desk corner in a small home office, a closed aluminium laptop and a cold cup of coffee at the edge of frame, most of the composition empty tabletop in soft directional window light, deep shadow falling right to left, dust visible in the light shaft, matte grey-green wall, quiet and unstyled, shot on Leica Q3, 28mm, f/4, natural window light, muted neutral palette, high micro-contrast, editorial documentary photography, no people, no text, no logos --no text, letters, watermark, logo, ui, screenshot, illustration, vector, 3d render, cartoon, lens flare, hdr, oversaturated, purple, neon, glow, plastic sheen, glass morphism --style raw --stylize 150 --ar 21:9 --v 7
```
**Post:** desaturate to ~15% saturation, lift blacks slightly so the H1 sits cleanly on top, export AVIF ≤120KB at 2400px wide.

---

## 2. Studio still life — `assets/studio-desk.avif`
For `/the_studio/` header and the OG card crop.

**Midjourney**
```
Overhead flat lay on a scratched oak desk, MacBook Pro closed, iPhone face down, iPad with a stylus resting diagonally, a spiral notebook open to blank graph paper, one pencil, a single small toy car pushed to the corner of frame, honest working mess not styled minimalism, hard afternoon window light with defined shadow edges, warm off-white and deep slate palette, shot on Leica Q3, 28mm, f/5.6, high micro-contrast, matte finish, editorial documentary photography, no text, no logos, screens off and black --no text, letters, watermark, logo, ui, interface, screenshot, illustration, vector, 3d render, cartoon, isometric, lens flare, bokeh balls, hdr, oversaturated, purple, neon, glow, plastic sheen --style raw --stylize 120 --ar 16:9 --v 7
```
**Note:** the toy car is the only warmth cue and the only nod to a kid being around. One object, not a scene.

---

## 3. Wedding Concierge plate — `assets/plate-nuptia.avif`
Grounding and place, not weddings-as-stock.

**Midjourney**
```
A printed venue shortlist and a folded paper map on a table beside two ceramic cups, one corner of a laptop visible, late afternoon light through a window, calm and administrative rather than romantic, no flowers, no bride, no rings, warm off-white and deep slate palette, shot on Leica Q3, 35mm, f/4, natural window light, high micro-contrast, matte finish, editorial documentary photography, no text readable, no logos --no readable text, letters, watermark, logo, ui, screenshot, illustration, vector, 3d render, cartoon, bride, groom, wedding dress, rings, bouquet, confetti, lens flare, bokeh balls, hdr, oversaturated, purple, neon, glow --style raw --stylize 130 --ar 4:3 --v 7
```

---

## 4. Unli Rice plate — `assets/plate-unlirice.avif`
Shared memory across agents. Physical metaphor, not a network graph.

**Midjourney**
```
A single wooden card-catalogue drawer pulled open on a desk, densely packed index cards seen edge-on, one card lifted slightly proud of the others, raking side light picking out the paper edges, deep shadow inside the drawer, archival and precise, warm off-white and deep slate palette, shot on Leica Q3, 50mm, f/5.6, high micro-contrast, matte finish, editorial documentary photography, no text, no logos --no text, letters, handwriting, watermark, logo, ui, illustration, vector, 3d render, cartoon, isometric, network diagram, glowing nodes, lens flare, hdr, oversaturated, purple, neon, glow, plastic sheen --style raw --stylize 130 --ar 4:3 --v 7
```

---

## 5. ClearSpace plate — `assets/plate-clearspace.avif`
40,000 photos. Volume and near-duplication, physically.

**Midjourney**
```
An overwhelming loose stack of 4x6 printed photographs spilling across a table, several near-identical frames of the same scene visible side by side, one slightly blurred, top-down at a slight angle, hard directional light, muted faded print colours, sense of unmanageable volume, shot on Leica Q3, 35mm, f/5.6, high micro-contrast, matte finish, editorial documentary photography, no faces recognisable, no text, no logos --no text, letters, watermark, logo, ui, screenshot, illustration, vector, 3d render, cartoon, recognisable faces, lens flare, bokeh balls, hdr, oversaturated, purple, neon, glow --style raw --stylize 140 --ar 4:3 --v 7
```

---

## 6. Unli Disk plate — `assets/plate-unlidisk.avif`
Dev cruft and reclaimed space.

**Midjourney**
```
A cleared shelf with rectangular dust outlines where objects sat for years, two old external hard drives stacked to one side, cables coiled, empty space dominating the frame, cool grey light, quiet aftermath of a clear-out, warm off-white and deep slate palette, shot on Leica Q3, 28mm, f/5.6, high micro-contrast, matte finish, editorial documentary photography, no text, no logos --no text, letters, watermark, logo, ui, illustration, vector, 3d render, cartoon, isometric, lens flare, hdr, oversaturated, purple, neon, glow, plastic sheen --style raw --stylize 130 --ar 4:3 --v 7
```

---

## 7. Architecturally plate — `assets/plate-architecturally.avif`
Sketch becoming structure. Draft stage — the image should feel unfinished too.

**Midjourney**
```
A rough freehand floorplan sketched in pencil on tracing paper, laid over a precise printed architectural drawing beneath it so both are visible, a stylus and a steel ruler resting on top, hard raking light, graphite texture visible, deliberately unfinished, warm off-white and deep slate palette, shot on Leica Q3, 50mm, f/5.6, high micro-contrast, matte finish, editorial documentary photography, no readable text, no logos, no dimensions legible --no readable text, letters, numbers, watermark, logo, ui, illustration, vector, 3d render, cgi, cartoon, isometric, blueprint blue, lens flare, hdr, oversaturated, purple, neon, glow --style raw --stylize 130 --ar 4:3 --v 7
```

---

## 8. Dark section texture — `assets/slate-texture.avif`
Optional. Behind S3 at `opacity .05`. Only ship it if flat `--slate` looks dead in the browser; check first.

**Midjourney**
```
Extreme close-up of unpolished dark slate stone surface, fine natural grain and micro-fracture lines, even flat lighting, almost abstract, near-black charcoal with cool grey variation, no highlights, no gloss, macro photography, matte finish --no text, letters, watermark, logo, illustration, vector, 3d render, pattern repeat, tile seam, lens flare, glow, purple, neon, oversaturated --style raw --stylize 80 --tile --ar 1:1 --v 7
```
**Post:** convert to greyscale, reduce contrast hard, verify it adds nothing over 4KB of perceived noise before shipping it.

---

## 9. OG / social card — `assets/og-card.jpg`
1200×630. Composite, not generated whole: crop **#2 (studio desk)** to 1200×630, drop to 40% opacity over `--slate`, and set the H1 and wordmark in real HTML type rendered to image. Never let a model draw the text.

---

## Delivery checklist

- [ ] Export AVIF with WebP fallback; each plate ≤140KB at 2400px.
- [ ] `width`/`height` on every `<img>`; `loading="lazy"` below the fold.
- [ ] Alt text describes the photograph's content; ambient plates get `alt=""` and `aria-hidden="true"`.
- [ ] Every plate passes the tells check: no text artifacts, no melted hands, no impossible reflections, no duplicated objects, no gradient sky in an interior.
- [ ] Desaturated toward the site palette so no plate introduces a second accent hue.
- [ ] Generated files listed in a `docs/generated-assets.md` note with prompt and date, so provenance is recoverable.
