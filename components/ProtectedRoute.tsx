import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import AutoLogout from './AutoLogout';

const ProtectedRoute = () => {
    const [hasSession, setHasSession] = useState<boolean | null>(null);

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setHasSession(!!session);
        };

        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setHasSession(!!session);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (hasSession === null) {
        console.log("ProtectedRoute: Checking session...");
        // Loading state
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!hasSession) {
        console.warn("ProtectedRoute: No session found. Redirecting to /backend.");
        return <Navigate to="/backend" replace />;
    }

    console.log("ProtectedRoute: Session valid. Rendering outlet.");
    return (
        <>
            <AutoLogout />
            <Outlet />
        </>
    );
};

export default ProtectedRoute;
