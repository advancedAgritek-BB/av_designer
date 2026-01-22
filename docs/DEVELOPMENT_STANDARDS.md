# AV Designer - Development Standards

**Version:** 1.0
**Date:** 2026-01-18
**Status:** Active

This document consolidates development standards and best practices from verified skill sources. All developers must follow these guidelines.

---

## Table of Contents

1. [Frontend & UI Standards](#1-frontend--ui-standards)
2. [React & Next.js Best Practices](#2-react--nextjs-best-practices)
3. [React Native Performance](#3-react-native-performance)
4. [Database & PostgreSQL Standards](#4-database--postgresql-standards)
5. [Supabase Security](#5-supabase-security)
6. [Accessibility Standards](#6-accessibility-standards)
7. [Animation & Interaction Guidelines](#7-animation--interaction-guidelines)
8. [Code Quality Checklist](#8-code-quality-checklist)

---

## 1. Frontend & UI Standards

> Source: `frontend-design:frontend-design`, `ui-skills`, `web-design-guidelines`

### Design Thinking Process

Before coding any UI component:

1. **Purpose**: What problem does this interface solve? Who uses it?
2. **Tone**: Choose an extreme aesthetic direction - don't be generic
3. **Constraints**: Technical requirements (framework, performance, accessibility)
4. **Differentiation**: What makes this UNFORGETTABLE?

### Tech Stack Requirements

| Requirement | Tool | Notes |
|------------|------|-------|
| CSS Framework | Tailwind CSS | Use defaults unless custom values exist |
| Animation (JS) | `motion/react` | Formerly `framer-motion` |
| Micro-animations | `tw-animate-css` | For entrance and micro-animations |
| Class Logic | `cn` utility | `clsx` + `tailwind-merge` |
| Components | Base UI, React Aria, Radix | Accessible primitives |

### Component Rules

- **MUST** use accessible component primitives for keyboard/focus behavior
- **MUST** use the project's existing component primitives first
- **NEVER** mix primitive systems within the same interaction surface
- **MUST** add `aria-label` to icon-only buttons
- **NEVER** rebuild keyboard or focus behavior by hand

### Interaction Rules

- **MUST** use `AlertDialog` for destructive or irreversible actions
- **SHOULD** use structural skeletons for loading states
- **NEVER** use `h-screen`, use `h-dvh` instead
- **MUST** respect `safe-area-inset` for fixed elements
- **MUST** show errors next to where the action happens
- **NEVER** block paste in `input` or `textarea` elements

### Typography Rules

- **MUST** use `text-balance` for headings
- **MUST** use `text-pretty` for body/paragraphs
- **MUST** use `tabular-nums` for data
- **SHOULD** use `truncate` or `line-clamp` for dense UI
- **NEVER** modify `letter-spacing` unless explicitly requested

### Layout Rules

- **MUST** use a fixed `z-index` scale (no arbitrary `z-*`)
- **SHOULD** use `size-*` for square elements instead of `w-*` + `h-*`

### Design Anti-Patterns

**NEVER use these generic AI aesthetics:**
- Overused fonts: Inter, Roboto, Arial, system fonts
- Cliched colors: purple gradients on white backgrounds
- Predictable layouts and component patterns
- Cookie-cutter design that lacks context-specific character

**NEVER use without explicit request:**
- Gradients (especially purple or multicolor)
- Glow effects as primary affordances

---

## 2. React & Next.js Best Practices

> Source: `react-best-practices`

### Priority-Ordered Guidelines

| Priority | Category | Impact |
|----------|----------|--------|
| 1 | Eliminating Waterfalls | CRITICAL |
| 2 | Bundle Size Optimization | CRITICAL |
| 3 | Server-Side Performance | HIGH |
| 4 | Client-Side Data Fetching | MEDIUM-HIGH |
| 5 | Re-render Optimization | MEDIUM |
| 6 | Rendering Performance | MEDIUM |
| 7 | JavaScript Performance | LOW-MEDIUM |

### Critical: Eliminating Waterfalls

```typescript
// BAD: Sequential awaits
const user = await getUser(id);
const posts = await getPosts(id);
const comments = await getComments(id);

// GOOD: Parallel with Promise.all
const [user, posts, comments] = await Promise.all([
  getUser(id),
  getPosts(id),
  getComments(id),
]);
```

**Rules:**
- Move `await` into branches where actually used
- Use `Promise.all()` for independent operations
- Use Suspense boundaries to stream content
- Start promises early, await late in API routes

### Critical: Bundle Size Optimization

```typescript
// BAD: Barrel imports
import { Button, Card, Input } from '@/components';

// GOOD: Direct imports
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
```

**Rules:**
- Import directly, avoid barrel files
- Use `next/dynamic` for heavy components
- Load analytics/logging after hydration
- Preload on hover/focus for perceived speed

### High: Re-render Optimization

```typescript
// BAD: Subscribing to state only used in callbacks
const { count, increment } = useStore();
return <button onClick={() => increment()}>Click</button>;

// GOOD: Don't subscribe to unused state
const increment = useStore((state) => state.increment);
return <button onClick={() => increment()}>Click</button>;
```

**Rules:**
- Don't subscribe to state only used in callbacks
- Extract expensive work into memoized components
- Use primitive dependencies in effects
- Subscribe to derived booleans, not raw values
- Use functional `setState` for stable callbacks
- Pass function to `useState` for expensive initial values
- Use `startTransition` for non-urgent updates

### Medium: Rendering Performance

- Animate div wrapper, not SVG element directly
- Use `content-visibility` for long lists
- Extract static JSX outside components
- Use ternary, not `&&` for conditionals
- Reduce SVG coordinate precision

### JavaScript Performance Patterns

```typescript
// BAD: Multiple iterations
const filtered = items.filter((x) => x.active);
const mapped = filtered.map((x) => x.value);

// GOOD: Single iteration
const result = items.reduce((acc, x) => {
  if (x.active) acc.push(x.value);
  return acc;
}, []);
```

**Rules:**
- Build `Map` for repeated lookups
- Cache object properties in loops
- Cache function results in module-level Map
- Use `Set`/`Map` for O(1) lookups
- Check array length before expensive comparison
- Return early from functions
- Hoist RegExp creation outside loops

---

## 3. React Native Performance

> Source: `react-native-best-practices`

### Priority-Ordered Guidelines

| Priority | Category | Impact |
|----------|----------|--------|
| 1 | FPS & Re-renders | CRITICAL |
| 2 | Bundle Size | CRITICAL |
| 3 | TTI Optimization | HIGH |
| 4 | Native Performance | HIGH |
| 5 | Memory Management | MEDIUM-HIGH |
| 6 | Animations | MEDIUM |

### Critical: FPS & Re-renders

**Common fixes:**
- Replace `ScrollView` with `FlatList`/`FlashList` for lists
- Use React Compiler for automatic memoization
- Use atomic state (Jotai/Zustand) to reduce re-renders
- Use `useDeferredValue` for expensive computations

### Critical: Bundle Size

**Analyze bundle:**
```bash
npx react-native bundle \
  --entry-file index.js \
  --bundle-output output.js \
  --platform ios \
  --sourcemap-output output.js.map \
  --dev false --minify true

npx source-map-explorer output.js --no-border-checks
```

**Common fixes:**
- Avoid barrel imports (import directly from source)
- Remove unnecessary Intl polyfills (Hermes has native support)
- Enable tree shaking (Expo SDK 52+ or Re.Pack)
- Enable R8 for Android native code shrinking

### High: TTI Optimization

**Common fixes:**
- Disable JS bundle compression on Android (enables Hermes mmap)
- Use native navigation (`react-native-screens`)
- Defer non-critical work with `InteractionManager`

### Problem → Solution Mapping

| Problem | Solution |
|---------|----------|
| App feels slow/janky | Measure FPS → Profile React |
| Too many re-renders | Profile React → React Compiler |
| Slow startup (TTI) | Measure TTI → Analyze bundle |
| Large app size | Analyze app → R8 Android |
| Memory growing | Hunt JS or native memory leaks |
| Animation drops frames | Use Reanimated worklets |
| List scroll jank | Use FlatList/FlashList |
| TextInput lag | Use uncontrolled components |

---

## 4. Database & PostgreSQL Standards

> Source: `pg:design-postgres-tables`, `pg:setup-timescaledb-hypertables`

### Core Rules

- **PRIMARY KEY**: `BIGINT GENERATED ALWAYS AS IDENTITY` preferred; use `UUID` only when global uniqueness/opacity is needed
- **Normalize first** to 3NF; denormalize only for measured, high-ROI reads
- Add **NOT NULL** everywhere semantically required
- Create **indexes for access paths you actually query**
- Prefer **TIMESTAMPTZ** for event time
- Use **NUMERIC** for money (never float)
- Use **TEXT** for strings (not VARCHAR)
- Use **BIGINT** for integer values

### DO NOT Use These Data Types

| Don't Use | Use Instead |
|-----------|-------------|
| `timestamp` (without timezone) | `timestamptz` |
| `char(n)` or `varchar(n)` | `text` |
| `money` type | `numeric` |
| `timetz` type | `timestamptz` |
| `serial` type | `generated always as identity` |
| Built-in `POINT`, `LINE`, `POLYGON` | PostGIS `geometry` |

### PostgreSQL Gotchas

- **Identifiers**: unquoted → lowercased. Use `snake_case`
- **FK indexes**: PostgreSQL does **NOT** auto-index FK columns. Add them manually!
- **No silent coercions**: length/precision overflows error out (no truncation)
- **Sequences/identity have gaps**: Normal behavior, don't "fix"

### Index Guidelines

| Index Type | Use For |
|------------|---------|
| **B-tree** | Equality/range queries (`=`, `<`, `>`, `BETWEEN`, `ORDER BY`) |
| **GIN** | JSONB containment/existence, arrays, full-text search |
| **GiST** | Ranges, geometry, exclusion constraints |
| **BRIN** | Very large, naturally ordered data (time-series) |

### TimescaleDB Hypertables

For insert-heavy data patterns (time-series, event logs, transaction records):

```sql
CREATE TABLE your_table_name (
    timestamp TIMESTAMPTZ NOT NULL,
    entity_id TEXT NOT NULL,
    category TEXT,
    value_1 DOUBLE PRECISION,
    metadata JSONB
) WITH (
    tsdb.hypertable,
    tsdb.partition_column='timestamp',
    tsdb.enable_columnstore=true,
    tsdb.segmentby='entity_id',
    tsdb.orderby='timestamp DESC'
);
```

**Key Decisions:**
- **Partition Column**: Must be time-based or integer with temporal distribution
- **Segment_By**: Single column, frequently used in WHERE clauses, >100 rows per value per chunk
- **Order_By**: Usually `timestamp DESC`

---

## 5. Supabase Security

> Source: `supabase-security-audit`

### Core Principle

**Never let your frontend talk directly to your database. All data access goes through edge functions using service role.**

### Critical Security Rules

#### 1. RLS: Enable Without Policies

```sql
-- CORRECT: Enable RLS with NO policies (only service_role access)
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;
-- No CREATE POLICY statements

-- WRONG: RLS with policies (evaluated client-side!)
CREATE POLICY "Users can view own data" ON user_data
  FOR SELECT USING (auth.uid() = user_id);  -- INSECURE
```

#### 2. Lock Down PostgreSQL Functions

PostgreSQL functions are **PUBLIC executable by default**:

```sql
-- Lock down every sensitive function
REVOKE EXECUTE ON FUNCTION your_function_name FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION your_function_name FROM anon;
REVOKE EXECUTE ON FUNCTION your_function_name FROM authenticated;
GRANT EXECUTE ON FUNCTION your_function_name TO service_role;
```

#### 3. Edge Functions as Gateway

```typescript
// Edge function pattern
Deno.serve(async (req) => {
  // 1. Verify token FIRST
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response('Unauthorized', { status: 403 });
  }

  // 2. Create client with SERVICE ROLE (not anon)
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!  // SERVICE ROLE
  );

  // 3. Verify the user's token
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return new Response('Invalid token', { status: 403 });
  }

  // 4. Backend decides what data to return
  const { data } = await supabase
    .from('user_data')
    .select('*')
    .eq('user_id', user.id);

  return new Response(JSON.stringify(data));
});
```

#### 4. Frontend Architecture

```
WRONG:  React → Supabase Client → Database (with RLS policies)
RIGHT:  React → Edge Function → Service Role → Database (no policies)
```

### Security Checklist

**Database Layer:**
- [ ] All tables have RLS ENABLED
- [ ] No RLS policies exist (tables closed to anon/authenticated)
- [ ] All sensitive functions have REVOKE from PUBLIC/anon/authenticated
- [ ] Only service_role has EXECUTE on sensitive functions

**API Layer:**
- [ ] All data access goes through edge functions
- [ ] Edge functions use service_role key (not anon)
- [ ] Edge functions verify token BEFORE any database access
- [ ] Invalid tokens return 403 immediately
- [ ] User ID extracted from token, not from request body

**Frontend Layer:**
- [ ] No direct `supabase.from()` calls for user data
- [ ] All data fetched via `supabase.functions.invoke()`
- [ ] Service role key NEVER in frontend code

### Common AI-Generated Vulnerabilities

| Pattern | Risk | Fix |
|---------|------|-----|
| RLS policies for user access | Policies evaluated client-side | RLS without rules + edge functions |
| `SECURITY DEFINER` functions | Still callable by anon | REVOKE + GRANT service_role only |
| Direct `.from()` in React | Bypasses backend validation | Route through edge functions |
| Trust `auth.uid()` in policies | Client controls the JWT | Verify token server-side |
| Functions without REVOKE | Anyone with anon key can call | Lock down every sensitive function |

---

## 6. Accessibility Standards

> Source: `rams`, `web-design-guidelines`

### Critical (Must Fix)

| Check | WCAG | What to Look For |
|-------|------|------------------|
| Images without alt | 1.1.1 | `<img>` without `alt` attribute |
| Icon-only buttons | 4.1.2 | `<button>` with only SVG/icon, no `aria-label` |
| Form inputs without labels | 1.3.1 | `<input>` without associated `<label>` or `aria-label` |
| Non-semantic click handlers | 2.1.1 | `<div onClick>` without `role`, `tabIndex`, `onKeyDown` |
| Missing link destination | 2.1.1 | `<a>` without `href` using only `onClick` |

### Serious (Should Fix)

| Check | WCAG | What to Look For |
|-------|------|------------------|
| Focus outline removed | 2.4.7 | `outline-none` without visible focus replacement |
| Missing keyboard handlers | 2.1.1 | Interactive elements with `onClick` but no `onKeyDown` |
| Color-only information | 1.4.1 | Status indicated only by color (no icon/text) |
| Touch target too small | 2.5.5 | Clickable elements smaller than 44x44px |

### Moderate (Consider Fixing)

| Check | WCAG | What to Look For |
|-------|------|------------------|
| Heading hierarchy | 1.3.1 | Skipped heading levels (h1 → h3) |
| Positive tabIndex | 2.4.3 | `tabIndex` > 0 (disrupts natural tab order) |
| Role without attributes | 4.1.2 | `role="button"` without `tabIndex="0"` |

### Visual Design Checks

**Layout & Spacing:**
- Inconsistent spacing values
- Overflow issues, alignment problems
- Z-index conflicts

**Typography:**
- Mixed font families, weights, or sizes
- Line height issues
- Missing font fallbacks

**Color & Contrast:**
- Contrast ratio below 4.5:1
- Missing hover/focus states
- Dark mode inconsistencies

**Components:**
- Missing button states (disabled, loading, hover, active, focus)
- Missing form field states (error, success, disabled)
- Inconsistent borders, shadows, or icon sizing

---

## 7. Animation & Interaction Guidelines

> Source: `ui-skills`

### Animation Rules

- **NEVER** add animation unless explicitly requested
- **MUST** animate only compositor props (`transform`, `opacity`)
- **NEVER** animate layout properties (`width`, `height`, `top`, `left`, `margin`, `padding`)
- **SHOULD** avoid animating paint properties (`background`, `color`) except for small UI
- **SHOULD** use `ease-out` on entrance
- **NEVER** exceed `200ms` for interaction feedback
- **MUST** pause looping animations when off-screen
- **SHOULD** respect `prefers-reduced-motion`
- **NEVER** introduce custom easing curves unless explicitly requested
- **SHOULD** avoid animating large images or full-screen surfaces

### Performance Rules

- **NEVER** animate large `blur()` or `backdrop-filter` surfaces
- **NEVER** apply `will-change` outside an active animation
- **NEVER** use `useEffect` for anything that can be expressed as render logic

---

## 8. Code Quality Checklist

### Before Every PR

**Frontend:**
- [ ] No barrel imports used
- [ ] All interactive elements have keyboard support
- [ ] All images have alt text
- [ ] Icon-only buttons have aria-label
- [ ] No direct database access from React components
- [ ] Animation only on `transform`/`opacity`
- [ ] No `h-screen`, using `h-dvh`
- [ ] `tabular-nums` for numeric data
- [ ] `text-balance` for headings, `text-pretty` for body

**Performance:**
- [ ] No waterfall async operations (use Promise.all)
- [ ] Heavy components use lazy loading
- [ ] Lists use virtualization (FlatList/FlashList)
- [ ] Re-renders minimized (don't subscribe to unused state)

**Database:**
- [ ] All tables have RLS enabled
- [ ] FK columns have indexes
- [ ] Using `timestamptz` not `timestamp`
- [ ] Using `text` not `varchar(n)`
- [ ] Functions have REVOKE from PUBLIC

**Security:**
- [ ] No service role key in frontend code
- [ ] Data access through edge functions
- [ ] Token verification before database access
- [ ] No SQL injection vulnerabilities

---

## Skill Reference Quick Lookup

| Category | Skill | When to Use |
|----------|-------|-------------|
| Frontend Design | `frontend-design:frontend-design` | Creating production-grade UI |
| UI Constraints | `ui-skills` | Any UI work |
| Web Guidelines | `web-design-guidelines` | Reviewing UI code |
| React/Next.js | `react-best-practices` | Writing/reviewing React code |
| React Native | `react-native-best-practices:react-native-best-practices` | Mobile performance |
| Accessibility | `rams` | Accessibility and visual design review |
| PostgreSQL | `pg:design-postgres-tables` | Table design |
| TimescaleDB | `pg:setup-timescaledb-hypertables` | Time-series data |
| Hypertable Migration | `pg:migrate-postgres-tables-to-hypertables` | Converting existing tables |
| Hypertable Candidates | `pg:find-hypertable-candidates` | Finding tables to convert |
| Supabase Security | `supabase-security-audit` | Auditing Supabase apps |

---

## Update Log

| Date | Change |
|------|--------|
| 2026-01-18 | Initial document created with consolidated skill guidelines |
