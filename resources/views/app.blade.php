<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Favicon -->
        <link rel="icon" href="{{ asset('images/loreforge-logo.jpg') }}" type="image/jpeg">
        <link rel="apple-touch-icon" href="{{ asset('images/loreforge-logo.jpg') }}">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />
        <style>
            /* Prevents flash of content on bfcache restore */
            html { visibility: visible; }
        </style>
        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
        
        @if(auth()->check())
        <script>
            document.addEventListener('DOMContentLoaded', function() {
                console.log('Back prevention script loaded for:', window.location.pathname);
                
                // Lock history immediately on page load
                history.pushState(null, '', window.location.href);
                
                const handlePageShow = (e) => {
                    console.log('pageshow event fired, persisted:', e.persisted);
                    
                    if (e.persisted) {
                        console.log('Cache detected - blocking page and validating session');
                        // Immediately block the page visually
                        document.body.style.display = 'none';
                        document.body.style.opacity = '0';
                        
                        // Then verify with server
                        fetch('/auth/check', {
                            method: 'GET',
                            headers: { 
                                'X-Requested-With': 'XMLHttpRequest',
                                'Accept': 'application/json',
                                'Cache-Control': 'no-cache'
                            },
                            cache: 'no-cache'
                        })
                        .then(res => {
                            console.log('Auth check response:', res.status);
                            if (res.status === 401) {
                                console.log('Session invalid - redirecting to login');
                                window.location.replace('/login'); // replace so they can't go forward either
                            } else {
                                console.log('Session valid - showing page');
                                document.body.style.display = '';
                                document.body.style.opacity = '1';
                                // Re-lock history to prevent further back navigation
                                setTimeout(() => {
                                    history.pushState(null, '', window.location.href);
                                }, 100);
                            }
                        })
                        .catch(error => {
                            console.error('Auth check failed:', error);
                            window.location.replace('/login'); // fail safe
                        });
                    }
                };

                // Multiple event listeners for better reliability
                window.addEventListener('pageshow', handlePageShow);
                
                // Also listen for visibility changes (another cache indicator)
                document.addEventListener('visibilitychange', function() {
                    if (document.visibilityState === 'visible' && document.body.style.display === 'none') {
                        console.log('Page became visible after being hidden - checking session');
                        fetch('/auth/check', {
                            method: 'GET',
                            headers: { 'X-Requested-With': 'XMLHttpRequest' }
                        })
                        .then(res => {
                            if (res.status === 200) {
                                document.body.style.display = '';
                                document.body.style.opacity = '1';
                            }
                        });
                    }
                });
            });
        </script>
        @endif
    </body>
</html>
