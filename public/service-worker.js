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
                    short_name: "React App",
                    name: "Create React App Sample",
                    start_url: startUrl,
                    display: "standalone",
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
