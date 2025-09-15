;(function() {
    'use strict';
    const dpr = window.devicePixelRatio || 1;
    console.log('[PIXEL PATCH] Device pixel ratio: ' + dpr);

    let originalWebGLRenderer = null;
    let checkCount = 0;

    const interceptWebGLRenderer = function() {
        checkCount++;
        const THREE = window.THREE || (window.SPLINE ? window.SPLINE.THREE : null);

        if (THREE && THREE.WebGLRenderer && !originalWebGLRenderer) {
            console.log('[PIXEL PATCH] Found THREE.WebGLRenderer on attempt ' + checkCount);
            originalWebGLRenderer = THREE.WebGLRenderer;

            THREE.WebGLRenderer = function() {
                const renderer = new originalWebGLRenderer(...arguments);

                const origSetPixelRatio = renderer.setPixelRatio;
                renderer.setPixelRatio = function(value) {
                    console.log('[PIXEL PATCH] Forcing pixel ratio to ' + dpr);
                    return origSetPixelRatio.call(this, dpr);
                };

                renderer.setPixelRatio(dpr);
                renderer.getPixelRatio = function() { return dpr; };

                const origSetSize = renderer.setSize;
                renderer.setSize = function(width, height, updateStyle) {
                    renderer.setPixelRatio(dpr);
                    return origSetSize.call(this, width, height, updateStyle);
                };

                console.log('[PIXEL PATCH] WebGLRenderer patched');
                return renderer;
            };

            Object.setPrototypeOf(THREE.WebGLRenderer, originalWebGLRenderer);
            Object.setPrototypeOf(THREE.WebGLRenderer.prototype, originalWebGLRenderer.prototype);
            return true;
        }

        if (checkCount < 500) {
            requestAnimationFrame(interceptWebGLRenderer);
        }
        return false;
    };

    interceptWebGLRenderer();
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', interceptWebGLRenderer);
    }
    window.addEventListener('load', interceptWebGLRenderer);

    const origGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type) {
        const ctx = origGetContext.apply(this, arguments);
        if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') {
            const rect = this.getBoundingClientRect();
            const width = Math.floor(rect.width);
            const height = Math.floor(rect.height);
            if (this.width !== width * dpr || this.height !== height * dpr) {
                console.log('[PIXEL PATCH] Fixing canvas dimensions');
                this.width = width * dpr;
                this.height = height * dpr;
                this.style.width = width + 'px';
                this.style.height = height + 'px';
            }
        }
        return ctx;
    };

    console.log('[PIXEL PATCH] Installed');
})();
window.SPLINE_PIXEL_RATIO_FIXED = true;