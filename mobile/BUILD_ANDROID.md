# Build and install PESTPRINT for Android

## Standalone offline APK (Phase 11E-C)

The current standalone deliverable is `builds/pestprint-offline.apk` after a
successful build. It uses the release variant, embedded production Hermes
JavaScript, the unchanged Phase 11B ONNX model, and a private local signing key.
It does not use Expo Go, Metro, a laptop, internet, or Flask during normal use.
The updated release is **1.0.1**, Android versionCode **2**, with the same
`com.pestprint.mobile` application ID and signing certificate as version 1.0.0.
It includes the one-decimal result formatting and branded launch animation.
See [PHASE_11E_REPORT.md](PHASE_11E_REPORT.md) for current verification and limits;
[PHASE_11D_REPORT.md](PHASE_11D_REPORT.md) records the original release tests.

### Install on a phone

1. Copy `builds/pestprint-offline.apk` to your phone using USB or your preferred
   file-transfer method. No network is needed after the file is on the phone.
2. Open it in the phone's Files app. If prompted, allow **Install unknown apps**
   for that Files app, then install PESTPRINT.
3. Open **PESTPRINT** directly from the home screen or app drawer.
4. Turn on airplane mode. Choose **Analyze**, select a local JPG/PNG or take a
   photo, and tap **Analyze Image**. Allow camera access when requested.

To update an installed **1.0.0 standalone release**, open
`builds/pestprint-offline-1.0.1.apk` and choose **Update**. Keep the existing app
installed; this release preserves its signing identity. The generic
`builds/pestprint-offline.apk` is the same updated APK. The original version is
archived locally as `builds/pestprint-offline-1.0.0.apk`.

The APK includes ARM64 phone support and x86_64 emulator support, Android 7.0+
(API 24+). A 32-bit-only phone is not supported by this artifact. Actual phone
compatibility and performance must be checked on your device.

If Android reports a signing conflict with the old development build, uninstall
that old PESTPRINT build first, then install this APK. Uninstalling clears app
settings and current selection. Future APK updates should retain the same signing
key; use a higher `android.versionCode` in `app.json` for new distributed versions.

Optional USB installation with Android platform tools:

```powershell
adb devices
adb install -r mobile/builds/pestprint-offline-1.0.1.apk
```

### Rebuild after changes (Windows)

Requirements: Node 24, Python 3, JDK 21, Android SDK 36, build-tools 36.0.0,
NDK 27.1.12297006, and CMake 3.22.1. Set `JAVA_HOME` / `ANDROID_HOME` if the
installed paths differ from the script defaults. Internet can be needed to
install/build dependencies, but is not needed by the finished app.

```powershell
cd mobile
npm.cmd ci
npm.cmd run build:apk
```

Obtain the exact Phase 11B model from team storage if absent. The build prepares
and verifies it automatically, runs Expo prebuild and `assembleRelease`, then
checks the actual APK's embedded Hermes bundle, model checksum, native libraries,
application identity, non-debuggable flag, and signature.
The verifier also checks 16 KiB ZIP alignment and ELF load-segment alignment for
all packaged native libraries. The ONNX JSI bridge has explicit Android linker
settings for this; physical 16 KiB-device execution still needs acceptance testing.

Output:

- `builds/pestprint-offline.apk`
- `builds/pestprint-offline.build.json` (size, checksums, version, public certificate fingerprint)

The build uses low-memory/single-compiler settings and a short Windows C++ build
directory. It prepares checksum-pinned Ninja 1.13.2 from its official release in
the ignored repository `.artifacts/` cache and uses it for the app's native build;
the Android SDK and Windows registry are not modified. The first build can download
this small build tool, never the model at app runtime. This addresses the SDK's
older Ninja path limit described in [Expo's Windows guidance](https://docs.expo.dev/troubleshooting/windows-long-paths/).
On an 8 GB computer, close the emulator and Metro before compiling.
For an ARM64-only APK, use `npm.cmd run build:apk -- -Architectures arm64-v8a`.

The first local build creates `mobile/.signing/pestprint-release.p12` and matching
`release.properties`. **Back up the whole `.signing/` folder privately.** It is
excluded from Git and EAS uploads; do not share its passwords. Losing this key
prevents updating installed copies with the same signing identity. The script
refuses to replace an incomplete existing identity. Never commit this folder.

### Physical-phone acceptance checklist

Copy known held-out images for all four classes onto the phone before disconnecting.
The provided `builds/offline-test-images/` folder contains four original held-out
files plus `expected-results.json` with saved genuine model outputs. Regenerate
it from the local dataset/reference files with
`python scripts/prepare-phone-test-images.py` from `mobile/`.
Use the original files, not screenshots or recompressed messenger copies, for
comparison with the Phase 11B/11C saved outputs. Model agreement and ground-truth
accuracy are different measurements: use the saved prediction as the comparison.

- Fresh install; launch from the home screen without Expo Go or Metro.
- Enable airplane mode **before first launch**; leave Wi-Fi/mobile data off.
- Disconnect USB, close VS Code and turn the laptop off; launch and classify.
- Restart the phone, reopen PESTPRINT, and classify again while offline.
- Camera permission: allow, capture, cancel, deny/retry; check preview orientation.
- Gallery selection/cancellation; replace/remove; JPG/PNG and 10 MB validation.
- Real Healthy Rice, Rice Leaffolder, Stem Borer, and trained Unknown outputs;
  check confidence and expanded probability order against saved references.
- Analyze Another Image, Learn More, four bottom tabs, Pest Guide details, About.
- At least 20 consecutive analyses; watch for freezes, heat, crashes, and lost images.
- Processing cancellation, invalid files, larger camera photos, low-memory conditions.
- Small-screen scrolling, Android Back, text scaling, focus and reduced motion.

Record phone model, Android version, CPU ABI, RAM, APK checksum, test date, failures,
and response times. Physical-device testing is only passed once executed; emulator
results do not establish camera-vendor or physical ARM64 behavior.

### EAS alternative

No EAS/cloud build or paid service is needed for the provided local APK. The
existing `preview` profile is an APK release build (`developmentClient: false`)
with the legacy HTTP setting disabled. If the team later chooses EAS, use
`eas build --platform android --profile preview` after authenticating and checking
the service's current quota. No cloud build was performed here.

Root `.easignore` explicitly includes the prepared model binary and excludes
`.signing/`, datasets, and native build output. EAS uses its own managed signing
credentials; this local key is not uploaded automatically. GitHub-only builds
still need the exact Git-ignored model provisioned into their build context.
The pre-install hook refuses a missing/wrong model. An actual EAS archive/upload
has not been verified; the local APK package itself is verified by the build.

## Phase 11C development builds

Current mobile inference uses the bundled offline model. Follow
[OFFLINE_AI.md](OFFLINE_AI.md) for Phase 11C native development-build setup,
model packaging, verification, and current limitations. No Flask server or API
URL is required for the current Analyze action. Development builds still use
Metro; the standalone APK above embeds its JavaScript.

<details>
<summary>Historical Phase 10 online-prototype build notes</summary>

The notes below describe the earlier online prototype and its environment at
that time. They are retained as history, not current mobile setup requirements.

## Current build status

No APK was produced in the Phase 10 environment. Expo Android prebuild succeeded
and Gradle 9.3.1 downloaded, but native builds with both Android Studio Java and
JDK 21 stopped while resolving:

```text
org.gradle.toolchains.foojay-resolver-convention:1.0.0
```

Connectivity probes to `repo.maven.apache.org` and `repo1.maven.org` timed out.
The environment also lacks NDK and CMake. Cloud builds were not started because
no Expo account was logged in. An Android JavaScript export is not an APK.

## Option A: EAS cloud preview APK

This path uses Expo's build servers and the `preview` profile in `eas.json`.
Run these commands from `mobile/`:

```powershell
npm.cmd ci
npx.cmd eas-cli@latest login
npx.cmd eas-cli@latest init
```

Select the team's existing Expo project, or create one when prompted. Set the API
URL that the **phone** can reach. The following IP is an example; replace it with
the computer's current Wi-Fi IPv4 address, or use a hosted HTTPS API URL:

```powershell
npx.cmd eas-cli@latest env:set --name EXPO_PUBLIC_API_BASE_URL --value http://192.168.1.100:5000 --environment preview --visibility plaintext
npx.cmd eas-cli@latest env:list --environment preview
npx.cmd eas-cli@latest build --platform android --profile preview
```

Allow EAS to generate an Android keystore if prompted. The preview profile builds
an installable APK with its JavaScript included. Expo Go and Metro are not required
to run that APK. The Python API must still be running for real analysis.

The cloud build gets its API URL from the EAS `preview` environment, not the
Git-ignored `.env.local`. Changing the embedded API address requires another build.
The public address must not contain passwords or tokens.

[Expo APK builds](https://docs.expo.dev/build-reference/apk/)
and [environment configuration](https://docs.expo.dev/eas/environment-variables/manage/)
describe these commands.

## Option B: Windows local preview APK

Install Node 24 LTS, JDK 21, and Android Studio. In Android Studio's SDK Manager,
install these versions from the current React Native build configuration:

- Android SDK Platform 36 and Platform Tools
- Android SDK Build-Tools 36.0.0
- Android SDK Command-line Tools
- NDK (Side by side) 27.1.12297006
- CMake 3.30.5

Complete the SDK license prompts in Android Studio. Maven Central, Google's
Android Maven repository, Gradle Plugin Portal, and Gradle distribution downloads
must be reachable. If your network needs a proxy, configure it in the user's
Gradle settings; do not commit proxy credentials.

After installing Android SDK Command-line Tools, the same SDK packages can be
installed from PowerShell:

```powershell
& "$env:ANDROID_HOME\cmdline-tools\latest\bin\sdkmanager.bat" 'platform-tools' 'platforms;android-36' 'build-tools;36.0.0' 'ndk;27.1.12297006' 'cmake;3.30.5'
& "$env:ANDROID_HOME\cmdline-tools\latest\bin\sdkmanager.bat" --licenses
```

From `mobile/`, set paths for your actual installations:

```powershell
$env:JAVA_HOME = 'C:\Program Files\Eclipse Adoptium\jdk-21.0.8.9-hotspot'
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
npm.cmd ci
npm.cmd run build:apk
```

Configure `.env.local` as described in [README.md](README.md) before building.
The script runs Android prebuild, assembles the release variant for ARM64 phones
and x86_64 emulators, and copies the result to:

```text
mobile/builds/pestprint-preview.apk
```

This local preview uses Expo's generated debug signing key and is intended for
internal testing. Store releases need a proper release signing setup. To include
32-bit devices, run the build script with all four architectures:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/build-preview.ps1 -Architectures 'armeabi-v7a,arm64-v8a,x86,x86_64'
```

Generated native files and APKs are ignored by Git. The script preserves the
existing `npm run android` Expo Go command; `npm run android:native` builds a
native debug app. Run `npm run prepare:brand` only to regenerate launcher PNGs
after editing the vector leaf mark.

## Install the APK

After a build succeeds:

1. Download the APK from the EAS build link, or copy the local APK to your phone.
2. Open it using the phone's Files app. Allow that app to install unknown apps
   when Android prompts, then select **Install**.
3. Open **PESTPRINT**. Home, Pest Guide, and About work without the API. For
   analysis, start the Python backend and ensure the phone can reach its address.

With USB debugging enabled, you can install a downloaded or locally built APK
from the computer instead:

```powershell
& "$env:ANDROID_HOME\platform-tools\adb.exe" install -r .\builds\pestprint-preview.apk
```

Local and EAS builds may use different signing keys. If Android reports an update
signature conflict, uninstall the previous preview before installing the new one.

## Networking and remaining validation

The `preview` profile and local build script explicitly enable HTTP for a LAN API.
The `production` profile disables cleartext HTTP and requires an HTTPS API URL.
The evaluated Android manifest was checked in both modes.

Physical-device installation, APK startup, release networking, and store signing
remain unverified until an APK can be built. Expo Go emulator checks do not
replace those tests.

`npm audit` currently reports seven inherited advisories: four moderate and three
high, under Expo fingerprint/glob/minimatch and Router/query-string/URI decoding.
The suggested fixes change the Expo SDK major version; no forced SDK upgrade was
applied. Review and retest an SDK upgrade before a public release.

</details>
