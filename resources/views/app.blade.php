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
            useEffect(() => {
                const handlePageShow = (e) => {
                    if (e.persisted) {
                        // Immediately block the page visually
                        document.body.style.display = 'none';
                        
                        // Then verify with server
                        fetch('/auth/check', {
                            headers: { 'X-Requested-With': 'XMLHttpRequest' }
                        })
                        .then(res => {
                            if (res.status === 401) {
                                window.location.replace('/login'); // replace so they can't go forward either
                            } else {
                                document.body.style.display = ''; // auth ok, show page
                                history.pushState(null, '', window.location.href); // re-lock history
                            }
                        })
                        .catch(() => {
                            window.location.replace('/login'); // fail safe
                        });
                    }
                };

                // Lock history on mount too
                history.pushState(null, '', window.location.href);

                window.addEventListener('pageshow', handlePageShow);
                return () => window.removeEventListener('pageshow', handlePageShow);
            }, []);
        </script>
        @endif
    </body>
</html>
