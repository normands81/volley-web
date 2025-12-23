import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

const AuthCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleHash = async () => {
            // HashRouter can result in URLs like: http://localhost/#/path#access_token=...
            // or http://localhost/#access_token=... (if no path)
            // We search the ENTIRE href for the token, not just the last hash.
            const url = window.location.href;

            if (url.includes('access_token=') && url.includes('refresh_token=')) {
                console.log("AuthCallback: Token detected in URL. Attempting manual setSession.");

                try {
                    // Attempt to extract tokens regardless of where they are
                    const accessTokenMatch = url.match(/access_token=([^&]+)/);
                    const refreshTokenMatch = url.match(/refresh_token=([^&]+)/);

                    if (accessTokenMatch && refreshTokenMatch) {
                        const access_token = accessTokenMatch[1];
                        const refresh_token = refreshTokenMatch[1];

                        const { data, error } = await supabase.auth.setSession({
                            access_token,
                            refresh_token
                        });

                        if (error) {
                            console.error("Manual setSession failed:", error);
                        } else if (data.session) {
                            console.log("Manual setSession success:", data.session);
                            navigate('/update-password');
                        }
                    }
                } catch (e) {
                    console.error("AuthCallback error:", e);
                }
            } else {
                // If standard Supabase logic worked (or if we already have session)
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    // Check if we are on a recovery flow path but somehow not redirected
                    // navigate('/update-password'); // Optional: only if we want to force it
                }
            }
        };

        handleHash();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log("Auth State ChangeEvent:", event);
            if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
                // Force redirect if this looks like a recovery flow
                if (window.location.hash.includes('type=recovery') || event === 'PASSWORD_RECOVERY') {
                    navigate('/update-password');
                }
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [navigate]);

    return null;
};

export default AuthCallback;
