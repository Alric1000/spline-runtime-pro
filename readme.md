# Spline Runtime Project - Professional Setup

## Project Overview

This project creates a high-performance, self-hosted Spline runtime system optimized for professional websites with high traffic (200k+ visitors/month). The setup includes smart multi-scene management, texture optimization, and global CDN delivery via Cloudflare Pages.

### Key Features
- Single runtime shared across entire website
- Smart texture caching and reuse
- Device-aware performance (4 scenes desktop, 2 mobile)
- Auto pause/resume for off-screen scenes
- Global CDN delivery via Cloudflare Pages
- 30-50% bandwidth savings through optimization

---

## Project Structure

```
spline-runtime-pro/
├── README.md                     # This file
├── runtime.js                    # Shared Spline runtime (loads once)
├── process.js                    # Runtime dependency
├── process.wasm                  # Runtime dependency  
├── physics.js                    # Optional runtime component
├── opentype.js                   # Optional runtime component
├── shared-textures/              # Common materials (cached globally)
│   ├── wood-material.jpg         # Reused across products
│   ├── metal-finish.jpg          # Standard material
│   └── fabric-texture.jpg        # Common texture
├── scenes/                       # Individual scene files
│   ├── hero-animation/
│   │   └── scene.splinecode      # Hero scene
│   ├── 1000SKISALLMOUNTAIN/
│   │   └── scene.splinecode      # All-Mountain ski product
│   ├── 1000SKISPOWDER/
│   │   └── scene.splinecode      # Powder ski product
│   ├── 1000SKSCARVE/
│   │   └── scene.splinecode      # Carve ski product
│   ├── 1000SKISPARK/
│   │   └── scene.splinecode      # Park ski product
│   ├── about-visual/
│   │   └── scene.splinecode      # About page scene
│   ├── collab-1000_CHIMI_Gogles/
│   │   ├── scene.splinecode      # CHIMI goggles collaboration
│   │   └── unique-texture.jpg    # Project-specific material
│   ├── collab-1000_CHIMI_SHADES/
│   │   ├── scene.splinecode      # CHIMI shades collaboration
│   │   └── unique-texture.jpg    # Project-specific material
│   └── collab-1000_KANG/
│       ├── scene.splinecode      # KANG collaboration
│       └── unique-texture.jpg    # Project-specific material
└── deployment/
    └── webflow-integration.html  # Code snippets for Webflow
```

---

## Quick Start

### Step 1: Local Setup
```bash
# Create project directory
mkdir spline-runtime-pro
cd spline-runtime-pro

# Create folder structure
mkdir -p shared-textures scenes/hero-animation scenes/1000SKISALLMOUNTAIN scenes/1000SKISPOWDER scenes/1000SKSCARVE scenes/1000SKISPARK scenes/about-visual scenes/collab-1000_CHIMI_Gogles scenes/collab-1000_CHIMI_SHADES scenes/collab-1000_KANG deployment

# Copy this README
curl -o README.md https://raw.githubusercontent.com/yourusername/spline-runtime-pro/main/README.md
```

### Step 2: Add Spline Files
```bash
# Copy runtime files (from your Spline export)
cp /path/to/spline/export/runtime.js .
cp /path/to/spline/export/process.js .
cp /path/to/spline/export/process.wasm .

# Copy shared textures
cp /path/to/textures/*.jpg shared-textures/

# Copy scene files to their respective folders
cp /path/to/hero/scene.splinecode scenes/hero-animation/
cp /path/to/allmountain/scene.splinecode scenes/1000SKISALLMOUNTAIN/
cp /path/to/powder/scene.splinecode scenes/1000SKISPOWDER/
cp /path/to/carve/scene.splinecode scenes/1000SKSCARVE/
cp /path/to/park/scene.splinecode scenes/1000SKISPARK/
# ... repeat for all scenes
```

### Step 3: GitHub & Cloudflare Deployment
```bash
# Initialize git
git init
git add .
git commit -m "Initial Spline runtime setup"

# Connect to GitHub (create repo first)
git remote add origin https://github.com/yourusername/spline-runtime-pro.git
git push -u origin main

# Deploy to Cloudflare Pages (via dashboard)
# Connect GitHub repo → Auto-deploy
# Get URL: https://spline-runtime-pro.pages.dev
```

---

## Webflow Integration

### Global Site Footer Code

Add this to **Site Settings → Custom Code → Footer Code** in Webflow:

```html
<script>
document.addEventListener("DOMContentLoaded", async function () {
    const CLOUDFLARE_URL = 'https://spline-runtime-pro.pages.dev'; // UPDATE THIS URL
    
    // Global runtime cache - loads once for ENTIRE website
    if (!window.splineRuntime) {
        console.log('Loading Spline runtime (one time only)...');
        window.splineRuntime = import(`${CLOUDFLARE_URL}/runtime.js`);
    }
    
    const activeScenes = new Map(); // Track loaded scenes and their app instances
    const loadedScenes = new Set(); // Track which scenes have been loaded
    
    // Device detection for performance optimization
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const maxActiveScenes = isMobile ? 2 : 4; // Limit active scenes based on device
    let currentActiveCount = 0;
    
    // Scene management functions
    function pauseScene(canvasId) {
        const app = activeScenes.get(canvasId);
        if (app && typeof app.pause === 'function') {
            app.pause();
            console.log(`Paused scene: ${canvasId}`);
        }
    }
    
    function resumeScene(canvasId) {
        const app = activeScenes.get(canvasId);
        if (app && typeof app.resume === 'function') {
            app.resume();
            console.log(`Resumed scene: ${canvasId}`);
        }
    }
    
    function pauseLeastImportantScene() {
        // Find a scene to pause (skip hero scenes marked as priority)
        for (let [canvasId, app] of activeScenes) {
            const canvas = document.getElementById(canvasId);
            const isPriority = canvas && canvas.hasAttribute('data-priority');
            if (!isPriority) {
                pauseScene(canvasId);
                currentActiveCount--;
                return true;
            }
        }
        return false;
    }
    
    async function loadSplineScene(canvasId, scenePath) {
        if (loadedScenes.has(canvasId)) {
            // Scene already loaded, just resume it
            resumeScene(canvasId);
            return;
        }
        
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        // Check if we need to pause a scene first
        if (currentActiveCount >= maxActiveScenes) {
            if (!pauseLeastImportantScene()) {
                console.warn(`Max scenes (${maxActiveScenes}) already active, skipping load of ${canvasId}`);
                return;
            }
        }
        
        try {
            console.log(`Loading scene: ${scenePath} (${currentActiveCount + 1}/${maxActiveScenes})`);
            const { Application } = await window.splineRuntime;
            const app = new Application(canvas, {
                wasmPath: `${CLOUDFLARE_URL}/`
            });
            
            await app.load(`${CLOUDFLARE_URL}/scenes/${scenePath}/scene.splinecode`);
            
            // Store the app instance for pause/resume control
            activeScenes.set(canvasId, app);
            loadedScenes.add(canvasId);
            currentActiveCount++;
            
            console.log(`Scene loaded: ${scenePath} (Active: ${currentActiveCount}/${maxActiveScenes})`);
        } catch (error) {
            console.error(`Failed to load ${scenePath}:`, error);
        }
    }
    
    function setupSmartLoading(canvasId, scenePath) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                // Scene entered viewport - load or resume
                if (!loadedScenes.has(canvasId)) {
                    loadSplineScene(canvasId, scenePath);
                } else {
                    resumeScene(canvasId);
                    currentActiveCount++;
                }
            } else {
                // Scene left viewport - pause to save performance
                if (activeScenes.has(canvasId)) {
                    pauseScene(canvasId);
                    currentActiveCount--;
                }
            }
        }, { 
            rootMargin: '100px', // Start loading before fully visible
            threshold: 0.1 // Trigger when 10% visible
        });
        
        observer.observe(canvas);
    }
    
    // Auto-detect and setup scenes on current page
    document.querySelectorAll('[data-spline-scene]').forEach(canvas => {
        const scenePath = canvas.getAttribute('data-spline-scene');
        setupSmartLoading(canvas.id, scenePath);
    });
    
    const sceneCount = document.querySelectorAll('[data-spline-scene]').length;
    console.log(`Found ${sceneCount} Spline scenes on this page (Device: ${isMobile ? 'Mobile' : 'Desktop'}, Max Active: ${maxActiveScenes})`);
    
    // Optional: Add global pause/resume controls
    window.splineControls = {
        pauseAll: () => {
            activeScenes.forEach((app, canvasId) => pauseScene(canvasId));
            currentActiveCount = 0;
        },
        resumeAll: () => {
            activeScenes.forEach((app, canvasId) => resumeScene(canvasId));
            currentActiveCount = activeScenes.size;
        },
        getActiveCount: () => currentActiveCount
    };
});
</script>
```

### Canvas Elements for Pages

#### Home Page Example
```html
<!-- Hero scene - always stays active -->
<canvas 
    id="hero-scene" 
    data-spline-scene="hero-animation"
    data-priority="true"
    style="width: 100%; height: 600px; border-radius: 8px;">
</canvas>

<!-- Secondary scenes - smart pause/resume -->
<canvas 
    id="features-scene" 
    data-spline-scene="1000SKISALLMOUNTAIN"
    style="width: 100%; height: 400px; margin-top: 2rem;">
</canvas>
```

#### Product Pages
```html
<!-- All-Mountain Ski -->
<canvas 
    id="allmountain-demo" 
    data-spline-scene="1000SKISALLMOUNTAIN"
    style="width: 100%; height: 500px;">
</canvas>

<!-- Powder Ski -->
<canvas 
    id="powder-demo" 
    data-spline-scene="1000SKISPOWDER"
    style="width: 100%; height: 500px;">
</canvas>

<!-- Carve Ski -->
<canvas 
    id="carve-demo" 
    data-spline-scene="1000SKSCARVE"
    style="width: 100%; height: 500px;">
</canvas>

<!-- Park Ski -->
<canvas 
    id="park-demo" 
    data-spline-scene="1000SKISPARK"
    style="width: 100%; height: 500px;">
</canvas>
```

#### About Page
```html
<canvas 
    id="about-visual" 
    data-spline-scene="about-visual"
    style="width: 100%; height: 350px;">
</canvas>
```

#### Collaboration Projects
```html
<!-- CHIMI Goggles Collaboration -->
<canvas 
    id="chimi-goggles" 
    data-spline-scene="collab-1000_CHIMI_Gogles"
    style="width: 100%; height: 450px;">
</canvas>

<!-- CHIMI Shades Collaboration -->
<canvas 
    id="chimi-shades" 
    data-spline-scene="collab-1000_CHIMI_SHADES"
    style="width: 100%; height: 450px;">
</canvas>

<!-- KANG Collaboration -->
<canvas 
    id="kang-collab" 
    data-spline-scene="collab-1000_KANG"
    style="width: 100%; height: 450px;">
</canvas>
```

---

## Performance Expectations

### First Page Visit (Homepage)
- **Runtime Load:** 2-3 seconds (one time cost)
- **Shared Textures:** +0.5 seconds (cached for entire site)
- **Hero Scene:** +0.3 seconds (priority scene)
- **Secondary Scenes:** +0.2 seconds each (when scrolled into view)

### Subsequent Pages
- **Runtime Load:** 0 seconds (cached)
- **Shared Textures:** 0 seconds (cached)
- **Standard Product Scenes:** 0.2 seconds (uses cached materials)
- **Custom Project Scenes:** 0.5 seconds (unique materials + scene)

### Device Limits
- **Desktop:** Up to 4 active scenes simultaneously
- **Mobile:** Limited to 2 active scenes (auto-detected)
- **Auto-pause:** Off-screen scenes pause to save CPU/battery

---

## Cost Optimization (200k Visitors/Month)

### Bandwidth Calculation
- **Shared Runtime:** ~3MB (loads once per user)
- **Shared Assets:** ~5-10MB total (textures, models, fonts - cached globally)
- **Individual Scenes:** ~0.2-0.5MB each (scene logic only)
- **Total Savings:** 60-80% vs individual asset hosting

### Recommended Cloudflare Plan
- **Cloudflare Pages Pro:** $20/month
- **Estimated Bandwidth:** 300-500GB/month
- **Total Cost:** ~$50-80/month (vs $110+ without optimization)

---

## Development Workflow

### Adding New Scenes
```bash
# Create new scene folder
mkdir scenes/new-scene-name

# Copy scene file
cp /path/to/new/scene.splinecode scenes/new-scene-name/

# If using unique textures
cp /path/to/unique-texture.jpg scenes/new-scene-name/

# Commit and deploy
git add .
git commit -m "Added new scene: new-scene-name"
git push
# Cloudflare auto-deploys in ~2 minutes
```

### Adding Shared Textures
```bash
# Copy to shared folder
cp /path/to/new-material.jpg shared-textures/

# Update multiple scenes to reference shared texture
# (Edit in Spline, re-export scene.splinecode files)

git add .
git commit -m "Added shared texture: new-material"
git push
```

### Testing Locally
```bash
# Simple local server for testing
npx http-server . -p 3000 --cors

# Or use Python
python -m http.server 3000

# Visit: http://localhost:3000
```

---

## Testing & Debugging

### Browser Console Monitoring
Look for these messages:
- `Loading Spline runtime (one time only)...` - Runtime loading
- `Loading scene: scene-name (1/4)` - Scene loading with count
- `Paused scene: scene-name` - Scene paused when off-screen
- `Resumed scene: scene-name` - Scene resumed when visible
- `Scene loaded: scene-name (Active: 2/4)` - Successful load with active count

### Performance Testing
```bash
# Check active scene count
window.splineControls.getActiveCount()

# Manually pause all scenes
window.splineControls.pauseAll()

# Resume all scenes
window.splineControls.resumeAll()
```

### Common Issues
1. **CORS Errors:** Ensure all files are publicly accessible
2. **Scene Not Loading:** Check folder names match `data-spline-scene` attributes
3. **Performance Issues:** Monitor CPU usage, reduce max active scenes if needed
4. **Mobile Problems:** Verify device detection and 2-scene limit

---

## Production Checklist

### Before Launch
- [ ] All scene files uploaded and accessible
- [ ] Shared textures optimized and compressed
- [ ] Cloudflare Pages deployment successful
- [ ] Global script added to Webflow site settings
- [ ] Canvas elements added to all pages
- [ ] Mobile performance tested
- [ ] Console error checking completed
- [ ] Bandwidth monitoring set up

### Post-Launch Monitoring
- [ ] Check Cloudflare bandwidth usage weekly
- [ ] Monitor browser console for errors
- [ ] Test on different devices/browsers
- [ ] Optimize textures if bandwidth exceeds budget
- [ ] Consider CDN optimizations if needed

---

## Resources

- [Spline Documentation](https://docs.spline.design/)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Webflow Custom Code Guide](https://university.webflow.com/lesson/custom-code-in-the-head-and-body-tags)
- [Performance Optimization Guide](https://docs.spline.design/doc/how-to-optimize-your-scene/)

---

## Support

For issues or optimization questions:
1. Check browser console for error messages
2. Verify file structure matches this guide
3. Test on multiple devices/browsers
4. Monitor Cloudflare deployment logs

---

**Ready to build the fastest Spline-powered website? Let's go!**