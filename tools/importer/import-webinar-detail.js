/* eslint-disable */
/* global WebImporter */

import cardsSpeakerParser from './parsers/cards-speaker.js';
import embedParser from './parsers/embed.js';
import marketoFormParser from './parsers/marketo-form.js';
import blogListingCleanupTransformer from './transformers/blog-listing-cleanup.js';
import blogMediaTablesTransformer from './transformers/blog-media-tables.js';
import hashicorpCleanupTransformer from './transformers/hashicorp-cleanup.js';
import homepageCleanupTransformer from './transformers/homepage-cleanup.js';
import metadataTransformer from './transformers/hashicorp-metadata.js';
import sectionsTransformer from './transformers/hashicorp-sections.js';
import webinarCleanupTransformer from './transformers/webinar-cleanup.js';

// Template object from tools/importer/page-templates.json (url list trimmed to the sample page;
// the importer gets its URLs from tools/importer/urls-webinar-detail.txt).
const PAGE_TEMPLATE = {
  "name": "webinar-detail",
  "urls": [
    "https://www.hashicorp.com/en/events/webinars/a-guide-to-the-cloud-operating-maturity-model"
  ],
  "description": "Event or webinar page: webinar hero with video or registration, event details and presenters",
  "blocks": [
    {
      "name": "marketo-form",
      "instances": [
        "[class*='style_webinarForm']",
        "[class*='registration-form_container']"
      ]
    },
    {
      "name": "embed",
      "instances": [
        "[class*='style_inlineVideo']"
      ]
    },
    {
      "name": "cards-speaker",
      "instances": [
        "[class*='style_speakerList']",
        "[class*='live_details'] [class*='style_container']:has([class*='speaker_speaker'])"
      ]
    }
  ],
  "sections": [
    {
      "id": "rc2",
      "name": "Webinar intro with form, video or registration",
      "selector": [
        "[class*='style_contentLane']",
        "[class*='live_container']"
      ],
      "style": "split",
      "blocks": [
        "marketo-form",
        "embed",
        "cards-speaker"
      ],
      "defaultContent": [
        "[class*='event-title_eventTitle']",
        "[class*='style_contentLane'] [class*='style_description__']",
        "[class*='live_description']",
        "[class*='topic-content_container']"
      ]
    },
    {
      "id": "rc3",
      "name": "Presenters",
      "selector": [
        "[class*='style_webinarDetails']"
      ],
      "style": "split",
      "blocks": [
        "cards-speaker"
      ],
      "defaultContent": [
        "[class*='style_presentersHeading']"
      ]
    }
  ]
};

const parsers = {
  'marketo-form': marketoFormParser,
  'cards-speaker': cardsSpeakerParser,
  embed: embedParser,
};

// Every transformer checks payload.template.name, so the blog/homepage ones are no-ops here.
// Webinar cleanup first (it also stops checkpoint pages), metadata last in afterTransform.
// Late transformers change the DOM (section <hr> markers), so their beforeTransform runs after
// block discovery.
const sectionTransformers = [sectionsTransformer];
const fragmentTransformers = [];
const lateTransformers = [...sectionTransformers, ...fragmentTransformers];
const correctionTransformers = [];
const transformers = [
  webinarCleanupTransformer,
  hashicorpCleanupTransformer,
  blogListingCleanupTransformer,
  homepageCleanupTransformer,
  blogMediaTablesTransformer,
  ...lateTransformers,
  metadataTransformer,
  ...correctionTransformers,
];
const earlyTransformers = transformers.filter((fn) => !lateTransformers.includes(fn));
const CATALOG = Boolean(PAGE_TEMPLATE.pageCleanup || PAGE_TEMPLATE.blocks.some((b) => b.pageInstances));

function executeTransformers(hookName, element, payload, list = transformers) {
  const enhancedPayload = { ...payload, template: payload.params?.targets?.template || PAGE_TEMPLATE };
  list.forEach((fn) => {
    try { fn(hookName, element, enhancedPayload); }
    catch (e) {
      // A Vercel Security Checkpoint page must fail the import, not produce an empty page.
      if (e && e.name === 'CheckpointPageError') throw e;
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

// AEM Assets folder for the site; each article gets a subfolder matching its page path.
const DAM_ROOT = '/content/dam/hashicorp-xwalk-poc';

/**
 * Points every external image at a readable DAM path for this page and returns
 * { damPath: sourceUrl } so tools/importer/fetch-assets.mjs can download the files.
 * The source asset id prefix (DatoCMS "1506457090-") is dropped from file names.
 */
function mapAssets(main, pagePath) {
  const assets = {};
  const bySource = {};
  main.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src') || '';
    if (!/^https?:\/\//.test(src)) return;
    if (bySource[src]) {
      img.setAttribute('src', bySource[src]);
      return;
    }
    const url = new URL(src);
    const file = decodeURIComponent(url.pathname.split('/').pop() || 'image');
    const pathExt = (file.match(/\.([a-z0-9]+)$/i) || [])[1] || 'png';
    const ext = (url.searchParams.get('fm') || pathExt).toLowerCase().replace('jpeg', 'jpg');
    const base = file.replace(/\.[a-z0-9]+$/i, '').replace(/^\d+-/, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'image';
    let damPath = `${DAM_ROOT}${pagePath}/${base}.${ext}`;
    for (let i = 2; assets[damPath]; i += 1) damPath = `${DAM_ROOT}${pagePath}/${base}-${i}.${ext}`;
    assets[damPath] = src;
    bySource[src] = damPath;
    img.setAttribute('src', damPath);
  });
  return assets;
}

function findBlocksOnPage(document, template, url) {
  const pageBlocks = [];
  const pageKey = (u) => {
    try { const { origin, pathname } = new URL(u); return `${origin}${pathname.replace(/\/$/, '')}`; }
    catch { return u; }
  };
  const key = pageKey(url);
  const claim = (blockDef, selector) => {
    let matches = [];
    try { matches = document.querySelectorAll(selector); } catch { return; }
    matches.forEach((element) => {
      if (pageBlocks.some((b) => b.element === element || b.element.contains(element) || element.contains(b.element))) return;
      pageBlocks.push({ name: blockDef.name, selector, element });
    });
  };
  template.blocks.forEach((blockDef) => {
    const entry = Object.entries(blockDef.pageInstances || {}).find(([u]) => pageKey(u) === key);
    (entry ? entry[1] : []).forEach((selector) => claim(blockDef, selector));
  });
  template.blocks.forEach((blockDef) => (blockDef.instances || []).forEach((selector) => claim(blockDef, selector)));
  return pageBlocks;
}

// Runs the early transformers, then marks each block and section target with an attribute: the
// importer re-creates the body before transform, so only attributes survive, not element references.
function markPageTargets(payload) {
  const { document, params } = payload;
  executeTransformers('beforeTransform', document.body, payload, earlyTransformers);
  const blocks = findBlocksOnPage(document, PAGE_TEMPLATE, params.originalURL).map(({ name, selector, element }, i) => {
    element.setAttribute('data-excat-block', String(i));
    return { name, selector };
  });
  const sections = (PAGE_TEMPLATE.sections || []).map((section, i) => {
    const target = (section.selector || []).map((s) => { try { return document.querySelector(s); } catch { return null; } }).find(Boolean);
    if (!target) return section;
    target.setAttribute('data-excat-section', String(i));
    return { ...section, selector: [`[data-excat-section="${i}"]`] };
  });
  params.targets = { blocks, template: { ...PAGE_TEMPLATE, sections } };
}

export default {
  preprocess: (payload) => {
    // Page-payload data (e.g. the webinar videoUrl) must be read before scripts are removed.
    executeTransformers('preprocess', payload.document.body, payload, earlyTransformers);
    if (CATALOG) markPageTargets(payload);
  },
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;
    params.fragments = [];

    if (!params.targets) markPageTargets(payload);
    const pageBlocks = params.targets.blocks
      .map((block, i) => ({ ...block, element: document.querySelector(`[data-excat-block="${i}"]`) }))
      .filter((block) => block.element);
    executeTransformers('beforeTransform', main, { ...payload, pageBlocks }, lateTransformers);

    pageBlocks.forEach((block) => {
      if (!main.contains(block.element)) return;
      const parser = parsers[block.name];
      if (!parser) return;
      try { parser(block.element, { document, url, params }); }
      catch (e) { console.error(`Failed to parse ${block.name} (${block.selector}):`, e); }
    });

    // The metadata transformer writes the Metadata block (lowercase keys for XWalk page fields),
    // so WebImporter.rules.createMetadata is not used and no extra <hr> is added before it.
    executeTransformers('afterTransform', main, payload);

    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    params.fragments.forEach(({ element }) => {
      executeTransformers('afterTransform', element, payload, earlyTransformers);
      WebImporter.rules.transformBackgroundImages(element, document);
      WebImporter.rules.adjustImageUrls(element, url, params.originalURL);
    });

    // Same convention as the blog importer: the source /en locale prefix is dropped.
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '')
      .replace(/^\/en(?=\/)/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);
    const assets = mapAssets(main, path);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name), assets },
    }, ...params.fragments];
  },
};
