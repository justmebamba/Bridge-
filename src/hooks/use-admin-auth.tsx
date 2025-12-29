
'use client';

import { useAuth } from './use-auth';
import { useMemo } from 'react';

export const useAdminAuth = () => {
    const { adminUser, firebaseUser, isLoading } = useAuth();

    const isAdmin = useMemo(() => {
        return !!adminUser && adminUser.isVerified;
    }, [adminUser]);

    const isMainAdmin = useMemo(() => {
        return isAdmin && adminUser.isMainAdmin;
    }, [isAdmin, adminUser]);

    return {
        adminUser,
        firebaseUser,
        isLoading,
        isAdmin,
        isMainAdmin,
    };
};
