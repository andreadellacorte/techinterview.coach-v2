# Growth & Conversion Plan

## Primary objective

Resolve issues from the comparative analysis (hero clarity, single CTA, trust density, reduced cognitive load, performance, and mobile UX) to increase conversions.

## Goals (12-week horizon)

- **Primary**: 2–3x lift in free consultation bookings per session
- **Secondary**: 3–5x lift in qualified leads (email capture)
- **Guardrails**: >90 Lighthouse Performance, >95 Accessibility, <2.5s LCP, <150KB JS on the homepage

## North-star and key metrics

- **North-star**: Consultation bookings per visitor (bookings / sessions)
- **Funnel metrics**:
  - Landing CTR to primary CTA ("Book free consultation")
  - Lead capture conversion (newsletter/lead magnet)
  - Pricing page CTA CTR and completion
  - Coach profile CTA CTR and completion
  - Drop-off by step (open → click → complete)

## Event tracking taxonomy (client-side)

Implement lightweight analytics (Plausible or PostHog). Example event names:

- `cta_click` { page, location, label }
- `booking_started` { source, variant }
- `booking_completed` { source, duration }
- `lead_capture_submit` { source }
- `faq_toggle` { page, question_id }
- `hero_tab_switch` { page, tab_id }
- `trust_bar_view` { page }
- `testimonial_view` { page, id }
- `hero_visual_load` { ok }
- `coaches_filter_use` { control_id }

Wire events in Next.js components with a tiny wrapper (no PII). Track variant IDs for A/B tests.

## Channel strategy

- **SEO**: Outcome-focused landing pages (services, roles, industries). Use schema.org (`FAQPage`, `LocalBusiness` where relevant), fast pages, and internal link hubs.
- **Content**: Weekly posts and case studies highlighting transformations; embed short video testimonials.
- **Social**: LinkedIn carousels + YouTube shorts repurposing coach insights; add UTM tagging, link to app.
- **Partnerships**: Cal.com marketplace presence, relevant communities, alumni groups.
- **Email**: Lead magnet sequence (3 emails over 7 days) ending in consult CTA.

## Website experience improvements (Next.js + Tailwind v4 + shadcn/ui, sky)

- **Header/nav**: One primary CTA ("Book free consultation"), persistent on scroll.
- **Hero (above the fold)**: Benefit-led headline, concise subhead, 1 primary CTA. Optional secondary text link ("See testimonials") only. Replace typing/carousel with a static high-quality visual. Keep bundle light.
- **Trust density near the fold**: Dedicated trust bar (recognizable logos) and testimonial snippet; include ratings/stars if available.
- **Pricing**: 3-tier layout with risk-reversal copy and FAQs. Repeat primary CTA.
- **Coaches**: Grid → profile with outcomes-first story and sticky CTA. Move heavy filters off homepage.
- **Testimonials**: Structured cards with role/company, measurable outcome, and optional video.
- **Booking**: Embedded Cal.com on-page + modal; repeat CTA after key sections; track start/success.
- **Performance**: Replace heavy animations with CSS transitions; optimize images; minimize JS; use Next/Image; defer non-critical scripts.
- **Accessibility**: High-contrast sky focus rings, logical heading order, keyboard nav, reduced motion support.

## Issue → Action mapping (from comparative analysis)

- **Too many/competing CTAs** → Single primary CTA everywhere; remove tertiary CTAs on homepage.
- **Hero clarity and load** → Static visual, benefit-led copy; remove typing/scrolling lists; ship <60KB JS for hero.
- **Trust scattered** → Trust bar below hero; testimonials band higher on page; add ratings/badges where applicable.
- **Cognitive load (filters, long lists)** → Remove filters from homepage; relocate to coaches page with simpler UI.
- **Mobile complexity** → Mobile-first hero with single-line promise and CTA; swipe-friendly components only.
- **Slow interactions** → Audit with Web Vitals; lazy-load below-the-fold; code-split by route; reduce 3rd-party.
- **Booking friction** → Prominent, repeated CTA; embedded scheduler; confirmation event tracking.

## A/B testing roadmap (prioritized)

1. Hero headline framing (outcomes vs. process)
2. Primary CTA text ("Book free consultation" vs. "Get your plan")
3. Pricing highlights (money-back guarantee vs. bonus session)
4. Trust proximity (testimonials high vs. lower on page)
5. Coach profile layout (bio-first vs. outcome-first)

Run 1–2 tests per cycle; minimum sample sizes based on baseline CTR. Pause losing variants early.

## Experiment backlog (examples)

- Social proof placement: near hero vs. after benefits
- FAQ placement: pricing vs. footer page
- Sticky mobile CTA vs. standard fixed button
- Short vs. long lead capture form
- Video testimonial vs. quote-only cards

## Implementation milestones

- Week 1–2: New hero (benefit-led, 1 CTA), header/footer, trust bar, sky tokens, event wrapper
- Week 3–4: Pricing + coaches + testimonials pages, embedded booking, first A/B test
- Week 5–6: Lead magnet flow, email sequence, second A/B test, SEO templates

## Tech & tracking checklist

- Next.js app (`apps/web`) with Tailwind v4 and shadcn/ui (base color: sky)
- Netlify deploy with `@netlify/plugin-nextjs` and Node 20
- Cal.com embed + event hooks on success
- Analytics provider (Plausible/PostHog) with custom events above
- Sitemap + metadata, OpenGraph images per page

## Reporting cadence

- Weekly snapshot: sessions, CTRs, bookings, test statuses
- Monthly deep-dive: SEO growth, content performance, conversion cohorts
