import React from 'react';
import { supabase } from '../../config/supabaseClient';
import '../../styles/auth/LogoutButton.css';

const LogoutButton = () => {

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error logging out:', error);
        } else {
            // Forzar la recarga para limpiar cualquier estado y asegurar que el usuario es redirigido
            window.location.href = '/';
        }
    };

    return (
        <button onClick={handleLogout} className="logout-button">
            Logout
        </button>
    );
};

export default LogoutButton;

