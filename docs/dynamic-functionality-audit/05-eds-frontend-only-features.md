# Features that can be built entirely in EDS frontend code

"Frontend-only" means block JavaScript/CSS, authored content, EDS fragments, the EDS query-index or sheets, and embeds of existing SaaS. **No new server-side code.** Existing EDS blocks in this project are named where they apply. Block names marked *(new)* don't exist yet.

| # | Feature | Pages (scan) | EDS implementation | Existing block | Data source | Complexity |
|---|---|---|---|---|---|---|
| 1 | Tabs (partner profile panels, product, pricing, webinar) | 387 | Tabs block; panel content authored | `tabs` | Authored | Low |
| 2 | Accordions / FAQ | 172 | Accordion block | `accordion` | Authored | Low |
| 3 | Carousels / sliders with prev/next | 25 (+ blog home) | Carousel block | `carousel` | Authored | Low |
| 4 | Header mega-menu, mobile menu, blog "Explore topics" menu, language switcher links | all | Header/blog-nav fragments (done in the earlier workspace) | `header`, `fragment` | Fragments | Low |
| 5 | IBM alert/announcement bar | 3,591 | Fragment or section in the header fragment | `fragment` | Authored | Low |
| 6 | Code samples: highlighting, line highlight, copy button | 473 / 35 | Default `pre/code` + lazily loaded highlighter + copy button | *(new: `code`)* | Authored | Low–Medium |
| 7 | YouTube / Vimeo / MP4 video | 768 / 1 / ≈45 | Embed and video blocks, lazy load with poster | `embed`, `video` | Authored (+ AEM Assets for MP4) | Low |
| 8 | Wistia video, SoundCloud podcast, SlideShare | 55 / 38 / 8 | Add providers to `embed` (Wistia iframe/JSON player, SoundCloud widget) | `embed` (extend) | Vendor | Low |
| 9 | Cvent registration | 2 | iframe embed with allowed-domain list | `embed` (extend) | Cvent | Low |
| 10 | **Marketo forms** (22 IDs, footer newsletter on every page) | 3,506 + 473 | `marketo-form` block: author enters the form ID; forms2.js loaded on scroll-in; hidden UTM/page-URL fields filled; `onSuccess` → reveal/redirect/thank-you | *(new)* | Marketo (existing backend) | Medium |
| 11 | Soft-gated recordings and downloads | ~440 | Same block: reveal the video/PDF after `onSuccess`; asset reference in block config | *(new, with #10)* | Marketo + assets | Medium |
| 12 | Webinar time state (upcoming / recording soon / on-demand) | ~470 | Page metadata `event-start/end`, `recording`; the block picks the state from the current date | *(new: `webinar-hero`)* | Metadata | Low–Medium |
| 13 | Blog topic/product/tag/category listings and blog home | ~35 | `blog-list` gains a **query-index mode** (filter by tag/product/category, sort by date, load more) | `blog-list` (extend) | EDS query-index | Medium |
| 14 | Events listing with filters | 2 | `filtered-list` block over a query-index (type, product, language, region, date) | *(new)* | Query-index | Medium |
| 15 | Case studies, press, ambassadors directories | 3 | Same `filtered-list` block over query-index or an EDS sheet | *(new, shared)* | Query-index / sheet | Low–Medium |
| 16 | Resource library, partner directory (if Algolia is dropped) | 2 | `filtered-list` + client text filter (2,025 / 478 rows) | *(new, shared)* | Query-index | Medium |
| 17 | Blog search (if Algolia is dropped) | 1 results page + 1,612 search boxes | `search` block over the blog query-index (title, description, tags) | `search` (adapt) | Query-index | Medium |
| 18 | Search/listings **with Algolia kept**: frontend part | as above | Block calls Algolia with the public search-only key (lazy). **The indexer is backend (BE-1).** | *(new)* | Algolia | Medium |
| 19 | Conference agenda (day tabs) and session lists | 1 + 63 + 83 | Agenda block over a sessions query-index (day, track, speaker) | *(new)* | Query-index | Medium |
| 20 | Cloud/remediation maturity quiz | 2 (+ results pages) | `quiz` block: questions as rows, scoring thresholds → result URLs | *(new)* | Authored | Medium |
| 21 | Pricing page (tabs + feature comparison matrix + toggle) | 1 | Tabs + table (comparison variant) | `tabs`, `table` (variant) | Authored | Medium |
| 22 | Sign-in / sign-up / console links (+ `ajs_aid` attribution param) | 3,515 | Plain links; small script appends the analytics ID | `header` | — | Low |
| 23 | Qualified chat | all | Load in `delayed.js` after consent | — | Qualified | Low |
| 24 | DataGrail consent | all | Script in `head.html` (async); gate martech on consent | — | DataGrail | Medium |
| 25 | GTM, GA4, ads pixels, Munchkin, Demandbase, PostHog, Datadog/Sentry | all | `delayed.js` via GTM; drop Vercel Speed Insights | — | Vendors | Low–Medium |
| 26 | PostHog experiments (client-only) | site-wide | Variant swap after flags load (or EDS experimentation plugin) | — | PostHog | Medium |
| 27 | Localized-page banner (client-only) | blog + all | `navigator.language` vs. page locale → banner linking to the hreflang alternate | *(new, small)* | hreflang metadata | Low |
| 28 | Redirects, vanity links | — | EDS `redirects` sheet | — | Sheet | Low |
| 29 | Static content pages (legal, trust, brand, policies, most LPs, article bodies) | 530 pages with no page-level feature + bodies of 1,600 posts | Default content + existing blocks | various | Authored | Low |

**Requires server-side work (not in this list):**
- Algolia **indexing** (BE-1, only if Algolia is kept)
- RSS/Atom feeds (BE-2)
- Hard gating (BE-4, optional)
- Edge-side experiments/geo (BE-5, optional)
- Feeds from external directory sources (BE-7, only if they exist)

See `04-backend-development-tasks.md`.
