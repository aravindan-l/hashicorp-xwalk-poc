/* eslint-disable */
/* global WebImporter */

/**
 * Parser for the embed block (XWalk simple block; fields: embed_placeholder, embed_uri).
 * Source: https://www.hashicorp.com/en/events/webinars/*
 * Selector: [class*='style_inlineVideo'] (iframe src, else data-video-url set in preprocess
 * by webinar-cleanup from the page payload, since the player iframe is often not rendered)
 * The YouTube iframe src (https://www.youtube.com/embed/{id}?...) is normalized to
 * https://www.youtube.com/watch?v={id}. No placeholder image is imported.
 * Block table: one row with the video URL as a link.
 */

function absolute(href) {
  try { return new URL(href, 'https://www.hashicorp.com').href; } catch (e) { return href; }
}

function videoUrl(element) {
  const iframe = element.querySelector('iframe[src], iframe[data-src]');
  const src = iframe ? (iframe.getAttribute('src') || iframe.getAttribute('data-src') || '') : '';
  const youtube = src.match(/youtube(?:-nocookie)?\.com\/embed\/([\w-]+)/);
  if (youtube) return `https://www.youtube.com/watch?v=${youtube[1]}`;
  const vimeo = src.match(/player\.vimeo\.com\/video\/(\d+)/);
  if (vimeo) return `https://vimeo.com/${vimeo[1]}`;
  if (src) return absolute(src);
  const fromPayload = element.getAttribute('data-video-url') || '';
  const short = fromPayload.match(/youtu\.be\/([\w-]+)/);
  if (short) return `https://www.youtube.com/watch?v=${short[1]}`;
  return fromPayload;
}

export default function parse(element, { document }) {
  const url = videoUrl(element);
  let cell = '';
  if (url) {
    const a = document.createElement('a');
    a.href = url;
    a.textContent = url;
    cell = document.createDocumentFragment();
    cell.appendChild(document.createComment(' field:embed_uri '));
    cell.appendChild(a);
  }
  const cells = [[cell]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'embed', cells });
  element.replaceWith(block);
}
