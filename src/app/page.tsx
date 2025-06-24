"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Target, LoaderCircle } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, googleProvider, signInWithPopup } from "@/lib/firebase";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.9 2.04-5.07 2.04-4.37 0-7.92-3.5-7.92-7.82s3.55-7.82 7.92-7.82c2.48 0 4.02 1.02 4.9 1.9l-2.6 2.52c-.74-.7-1.8-1.18-3.23-1.18-2.9 0-5.22 2.3-5.22 5.2s2.32 5.2 5.22 5.2c3.23 0 4.66-2.18 4.88-3.35h-5.05v-3.28h7.84c.12.5.2 1 .2 1.62 0 4.5-2.95 7.6-7.95 7.6-4.4 0-8.1-3.6-8.1-8s3.7-8 8.1-8c4.2 0 7.4 2.9 7.4 7.62 0 .6-.08 1.2-.2 1.78z"
      />
    </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      router.push("/dashboard");
    } catch (error: any) {
        let description = "Please check your email and password and try again.";
        switch(error.code) {
            case 'auth/api-key-not-valid':
                description = "Your Firebase API key is invalid. Please check your .env file and make sure you've correctly copied your project's credentials from the Firebase console.";
                break;
            case 'auth/invalid-credential':
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                description = "Invalid credentials. Please check your email and password.";
                break;
            default:
                console.error("Login Error:", error);
                description = "An unexpected error occurred. Please try again."
        }
        toast({
            variant: "destructive",
            title: "Login Failed",
            description,
        });
    } finally {
        setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/dashboard");
    } catch (error: any) {
      let description = "An unexpected error occurred with Google Sign-In. Please try again.";
      switch (error.code) {
        case 'auth/api-key-not-valid':
            description = "Your Firebase API key is invalid. Please check your .env file and make sure you've correctly copied your project's credentials from the Firebase console.";
            break;
        case 'auth/popup-closed-by-user':
          description = "The sign-in popup was closed before completing. Please try again.";
          break;
        case 'auth/popup-blocked':
            description = "The sign-in popup was blocked by your browser. Please allow popups for this site.";
            break;
        case 'auth/operation-not-allowed':
            description = "Google Sign-In is not enabled for this app. Please enable it in the Firebase console.";
            break;
        case 'auth/unauthorized-domain':
            description = "This app's domain is not authorized for Google Sign-In.";
            break;
        default:
            console.error("Google Sign-In Error:", error);
      }
      toast({
        variant: "destructive",
        title: "Login Failed",
        description,
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-2xl animate-in fade-in-50 duration-500">
        <CardHeader className="space-y-1 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Target className="h-10 w-10 text-primary" />
            </div>
          <CardTitle className="text-3xl font-bold font-headline">Habitual</CardTitle>
          <CardDescription>Log in to track your habits</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...form.register("email")}
                disabled={isLoading || isGoogleLoading}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...form.register("password")}
                disabled={isLoading || isGoogleLoading}
              />
               {form.formState.errors.password && (
                <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
                {isLoading ? (
                    <LoaderCircle className="animate-spin" />
                ) : (
                    "Login"
                )}
            </Button>
          </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                  </span>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading || isGoogleLoading}>
              {isGoogleLoading ? (
                  <LoaderCircle className="animate-spin" />
              ) : (
                  <>
                      <GoogleIcon className="mr-2 h-4 w-4" />
                      Sign In with Google
                  </>
              )}
            </Button>

            <div className="pt-4 text-center text-sm">
                Don't have an account?{" "}
                <Link href="/signup" className="underline hover:text-primary">
                    Sign Up
                </Link>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
