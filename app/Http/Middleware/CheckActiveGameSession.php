<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckActiveGameSession
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $activeSession = null;

        if ($user) {
            // Check for active game session
            $activeSession = $user->gameSessions()
                ->where('status', 'active')
                ->first();
        }

        // Share the active session with all views
        view()->share('activeSession', $activeSession);

        return $next($request);
    }
}
