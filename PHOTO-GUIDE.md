# Photo Guide: Rodeo 419 Marketing

This first pass uses **real screenshots** for client work and **tonal placeholders** for every Rodeo 419 photo. Each placeholder is drawn at the photo's final aspect ratio and shows where the land or arena, the light, and the darker text area will sit, so the final photography can be shot or generated to fit the finished layout.

Every slot is defined once in [`content/images.json`](content/images.json). To see the crop guides on the live preview, tap **Photo guides** in the dark preview bar at the top of any page. It outlines the text-safe area and marks the desktop focal point (and the phone focal point on a phone).

## How to replace a placeholder

1. Export the photo as **JPG** (quality 75–82) at the size in the table. Aim for under 400 KB for the desktop file and under 250 KB for the phone file.
2. Save it at the exact path shown, inside `assets/images/`. For slots with a phone crop, save the phone version too. If you only have one file, set `"mobile"` to the same file in `images.json` or delete the `"mobile"` entry.
3. *Optional, for faster phones:* add smaller copies next to the original named `-800.jpg` and `-1200.jpg` (for example `hero/home-hero-desktop-1200.jpg`). The build adds them to `srcset` automatically.
4. Rebuild (`node scripts/build.mjs`), or just commit and push. The placeholder, its label and its guides disappear; layout, crop and motion stay exactly the same.
5. If the subject sits somewhere else in the frame, adjust `"focal"` (CSS `object-position`, for example `"60% 45%"`) in `images.json`.
6. For a non-decorative slot, update `"alt"` so it describes the actual photo.
7. After the hero changes, run `node tools/make-og.mjs` to rebuild the social-sharing image from the new photo.

**Rules:** Use photos you own or have licensed. Never present a stock or AI-generated person as the owner or as a client. If an image is AI-generated, keep it to scenery, don't present it as a specific real venue, and keep a note of how it was made.

## Slots at a glance

| Slot | Page | Files (in `assets/images/`) | Desktop | Phone | Focal (desktop / phone) | Treatment |
|---|---|---|---|---|---|---|
| `hero` | Home | `hero/home-hero-desktop.jpg`, `hero/home-hero-mobile.jpg` | 2400 × 1350 (16:9), shown in a frame about 1224 × 570 | 1080 × 1440 (3:4) | 64% 58% / 62% 55% | Decorative (`alt=""`); the headline carries the meaning |
| `about-headshot` | About | `about/headshot.jpg` | 1200 × 1500 (4:5) | same file | 50% 32% | Informative: alt text required |
| `about-land` | About (between "What you can expect" and "The meaning of the name") | `about/fence-line-desktop.jpg`, `about/fence-line-mobile.jpg` | 2400 × 1000 (12:5) | 1080 × 1080 (1:1) | 50% 60% / 40% 60% | Decorative |
| `services-working` | Services (Custom web design) | `services/working-session.jpg` | 1800 × 1200 (3:2) | same file | 50% 50% | Informative: alt text required |
| `cta-lights` | Home, Work, Services, Process, About, case studies (contact band) | `cta/arena-lights-desktop.jpg`, `cta/arena-lights-mobile.jpg` | 2400 × 900 (8:3) | 1080 × 1350 (4:5) | 50% 40% / 50% 35% | Decorative, under a dark overlay |

---

## `hero`: Home hero, arena or open land at golden hour

- **Where it appears:** the large framed image at the top of the homepage. The image is cropped to the frame (about 2.15:1 on a laptop, 3:4 on a phone) and covered by a dark gradient from the bottom-left.
- **Proposed subject:** a wide, empty Fort Worth–area rodeo arena or working pen at golden hour: raked dirt in the foreground, a pipe or wood rail fence crossing the lower third, a low grandstand or tree line on the horizon, and two or three light towers just starting to glow. An open North Texas pasture with a fence line at sunset works as the alternative.
- **Light:** low sun behind and slightly right of center, at about **64% across and 52% down**, glowing through dust or haze. The brightest point must stay right of center.
- **Room for text:** the headline sits on the **lower-left 60% of the frame**, about the bottom 55%. Keep that area darker and simple: dirt, rail shadows, ground. No bright highlights, signs, or busy detail there.
- **Horizon:** about **58% down** the frame.
- **Desktop crop:** the 16:9 file is cropped to a shorter, wider frame, losing about 10% at the top and bottom. Keep important detail out of the top and bottom 10%.
- **Phone crop:** a separate 3:4 file. Keep the sun and one light tower in the upper-middle (focal 62% 55%); the headline covers the bottom half.
- **Motion:** a slow 14-second push-in (108% to 100%) when the page loads, plus up to 48px of vertical drift inside the frame while scrolling. Leave about 50px of expendable image at the top and bottom edges. The motion is turned off for visitors who prefer reduced motion.
- **Alt text:** decorative (`alt=""`). The H1 says what the page is about.
- **Avoid:** people, animals in close-up, readable signs, logos, sponsor banners, or anything that identifies a specific venue unless you have the rights to show it.

**Image-generation prompt (desktop 16:9):**

> Wide documentary photograph of an empty small-town rodeo arena outside Fort Worth, Texas, at golden hour. Raked tan dirt in the foreground, a weathered steel pipe rail fence running horizontally across the lower third, a low wooden grandstand and a line of live oaks on the horizon about 58% down the frame. Low sun just above the horizon, right of center (about 64% across), glowing through light dust haze; three tall arena light towers silhouetted, two of them faintly lit. The lower-left of the frame is in soft shadow with simple dirt texture and no detail, leaving clean space for a large headline. Warm palette of saddle brown, amber, and deep umber, with a little rust in the dust. Natural film grain, 35mm lens, eye-level, no people, no animals, no text, no logos, no signage. 16:9.

**Phone variant (3:4):** use the same prompt, replacing the last line with: "Vertical 3:4 composition: sun and one light tower in the upper middle, fence and shadowed dirt filling the lower half."

**Alternative (open land):**

> Wide photograph of open North Texas ranch land at golden hour near Fort Worth: tall native grass, a barbed-wire fence with cedar posts receding from the lower left toward the horizon, a single live oak on the right, the horizon about 58% down the frame. Low sun right of center behind light haze. The lower-left foreground is in soft shadow with simple grass texture for a headline overlay. Warm amber, saddle brown, and umber tones, natural film grain, no people, no buildings, no text. 16:9.

---

## `about-headshot`: Owner headshot

- **Where it appears:** beside the About page headline. On a phone it sits below the introduction, up to 420px wide.
- **Proposed subject:** you, from the chest up, in natural light, looking at the camera or just off it. Dressed the way you'd meet a client. A warm, simple background: a brick wall, weathered wood, or soft outdoor shade around Fort Worth.
- **Size and crop:** 1200 × 1500 (4:5). Eyes about one-third down (focal 50% 32%). Leave a little space above the head.
- **Room for text:** none over the photo.
- **Alt text:** "Portrait of [your name], owner of Rodeo 419 Marketing" (update once your name is confirmed for the site).
- **Must be a real photograph of you.** Don't use a generated portrait.

**Photographer brief:** warm late-afternoon light from one side, 85mm-equivalent lens, background 2–3 m behind you, shot at eye level. Shoot extra width so the image can be recropped.

---

## `about-land`: About band, open land and fence line

- **Where it appears:** a full-width band between "What you can expect from me" and "The meaning of the name" on About.
- **Proposed subject:** a quiet North Texas fence line or pasture, morning or golden hour. It signals place and steadiness without being literal.
- **Desktop crop:** 2400 × 1000 (12:5), horizon about 60% down, center of interest at 50% 60%.
- **Phone crop:** 1080 × 1080 (1:1), focal 40% 60%: keep the nearest fence post left of center.
- **Room for text:** none. The band is purely visual.
- **Alt text:** decorative.

**Image-generation prompt (12:5):**

> Panoramic photograph of a cedar-post barbed-wire fence line crossing open North Texas pasture in soft morning light, posts receding from the left foreground toward a low horizon about 60% down the frame, a single distant live oak on the right, pale gold sky with light haze. Calm, spacious, documentary feel, muted amber and dry-grass tones, fine film grain, no people, no buildings, no text. Ultra-wide 12:5.

---

## `services-working`: A working session with a business owner

- **Where it appears:** inside the Custom web design section on Services.
- **Proposed subject:** a real working session. You and a client at their shop counter, desk, or truck tailgate, reviewing a website draft on a laptop or phone. Hands, the screen, and the setting matter more than faces.
- **Size and crop:** 1800 × 1200 (3:2), subject centered (50% 50%).
- **Room for text:** none.
- **Alt text:** describe the real scene, for example "Reviewing a website draft on a laptop with the owner of a Fort Worth bakery at her counter."
- **Must be a real session** with the client's written permission. Don't use stock people or generated images of clients.

---

## `cta-lights`: Contact band, arena lights at dusk

- **Where it appears:** behind "Tell me about your business" at the bottom of most pages, under a dark overlay (about 70–90% black from the left).
- **Proposed subject:** arena or ballfield light towers glowing against a deep dusk sky, with a hint of dust in the beams.
- **Desktop crop:** 2400 × 900 (8:3). Keep the lights in the **right half**; the left 55% is under text and heavy shade.
- **Phone crop:** 1080 × 1350 (4:5), lights in the upper third (focal 50% 35%).
- **Alt text:** decorative.

**Image-generation prompt (8:3):**

> Wide low-angle photograph of rodeo arena light towers glowing against a deep blue-brown dusk sky in rural Texas, warm golden lamps with soft halos and faint dust in the beams, the towers placed in the right half of the frame, the left half dark, simple sky. Moody, quiet, cinematic, natural film grain, no people, no text, no logos. 8:3.

---

## Portfolio screenshots

Screenshots are real captures of each client's live preview, stored in `assets/images/work/<project>/` and listed in [`content/work.json`](content/work.json). To refresh them after a client site changes:

```bash
node tools/capture-screenshots.mjs
```

That captures desktop shots at 1440 × 900 and phone shots at 390 × 844 (2× pixel density), then writes full-size and half-size WebP files. Pass a project slug to refresh one project, for example `node tools/capture-screenshots.mjs call-revere`. It needs Playwright with Chromium and Python with Pillow, and network access to `petermiller-dev.github.io`.

**Status, 18 Nov 2026:** all 17 screenshots captured successfully. None are missing. If a capture ever fails, the page shows a labeled "Screenshot pending" box in the same spot.

## Social sharing image

`assets/images/og/og-default.png` (1200 × 630) is generated by `node tools/make-og.mjs` from the wordmark, the headline, and the hero image (currently the placeholder). Re-run it once the hero photo is in place.

## Second pass: final photography map

| Order | Slot | Source | Notes |
|---|---|---|---|
| 1 | `about-headshot` | Real photo session | Needed before the site goes public |
| 2 | `hero` | Licensed or generated scenery, or your own photo | Biggest visual impact; generate desktop and phone crops separately |
| 3 | `cta-lights` | Licensed or generated scenery | Can share a session with the hero |
| 4 | `about-land` | Your own photo or generated scenery | Optional; the page works without it if removed |
| 5 | `services-working` | Real session with a client's permission | Can wait until after launch; remove the line from `services.md` if not ready |
