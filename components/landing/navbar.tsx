'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();
  }, [supabase]);

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">L</span>
          </div>
          <span className="text-xl font-semibold">Loxys</span>
        </Link>
        
        <div className="flex items-center gap-2 md:gap-4">
          {isAuthenticated ? (
            <Button 
              onClick={() => router.push('/dashboard')} 
              variant="default"
              size="sm"
              className="text-sm"
            >
              <span className="hidden sm:inline">Go to Dashboard</span>
              <span className="sm:hidden">Dashboard</span>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild size="sm" className="text-sm">
                <Link href="/auth/signup">
                  <span className="hidden sm:inline">Get Started</span>
                  <span className="sm:hidden">Sign Up</span>
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

