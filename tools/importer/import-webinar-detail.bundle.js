/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-webinar-detail.js
  var import_webinar_detail_exports = {};
  __export(import_webinar_detail_exports, {
    default: () => import_webinar_detail_default
  });

  // tools/importer/parsers/cards-speaker.js
  var PLATFORMS = [
    [/linkedin\.com/i, "LinkedIn"],
    [/github\.com/i, "GitHub"],
    [/(^|\.|\/\/)(twitter|x)\.com/i, "X"],
    [/youtube\.com/i, "YouTube"],
    [/medium\.com/i, "Medium"]
  ];
  function clean(text) {
    return (text || "").replace(/[​-‏⁠﻿]/g, "").replace(/\s+/g, " ").trim();
  }
  function absolute(href) {
    try {
      return new URL(href, "https://www.hashicorp.com").href;
    } catch (e) {
      return href;
    }
  }
  function sourceOf(img) {
    const src = img.getAttribute("src") || "";
    if (!/^(blob:|data:)|\/media-da\//.test(src)) return src;
    return (img.getAttribute("srcset") || "").trim().split(/\s+/)[0] || src;
  }
  function assetUrl(src) {
    let url = absolute(src || "");
    if (url.includes("/_next/image")) {
      const inner = new URL(url).searchParams.get("url");
      if (inner) url = absolute(decodeURIComponent(inner));
    }
    const base = url.split("?")[0];
    return /\.svg$/i.test(base) ? `${base}?fm=png&w=1200` : url;
  }
  function hinted(document, field, nodes) {
    const list = nodes.filter(Boolean);
    if (!list.length) return "";
    const frag = document.createDocumentFragment();
    frag.appendChild(document.createComment(` field:${field} `));
    list.forEach((n) => frag.appendChild(n));
    return frag;
  }
  function platformName(href) {
    const hit = PLATFORMS.find(([re]) => re.test(href));
    if (hit) return hit[1];
    try {
      return new URL(href).hostname.replace(/^www\./, "");
    } catch (e) {
      return href;
    }
  }
  function speakerItems(element) {
    const isItem = (n) => [...n.classList].some((c) => /^speaker_speaker__/.test(c));
    const items = [...element.querySelectorAll('[class*="speaker_speaker"]')].filter(isItem);
    if (!items.length && isItem(element)) items.push(element);
    return items;
  }
  function headshot(document, item, name) {
    const frame = item.querySelector('[class*="speaker_speakerImageFrame"]');
    if (!frame) return null;
    const src = [...frame.querySelectorAll("img")].map(sourceOf).find((s) => s && !s.startsWith("data:") && !s.startsWith("blob:"));
    if (!src) return null;
    const img = document.createElement("img");
    img.src = assetUrl(src);
    const original = [...frame.querySelectorAll("img")].find((i) => clean(i.getAttribute("alt")));
    img.alt = clean(original == null ? void 0 : original.getAttribute("alt")) || name;
    return img;
  }
  function speakerRow(document, item) {
    var _a;
    const nameEl = item.querySelector('h5[class*="speaker_name"], [class*="speaker_name"]');
    const name = clean(nameEl == null ? void 0 : nameEl.textContent);
    const text = [];
    if (name) {
      const h5 = document.createElement("h5");
      h5.textContent = name;
      text.push(h5);
    }
    const desc = clean((_a = item.querySelector('[class*="speaker_description"]')) == null ? void 0 : _a.textContent);
    if (desc) {
      const p = document.createElement("p");
      p.textContent = desc;
      text.push(p);
    }
    const links = [...item.querySelectorAll("a[href]")].filter((a) => !a.closest('[class*="speaker_speakerImageFrame"]'));
    if (links.length) {
      const p = document.createElement("p");
      links.forEach((src, i) => {
        if (i) p.append(" ");
        const a = document.createElement("a");
        a.href = absolute(src.getAttribute("href"));
        a.textContent = platformName(a.href);
        p.append(a);
      });
      text.push(p);
    }
    return [hinted(document, "image", [headshot(document, item, name)]), hinted(document, "text", text)];
  }
  function parse(element, { document }) {
    const cells = speakerItems(element).map((item) => speakerRow(document, item));
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-speaker", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/embed.js
  function absolute2(href) {
    try {
      return new URL(href, "https://www.hashicorp.com").href;
    } catch (e) {
      return href;
    }
  }
  function videoUrl(element) {
    const iframe = element.querySelector("iframe[src], iframe[data-src]");
    const src = iframe ? iframe.getAttribute("src") || iframe.getAttribute("data-src") || "" : "";
    const youtube = src.match(/youtube(?:-nocookie)?\.com\/embed\/([\w-]+)/);
    if (youtube) return `https://www.youtube.com/watch?v=${youtube[1]}`;
    const vimeo = src.match(/player\.vimeo\.com\/video\/(\d+)/);
    if (vimeo) return `https://vimeo.com/${vimeo[1]}`;
    if (src) return absolute2(src);
    const fromPayload = element.getAttribute("data-video-url") || "";
    const short = fromPayload.match(/youtu\.be\/([\w-]+)/);
    if (short) return `https://www.youtube.com/watch?v=${short[1]}`;
    return fromPayload;
  }
  function parse2(element, { document }) {
    const url = videoUrl(element);
    let cell = "";
    if (url) {
      const a = document.createElement("a");
      a.href = url;
      a.textContent = url;
      cell = document.createDocumentFragment();
      cell.appendChild(document.createComment(" field:embed_uri "));
      cell.appendChild(a);
    }
    const cells = [[cell]];
    const block = WebImporter.Blocks.createBlock(document, { name: "embed", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/marketo-form.js
  function clean2(text) {
    return (text || "").replace(/[​-‏⁠﻿]/g, "").replace(/\s+/g, " ").trim();
  }
  function absolute3(href) {
    try {
      return new URL(href, "https://www.hashicorp.com").href;
    } catch (e) {
      return href;
    }
  }
  function hinted2(document, field, nodes) {
    const list = nodes.filter(Boolean);
    if (!list.length) return "";
    const frag = document.createDocumentFragment();
    frag.appendChild(document.createComment(` field:${field} `));
    list.forEach((n) => frag.appendChild(n));
    return frag;
  }
  function textNode(document, text) {
    if (!text) return null;
    const p = document.createElement("p");
    p.textContent = text;
    return p;
  }
  function findTitle(element) {
    const own = [...element.querySelectorAll("h1, h2, h3, h4, h5, h6")].find((h) => !h.closest("form") && clean2(h.textContent));
    if (own) return clean2(own.textContent);
    let node = element.previousElementSibling;
    while (node) {
      const h = /^H[1-6]$/.test(node.tagName) ? node : node.querySelector("h1, h2, h3, h4, h5, h6");
      if (h && clean2(h.textContent)) return clean2(h.textContent);
      node = node.previousElementSibling;
    }
    return "";
  }
  function findFormId(element) {
    const form = element.querySelector('form[id^="mktoForm_"], form.mktoForm');
    const match = ((form == null ? void 0 : form.getAttribute("id")) || "").match(/(\d+)/);
    return match ? match[1] : "";
  }
  function findRecording(element) {
    return [...element.querySelectorAll("a[href]")].filter((a) => !a.closest("form")).find((a) => /youtube\.com|youtu\.be|vimeo\.com|wistia|recording|on-demand/i.test(a.getAttribute("href")) || /recording|watch/i.test(clean2(a.textContent)));
  }
  function parse3(element, { document }) {
    const title = findTitle(element);
    const formId = findFormId(element);
    const recording = findRecording(element);
    const recordingHref = recording ? recording.getAttribute("href") : element.getAttribute("data-video-url") || "";
    let recordingLink = null;
    if (recordingHref) {
      const a = document.createElement("a");
      a.href = absolute3(recordingHref);
      a.textContent = a.href;
      recordingLink = document.createElement("p");
      recordingLink.append(a);
    }
    const message = formId ? [] : [...element.querySelectorAll("p")].filter((p) => !p.closest("form") && clean2(p.textContent)).map((p) => {
      const n = document.createElement("p");
      n.innerHTML = p.innerHTML;
      return n;
    });
    const cells = [
      [hinted2(document, "title", [textNode(document, title)])],
      [hinted2(document, "formId", [textNode(document, formId)])],
      [hinted2(document, "recordingUrl", [recordingLink])],
      [hinted2(document, "message", message)]
    ];
    const block = WebImporter.Blocks.createBlock(document, { name: "marketo-form", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/blog-listing-cleanup.js
  function transform(hookName, element, payload) {
    var _a;
    if (((_a = payload.template) == null ? void 0 : _a.name) !== "blog-listing" || hookName !== "beforeTransform") return;
    element.querySelectorAll('header, footer, script, style, noscript, iframe, link, aside, [role="dialog"]').forEach((n) => n.remove());
    element.querySelectorAll('a[href="#main"]').forEach((n) => n.remove());
    [...element.children].forEach((child) => {
      if (!child.matches("main") && !child.querySelector("main")) child.remove();
    });
  }

  // tools/importer/transformers/blog-media-tables.js
  var MAX_TABLE_COLUMNS = 4;
  var VIDEO_CONTAINERS = '[class*="BlogVideo_videoContainer"], [data-testid="wpl-inline-video"]';
  function absolute4(href) {
    try {
      return new URL(href, "https://www.hashicorp.com").href;
    } catch (e) {
      return href;
    }
  }
  function link(document, href) {
    const a = document.createElement("a");
    a.href = href;
    a.textContent = href;
    return a;
  }
  function videoSource(container) {
    var _a, _b;
    const iframe = container.querySelector("iframe[src], iframe[data-src]");
    const frameSrc = iframe && (iframe.getAttribute("src") || iframe.getAttribute("data-src"));
    if (frameSrc) {
      const youtube = frameSrc.match(/youtube(?:-nocookie)?\.com\/embed\/([\w-]+)/);
      if (youtube) return { block: "Embed", href: `https://www.youtube.com/watch?v=${youtube[1]}` };
      const vimeo = frameSrc.match(/player\.vimeo\.com\/video\/(\d+)/);
      if (vimeo) return { block: "Embed", href: `https://vimeo.com/${vimeo[1]}` };
      if (/youtu\.be|vimeo\.com|youtube\.com/.test(frameSrc)) return { block: "Embed", href: absolute4(frameSrc) };
    }
    const wistiaClass = (_a = container.querySelector('[class*="wistia_async_"]')) == null ? void 0 : _a.className.match(/wistia_async_(\w+)/);
    const wistiaSource = container.innerHTML.match(/fast\.wistia\.(?:com|net)\/embed\/medias\/(\w+)/);
    const wistia = (_b = wistiaClass || wistiaSource) == null ? void 0 : _b[1];
    if (wistia) return { block: "Embed", href: `https://fast.wistia.net/embed/iframe/${wistia}` };
    const video = [...container.querySelectorAll("video[src], video source[src]")].map((n) => n.getAttribute("src")).find((src) => src && !src.startsWith("blob:") && /\.mp4(\?|$)/i.test(src));
    if (video) return { block: "Video", href: absolute4(video) };
    return null;
  }
  function replaceVideos(main, document) {
    const containers = [...main.querySelectorAll(VIDEO_CONTAINERS)].filter((c) => {
      var _a;
      return !((_a = c.parentElement) == null ? void 0 : _a.closest(VIDEO_CONTAINERS));
    });
    containers.forEach((container) => {
      const source = videoSource(container);
      if (!source) {
        console.warn(`[blog-media-tables] video container without a known source left out: ${container.className}`);
        container.remove();
        return;
      }
      container.replaceWith(WebImporter.Blocks.createBlock(document, {
        name: source.block,
        cells: [[link(document, source.href)]]
      }));
    });
  }
  function wideTableAsList(table, rows, document) {
    var _a;
    const hasHeader = [...((_a = table.querySelector("tr")) == null ? void 0 : _a.children) || []].every((c) => c.tagName === "TH");
    const headers = hasHeader ? rows[0].map((cell) => cell.textContent.trim()) : [];
    const list = document.createElement("ul");
    (hasHeader ? rows.slice(1) : rows).forEach((row) => {
      const item = document.createElement("li");
      row.forEach((cell, i) => {
        const p = document.createElement("p");
        if (headers[i]) {
          const label = document.createElement("strong");
          label.textContent = `${headers[i]}: `;
          p.append(label);
        }
        p.append(...cell.childNodes);
        item.append(p);
      });
      list.append(item);
    });
    return list;
  }
  function replaceTables(main, document) {
    main.querySelectorAll('[class*="post_content"] table').forEach((table) => {
      var _a;
      const rows = [...table.querySelectorAll("tr")].map((tr) => [...tr.children].filter((cell) => cell.tagName === "TH" || cell.tagName === "TD").map((cell) => {
        const div = document.createElement("div");
        div.append(...cell.childNodes);
        return div;
      }));
      const columns = Math.max(0, ...rows.map((r) => r.length));
      if (!rows.length || !columns) return;
      if (columns > MAX_TABLE_COLUMNS) {
        console.warn(`[blog-media-tables] ${columns}-column table written as a list: the Table block goes up to ${MAX_TABLE_COLUMNS}`);
        (_a = table.closest('[class*="tableBlock"]')) == null ? void 0 : _a.replaceWith(table);
        table.replaceWith(wideTableAsList(table, rows, document));
        return;
      }
      rows.forEach((row) => {
        while (row.length < columns) row.push("");
      });
      if (columns > 1) rows.forEach((row) => row.unshift(`table-col-${columns}`));
      const container = table.closest('[class*="tableBlock"]') || table;
      container.replaceWith(WebImporter.Blocks.createBlock(document, { name: "Table", cells: rows }));
    });
  }
  function replaceQuotes(main, document) {
    main.querySelectorAll('[class*="post_content"] blockquote').forEach((quote) => {
      const quotation = document.createElement("div");
      quotation.append(...quote.childNodes);
      quote.replaceWith(WebImporter.Blocks.createBlock(document, { name: "Quote", cells: [[quotation]] }));
    });
  }
  function transform2(hookName, element, payload) {
    var _a;
    if (((_a = payload.template) == null ? void 0 : _a.name) !== "blog-article") return;
    if (hookName !== "beforeTransform") return;
    const { document } = payload;
    replaceTables(element, document);
    replaceVideos(element, document);
    replaceQuotes(element, document);
  }

  // tools/importer/transformers/hashicorp-cleanup.js
  function absolute5(href) {
    try {
      return new URL(href, "https://www.hashicorp.com").href;
    } catch (e) {
      return href;
    }
  }
  function assetUrl2(src) {
    let url = absolute5(src || "");
    if (url.includes("/_next/image")) {
      const inner = new URL(url).searchParams.get("url");
      if (inner) url = absolute5(inner);
    }
    const base = url.split("?")[0];
    return /\.svg$/i.test(base) ? `${base}?fm=png&w=1600` : url;
  }
  function transform3(hookName, element, payload) {
    var _a;
    if (((_a = payload.template) == null ? void 0 : _a.name) !== "blog-article") return;
    const { document } = payload;
    if (hookName === "beforeTransform") {
      const post = element.querySelector('[class*="post_root"]');
      if (post) element.replaceChildren(post);
      element.querySelectorAll("script, style, noscript, iframe, link, button").forEach((n) => n.remove());
      element.querySelectorAll('[class*="post_rightColumn"]').forEach((n) => n.remove());
      element.querySelectorAll('[class*="post_content"] :is(h2, h3, h4, h5, h6) a[href^="#"]').forEach((a) => {
        if (a.textContent.trim().length <= 2) a.remove();
      });
      element.querySelectorAll('[class*="post_content"] img').forEach((img) => {
        var _a2;
        img.setAttribute("src", assetUrl2(img.getAttribute("src")));
        img.removeAttribute("srcset");
        if (!img.getAttribute("alt")) {
          const caption = (_a2 = img.closest('[class*="blogImage"]')) == null ? void 0 : _a2.querySelector("p, figcaption");
          if (caption) img.setAttribute("alt", caption.textContent.trim());
        }
      });
    }
    if (hookName === "afterTransform") {
      element.querySelectorAll('[class*="post_leftColumn"], [class*="post_image"]').forEach((n) => n.remove());
      element.querySelectorAll('[class*="clearfix"]').forEach((n) => {
        if (!n.textContent.trim() && !n.querySelector("img")) n.remove();
      });
    }
  }

  // tools/importer/transformers/homepage-cleanup.js
  var TAG = "data-homepage-section";
  var DEFAULT_CONTENT_SECTIONS = {
    callout: "main > div:has([class*='base_callout'])",
    intro: "main > div:has([class*='style_modularEyebrow'])",
    centered: "main > div:has([class*='style_heading'][class*='style_center'])",
    resources: "main > div:has([data-import-tabpanel] > ul)",
    cta: "main > div[class*='faint']"
  };
  function clean3(text) {
    return (text || "").replace(/[​-‏⁠﻿]/g, "").replace(/\s+/g, " ").trim();
  }
  function absolute6(href) {
    try {
      return new URL(href, "https://www.hashicorp.com").href;
    } catch (e) {
      return href;
    }
  }
  function el(document, tag, text) {
    const node = document.createElement(tag);
    if (text !== void 0) node.textContent = text;
    return node;
  }
  function linkParagraph(document, a) {
    const link2 = el(document, "a", clean3(a.textContent));
    link2.href = absolute6(a.getAttribute("href"));
    let wrapper = null;
    if (/standalone-link/.test(a.className)) wrapper = "em";
    else if (!/color-primary/.test(a.className)) wrapper = "strong";
    const p = el(document, "p");
    if (wrapper) {
      const w = el(document, wrapper);
      w.append(link2);
      p.append(w);
    } else {
      p.append(link2);
    }
    return p;
  }
  function ctas(document, scope) {
    const seen = /* @__PURE__ */ new Set();
    return [...scope.querySelectorAll('a[class*="button__"], a[class*="standalone-link"]')].filter((a) => !/style_(mobile|tablet)/.test(a.className) && !a.closest('[class*="mobileCtas"]')).filter((a) => {
      const key = `${clean3(a.textContent)}|${a.getAttribute("href")}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).map((a) => linkParagraph(document, a));
  }
  function introNodes(document, scope) {
    const nodes = [];
    const eyebrow = scope.querySelector('[class*="eyebrowWrapper"], [class*="modularEyebrow"]') || scope.querySelector('[class*="eyebrow-headline"] > span:first-child');
    if (eyebrow && clean3(eyebrow.textContent)) nodes.push(el(document, "p", clean3(eyebrow.textContent)));
    const h = scope.querySelector("h2");
    if (h) nodes.push(el(document, "h2", clean3(h.textContent)));
    const body = [...scope.querySelectorAll('[class*="style_body"] p')];
    const paras = body.length ? body : [...scope.querySelectorAll('[class*="style_body"], [class*="styles_root"]:not(h2)')].filter((n) => !n.querySelector('h2, [class*="style_body"]') && clean3(n.textContent) && !n.closest("h2"));
    paras.forEach((p) => nodes.push(el(document, "p", clean3(p.textContent))));
    return nodes;
  }
  function callout(document, section) {
    const nodes = [];
    const title = section.querySelector('[class*="titleText"]');
    if (title) {
      const p = el(document, "p");
      p.append(el(document, "strong", clean3(title.textContent)));
      nodes.push(p);
    }
    const desc = section.querySelector('[class*="description"]');
    if (desc) nodes.push(el(document, "p", clean3(desc.textContent)));
    return [...nodes, ...ctas(document, section)];
  }
  function transform4(hookName, element, payload) {
    var _a;
    if (((_a = payload.template) == null ? void 0 : _a.name) !== "homepage") return;
    const { document } = payload;
    if (hookName === "beforeTransform") {
      element.querySelectorAll('header, footer, script, style, noscript, iframe, link, aside, [role="dialog"]').forEach((n) => n.remove());
      element.querySelectorAll('a[href="#main"]').forEach((n) => n.remove());
      const main = element.querySelector("main");
      if (main) {
        [...main.children].forEach((child) => {
          if (!clean3(child.textContent) && !child.querySelector("img")) child.remove();
        });
      }
      Object.entries(DEFAULT_CONTENT_SECTIONS).forEach(([name, selector]) => {
        var _a2;
        (_a2 = element.querySelector(selector)) == null ? void 0 : _a2.setAttribute(TAG, name);
      });
      const resources = element.querySelector(`[${TAG}="resources"]`);
      resources == null ? void 0 : resources.querySelectorAll('[role="tablist"], [role="tabpanel"]').forEach((n) => n.remove());
    }
    if (hookName === "afterTransform") {
      element.querySelectorAll(`[${TAG}]`).forEach((section) => {
        const name = section.getAttribute(TAG);
        let nodes;
        if (name === "callout") {
          nodes = callout(document, section);
        } else if (name === "resources") {
          const panels = [...section.querySelectorAll("[data-import-tabpanels] > *")];
          nodes = [...introNodes(document, section), ...panels];
        } else {
          nodes = [...introNodes(document, section), ...ctas(document, section)];
        }
        section.replaceChildren(...nodes);
        section.removeAttribute(TAG);
      });
    }
  }

  // tools/importer/transformers/hashicorp-metadata.js
  var PAGE_TEMPLATES = { "blog-article": "blog-article", "blog-listing": "blog-listing", "webinar-detail": "webinar" };
  function transform5(hookName, element, payload) {
    var _a;
    if (hookName !== "afterTransform") return;
    const { document } = payload;
    const meta = (name) => {
      var _a2, _b;
      return ((_b = (_a2 = document.querySelector(`meta[property="${name}"], meta[name="${name}"]`)) == null ? void 0 : _a2.content) == null ? void 0 : _b.trim()) || "";
    };
    const cells = {};
    const title = meta("og:title") || document.title;
    if (title) cells.Title = title;
    const description = meta("description").replace(/\s*\n\s*/g, " ");
    if (description) cells.Description = description;
    const pageTemplate = PAGE_TEMPLATES[(_a = payload.template) == null ? void 0 : _a.name];
    if (pageTemplate) cells.template = pageTemplate;
    const og = meta("og:image");
    if (og) {
      const img = document.createElement("img");
      img.src = og.replace(/([?&])auto=format(&|$)/, "$1fm=png$2");
      img.alt = "";
      cells.image = img;
    }
    element.append(WebImporter.Blocks.createBlock(document, { name: "Metadata", cells }));
  }

  // tools/importer/transformers/hashicorp-sections.js
  var MARKER = "data-import-section";
  function transform6(hookName, element, payload) {
    const { document, template } = payload;
    const sections = (template == null ? void 0 : template.sections) || [];
    if (hookName === "beforeTransform") {
      const targets = sections.map((section) => {
        const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
        return selectors.map((s) => element.querySelector(s)).find(Boolean) || null;
      });
      targets.forEach((target, i) => {
        if (!target) return;
        const marker = document.createElement("div");
        marker.setAttribute(MARKER, sections[i].id);
        marker.hidden = true;
        target.before(marker);
        if (i > 0) marker.before(document.createElement("hr"));
      });
    }
    if (hookName === "afterTransform") {
      const markers = [...element.querySelectorAll(`[${MARKER}]`)];
      markers.forEach((marker, i) => {
        var _a;
        const section = sections.find((s) => s.id === marker.getAttribute(MARKER));
        if (section == null ? void 0 : section.style) {
          const metadata = WebImporter.Blocks.createBlock(document, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          const next = markers[i + 1];
          const boundary = ((_a = next == null ? void 0 : next.previousElementSibling) == null ? void 0 : _a.tagName) === "HR" ? next.previousElementSibling : next;
          if (boundary) boundary.before(metadata);
          else marker.parentElement.append(metadata);
        }
      });
      markers.forEach((marker) => marker.remove());
    }
  }

  // tools/importer/transformers/webinar-cleanup.js
  var TEMPLATE = "webinar-detail";
  var CHECKPOINT_TITLE = "Vercel Security Checkpoint";
  var CHROME = [
    'a[href="#main"]',
    "[class*='alert-banner_root']",
    "header",
    "footer",
    "#mktoForm_2459",
    "[class*='prefooterNewsletterForm']",
    "[class*='dg-consent']",
    "[id*='onetrust']",
    "[class*='cookieManager']",
    "#q-messenger-frame",
    "q-focus-sentinel",
    "next-route-announcer",
    "#mktoStyleLoaded",
    "script",
    "style",
    "noscript",
    "link",
    "meta"
  ];
  var TRACKING_IFRAME = /adsrvr\.org|doubleclick\.net|company-target\.com|go\.hashicorp\.com\/index\.php\/form\/XDFrame|qualified\.com/i;
  function clean4(text) {
    return (text || "").replace(/[​-‏⁠﻿]/g, "").replace(/\s+/g, " ").trim();
  }
  function retag(document, node, tag) {
    if (!node || node.tagName.toLowerCase() === tag) return;
    const heading = document.createElement(tag);
    if (node.className) heading.className = node.className;
    heading.append(...node.childNodes);
    node.replaceWith(heading);
  }
  function setMeta(document, attr, name, value) {
    var _a;
    if (!value) return;
    let meta = (_a = document.head) == null ? void 0 : _a.querySelector(`meta[${attr}="${name}"]`);
    if (!meta) {
      if (!document.head) return;
      meta = document.createElement("meta");
      meta.setAttribute(attr, name);
      document.head.append(meta);
    }
    meta.setAttribute("content", value);
  }
  function tagVideoUrl(document) {
    const payloadText = [...document.querySelectorAll("script")].map((s) => s.textContent || "").join("\n");
    const match = payloadText.match(/\\?"videoUrl\\?"\s*:\s*\\?"(https?:[^"\\]+)/);
    if (!match) return;
    document.querySelectorAll("[class*='style_inlineVideo'], [class*='style_webinarForm'], [class*='registration-form_container']").forEach((el2) => el2.setAttribute("data-video-url", match[1]));
  }
  function resolveLazyImages(document) {
    document.querySelectorAll('img[src^="data:image"]').forEach((img) => {
      var _a, _b;
      const noscript = ((_a = img.nextElementSibling) == null ? void 0 : _a.tagName) === "NOSCRIPT" ? img.nextElementSibling : (_b = img.parentElement) == null ? void 0 : _b.querySelector("noscript");
      const raw = noscript ? noscript.textContent || noscript.innerHTML || "" : "";
      const m = raw.match(/(?:srcset|srcSet|src)="([^"\s]+)/);
      if (!m) return;
      let url = m[1].replace(/&amp;/g, "&");
      const wrapped = url.match(/\/_next\/image\?url=([^&]+)/);
      if (wrapped) url = decodeURIComponent(wrapped[1]);
      else if (url.startsWith("/")) url = `https://www.hashicorp.com${url}`;
      img.setAttribute("src", url);
      noscript.remove();
    });
    document.querySelectorAll('img[src*="/_next/image?url="]').forEach((img) => {
      const wrapped = (img.getAttribute("src") || "").match(/\/_next\/image\?url=([^&]+)/);
      if (wrapped) img.setAttribute("src", decodeURIComponent(wrapped[1]));
      img.removeAttribute("srcset");
    });
    document.querySelectorAll('img[aria-hidden="true"][src^="data:image/svg"]').forEach((n) => n.remove());
  }
  function transform7(hookName, element, payload) {
    var _a, _b, _c, _d;
    if (((_a = payload.template) == null ? void 0 : _a.name) !== TEMPLATE) return;
    const { document } = payload;
    if (hookName === "preprocess") {
      tagVideoUrl(document);
      resolveLazyImages(document);
      return;
    }
    if (hookName === "beforeTransform") {
      const title = clean4(document.title || ((_b = document.querySelector("title")) == null ? void 0 : _b.textContent));
      const h1 = clean4((_c = document.querySelector("h1")) == null ? void 0 : _c.textContent);
      if (title === CHECKPOINT_TITLE || h1 === CHECKPOINT_TITLE) {
        const error = new Error(`Checkpoint page instead of webinar content ("${CHECKPOINT_TITLE}"); not importing`);
        error.name = "CheckpointPageError";
        throw error;
      }
      const titleNode = element.querySelector("[class*='event-title_eventTitle'] h3, [class*='event-title_eventTitle'] [class*='event-title_title']");
      const pageTitle = clean4(titleNode == null ? void 0 : titleNode.textContent);
      const intro = clean4((_d = element.querySelector("[class*='style_description__'] p, [class*='live_description'] p")) == null ? void 0 : _d.textContent);
      setMeta(document, "property", "og:title", pageTitle);
      setMeta(document, "name", "description", intro);
      element.querySelectorAll(CHROME.join(", ")).forEach((n) => n.remove());
      element.querySelectorAll("iframe").forEach((n) => {
        const src = n.getAttribute("src") || "";
        if (TRACKING_IFRAME.test(src) || !n.closest("main")) n.remove();
      });
      element.querySelectorAll("form.mktoForm").forEach((form) => {
        if (!form.closest("main")) form.remove();
      });
      const main = element.querySelector("main");
      const sectionSelectors = (payload.template.sections || []).flatMap((s) => [].concat(s.selector));
      if (main && sectionSelectors.some((s) => main.querySelector(s))) {
        [...element.children].forEach((child) => {
          if (child !== main) child.remove();
        });
      }
      retag(document, element.querySelector("[class*='event-title_eventTitle'] h3"), "h1");
      element.querySelectorAll("[class*='style_presentersHeading']").forEach((h) => retag(document, h, "h2"));
      element.querySelectorAll("[class*='registration-form_container']").forEach((panel) => {
        if (panel.querySelector("form.mktoForm")) return;
        panel.querySelectorAll("h4").forEach((h) => retag(document, h, "h2"));
      });
    }
    if (hookName === "afterTransform") {
      element.querySelectorAll("script, style, noscript, link, iframe:not(main iframe)").forEach((n) => n.remove());
      element.querySelectorAll("[class*='style_root__'][class*='style_left__']").forEach((n) => {
        if (!n.textContent.trim() && !n.querySelector("img, iframe, picture")) n.remove();
      });
    }
  }

  // tools/importer/import-webinar-detail.js
  var PAGE_TEMPLATE = {
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
  var parsers = {
    "marketo-form": parse3,
    "cards-speaker": parse,
    embed: parse2
  };
  var sectionTransformers = [transform6];
  var fragmentTransformers = [];
  var lateTransformers = [...sectionTransformers, ...fragmentTransformers];
  var correctionTransformers = [];
  var transformers = [
    transform7,
    transform3,
    transform,
    transform4,
    transform2,
    ...lateTransformers,
    transform5,
    ...correctionTransformers
  ];
  var earlyTransformers = transformers.filter((fn) => !lateTransformers.includes(fn));
  var CATALOG = Boolean(PAGE_TEMPLATE.pageCleanup || PAGE_TEMPLATE.blocks.some((b) => b.pageInstances));
  function executeTransformers(hookName, element, payload, list = transformers) {
    var _a, _b;
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: ((_b = (_a = payload.params) == null ? void 0 : _a.targets) == null ? void 0 : _b.template) || PAGE_TEMPLATE });
    list.forEach((fn) => {
      try {
        fn(hookName, element, enhancedPayload);
      } catch (e) {
        if (e && e.name === "CheckpointPageError") throw e;
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  var DAM_ROOT = "/content/dam/hashicorp-xwalk-poc";
  function mapAssets(main, pagePath) {
    const assets = {};
    const bySource = {};
    main.querySelectorAll("img").forEach((img) => {
      const src = img.getAttribute("src") || "";
      if (!/^https?:\/\//.test(src)) return;
      if (bySource[src]) {
        img.setAttribute("src", bySource[src]);
        return;
      }
      const url = new URL(src);
      const file = decodeURIComponent(url.pathname.split("/").pop() || "image");
      const pathExt = (file.match(/\.([a-z0-9]+)$/i) || [])[1] || "png";
      const ext = (url.searchParams.get("fm") || pathExt).toLowerCase().replace("jpeg", "jpg");
      const base = file.replace(/\.[a-z0-9]+$/i, "").replace(/^\d+-/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "image";
      let damPath = `${DAM_ROOT}${pagePath}/${base}.${ext}`;
      for (let i = 2; assets[damPath]; i += 1) damPath = `${DAM_ROOT}${pagePath}/${base}-${i}.${ext}`;
      assets[damPath] = src;
      bySource[src] = damPath;
      img.setAttribute("src", damPath);
    });
    return assets;
  }
  function findBlocksOnPage(document, template, url) {
    const pageBlocks = [];
    const pageKey = (u) => {
      try {
        const { origin, pathname } = new URL(u);
        return `${origin}${pathname.replace(/\/$/, "")}`;
      } catch (e) {
        return u;
      }
    };
    const key = pageKey(url);
    const claim = (blockDef, selector) => {
      let matches = [];
      try {
        matches = document.querySelectorAll(selector);
      } catch (e) {
        return;
      }
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
  function markPageTargets(payload) {
    const { document, params } = payload;
    executeTransformers("beforeTransform", document.body, payload, earlyTransformers);
    const blocks = findBlocksOnPage(document, PAGE_TEMPLATE, params.originalURL).map(({ name, selector, element }, i) => {
      element.setAttribute("data-excat-block", String(i));
      return { name, selector };
    });
    const sections = (PAGE_TEMPLATE.sections || []).map((section, i) => {
      const target = (section.selector || []).map((s) => {
        try {
          return document.querySelector(s);
        } catch (e) {
          return null;
        }
      }).find(Boolean);
      if (!target) return section;
      target.setAttribute("data-excat-section", String(i));
      return __spreadProps(__spreadValues({}, section), { selector: [`[data-excat-section="${i}"]`] });
    });
    params.targets = { blocks, template: __spreadProps(__spreadValues({}, PAGE_TEMPLATE), { sections }) };
  }
  var import_webinar_detail_default = {
    preprocess: (payload) => {
      executeTransformers("preprocess", payload.document.body, payload, earlyTransformers);
      if (CATALOG) markPageTargets(payload);
    },
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      params.fragments = [];
      if (!params.targets) markPageTargets(payload);
      const pageBlocks = params.targets.blocks.map((block, i) => __spreadProps(__spreadValues({}, block), { element: document.querySelector(`[data-excat-block="${i}"]`) })).filter((block) => block.element);
      executeTransformers("beforeTransform", main, __spreadProps(__spreadValues({}, payload), { pageBlocks }), lateTransformers);
      pageBlocks.forEach((block) => {
        if (!main.contains(block.element)) return;
        const parser = parsers[block.name];
        if (!parser) return;
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      });
      executeTransformers("afterTransform", main, payload);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      params.fragments.forEach(({ element }) => {
        executeTransformers("afterTransform", element, payload, earlyTransformers);
        WebImporter.rules.transformBackgroundImages(element, document);
        WebImporter.rules.adjustImageUrls(element, url, params.originalURL);
      });
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "").replace(/^\/en(?=\/)/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      const assets = mapAssets(main, path);
      return [{
        element: main,
        path,
        report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name), assets }
      }, ...params.fragments];
    }
  };
  return __toCommonJS(import_webinar_detail_exports);
})();
