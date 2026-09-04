"use client";

import { useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase/client";
import Image from "next/image";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");
    try {
      const { error } = await getSupabase().auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/auth/reset-password",
      });
      if (error) {
        setError(error.message);
      } else {
        setSent(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Image src="/icons/icon-192.png" alt="Bujh logo" width={192} height={192} className="mx-auto mb-4 h-16 w-16" />
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>We'll send you a link to reset your password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium">Check your email</p>
                <p className="text-sm text-muted-foreground mt-1">We sent a password reset link to {email}</p>
              </div>
              <Link href="/auth/login">
                <Button variant="outline" className="w-full"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Login</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="rounded-lg bg-red-50 dark:bg-red-950 p-3 text-sm text-red-600 dark:text-red-400">{error}</div>}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>{loading ? "Sending..." : "Send reset link"}</Button>
              <div className="text-center"><Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground hover:underline"><ArrowLeft className="inline h-3 w-3 mr-1" /> Back to login</Link></div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
