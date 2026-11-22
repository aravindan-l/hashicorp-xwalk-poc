/* eslint-disable */
/* global WebImporter */

/**
 * Parser for the cards-speaker block (XWalk container; items: image, imageAlt, text).
 * Source: https://www.hashicorp.com/en/events/webinars/*
 * Selectors:
 * - [class*='style_speakerList'] (recorded webinar presenters);
 * - [class*='live_details'] [class*='style_container']:has([class*='speaker_speaker']) (live).
 * Block table: one row per speaker ([class*='speaker_speaker__'] item): headshot image in the
 * first cell (empty for initials-only tiles), then name (h5), role/company paragraph and a
 * paragraph of social links (LinkedIn / GitHub / X, platform name as link text).
 */

const PLATFORMS = [
  [/linkedin\.com/i, 'LinkedIn'],
  [/github\.com/i, 'GitHub'],
  [/(^|\.|\/\/)(twitter|x)\.com/i, 'X'],
  [/youtube\.com/i, 'YouTube'],
  [/medium\.com/i, 'Medium'],
];

function clean(text) {
  return (text || '').replace(/[​-‏⁠﻿]/g, '').replace(/\s+/g, ' ').trim();
}

function absolute(href) {
  try { return new URL(href, 'https://www.hashicorp.com').href; } catch (e) { return href; }
}

/** The source URL of an image (snapshot runs may swap src for a data:/blob:/media-da copy). */
function sourceOf(img) {
  const src = img.getAttribute('src') || '';
  if (!/^(blob:|data:)|\/media-da\//.test(src)) return src;
  return (img.getAttribute('srcset') || '').trim().split(/\s+/)[0] || src;
}

function assetUrl(src) {
  let url = absolute(src || '');
  if (url.includes('/_next/image')) {
    const inner = new URL(url).searchParams.get('url');
    if (inner) url = absolute(decodeURIComponent(inner));
  }
  const base = url.split('?')[0];
  return /\.svg$/i.test(base) ? `${base}?fm=png&w=1200` : url;
}

function hinted(document, field, nodes) {
  const list = nodes.filter(Boolean);
  if (!list.length) return '';
  const frag = document.createDocumentFragment();
  frag.appendChild(document.createComment(` field:${field} `));
  list.forEach((n) => frag.appendChild(n));
  return frag;
}

function platformName(href) {
  const hit = PLATFORMS.find(([re]) => re.test(href));
  if (hit) return hit[1];
  try { return new URL(href).hostname.replace(/^www\./, ''); } catch (e) { return href; }
}

/** Speaker items: elements whose class list has a speaker_speaker__ token (not ImageFrame etc). */
function speakerItems(element) {
  const isItem = (n) => [...n.classList].some((c) => /^speaker_speaker__/.test(c));
  const items = [...element.querySelectorAll('[class*="speaker_speaker"]')].filter(isItem);
  if (!items.length && isItem(element)) items.push(element);
  return items;
}

function headshot(document, item, name) {
  const frame = item.querySelector('[class*="speaker_speakerImageFrame"]');
  if (!frame) return null;
  const src = [...frame.querySelectorAll('img')]
    .map(sourceOf)
    .find((s) => s && !s.startsWith('data:') && !s.startsWith('blob:'));
  if (!src) return null;
  const img = document.createElement('img');
  img.src = assetUrl(src);
  const original = [...frame.querySelectorAll('img')].find((i) => clean(i.getAttribute('alt')));
  img.alt = clean(original?.getAttribute('alt')) || name;
  return img;
}

function speakerRow(document, item) {
  const nameEl = item.querySelector('h5[class*="speaker_name"], [class*="speaker_name"]');
  const name = clean(nameEl?.textContent);
  const text = [];
  if (name) {
    const h5 = document.createElement('h5');
    h5.textContent = name;
    text.push(h5);
  }
  const desc = clean(item.querySelector('[class*="speaker_description"]')?.textContent);
  if (desc) {
    const p = document.createElement('p');
    p.textContent = desc;
    text.push(p);
  }
  const links = [...item.querySelectorAll('a[href]')]
    .filter((a) => !a.closest('[class*="speaker_speakerImageFrame"]'));
  if (links.length) {
    const p = document.createElement('p');
    links.forEach((src, i) => {
      if (i) p.append(' ');
      const a = document.createElement('a');
      a.href = absolute(src.getAttribute('href'));
      a.textContent = platformName(a.href);
      p.append(a);
    });
    text.push(p);
  }
  return [hinted(document, 'image', [headshot(document, item, name)]), hinted(document, 'text', text)];
}

export default function parse(element, { document }) {
  const cells = speakerItems(element).map((item) => speakerRow(document, item));
  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-speaker', cells });
  element.replaceWith(block);
}
