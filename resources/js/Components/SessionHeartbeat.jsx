import { useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';

/**
 * SessionHeartbeat Component
 * 
 * Periodically pings the server to keep the session alive and prevent 419 errors.
 * It also updates the 'last_activity' timestamp used by the SessionTimeout middleware.
 */
const SessionHeartbeat = () => {
    const { props } = usePage();
    const user = props.auth?.user;
    const intervalRef = useRef(null);
    const lastPingRef = useRef(Date.now());
    
    // Ping every 5 minutes (300,000 ms)
    // Laravel session lifetime is usually 120 minutes, so 5 mins is plenty safe.
    const PING_INTERVAL = 5 * 60 * 1000; 

    const ping = async () => {
        try {
            const response = await fetch('/update-activity', {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                },
            });

            if (response.status === 401 || response.status === 419) {
                console.warn('Session expired or unauthorized during heartbeat. Reloading...');
                window.location.reload();
                return;
            }

            if (!response.ok) {
                console.error('Heartbeat failed:', response.status);
            } else {
                lastPingRef.current = Date.now();
                // console.log('Session heartbeat successful');
            }
        } catch (error) {
            console.error('Error during session heartbeat:', error);
        }
    };

    useEffect(() => {
        if (!user) return;

        // Initial ping on mount
        ping();

        // Set up interval
        intervalRef.current = setInterval(ping, PING_INTERVAL);

        // Also ping when the tab becomes visible again after being hidden
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                const now = Date.now();
                // If more than 2 minutes have passed since last ping, ping now
                if (now - lastPingRef.current > 2 * 60 * 1000) {
                    ping();
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [user]);

    return null; // This component doesn't render anything
};

export default SessionHeartbeat;
