# Frontend Modernization Plan (v2)

## Rebuild with Next.js + Tailwind v4 + shadcn/ui (sky)

This plan supersedes the earlier “Jekyll + Tailwind only” approach. We will rebuild the UI from the ground up using a clean, modern component system with Tailwind v4 and shadcn/ui, styled with a sky-based brand palette, and deploy on Netlify. Jekyll can remain for marketing content during transition, but the target state is a unified Next.js frontend.

### Why Next.js + shadcn/ui now

- **Design velocity**: Pre-built, accessible primitives with shadcn/ui allow rapid iteration and consistent polish
- **Modern theming**: Tailwind v4 design tokens + CSS vars (sky as primary) for cohesive branding
- **DX & performance**: App Router, RSC, image optimization, and granular routing
- **Netlify support**: First-class Next.js runtime, simple monorepo sub-site deployment

### Deployment on Netlify

- Host the Next.js app from `apps/web` with `@netlify/plugin-nextjs` and Node 20
- Keep the current Jekyll site deployment unchanged during migration
- Use subdomains (e.g., `app.`) or path-based routing if desired

### Brand system (Sky palette)

- Primary: Tailwind Sky (e.g., `sky-600` for default, `sky-400` dark mode)
- Rings/Focus: `sky-300` (light), `sky-600` (dark)
- Accent surfaces: `sky-50` (light), `sky-900/950` (dark)
- Maintain warm accent option for highlights if needed (gold/amber)

### Informed by Website comparison analysis

Incorporate insights from the competitive analysis (see `docs/Website comparison analysis.pdf`) across:

- Above-the-fold clarity: single, outcome-driven headline and primary CTA
- Trust density: testimonials, coach credibility, logos, guarantees near CTAs
- Frictionless booking: prominent, repeated “Book free consultation” CTA and embedded scheduler
- Scannable layout: stronger hierarchy, whitespace, and responsive typographic scale
- Speed/UX: image optimization, fewer blocking scripts, accessible focus states

---

## Phased rebuild plan

### Phase 1: Foundation and IA

1. Scaffold `apps/web` (Next.js + Tailwind v4 + shadcn/ui)
2. Establish design tokens (sky primary) and base components (button, input, card, label)
3. Information architecture: home, services, pricing, coaches, testimonials, blog, contact/consultation

### Phase 2: Core pages and navigation

1. Rebuild header/footer, responsive nav, and layout primitives
2. Implement high-conversion homepage hero (analysis-aligned) with social proof
3. Build pricing + services pages with clear CTA placements and FAQs

### Phase 3: Coaches and proof

1. Coach listing and profile templates with trust signals and CTAs
2. Testimonials and case studies with structured content blocks
3. Media assets optimization (Next/Image) and lazy-loading

### Phase 4: Forms, booking, and integrations

1. Embed Cal.com for consultation booking; ensure event tracking on successful bookings
2. Lead capture (newsletter/lead magnet) with low-friction forms
3. Analytics: Netlify Analytics plus privacy-friendly product analytics (e.g., Plausible or PostHog)

### Phase 5: Polish and A/B testing

1. Micro-interactions (subtle hover/press states, reduced motion preferences)
2. Accessibility audit and fixes (color contrast, focus order, ARIA)
3. A/B test key levers (hero copy, CTA text, testimonial density, pricing layout)

---

## Migration strategy

- Short term: Keep Jekyll as-is and route new experiences to Next (`app.` subdomain)
- Medium term: Migrate high-impact marketing pages to Next.js templates
- Long term: Consolidate into a single Next.js site if desired

---

## Link: Growth & Conversion Plan

See `docs/growth-conversion-plan.md` for channel strategy, funnel metrics, event tracking, and experiment backlog.

---

## Alternative legacy path (optional): Jekyll + Tailwind only

The original plan to keep Jekyll and layer Tailwind remains viable if React complexity must be avoided. Retained below for reference.

### Why Stick with Jekyll ✅ (legacy option)

- **Netlify first-class support** - zero config deployments
- **Static performance** - no server overhead, blazing fast
- **SEO built-in** - search engines love static HTML
- **Content workflow** - markdown → website (so simple!)
- **No build complexity** - git push and done

### Modern CSS Strategy: Tailwind CSS + Jekyll (legacy option)

**Recommendation: Jekyll + Tailwind CSS**

- Keep your static site simplicity
- Get modern utility-first styling power
- Achieve Fruitful.com aesthetic precision
- No JavaScript framework complexity

## Phase 1: Foundation (Week 1-2)

**Goal: Transform the look without breaking anything**

### 1.1 Tailwind Integration

```bash
# Add to Gemfile
gem "jekyll-tailwindcss"

# Install and configure
bundle install
npx tailwindcss init
```

### 1.2 Color Palette Overhaul

**Current:** Bright blues (`#007bff`, `#0064a4`)
**New (Fruitful-inspired):**

```css
/* tailwind.config.js */
colors: {
  primary: {
    50: '#f0fdf9',   // Soft mint
    100: '#ccfbf1',  // Light teal
    500: '#14b8a6',  // Main teal
    600: '#0d9488',  // Darker teal
    700: '#0f766e',  // Deep teal
  },
  neutral: {
    50: '#fafaf9',   // Warm white
    100: '#f5f5f4',  // Light gray
    600: '#525252',  // Medium gray
    800: '#262626',  // Dark text
  },
  accent: {
    400: '#fbbf24',  // Warm gold
    500: '#f59e0b',  // Gold
  }
}
```

### 1.3 Typography Hierarchy

**Replace:** Generic Roboto/Montserrat
**With:** Modern font stack + strategic sizing

```css
/* Custom fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

/* Typography scale */
.text-hero: 3.5rem    /* Hero headlines */
.text-h1: 2.5rem      /* Page titles */
.text-h2: 2rem        /* Section headers */
.text-body: 1.125rem  /* Body text */
.text-small: 0.875rem /* Captions */
```

### 1.4 Spacing System (8-point grid)

**Current:** Inconsistent margins/padding
**New:** Systematic spacing

```css
/* Tailwind utilities */
p-2   = 8px
p-4   = 16px
p-6   = 24px
p-8   = 32px
p-12  = 48px
p-16  = 64px
p-20  = 80px
```

## Phase 2: Component Polish (Week 3-4)

**Goal: Make everything feel premium**

### 2.1 Button Redesign

**Current:** Basic Bootstrap buttons
**New:** Soft, modern buttons with hover states

```css
/* Tailwind classes for buttons */
.btn-primary: "bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200";
```

### 2.2 Card Components

**Current:** Basic borders
**New:** Subtle shadows, rounded corners

```css
/* Coach cards, testimonials, etc */
.card: "bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300";
```

### 2.3 Hero Section Overhaul

**Current:** Basic gradient background
**New:** Sophisticated layout with better visual hierarchy

- Generous whitespace
- Better text sizing
- Subtle background elements

## Phase 3: Interactions & Polish (Week 5-6)

**Goal: Micro-interactions that delight**

### 3.1 Smooth Animations

Replace jQuery animations with CSS:

```css
/* Smooth everything */
* {
  transition: all 0.2s ease-in-out;
}

/* Hover effects */
.hover-lift:hover {
  transform: translateY(-2px);
}
```

### 3.2 Loading States & Progressive Enhancement

- Skeleton loaders for dynamic content
- Smooth scroll behavior
- Focus states for accessibility

## Implementation Strategy

### Week 1: Setup & Colors

1. Install Tailwind in Jekyll
2. Replace Bootstrap gradually (page by page)
3. Implement new color palette
4. Update typography

### Week 2: Components

1. Redesign buttons, forms, cards
2. Update header/navigation
3. Modernize hero sections

### Week 3: Layout & Spacing

1. Implement 8-point spacing system
2. Add generous whitespace
3. Improve responsive behavior

### Week 4: Polish & Testing

1. Add micro-interactions
2. Test across devices
3. Performance optimization
4. Accessibility audit

## File Structure

```
css/
├── tailwind.css (new)
├── style.css (gradually replace)
├── components/
│   ├── buttons.css
│   ├── cards.css
│   └── forms.css
└── legacy/ (keep old CSS during transition)
```

## Success Metrics

- [ ] Looks as polished as Fruitful.com
- [ ] Maintains Jekyll simplicity
- [ ] No performance regression
- [ ] Mobile-responsive excellence
- [ ] Passes accessibility audit

## Rollback Plan

- Keep all original CSS files
- Feature flags for gradual rollout
- Easy revert to Bootstrap if needed

---

**Bottom Line:** Keep your Jekyll workflow that works perfectly. Just make it look incredible with modern CSS. No React complexity needed!
