// Tailwind Configuration Script
// Fix oklch color error - disable oklch in Tailwind
if (typeof tailwind !== 'undefined') {
    tailwind.config = {
        corePlugins: {
            preflight: true,
        },
        theme: {
            extend: {}
        }
    };
}

