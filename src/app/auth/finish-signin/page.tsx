'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function FinishSignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [status, setStatus] = React.useState('Verifying...');

  React.useEffect(() => {
    const signIn = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
          // This can happen if the user opens the link on a different device.
          // We can ask them to provide their email again.
          // For simplicity, we'll show an error.
          setStatus('Email not found. Please try signing in again from the same device.');
          toast({
            title: 'Authentication Error',
            description: 'Your email could not be verified. Please try signing in again.',
            variant: 'destructive',
          });
          router.push('/');
          return;
        }

        try {
          await signInWithEmailLink(auth, email, window.location.href);
          window.localStorage.removeItem('emailForSignIn');
          setStatus('Sign-in successful! Redirecting...');
          router.push('/dashboard');
        } catch (error) {
          console.error('Sign-in link error:', error);
          setStatus('Invalid or expired sign-in link.');
           toast({
            title: 'Authentication Error',
            description: 'The sign-in link is invalid or has expired. Please try again.',
            variant: 'destructive',
          });
          router.push('/');
        }
      } else {
        setStatus('Invalid sign-in link.');
        toast({
            title: 'Authentication Error',
            description: 'This is not a valid sign-in link.',
            variant: 'destructive',
        });
        router.push('/');
      }
    };

    signIn();
  }, [router, toast]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>Completing Sign-In</CardTitle>
          <CardDescription>Please wait while we securely sign you in.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4 p-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">{status}</p>
        </CardContent>
      </Card>
    </div>
  );
}
