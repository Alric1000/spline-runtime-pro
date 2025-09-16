# Debug Checklist for Spline Scenes Not Rendering

## Check these in order:

### 1. GLOBAL HEAD CODE (Project Settings → Custom Code → Head)
Should contain:
```html
<style>
spline-viewer {
  width: 100%;
  height: 100%;
  display: block;
}
</style>

<script type="module" src="https://spline-runtime-pro.pages.dev/spline-viewer.js"></script>
```

### 2. GLOBAL FOOTER CODE (Project Settings → Custom Code → Footer)
⚠️ **THIS IS THE MOST IMPORTANT PART** - Should contain:
```html
<script>
document.addEventListener("DOMContentLoaded", function() {
    const CLOUDFLARE_URL = 'https://spline-runtime-pro.pages.dev';

    // Convert all canvas elements to spline-viewer elements
    function initializeSplineViewers() {
        const canvases = document.querySelectorAll('canvas[data-spline-scene]');

        canvases.forEach(canvas => {
            const scenePath = canvas.getAttribute('data-spline-scene');
            if (!scenePath) return;

            // Create spline-viewer element
            const viewer = document.createElement('spline-viewer');
            viewer.setAttribute('url', `${CLOUDFLARE_URL}/scenes/${scenePath}/scene.splinecode`);
            viewer.setAttribute('id', canvas.id);
            viewer.className = canvas.className;

            // Copy all data attributes
            Array.from(canvas.attributes).forEach(attr => {
                if (attr.name.startsWith('data-')) {
                    viewer.setAttribute(attr.name, attr.value);
                }
            });

            // Replace canvas with viewer
            canvas.replaceWith(viewer);
        });

        console.log(`✅ Initialized ${canvases.length} Spline viewers`);
        return canvases.length;
    }

    // Setup lazy loading for performance
    function setupLazyLoading() {
        const viewers = document.querySelectorAll('spline-viewer');
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const maxActive = isMobile ? 2 : 4;
        let activeCount = 0;

        viewers.forEach(viewer => {
            let isLoaded = false;

            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && !isLoaded && activeCount < maxActive) {
                    isLoaded = true;
                    activeCount++;
                    viewer.style.visibility = 'visible';
                    console.log(`Loading scene ${activeCount}/${maxActive}`);
                }
            }, {
                rootMargin: '100px',
                threshold: 0.1
            });

            observer.observe(viewer);

            // Start hidden for lazy loading
            viewer.style.visibility = 'hidden';
        });
    }

    // Initialize
    const count = initializeSplineViewers();
    if (count > 0) {
        setTimeout(setupLazyLoading, 100);
    }
});
</script>
```

### 3. Check Browser Console
Open the browser console and look for:
- `✅ Initialized X Spline viewers` - If you see this, the script is running
- Any error messages
- Type: `document.querySelectorAll('canvas[data-spline-scene]').length` - Should show how many canvas elements exist
- Type: `document.querySelectorAll('spline-viewer').length` - Should show how many viewer elements were created

### 4. Quick Test
Add this to your browser console to manually test the conversion:
```javascript
// Check if canvases exist
const canvases = document.querySelectorAll('canvas[data-spline-scene]');
console.log('Found canvases:', canvases.length);

// Check if spline-viewer custom element is defined
console.log('Spline viewer defined?', customElements.get('spline-viewer'));

// Try manual conversion
if (canvases.length > 0 && customElements.get('spline-viewer')) {
    const canvas = canvases[0];
    const scenePath = canvas.getAttribute('data-spline-scene');
    const viewer = document.createElement('spline-viewer');
    viewer.setAttribute('url', `https://spline-runtime-pro.pages.dev/scenes/${scenePath}/scene.splinecode`);
    canvas.replaceWith(viewer);
    console.log('Manual conversion done!');
}
```

## Common Issues:

1. **Missing Global Footer Code** - The conversion script must be in Project Settings, not Page Settings
2. **Script Load Order** - The spline-viewer.js must load before the conversion script
3. **Canvas Not Found** - Check if your embed code has the correct attributes
4. **Lazy Loading Hiding Elements** - Try removing `viewer.style.visibility = 'hidden';` temporarily

Let me know what you find in the console!