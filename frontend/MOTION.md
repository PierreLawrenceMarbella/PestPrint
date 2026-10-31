# PESTPRINT motion system — Phase 1

The project uses CSS motion, with no additional dependencies. `src/motion.css`
is imported once by `src/styles.css`. Existing hero effects, loading indicators
and hover transitions use its shared tokens. New reveal utilities are opt-in;
Phase 1 does not add entrances to pages or change their layouts.

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
same stylesheet. The existing five-second hero slide timer and its pause,
visibility and reduced-motion handling remain in `Home`.

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
