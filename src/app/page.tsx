import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, CheckCircle } from 'lucide-react';

// Using a custom SVG for Google icon as it's not in lucide-react
const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C43.021,36.251,44,30.651,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
  </svg>
);

// Using a custom SVG for Facebook icon.
const FacebookIcon = () => (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22,12c0-5.52-4.48-10-10-10S2,6.48,2,12c0,4.99,3.66,9.13,8.44,9.88V15.5H8.31v-3.5h2.13V9.69c0-2.11,1.26-3.26,3.16-3.26 c0.9,0,1.84,0.16,1.84,0.16v2.97h-1.5c-1.05,0-1.39,0.62-1.39,1.34v1.56h3.33l-0.52,3.5H14.5v6.38C19.34,21.13,22,16.99,22,12z" />
    </svg>
)

export default function LoginPage() {
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
          <CardTitle className="text-2xl font-semibold">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to continue your journey of self-improvement.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button asChild className="w-full" size="lg">
              <Link href="/dashboard">
                <GoogleIcon />
                Continue with Google
              </Link>
            </Button>
            <Button asChild variant="secondary" className="w-full bg-blue-600 text-white hover:bg-blue-700" size="lg">
              <Link href="/dashboard">
                <FacebookIcon />
                Continue with Facebook
              </Link>
            </Button>
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
