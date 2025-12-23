import { useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

const AuthCallback = () => {
    useEffect(() => {
        const handleHash = async () => {
            // Check if the current URL contains a hash with access_token (Supabase redirect)
            // Example: .../#access_token=...&refresh_token=...&type=recovery
            const hash = window.location.hash;

            if (hash && hash.includes('access_token')) {
                // Remove the '#' if present at the start for parsing, BUT
                // HashRouter uses #/path, and Supabase appends #access_token to the existing hash or as a new hash.
                // If the URL is http://localhost:3000/#/update-password#access_token=... (double hash issue),
                // browsers might handle it weirdly.

                // Supabase usually redirects to: Site URL + #access_token=...
                // If Site URL is http://localhost:3000/volley/, then it goes to http://localhost:3000/volley/#access_token=...

                // We attempt to let supabase client parse it.
                // But sometimes we need to manually extract it if the router clears it.

                const { data, error } = await supabase.auth.getSession();
                if (data.session) {
                    console.log("Session recovered via AuthCallback:", data.session);
                } else {
                    console.warn("AuthCallback: Hash present but no session found yet.");
                }
            }
        };

        handleHash();

        // Also listen for auth state changes globally here
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY') {
                console.log("Auth State Change:", event, session);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return null; // This component handles side effects only
};

export default AuthCallback;
