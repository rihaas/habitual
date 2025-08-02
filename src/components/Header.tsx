'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Target, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from './ThemeToggle';

export function AppHeader() {
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = () => {
    sessionStorage.removeItem('isLoggedIn');
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 md:px-8">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <Target className="h-6 w-6 text-primary" />
          <span className="font-bold font-headline sm:inline-block text-xl">
            Habitual
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
