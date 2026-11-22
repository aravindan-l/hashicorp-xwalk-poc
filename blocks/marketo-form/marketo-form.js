/**
 * Marketo form (placeholder).
 *
 * Authored rows: 1) title, 2) Marketo form ID, 3) optional recording link.
 * No Marketo script is loaded yet. The block renders the title and a
 * non-submitting placeholder panel, and exposes the form ID and recording
 * URL as data attributes (data-form-id, data-recording-url; the gated recording is
 * never shown as a link) so a real
 * Marketo forms2 embed can be wired in later.
 */

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

export default function decorate(block) {
  const [titleRow, formIdRow, recordingRow] = [...block.children];

  const titleCell = cellOf(titleRow);
  const titleText = textOf(titleRow);
  const formId = textOf(formIdRow).replace(/[^0-9A-Za-z_-]/g, '');
  const recordingUrl = urlOf(recordingRow);

  if (formId) block.dataset.formId = formId;
  if (recordingUrl) block.dataset.recordingUrl = recordingUrl;

  const wrapper = document.createElement('div');
  wrapper.className = 'marketo-form-panel';

  if (titleText) {
    const existingHeading = titleCell && titleCell.querySelector('h1, h2, h3, h4, h5, h6');
    const heading = existingHeading || document.createElement('h2');
    if (!existingHeading) heading.textContent = titleText;
    heading.classList.add('marketo-form-title');
    wrapper.append(heading);
  }

  // Container a future forms2 embed renders into (MktoForms2.loadForm(..., formId)).
  const placeholder = document.createElement('div');
  placeholder.className = 'marketo-form-placeholder';
  placeholder.setAttribute('role', 'note');
  if (formId) placeholder.dataset.formId = formId;

  const message = document.createElement('p');
  message.className = 'marketo-form-placeholder-message';
  message.textContent = formId
    ? `Marketo form ${formId} will be embedded here.`
    : 'Marketo form placeholder (no form ID set).';
  placeholder.append(message);

  // The recording is gated behind the form on the source site, so its URL is kept as data only
  // (data-recording-url) for the future onSuccess reveal; it is never rendered as a link.

  wrapper.append(placeholder);
  block.replaceChildren(wrapper);
}
