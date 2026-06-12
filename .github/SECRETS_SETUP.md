# .github/SECRETS_SETUP.md
# MereSimi Studios Ltd — Honiara Taxi Network
# GitHub Actions — Required Secrets Setup Guide

---

## How to Add Secrets

Go to your GitHub repository →
**Settings → Secrets and variables → Actions → New repository secret**

Add every secret in the table below.

---

## Required Secrets

### App Environment (Supabase + Maps + Firebase)

| Secret Name | Where to find it |
|-------------|-----------------|
| `VITE_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public key |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Cloud Console → APIs & Services → Credentials |
| `VITE_FIREBASE_API_KEY` | Firebase → Project Settings → Your Apps → Web → Config |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase → Project Settings → Web config |
| `VITE_FIREBASE_PROJECT_ID` | Firebase → Project Settings → General |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase → Project Settings → Web config |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase → Project Settings → Web config |
| `VITE_FIREBASE_APP_ID` | Firebase → Project Settings → Web config |
| `VITE_FIREBASE_VAPID_KEY` | Firebase → Project Settings → Cloud Messaging → Web push certificates → Key pair |

### Android Signing

| Secret Name | Description |
|-------------|-------------|
| `ANDROID_KEYSTORE_BASE64` | Your keystore file, base64 encoded (see below) |
| `ANDROID_KEYSTORE_PASSWORD` | The password you set when creating the keystore |
| `ANDROID_KEY_ALIAS` | The alias you used — use `htn-key` |
| `ANDROID_KEY_PASSWORD` | The key password (can be same as keystore password) |

---

## Creating Your Android Keystore (one time only)

Run this on your local machine. **Save the .jks file somewhere safe — if you
lose it you can never update your app on the Play Store.**

```bash
keytool -genkey -v \
  -keystore htn-release.jks \
  -alias htn-key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -dname "CN=MereSimi Studios Ltd, OU=HTN, O=MereSimi Studios, L=Honiara, ST=Guadalcanal, C=SB"
```

You will be prompted to set passwords — remember them.

---

## Encoding the Keystore for GitHub Secrets

**macOS / Linux:**
```bash
base64 -i htn-release.jks | tr -d '\n'
```

**Windows (PowerShell):**
```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("htn-release.jks"))
```

Copy the entire output and paste it as the `ANDROID_KEYSTORE_BASE64` secret.

---

## Triggering a Build

**Automatic:** Push any commit to `main` or `develop` branch.

**Manual:**
1. Go to your repo on GitHub
2. Click the **Actions** tab
3. Click **Build Android APK** in the left panel
4. Click **Run workflow** → select branch → **Run workflow**

---

## Downloading the APK After Build

1. Go to **Actions** tab on GitHub
2. Click the completed workflow run
3. Scroll down to **Artifacts**
4. Download **HTN-release-apk-signed** (signed, ready to install)
5. Or download **HTN-debug-apk** (for testing, no signing needed)

To install on your Android phone:
1. Enable **Settings → Security → Install unknown apps**
2. Transfer the APK to your phone
3. Tap the APK file to install

---

## google-services.json

The Firebase `google-services.json` file must be placed at:
```
android/app/google-services.json
```

Download it from:
**Firebase Console → Project Settings → Your Apps → Android → google-services.json**

**Do NOT commit this file to git** — add it as a secret instead:

1. Copy the file contents
2. Create a secret named `GOOGLE_SERVICES_JSON`
3. In the workflow, it is written to disk automatically before the build

The workflow already handles this — see step `Create google-services.json`.
