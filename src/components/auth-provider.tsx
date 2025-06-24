// src/components/auth-provider.tsx
"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';

type AuthContextType = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

// A list of public paths that don't require authentication.
const publicPaths = ['/', '/signup'];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return; // Don't redirect until auth state is confirmed

    const pathIsPublic = publicPaths.includes(pathname);

    if (!user && !pathIsPublic) {
      router.push('/'); // If not logged in and not on a public page, redirect to login
    } else if (user && pathIsPublic) {
      router.push('/dashboard'); // If logged in and on a public page, redirect to dashboard
    }

  }, [user, loading, pathname, router]);


  // While loading, or if we are about to redirect, show a loader.
  // This prevents flashing the wrong page.
  const pathIsPublic = publicPaths.includes(pathname);
  if (loading || (!user && !pathIsPublic) || (user && pathIsPublic)) {
     return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
        </div>
    )
  }

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
