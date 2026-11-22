# Potential backend development tasks

Principle: use the simplest architecture that works. EDS is a static/edge delivery tier, so anything that needs a **secret**, a **write to another system**, or **generation from many pages at once** has to run server-side. Everything else stays in block JavaScript. Java/Spring Boot is **not required** for any item below. Where a server component is needed, a stateless serverless function is enough. Good options: **Adobe App Builder / I/O Runtime** (fits AEM eventing) or a **CDN edge worker** (Fastly Compute / Cloudflare Workers / Akamai EdgeWorkers).

Effort is a rough order of magnitude for one developer, including tests, and excluding vendor onboarding.

---

## BE-1 Search index synchronisation (only if Algolia is kept)

| | |
|---|---|
| Features | F01 blog search, F02 events, F03 resources, F04 case studies, F05 partners, F06 ambassadors, F07 press |
| Why the frontend can't do it | Writing to Algolia needs the **Admin API key**, which can't go to the browser. Records must update when AEM content is published or unpublished. Today a DatoCMS→Algolia sync does this [P], and that sync goes away with DatoCMS. |
| Backend responsibilities | Listen to AEM publish/unpublish events (or poll the EDS `query-index.json` on a schedule) · map page metadata to the current record schemas (field lists in `03-apis…`) · upsert/delete records · keep replicas (`events-asc`) and facets configured · handle non-page records (external case studies, media coverage, `externalLink`) · retry and alert |
| Reuse | Algolia application, indexes, ranking/synonyms, search-only keys, and the frontend query shape |
| New service | Yes: small indexer (≈300–600 lines) |
| Suggested architecture | App Builder action triggered by AEM Sites publish events (or by the EDS admin API `index` webhook) → reads `/{path}.plain.html` or the query-index row → Algolia `saveObjects`/`deleteObjects`. Secrets in App Builder. |
| Java/Spring Boot | Not needed. Only if HashiCorp/IBM run JVM services for integrations and want it on that platform. |
| Data, auth, security | Admin key server-side only; the browser search key is restricted to its indexes and HTTP referrers; don't index hidden/gated URLs; no personal data except the ambassadors index (public bios, consent [U]) |
| Effort | 5–10 days, plus index-schema mapping per index |
| **Alternative (no backend)** | **BE-1alt:** replace Algolia with the EDS query-index (`helix-query.yaml`, one index per content type). Filtering, sorting and paging run in a block. Fine for 100–2,000 rows. Limits: metadata search only (no full-text body search), no typo tolerance or relevance tuning. Effort 3–6 days frontend, **no backend**. |

## BE-2 RSS/Atom feed generation

| | |
|---|---|
| Features | F09 (`/blog/feed.xml`, per-category feeds) |
| Why the frontend can't do it | A feed is an XML document built from many pages; EDS doesn't generate one |
| Responsibilities | Read the query-index (date, title, description, author, image, category) and render Atom/RSS; cache |
| Reuse | Query-index from BE-1alt |
| New service | Small |
| Architecture | CDN edge worker or App Builder action on `/blog/feed.xml` → fetch `query-index.json` → Atom, cached 15–60 min |
| Java | No |
| Security | Read-only public data |
| Effort | 1–2 days · **or retire the feeds** if nobody uses them [U] |

## BE-3 Form handling (Marketo)

| | |
|---|---|
| Features | F10, F11, F12 (22 Marketo forms) |
| Why the frontend alone is enough with an embed | Marketo forms2 already submits to Marketo's servers (lead create/merge, routing, `fastTracktoSales`, `is_spam__c`, program membership via `registeredWebinarID`, consent). **No new backend.** |
| Responsibilities (existing, in Marketo/CRM) | Validation rules, dedupe, routing, nurture, webinar program sync |
| Recommendation | `marketo-form` block (embed) + UTM/attribution script. **No backend task.** |
| BE-3alt (not recommended) | Native EDS form posting to a serverless proxy that calls the Marketo REST API (Push Lead / Associate Lead / Program Members). Needs the client ID/secret, rate limiting, captcha/bot defence, and re-implementing spam and consent logic. 8–15 days and ongoing ownership. |
| Java | No |

## BE-4 Hard-gated assets (optional, only if required)

| | |
|---|---|
| Features | F11 gated recordings, reports, PDFs |
| Current state | **Soft gate:** asset references are already public (video IDs in the page payload, PDFs on public DatoCMS URLs) [C] |
| Why the frontend can't do it (if hard gating is required) | A true gate needs a server to check the submission and hand out a time-limited URL |
| Responsibilities | Check a signed token issued after the Marketo `onSuccess` callback (or a Marketo webhook) → return a signed AEM Assets/CDN URL or a private Wistia/YouTube link |
| Architecture | Serverless function + signed CDN URLs (AEM Assets/Dynamic Media, or a private bucket) |
| Java | No |
| Security | Short-lived tokens, no PII in tokens, rate limiting |
| Effort | 4–8 days · **Recommendation: keep the soft gate (parity) unless the business asks otherwise** |

## BE-5 Experiments, geo and locale detection at the edge (optional)

| | |
|---|---|
| Features | F15 PostHog experiments (server bootstrap `ph_bootstrap_data` today [P]), F17 geo language banner (`hc_geo`) |
| Why the frontend isn't enough (only for flicker-free or true geo) | The variant must be chosen before HTML is served; geo comes from the CDN |
| Options | (a) Client-only: PostHog in the delayed phase + `navigator.language` for the banner, **no backend**; (b) EDS experimentation plugin (authored variants); (c) CDN edge function adding geo/variant headers or cookies |
| Java | No |
| Effort | (a) 1–3 days · (c) 3–5 days plus CDN access |

## BE-6 Redirects and vanity links

| | |
|---|---|
| Features | F27 |
| Backend? | No. Use the EDS `redirects` spreadsheet. Locale-less → `/en/` default via redirects or a CDN rule. |
| Prerequisite | Export of the Vercel/Next.js redirect config and the `/en/go/*` vanity list [U] |
| Effort | 1–3 days (depends on rule count) |

## BE-7 External data feeds for directories (only if data is mastered outside the CMS)

| | |
|---|---|
| Features | F05 partners (tiers, competencies), F06 ambassadors, F07 press (media coverage links) |
| Why | If the source of truth is a partner portal/PRM or a spreadsheet outside the CMS [U], something has to sync it |
| Architecture | Scheduled App Builder job → EDS sheet / JSON (or Algolia, if BE-1) |
| Java | No |
| Effort | 2–5 days per source |

## Not needed (checked)

- **Pricing / quote / calculator service:** none on the site (pricing is static content) [C]
- **User accounts / sessions / profile APIs:** none on www (auth lives on portal.cloud.hashicorp.com) [C]
- **Maps / store locator / geo search:** none [C]
- **Live data dashboards / counters:** none [C]
- **Database:** no new database is needed for any option above. Data stays in AEM, Marketo/CRM, Algolia (if kept) and the SaaS vendors.

## Summary

| Task | Required? | New service | Architecture | Java? | Effort |
|---|---|---|---|---|---|
| BE-1 Algolia indexer | Only if Algolia is kept | Yes (small) | App Builder / serverless | No | 5–10 d |
| BE-1alt EDS query-index | Alternative | No | EDS | No | 3–6 d (frontend) |
| BE-2 Feeds | If feeds are kept | Yes (tiny) | Edge worker / App Builder | No | 1–2 d |
| BE-3 Marketo | No (embed) | No | — | No | — |
| BE-4 Hard gate | Optional | Yes | Serverless + signed URLs | No | 4–8 d |
| BE-5 Edge experiments/geo | Optional | Maybe | CDN function | No | 3–5 d |
| BE-6 Redirects | Yes (config) | No | EDS redirects sheet | No | 1–3 d |
| BE-7 Directory feeds | Only if external source | Maybe | Scheduled job | No | 2–5 d each |
