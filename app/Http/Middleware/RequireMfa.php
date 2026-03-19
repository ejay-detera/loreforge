<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequireMfa
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next)
    {
        $user = auth()->user();

        // Skip MFA check for MFA routes themselves and logout
        $excludedRoutes = ['mfa.setup', 'mfa.verify', 'mfa.check', 'mfa.enable', 'mfa.disable', 'logout', 'login'];
        
        if ($user && $user->two_factor_enabled && !session('mfa_verified') && !in_array($request->route()->getName(), $excludedRoutes)) {
            return redirect()->route('mfa.verify');
        }

        return $next($request);
    }
}
