# resources/README.md
# MereSimi Studios Ltd — Honiara Taxi Network

## App Icon & Splash Screen Source Files

The GitHub Actions workflow uses `@capacitor/assets` to auto-generate ALL
required Android icon sizes and splash screens from three source images
placed in this `resources/` folder.

---

## Files Required

| File | Size | Purpose |
|------|------|---------|
| `icon.png` | **1024 × 1024 px** | App icon (all densities) |
| `icon-foreground.png` | **1024 × 1024 px** | Adaptive icon foreground layer |
| `splash.png` | **2732 × 2732 px** | Splash screen (all orientations) |
| `splash-dark.png` | **2732 × 2732 px** | Dark mode splash (optional) |

---

## Design Requirements

### icon.png
- Solid background — use **#0A0C0F** (HTN obsidian black)
- Taxi/HTN logo centred, within the safe zone (centre 768×768 px)
- No transparency — Android requires solid background
- PNG format, 24-bit colour

### icon-foreground.png
- **Transparent background**
- Only the taxi/logo graphic, centred
- Used for Android adaptive icons (API 26+)
- Logo should stay within the inner 66% (safe zone)

### splash.png
- Background: **#0A0C0F**
- HTN logo/wordmark centred
- Keep the logo within the centre **1200 × 1200 px** — outer areas get cropped
  on different screen sizes
- PNG format

---

## What Gets Generated Automatically

When the workflow runs `npx @capacitor/assets generate --android`, it produces:

```
android/app/src/main/res/
  mipmap-mdpi/          ic_launcher.png          (48×48)
  mipmap-hdpi/          ic_launcher.png          (72×72)
  mipmap-xhdpi/         ic_launcher.png          (96×96)
  mipmap-xxhdpi/        ic_launcher.png          (144×144)
  mipmap-xxxhdpi/       ic_launcher.png          (192×192)
  mipmap-anydpi-v26/    ic_launcher.xml          (adaptive)
  drawable/             splash.png               (land + port)
  drawable-land-hdpi/   splash.png
  drawable-land-mdpi/   splash.png
  drawable-port-hdpi/   splash.png
  drawable-port-mdpi/   splash.png
  ... (all densities)
```

---

## Quick Way to Create Icons (if you don't have a designer)

Use **Figma** (free):
1. Create a 1024×1024 frame
2. Fill background with `#0A0C0F`
3. Add the 🚖 emoji or your logo centered
4. Add "HTN" in Syne font, bold, gold `#F5A623`
5. Export as PNG at 1x → save as `resources/icon.png`
6. For splash: create 2732×2732 frame, same treatment

Or use **https://icon.kitchen** — paste your logo, it generates all sizes.

---

## Generating Locally (before pushing to GitHub)

```bash
# Install the tool
npm install -g @capacitor/assets

# Generate for Android only
npx @capacitor/assets generate --android \
  --iconBackgroundColor '#0A0C0F' \
  --splashBackgroundColor '#0A0C0F'

# Generate for both Android and iOS
npx @capacitor/assets generate \
  --iconBackgroundColor '#0A0C0F' \
  --splashBackgroundColor '#0A0C0F'
```
