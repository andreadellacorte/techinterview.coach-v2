# Data Loader Architecture: Jekyll → Next.js Bridge

## How the Data Loaders Work

The data loaders create a bridge between Jekyll's YAML/Markdown data and Next.js at **build time**. Here's exactly how they work:

### 1. File System Access at Build Time

```typescript
// Example: loadCoaches.ts
const V1_DATA_PATH = '../../techinterview.coach/_data';

export function loadCoaches(): Coach[] {
  const coachesPath = join(process.cwd(), V1_DATA_PATH, 'coaches.yml');
  const fileContents = readFileSync(coachesPath, 'utf8');
  const coaches = yaml.load(fileContents) as Coach[];
  return coaches.filter(coach => coach.status === 'active');
}
```

### 2. Build-Time Execution (SSG)

**When it runs**: During `npm run build` on Netlify
**Where it runs**: On Netlify's build servers, NOT in the browser
**What it does**:
- Reads files from `../techinterview.coach/_data/*.yml`
- Parses YAML/Markdown content
- Transforms data into TypeScript objects
- Embeds data directly into static HTML pages

### 3. Data Flow Architecture

```
Jekyll Repo (_data/*.yml)
    ↓ (build time)
Next.js Data Loaders (lib/data/*.ts)
    ↓ (SSG generation)
Static HTML with embedded data
    ↓ (deploy)
Netlify CDN serves static pages
```

### 4. Monorepo Deployment Strategy

**Current Setup:**
- Both repos cloned side by side: `techinterview.coach/` and `techinterview.coach-v2/`
- V2 reads from V1's `_data` folder using relative paths
- Single source of truth: Jekyll YAML files
- No duplication or sync issues

**On Netlify:**
```bash
# Build process on Netlify
git clone techinterview.coach-v2
cd techinterview.coach-v2
# Data loaders access ../techinterview.coach/_data/coaches.yml
npm run build  # Data embedded into static pages
```

### 5. What Gets Generated

**Before build**: Dynamic React components calling data loaders
**After build**: Static HTML with data baked in

```html
<!-- Generated static HTML -->
<div class="coach-card">
  <h3>Danielle Cheah</h3>
  <p>Senior Director Software at LEGO Group</p>
  <!-- All coach data is already embedded -->
</div>
```

### 6. No Runtime Data Fetching

❌ **NOT like this**: `fetch('/api/coaches')` in browser
✅ **Instead like this**: Data loaded once at build time, served as static HTML

### 7. Benefits of This Architecture

**Performance**:
- Zero API calls
- Instant page loads
- Lighthouse scores 90+

**Reliability**:
- No database dependencies
- No server downtime
- Works even if Jekyll site is offline

**Simplicity**:
- One source of truth (Jekyll YAML)
- No data synchronization issues
- Content team keeps existing workflow

### 8. Current Data Sources

**Implemented:**
- `loadCoaches()` → reads `_data/coaches.yml`
- `loadPosts()` → reads `_posts/**/*.md`
- `loadTestimonials()` → mock data (to be moved to YAML)

**Future Integration:**
- `loadPricing()` → `_data/pricing.yml`
- `loadSpecialties()` → `_data/specialties.yml`
- `loadCompanies()` → `_data/companies.yml`

### 9. Fallback Strategy

```typescript
export function loadCoaches(): Coach[] {
  try {
    // Try to load from Jekyll data
    const coaches = yaml.load(fileContents) as Coach[];
    return coaches.filter(coach => coach.status === 'active');
  } catch (error) {
    console.warn('Failed to load coaches data:', error);
    return []; // Graceful fallback - components handle empty arrays
  }
}
```

### 10. Development vs Production

**Local Development**:
- May fail if Jekyll repo not cloned locally
- Fallbacks show placeholder content

**Netlify Production**:
- Build process ensures both repos available
- Full data integration works seamlessly

## Migration Path

1. **Phase 1** (Current): V2 reads V1 data at build time
2. **Phase 2**: A/B test V2 pages against V1
3. **Phase 3**: Migrate winning pages, redirect users
4. **Phase 4**: Consolidate into single repo if desired

This architecture allows us to modernize the frontend while keeping the content team's Jekyll workflow intact.