# PESTPRINT Mobile

A native Android app built with React Native, Expo SDK 57, Expo Router, and
TypeScript. Phase 2A provides the navigation shell and reference-aligned
PESTPRINT design system. Image upload and AI analysis are not connected yet.

## Requirements

- Node.js LTS (Node 24 LTS is used for this project)
- Expo Go compatible with SDK 57 on an Android phone, or an Android emulator
- The phone and computer connected to the same Wi-Fi network when using Expo Go

## Run the app

From the repository root:

```powershell
cd mobile
npm.cmd ci
npm.cmd start
```

Run `npm.cmd ci` after cloning or when dependencies change. For daily
development, use `npm.cmd start`, then scan the QR code with Expo Go.

To launch an Android emulator that is already running:

```powershell
npm.cmd run android
```

Press `Ctrl+C` to stop the Expo development server.

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
|   |-- screens/                 Home, Analyze, Pest Guide, and About screens
|   |-- services/                Reserved for later API integration
|   |-- theme/                   Colors, spacing, type sizes, and radii
|   `-- types/                   Shared TypeScript types
|-- app.json                     Android and Expo Router configuration
|-- package.json                 Mobile dependencies and commands
`-- tsconfig.json                Strict TypeScript configuration
```

The website and Python backend remain separate. Python, the dataset, and the
`.pth` model are not required to run the Phase 2 mobile app.

## Development checks

```powershell
npm.cmd run typecheck
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
