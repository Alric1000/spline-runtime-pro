# Spline 3D Scene Optimization Context

## Project Overview
**Goal**: Display 4 Spline 3D ski models on 1000skis.com with perfect quality and performance.

**Critical Issue Discovered**: Browser/WebGL has a hard limit of 3 concurrent high-quality 3D contexts. When 4+ scenes are active, automatic quality degradation occurs (pixelation).

## File Structure
```
/Users/alric/Documents/1000skis/1000SKIS.COM_3.2/OPTIMIZE_1/spline-runtime-pro/
├── runtime.js                    # Modified Spline runtime (attempted pixel ratio fixes)
├── spline-viewer.js              # Official Spline viewer (2.1MB/623KB gzipped)
├── scenes/
│   ├── 1000SKISALLMOUNTAIN/scene.splinecode
│   ├── 1000SKISPARK/scene.splinecode
│   ├── 1000SKSCARVE/scene.splinecode
│   └── 1000SKISPOWDER/scene.splinecode
└── screenshots/                  # To be created for screenshot solution
```

## Hosting Setup
- **CDN**: Cloudflare Pages at `https://spline-runtime-pro.pages.dev`
- **GitHub**: Repository at `https://github.com/Alric1000/spline-runtime-pro`
- **Webflow**: Integration via custom code sections

## What We Discovered

### 1. The 3-Scene Quality Limit
- **Finding**: Exactly 3 Spline scenes can render at high quality simultaneously
- **4th scene** causes WebGL to downgrade quality for all scenes
- **Error observed**: `GL_INVALID_FRAMEBUFFER_OPERATION` when forcing 4 scenes
- **Root cause**: Browser WebGL context resource management

### 2. Pixel Ratio Issues
- Custom runtime wasn't properly handling `devicePixelRatio` for Retina displays
- Spline's official viewer handles this correctly
- Multiple attempts to patch the runtime with pixel ratio fixes
- Issue was secondary to the 3-scene limit

### 3. Canvas Element Architecture
- Webflow doesn't create canvas elements directly
- We use `.spline-container` divs with `data-scene` attributes
- JavaScript dynamically creates `spline-viewer` custom elements

## Solutions Attempted

### 1. Runtime Modifications ❌
- Modified `runtime.js` to force pixel ratio
- Added WebGL renderer interception
- Result: Helped with pixel ratio but didn't solve 4-scene limit

### 2. Aggressive Quality Forcing ❌
- Attempted to force all 4 scenes at high quality
- Multiple render cycle interventions
- Result: Framebuffer errors, WebGL context corruption

### 3. Dynamic Scene Rotation ⚠️
- Show 3 scenes based on viewport visibility
- Hide/show 4th dynamically
- Result: Works but not seamless enough

### 4. Screenshot Placeholder System ✅
- **Most promising approach**
- Pre-capture high-quality screenshots
- Show screenshots by default
- Load 3D on demand (hover/click)

## Current Implementation Status

### Webflow Structure
```html
<!-- In Webflow Designer -->
<div class="spline-container"
     id="allmountain-container"
     data-scene="1000SKISALLMOUNTAIN"
     data-type="All Mountain">
</div>
```

### Global Code Organization
- **Global Head**: Styles + spline-viewer.js loading
- **Global Footer**: Main initialization script
- **Page Code**: Hover effects only

## The Screenshot Solution (Current Focus)

### Why Screenshots Work
1. **Bypasses WebGL limit** - Images don't use WebGL contexts
2. **Instant loading** - No 3D initialization time
3. **Perfect quality** - Screenshots captured at high DPI
4. **SEO friendly** - Search engines see images

### Implementation Plan
1. Capture screenshots of each scene at multiple resolutions
2. Store in GitHub repo (served via Cloudflare CDN)
3. Display screenshots by default
4. Preload 3 3D scenes (hidden)
5. On hover: Seamless swap screenshot → 3D

### Technical Challenges to Solve
1. **Screenshot accuracy**: Must match exact camera angle/position
2. **Responsive sizing**: Screenshots need to match viewport dimensions
3. **Transition smoothness**: Zero flicker during swap
4. **Preload timing**: Balance memory usage vs. responsiveness

## Key Code Patterns

### Container Initialization
```javascript
const containers = document.querySelectorAll('.spline-container');
containers.forEach(container => {
    const sceneName = container.dataset.scene;
    // Create viewer or screenshot
});
```

### Quality Fix Pattern
```javascript
function fixQuality(viewer) {
    const canvas = viewer.shadowRoot?.querySelector('canvas') ||
                  viewer.querySelector('canvas');
    if (canvas) {
        canvas.width = rect.width * devicePixelRatio;
        canvas.height = rect.height * devicePixelRatio;
        // Fix renderer.setPixelRatio()
    }
}
```

### 3-Scene Management
```javascript
const MAX_LIVE_SCENES = 3;
let activeViewers = new Set();

function activateViewer(viewer) {
    if (activeViewers.size >= MAX_LIVE_SCENES) {
        // Deactivate oldest
        const oldest = activeViewers.values().next().value;
        deactivateViewer(oldest);
    }
    activeViewers.add(viewer);
}
```

## Next Steps for New Chat

### Priority 1: Perfect Screenshot System
- [ ] Implement responsive screenshot capture
- [ ] Create seamless hover transitions
- [ ] Optimize preloading strategy
- [ ] Test on various screen sizes

### Priority 2: Performance Optimization
- [ ] Implement intersection observer for smart loading
- [ ] Add WebP format support for smaller files
- [ ] Consider lazy loading with progressive enhancement

### Priority 3: Fallback Strategies
- [ ] Mobile: Show only screenshots, 3D on tap
- [ ] Low-end devices: Detect and limit to 2 concurrent scenes
- [ ] Network: Adaptive quality based on connection speed

## Critical Information
- **Device pixel ratio** must be handled for Retina displays
- **3 concurrent scenes** is the hard limit for quality
- **Spline viewer** custom element is already optimized
- **Screenshots + 3D hybrid** is the most viable solution

## Files to Reference
1. `FINAL-SCREENSHOT-SOLUTION.html` - Latest implementation
2. `capture-screenshots.html` - Tool to generate screenshots
3. `clean-page-code.html` - Current page code structure
4. Scene files in `/scenes/` directory

## Contact/Resources
- GitHub Repo: https://github.com/Alric1000/spline-runtime-pro
- Live CDN: https://spline-runtime-pro.pages.dev
- Webflow Site: https://1000skis.webflow.io

## Final Note
The core issue is a hardware/browser limitation, not a code bug. The solution must work within the constraint of 3 maximum high-quality WebGL contexts. The screenshot hybrid approach provides the best user experience while respecting this limit.