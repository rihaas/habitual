'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, CheckCircle, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { sendSignInLink } from '@/app/auth/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';


const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C43.021,36.251,44,30.651,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
  </svg>
);

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '' },
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (error) {
      toast({
        title: 'Authentication Error',
        description: 'Failed to sign in with Google. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleEmailSignIn = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      await sendSignInLink(values.email);
      toast({
        title: 'Check your email',
        description: `We've sent a sign-in link to ${values.email}.`,
      });
      // Store email in local storage to retrieve after redirect
      window.localStorage.setItem('emailForSignIn', values.email);
      form.reset();
    } catch (error: any) {
        toast({
            title: 'Authentication Error',
            description: error.message || 'An unexpected error occurred.',
            variant: 'destructive',
          });
    } finally {
        setIsSubmitting(false);
    }
  };


  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 font-body">
      <div className="absolute top-0 left-0 w-full h-full bg-primary/10 blur-3xl -z-10"></div>
      <Card className="w-full max-w-md shadow-2xl shadow-primary/10">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Target className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-headline font-bold text-gray-800">
              Habitual
            </h1>
          </div>
          <CardTitle className="text-2xl font-semibold">Welcome</CardTitle>
          <CardDescription>
            Sign in or create an account to start your journey.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={handleGoogleSignIn} className="w-full" size="lg">
              <GoogleIcon />
              Continue with Google
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleEmailSignIn)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                   <Mail className="mr-2 h-4 w-4" />
                   {isSubmitting ? "Sending link..." : "Continue with Email"}
                </Button>
              </form>
            </Form>
          </div>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>By continuing, you agree to our Terms of Service.</p>
          </div>
        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-muted-foreground">
        <div className="flex items-center justify-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <p>Build better habits. Build a better you.</p>
        </div>
      </footer>
    </div>
  );
}
