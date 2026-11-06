# PESTPRINT Mobile

A separate native Android app built with React Native, Expo SDK 57, and TypeScript.
Phase 1 provides the project structure, shared colors, safe-area support, and a
minimal welcome screen. It does not connect to the AI model or the website.

## Requirements

- Node.js LTS (Node 24 LTS is used for this project).
- Expo Go compatible with SDK 57 on an Android phone, or an Android emulator.
- For a phone, connect the phone and computer to the same Wi-Fi network.

Expo currently recommends SDK 57 for Expo Go on physical devices during the
SDK 58 transition. See the [Expo setup guide](https://docs.expo.dev/get-started/create-a-project/).

## Run the app

Open PowerShell in the repository root:

```powershell
cd mobile
npm.cmd ci
npm.cmd start
```

Run `npm.cmd ci` once after cloning, or when dependencies change. After that,
use `npm.cmd start`. Open Expo Go on your Android phone and scan the terminal's
QR code. Keep the terminal running while developing; press Ctrl+C to stop.

For an installed Android emulator, start the emulator in Android Studio, then run
`npm.cmd run android` from this folder. Android Studio's SDK tools must be
configured for Expo to find the emulator.

## Project structure

```text
mobile/
├── App.tsx                  App root, status bar, and safe-area provider
├── index.ts                 Native Expo entry point
├── app.json                 Android app name, identifier, and icon settings
├── assets/                  Template launcher images; branding can be added later
├── src/
│   ├── screens/             Native screens (WelcomeScreen in Phase 1)
│   ├── components/          Reusable native UI (Screen in Phase 1)
│   ├── services/            Reserved for later service integration
│   ├── types/               Reserved for shared application types
│   └── theme/               PESTPRINT colors, spacing, and radii
├── package.json             Mobile-only dependencies and commands
├── package-lock.json        Reproducible npm dependency versions
└── tsconfig.json            Strict TypeScript configuration
```

The website and Python backend remain in their existing folders and use their
own dependencies. Python, the dataset, and `.pth` weights are not needed to start
this Phase 1 mobile app.

## Development checks

```powershell
npm.cmd run typecheck
npx.cmd expo install --check
npx.cmd --yes expo-doctor
npm.cmd run export:android
```

`export:android` validates the Android JavaScript bundle. It does not create an APK.
The Android application identifier is `com.pestprint.mobile`. This native Expo
project can be configured for an installable APK in a later phase using
[Expo's Android build process](https://docs.expo.dev/build-reference/apk/).
No APK build or Expo account setup is part of Phase 1.

## Phase 1 verification

- TypeScript check passed.
- Expo dependency compatibility check passed.
- Expo Doctor passed all 21 checks.
- Android export passed and produced a Hermes bundle in the ignored `dist/` folder.
- Metro started successfully and served the app to SDK 57 Expo Go.
- The Android API 36.1 emulator rendered the native PESTPRINT welcome screen.
  Its welcome text and description were checked through Android's UI hierarchy,
  which contained no WebView. The screen was also visually inspected.
- The emulator's initial Android system dialogs and Expo Go developer introduction
  were dismissed before inspecting the app. A physical phone was not tested.
- Repository changes for this phase are confined to `mobile/`; the existing
  website and backend were not edited.

## Dependency note

The initial `npm audit` reports four moderate advisories in Expo's transitive
fingerprinting tooling (`glob` and `minimatch`). These remain an upstream
dependency limitation of the compatible SDK 57 dependency set.
