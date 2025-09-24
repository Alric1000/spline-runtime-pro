# Spline Scene Setup Guide for Webflow

## Overview
This guide explains the enhanced Spline implementation with proper error handling, runtime verification, and debugging capabilities.

## Key Improvements Made

### 1. Runtime Verification
- Added `verifySplineRuntime()` function that waits up to 5 seconds for the Spline runtime to load
- Prevents scenes from initializing before the runtime is ready
- Provides clear error messages if runtime fails to load

### 2. Enhanced Error Handling
- All scene initialization is now wrapped in try-catch blocks
- Visual error messages appear on screen if scenes fail to load
- Console logging provides detailed debugging information
- Fallback selectors for container elements

### 3. Loading States
- Added CSS classes for loading states: `.spline-loading`, `.spline-loaded`, `.spline-error`
- Visual loading indicators with spinner animation
- User-friendly error messages

### 4. Async Initialization
- Both scenes initialize concurrently for better performance
- Proper Promise handling with `Promise.allSettled()`
- Non-blocking initialization that won't break other scripts

## Required HTML Structure

Your Webflow page needs these container elements:

```html
<!-- For the hero ski scene -->
<div class="hero-scene"></div>

<!-- For the collab scene -->
<div class="hero-colab-scene"></div>
```

### Alternative Container Names
The script will also look for these alternatives:
- `.hero_scene`, `[data-scene="hero"]`, `.spline-hero`
- `.hero_colab_scene`, `[data-scene="collab"]`, `.spline-collab`

## Global Head Code Setup

Add this to your Webflow site's **Settings > Custom Code > Head Code**:

```html
<!--Smootify-->
<script>
window.SmootifyUserOptions = {
  "productsBase": "product",
  "collectionsBase": "collection",
  "vendorsBase": "account",
  "orderPageUrl": "/account/order",
  "selectMarketBasedOnBrowserLanguage": true
}
</script>

<link href="https://cdn.smootify.io/assets/latest/css/index.css" rel="stylesheet" />
<script type="module" src="https://cdn.smootify.io/assets/latest/js/index.js" async defer></script>
<script src="https://cdn.smootify.io/assets/utils/analytics.js" type="fs-cc" fs-cc-categories="analytics"></script>

<!-- Cloudflare/GitHub Spline Runtime -->
<script type="module" src="https://spline-runtime-pro.pages.dev/spline-viewer.js"></script>

<!-- Minimal Spline Styles - Only essential, no layout -->
<style>
/* Make spline viewer responsive to container */
spline-viewer {
    width: 100%;
    height: 100%;
    display: block;
}
</style>

<!--Gorgias Chat Widget-->
<script id="gorgias-chat-widget-install-v3"
    src="https://config.gorgias.chat/bundle-loader/01J1D8FNH1D08VPMKG5Y6HXPT2">
</script>

<!-- Finsweet Attributes -->
<script async type="module"
src="https://cdn.jsdelivr.net/npm/@finsweet/attributes@2/attributes.js"
fs-scrolldisable
></script>
</script>
```

## Debugging Steps

### 1. Check Browser Console
Open browser developer tools (F12) and look for these messages:

**✅ Success messages:**
- `[HOME] ✓ Spline runtime verified`
- `[HOME] ✓ hero scene loaded successfully`
- `[HOME] ✓ Collab scene initialization completed`

**❌ Error messages:**
- `[HOME] ✗ Spline runtime failed to load after 5 seconds`
- `[HOME] No .hero-scene container found - scene will not load`
- `[HOME] ✗ hero scene failed to load:`

### 2. Visual Indicators
- **Loading**: Gray background with "Loading 3D Scene..." text and spinner
- **Error**: Pink background with error message
- **Success**: Transparent background with 3D scene visible

### 3. Common Issues & Solutions

#### Issue: Runtime Not Loading
**Symptoms:** Console shows "Spline runtime failed to load"
**Solutions:**
1. Check if `https://spline-runtime-pro.pages.dev/spline-viewer.js` is accessible
2. Try using the official Spline CDN instead: `https://unpkg.com/@splinetool/viewer@latest/build/spline-viewer.js`
3. Check for network/firewall blocks

#### Issue: Container Not Found
**Symptoms:** Console shows "No .hero-scene container found"
**Solutions:**
1. Verify the HTML elements exist with correct class names
2. Check if elements are created dynamically after page load
3. Use alternative container selectors

#### Issue: Scene Files Not Loading
**Symptoms:** Runtime loads but scenes don't appear
**Solutions:**
1. Verify scene URLs are accessible: 
   - `https://spline-runtime-pro.pages.dev/scenes/hero-animation/scene.splinecode`
   - `https://spline-runtime-pro.pages.dev/scenes/hero-collab/scene.splinecode`
2. Check CORS headers on your CDN
3. Verify scene files are properly exported from Spline

#### Issue: Scenes Work Locally But Not Live
**Symptoms:** Works in Webflow designer but not on published site
**Solutions:**
1. Clear browser cache and hard refresh (Ctrl+F5)
2. Check Webflow's custom code limits
3. Verify all scripts are in the correct locations (head vs body)
4. Check for script conflicts with other Webflow apps

## Performance Optimization

### 1. Scene File Size
- Keep `.splinecode` files under 5MB for good performance
- Optimize textures and reduce polygon count in Spline editor

### 2. Loading Strategy
- Scenes initialize concurrently for faster loading
- Runtime verification prevents premature initialization
- Error boundaries prevent one failed scene from breaking others

### 3. CDN Configuration
Make sure your CDN (`spline-runtime-pro.pages.dev`) has:
- Proper CORS headers
- Fast global distribution
- High availability/uptime

## Testing Checklist

- [ ] Browser console shows no errors
- [ ] Both scenes load within 10 seconds
- [ ] Loading indicators appear and disappear correctly
- [ ] Scenes are interactive (rotation works)
- [ ] Mobile devices load scenes properly
- [ ] Different browsers work (Chrome, Firefox, Safari)
- [ ] Hard refresh doesn't break anything

## Support

If issues persist:
1. Check the browser console for specific error messages
2. Test on different devices/browsers
3. Verify all URLs are accessible
4. Consider using Spline's official CDN as fallback

## Fallback Implementation

If self-hosted runtime continues to fail, you can switch to Spline's official CDN:

```html
<!-- Replace the self-hosted line with: -->
<script type="module" src="https://unpkg.com/@splinetool/viewer@latest/build/spline-viewer.js"></script>
```

And update the scene URLs to your official Spline export URLs.
