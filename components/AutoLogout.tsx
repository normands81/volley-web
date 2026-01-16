import React, { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

const AUTO_LOGOUT_TIME = 10 * 60 * 1000; // 10 minutes in milliseconds

const AutoLogout: React.FC = () => {
    const navigate = useNavigate();
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const handleLogout = useCallback(async () => {
        try {
            await supabase.auth.signOut();
            navigate('/backend');
        } catch (error) {
            console.error('Error signing out due to inactivity:', error);
            navigate('/backend'); // Navigate anyway
        }
    }, [navigate]);

    const resetTimer = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(handleLogout, AUTO_LOGOUT_TIME);
    }, [handleLogout]);

    useEffect(() => {
        // Events to monitor
        const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

        // Initial set
        resetTimer();

        // Add listeners
        events.forEach((event) => {
            window.addEventListener(event, resetTimer);
        });

        // Cleanup
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            events.forEach((event) => {
                window.removeEventListener(event, resetTimer);
            });
        };
    }, [resetTimer]);

    return null; // This component doesn't render anything
};

export default AutoLogout;
