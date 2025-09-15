/**
 * MANUAL PIXEL RATIO FIX
 * Add this to your Webflow custom code AFTER creating the Spline app
 */

function forcePixelRatio(app, canvas) {
    const dpr = window.devicePixelRatio || 1;
    console.log(`[Manual Fix] Attempting to fix pixel ratio: ${dpr}`);

    // Method 1: Direct renderer access
    const tryPaths = [
        () => app._scene?._renderer,
        () => app.renderer,
        () => app._renderer,
        () => app.scene?.renderer,
        () => app._spline?._scene?._renderer,
        () => app._runtime?._renderer,
        () => app.spline?.renderer
    ];

    let renderer = null;
    for (const getPath of tryPaths) {
        try {
            renderer = getPath();
            if (renderer) break;
        } catch (e) {}
    }

    if (renderer && renderer.setPixelRatio) {
        console.log('[Manual Fix] Found renderer, setting pixel ratio');
        renderer.setPixelRatio(dpr);

        // Also update canvas size
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';

        renderer.setSize(rect.width, rect.height, false);

        console.log('[Manual Fix] Pixel ratio applied successfully');
        return true;
    }

    // Method 2: Try to access through canvas context
    const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
    if (gl) {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';

        console.log('[Manual Fix] Updated canvas dimensions for WebGL context');
        return true;
    }

    console.warn('[Manual Fix] Could not find renderer');
    return false;
}

// Export for use in Webflow
window.forceSplinePixelRatio = forcePixelRatio;

// Also create an auto-fix version
window.autoFixPixelRatio = function(app, canvas) {
    // Try immediately
    forcePixelRatio(app, canvas);

    // Try again after delays
    setTimeout(() => forcePixelRatio(app, canvas), 100);
    setTimeout(() => forcePixelRatio(app, canvas), 500);
    setTimeout(() => forcePixelRatio(app, canvas), 1000);
    setTimeout(() => forcePixelRatio(app, canvas), 2000);
};