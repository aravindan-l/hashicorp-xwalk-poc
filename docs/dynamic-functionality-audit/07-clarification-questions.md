# Questions for the HashiCorp web, marketing-ops and platform teams

Each question links to the feature(s) it unblocks. Priority: **P1** blocks the architecture decision · **P2** blocks the build · **P3** detail.

## Search and listings (Algolia)

| ID | Question | Features | Priority |
|---|---|---|---|
| Q-ALG-1 | Must Algolia stay (relevance tuning, typo tolerance, analytics), or is metadata search with the EDS query-index acceptable for blog, events, case studies, press and ambassadors? | F01–F07 | P1 |
| Q-ALG-2 | Who owns Algolia app `YY0FFNI7MF`? How are the `www:prod:*` indexes fed today (DatoCMS webhook, build job, other)? Can we get the index settings (searchable attributes, facets, ranking, synonyms, replicas)? | F01–F07 | P1 |
| Q-ALG-3 | The resources index has 2,025 records but the sitemap has only 454 resource pages. What are the other records (webinars, external links, PDFs)? Where are they authored? | F03 | P1 |
| Q-ALG-4 | Is full-text **body** search of blog posts a requirement? | F01 | P1 |
| Q-ALG-5 | Why do /en/blog/all, /en/events, /en/resources, /en/case-studies, /en/press/all, /en/ambassador/directory and /en/partners/find-a-partner return HTTP 500 on first render? Is that known? Should they be in the sitemap? | F01–F07 | P2 |

## Partners, ambassadors, press

| ID | Question | Features | Priority |
|---|---|---|---|
| Q-PARTNER | Where are partner tiers, competencies and regions mastered (DatoCMS, partner portal/PRM, spreadsheet)? How often do they change? | F05 | P1 |
| Q-AMB | Who owns the ambassador profiles (personal data)? Are there consent/retention requirements? | F06 | P2 |
| Q-PRESS | Where are external media-coverage and analyst-report entries authored? | F07 | P3 |

## Forms, gating and events (Marketo, Cvent)

| ID | Question | Features | Priority |
|---|---|---|---|
| Q-MKTO-1 | Confirm Marketo instance `845-ZLF-191` and the `go.hashicorp.com` forms domain stay in use after migration. Will marketing ops add the new EDS hosts (aem.page/aem.live/production) to the allowed domains? | F10 | P1 |
| Q-MKTO-2 | For each of the 22 form IDs (`evidence/marketo-forms.tsv`): what is the success behaviour (thank-you message, redirect, reveal asset)? Which forms are still in use? | F10, F11 | P2 |
| Q-MKTO-3 | What populates the hidden fields (`utm_*__c`, `utm_channel_bucket__c`, `form_page_url__c`, `is_spam__c`)? Can we get that script or its rules (it uses `lastExternalReferrer` in localStorage)? | F10 | P2 |
| Q-GATE | Is the current **soft gate** acceptable (video IDs and PDFs are publicly reachable), or do recordings/reports need hard gating? Should returning leads skip the form, and how is that decided today? | F11 | P1 |
| Q-WEBINAR | Which platform delivers live webinars (Zoom, ON24, Goldcast, other)? How does `registeredWebinarID` connect a registration to it? Who sets "recorded" and the recording URL after the event? | F12, F02 | P2 |
| Q-CVENT | Will future conferences keep using Cvent embedded registration (`originalUrl`/`RefId` parameters)? | F13 | P3 |

## Personalization, experiments, analytics, consent

| ID | Question | Features | Priority |
|---|---|---|---|
| Q-PH | Which PostHog experiments are live (`homepage-footer-cta`, `vault-overview-cta`, `nav-signup-cta-experiment`)? Who owns them? Can they be paused for the cut-over? Is server-side bootstrapping (`ph_bootstrap_data`) a requirement? | F15 | P2 |
| Q-ABM | Does Demandbase change any on-page content (by account, industry or segment), or is it only analytics/ads? | F16 | P2 |
| Q-GEO | What do the `hc_geo`, `my_visit` and `site_page_views` cookies drive (language banner, consent region, content)? | F17, F18 | P2 |
| Q-TAGS | Can we get the full tag inventory and the GTM container? Which tags are hard-coded outside GTM? What is `mpc-pilot-2-…run.app` (Meta conversions gateway?), and who runs it? | F19 | P2 |
| Q-CONSENT | DataGrail consent categories → which tags each one gates; any region-specific banner behaviour? | F18 | P2 |
| Q-QUAL | Qualified chat: are there page-level display or routing rules that depend on URL patterns? | F14 | P3 |

## Localization, redirects, platform

| ID | Question | Features | Priority |
|---|---|---|---|
| Q-LOCALE | Are the 10 non-English locales (ja, pt, de, es, ko, fr, id, zh, it, ar) in scope? How many pages each? Are they translated in DatoCMS or by a translation service? | F17 | P1 |
| Q-REDIR | Can we get the redirect configuration (Next.js/Vercel `redirects`, middleware rules, `/en/go/*` vanity list, legacy domains like learn.hashicorp.com)? | F27 | P2 |
| Q-BOT | Is bot protection (today the Vercel Security Checkpoint) required on the new CDN? Which CDN will front EDS? | F28 | P3 |
| Q-FEED | Who uses `/blog/feed.xml` and the category feeds? Keep or retire? | F09 | P3 |
| Q-AUTH | Does any www page change for signed-in HCP/Terraform users (e.g. "Go to console")? None was seen anonymously. | F21 | P3 |

## Content-specific

| ID | Question | Features | Priority |
|---|---|---|---|
| Q-QUIZ | Scoring rules and result tiers for /en/cloud-maturity/quiz and /en/remediation-maturity/quiz. Are answers sent to Marketo or PostHog? | F22 | P2 |
| Q-AGENDA | Data model for conference sessions, speakers, days and tracks. Will future HashiConf agendas be on hashicorp.com or IBM TechXchange? | F26 | P2 |
| Q-ASSETS | Can we get DatoCMS export/API access to migrate assets (images, 98 PDFs, ≈45 MP4s) with their metadata/alt text? | F11, F20 | P1 |
