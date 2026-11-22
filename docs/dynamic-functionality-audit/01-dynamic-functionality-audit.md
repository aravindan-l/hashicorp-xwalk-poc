# Dynamic Functionality and Backend Dependency Audit — www.hashicorp.com/en

Audit date: 15 November 2026 · Scope: English site (3,909 sitemap URLs, 3,896 analysed, 97 templates) · Target: AEM Sites (Universal Editor / xwalk) + Edge Delivery Services (EDS)

This audit only analyses the site. No code, blocks, configuration or content were changed, and no forms were submitted.

## How to read this report

Each finding is marked with a confidence level:

| Mark | Meaning |
|---|---|
| **[C] Confirmed** | Seen directly: a live network request or response, rendered DOM, or captured page HTML |
| **[P] Probable** | Strong indirect evidence (naming, cookie or script presence, standard vendor behaviour), not observed end to end |
| **[U] Unknown** | Can't be determined from the public site: it needs the HashiCorp web or marketing-ops team |

Category codes (a feature can have several):
**A** Static · **B** Frontend-only interaction · **C** Dynamic content (index/CMS/API) · **D** External API integration · **E** Backend/server-side logic · **F** Authentication/personalization · **G** Third-party integration

### Evidence sources

1. **Site-wide DOM scan**: the captured HTML of all 3,896 analysed pages from the site scope. Header and footer were separated from main content. See `evidence/site-wide-dom-feature-aggregate.json` and `02-page-feature-inventory.csv`.
2. **Live network captures**: 30 representative pages loaded in a real browser (Bright Data, the same route the analyzer used), recording XHR/fetch calls, POST body keys, response shapes, cookie names and loaded scripts. Query values and cookie values were not stored. See `evidence/network-*.txt|jsonl`.
3. **Interaction probes**: blog search submit, listing filters, the "Explore topics" menu, Marketo form inspection without submitting, quiz first step, header links, pricing controls, and hub pages missing from the sitemap. See `evidence/probe-*.json`.

### Limits

- No forms were submitted, so Marketo submit endpoints and post-submit behaviour are **[P]**.
- No login was attempted. Authenticated states of portal.cloud.hashicorp.com and app.terraform.io weren't inspected.
- Server-side code (Next.js server components, Vercel middleware, the DatoCMS→Algolia sync) isn't visible. Anything about it is **[P]** or **[U]**.
- PostHog flag *variants* and Demandbase usage rules live in vendor consoles **[U]**.
- Only English was scoped. The site also serves 10 other locales (see F17).

---

## 1. Executive summary

**Source platform [C]:**
- Next.js (App Router, React Server Components) hosted on Vercel
- Content from **DatoCMS**: assets on `www.datocms-assets.com` on 3,702 of 3,896 pages
- Search and listings on **Algolia** (application `YY0FFNI7MF`)
- Forms on **Marketo** (Munchkin `845-ZLF-191`, forms served from `go.hashicorp.com`)
- Chat on **Qualified**, consent on **DataGrail**, experiments on **PostHog** feature flags, ABM on **Demandbase**
- About 20 analytics and ad tags

**What is static:**
- Most of the page volume is static content once it has been rendered. That covers 1,612 blog pages, 474 resource pages, about 480 partner profiles, 1,100+ webinar pages, and the product, solution, legal and trust pages.
- Their interactive parts (tabs, accordions, carousels, code copy, the pricing comparison table, the conference agenda day tabs, the quiz) are **frontend-only (B)**. The content is already in the page.

**What can't be migrated as static HTML/CSS/authored content alone:**

| # | Capability | Where | Why it is dynamic |
|---|---|---|---|
| 1 | **Site search & faceted listings** (7 Algolia indexes) | Blog search on 1,612 pages; /en/events, /en/resources, /en/case-studies, /en/partners/find-a-partner, /en/ambassador/directory, /en/press/all | Client-side queries to Algolia. Index fed from DatoCMS by a sync the site doesn't expose **[P]** |
| 2 | **Marketo forms** (22 form IDs) | Newsletter in every footer (3,506 pages), webinar gate (~330), gated downloads (~110), contact sales, partner applications | Marketo forms2 runtime plus Marketo backend (lead capture, routing, spam check) |
| 3 | **Gated content** | 332 on-demand webinars, ~107 on-demand assets, report downloads | Video/PDF revealed after a Marketo submit. The gate is client-side only **[C/P]** |
| 4 | **Time-based webinar/event state** | 135 "Recording coming soon", 332 on-demand, upcoming registrations; events index sorted by start time | State derived from event dates (CMS fields + Algolia `startTime`/`recorded`) |
| 5 | **Automatic content listings** | Blog home, 9 product, 20 tag and 3 category pages (tag pages list up to 450 posts), press, agenda | Built on the server from DatoCMS queries at render time |
| 6 | **Personalization / experiments** | Site-wide | PostHog flags (`homepage-footer-cta`, `vault-overview-cta`, `nav-signup-cta-experiment`), Demandbase IP→company, geo cookie `hc_geo`, localized-page banner |
| 7 | **Localization & edge middleware** | Site-wide | 11 locales (hreflang), `NEXT_LOCALE` cookie, 307/308 redirects, Vercel bot checkpoint |
| 8 | **Third-party embeds** | Many | YouTube (768 pages), Wistia (55), DatoCMS-hosted MP4 (≈45), SoundCloud (38), SlideShare (8), Cvent registration (2), Qualified chat (all) |
| 9 | **RSS/Atom feeds** | /blog/feed.xml and per-category feed.xml | Generated on the server from the CMS |

**No on-site authentication was found [C].** "Log in" and "Get started" are plain links to `portal.cloud.hashicorp.com`, and no page changes based on a login session. Personalization is anonymous (flags, IP, geo).

**Is Java/backend development needed?** No feature strictly needs a custom Java backend. Three need **server-side logic somewhere**:

1. Keeping a search index in sync with AEM content (if Algolia stays)
2. Feeds (RSS/Atom)
3. Optional hardening: secure gated assets, flicker-free server-side experiments, geo detection

Everything else can be built with EDS frontend code plus the existing SaaS backends (Marketo, Algolia, Qualified, Cvent, PostHog, DataGrail). Section 6 recommends the simplest architecture per item. That is serverless (Adobe App Builder / I/O Runtime or a CDN edge function), with Java/Spring Boot only if it is already an organisational standard.

---

## 2. Platform and global (every page) dependencies

| Item | Evidence | Status |
|---|---|---|
| Next.js App Router + RSC; links prefetched with `?_rsc` (`text/x-component`) | 8–44 `_rsc` prefetch calls per page; `/_next/static/chunks/app/` scripts | [C] |
| Hosted on Vercel (Speed Insights `/_vercel/speed-insights/script.js`, Security Checkpoint `/.well-known/vercel/security/*`, HTTP 429 "Vercel Security Checkpoint" to non-browsers) | network captures; plain curl returns 429 | [C] |
| DatoCMS as headless CMS (images, MP4s, 98 PDF links on `www.datocms-assets.com/2885/...`) | 3,702 pages reference Dato assets | [C] CMS role [P] (API calls are server-side, not visible) |
| Global header: mega-menu (frontend), "Log in" → portal.cloud.hashicorp.com/sign-in, "Get started" → /sign-up (with `ajs_aid` analytics id appended in some CTAs), "Contact us" → /en/contact-sales | probe-widgets header step | [C] |
| Global footer: Marketo newsletter form **2459** (Email + privacy consent + 10 UTM hidden fields + `Signed_Up_For`) on 3,506 pages; links to status, brand, IR, developer, GitHub | DOM scan `chrome.marketoForm:2459` | [C] |
| IBM alert/announcement bar (3,591 pages), linking to an ibm.com ON24 webinar form | DOM scan; block catalog `announcement-bar` | [C] (static, authored) |
| Qualified chat (`js.qualified.com`, messenger iframe, `/w/1/CWQA3q9CaEKHNF2t/messages`, `/cookie_consent_policy`) | 29/30 captures | [C] |
| DataGrail consent ("Cookie Manager" footer link, `api.consentjs.datagrail.io`, `datagrail_consent_id` cookie) | all captures | [C] |
| PostHog (EU) feature flags via `POST eu.i.posthog.com/flags/` + event capture; `ph_bootstrap_data` **httpOnly** cookie set by www.hashicorp.com | all captures | [C] flags; server-side bootstrap [P] |
| Demandbase (`tag.demandbase.com`, `POST api.company-target.com/api/v3/ip.json` → company_name, industry, employee_range, revenue, audience_segment…) | all captures | [C] call; use for on-page personalization [U] |
| Marketo Munchkin (`munchkin.marketo.net`, `845-zlf-191.mktoresp.com/webevents/visitWebPage`, `_mkto_trk`) | all captures | [C] |
| Analytics/ads: GTM, GA4, Google Ads/Floodlight (DC 14263996), Meta Pixel + a Cloud Run endpoint (`mpc-pilot-2-…run.app/events`, Meta pixel event data), Reddit, LinkedIn Insight, The Trade Desk, Xandr, Index Exchange, LiveRamp (`rlcdn`), Bidswitch, Ahrefs Analytics, Fathom, Datadog RUM, Sentry | all captures | [C]; purpose of the Cloud Run endpoint [P] server-side conversions gateway |
| Cookies set by www.hashicorp.com: `NEXT_LOCALE`, `hc_geo`, `ph_bootstrap_data` (httpOnly), `datagrail_consent_*`, `my_visit`, `site_page_views`, `_dd_s` | captures | [C] names; semantics of `hc_geo`, `my_visit`, `site_page_views` [U] |
| Localization: hreflang x-default, ja, pt, de, es, ko, fr, id, zh, it, ar; "Available languages" switcher and "Close localized page notification" banner on blog | probe-widgets header, probe-blog | [C]; geo-driven banner logic [P] |
| Redirects: non-locale paths 307 → `/en/...` (e.g. `/contact-sales`), vanity `/en/go/*` 308, `/en/integrations` → `/en/partners/find-a-partner?category=tech`, retired URLs 308 → ibm.com | captures | [C]; total rule set [U] |

---

## 3. Dynamic feature catalogue

Each feature lists the 14 attributes requested. "Pages" counts come from the DOM scan (main content only) unless stated otherwise.

### F01 — Blog search (site search for "The Stack")
1. **Feature:** Blog/keyword search with results, facets and "Load more"
2. **Source URLs:** search box on 1,612 blog pages (e.g. https://www.hashicorp.com/en/blog); results at https://www.hashicorp.com/en/blog/all?q=terraform
3. **Component:** blog sub-navigation search form (`form[role=search]`, `#subnavSearch`) + results page (block catalog: blog sub-nav, cards-blog)
4. **What it does:** full-text search over blog posts, with filters for category (3 values) and product (7 values). For `q=terraform`: 483 hits, 12 per page, 41 pages.
5. **Behaviour:** submit navigates to `/en/blog/all?q=<term>`. The page shell renders on the server, then the browser queries Algolia and renders the hits. "Open filters / Clear filters / Load more" re-query Algolia. **The page itself returns HTTP 500 on first render** while the client-side results still work [C].
6. **User interaction:** yes (typing, submit, filters, load more)
7. **Data source:** Algolia index `www:prod:blog`; `POST https://yy0ffni7mf-dsn.algolia.net/1/indexes/*/queries` (fallback `yy0ffni7mf-2.algolianet.com`); click/view events to `insights.algolia.io/1/events` [C]
8. **Method/format:** POST JSON multi-query, response `{results:[{hits, nbHits, page, nbPages, hitsPerPage, facets, query, params}]}`. Hit fields: `title, slug, content, category, products, productList, tags, authors, orderingDate(Timestamp), photoUrl/Alt/Width/Height, objectID` [C]
9. **Backend logic required:** search itself is SaaS (Algolia). **Indexing** needs a server-side process that pushes content to Algolia with an admin key [P: today a DatoCMS→Algolia sync]
10. **Database/external service:** Algolia (external SaaS)
11. **Auth:** public search-only API key sent from the browser (normal for Algolia) [C]. Admin/write key needed server-side for indexing [P]
12. **EDS approach:** pick one of two options:
    - **Option A (keep Algolia):** a `search-results` block that queries Algolia from the browser (InstantSearch or a light client) after LCP, plus an indexing job fed by AEM publish events.
    - **Option B (EDS-native):** a `query-index` (helix-query.yaml) with title, description, tags, products, category, date and image. The block filters and searches on the client. It's fine for about 2,000 posts but gives metadata search only, not full body text.
    - The existing header search already posts to the live hashicorp.com URL (`blocks/header/header.js`) and must be repointed.
13. **Dependencies/unknowns:** who owns the Algolia app and index config (synonyms, ranking, replicas) [U]; why the SSR returns 500 [U]; whether full-text body search is a requirement [U]
14. **Complexity:** **High** with Algolia (indexing pipeline) · **Medium** with query-index

### F02 — Events & webinar listing
1. Upcoming and on-demand events listing with filters
2. https://www.hashicorp.com/en/events and https://www.hashicorp.com/en/events/recorded-webinars (both currently HTTP 500 on SSR); `/en/events/webinars/recorded` answers 308 (prefetched from /en/events); `/en/events/webinars` returns 404 [C]
3. Events listing page (filters + cards)
4. Lists webinars and workshops, with filters for type (Webinar, Workshop), product, language (English…) and region (Americas…)
5. Client-side Algolia query sorted ascending by start time (replica `events-asc`); filter clicks re-query
6. Yes
7. Algolia `www:prod:events-asc`; hit fields `title, slug, startTime, endTime, startTimestamp, audienceSegment, region, language, badges, products, tags, series, eventType, type, recorded, isHidden` [C]
8. POST JSON (as F01)
9. Indexing only (as F01). Upcoming vs. past depends on comparing dates (client or index) [P]
10. Algolia
11. Public search key
12. Same choice as F01. With query-index, store `startTime/endTime/type/region/language/products/recorded` as page metadata and filter/sort on the client. Use `isHidden` → `robots`/exclude metadata.
13. How past events get `recorded=true` (manual or automatic) [U]
14. **Medium**

### F03 — Resource library
1. Faceted resource library (2,025 records)
2. https://www.hashicorp.com/en/resources (**not in the sitemap; HTTP 500 on SSR**) [C]; detail pages /en/resources/* (454 in scope)
3. Resource listing + search input + filters
4. Filters: "Show only enterprise content", product, type (Presentation, Case Study, Demo, Recorded Webinar…), language, industry, infrastructure provider
5. Client-side Algolia; "Show more" facets; "Load more" results
6. Yes
7. Algolia `www:prod:resources`; hit fields `title, slug, industry, infrastructureProvider, language, products, contentType, enterprise, postDate(Timestamp), imageUrl/Alt, externalLink` [C]
8. POST JSON
9. Indexing only
10. Algolia
11. Public key
12. As F01 (query-index is feasible: ~2,000 rows; facet fields as metadata)
13. 2,025 index records vs. 454 resource pages in the sitemap: the index also points to webinars, case studies and external links (`externalLink`) [P]. Source of the non-page records [U].
14. **Medium**

### F04 — Case studies listing
1. Customer stories listing
2. https://www.hashicorp.com/en/case-studies (HTTP 500 on SSR) [C]; 42 detail pages
3. Listing with industry, product and region filters + Load more
4. Filters: Financial Services, Retail, Media, SaaS…; Terraform, Vault, Consul, Nomad…; AMER, EMEA, APAC
5. Client-side Algolia
6. Yes
7. Algolia `www:prod:case-studies` (100 records); facets `regions, industry(16), products(8)`; hit fields include `externalLink, enterprise, language, contentType` [C]
8. POST JSON
9. Indexing only
10. Algolia
11. Public key
12. query-index + filter block (small data set: **Low** if EDS-native)
13. Records with `externalLink` (case studies hosted elsewhere) [U]
14. **Low–Medium**

### F05 — Partner directory
1. "Find a partner" directory (478 partners)
2. https://www.hashicorp.com/en/partners/find-a-partner (**not in sitemap; HTTP 500 on SSR**); `/en/integrations` redirects to `?category=tech` [C]; 478 partner profiles under /en/partners/{tech,systems-integrators,cloud,…}
3. Directory: search box, partner type radios (Cloud, Systems integrators, Technology, Training), product and region checkboxes
4. Searches and filters partners; the URL keeps filter state (`?category=tech`)
5. Client-side Algolia
6. Yes
7. Algolia `www:prod:partners`; facets `regions, category, products, hasSITier, allSITiers, mainSITier, competencies, hasCompetencies`; hit fields `name, description, slug, partnerType(Label), category(Label), logo, products, regions, *SITier*, competencies` [C]
8. POST JSON
9. Indexing only
10. Algolia (partner data possibly mastered in a partner system/PRM [U])
11. Public key
12. query-index over partner profile pages (metadata: type, tier, competencies, products, regions, logo) + directory block; or Algolia
13. Source of truth for partner tiers/competencies: CMS or a partner portal feed [U]
14. **Medium**

### F06 — Ambassador directory
1. HashiCorp Ambassadors directory (107 people)
2. https://www.hashicorp.com/en/ambassador/directory (HTTP 500 on SSR) [C]
3. Directory with search + region/product filters
4. Profiles with photo, name, location, biography, products, region
5. Client-side Algolia
6. Yes
7. Algolia `www:prod:ambassadors`; facets `region(4), products(9)` [C]
8. POST JSON
9. Indexing only
10. Algolia
11. Public key
12. Author as one spreadsheet/JSON (EDS sheet) + directory block. No per-person pages exist, so a sheet is the natural source.
13. Personal data (bios, photos): consent/retention owner [U]
14. **Low**

### F07 — Press archive
1. Press & media archive (563 items)
2. https://www.hashicorp.com/en/press/all (HTTP 500 on SSR); https://www.hashicorp.com/en/press (curated, server-rendered) [C]
3. Archive with post type radios (Press releases, Media coverage, Analyst reports, Company news), year and language checkboxes
4. Lists press items, many of them external links (`url` field)
5. Client-side Algolia
6. Yes
7. Algolia `www:prod:press`; facets `year(12), language(4), postType(4)`; hit fields `title, url, category, postType, publishDate(Timestamp), year, imageUrl` [C]
8. POST JSON
9. Indexing only
10. Algolia
11. Public key
12. EDS sheet (press items are mostly link records) + filter block, or query-index for on-site press pages
13. Where external media-coverage items are authored [U]
14. **Low–Medium**

### F08 — Automatic blog/topic listings
1. Blog home, category, product and tag listing pages
2. https://www.hashicorp.com/en/blog, /en/blog/categories/* (3), /en/blog/products/* (9), /en/blog/tags/* (20) [C]
3. Card grids (cards-blog), featured carousels with "Previous/Next page" on the blog home
4. Lists posts by category/product/tag, newest first
5. **Rendered on the server**: no client API calls. The tag page `/en/blog/tags/aws` ships 450 cards in the HTML, with no pagination [C]
6. Only carousel navigation
7. DatoCMS queries run on the server at render time [P]
8. n/a (RSC/HTML)
9. Listing assembly is server-side today. In EDS it becomes query-index + a block.
10. DatoCMS → replaced by AEM + EDS query-index
11. None
12. Extend the existing `blog-list` block (today hand-picked; it fetches each article's `.plain.html`) with a **query-index mode** that filters by tag, product or category and adds pagination/"load more". Add tags/products/category/date/image to the index.
13. Ordering rules and featured-post curation [U]
14. **Medium**

### F09 — RSS/Atom feeds
1. Blog feeds
2. https://www.hashicorp.com/blog/feed.xml (Atom, generator `jpmonette/feed`) [C]; per-category `.../categories/customer-stories-success/feed.xml` (linked from the page) [C]
3. n/a (endpoint)
4. Machine-readable feed of the latest posts
5. Generated on the server
6. No
7. Server-generated from CMS data [P]
8. GET, `application/atom+xml`
9. **Yes**: something has to generate XML from content
10. Content store (AEM/query-index)
11. None
12. EDS has no built-in feed generator. Options: an edge worker / App Builder action that turns `query-index.json` into Atom; a scheduled job that writes `feed.xml` as a static resource; or drop the feeds if nobody uses them.
13. Subscriber usage (keep or retire) [U]
14. **Low–Medium**

### F10 — Marketo forms (newsletter, lead, contact, partner, event)
1. Marketo embedded forms (22 distinct form IDs; see `evidence/marketo-forms.tsv`)
2. Main examples:
   - **2459** newsletter in the footer of every page (3,506)
   - **2334** "Watch the recorded webinar" / webinar registration (≈327 webinar pages)
   - **1706** gated downloads (113, e.g. /en/cloud-complexity-report-2025-download)
   - **1307** /en/contact-sales; **1583** /en/contact/general-inquiry
   - **2526/2530** /en/lp/channel-partner, /en/lp/tech-partner
   - **3248** /en/lp/cloud-maturity/talk-with-an-expert
   - **2429/2426/2433/2382** localized webinars; **3351/3390/3384/3565/2921/2528** campaign LPs
3. Form block (Marketo `form.mktoForm`)
4. Captures leads: email, name, company, title, country, phone, product interests, inquiry type, consent, `fastTracktoSales`. Hidden fields: `utm_*__c` (×9), `form_page_url__c`, `is_spam__c`, `registeredWebinarID`, `formid`, `munchkinId`.
5. `go.hashicorp.com/js/forms2/js/forms2.min.js` renders the form. Submission goes cross-domain through the `go.hashicorp.com/index.php/form/XDFrame` iframe [C]. A script fills the UTM hidden fields from the URL or stored referrer (`lastExternalReferrer` in localStorage) [P]. Required-field validation runs on the client (Marketo) [C]. After a successful submit, the page reveals content, redirects, or shows a thank-you message [P].
6. Yes
7. Marketo instance `845-ZLF-191` (`go.hashicorp.com` = Marketo landing domain) [C]; submit endpoint `go.hashicorp.com/index.php/leadCapture/save2` [P, standard forms2, not observed because nothing was submitted]
8. POST form-encoded via the XDFrame postMessage bridge [P]
9. **Yes, but existing**: lead creation, dedupe, routing (`fastTracktoSales`), spam scoring (`is_spam__c`), program membership (`registeredWebinarID`), consent storage. All in Marketo/CRM.
10. Marketo (+ Salesforce CRM, inferred from the `__c` custom-field suffix) [P]
11. None for visitors. Marketo API credentials are not exposed or needed for embeds.
12. Build a **`marketo-form` block**:
    - The author enters the form ID (plus an optional thank-you URL/message).
    - The block loads forms2.js when the form scrolls into view.
    - It fills UTM and page-URL hidden fields.
    - It uses `onSuccess` for reveal/redirect.
    - It carries over the site CSS (the source overrides Marketo styles).
    - The footer newsletter goes in the footer fragment.
    - **Don't** rebuild on the EDS `form` block plus a custom submit proxy. That would mean re-implementing Marketo logic server-side.
13. Thank-you behaviour per form; UTM/attribution script rules; privacy-consent wording per country [U]
14. **Medium** (one block, many configurations)

### F11 — Gated content (webinar recordings, assets, reports)
1. Content gate
2. 332 on-demand webinar pages ("Watch the recorded webinar", e.g. https://www.hashicorp.com/en/events/webinars/15fen-defen-karu-terraformdeshi-xian-suruawszi-dong-hua); 107 /en/on-demand/* pages (e.g. /en/on-demand/hcp-consul-for-kubernetes-solutions-brief); report downloads (/en/cloud-complexity-report-*-download)
3. Form + hidden asset (video or PDF)
4. Shows the recording/asset only after the visitor submits the Marketo form
5. On the webinar page, no video iframe is in the DOM before submit, **but the video reference is already in the page's RSC payload** [C: `rscVideo:true`]. So the gate is client-side and the asset URL is public. PDFs are on public DatoCMS URLs (98 PDF links found) [C]. Probably a "remember me" cookie skips the gate on return visits [P].
6. Yes
7. Marketo (form) + YouTube/Wistia/DatoCMS (asset)
8. —
9. **Not today** (soft gate). It's only needed if the business wants *hard* gating.
10. Marketo; asset hosting (DatoCMS → AEM Assets)
11. None (soft gate). Hard gate → signed/expiring URLs.
12. Keep the soft gate. Put the asset reference in block config (not visible until `onSuccess`), or redirect `onSuccess` to an unlisted asset page/URL. Move PDFs to AEM Assets. If hard gating is required → see backend task BE-4.
13. Is the soft gate acceptable (it is today)? Return-visitor bypass rules [U]
14. **Medium**

### F12 — Time-based webinar/event state
1. Upcoming / "Recording coming soon" / on-demand switching
2. 135 pages "Recording coming soon"; 332 on-demand; upcoming registration pages (e.g. https://www.hashicorp.com/en/events/webinars/from-fragmented-workflows-to-policy-driven-hybrid-cloud-automation) [C]
3. Webinar hero / details (columns-webinar-hero, columns-webinar-details)
4. Before the event: registration form (Marketo 2334 with `registeredWebinarID`). After it: "Recording coming soon". Then: gated recording.
5. The state follows from CMS fields (start/end, recorded) at render time [P]; the listing uses Algolia `startTime/recorded` [C]
6. No (state is automatic)
7. DatoCMS fields + Algolia
8. —
9. Server-side today (render-time comparison) [P]
10. CMS
11. None
12. Page metadata (`event-start`, `event-end`, `recording-url`); the block decides the state on the client from the current date, so pages don't need re-publishing. Or authors switch state manually.
13. Which platform delivers the live webinar (Zoom/ON24/Goldcast/…): not visible on the public pages [U]
14. **Low–Medium**

### F13 — Conference registration (Cvent)
1. HashiDays registration
2. https://www.hashicorp.com/en/conferences/hashidays/registration-london, …/registration-singapore [C]
3. Embedded Cvent iframe (`web.cvent.com/event/<id>/register?embeddedRegistration&hideHeaderFooter`)
4. Full event registration and payment flow inside Cvent
5. The iframe loads Cvent plus RudderStack telemetry (`cvent-prod-dataplane.rudderstack.com`, `io.cvent.com`) [C]
6. Yes
7. Cvent (external SaaS)
8. Inside the iframe (not inspected)
9. Handled by Cvent
10. Cvent
11. Cvent session inside the iframe
12. Generic `embed`/iframe block with an allowed-domain list; pass `originalUrl`/`RefId` parameters
13. iframe auto-height messaging [U]
14. **Low**

### F14 — Live chat (Qualified)
1. Sales chat / chatbot
2. Every page (29/30 captures) [C]
3. Floating messenger iframe `app.qualified.com/w/1/CWQA3q9CaEKHNF2t/messenger`
4. Chat with a bot or sales rep; probably routes known accounts with Demandbase/Marketo data [P]
5. Loads after page load; checks `cookie_consent_policy`; posts visitor events and messages [C]
6. Yes (optional)
7. `js.qualified.com`, `app.qualified.com/w/1/{siteId}/…` [C]
8. GET/POST JSON (`/messages` returns `{id, conversationId, visitorId, type, text, botStep…}`) [C]
9. SaaS
10. Qualified (+ CRM)
11. Anonymous visitor ID cookie `__q_state_*`
12. Load in `delayed.js` after consent
13. Page-level rules (where chat shows) live in the Qualified console [U]
14. **Low**

### F15 — Experiments / feature flags (PostHog)
1. A/B tests and CTA experiments
2. Site-wide [C]
3. CTAs in the nav, homepage footer and Vault overview
4. Shows variant CTAs per visitor: flags `homepage-footer-cta`, `vault-overview-cta`, `nav-signup-cta-experiment` [C]
5. `POST eu.i.posthog.com/flags/` returns `{flags:{key:{enabled, variant, reason, metadata}}}`. The server sets an httpOnly `ph_bootstrap_data` cookie, probably so it can pick the variant on the server without flicker [P].
6. No
7. PostHog EU cloud
8. POST, JSON
9. Server-side bootstrapping today [P]; client-only is possible
10. PostHog
11. Anonymous distinct ID
12. Option 1: PostHog JS in delayed phase + small variant-swap code (accept a brief flicker on below-the-fold CTAs). Option 2: the **EDS experimentation plugin** (authored variants, edge-cached).
13. Active experiments, variants, owners, success metrics [U]
14. **Medium**

### F16 — Account-based personalization (Demandbase)
1. IP → company identification
2. Site-wide [C]
3. Script only
4. Resolves the visitor's company (name, industry, size, revenue, audience segment)
5. `POST api.company-target.com/api/v3/ip.json` on every page [C]
6. No
7. Demandbase
8. POST, JSON
9. SaaS
10. Demandbase
11. Demandbase key in the tag
12. Load through GTM/delayed. If any content swaps by segment (not observed) [U], put it in a client block reading Demandbase data.
13. Is it used for on-page personalization or only analytics/ads [U]
14. **Low** (analytics only) / **Medium** (if content swaps)

### F17 — Localization, geo detection and language banner
1. Multi-language site and geo-aware language banner
2. All pages: hreflang for 11 locales; "Available languages" + "Close localized page notification" on blog pages [C]
3. Header/blog language switcher, notification bar
4. Suggests the visitor's local site; keeps the language choice
5. Cookies `NEXT_LOCALE`, `hc_geo` (set by the site) [C]; Vercel geo headers → middleware [P]; non-prefixed URLs 307 → `/en/...` [C]
6. Partly (switcher)
7. Vercel edge middleware [P]
8. —
9. Edge logic today
10. —
11. None
12. EDS folder per locale (`/fr/…`, `/ja/…`) with authored translations or the AEM translation workflow; language switcher in the header. For the banner, use `navigator.language` on the client (no backend needed), or CDN geo headers if the business needs real geo.
13. Are the 10 non-English locales in scope? How many pages each [U]
14. **Medium** (High if all locales migrate)

### F18 — Consent management (DataGrail)
1. Cookie consent and the "Cookie Manager" preference center
2. All pages [C]
3. Footer link + DataGrail banner/modal
4. Stores consent and gates tags
5. `api.consentjs.datagrail.io/save_open…`; `datagrail_consent_id`/`_version` cookies [C]
6. Yes
7. DataGrail
8. GET JSON
9. SaaS
10. DataGrail
11. Anonymous ID
12. Load the DataGrail script early (head, async) and gate GTM/martech on its consent signal. Test the LCP impact.
13. Consent categories mapping to GTM [U]
14. **Medium** (ordering and performance)

### F19 — Analytics, advertising and monitoring tags
1. Martech stack (≈20 vendors; list in `03-apis-and-external-services.md`)
2. All pages [C]
3. Scripts/pixels
4. Measurement, attribution, retargeting, RUM and error tracking
5. GTM container plus hard-coded tags (Munchkin, Datadog, Sentry, Vercel Speed Insights, PostHog, Demandbase, Qualified) [C]
6. No
7. Vendors
8. Beacons
9. No (SaaS). The Meta server-side conversions endpoint on Google Cloud Run is a server component today [P].
10. Vendors
11. —
12. Load everything through GTM in `delayed.js`. Drop Vercel Speed Insights. Replace Datadog RUM/Sentry with RUM (EDS built-in) or keep them in delayed. Keep the Cloud Run conversions gateway as is (it isn't tied to Vercel) [P].
13. Tag inventory owned by marketing ops; GTM container ID [U]
14. **Low–Medium**

### F20 — Video and media embeds
1. YouTube, Wistia, self-hosted MP4, SoundCloud, SlideShare, Vimeo
2. YouTube 768 pages (resources 331, webinars 293, blog 126); Wistia 55; HTML5 video 82 (≈45 MP4 on DatoCMS, 50 Wistia sources); SoundCloud 38 (podcast "HashiCast"); SlideShare 8; Vimeo 1 [C]
3. embed-video, video, hero background videos
4. Plays media
5. Embeds load the vendor players (Wistia `fast.wistia.com/embed/medias/{id}.json` + HLS m3u8 + captions JSON) [C]
6. Yes
7. Vendors; DatoCMS for MP4s
8. —
9. No
10. YouTube/Wistia/SoundCloud; asset storage for MP4
11. None
12. The existing `embed` and `video` blocks cover YouTube/Vimeo/MP4. Add Wistia and SoundCloud providers to `embed`. Move the DatoCMS MP4s to AEM Assets (or Dynamic Media). Load embeds lazily, with poster images.
13. Wistia account ownership; captions [U]
14. **Low–Medium**

### F21 — Sign-in / sign-up links (no on-site authentication)
1. Links to the HCP and Terraform apps
2. Header on 3,515 pages; in-content links on 250 pages (`portal.cloud.hashicorp.com/sign-up|sign-in`, `app.terraform.io/signup/account`, …) [C]
3. Header CTAs, CTA buttons
4. Sends the visitor to external apps. Some CTAs append `ajs_aid` (Segment anonymous ID) for cross-domain attribution [C].
5. Plain navigation. **No session-dependent content and no login APIs on www** [C, for anonymous visitors]
6. Yes
7. —
8. —
9. No
10. —
11. Authentication happens on the external apps
12. Plain links. A small script adds the analytics ID (`ajs_aid`) if attribution must continue.
13. Is any logged-in state shown on www (e.g. "Go to console")? Not observed [U]
14. **Low**

### F22 — Cloud/remediation maturity quiz
1. Interactive assessment
2. https://www.hashicorp.com/en/cloud-maturity/quiz (→ `/en/lp/cloud-maturity/quiz`), https://www.hashicorp.com/en/remediation-maturity/quiz; results pages `/en/lp/cloud-maturity/results/*` [C]
3. Quiz app (`form.style_root…`; 8 questions × 4 radio options = 32 radios in the DOM)
4. Steps through 8 questions and sends the visitor to a results tier page; offers "Talk with an expert" (Marketo 3248)
5. Client-side only: no network calls while answering [C]. Scoring rules sit in the JS bundle [P].
6. Yes
7. None (client) [C]; whether answers reach Marketo/PostHog [U]
8. —
9. No
10. No
11. None
12. Custom `quiz` block: questions authored as rows, scoring thresholds → result page URLs in block config
13. Exact scoring formula and result tiers [U]
14. **Medium**

### F23 — Pricing page
1. Product pricing tabs + feature comparison table
2. https://www.hashicorp.com/en/pricing [C]
3. Tabs (Terraform, Packer, Nomad, Vault, Boundary, Consul), feature-category sub-tabs, comparison table with "Toggle display"
4. Shows plans (PAYG, Flex, Enterprise Self Managed) and feature matrices
5. All content is in the DOM; no calculator, no price API [C]
6. Yes
7. Authored
8. —
9. No
10. No
11. None
12. Tabs + table blocks (the table block already supports 2–4 columns; the comparison matrix may need a `pricing-table` variant)
13. —
14. **Medium** (layout)

### F24 — Frontend-only interactive components
Tabs (387 pages; partner profiles 345, with all tab panels already in the server HTML, e.g. the "Integrations" panel on /en/partners/tech/netlify), accordions/FAQ (172), carousels (25), pagination controls inside carousels (19), conference agenda day tabs (`/en/conferences/hashiconf/agenda`, data in the page), mega-menu, blog "Explore topics" menu (1,612), share links, social icons. [C] No content API calls on load for these pages (partner profile, agenda, carousels); panel content is in the HTML. The partner tab-click probe itself timed out, so "no call on click" is [P] there. **Category B. EDS: existing tabs/accordion/carousel blocks.** Complexity **Low**.

### F25 — Code samples
473 pages with `<pre>` code (mostly blog). Highlighted on the server into per-line spans with line highlighting; a "Copy" button on 35 pages [C]. **Category B.** EDS: code block (default content `pre/code`) + client-side highlighter (Prism/Shiki) loaded lazily + copy button. Complexity **Low–Medium** (line-highlight fidelity).

### F26 — Conference agenda, sessions and speakers
Agenda overview with day tabs (Mon–Thu); 63+ session pages; 83 speaker pages [C]. Built on the server from CMS relations (session ↔ speaker ↔ day) [P]. **Category C.** EDS: authored session and speaker pages + query-index-driven agenda block (filter by day/track). Complexity **Medium**.

### F27 — Redirects, vanity links and middleware
307 locale redirects, `/en/go/*` 308 vanity links, retired pages → ibm.com (308), `/en/integrations` → find-a-partner [C]. **Category E (edge config).** EDS: `redirects` spreadsheet. Locale-less → `/en` handled by redirects or the CDN. Complexity **Low–Medium** (needs the full rule export) [U].

### F28 — Bot protection / WAF
Vercel Security Checkpoint challenges automated clients (HTTP 429, `/.well-known/vercel/security/request-challenge`, `challenge.v2.wasm`) [C]. **Infrastructure.** EDS: CDN/WAF rules at the BYO CDN (Akamai/Cloudflare/Fastly) if needed. Complexity **Low** (configuration), **[U]** requirement.

### F29 — CMS-driven global content
Header mega-menu, footer, IBM alert bar, blog sub-nav [C]. Already migrated as EDS fragments (`/fragments/header`, `/fragments/footer`, `/fragments/blog-nav`) in the previous workspace. **Category A.** Complexity **Low**.

### F30 — Static content (no runtime dependency)
530 pages have **no page-level dynamic feature** beyond the global chrome: legal, trust, policies, brand guidelines and most landing pages. Plus the article bodies of 1,600+ blog posts. **Category A.** See `02-page-feature-inventory.csv`.

---

## 4. Findings matrix by URL section

| Section | Pages | Main dynamic features (pages) |
|---|---|---|
| /en/blog | 1,614 | blog search box 1,612 (F01) · Explore-topics menu 1,612 · code 496 (F25) · YouTube 136 · HTML5/Wistia video 39/14 · sign-up links 196 · listing pages (F08) |
| /en/events (webinars) | 779 | Marketo 333 (F10) · gated recording 331 (F11) · time state (F12) · YouTube 289 · Wistia 17 |
| /en/partners | 478 | tabs 343 · menus 150 (F24) · directory not in sitemap (F05) |
| /en/resources | 454 | YouTube 330 · SoundCloud 38 · Wistia 9 · code 9 · library not in sitemap (F03) |
| /en/conferences | 187 | Cvent 2 (F13) · carousels 5 · tabs 8 · agenda (F26) |
| /en/on-demand | 107 | Marketo 107 · gated 67 (F10/F11) |
| /en/lp | 85 | Marketo 25 · gated 4 · tabs/carousels · quiz (F22) |
| /en/case-studies | 42 (+ listing) | listing via Algolia (F04) |
| /en/products, /solutions, /industries | 62 | tabs, accordions, carousels, Wistia (F24/F20) |
| /en/trust, /legal, /brand, policies | ~40 | static (A) |
| one-offs | ~40 | /pricing (F23), /contact-sales & /contact/general-inquiry (F10), /careers (links to ibm.com/careers; YouTube), /press (F07), /ambassador/directory (F06) |

---

## 5. Things that will *not* need to be rebuilt

- **No product catalog, cart, checkout, price calculator, configurator or quote tool**: the pricing page is static content [C].
- **No maps or store locators** [C: no maps/leaflet/mapbox references].
- **No live counters or dashboards.** The "stats" blocks are authored numbers [C]. status.hashicorp.com is an outbound link only.
- **No on-site user accounts, profiles or gated member areas** [C for anonymous browsing].
- **No job feed**: careers links to IBM careers search [C].
- **No GitHub star counters / external API widgets** [C].

---

## 6. Backend / Java development assessment

Detailed task list: `04-backend-development-tasks.md`. Summary:

| ID | Need | Why frontend JS alone isn't enough | Reuse existing? | New service? | Simplest architecture | Java/Spring Boot? |
|---|---|---|---|---|---|---|
| BE-1 | **Search index sync** (if Algolia stays) | Writing to Algolia needs an admin key, which must never go to the browser. Indexing has to follow AEM publish events. | Yes: Algolia app, indexes, UI config | Yes: small indexer | Adobe App Builder / I/O Runtime action (Node) on AEM publish events, or a scheduled job reading EDS `query-index.json` and the published pages → Algolia Admin API | Not needed; viable only if a Java platform team owns it |
| BE-1alt | **No backend**: EDS query-index replaces Algolia | — | — | No | `helix-query.yaml` + client-side filtering (≤ a few thousand rows per index) | No |
| BE-2 | **RSS/Atom feeds** | XML must be generated from content | — | Small | Edge worker or App Builder action rendering `query-index.json` → Atom, cached at the CDN | No |
| BE-3 | **Marketo form submission** | Already server-side in Marketo | **Yes**: keep the Marketo embed | **No** | forms2 embed block | No |
| BE-3alt | Native EDS form → Marketo (only if the embed is rejected) | The Marketo REST API needs a client secret, plus dedupe, spam and consent logic | Partly | Yes: proxy | Serverless proxy to the Marketo REST API (Push Lead) with rate limiting/captcha | Possible, not recommended |
| BE-4 | **Hard-gated assets** (optional) | Today's soft gate exposes asset URLs in the page | — | Yes, if required | Serverless that checks a Marketo submission token and returns a signed AEM Assets/CDN URL | No |
| BE-5 | **Server-side experiments / geo** (optional) | Flicker-free variants and real geo need edge/server context | PostHog, CDN geo | Optional | CDN edge function (Fastly/Akamai/Cloudflare) or the EDS experimentation plugin | No |
| BE-6 | **Redirect rules** | — | Export from Vercel/Next config | No | EDS `redirects` sheet + CDN for locale defaults | No |
| BE-7 | **Partner/ambassador/press data feeds** (only if mastered outside the CMS) | Data comes from another system (PRM) | Source system | Maybe | Scheduled App Builder job → EDS sheet/JSON or Algolia | No |

**Recommendation:** start with **BE-1alt (EDS query-index)** for blog, events, case studies, ambassadors and press, and decide about Algolia when sizing the resource library and partner directory (2,025 and 478 records with rich facets plus full-text search). Keep the Marketo, Cvent, Qualified, PostHog and DataGrail SaaS backends. That leaves **at most two small serverless functions** (indexer, feeds) and no Java service. Choose Java/Spring Boot only if HashiCorp/IBM require JVM services for operational reasons.

**Data storage, auth and security considerations:**
- Algolia admin keys and Marketo REST secrets stay server-side only (App Builder secrets/CDN secrets).
- Search-only Algolia keys can stay public (restrict them by referrer and index).
- Personal data (form submissions, ambassador bios) stays in Marketo/CRM. EDS stores none.
- Consent: load martech only after DataGrail consent.
- Gated assets: decide soft vs. hard gating (BE-4).
- The EDS query-index is public: don't index hidden/unlisted content (`isHidden`, gated asset URLs).

---

## 7. Related deliverables

| File | Content |
|---|---|
| `02-page-feature-inventory.csv` | One row per URL (3,909): template, section, page-level features, categories, global dependencies, webinar state |
| `02-page-feature-inventory-summary.md` | Totals by feature and template |
| `03-apis-and-external-services.md` | Every endpoint and service discovered, with method, format and evidence |
| `04-backend-development-tasks.md` | Backend tasks with responsibilities, options and estimates |
| `05-eds-frontend-only-features.md` | Features that can be built entirely in EDS block/frontend code |
| `06-risk-complexity-matrix.md` | Risk × complexity per feature |
| `07-clarification-questions.md` | Questions for the HashiCorp web, marketing-ops and platform teams |
| `evidence/` | Redacted network captures, probe outputs, DOM aggregates, Marketo form list |
