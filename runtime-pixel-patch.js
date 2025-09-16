// AGGRESSIVE PIXEL RATIO PATCH
// Add this at the END of runtime.js

(function() {
    'use strict';

    const dpr = window.devicePixelRatio || 1;
    console.log(`[PIXEL PATCH] Device pixel ratio: ${dpr}`);

    // Override any WebGLRenderer creation
    let originalWebGLRenderer = null;
    let checkCount = 0;

    const interceptWebGLRenderer = () => {
        checkCount++;

        // Look for THREE in various places
        const THREE = window.THREE ||
                     window.SPLINE?.THREE ||
                     (typeof globalThis !== 'undefined' ? globalThis.THREE : null);

        if (THREE && THREE.WebGLRenderer && !originalWebGLRenderer) {
            console.log(`[PIXEL PATCH] Found THREE.WebGLRenderer on attempt ${checkCount}`);
            originalWebGLRenderer = THREE.WebGLRenderer;

            THREE.WebGLRenderer = function(...args) {
                const renderer = new originalWebGLRenderer(...args);

                // Force pixel ratio
                const origSetPixelRatio = renderer.setPixelRatio;
                let pixelRatioSet = false;

                renderer.setPixelRatio = function(value) {
                    // Always use device pixel ratio, ignore passed value
                    console.log(`[PIXEL PATCH] setPixelRatio called with ${value}, forcing ${dpr}`);
                    origSetPixelRatio.call(this, dpr);
                    pixelRatioSet = true;
                    return this;
                };

                // Also force it immediately
                renderer.setPixelRatio(dpr);

                // Override getPixelRatio to always return our value
                renderer.getPixelRatio = function() {
                    return dpr;
                };

                // Patch setSize to maintain pixel ratio
                const origSetSize = renderer.setSize;
                renderer.setSize = function(width, height, updateStyle) {
                    if (!pixelRatioSet) {
                        renderer.setPixelRatio(dpr);
                    }
                    return origSetSize.call(this, width, height, updateStyle);
                };

                console.log(`[PIXEL PATCH] WebGLRenderer created and patched with ratio ${dpr}`);
                return renderer;
            };

            // Copy static properties
            Object.setPrototypeOf(THREE.WebGLRenderer, originalWebGLRenderer);
            Object.setPrototypeOf(THREE.WebGLRenderer.prototype, originalWebGLRenderer.prototype);

            return true;
        }

        if (checkCount < 500) {
            requestAnimationFrame(interceptWebGLRenderer);
        }

        return false;
    };

    // Start intercepting immediately
    interceptWebGLRenderer();

    // Also patch on various events
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', interceptWebGLRenderer);
    }
    window.addEventListener('load', interceptWebGLRenderer);

    // Patch any canvases that get WebGL contexts
    const origGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type, ...args) {
        const ctx = origGetContext.call(this, type, ...args);

        if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') {
            // This is a WebGL context, ensure canvas is high DPI
            const rect = this.getBoundingClientRect();
            const width = Math.floor(rect.width);
            const height = Math.floor(rect.height);

            if (this.width !== width * dpr || this.height !== height * dpr) {
                console.log(`[PIXEL PATCH] Fixing canvas dimensions for WebGL context`);
                this.width = width * dpr;
                this.height = height * dpr;
                this.style.width = width + 'px';
                this.style.height = height + 'px';
            }
        }

        return ctx;
    };

    console.log('[PIXEL PATCH] Aggressive pixel ratio patch installed');
})();