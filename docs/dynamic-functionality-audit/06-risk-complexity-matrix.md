# Migration risk and complexity matrix

- **Complexity** = build effort in EDS (Low / Medium / High).
- **Risk** = how likely the migration breaks business outcomes or has unknowns (Low / Medium / High).
- Pages come from the DOM scan; "site-wide" = global chrome on all 3,896 analysed pages.

| ID | Feature | Category | Pages | Complexity | Risk | Main risk driver | Mitigation | Confidence |
|---|---|---|---|---|---|---|---|---|
| F01 | Blog search | C D (E for indexing) | 1,612 boxes + results | **High** (Algolia) / Medium (query-index) | **High** | Full-text relevance expectations; indexer ownership; SSR 500 today | Decide Algolia vs. query-index early; prototype on 1,600 posts | C |
| F05 | Partner directory | C D | 1 + 478 profiles | Medium | **High** | Tiers/competencies may be mastered outside the CMS; page missing from the sitemap | Confirm the data source (Q-PARTNER) | C / U |
| F03 | Resource library | C D | 1 + 454 | Medium | **High** | 2,025 records include non-page/external items; page missing from the sitemap | Inventory index records vs. pages | C / U |
| F10 | Marketo forms (22) | D E G | 3,506 + 473 | Medium | **High** | Lead flow and attribution (UTM, `form_page_url__c`, `registeredWebinarID`, `fastTracktoSales`) must stay identical; consent wording | One `marketo-form` block; test every form ID on preview against Marketo test leads | C (load) / P (submit) |
| F11 | Gated content | E | ~440 | Medium | Medium | Business may expect hard gating; asset URLs currently public | Confirm the soft gate; move PDFs/MP4 to AEM Assets | C |
| F17 | Localization / geo banner | F E | site-wide (11 locales) | Medium (High if all locales) | **High** | 10 non-English locales are out of the current scope; hreflang/redirect parity | Scope decision (Q-LOCALE) | C / U |
| F15 | PostHog experiments | F G | site-wide | Medium | Medium | Running experiments break; flicker | Freeze or re-implement experiments; EDS experimentation plugin | C / P |
| F18 | Consent (DataGrail) | G | site-wide | Medium | Medium | Legal compliance; tag gating order; LCP | Load early, async; legal sign-off | C |
| F19 | Martech tags | G | site-wide | Low–Medium | Medium | Attribution gaps (Meta CAPI relay, Floodlight, LinkedIn) | Tag-by-tag parity checklist with marketing ops | C |
| F02 | Events listing | C D | 2 + 779 | Medium | Medium | Time-based sorting, `isHidden`, `recorded` flags | Event metadata model | C |
| F12 | Webinar time state | C | ~470 | Low–Medium | Medium | Wrong state shown around event dates | Client-side date logic + QA cases | C / P |
| F08 | Automatic blog listings | C | ~35 | Medium | Medium | 1,600 posts; tag pages list up to 450 posts in one page | Query-index + pagination/load more | C |
| F26 | Conference agenda / sessions / speakers | C | 1 + 63 + 83 | Medium | Medium | CMS relations (session↔speaker↔day) | Metadata model + agenda block | C / P |
| F22 | Maturity quiz | B | 2 + results | Medium | Medium | Scoring rules hidden in the JS bundle | Get the scoring spec (Q-QUIZ) | C / U |
| F23 | Pricing page | B | 1 | Medium | Low–Medium | Complex comparison table | Table variant | C |
| F09 | RSS/Atom feeds | E | — | Low–Medium | Low | Subscribers lose the feed | Edge/App Builder feed or redirect | C |
| F27 | Redirects / vanity links | E | — | Low–Medium | Medium | Lost SEO/links if the rule export is incomplete | Export from Vercel config | C / U |
| F04 | Case studies listing | C D | 1 + 42 | Low–Medium | Low | External-link records | Query-index | C |
| F06 | Ambassador directory | C D | 1 | Low | Low | Personal data/consent | EDS sheet | C |
| F07 | Press archive | C D | 1 + press | Low–Medium | Low | External media-coverage items | EDS sheet | C |
| F13 | Cvent registration | D G | 2 | Low | Low | iframe height/params | Embed with params | C |
| F14 | Qualified chat | G | site-wide | Low | Low | Routing rules in the vendor console | Delayed load | C |
| F16 | Demandbase | G (F?) | site-wide | Low | Low–Medium | Unknown on-page personalization | Confirm (Q-ABM) | C / U |
| F20 | Video/media embeds | G | ~950 | Low–Medium | Low | DatoCMS-hosted MP4s must move | AEM Assets migration | C |
| F21 | Sign-in/sign-up links | F | 3,515 | Low | Low | `ajs_aid` attribution | Small script | C |
| F24 | Tabs / accordions / carousels / agenda tabs | B | ~600 | Low | Low | Visual parity | Existing blocks | C |
| F25 | Code samples | B | 473 | Low–Medium | Low | Line-highlight fidelity | Highlighter + import transformer | C |
| F28 | Bot protection | infra | — | Low | Low–Medium | Scraping/abuse protection lost | CDN WAF | C / U |
| F29–30 | Global fragments, static pages | A | 530 + bodies | Low | Low | — | Import | C |

## Heat map

```
              Complexity →   Low            Medium                        High
Risk ↓
High                         —              F05 F03 F10 F17               F01 (Algolia)
Medium                       F27            F02 F08 F11 F12 F15 F18       —
                                            F19 F22 F26
Low                          F06 F13 F14    F04 F07 F09 F20 F23 F25       —
                             F21 F24 F29
```

## Cross-cutting risks

1. **Search/listing strategy** (F01–F07) drives about half of the dynamic work. Deciding Algolia vs. EDS query-index is the first architecture decision.
2. **Listing hubs are missing from the sitemap** (/en/resources, /en/partners/find-a-partner) and **return HTTP 500 on first render** today. They need to be added to the migration scope explicitly.
3. **DatoCMS assets** (images, 98 PDFs, ≈45 MP4s) must move to AEM Assets. Gated PDFs especially, or their public URLs break.
4. **Localization scope** (10 more locales) can double or triple the content effort.
5. **Martech parity** needs marketing-ops sign-off. Several tags are hard-coded outside GTM today.
