import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const SOCIAL = [
  { match: /(^|\.)linkedin\.com$/i, icon: 'linkedin', label: 'LinkedIn' },
  { match: /(^|\.)github\.com$/i, icon: 'github', label: 'GitHub' },
  { match: /(^|\.)(twitter|x)\.com$/i, icon: 'x', label: 'X' },
];

function socialFor(href) {
  try {
    const { hostname } = new URL(href, window.location.href);
    return SOCIAL.find((s) => s.match.test(hostname));
  } catch (e) {
    return undefined;
  }
}

function decorateSocialLinks(body, name) {
  const socialLinks = [...body.querySelectorAll('a[href]')].filter((a) => socialFor(a.href));
  if (!socialLinks.length) return;

  const list = document.createElement('ul');
  list.className = 'cards-speaker-social';
  const emptied = new Set();
  socialLinks.forEach((a) => {
    const { icon, label } = socialFor(a.href);
    const parent = a.closest('p, li') || a.parentElement;
    const li = document.createElement('li');
    a.textContent = '';
    a.setAttribute('aria-label', name ? `${name} on ${label}` : label);
    a.classList.remove('button');
    const span = document.createElement('span');
    span.className = `icon icon-${icon}`;
    const img = document.createElement('img');
    img.src = `${window.hlx?.codeBasePath || ''}/icons/${icon}.svg`;
    img.alt = '';
    img.loading = 'lazy';
    img.width = 20;
    img.height = 20;
    span.append(img);
    a.append(span);
    li.append(a);
    list.append(li);
    if (parent && parent !== body) emptied.add(parent);
  });
  // drop the paragraphs/list items that held the links once they are empty
  const isEmpty = (el) => !el.textContent.trim() && !el.querySelector('a, img, picture');
  emptied.forEach((el) => {
    if (!isEmpty(el)) return;
    const parentList = el.tagName === 'LI' ? el.parentElement : null;
    el.remove();
    if (parentList && parentList !== body && !parentList.children.length) parentList.remove();
  });
  body.append(list);
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-speaker-image';
      else div.className = 'cards-speaker-body';
    });
    const body = li.querySelector('.cards-speaker-body');
    if (body) {
      const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
      if (heading) heading.classList.add('cards-speaker-name');
      decorateSocialLinks(body, heading ? heading.textContent.trim() : '');
    }
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '400' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.replaceChildren(ul);
}
