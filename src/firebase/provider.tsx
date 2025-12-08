
'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener'

// This interface defines the shape of the context state.
interface FirebaseContextState {
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  user: User | null;
  isUserLoading: boolean; // Tracks initial auth check
  error: Error | null;    // Stores any auth error
}

// React Context
export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

/**
 * FirebaseProvider manages and provides Firebase services and user authentication state.
 * This is the heart of the Firebase integration.
 */
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
}) => {
  const [authState, setAuthState] = useState<Omit<FirebaseContextState, 'firebaseApp' | 'firestore' | 'auth'>>({
    user: null,
    isUserLoading: true, // Start in a loading state.
    error: null,
  });

  // This effect runs once to subscribe to Firebase's auth state.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => { 
        // When auth state changes (or on initial load), update our state.
        setAuthState({ user, isUserLoading: false, error: null });
      },
      (error) => {
        // If there's an error with the listener, record it.
        console.error("Firebase Auth Error:", error);
        setAuthState({ user: null, isUserLoading: false, error });
      }
    );
    // Cleanup subscription on unmount
    return () => unsubscribe(); 
  }, [auth]);

  // Memoize the context value to prevent unnecessary re-renders of consumers.
  const contextValue = useMemo((): FirebaseContextState => ({
    firebaseApp,
    firestore,
    auth,
    ...authState,
  }), [firebaseApp, firestore, auth, authState]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};


// --- HOOKS ---
// These hooks provide a safe and convenient way for components to access Firebase services.

function useFirebaseContext() {
    const context = useContext(FirebaseContext);
    if (context === undefined) {
      throw new Error('useFirebase hook must be used within a FirebaseProvider.');
    }
    return context;
}

/** Hook to access the authenticated user's state. */
export const useUser = () => {
    const { user, isUserLoading, error } = useFirebaseContext();
    return { user, isUserLoading, userError: error };
};

/**
 * Hook to access the Firestore instance.
 * **Crucially, it returns null until the initial authentication check is complete.**
 * This prevents other components from trying to use Firestore too early.
 */
export const useFirestore = (): Firestore | null => {
  const { firestore, isUserLoading } = useFirebaseContext();
  return isUserLoading ? null : firestore;
};

/**
 * Hook to access the Firebase Auth instance.
 * Returns null until the initial authentication check is complete.
 */
export const useAuth = (): Auth | null => {
  const { auth, isUserLoading } = useFirebaseContext();
  return isUserLoading ? null : auth;
};

/**
 * Hook to access the Firebase App instance.
 * Returns null until the initial authentication check is complete.
 */
export const useFirebaseApp = (): FirebaseApp | null => {
  const { firebaseApp, isUserLoading } = useFirebaseContext();
  return isUserLoading ? null : firebaseApp;
};

/**
 * A hook for memoizing Firebase queries/references to prevent infinite loops in hooks like useCollection/useDoc.
 * It's essential for performance and stability.
 */
type MemoFirebase <T> = T & {__memo?: boolean};
export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T | (MemoFirebase<T>) {
  const memoized = useMemo(factory, deps);
  if(typeof memoized !== 'object' || memoized === null) return memoized;
  (memoized as MemoFirebase<T>).__memo = true;
  return memoized;
}
