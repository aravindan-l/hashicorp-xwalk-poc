/* eslint-disable */
/* global WebImporter */

/**
 * Cleanup for HashiCorp webinar / event pages (template "webinar-detail").
 * Runs only for that template, so the blog and homepage importers are unaffected.
 *
 * beforeTransform:
 *  - fails the page when the scrape returned the Vercel bot checkpoint instead of the webinar;
 *  - removes site chrome and non-authorable widgets: skip link, alert banner, global header,
 *    footer (incl. the "Sign up for HashiCorp news" Marketo form 2459), cookie/consent UI,
 *    chat widget, tracking iframes, the hidden Marketo helper forms and scripts/styles;
 *  - promotes headings: webinar title h3 -> h1, "Presenters" h4 -> h2, and the
 *    "Recording coming soon!" h4 (registration panel without a form) -> h2;
 *  - points og:title / description at the webinar title and intro, because the source head
 *    only carries the generic "HashiCorp | An IBM Company" values (read by hashicorp-metadata).
 * afterTransform: drops leftovers the parsers did not consume.
 */

const TEMPLATE = 'webinar-detail';
const CHECKPOINT_TITLE = 'Vercel Security Checkpoint';

const CHROME = [
  'a[href="#main"]',
  "[class*='alert-banner_root']",
  'header',
  'footer',
  '#mktoForm_2459',
  "[class*='prefooterNewsletterForm']",
  "[class*='dg-consent']",
  "[id*='onetrust']",
  "[class*='cookieManager']",
  '#q-messenger-frame',
  'q-focus-sentinel',
  'next-route-announcer',
  '#mktoStyleLoaded',
  'script',
  'style',
  'noscript',
  'link',
  'meta',
];

const TRACKING_IFRAME = /adsrvr\.org|doubleclick\.net|company-target\.com|go\.hashicorp\.com\/index\.php\/form\/XDFrame|qualified\.com/i;

function clean(text) {
  return (text || '').replace(/[​-‏⁠﻿]/g, '').replace(/\s+/g, ' ').trim();
}

/** Replaces a heading with another level, keeping its content and class (section selectors use it). */
function retag(document, node, tag) {
  if (!node || node.tagName.toLowerCase() === tag) return;
  const heading = document.createElement(tag);
  if (node.className) heading.className = node.className;
  heading.append(...node.childNodes);
  node.replaceWith(heading);
}

function setMeta(document, attr, name, value) {
  if (!value) return;
  let meta = document.head?.querySelector(`meta[${attr}="${name}"]`);
  if (!meta) {
    if (!document.head) return;
    meta = document.createElement('meta');
    meta.setAttribute(attr, name);
    document.head.append(meta);
  }
  meta.setAttribute('content', value);
}

/**
 * The webinar's video/recording URL lives only in the Next.js page payload ("videoUrl" in the
 * self.__next_f script chunks); the player iframe is not rendered in snapshots and gated
 * recordings never render it. Scripts are removed before transform, so this runs in preprocess
 * and stores the URL as data-video-url on the video and form panels (attributes survive).
 */
function tagVideoUrl(document) {
  const payloadText = [...document.querySelectorAll('script')].map((s) => s.textContent || '').join('\n');
  const match = payloadText.match(/\\?"videoUrl\\?"\s*:\s*\\?"(https?:[^"\\]+)/);
  if (!match) return;
  document.querySelectorAll("[class*='style_inlineVideo'], [class*='style_webinarForm'], [class*='registration-form_container']")
    .forEach((el) => el.setAttribute('data-video-url', match[1]));
}

/**
 * Lazy next/image (legacy) images are a 1x1 data: GIF until scrolled into view; the real URL is
 * only in the sibling <noscript><img srcSet="/_next/image?url=<encoded source>&w=..."></noscript>.
 * Swap in the original asset URL (unwrapped from /_next/image) so parsers see real images.
 */
function resolveLazyImages(document) {
  document.querySelectorAll('img[src^="data:image"]').forEach((img) => {
    const noscript = img.nextElementSibling?.tagName === 'NOSCRIPT' ? img.nextElementSibling
      : img.parentElement?.querySelector('noscript');
    const raw = noscript ? (noscript.textContent || noscript.innerHTML || '') : '';
    const m = raw.match(/(?:srcset|srcSet|src)="([^"\s]+)/);
    if (!m) return;
    let url = m[1].replace(/&amp;/g, '&');
    const wrapped = url.match(/\/_next\/image\?url=([^&]+)/);
    if (wrapped) url = decodeURIComponent(wrapped[1]);
    else if (url.startsWith('/')) url = `https://www.hashicorp.com${url}`;
    img.setAttribute('src', url);
    noscript.remove();
  });
  // The 1x1 sizing placeholder <img> that next/image puts before the real one.
  document.querySelectorAll('img[aria-hidden="true"][src^="data:image/svg"]').forEach((n) => n.remove());
}

export default function transform(hookName, element, payload) {
  if (payload.template?.name !== TEMPLATE) return;
  const { document } = payload;

  if (hookName === 'preprocess') {
    tagVideoUrl(document);
    resolveLazyImages(document);
    return;
  }

  if (hookName === 'beforeTransform') {
    const title = clean(document.title || document.querySelector('title')?.textContent);
    const h1 = clean(document.querySelector('h1')?.textContent);
    if (title === CHECKPOINT_TITLE || h1 === CHECKPOINT_TITLE) {
      const error = new Error(`Checkpoint page instead of webinar content ("${CHECKPOINT_TITLE}"); not importing`);
      error.name = 'CheckpointPageError';
      throw error;
    }

    // Page metadata: webinar title and first intro paragraph instead of the generic site values.
    const titleNode = element.querySelector("[class*='event-title_eventTitle'] h3, [class*='event-title_eventTitle'] [class*='event-title_title']");
    const pageTitle = clean(titleNode?.textContent);
    const intro = clean(element.querySelector("[class*='style_description__'] p, [class*='live_description'] p")?.textContent);
    setMeta(document, 'property', 'og:title', pageTitle);
    setMeta(document, 'name', 'description', intro);

    // Site chrome and widgets (the page's own Marketo forms inside <main> are kept for the parser).
    element.querySelectorAll(CHROME.join(', ')).forEach((n) => n.remove());
    element.querySelectorAll('iframe').forEach((n) => {
      const src = n.getAttribute('src') || '';
      if (TRACKING_IFRAME.test(src) || !n.closest('main')) n.remove();
    });
    // Hidden Marketo helper forms appended to <body> by forms2.js (no id, outside <main>).
    element.querySelectorAll('form.mktoForm').forEach((form) => {
      if (!form.closest('main')) form.remove();
    });
    // Everything else outside <main> is widget residue (empty portals, tracking pixels), but only
    // drop it when <main> really holds the webinar, so an unexpected layout keeps its content.
    const main = element.querySelector('main');
    const sectionSelectors = (payload.template.sections || []).flatMap((s) => [].concat(s.selector));
    if (main && sectionSelectors.some((s) => main.querySelector(s))) {
      [...element.children].forEach((child) => {
        if (child !== main) child.remove();
      });
    }

    // Headings.
    retag(document, element.querySelector("[class*='event-title_eventTitle'] h3"), 'h1');
    element.querySelectorAll("[class*='style_presentersHeading']").forEach((h) => retag(document, h, 'h2'));
    element.querySelectorAll("[class*='registration-form_container']").forEach((panel) => {
      if (panel.querySelector('form.mktoForm')) return;
      panel.querySelectorAll('h4').forEach((h) => retag(document, h, 'h2'));
    });
  }

  if (hookName === 'afterTransform') {
    // Anything the parsers left behind that is not authorable.
    element.querySelectorAll('script, style, noscript, link, iframe:not(main iframe)').forEach((n) => n.remove());
    element.querySelectorAll("[class*='style_root__'][class*='style_left__']").forEach((n) => {
      if (!n.textContent.trim() && !n.querySelector('img, iframe, picture')) n.remove();
    });
  }
}
