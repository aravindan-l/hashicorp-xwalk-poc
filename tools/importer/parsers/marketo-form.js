/* eslint-disable */
/* global WebImporter */

/**
 * Parser for the marketo-form block (XWalk simple block; fields: title, formId, recordingUrl).
 * Source: https://www.hashicorp.com/en/events/webinars/*
 * Selectors:
 * - [class*='style_webinarForm'] (recorded webinar: "Watch the recorded webinar" panel);
 * - [class*='registration-form_container'] (live webinar panel: registration form, or the
 *   'Recording coming soon!' notice, which becomes the message field when there is no form).
 * Placeholder block: the Marketo inputs are not imported, only the heading, the numeric form ID
 * (from form#mktoForm_<id>) and an optional recording link.
 * Block table: one row per field, in model order; recordingUrl is an empty cell when absent.
 */

function clean(text) {
  return (text || '').replace(/[​-‏⁠﻿]/g, '').replace(/\s+/g, ' ').trim();
}

function absolute(href) {
  try { return new URL(href, 'https://www.hashicorp.com').href; } catch (e) { return href; }
}

function hinted(document, field, nodes) {
  const list = nodes.filter(Boolean);
  if (!list.length) return '';
  const frag = document.createDocumentFragment();
  frag.appendChild(document.createComment(` field:${field} `));
  list.forEach((n) => frag.appendChild(n));
  return frag;
}

function textNode(document, text) {
  if (!text) return null;
  const p = document.createElement('p');
  p.textContent = text;
  return p;
}

/** The panel heading: the first heading outside the form, else the nearest preceding heading. */
function findTitle(element) {
  const own = [...element.querySelectorAll('h1, h2, h3, h4, h5, h6')]
    .find((h) => !h.closest('form') && clean(h.textContent));
  if (own) return clean(own.textContent);
  let node = element.previousElementSibling;
  while (node) {
    const h = /^H[1-6]$/.test(node.tagName) ? node : node.querySelector('h1, h2, h3, h4, h5, h6');
    if (h && clean(h.textContent)) return clean(h.textContent);
    node = node.previousElementSibling;
  }
  return '';
}

function findFormId(element) {
  const form = element.querySelector('form[id^="mktoForm_"], form.mktoForm');
  const match = (form?.getAttribute('id') || '').match(/(\d+)/);
  return match ? match[1] : '';
}

/** A recording link in the panel, outside the Marketo form (privacy links etc. live inside it). */
function findRecording(element) {
  return [...element.querySelectorAll('a[href]')]
    .filter((a) => !a.closest('form'))
    .find((a) => /youtube\.com|youtu\.be|vimeo\.com|wistia|recording|on-demand/i.test(a.getAttribute('href'))
      || /recording|watch/i.test(clean(a.textContent)));
}

export default function parse(element, { document }) {
  const title = findTitle(element);
  const formId = findFormId(element);
  const recording = findRecording(element);

  // Gated recordings: the URL only exists in the page payload (data-video-url, set in preprocess).
  const recordingHref = recording ? recording.getAttribute('href') : (element.getAttribute('data-video-url') || '');

  let recordingLink = null;
  if (recordingHref) {
    const a = document.createElement('a');
    a.href = absolute(recordingHref);
    a.textContent = a.href;
    recordingLink = document.createElement('p');
    recordingLink.append(a);
  }

  // A panel without a form ("Recording coming soon!") keeps its paragraphs as the message field.
  const message = formId ? [] : [...element.querySelectorAll('p')]
    .filter((p) => !p.closest('form') && clean(p.textContent))
    .map((p) => { const n = document.createElement('p'); n.innerHTML = p.innerHTML; return n; });

  const cells = [
    [hinted(document, 'title', [textNode(document, title)])],
    [hinted(document, 'formId', [textNode(document, formId)])],
    [hinted(document, 'recordingUrl', [recordingLink])],
    [hinted(document, 'message', message)],
  ];
  const block = WebImporter.Blocks.createBlock(document, { name: 'marketo-form', cells });
  element.replaceWith(block);
}
