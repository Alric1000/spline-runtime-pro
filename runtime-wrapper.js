/**
 * Runtime Wrapper - Forces proper pixel ratio without aggressive polling
 * Load this BEFORE your scene loading code
 */

// Wait for runtime to load then patch it
async function initSplineWithPixelRatio() {
    const CLOUDFLARE_URL = 'https://spline-runtime-pro.pages.dev';

    // Import the runtime
    const runtime = await import(`${CLOUDFLARE_URL}/runtime.js`);

    // Wrap the Application class
    const OriginalApplication = runtime.Application;

    runtime.Application = class extends OriginalApplication {
        constructor(canvas, options = {}) {
            // Force pixel ratio in options
            options.pixelRatio = window.devicePixelRatio || 1;
            options.antialias = true;

            // Call parent constructor
            super(canvas, options);

            // Store canvas reference
            this._canvas = canvas;
            this._dpr = window.devicePixelRatio || 1;
        }

        async load(url) {
            // Call parent load
            const result = await super.load(url);

            // After load, ensure pixel ratio is set
            this._ensurePixelRatio();

            return result;
        }

        _ensurePixelRatio() {
            // Find renderer through various paths
            const renderer = this._scene?._renderer ||
                           this.renderer ||
                           this._renderer;

            if (renderer && renderer.setPixelRatio) {
                renderer.setPixelRatio(this._dpr);

                // Update canvas size
                const rect = this._canvas.getBoundingClientRect();
                const width = Math.floor(rect.width);
                const height = Math.floor(rect.height);

                this._canvas.width = width * this._dpr;
                this._canvas.height = height * this._dpr;
                this._canvas.style.width = width + 'px';
                this._canvas.style.height = height + 'px';

                renderer.setSize(width, height, false);

                console.log(`[Runtime Wrapper] Set pixel ratio: ${this._dpr}`);
            }
        }
    };

    return runtime;
}

// Make it globally available
window.getSplineRuntime = initSplineWithPixelRatio;