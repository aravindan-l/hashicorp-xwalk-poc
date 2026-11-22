# Dynamic Functionality Audit — hashicorp.com/en (15 Nov 2026)

Analysis only. No code, blocks, configuration or content were changed, and no forms were submitted.

| # | Deliverable | File |
|---|---|---|
| 1 | Complete Dynamic Functionality Audit report (30 features × 14 attributes, platform dependencies, backend assessment) | `01-dynamic-functionality-audit.md` |
| 2 | Page-by-page feature inventory (3,909 URLs) + summary | `02-page-feature-inventory.csv`, `02-page-feature-inventory-summary.md` |
| 3 | APIs and external services | `03-apis-and-external-services.md` |
| 4 | Potential Java/backend development tasks | `04-backend-development-tasks.md` |
| 5 | Features that can be built entirely in EDS frontend code | `05-eds-frontend-only-features.md` |
| 6 | Migration risk and complexity matrix | `06-risk-complexity-matrix.md` |
| 7 | Questions for the source website / backend team | `07-clarification-questions.md` |

## Evidence (`evidence/`)

| File | What it is |
|---|---|
| `site-wide-dom-feature-aggregate.json` | Feature counts, templates and sample URLs from the captured HTML of all 3,896 analysed pages (main content and header/footer counted separately) |
| `marketo-forms.tsv` | All 22 Marketo form IDs: pages, label, field names, sample URLs |
| `network-functional-calls.txt` | Per captured page (30): non-tracking XHR/fetch calls, method, status, content type, POST body keys, response shape, iframes, media hosts |
| `network-homepage-full-summary.txt` | Full homepage capture including tracking beacons |
| `network-page-globals-cookies-hosts.jsonl` | Per page: detected frontend libraries/vendors, cookie names (no values), storage keys, request hosts |
| `probe-algolia-listings.json`, `probe-hub-listings.json` | Algolia index names, facets, record counts and hit fields; listing controls |
| `probe-blog-search.json` | Blog search submit flow, "Explore topics" menu, category/tag listings |
| `probe-widgets-forms-quiz-header.json`, `probe-quiz.json` | Marketo form fields (not submitted), gated video check, pricing controls, header links, careers links, quiz structure |

Confidence marks used throughout: **[C]** confirmed, **[P]** probable, **[U]** unknown. Query-string values and cookie values were never recorded.
