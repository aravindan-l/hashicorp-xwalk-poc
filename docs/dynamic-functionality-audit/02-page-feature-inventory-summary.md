# Page feature inventory: summary

Source: `02-page-feature-inventory.csv` (3909 rows, one per sitemap URL). Features are counted in the **main content** only. The global header and footer are the same on every page: Marketo newsletter 2459, sign-in/sign-up links, Qualified chat, DataGrail consent, PostHog, Demandbase, GTM and ad tags. See `01-dynamic-functionality-audit.md` §2.

## Pages per category

| Category | Pages |
|---|---|
| A Static (no page-level dynamic feature) | 530 |
| B Frontend-only interaction | 2043 |
| C Dynamic content | 469 |
| D External API integration | 2087 |
| E Backend/server-side logic | 476 |
| F Auth/personalization (links to sign-in apps) | 250 |
| G Third-party integration (every page, via global tags) | 3896 |

## Feature totals

| Feature | Pages |
|---|---|
| Blog search box -> /en/blog/all (Algolia) | 1612 |
| Blog sub-nav "Explore topics" dropdown | 1612 |
| YouTube embed | 768 |
| Static content only (plus global chrome) | 530 |
| Code samples | 473 |
| Gated content (form unlocks asset/video) | 405 |
| Tabs | 387 |
| Webinar state: gated-on-demand | 332 |
| Marketo form 2334 | 327 |
| Accordion/disclosure | 172 |
| Dropdown/menu control | 151 |
| Links to sign-in/sign-up apps (portal.cloud.hashicorp.com) | 137 |
| Webinar state: recording-coming-soon | 135 |
| Marketo form 1706 | 113 |
| Links to sign-in/sign-up apps (app.terraform.io) | 101 |
| HTML5 video | 82 |
| Wistia video | 55 |
| SoundCloud player | 38 |
| Code samples + copy button | 35 |
| Carousel/slider | 25 |
| Pagination controls | 19 |
| ANALYSIS FAILED (HTTP_500) | 9 |
| SlideShare embed | 8 |
| Links to sign-in/sign-up apps (portal.cloud.hashicorp.com, app.terraform.io) | 8 |
| Marketo form 2429 | 5 |
| Marketo form 3351 | 4 |
| Countdown (text match, verify) | 3 |
| Cvent registration iframe | 3 |
| Marketo form 2534 | 3 |
| ANALYSIS FAILED (HTTP_404) | 3 |
| Marketo form 3390 | 3 |
| Marketo form 2528 | 3 |
| Client-side quiz/assessment | 2 |
| Webinar state: upcoming-registration | 2 |
| Marketo form 2382 | 2 |
| Links to sign-in/sign-up apps (app.terraform.io, login.newrelic.com) | 1 |
| Vimeo embed | 1 |
| Links to sign-in/sign-up apps (auth.hashicorp.com) | 1 |
| Links to sign-in/sign-up apps (login.ibm.com) | 1 |
| iframe analytics.o11.tech | 1 |
| Links to sign-in/sign-up apps (app.terraform.io, portal.cloud.hashicorp.com) | 1 |
| Marketo form 1307 | 1 |
| Marketo form 1583 | 1 |
| Marketo form 2426 | 1 |
| Marketo form 2433 | 1 |
| Marketo form 2526 | 1 |
| Marketo form 3248 | 1 |
| Marketo form 2921 | 1 |
| Marketo form 2530 | 1 |
| Marketo form 3565 | 1 |
| Marketo form 2509 | 1 |
| Marketo form 2383 | 1 |
| Marketo form 2506 | 1 |
| Marketo form 3384 | 1 |
| ANALYSIS FAILED (ERROR) | 1 |

## By template (multi-page templates)

| Template | Pages | Top page-level features |
|---|---|---|
| blog-article | 1256 | Blog search box -> /en/blog/all (Algolia) (1256), Blog sub-nav "Explore topics" dropdown (1256), Code samples (435), YouTube embed (126), Links to sign-in/sign-up apps (portal.cloud.hashicorp.com) (86), Links to sign-in/sign-up apps (app.terraform.io) (86) |
| webinar-detail | 1133 | Gated content (form unlocks asset/video) (397), Webinar state: gated-on-demand (331), Marketo form 2334 (323), YouTube embed (293), Static content only (plus global chrome) (187), Webinar state: recording-coming-soon (135) |
| partner-profile | 488 | Tabs (345), Accordion/disclosure (146), Dropdown/menu control (146), Static content only (plus global chrome) (140), Carousel/slider (2), Pagination controls (2) |
| resource-detail | 474 | YouTube embed (331), Static content only (plus global chrome) (79), SoundCloud player (38), Wistia video (11), HTML5 video (11), Code samples (9) |
| blog-article-untagged | 176 | Blog search box -> /en/blog/all (Algolia) (176), Blog sub-nav "Explore topics" dropdown (176), YouTube embed (6), Code samples (5), Links to sign-in/sign-up apps (portal.cloud.hashicorp.com) (3), HTML5 video (2) |
| blog-post-basic | 92 | Blog search box -> /en/blog/all (Algolia) (92), Blog sub-nav "Explore topics" dropdown (92), Code samples (7), Links to sign-in/sign-up apps (app.terraform.io) (2) |
| conference-session | 60 | Static content only (plus global chrome) (60) |
| gated-download | 29 | Marketo form 1706 (9), Gated content (form unlocks asset/video) (7), Marketo form 3351 (4), Marketo form 3390 (3), Marketo form 2334 (3), Marketo form 2528 (3) |
| blog-listing | 22 | Blog search box -> /en/blog/all (Algolia) (22), Blog sub-nav "Explore topics" dropdown (22) |
| text-page | 17 | Static content only (plus global chrome) (16), Code samples (1) |
| campaign-landing | 16 | Static content only (plus global chrome) (11), Carousel/slider (4), Pagination controls (4), Links to sign-in/sign-up apps (app.terraform.io) (1) |
| form-landing | 15 | Static content only (plus global chrome) (8), Tabs (4), Links to sign-in/sign-up apps (portal.cloud.hashicorp.com) (3), YouTube embed (2), Marketo form 1307 (1), Marketo form 1583 (1) |
| (failed/none) | 13 | ANALYSIS FAILED (HTTP_500) (9), ANALYSIS FAILED (HTTP_404) (3), ANALYSIS FAILED (ERROR) (1) |
| event-landing | 12 | Static content only (plus global chrome) (8), Links to sign-in/sign-up apps (portal.cloud.hashicorp.com) (3), YouTube embed (2), Tabs (1), Marketo form 2334 (1), Gated content (form unlocks asset/video) (1) |
| content-page | 11 | Static content only (plus global chrome) (8), Tabs (3), Carousel/slider (3), Pagination controls (3), HTML5 video (2), Blog search box -> /en/blog/all (Algolia) (1) |
| product-landing | 4 | Static content only (plus global chrome) (3), Tabs (1) |
| editorial-feature | 2 | Static content only (plus global chrome) (2) |
| event-signup | 2 | Marketo form 2534 (2) |
| assessment-quiz | 2 | Client-side quiz/assessment (2) |
| conference-home | 2 | Static content only (plus global chrome) (1), Wistia video (1), HTML5 video (1), Tabs (1), Carousel/slider (1) |
| conference-city | 2 | Carousel/slider (2), Pagination controls (2) |
| conference-registration | 2 | Cvent registration iframe (2) |
| gated-report | 2 | Static content only (plus global chrome) (2) |
| campaign-feature | 2 | YouTube embed (2), Links to sign-in/sign-up apps (app.terraform.io) (2) |
| solution-detail | 2 | Tabs (2), Carousel/slider (2), Pagination controls (2), Links to sign-in/sign-up apps (portal.cloud.hashicorp.com) (2) |

73 single-page templates (blog-article-alt-*, marketing-landing-*, campaign-landing-*, etc.) are listed row by row in the CSV.

## Hub pages not in the sitemap (found while probing)

| URL | Feature |
|---|---|
| https://www.hashicorp.com/en/resources | Resource library, Algolia `www:prod:resources` (2,025 records) |
| https://www.hashicorp.com/en/partners/find-a-partner | Partner directory, Algolia `www:prod:partners` (478) |
| https://www.hashicorp.com/en/integrations | Redirects to find-a-partner?category=tech |
| https://www.hashicorp.com/en/events/webinars | 404 (listing lives at /en/events) |
| https://www.hashicorp.com/blog/feed.xml | Atom feed |
