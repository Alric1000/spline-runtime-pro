// Canvas Diagnostic Script
// Add this to your page to monitor what's happening with canvas sizing

window.canvasDiagnostic = function(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas ${canvasId} not found`);
        return;
    }

    const dpr = window.devicePixelRatio || 1;

    console.log('=== CANVAS DIAGNOSTIC ===');
    console.log(`Canvas ID: ${canvasId}`);
    console.log(`Device Pixel Ratio: ${dpr}`);

    // Check current dimensions
    const rect = canvas.getBoundingClientRect();
    console.log('CSS/Display dimensions:', {
        width: rect.width,
        height: rect.height,
        computedWidth: canvas.style.width,
        computedHeight: canvas.style.height
    });

    console.log('Canvas buffer dimensions:', {
        width: canvas.width,
        height: canvas.height
    });

    console.log('Expected buffer dimensions:', {
        width: rect.width * dpr,
        height: rect.height * dpr
    });

    const isCorrect = (canvas.width === rect.width * dpr) && (canvas.height === rect.height * dpr);
    console.log(`Pixel ratio correct: ${isCorrect ? '✅ YES' : '❌ NO'}`);

    // Check parent container
    const parent = canvas.parentElement;
    if (parent) {
        const parentRect = parent.getBoundingClientRect();
        console.log('Parent container:', {
            width: parentRect.width,
            height: parentRect.height,
            className: parent.className,
            id: parent.id
        });
    }

    // Monitor changes
    let resizeCount = 0;
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'width' || mutation.attributeName === 'height' || mutation.attributeName === 'style') {
                resizeCount++;
                console.warn(`[RESIZE ${resizeCount}] Canvas ${canvasId} was modified:`, {
                    type: mutation.attributeName,
                    newWidth: canvas.width,
                    newHeight: canvas.height,
                    styleWidth: canvas.style.width,
                    styleHeight: canvas.style.height,
                    shouldBeWidth: rect.width * dpr,
                    shouldBeHeight: rect.height * dpr
                });
            }
        });
    });

    observer.observe(canvas, {
        attributes: true,
        attributeFilter: ['width', 'height', 'style']
    });

    console.log('=== Monitoring canvas for changes ===');

    return {
        fix: function() {
            const rect = canvas.getBoundingClientRect();
            const width = Math.floor(rect.width);
            const height = Math.floor(rect.height);

            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';

            console.log('🔧 Fixed canvas dimensions:', {
                buffer: `${canvas.width}x${canvas.height}`,
                display: `${width}x${height}`
            });
        },
        check: function() {
            const rect = canvas.getBoundingClientRect();
            const correct = (canvas.width === rect.width * dpr);
            console.log(`Canvas ${canvasId}: ${correct ? '✅' : '❌'} (${canvas.width}x${canvas.height} should be ${rect.width * dpr}x${rect.height * dpr})`);
            return correct;
        }
    };
};

// Auto-diagnose all Spline canvases
window.diagnoseAllSplineCanvases = function() {
    const canvases = document.querySelectorAll('[data-spline-scene]');
    const diagnostics = {};

    canvases.forEach(canvas => {
        if (canvas.id) {
            diagnostics[canvas.id] = window.canvasDiagnostic(canvas.id);
        }
    });

    return diagnostics;
};

// Fix all canvases
window.fixAllCanvases = function() {
    const canvases = document.querySelectorAll('[data-spline-scene]');
    canvases.forEach(canvas => {
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        const width = Math.floor(rect.width);
        const height = Math.floor(rect.height);

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';

        console.log(`Fixed ${canvas.id}: ${width * dpr}x${height * dpr}`);
    });
};