# PESTPRINT Mobile

A native Android app built with React Native, Expo SDK 57, Expo Router, and
TypeScript. The shared results screen supports Stem Borer, Rice Leaffolder,
Healthy Rice, and Unknown (Other Damage). Image analysis uses the
bundled EfficientNet-B0 ONNX model on the Android device, without a Flask server or internet connection.
The Pest Guide includes educational details for all four categories, and About
explains the project and its current limitations.

## Requirements

For APK build status, exact commands, and phone installation steps, see
[BUILD_ANDROID.md](BUILD_ANDROID.md).

- Node.js LTS (Node 24 LTS is used for this project)
- A custom PESTPRINT Android development build, or later a standalone APK
- Android SDK/JDK tooling for local native development (see OFFLINE_AI.md)
- The verified Phase 11B ONNX artifact; run `npm.cmd run prepare:model` before building

Expo Go can preview screens but cannot execute the additional native AI runtime.

## Run the app

For installation without a development computer, use the standalone offline APK
and phone instructions in [BUILD_ANDROID.md](BUILD_ANDROID.md). The commands below
are for development and use Metro.

From the repository root:

```powershell
cd mobile
npm.cmd ci
npm.cmd run prepare:model
npm.cmd run build:dev
npm.cmd start -- --dev-client
```

Run `npm.cmd ci` after cloning or when dependencies change. For daily
development after installing the native build, use `npm.cmd start` with that development client.
The build command prints the development APK location; install it with
`adb install -r android/app/build/outputs/apk/debug/app-debug.apk` on your connected
Android device or emulator. This build needs Metro for development JavaScript.
See [OFFLINE_AI.md](OFFLINE_AI.md) for model packaging, native checks, and limitations.

To launch an Android emulator that is already running:

```powershell
npm.cmd run android
```

Press `Ctrl+C` to stop the Expo development server.

## Offline classification

The mobile Analyze action uses the locally bundled ONNX model. No API URL,
Python server, laptop address, or network fallback is involved. The native
runtime checks the packaged model, preprocesses the selected image, and returns
actual model scores. A standalone APK will include the model; development builds
still use Metro for JavaScript development.

The earlier typed API client remains isolated in `src/services/apiClient.ts` for
reference. The Flask backend and online deployment preparation remain available
for the website. `EXPO_PUBLIC_API_BASE_URL` does not select mobile inference.

## Select a crop image

Open **Analyze** and choose an image from your gallery or take a photo. Camera
access is requested when needed; Android's photo picker gives the app access only
to images you select.

JPG, JPEG, and PNG files up to 10MB are accepted. Review the preview, replace or
remove the image, then tap **Analyze Image**. This opens the processing screen.
The processing screen follows real local preprocessing and inference, then displays
the actual predicted class and score. In Expo Go, analysis shows a native-build
requirement instead of fabricating a result. Images are not uploaded for classification.

Selecting another tab keeps the current image. Closing or restarting the app may
clear it; permanent image storage is not included in Phase 4.

## Navigation

Expo Router provides four fixed bottom tabs:

- Home
- Analyze
- Pest Guide
- About

The tab bar uses native navigation behavior, safe-area spacing, active green
highlighting, gray inactive states, Android system-bar styling, and a
lightweight fade transition. The Analyze tab uses the camera icon shown in the
mobile reference.

## Pest Guide and About

Open **Pest Guide** to browse the four photo cards: Stem Borer, Rice Leaffolder,
Healthy Rice, and Unknown (Other Damage). Tap a card for its overview, typical
characteristics, photo tips, and cautions. Android Back or the on-screen back
control returns to the guide. The four bottom tabs stay available in detail views.

**About** covers the project, the purpose of crop damage classification, the
intended analysis flow, supported categories, and system limitations. It also
shows whether the native offline modules are included. The bundled model is
validated when analysis starts; an installed native module alone does not guarantee successful loading.

Guide images illustrate categories; they are not analyses of a user's crop.
Healthy appearance is not a guarantee of pest or disease absence, and Unknown
does not establish the cause of damage. The guide is available without the AI
runtime.

## Design system

Shared theme tokens define the white canvas, dark navy typography, forest green
actions, mint accents, spacing, type sizes, rounded corners, and subtle shadows.
Reusable components provide primary and secondary buttons, surface and mint
cards, brand and page headers, section titles, and safe-area screen containers.

## Project structure

```text
mobile/
|-- app/                         Expo Router route files and tab layout
|-- assets/                      Android launcher and splash assets
|-- src/
|   |-- components/              Reusable buttons, cards, headings, and containers
|   |-- constants/               Supported category content
|   |-- development/             Clearly labeled, development-only result fixtures
|   |-- hooks/                   Image selection, request state, and motion preferences
|   |-- screens/                 Home, Analyze, Processing, Results, and tab screens
|   |-- services/                On-device inference, isolated legacy API client, analysis lifecycle
|   |-- theme/                   Colors, spacing, type sizes, and radii
|   `-- types/                   Shared TypeScript types
|-- app.json                     Android and Expo Router configuration
|-- package.json                 Mobile dependencies and commands
|-- scripts/                     API protocol, transport, and lifecycle tests
`-- tsconfig.json                Strict TypeScript configuration
```

The website and Python backend remain separate. The phone does not need Python,
the dataset, or the `.pth` model. The computer running the AI API needs Python
dependencies and the trained weights; the dataset is not required for inference.

## API integration

`src/services/inference.ts` configures the typed client from
`EXPO_PUBLIC_API_BASE_URL`. Missing configuration leaves the client unavailable;
invalid configuration shows an actionable error without crashing startup.

`GET /api/health` verifies model availability and the four exact output IDs before
upload. `POST /api/analyze` receives an Expo File multipart part in the `image`
field, following [Expo's file upload API](https://docs.expo.dev/versions/latest/sdk/filesystem/#uploading-files-using-expofetch).
Fetch supplies the multipart boundary. Requests honor cancellation; health checks
time out after 10 seconds and prediction requests after 60 seconds.

The verified training folder order is `healthy`, `leaffolder`, `stemborer`,
`unknown`. The API maps this order to `healthy_rice`, `rice_leaffolder`,
`rice_stem_borer`, `unknown`. The existing checkpoint and classifier have four
outputs, including a trained Unknown class (`unknown_method: 'trained_class'`).
This client rejects incompatible class sets, detection methods, and malformed
scores rather than remapping them.

Confidence and probabilities use 0–1 units in the API. The UI converts confidence
to percent with multiplication by 100 and retains the original validated response
on `result.backend`. Unknown uses its own returned class score. No confidence
cutoffs or synthetic probabilities are introduced.

`useAnalysis` exposes idle, analyzing, success, error, and canceled states. It
prevents duplicate requests, aborts on leaving the processing view, and ignores
late responses from canceled requests. `ProcessingScreen` renders these states
without depending on a particular backend response shape. Its indicator is
indeterminate, and motion pauses with reduced motion, backgrounding, or tab changes.

## Classification results

`ResultScreen` shares the image preview, prediction card, educational information,
and actions across all four result states. Known pests use pink, Healthy Rice
uses green, and Unknown uses pale amber. Characteristics are educational
information, not confirmed observations in the uploaded image. Healthy Rice
does not guarantee that pests or diseases are absent.

The API adapter validates its response and maps it to `ClassificationResult`
with `source: 'backend'`:

- Known pests: `kind: 'known-pest'`, `pest: 'rice_stem_borer' | 'rice_leaffolder'`,
  and optional `confidencePercent` between 0 and 100.
- Healthy Rice: `kind: 'healthy'` and optional `confidencePercent`.
- Unknown: `kind: 'unknown'`, the backend's actual `detectionMethod`, and optional
  `score: { value, label, scale: 'percent' | 'raw' }`.

Scores retain their supplied precision and meaning. Missing confidence displays
**Confidence unavailable**. Unknown displays **No score was supplied** when its
score is absent. Raw scores have no percentage sign or probability bar.

The current Python pipeline reports `unknown_method: 'trained_class'`. The
adapter preserves that pipeline's Unknown decision and score semantics.
The mobile UI does not classify by confidence thresholds or create additional
probabilities. The model and backend prediction logic remain unchanged.

### Preview the result UI during development

With Expo running, open one of these links on the Android emulator:

```text
exp://127.0.0.1:8081/--/analyze?resultFixture=stem-borer
exp://127.0.0.1:8081/--/analyze?resultFixture=rice-leaffolder
exp://127.0.0.1:8081/--/analyze?resultFixture=no-confidence
exp://127.0.0.1:8081/--/analyze?resultFixture=healthy
exp://127.0.0.1:8081/--/analyze?resultFixture=healthy-no-confidence
exp://127.0.0.1:8081/--/analyze?resultFixture=unknown
exp://127.0.0.1:8081/--/analyze?resultFixture=unknown-scored
exp://127.0.0.1:8081/--/analyze?resultFixture=unknown-raw-score
```

On a physical phone, replace `127.0.0.1:8081` with the computer address and port
shown by Expo. Every preview is visibly labeled **DEVELOPMENT FIXTURE** and uses
an example image and sample scores. No inference is run. Fixture links are
ignored in release builds and are separate from normal image analysis.

## Development checks

```powershell
npm.cmd run typecheck
npm.cmd run test:api
npx.cmd expo install --check
npx.cmd --yes expo-doctor
npm.cmd run export:android
```

`export:android` validates the Android JavaScript bundle. It does not create an
APK.

## Phase 2A verification

- TypeScript check passed.
- Expo dependency compatibility check passed.
- Expo Doctor passed all 21 checks.
- Android Hermes bundle export passed.
- Home, Analyze, Pest Guide, and About rendered in an Android API 36.1 emulator.
- Every tab activated its matching screen and active green tab state.
- Android Back returned from Analyze to Home.
- Safe-area spacing and the Android gesture navigation area were visually checked.
- Navigation and scrolling were checked at 1080 x 2400 and 720 x 1600 emulator
  viewports.
- The four supported categories are Healthy Rice, Stem Borer, Rice Leaffolder,
  and Unknown (Other Damage).

A physical Android phone was not tested in this phase.

## Phase 4 verification

- TypeScript, Expo dependency checks, and all 21 Expo Doctor checks passed.
- Android Hermes bundle export passed.
- Android API 36.1 emulator checks passed for JPEG and PNG selection, cancellation,
  replacement, removal, unsupported GIF rejection, and rejection of files over 10MB.
- Camera permission denial, camera cancellation, and capture with the emulator's
  virtual camera passed; captured photos returned to the preview.
- Analyze opened the labeled placeholder. Android Back returned to the same image,
  and switching tabs preserved it.
- Photo cards, safe areas, and scrolling were visually checked at standard and
  compact sizes, including larger system text.

Physical-phone camera quality and an installable APK were not tested. AI inference
and permanent image storage belong to later phases.

## Phase 5 verification

- TypeScript, Expo dependency compatibility, and all 21 Expo Doctor checks passed.
- Android Hermes export passed after removing the temporary test route.
- Request lifecycle checks covered idle, analyzing, success, error, canceled,
  duplicate requests, cancellation signals, retries, and stale responses.
- Android checks verified the unconfigured message and return to the selected image.
- All processing states were checked with a clearly labeled development fixture;
  no AI inference or pest predictions were used. The temporary fixture route was removed.
- Standard and compact Android layouts were visually checked. The system's
  reduced-motion setting stopped continuous effects without advancing request state.

At Phase 5, the API adapter and physical-phone testing were left for later work.

## Phase 6 verification

- TypeScript, Expo dependency compatibility, and all 21 Expo Doctor checks passed.
- Android Hermes export passed.
- Result-data checks covered both known pests, exact confidence precision,
  missing/invalid scores, 0% and 100%, and the development-only fixture guard.
- Android API 36.1 emulator checks passed for both labeled pest fixtures, their
  educational content, Learn More, closing details, Android Back, and Analyze
  Another Image. Missing confidence displayed no invented score or bar fill.
- Results were visually checked at 1080 x 2400 and 900 x 2000, including larger
  system text and reduced motion. Content remained readable and scrollable.
- Normal gallery selection still opened the unconfigured-backend message;
  returning preserved the selected image. No prediction was generated.

In Phase 6, real AI responses and physical-phone testing were unavailable. The
two known-pest interfaces were prepared for an adapter; other result categories
were outside that phase.

## Phase 7 verification

- TypeScript, Expo dependency compatibility, all 21 Expo Doctor checks, and Android
  Hermes export passed.
- Result-data checks covered all four typed states, missing and invalid scores,
  exact precision, zero and 100%, raw score units, and development-only fixtures.
- Android API 36.1 emulator checks passed for Healthy Rice with and without
  confidence, Unknown without a score, and Unknown with percentage or raw scores.
  Missing Unknown scores displayed no numeric value or probability bar.
- Learn More, closing details with Android Back, returning to image selection,
  and both existing known-pest result views passed.
- Healthy and Unknown layouts were visually checked at 1080 x 2400 and
  900 x 2000, including larger system text and reduced motion. Content remained
  readable and scrollable, and action buttons worked.

These Phase 7 checks used visibly labeled UI fixtures. AI inference was still
disconnected at that point; the model and its Unknown mechanism were not changed.
Physical-phone testing is still pending.

## Phase 8 verification

- TypeScript, Expo dependency compatibility, all 21 Expo Doctor checks, and Android
  Hermes export passed.
- Android API 36.1 emulator checks passed for each guide card opening its matching
  details and Android Back returning to the guide.
- On-screen back controls, invalid-category recovery, and navigation between
  Pest Guide and About passed. The existing four-tab bar remains available in details.
- Guide cards, detail content, About branding, supported categories, analysis
  explanation, and limitations were visually inspected.
- Standard 1080 x 2400 and compact 900 x 2000 layouts were checked, including
  larger system text, scrolling to the final content, and reduced motion.
- The mobile UI and documentation contain only the four intended categories.

No AI inference functionality was changed. Physical-phone testing remains pending.

## Phase 9 verification

- Verified the running `/api/health` and `/api/analyze` endpoints with the existing
  EfficientNet-B0 checkpoint. All four training folders and output IDs match.
- Uploaded the four bundled crop reference images to the real backend; responses
  covered Healthy Rice, Stem Borer, Rice Leaffolder, and trained-class Unknown.
- Android API 36.1 emulator gallery uploads reached the backend through the
  computer's Wi-Fi IP. All four real result states displayed their exact returned
  confidence values, without fixture banners or generated predictions.
- Stopping the backend produced a timeout state and preserved the selected image.
  After restoring the server, Try Again returned a real result.
- All 9 mobile API tests passed: configuration, response validation, class mapping,
  Expo File multipart uploads, unavailable/incompatible models, timeouts,
  connectivity/server errors, cancellation, duplicate prevention, and retry.
- All 6 existing Python API tests passed, including real model inference.
- TypeScript, Android Hermes export, dependency compatibility, and all 21 Expo
  Doctor checks passed. The model, training files, and backend prediction logic
  were not changed.

Each developer configures their own computer or hosted API address in `.env.local`.
The server must be running and reachable while analyzing. Physical-phone Wi-Fi
access and release/APK networking remain untested.

## Phase 10 polish and final validation

- Reviewed Home, Upload, Processing, Results, Pest Guide, and About against the
  mobile reference. Preserved the four categories and existing layouts.
- Added eased button press/release feedback, keyboard focus outlines, flexible
  button labels, and reduced-motion tab transitions.
- Improved confidence label/value spacing without rounding or changing scores.
- Enabled native image downsampling for crop previews, thumbnails, and the Home
  image. The original uploaded image and model preprocessing remain unchanged.
- Replaced the Expo launcher placeholder with the existing PESTPRINT vector leaf
  mark. Added SDK-compatible native light-theme support.
- TypeScript, all 9 API tests, Android Hermes export, dependency compatibility,
  all 21 Expo Doctor checks, and build-script syntax checks passed.
- Expo Go on Android API 36.1 passed Home-to-Analyze navigation, camera permission
  and virtual-camera capture, gallery selection, replacement cancellation, image
  removal, real Healthy Rice inference, offline errors, request cancellation,
  and return to the selected image.
- Every Pest Guide card opened its details and Android Back returned correctly.
  About rendered correctly. Standard 1080 x 2400 and compact 900 x 2000 layouts,
  larger text, scrolling, and reduced motion were inspected. Additional result
  states used clearly labeled development fixtures for UI checks.
- Android manifest evaluation confirmed HTTP enabled for the local preview and
  disabled for production. No website or AI model logic was changed.

**No APK was produced.** Native prebuild succeeded, but local Gradle builds failed
resolving the Foojay resolver plugin; both Maven Central host probes timed out.
NDK/CMake are also missing locally, and no Expo account was logged in for a cloud
build. Seven inherited dependency audit advisories remain. Physical-device
installation, APK startup/networking, and production signing remain unverified.

[BUILD_ANDROID.md](BUILD_ANDROID.md) contains the exact local/cloud build setup,
preview profile, API configuration, installation steps, and remaining issues.
