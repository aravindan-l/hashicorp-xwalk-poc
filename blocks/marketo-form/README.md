# marketo-form

Panel that embeds a live **Marketo Forms 2.0** form from HashiCorp's Marketo instance
(`go.hashicorp.com`, Munchkin ID `845-ZLF-191`), or shows a short message when there is no form.
Used on webinar pages (e.g. "Watch the recorded webinar", registration, "Recording coming soon!").

## Universal Editor fields

| Field | Use |
|---|---|
| Title | Panel heading, e.g. "Watch the recorded webinar" |
| Marketo form ID | Numeric form ID, e.g. `2334`. Leave empty to show only the title and message. |
| Recording link | Optional. Gated recording: revealed in the panel after a successful submit (never shown before). |
| Message | Optional rich text, e.g. the "Recording coming soon" notice. |

## Behaviour

- The forms2 script loads only after the page has loaded and the panel is near the viewport.
- **Submissions are real:** they create or update leads in HashiCorp's Marketo.
- Hidden fields filled by the block: `form_page_url__c` (page URL) and `utm_*__c` (from `utm_*` URL
  parameters). Other hidden fields (`registeredWebinarID`, `utm_channel_bucket__c`, `is_spam__c`)
  are left to Marketo's defaults.
- With a recording link, a successful submit shows "Watch the recording" instead of following
  Marketo's follow-up URL; without one, Marketo's follow-up behaviour applies.
- Marketo's own form theme is removed; the block CSS styles the fields like hashicorp.com.
