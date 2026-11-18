# Review Checklist: Rodeo 419 Preview

Every open decision for the site, in one place. Items marked **◇** also appear as highlighted "pending" notes on the preview itself. Those notes and the preview bar disappear when `previewMode` is turned off in `content/site.json`.

## Before anyone outside sees it

- [ ] **Client permission to feature their previews.** Confirm Dr. Rainey, Call Revere, Verita Heritage, and Obst Farm are each comfortable being shown as work samples while their sites are still previews. The Call Revere preview banner includes the owner's first name ("James").
- [ ] **Status labels.** Confirm each label: Dr. Rainey "Preview", Call Revere "Redesign preview", Verita Heritage "Design preview", Obst Farm "Preview". Change a label in `content/work.json` when a site launches.
- [ ] **Charted Course.** Currently hidden (`"published": false` in `content/work.json`); see the note at the end of this file. Set it to `true` to add it to the Work page, and I'll write a case study if you want one.

## Identity and copy

- [ ] **◇ Your name.** The site is written in the first person but never names the owner. Decide whether to name yourself on About, and in the headshot alt text and structured data.
- [ ] **◇ About background.** A few sentences in your own words: your background, how long you've been in the Fort Worth area, what led you to this work (About → "How I work with local businesses").
- [ ] **◇ Faith wording.** Confirm the "Foundation of the business" section says it the way you want.
- [ ] **◇ Philippians 4:19.** Choose a translation (for example RSV-2CE, NABRE, or Douay-Rheims) and send the exact text. It goes on About under "The meaning of the name". Home cites the verse without quoting it; About also says the verse "is a reminder that the work is provided for". Confirm that reading.
- [ ] **Wordmark.** The preview uses a typographic wordmark: RODEO in a condensed display face, 419 in a double-ruled "stamped" box, and MARKETING between fine rules. Options: keep it, try a version with 419 in rust on dark, or commission a drawn mark. The favicon is a simple 419 badge.
- [ ] **Promises on the Contact page.** Confirm "I'll reply personally, usually within one business day", "first conversation by phone or in person around Fort Worth", and "Call or text" (do you accept texts?).
- [ ] **Service area wording.** The site says "Fort Worth and nearby communities". Name specific cities if you want them listed.
- [ ] **Capabilities.** Confirm you offer everything described, especially photography coordination, ongoing article writing, and hosting/domain oversight.

## Contact details (needed before launch)

- [ ] **◇ Email.** Send a verified address. Then fill `contact.email` and set `verified.email` to `true` in `content/site.json`. The Contact page gets a mailto link with a prefilled subject and prompts, and the address is added to structured data.
- [ ] **◇ Phone.** Send a verified number. Fill `phoneDisplay` and `phoneE164` (`+1817…`) and set `verified.phone` to `true`. That adds tap-to-call and structured data.
- [ ] Decide whether you want a contact form later. Right now there is none, by design: no data is collected. A form would need a form service and an update to the Privacy page.

## Imagery (see PHOTO-GUIDE.md)

- [ ] **Hero image.** Approve the arena-at-golden-hour direction (or open land), then shoot, license, or generate it using the prompts in the guide.
- [ ] **◇ Headshot.** Book a real photo of you; 1200 × 1500, 4:5.
- [ ] **Contact band** (arena lights at dusk) and the **About band** (fence line).
- [ ] **Working-session photo** for Services. It needs a real client's permission; remove the slot if it isn't ready.
- [ ] Regenerate the social image after the hero is in place (`node tools/make-og.mjs`).

## Pricing and packages (not on the site until you approve)

◇ The Services page says care plan pricing is pending. Package ideas to react to (prices left for you to set):

| Idea | What it includes | Your price |
|---|---|---|
| **Google Business Profile tune-up** | Profile review, categories and services, service areas, photo plan, review routine, one follow-up check | $ ____ one-time |
| **Starter site** | Messaging session, up to 5 pages, mobile-first custom design, photo plan, SEO basics, launch | $ ____ |
| **Local search site** | Everything in Starter, plus service pages and service-area pages, internal linking plan, 2 starter articles, profile tune-up | $ ____ |
| **Care plan** | Hosting and domain oversight, monthly text and photo updates, quarterly check-in, profile kept in step with the site | $ ____ / month |
| **Content add-on** | One or two articles a month written with your input | $ ____ / month |

Decide: show prices, show "starting at" prices, or keep pricing for the first conversation.

## Proof (add later, only with permission)

- [ ] **Testimonials.** None are on the site. Add only real quotes with the client's written OK and their preferred name and business.
- [ ] **Results.** No traffic, ranking, or lead numbers are claimed. Add specific results only with real data and the client's permission.
- [ ] **Before images.** None of the projects had a usable "before" capture in the repositories, so none are shown. If you have screenshots of an old site, they can go in its case study.
- [ ] Update case studies when a preview launches (status label, "Where it stands" section, live URL).

## Domain, hosting and launch

- [ ] **Domain.** Choose and register it (for example rodeo419.com or rodeo419marketing.com). The site works on a custom domain without code changes.
- [ ] **Production indexing.** Needs your explicit approval. Steps are in README → Publishing.
- [ ] **Hosting.** Stay on GitHub Pages or move elsewhere, then update the Privacy page to match.
- [ ] Set up Google Business Profile and Search Console for Rodeo 419 itself after launch.

---

### What Charted Course is

`charted-course-preview` is a small preview site for **Charted Course Health Insurance**, run by **Matthew Daugherty**. He reviews the coverage of people who buy their own health insurance (self-employed people, business owners, and families) and tells them whether to keep their plan or consider alternatives ("If your current plan is the best fit, Matthew will tell you to keep it"). The site has three pages: Home, Health Insurance Plan Review, and About Matthew. Its callback form is deliberately disabled until a form service is chosen, it's marked noindex, and the hero is a client-supplied coastal photo whose license is still unconfirmed. It's a clean, focused single-offer site in a regulated industry. I left it unpublished on the Rodeo 419 site until you decide; screenshots are already captured.
