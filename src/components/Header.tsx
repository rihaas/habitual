'use client';

import Link from 'next/link';
import { Target } from 'lucide-react';

export function AppHeader() {

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center px-4 sm:px-6 md:px-8">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Target className="h-6 w-6 text-primary" />
          <span className="font-bold font-headline sm:inline-block text-xl">
            Habitual
          </span>
        </Link>
      </div>
    </header>
  );
}
