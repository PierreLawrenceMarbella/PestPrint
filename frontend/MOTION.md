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
six seconds until the next image is decoded.

## Phase 3: navigation and Home interactions

- Navigation links reveal their underline with a transform transition and use
  subtle green highlights. Keyboard focus keeps a visible outline.
- The mobile menu fades and moves 8px as a single panel. Closed links are inert
  and hidden from assistive technology immediately, including during the exit.
  Escape restores focus to the toggle. Navigation, outside clicks and keyboard
  focus leaving the header close the menu; breakpoint changes hand focus to the
  visible control after inert is updated. All event listeners are cleaned up.
- `HowItWorks` accepts an optional `animated` prop. Home opts in to the Phase 1
  stagger and hover classes. The About page keeps its original card behavior.
  Informational cards remain outside the tab order.
- Home cards lift 3px, change their shadow and softly highlight their icons on
  fine-pointer hover. Their resting position and dimensions are preserved.
- Only the hero action and Home's Get Started button opt in to elevation and
  pressed shadows. The hero arrow moves 3px; touch devices do not retain lifts.
- Shared reduced-motion rules disable entrances and transitions. Motion-only
  hover states are restricted to fine pointers with no reduced-motion request.

Verification: `npm run build` passed TypeScript and the production build. All
16 selected browser tests passed: eight new interaction tests, seven hero tests,
and the home/navigation regression. Checks cover desktop, mobile viewports,
touch emulation, keyboard focus, rapid menu reversals, breakpoint changes,
reduced motion, navigation and the Phase 2 slideshow. Saved layout and typography
measurements matched before and after at 320, 390, 600, 768 and 1440px, with About
card and button measurements also unchanged. Screenshots were visually reviewed.

## Phase 4: Analyze upload interactions

- The existing drop zone uses the shared interaction transitions for its forest
  green border and tinted background. Its icon lifts 3px while a file is over
  the zone, and the active instruction is announced politely. Text drags do not
  activate the file state. Nested drag events retain their depth counter;
  leaving, Escape, drag end, outside drops, window blur and hidden tabs clear it.
  Global listeners are removed when Analyze unmounts.
- Decoded previews use `motion-scale` for the fade and 0.98 settling scale.
  Replacing an image remounts only the preview surface so its entrance replays.
  Existing image actions fade in with the shared reveal and stagger timing.
  The ready label receives focus after selection; removing returns focus to
  Choose Image. A canceled or invalid replacement preserves the valid preview.
- Upload and camera controls use the existing hover utility, soft shadows,
  visible keyboard focus and pressed feedback. Disabled controls retain their
  locks during validation and analysis. Supported class images have a restrained
  hover zoom and shadow without changing card dimensions or links.
- Motion transforms are gated by reduced-motion preferences; hover movement is
  also restricted to fine pointers. The shared policy removes reveal animations
  immediately. No new dependencies, motion utilities or timers were introduced.

Verification: TypeScript and the production build passed (`npm run build`).
All 10 selected browser tests passed: seven in `tests/upload.spec.ts` plus the
existing drag/replacement, camera permission failure and camera capture tests.
Coverage includes native file chooser events, canceled replacement, removal and
reselection, nested/canceled drags, validation failures, analysis error recovery
and disabled actions, keyboard focus, the four guide links, reduced motion and
touch input. Layout and typography measurements for empty and preview states
matched the saved baseline at 320, 390, 600, 768 and 1440px with no horizontal
overflow. Desktop and mobile screenshots were visually reviewed.

Browser checks used Microsoft Edge. Desktop camera capture used a simulated
canvas video stream and verified stream cleanup; mobile testing exercised the
native `capture="environment"` input with an image fixture. Physical camera
hardware and native mobile camera applications were not tested. Model status
and analysis error responses in the new tests are fixtures; AI inference was
not changed or retested in this phase.

## Phase 5: request-driven image scanning

`src/analysis-scanner.tsx` renders only while Analyze's real request is pending.
The original preview remains visible beneath a thin green sweep, a soft moving
highlight, a steady illuminated border and four decorative corner brackets.
These brackets are visual framing, not inferred damage locations. The processing
spinner is indeterminate; no progress percentage or staged AI claims are shown.
The scanner reuses the shared scan duration, easing and spinner animation.

The visible status reads "Analyzing rice crop image...". A single live region
outside the busy panel announces this state without waiting for `aria-busy` to
clear. Reduced motion hides the sweep and stops the spinner, leaving stationary
framing and readable status. Hidden tabs pause decorative animations; the request
continues. The visibility listener is removed when the scanner unmounts.

Cancel Analysis aborts the existing fetch, retains the image and returns focus
to Analyze Image for retry. The request ref blocks duplicate submissions, while
abort checks discard canceled responses. Success, failure, timeout and navigation
remove the scanner immediately; there is no minimum display time or dependency
on animation completion. Canceling the browser request does not guarantee that
the backend has stopped computation already in progress.

Verification: `npm run build` passed TypeScript and the production build. All
13 scanning and upload browser tests passed, including six new scanning tests.
Coverage includes pending requests, duplicate clicks, success while the sweep is
paused, unchanged returned probabilities, HTTP/network/malformed-response errors,
retry, cancellation and late responses, timeout, navigation cleanup, hidden tabs,
live reduced-motion changes and responsive layouts at 320, 390, 768 and 1440px.
The responsive test passed again after waiting for the existing mobile menu's
breakpoint transition before screenshots. Desktop and mobile scans were visually
reviewed. API responses are explicit browser-test fixtures; real model inference
was not rerun. No backend, model or classification values were modified.
