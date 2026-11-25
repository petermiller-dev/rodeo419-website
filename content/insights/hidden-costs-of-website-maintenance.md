---
title: The Hidden Costs of Website Maintenance | Rodeo 419 Insights
description: Software updates, plugins, security certificates, domain renewals, and your own time. Where a website's ongoing costs come from, and how to plan for them.
h1: The hidden costs of website maintenance
dek: A website's price doesn't end at launch. Updates, renewals, and security fixes arrive later, in small pieces, and often as someone's time. Here's where the ongoing costs come from, so they don't catch you off guard.
topic: Maintenance
number: 2
published: 2026-11-25
cover: rings
coverTone: ink
takeaways:
  - Every piece of software on a website needs updates, and someone has to apply them and check the site afterward.
  - In WordPress, most newly reported security problems are in plugins, not WordPress itself.
  - Domains and security certificates expire. Certificate lifetimes are getting shorter through 2029, so renewal needs to be automatic.
  - The simplest site to maintain is the one with only the parts your business actually uses.
related:
  - who-owns-your-website
  - why-website-speed-matters
work:
  - obst-farm#built | There's no online ordering or payment system, which keeps the family farm's site simple to run and honest about how the farm actually sells.
  - dr-rainey#built | The site is built without a page builder or plugins, so there's no add-on software to keep updated.
---

Quotes for building a website are easy to compare. The costs that come after launch are harder to see. They show up months later, a few at a time, and many of them are paid in hours rather than invoices.

Every website needs some care. How much depends on how it's built and what it does. These are the ongoing costs that tend to surprise owners.

## Software updates {#updates}

If your site runs software on its server, such as a content management system with a theme and add-ons, that software needs updating. WordPress, which runs a large share of small business sites, is direct about it in its own documentation: "You should always update WordPress to the latest version." Its security guide explains why: WordPress "is updated regularly to address new security issues that may arise."

Small security updates now install automatically on most WordPress sites. Larger updates take more care. WordPress recommends backing up first and checking that your plugins and themes are compatible, and notes that "there isn't a single update order that works for every website." Afterward, someone should visit the site to make sure everything still works.

None of that is difficult. It is recurring, though, and it's either your time or time you pay for.

## Plugins and add-ons {#plugins}

Plugins add features: contact forms, sliders, booking calendars, search tools. Each one is a separate piece of software from a separate developer, with its own update schedule.

That's where most of the risk sits. Patchstack, a security company that tracks WordPress vulnerabilities, recorded 11,334 new vulnerabilities across the WordPress ecosystem in 2025. By its count, 91% were in plugins and 9% in themes, and only six were in WordPress core, all low priority. It also found that 46% of vulnerabilities "did not receive a fix from the developer in time for public disclosure."

Those figures count reported weaknesses, not hacked websites, and a well-run site with a few carefully chosen plugins can be perfectly safe. The point for your budget is simpler: every add-on is one more thing to update and one more developer you're relying on.

**What helps:** ask what each plugin on your site does, and remove the ones you don't use.

## Security certificates {#certificates}

The padlock in the browser bar comes from a security certificate, and certificates expire. Let's Encrypt, a nonprofit that issues them free of charge, makes its default certificates valid for 90 days and recommends renewing them every 60.

Certificate lifetimes across the industry are getting shorter. In 2025, the CA/Browser Forum, the group of certificate authorities and browser makers that sets the rules, approved a schedule reducing the maximum validity "from 398 days to 47 days," in stages "starting in March 2026 and concluding in March 2029." Renewing a certificate by hand once a year is ending. Renewal needs to happen automatically.

**What to check:** ask your host whether certificate renewal is automatic. If it is, this cost is close to zero. If it isn't, a missed renewal means visitors see a security warning instead of your business.

## Domain renewals {#domains}

Your domain is rented by the year. ICANN's rules require registrars to send at least two renewal reminders before it expires, one about a month ahead and one about a week ahead, plus another within five days after. Once it expires, the registrar must interrupt the domain while it can still be renewed, which means your website and any email on that domain stop working. After a registration is deleted, most registries offer a 30-day "Redemption Grace Period" when it can still be restored, and registrars must publish what restoring costs.

**The hidden cost:** those reminders go to the email address on the account. If that's a former employee's inbox or your old web designer's, nobody sees them. The [ownership guide](/insights/who-owns-your-website/#domain) covers how to check.

## Your time {#time}

The largest ongoing cost is usually the owner's attention: logging in to approve updates, answering a host's emails, and changing hours, prices, services, and photos as the business changes. A site that's hard to edit tends to go out of date, and an out-of-date site costs you in ways that never show up on an invoice.

## How the way a site is built changes the bill {#build-choices}

Fewer moving parts means less maintenance. A site built from pre-made pages, with no server software or database behind it, has no plugins to patch and no content system to upgrade. It still needs its domain, hosting, and certificate renewed, and its content kept current. Nothing is maintenance-free.

Features cost something to keep too. Online booking, payments, and member accounts each add a service that needs care. When your business needs them, they're worth it. When it doesn't, leaving them out saves money every year.

## Questions to ask before you sign {#questions}

- What software runs the site, and who keeps it updated?
- How many plugins or add-ons does it use, and what does each one do?
- Are security certificates renewed automatically?
- Whose email address receives domain and hosting renewal notices?
- What does ongoing care include, and what's billed separately?
- How do I make small changes, like hours or prices, myself?

If you'd rather not handle this yourself, that's what a [care plan](/services/#care) is for. Whoever you hire, ask for the list of what's included in writing.

## Sources {#sources}

1. WordPress.org, [Updating WordPress](https://wordpress.org/documentation/article/updating-wordpress/).
2. WordPress Developer Resources, [Hardening WordPress](https://developer.wordpress.org/advanced-administration/security/hardening/).
3. Patchstack, [State of WordPress Security in 2026](https://patchstack.com/whitepaper/state-of-wordpress-security-in-2026/), covering 2025 data, updated February 25, 2026.
4. CA/Browser Forum, [Ballot SC081v3: Introduce Schedule of Reducing Validity and Data Reuse Periods](https://cabforum.org/2025/04/11/ballot-sc081v3-introduce-schedule-of-reducing-validity-and-data-reuse-periods/), April 2025.
5. Let's Encrypt, [Frequently Asked Questions](https://letsencrypt.org/docs/faq/).
6. ICANN, [Expired Registration Recovery Policy](https://www.icann.org/resources/pages/errp-2013-02-28-en).

Sources were checked in November 2026.
