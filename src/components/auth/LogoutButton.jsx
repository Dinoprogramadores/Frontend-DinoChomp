import React from 'react';
import { supabase } from '../../config/supabaseClient';
import '../../styles/auth/LogoutButton.css';

const LogoutButton = () => {

    const handleLogout = async () => {
        const { data: sessionData } = await supabase.auth.getSession();

        if (!sessionData.session) {
            console.warn("No active session. Redirecting...");
            window.location.href = '/';
            return;
        }

        const { error } = await supabase.auth.signOut({ scope: 'local' });

        if (error) {
            console.error("Error logging out:", error.message);
        }

        window.location.href = '/';
    };

    return (
        <button onClick={handleLogout} className="logout-button">
            Logout
        </button>
    );
};

export default LogoutButton;