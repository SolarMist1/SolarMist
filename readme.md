# SolarMist — Website

Touch-free sunscreen booth concept site for outreach and pilot recruitment.

**Live:** https://solarmist.co.uk  
**Stack:** Vanilla HTML/CSS/JS (no build). Formspree for forms. Google Fonts.

---

## Quick start (local)

Any static server works:

    # Option A (Node)
    npx serve . -p 8080

    # Option B (Python)
    python3 -m http.server 8080

Open http://localhost:8080

---

## Project structure

    /
    ├─ index.html
    ├─ style.css
    ├─ script.js
    ├─ images/
    │  ├─ backgroundv10.png
    │  ├─ modelv5.png
    │  ├─ preview-v5.jpg        (OG/Twitter preview 1200×630)
    │  ├─ cormac.png / hannah.png
    │  ├─ handicon.png, stopwatch.png, family.png, leaf.png, recycle.png, umbrella.png, clean.png, handshake.png
    │  ├─ favicon-16x16.png / 32x32.png / 96x96.png
    │  ├─ android-chrome-192x192.png / 512x512.png
    │  ├─ apple-touch-icon.png
    │  ├─ favicon.svg / favicon.ico
    │  └─ site.webmanifest
    ├─ sitemap.xml               (only real URLs, not #fragments)
    └─ robots.txt                (points to sitemap)

---

## Configuration

### Forms (Formspree)
- **Hero + Launch forms** (`#heroForm`, `#launchForm`) → `https://formspree.io/f/xwpqawqo`  
- **Survey form** (`#surveyForm`) → `https://formspree.io/f/xwpbwepj`  
- Redirect set via hidden input:

    `<input type="hidden" name="_redirect" value="https://solarmist.co.uk/thanks/">`

If the thanks URL changes, update `_redirect` in all forms and `THANKS_URL_DEFAULT` in `script.js`.

### Script constants (in `script.js`)
- `MOBILE_MAX`
- `LAUNCH_DATE_ISO`
- `THANKS_URL_DEFAULT`
- `PROGRESS_BAR_ID`
- `SURVEY_PROGRESS_CLASS`

---

## SEO

- **Canonical**  
  `<link rel="canonical" href="https://solarmist.co.uk/" />`
- **Meta description** and concise, unique `<title>`.
- **Open Graph / Twitter** using `images/preview-v5.jpg` (1200×630).
- **Structured data**  
  - `Organization` + `WebSite` JSON-LD in `<head>`  
  - `FAQPage` JSON-LD next to visible FAQ (content matches on-page text).
- **Sitemap** — include only real URLs (avoid `#about`, `#features`, etc.).  
- **robots.txt** should allow crawling and reference the sitemap:

    User-agent: *
    Allow: /
    Sitemap: https://solarmist.co.uk/sitemap.xml

- **Thanks page** (if you add one):  
  In `/thanks/index.html`, add:

    `<meta name="robots" content="noindex,follow">`

### Minimal `sitemap.xml`

    <?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>https://solarmist.co.uk/</loc>
        <priority>1.0</priority>
      </url>
      <!-- Optional: include only if it exists as a REAL page -->
      <!--
      <url>
        <loc>https://solarmist.co.uk/thanks/</loc>
        <priority>0.2</priority>
      </url>
      -->
    </urlset>

---

## Accessibility

- Mobile menu: ARIA, focus trap, Esc to close.
- Progress bar: `role="progressbar"` with `aria-valuemin/max/now` during survey.
- `:focus-visible` styles included across interactive elements.
- Keyboard test (Tab/Shift+Tab) across header, mobile menu, forms, FAQ.

---

## Performance

- Preconnect to Google Fonts; preload hero background + primary model image.
- `loading="lazy"` on non-critical images.
- Compress large images; keep preview at 1200×630.
- Re-run Lighthouse after visual/content changes.

---

## Deploy

Works on any static host (Netlify, Vercel, GitHub Pages, S3/CloudFront, etc.).

**Caching tips**
- Long cache for `/images/*`.
- Short cache (or no cache) for `index.html` so edits go live immediately.

---

## Maintenance

- Keep dates/copy current (e.g., “Pilot installs Summer 2026”).
- Update `preview-v5.jpg` if branding/hero changes (re-scrape social cards).
- Check Formspree quotas/settings monthly.
- Re-run Lighthouse quarterly or after major edits.

---

## Contact

info@solarmist.co.uk  
https://www.linkedin.com/company/solarmist
