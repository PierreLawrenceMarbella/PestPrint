# PESTPRINT motion system

The project uses CSS motion, with no additional dependencies. `src/motion.css`
is imported once by `src/styles.css`. Existing hero effects, loading indicators
and hover transitions use its shared tokens. New reveal utilities are opt-in;
Phase 1 establishes the reusable foundation. Phase 2 applies it to the existing
landing-page hero while retaining its layout.

## Timing and transitions

| Token | Default | Use |
| --- | --- | --- |
| `--motion-duration-fast` | 180ms | Hover and color feedback |
| `--motion-duration-standard` | 250ms | Transform and opacity transitions |
| `--motion-duration-reveal` | 400ms | Entrances |
| `--motion-stagger-step` | 60ms | Spacing between sibling entrances |
| `--motion-stagger-limit` | 300ms | Maximum extra stagger delay |

Use `--motion-ease-standard` for interactions and `--motion-ease-enter` for
entrances. Ambient effects retain their existing longer durations, named in the
same stylesheet. Phase 2's hero component (`src/hero.tsx`) owns the six-second
slide timer, preloading, pause, visibility and reduced-motion handling. It uses
the Phase 1 entrances with hero-only duration (600ms) and stagger (90ms) overrides.
The 1400ms crossfade keeps the outgoing image opaque underneath the incoming
image, with its zoom continuing through the fade. A slow or failed next image
never replaces a ready frame. Reduced motion keeps the current scene static.

## Reusable classes

| Class | Behavior |
| --- | --- |
| `motion-fade-in` | Fade from transparent to visible |
| `motion-fade-up` | Fade and move up 12px to the resting position |
| `motion-scale` | Fade and scale from 0.98 to the resting size |
| `motion-hover` | Smooth 2px lift on hover with a mouse or fine pointer |
| `motion-stagger` | Delay direct children that use an entrance class |
| `motion-transition` | Smooth color, border, shadow and lift changes |
| `motion-transition-transform` | Smooth an existing transform state change |
| `motion-transition-fade` | Smooth an existing opacity state change |

Use one entrance class per element. Entrances run once when the element mounts;
they do not observe scrolling. They animate only opacity and transform, so they
do not change document layout. Apply them to an element without a resting
transform, or animate a separate existing ancestor if its transform is needed.
Hover uses individual `translate`, so it can compose with an entrance.
Transition utilities smooth state changes; they do not create states themselves.

```tsx
import { staggerStyle } from "./motion";

// Add classes to existing elements; no new layout wrappers are required.
<div className="existing-grid motion-stagger">
  {items.map((item, index) => (
    <article
      key={item.id}
      className="existing-card motion-fade-up motion-hover"
      style={staggerStyle(index)}
    >
      {item.title}
    </article>
  ))}
</div>
```

`staggerStyle(index)` supplies a safe, zero-based `--motion-index`. Plain CSS
consumers can set that custom property directly. Set `--motion-duration` or
`--motion-delay` on an entrance to override its duration or starting delay;
containers can override the stagger step and limit. Prefer the shared defaults.

## Accessibility

The shared `prefers-reduced-motion` rule disables animations, transitions,
smooth scrolling and hover movement immediately, including during an entrance.
Elements have no permanently hidden base state, so disabling motion also removes
stagger delays and shows content immediately. Keyboard focus within a reveal
cancels that entrance so focused controls remain visible. Existing focus outlines
are preserved. No behavior depends on animation completion events.

## Phase 2 completion

Status: COMPLETE. Verified on November 5, 2026.

The interrupted implementation already contained the slideshow, decoded image
preloading, continuous outgoing zoom, scanner sweep and glow, floating previews,
staggered entrances, and motion controls. Completion work retained those features
and finished the pending scanner movement, navigation and visual checks.
No additional animation implementation or runtime fixes were needed.

- `npm run build`: passed TypeScript compilation and the Vite production build.
- Seven tests in `tests/hero.spec.ts`: passed, covering the full slide loop,
  crossfade layers and continuous zoom, stationary copy, pause and hidden tabs,
  reduced motion, slow/failed image requests, cleanup, scanner movement,
  responsive layouts, keyboard focus and the primary action.
- The home/navigation regression in `tests/app.spec.ts`: passed.
- Visual review: all four desktop scenes and the mobile hero remained readable.
  Responsive assertions and screenshots covered 320, 390, 600, 768 and 1440px.

Browser checks used Microsoft Edge with emulated viewport sizes; physical mobile
devices were not tested. Slow images intentionally keep the current frame past
six seconds until the next image is decoded. Phase 3 has not started.
