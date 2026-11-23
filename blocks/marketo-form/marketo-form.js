/**
 * Marketo form: embeds a live Marketo Forms 2.0 form (HashiCorp's instance) in a panel.
 *
 * Authored rows: 1) title, 2) Marketo form ID, 3) optional recording link, 4) optional message
 * (panel text; with no form ID, e.g. "Recording coming soon", only title + message are shown).
 *
 * The forms2 script loads only once the page has loaded and the panel is near the viewport, so it
 * never delays LCP. Submissions go straight to Marketo (lead creation, routing and spam checks
 * stay on Marketo's side). When a recording link is set, the form gates it: a successful submit
 * reveals the link in place instead of redirecting. Until then the URL is kept as data only.
 */

const MARKETO_BASE_URL = 'https://go.hashicorp.com';
const MUNCHKIN_ID = '845-ZLF-191';
const FORMS2_SRC = `${MARKETO_BASE_URL}/js/forms2/js/forms2.min.js`;

// URL parameter -> Marketo hidden field (the source fills these the same way).
const UTM_FIELDS = {
  utm_source: 'utm_source__c',
  utm_medium: 'utm_medium__c',
  utm_campaign: 'utm_campaign__c',
  utm_content: 'utm_content__c',
  utm_term: 'utm_term__c',
  utm_offer: 'utm_offer__c',
  utm_cid: 'utm_cid__c',
};

let forms2Promise;

function cellOf(row) {
  if (!row) return null;
  return row.querySelector(':scope > div') || row;
}

function textOf(row) {
  const cell = cellOf(row);
  return cell ? cell.textContent.trim() : '';
}

function urlOf(row) {
  const cell = cellOf(row);
  if (!cell) return '';
  const link = cell.querySelector('a[href]');
  if (link) return link.href;
  const text = cell.textContent.trim();
  return /^(https?:)?\/\/|^\//.test(text) ? text : '';
}

function loadForms2() {
  if (window.MktoForms2) return Promise.resolve(window.MktoForms2);
  if (!forms2Promise) {
    forms2Promise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = FORMS2_SRC;
      script.async = true;
      script.onload = () => (window.MktoForms2 ? resolve(window.MktoForms2) : reject(new Error('MktoForms2 missing')));
      script.onerror = () => reject(new Error(`Could not load ${FORMS2_SRC}`));
      document.head.append(script);
    });
  }
  return forms2Promise;
}

/** Runs fn after the page has loaded and the element is near the viewport. */
function whenNeeded(element, fn) {
  const afterLoad = () => {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        fn();
      }
    }, { rootMargin: '300px' });
    observer.observe(element);
  };
  if (document.readyState === 'complete') afterLoad();
  else window.addEventListener('load', afterLoad, { once: true });
}

/** Drops Marketo's inline widths and theme so the panel's own CSS lays the form out. */
function unstyle(formEl) {
  formEl.removeAttribute('style');
  formEl.querySelectorAll('[style]').forEach((el) => el.removeAttribute('style'));
  formEl.querySelectorAll('.mktoOffset, .mktoGutter, .mktoClear').forEach((el) => el.remove());
  ['mktoForms2BaseStyle', 'mktoForms2ThemeStyle'].forEach((id) => document.getElementById(id)?.remove());
}

function fillHiddenFields(form) {
  const known = new Set(Object.keys(form.getValues()));
  const values = {};
  const [pageUrl] = window.location.href.split('#');
  if (known.has('form_page_url__c')) values.form_page_url__c = pageUrl;
  const params = new URLSearchParams(window.location.search);
  Object.entries(UTM_FIELDS).forEach(([param, field]) => {
    if (params.has(param) && known.has(field)) values[field] = params.get(param);
  });
  if (Object.keys(values).length) form.vals(values);
}

function revealRecording(panel, recordingUrl) {
  const done = document.createElement('div');
  done.className = 'marketo-form-success';
  const p = document.createElement('p');
  p.textContent = 'Thank you! The recording is ready.';
  done.append(p);
  if (recordingUrl) {
    const link = document.createElement('a');
    link.href = recordingUrl;
    link.className = 'button';
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = 'Watch the recording';
    const lp = document.createElement('p');
    lp.className = 'button-container';
    lp.append(link);
    done.append(lp);
  }
  panel.replaceChildren(...[panel.querySelector('.marketo-form-title'), done].filter(Boolean));
}

function embedForm(block, panel, container, formId, recordingUrl) {
  loadForms2()
    .then((MktoForms2) => {
      const formEl = document.createElement('form');
      formEl.id = `mktoForm_${formId}`;
      container.replaceChildren(formEl);
      MktoForms2.loadForm(MARKETO_BASE_URL, MUNCHKIN_ID, Number(formId), (form) => {
        if (!form) return;
        const [renderedForm] = form.getFormElem();
        unstyle(renderedForm);
        fillHiddenFields(form);
        block.classList.add('marketo-form-loaded');
        form.onSuccess(() => {
          // Gated content: show the recording here; without one, follow Marketo's own follow-up.
          if (!recordingUrl) return true;
          revealRecording(panel, recordingUrl);
          return false;
        });
      });
    })
    .catch(() => {
      container.querySelector('.marketo-form-placeholder-message').textContent = 'The form could not be loaded. Please try again later.';
    });
}

export default function decorate(block) {
  const [titleRow, formIdRow, recordingRow, messageRow] = [...block.children];
  const messageCell = cellOf(messageRow);
  const hasMessage = Boolean(messageCell && messageCell.textContent.trim());

  const titleCell = cellOf(titleRow);
  const titleText = textOf(titleRow);
  const formId = textOf(formIdRow).replace(/[^0-9]/g, '');
  const recordingUrl = urlOf(recordingRow);

  if (formId) block.dataset.formId = formId;
  if (recordingUrl) block.dataset.recordingUrl = recordingUrl;

  const panel = document.createElement('div');
  panel.className = 'marketo-form-panel';

  if (titleText) {
    const existingHeading = titleCell && titleCell.querySelector('h1, h2, h3, h4, h5, h6');
    const heading = existingHeading || document.createElement('h2');
    if (!existingHeading) heading.textContent = titleText;
    heading.classList.add('marketo-form-title');
    panel.append(heading);
  }

  // Panel text (e.g. "Recording coming soon"): shown as is; with no form ID it replaces the form.
  if (hasMessage) {
    const text = document.createElement('div');
    text.className = 'marketo-form-message';
    text.append(...messageCell.childNodes);
    panel.append(text);
  }
  if (!formId) {
    if (hasMessage) block.classList.add('marketo-form-message-only');
    block.replaceChildren(panel);
    return;
  }

  // Shown until the Marketo form has rendered (and if it cannot load).
  const container = document.createElement('div');
  container.className = 'marketo-form-placeholder';
  const message = document.createElement('p');
  message.className = 'marketo-form-placeholder-message';
  message.textContent = 'Loading form…';
  container.append(message);
  panel.append(container);
  block.replaceChildren(panel);

  whenNeeded(block, () => embedForm(block, panel, container, formId, recordingUrl));
}
