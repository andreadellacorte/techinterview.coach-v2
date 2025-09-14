# V1 → V2 Migration Implementation Plan

## Overview
Migrate TechInterview.Coach from Jekyll (v1) to Next.js 15 + Tailwind v4 + shadcn/ui (v2) while maintaining data continuity and optimizing for conversions.

## Current Status ✅
- **V2 Foundation**: Next.js 15 + Tailwind v4 + shadcn/ui deployed to `https://techinterviewcoach-v2.netlify.app`
- **V1 Analysis**: Jekyll site with rich data structure (`_data/coaches.yml`, pricing, specialties, blog posts)
- **Deployment**: Netlify working with @netlify/plugin-nextjs

## Phase 1: Data Integration & Core Pages (Week 1-2)

### 1.1 Data Bridge Implementation
**Goal**: Read Jekyll data from Next.js at build time

```bash
# Install dependencies
npm install js-yaml gray-matter @types/js-yaml
```

**Data Loaders to Build**:
- `lib/data/loadCoaches.ts` - Parse `../techinterview.coach/_data/coaches.yml`
- `lib/data/loadPricing.ts` - Parse pricing tiers and packages
- `lib/data/loadSpecialties.ts` - Roles, specialties, companies data
- `lib/data/loadPosts.ts` - Blog posts from `../techinterview.coach/_posts/**/*.md`
- `lib/types.ts` - TypeScript interfaces for all data structures

### 1.2 Core Route Implementation
**Pages to Build**:
```
/coaching          - Coach grid with filters (SSG)
/coaching/[slug]   - Individual coach profiles (SSG)
/resume            - LinkedIn makeover landing page
/blog              - Blog index (SSG)
/blog/[slug]       - Individual blog posts (SSG)
```

**Components needed**:
- CoachCard component with shadcn/ui styling
- FilterBar for coaching page
- PricingCard with Cal.com integration
- BlogPostCard and PostContent

## Phase 2: Conversion Optimization (Week 3-4)

### 2.1 Homepage Redesign
Based on competitive analysis insights:

**Hero Section**:
- Single benefit-driven headline: "Land your dream tech role with expert coaching"
- One primary CTA: "Book free consultation"
- Remove typing animations and carousels
- Static high-quality visual
- Trust bar with company logos below fold

**Structure**:
```
1. Hero (above fold): headline + CTA + trust indicators
2. Social proof band: testimonials with measurable outcomes
3. Services overview: 3-card layout with secondary CTAs
4. Coach highlight: 2-3 featured coaches
5. FAQ section: address common objections
6. Final CTA: repeat booking CTA
```

### 2.2 Pricing Page Optimization
- 3-tier layout with recommended tier highlighted
- Risk-reversal copy ("Money-back guarantee")
- Embedded Cal.com booking component
- FAQ section addressing pricing objections

### 2.3 Cal.com Integration
```typescript
// components/BookingEmbed.tsx
// Embedded scheduler with event tracking
// Track: booking_started, booking_completed events
```

## Phase 3: A/B Testing & Cutover (Week 5-6)

### 3.1 Subdomain Deployment
- Deploy v2 to `app.techinterview.coach`
- Set up cross-domain analytics tracking
- Implement feature flags for gradual rollout

### 3.2 A/B Test Framework
**Priority Tests**:
1. Hero headline (outcome-focused vs process-focused)
2. Primary CTA text ("Book free consultation" vs "Get your plan")
3. Testimonial placement (above fold vs below)
4. Pricing layout (3-tier vs 2-tier)

**Analytics Setup**:
- Plausible or PostHog for privacy-friendly tracking
- Custom events: `cta_click`, `booking_started`, `booking_completed`
- Conversion funnel analysis

### 3.3 Gradual Migration
1. **Traffic split**: 10% → 25% → 50% → 100% to v2
2. **Page-by-page migration**: Start with /coaching, then homepage
3. **301 redirects**: Winning v2 pages redirect from v1
4. **SEO preservation**: Maintain URL structure where possible

## Technical Architecture

### Data Flow
```
Jekyll (_data/*.yml, _posts/*.md)
  ↓ (build time)
Next.js data loaders
  ↓ (SSG)
Static pages with embedded data
```

### File Structure
```
apps/web/
├── app/
│   ├── coaching/
│   │   ├── page.tsx          # Coach grid
│   │   └── [slug]/page.tsx   # Coach profiles
│   ├── resume/page.tsx       # LinkedIn makeover
│   ├── blog/
│   │   ├── page.tsx          # Blog index
│   │   └── [slug]/page.tsx   # Blog posts
│   └── page.tsx              # Homepage
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── CoachCard.tsx
│   ├── BookingEmbed.tsx
│   └── FilterBar.tsx
├── lib/
│   ├── data/                 # Data loaders
│   └── types.ts              # TypeScript definitions
└── public/
    └── images/               # Optimized assets
```

### Performance Targets
- Lighthouse Performance: >90
- First Contentful Paint: <1.5s
- Largest Contentful Paint: <2.5s
- Bundle size: <150KB initial JS

## Success Metrics

### Primary KPIs
- **Consultation bookings per visitor**: 2-3x improvement target
- **Lead capture conversion**: 3-5x improvement target
- **Page load performance**: Meet Core Web Vitals

### Funnel Metrics to Track
- Landing page CTA click rate
- Booking flow completion rate
- Coach profile engagement
- Pricing page conversion

## Risk Mitigation

### Technical Risks
- **Cross-repo file access**: Test data loaders early, fallback to copied data if needed
- **Build performance**: Implement incremental builds for large datasets
- **SEO impact**: Maintain URL structure, implement proper redirects

### Business Risks
- **Content divergence**: Keep Jekyll as single source of truth during transition
- **Traffic loss**: Gradual rollout with easy rollback capability
- **Conversion drop**: A/B test everything, optimize based on data

## Implementation Timeline

### Week 1: Foundation
- ✅ Next.js + Tailwind v4 setup complete
- ✅ Netlify deployment working
- 🔄 Implement data loaders
- 🔄 Build coaching page with coach grid

### Week 2: Core Pages
- Build individual coach profile pages
- Implement blog index and post pages
- Add resume/LinkedIn makeover landing page
- Set up basic analytics tracking

### Week 3: Conversion Optimization
- Redesign homepage with single CTA focus
- Implement pricing page with embedded booking
- Add testimonial components and trust indicators
- Set up A/B testing framework

### Week 4: Polish & Testing
- Performance optimization and Core Web Vitals
- Accessibility audit and fixes
- Cross-browser testing
- SEO metadata and OpenGraph

### Week 5-6: Launch & Optimize
- Subdomain deployment and gradual traffic shift
- Monitor metrics and conversion rates
- Iterate based on user behavior data
- Plan full migration timeline

## Next Actions
1. **Implement data loaders** - Start with coaches.yml parsing
2. **Build /coaching page** - Coach grid with shadcn/ui components
3. **Set up analytics** - Event tracking for conversion funnels
4. **Homepage redesign** - Single CTA, conversion-focused layout

This plan balances technical execution with business impact, ensuring smooth migration while optimizing for growth.