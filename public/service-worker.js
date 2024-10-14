// service-worker.js

self.addEventListener('install', (event) => {
    console.log('Service Worker installing.');
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activated.');
});

self.addEventListener('fetch', (event) => {
    // Intercept requests to your manifest file
    if (event.request.url.includes('manifest.json')) {
        event.respondWith(
            (async () => {
                const url = new URL(event.request.url);
                const path = url.searchParams.get('path');
                const startUrl = path ? path : '/';

                // Define your manifest with a dynamic start_url
                const manifest = {
                    short_name: "7dollar.delivery",
                    name: "7dollar.delivery",
                    start_url: startUrl,
                    display: "standalone",
                    icons: [
                        {
                            src: "favicon.ico",
                            sizes: "64x64 32x32 24x24 16x16",
                            type: "image/x-icon"
                        },
                        {
                            src: "android-chrome-192x192.png",
                            type: "image/png",
                            sizes: "192x192"
                        },
                        {
                            src: "android-chrome-512x512.png",
                            type: "image/png",
                            sizes: "512x512"
                        }
                    ],
                    theme_color: "#000000",
                    background_color: "#ffffff"
                };

                return new Response(JSON.stringify(manifest), {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            })()
        );
    }
});
