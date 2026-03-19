<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;

class SessionTimeout
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // Check if user is authenticated
        if (Auth::check()) {
            $lastActivity = Session::get('last_activity');
            $currentTime = now();
            
            // 3 hours in seconds = 10800 seconds
            $timeout = 3 * 60 * 60; // 3 hours
            
            if ($lastActivity) {
                $lastActivityTime = \Carbon\Carbon::parse($lastActivity);
                $inactiveTime = $currentTime->diffInSeconds($lastActivityTime);
                
                // If inactive for more than 3 hours, logout
                if ($inactiveTime > $timeout) {
                    Auth::logout();
                    Session::flush();
                    
                    // Redirect to login with timeout message
                    return redirect()->route('login')
                        ->with('message', 'You have been logged out due to 3 hours of inactivity.')
                        ->with('type', 'warning');
                }
            }
            
            // Update last activity time
            Session::put('last_activity', $currentTime);
        }
        
        return $next($request);
    }
}
