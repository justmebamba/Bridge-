
// In a real application, this would be replaced by a proper authentication hook (e.g., from Firebase Auth, NextAuth.js, etc.)
// For this mock implementation, we'll simulate a logged-in user using localStorage.

import { useState, useEffect } from 'react';

interface MockUser {
  uid: string;
  email: string;
  displayName: string;
}

export function useMockUser() {
  const [user, setUser] = useState<MockUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This effect runs on the client side.
    try {
      const storedUser = localStorage.getItem('mockUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('mockUser');
    } finally {
      setIsLoading(false);
    }
    
    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'mockUser') {
            const storedUser = event.newValue;
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            } else {
                setUser(null);
            }
        }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };

  }, []);

  return { user, isLoading };
}
