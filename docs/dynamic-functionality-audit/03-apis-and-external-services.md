# APIs and external services discovered

Evidence: `evidence/network-functional-calls.txt` (30 live page captures, tracking filtered), `evidence/network-homepage-full-summary.txt` (full homepage capture), `evidence/network-page-globals-cookies-hosts.jsonl` (hosts, cookies, globals per page), `evidence/probe-*.json`. Query-string **values** and cookie **values** were not recorded. "Pages" = number of the 30 captured pages where the service loaded (30/30 = global).

## 1. Functional APIs (content, search, forms, commerce-like flows)

| Service | Endpoint(s) | Method / format | Purpose | Pages | Auth | Status |
|---|---|---|---|---|---|---|
| **Algolia Search** (app `YY0FFNI7MF`) | `https://yy0ffni7mf-dsn.algolia.net/1/indexes/*/queries`, fallback `yy0ffni7mf-2.algolianet.com` | POST JSON multi-query → `{results:[{hits,nbHits,page,nbPages,hitsPerPage,facets,…}]}` | Search and faceted listings | /en/blog/all, /en/events, /en/events/recorded-webinars, /en/case-studies, /en/ambassador/directory, /en/press/all, /en/resources, /en/partners/find-a-partner | Public search-only key in the request | [C] |
| Algolia indexes | `www:prod:blog` (search hits 483 for "terraform"), `www:prod:events-asc`, `www:prod:case-studies` (100), `www:prod:ambassadors` (107), `www:prod:press` (563), `www:prod:resources` (2,025), `www:prod:partners` (478) | — | One index per listing; `events-asc` is a sort replica | as above | — | [C] |
| **Algolia Insights** | `https://insights.algolia.io/1/events` | POST JSON | Click/view analytics for search | listing pages | Public key | [C] |
| Algolia indexing (write) | Algolia Admin API | — | Keeps indexes in sync with DatoCMS | not visible | Admin key, server-side | [P] |
| **DatoCMS** | `www.datocms-assets.com/2885/...` (images, MP4, PDF). Content API calls happen server-side | GET binary | Headless CMS and asset CDN (project 2885). Assets also loaded via imgix-style parameters | 3,702 of 3,896 pages | Public asset URLs; API token server-side | [C] assets · [P] CMS API |
| **Marketo Forms 2.0** (instance `845-ZLF-191`) | `go.hashicorp.com/js/forms2/js/forms2.min.js`, `go.hashicorp.com/index.php/form/XDFrame` (cross-domain bridge), `…/index.php/form/getForm` [P], `…/index.php/leadCapture/save2` [P] | Script; form submit via postMessage → POST form-encoded [P] | Lead capture: newsletter, webinar, gated content, contact, partner applications (22 form IDs, see `evidence/marketo-forms.tsv`) | 30/30 (footer newsletter) | None for visitors | [C] load · [P] submit |
| Marketo Munchkin | `munchkin.marketo.net`, `845-zlf-191.mktoresp.com/webevents/visitWebPage` | POST text | Visit tracking tied to the lead (`_mkto_trk`) | 30/30 | — | [C] |
| **Cvent** | `web.cvent.com/event/748e543a-…/register?embeddedRegistration&hideHeaderFooter&originalUrl&RefId`, `io.cvent.com/factor/dai/v1/batch_facts`, `cvent-prod-dataplane.rudderstack.com/v1/batch`, `api.rudderstack.com/sourceConfig` | iframe; POST JSON | Conference registration (HashiDays London/Singapore) | 1 captured (2 in site) | Cvent session inside the iframe | [C] |
| **Qualified** | `js.qualified.com`, `app.qualified.com/w/1/CWQA3q9CaEKHNF2t/{messenger,messages,visitor_events,cookie_consent_policy}`, `assets|messenger-assets|customer-assets.qualified.com` | GET/POST JSON (`/messages` → `{id,conversationId,visitorId,type,text,botStep…}`) | Live chat / chatbot | 29/30 | Anonymous visitor ID | [C] |
| **PostHog** (EU) | `eu.i.posthog.com/flags/` (POST → `{flags:{homepage-footer-cta, vault-overview-cta, nav-signup-cta-experiment:{enabled,variant,…}}}`), `/i/v0/e/`, `/s/` (events/session), `eu-assets.i.posthog.com` | POST JSON (compressed) | Feature flags / experiments, product analytics | 30/30 | Project key in the client; `ph_bootstrap_data` httpOnly cookie from the origin | [C]; server bootstrap [P] |
| **Demandbase** | `tag.demandbase.com`, `api.company-target.com/api/v3/ip.json` (POST → company_name, industry, employee_range, annual_sales, audience_segment, …), `segments.company-target.com`, `s.company-target.com` | POST JSON | IP-to-account identification (ABM) | 30/30 | Tag key | [C]; use for content personalization [U] |
| **DataGrail** consent | `api.consentjs.datagrail.io` (`save_open…`) | GET JSON | Consent management ("Cookie Manager") | 30/30 | Anonymous consent ID | [C] |
| **YouTube** | `www.youtube.com/embed/{id}`, `youtubei/v1/log_event`, `i.ytimg.com`, `jnn-pa.googleapis.com` | iframe | Video | 768 pages site-wide | — | [C] |
| **Wistia** | `fast.wistia.com/embed/medias/{id}.json` (media JSON), `/embed/captions/{id}.json`, `.m3u8` (HLS), `embed-ssl.wistia.com`, `pipedream.wistia.com` / `distillery.wistia.com` (player stats) | GET JSON/HLS | Video (blog home, infrastructure-cloud, webinars, products) | 55 pages | Public media IDs | [C] |
| **SoundCloud** | `w.soundcloud.com/player`, `api-widget.soundcloud.com/resolve` (GET JSON track), `wave.sndcdn.com`, `dwt.soundcloud.com` | iframe; GET JSON | Podcast player (HashiCast) | 38 pages | Widget client_id (public) | [C] |
| SlideShare / Vimeo | `www.slideshare.net`, `player.vimeo.com` | iframe | Slides / video | 8 / 1 pages | — | [C] DOM |
| Atom feeds | `https://www.hashicorp.com/blog/feed.xml`, `/blog/categories/{slug}/feed.xml` | GET `application/atom+xml` | Blog syndication | — | — | [C] |
| Next.js RSC | `https://www.hashicorp.com/en/{path}?_rsc` | GET `text/x-component` | Route prefetch (framework internal, not migrated) | 30/30 | — | [C] |

## 2. External applications linked (no API call from www)

| Destination | Use | Pages | Status |
|---|---|---|---|
| `portal.cloud.hashicorp.com/sign-in`, `/sign-up` (+ `ajs_aid` param), `/services/...` | HCP console login and sign-up (header on 3,515 pages; CTAs on 115+) | ≈3,515 | [C] |
| `app.terraform.io/signup/account`, `/public/signup/account`, `/session`, `/login` | HCP Terraform sign-up/login | ~110 | [C] |
| `developer.hashicorp.com`, `learn.hashicorp.com` (legacy), `discuss.hashicorp.com`, `releases.hashicorp.com`, `docs.hashicorp.com`, `support.hashicorp.com`, `status.hashicorp.com`, `ir.hashicorp.com`, `brand.hashicorp.com`, `events.hashicorp.com`, `works.hashicorp.com`, `cloud.hashicorp.com` | Sister sites | global/footer and in-content | [C] |
| `registry.terraform.io`, `terraform.io`, `vaultproject.io`, `consul.io`, `nomadproject.io`, `vagrantup.com`, `packer.io`, `boundaryproject.io` | Product sites (mostly legacy links in old posts) | 58–462 each | [C] |
| `www.ibm.com/careers/search?q=hashicorp`, `www.ibm.com/forms/webinars/mkt-on24-webinar-*` | Careers; IBM ON24 webinar form (alert bar) | /en/careers; 3,591 (alert bar) | [C] |
| `hashi.co` (short links), `hashiconf.com` | Shortener / event site | 65 each | [C] |

## 3. Analytics, advertising and monitoring (category G)

All load on 28–30 of 30 captured pages [C].

| Vendor | Hosts | Notes |
|---|---|---|
| Google Tag Manager / GA4 | `www.googletagmanager.com`, `analytics.google.com/g/collect`, `stats.g.doubleclick.net`, `www.google.com/ccm/collect` | Container ID not recorded [U] |
| Google Ads / Floodlight | `googleads.g.doubleclick.net`, `ad.doubleclick.net/activity;src=14263996`, `14263996.fls.doubleclick.net`, `www.google.com/rmkt/collect/762949359` | Conversion/remarketing |
| Meta Pixel | `connect.facebook.net`, `www.facebook.com/tr` | + server-side relay `mpc-pilot-2-s6uit34pua-ue.a.run.app/events` (Google Cloud Run; posts `event_name, event_id, fb.pixel_id, fb.fbp`) [P: Meta conversions gateway] |
| LinkedIn Insight | `snap.licdn.com`, `px.ads.linkedin.com` | |
| Reddit Pixel | `www.redditstatic.com`, `pixel-config.reddit.com`, `alb.reddit.com` | |
| The Trade Desk | `js.adsrvr.org`, `insight.adsrvr.org`, `match.adsrvr.org` | + Xandr `ib.adnxs.com`, Index Exchange `dsum-sec.casalemedia.com`, PubMatic, Rubicon, Tremor, Bidswitch, LiveRamp `id.rlcdn.com` (cookie sync) |
| Ahrefs Web Analytics | `analytics.ahrefs.com/api/event` | |
| Fathom | `cdn.usefathom.com` | |
| Datadog RUM | `browser-intake-datadoghq.com/api/v2/rum` | Session sample 100 % |
| Sentry | `browser.sentry-cdn.com`, `o209747.ingest.us.sentry.io` | Browser SDK 7.119.1 |
| Vercel Speed Insights | `/_vercel/speed-insights/script.js` | Vercel-only; drop on EDS |

## 4. Infrastructure / platform behaviour

| Item | Evidence | Status |
|---|---|---|
| Vercel hosting + Security Checkpoint (bot challenge: HTTP 429 page "Vercel Security Checkpoint", `/.well-known/vercel/security/request-challenge`, `challenge.v2.wasm`) | curl → 429; captures | [C] |
| Edge middleware: locale prefix redirects (307), vanity `/en/go/*` (308), retired pages → ibm.com (308), `/en/integrations` → partner directory | captures | [C] rules seen · full set [U] |
| First-party cookies: `NEXT_LOCALE`, `hc_geo`, `ph_bootstrap_data` (httpOnly), `datagrail_consent_id/_version`, `my_visit`, `site_page_views`, `_dd_s`; `.go.hashicorp.com __cf_bm` (Cloudflare bot cookie on the Marketo domain), `BIGipServer…` (F5 load balancer on go.hashicorp.com) | captures | [C] names · semantics of `hc_geo`, `my_visit`, `site_page_views` [U] |
| LocalStorage: `lastExternalReferrer(Time)` (attribution for form UTM fields [P]), `_gcl_ls`, PostHog, LinkedIn, Qualified debug keys | captures | [C] |
| Server-rendering failures: HTTP **500** on /en/blog/all, /en/events, /en/events/recorded-webinars, /en/case-studies, /en/press/all, /en/ambassador/directory, /en/resources, /en/partners/find-a-partner (client-side results still render) | captures + probes | [C]; cause [U] |
