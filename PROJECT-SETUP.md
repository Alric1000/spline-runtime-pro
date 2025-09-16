# 1000SKIS Spline Runtime Pro - Project Setup

## Overview
Optimized 3D ski viewer system using Cloudflare-hosted Spline runtime with shared assets for maximum performance. Solves WebGL context limitations by combining multiple products into single scenes.

## Key Features
- ✅ **Single WebGL Context** for 4 skis (avoids browser 3-context quality limit)
- ✅ **Cloudflare CDN** for fast global delivery
- ✅ **Shared Assets** between scenes for efficiency
- ✅ **Individual Rotation** via trigger overlays
- ✅ **Mobile Optimized** with touch support
- ✅ **Retina Display** quality optimization

## Architecture

```
https://spline-runtime-pro.pages.dev/
├── spline-viewer.js          # Main runtime (shared globally)
├── runtime.js                 # Core Spline runtime
└── scenes/
    ├── hero-animation/        # 4 skis in one scene (Home page)
    │   └── scene.splinecode
    ├── 1000SKISCARVE/        # Individual product scenes
    │   └── scene.splinecode
    ├── 1000SKISPARK/
    │   └── scene.splinecode
    ├── 1000SKISALLMOUNTAIN/
    │   └── scene.splinecode
    └── 1000SKISPOWDER/
        └── scene.splinecode
```

## Webflow Setup

### 1. Global Head Code
**Location:** Project Settings → Custom Code → Head Code

```html
<!-- Spline Runtime from Cloudflare -->
<script type="module" src="https://spline-runtime-pro.pages.dev/spline-viewer.js"></script>

<!-- Essential Styles -->
<style>
spline-viewer {
    width: 100%;
    height: 100%;
    display: block;
}

spline-viewer,
.hero-scene *,
.product-scene * {
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
    -webkit-touch-callout: none;
    -webkit-tap-highlight-color: transparent;
}
</style>
```

### 2. Home Page Setup

**HTML Structure (in Webflow Designer):**
```html
<div class="hero-wrapper">
    <div class="hero-scene"></div>
    <div class="hero-triggers">
        <div class="ski-trigger" data-ski="0"></div>
        <div class="ski-trigger" data-ski="1"></div>
        <div class="ski-trigger" data-ski="2"></div>
        <div class="ski-trigger" data-ski="3"></div>
    </div>
</div>
```

**Webflow Designer Settings:**
- `.hero-wrapper`: Position: Relative, Height: 600px (or as desired)
- `.hero-scene`: Position: Absolute, Width: 100%, Height: 100%
- `.hero-triggers`: Position: Absolute, Width: 100%, Height: 100%, Pointer Events: None
- `.ski-trigger`: Position: Absolute, Width: 25%, Height: 100%, Pointer Events: Auto, Cursor: Grab
  - `[data-ski="0"]`: Left: 0%
  - `[data-ski="1"]`: Left: 25%
  - `[data-ski="2"]`: Left: 50%
  - `[data-ski="3"]`: Left: 75%

**Page Custom Code:** Use the home page script from `CLEAN-WEBFLOW-SETUP.html`

### 3. Product Page Setup

**HTML Structure (in Webflow Designer):**
```html
<!-- For Carve product -->
<div class="product-scene" data-ski="carve"></div>

<!-- For Park product -->
<div class="product-scene" data-ski="park"></div>

<!-- For All Mountain product -->
<div class="product-scene" data-ski="allmountain"></div>

<!-- For Powder product -->
<div class="product-scene" data-ski="powder"></div>
```

**Webflow Designer Settings:**
- `.product-scene`: Width and Height as desired (scene adapts automatically)

**Page Custom Code:** Use the product page script from `CLEAN-WEBFLOW-SETUP.html`

## Ski UUID Mapping

The hero scene identifies skis by their Spline UUIDs:

| Position | Ski Model | UUID |
|----------|-----------|------|
| 1 (0-25%) | CARVE | `c5d6f3ff-e0a8-42e3-8fa3-3ab4f6a6a82c` |
| 2 (25-50%) | PARK | `731fbf35-4ab6-40a4-b7d0-22cd41b67649` |
| 3 (50-75%) | ALLMOUNTAIN | `1057c6ec-57c0-4d4a-bdd0-00999322dd99` |
| 4 (75-100%) | POWDER | `7bf4341d-f8b6-4b99-9ceb-f60a8670aad0` |

## Performance Optimization

### Why This Architecture?
- **Browser Limit:** Maximum 3 high-quality WebGL contexts simultaneously
- **Solution:** Combine 4 skis into 1 scene = 1 context
- **Result:** Perfect quality rendering for all products

### Loading Strategy
1. Global runtime loads once (cached)
2. Scenes load on demand
3. Shared textures/materials between scenes
4. Cloudflare CDN ensures <50ms delivery globally

## Updating Scenes

### To Update Hero Scene (4 skis):
1. Export from Spline with "Responsive" viewport setting
2. Replace `scenes/hero-animation/scene.splinecode`
3. Commit and push:
```bash
git add scenes/hero-animation/*
git commit -m "Update hero scene"
git push
```

### To Update Individual Product:
1. Export from Spline with "Responsive" viewport setting
2. Replace appropriate scene file (e.g., `scenes/1000SKISCARVE/scene.splinecode`)
3. Commit and push:
```bash
git add scenes/1000SKISCARVE/*
git commit -m "Update CARVE ski scene"
git push
```

## Troubleshooting

### Scene Not Rendering
- Check console for `[HOME]` or `[PRODUCT]` logs
- Verify container has `.hero-scene` or `.product-scene` class
- Ensure data attributes are set correctly

### Scene Not Fitting Container
- Verify container has explicit dimensions in Webflow
- Check that Spline scene is exported with "Responsive" viewport
- Container needs `position: relative` if using absolute positioned children

### Rotation Not Working
- Verify trigger zones have correct `data-ski` attributes (0-3)
- Check that `.ski-trigger` elements are positioned correctly
- Console should show "Rotation enabled" message

### Poor Quality on Retina
- Script automatically detects and applies device pixel ratio
- Check console for "Quality optimized" message
- Canvas resolution should be container size × DPR

## GitHub Repository

**Repository:** https://github.com/Alric1000/spline-runtime-pro

**Cloudflare Pages:** Automatically deploys from main branch

**URL:** https://spline-runtime-pro.pages.dev

## Support

For issues or updates, check the console logs which provide detailed debugging information:
- `[HOME]` - Home page 4-ski scene
- `[PRODUCT]` - Individual product scenes
- Look for "✓" checkmarks indicating successful loading