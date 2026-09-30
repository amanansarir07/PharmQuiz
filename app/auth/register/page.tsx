"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/lib/auth";
import { safeSetItem } from "@/lib/storage";
import Image from "next/image";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgramPicker } from "@/components/program-picker";

import { getProgram } from "@/data/registry";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramProgram = searchParams.get("program") || "";
  const { register, signInWithGoogle, user, isLoading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [programSlug, setProgramSlug] = useState<string>(paramProgram);
  const [isChangingProgram, setIsChangingProgram] = useState(!paramProgram);
  const [programError, setProgramError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Sync from localStorage if no query param was provided
  useEffect(() => {
    if (!programSlug && typeof window !== "undefined") {
      const stored =
        localStorage.getItem("bujh-pending-program") ||
        localStorage.getItem("bujh-active-program");
      if (stored && getProgram(stored)) {
        setProgramSlug(stored);
        setIsChangingProgram(false);
      } else {
        setIsChangingProgram(true);
      }
    }
  }, [programSlug]);

  // Signed-in users have no business on the register page — send them home.
  useEffect(() => {
    if (!isLoading && user) router.replace("/dashboard");
  }, [isLoading, user, router]);

  if (isLoading || user) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const selectedProgram = programSlug ? getProgram(programSlug) : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!programSlug) {
      setProgramError(true);
      setIsChangingProgram(true);
      setError("Please select your department and course before creating an account.");
      setLoading(false);
      return;
    }

    // Validate name: only letters, spaces, hyphens, apostrophes; min 2 chars; must have a letter
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      setError("Name must be at least 2 characters");
      setLoading(false);
      return;
    }
    if (!/^[\p{L}]+( [\p{L}]+)*$/u.test(trimmedName)) {
      setError("Name can only contain letters and spaces");
      setLoading(false);
      return;
    }
    if (!/\p{L}/u.test(trimmedName)) {
      setError("Name must contain at least one letter");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    safeSetItem("bujh-pending-program", programSlug);
    safeSetItem("bujh-active-program", programSlug);

    const result = await register(name, email, password, programSlug);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-8 sm:py-12">
      <Card className="w-full max-w-lg shadow-md">
        <CardHeader className="text-center pb-4">
          <Image src="/icons/icon-192.png" alt="Bujh logo" width={192} height={192} className="mx-auto mb-3 h-14 w-14" />
          <CardTitle className="text-2xl font-bold tracking-tight">Create your account</CardTitle>
          <CardDescription className="text-sm">
            Select your syllabus and start targeted MCQ practice
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/40 p-3 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Step 1: Course Selection (Top of the screen, required) */}
            <div
              className={cn(
                "rounded-2xl border p-4 transition-all",
                programError && !programSlug
                  ? "border-red-500 bg-red-50/30 dark:bg-red-950/30 ring-2 ring-red-500/20"
                  : "border-border/80 bg-muted/20"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[11px] font-extrabold">1</span>
                    Your Course / Department *
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Your questions, mocks, and rankings are customized to this syllabus.
                  </p>
                </div>

                {selectedProgram && !isChangingProgram && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsChangingProgram(true)}
                    className="text-xs h-7 text-primary hover:text-primary font-semibold"
                  >
                    Change Course
                  </Button>
                )}
              </div>

              {selectedProgram && !isChangingProgram ? (
                <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 p-3.5 mt-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{selectedProgram.icon}</span>
                    <div>
                      <div className="text-sm font-bold text-foreground">
                        {selectedProgram.name}
                        {selectedProgram.level ? ` · ${selectedProgram.level}` : ""}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {selectedProgram.award}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <span>Enrolled Course ✓</span>
                  </div>
                </div>
              ) : (
                <div className="mt-3 space-y-3">
                  <ProgramPicker
                    value={programSlug}
                    onChange={(slug) => {
                      setProgramSlug(slug);
                      setProgramError(false);
                      setError("");
                      setIsChangingProgram(false);
                      safeSetItem("bujh-pending-program", slug);
                      safeSetItem("bujh-active-program", slug);
                    }}
                    disabled={loading}
                  />
                  {selectedProgram && (
                    <div className="pt-1 text-right">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsChangingProgram(false)}
                        className="text-xs h-7"
                      >
                        Keep Selected
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {programError && !programSlug && (
                <p className="mt-2 text-xs font-semibold text-red-600 dark:text-red-400">
                  Please pick your course from the list above to continue.
                </p>
              )}
            </div>

            {/* Step 2: Account Details */}
            <div className="pt-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[11px] font-extrabold">2</span>
                Student Account Details
              </Label>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => {
                        const filtered = e.target.value.replace(/[^\p{L} ]/gu, "");
                        setName(filtered);
                      }}
                      className="pl-10"
                      required
                      maxLength={50}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password (min. 6 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-2">
            <Button type="submit" className="w-full font-bold h-11 text-base shadow-sm" disabled={loading}>
              {loading ? "Creating account..." : "Complete Registration"}
            </Button>

            <div className="relative my-1 w-full">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-11 font-semibold"
              onClick={async () => {
                if (!programSlug) {
                  setProgramError(true);
                  setIsChangingProgram(true);
                  setError("Please choose your course / department above before continuing with Google.");
                  return;
                }
                safeSetItem("bujh-pending-program", programSlug);
                safeSetItem("bujh-active-program", programSlug);
                const result = await signInWithGoogle();
                if (result.error) setError(result.error);
              }}
              disabled={loading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </Button>

            <p className="text-center text-sm text-muted-foreground pt-1">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary font-medium hover:underline">
                Sign in instead
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
