"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Calendar, ArrowLeft, CheckCircle } from "lucide-react";

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Please sign in to view your profile.</p>
      </div>
    );
  }

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Name cannot be empty");
      return;
    }
    // Validate name
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      setError("Name must be at least 2 characters");
      setLoading(false);
      return;
    }
    if (!/[a-zA-Z]/.test(trimmedName)) {
      setError("Name must contain at least one letter");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);
    const result = await updateProfile(trimmedName);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setLoading(false);
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    } catch { return iso; }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Link href="/dashboard" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <User className="h-8 w-8" />
          Profile
        </h1>
        <p className="mt-2 text-muted-foreground">Manage your account settings</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Edit Name</CardTitle>
            <CardDescription>This name will be shown on the leaderboard and across the app</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-950 p-3 text-sm text-red-600 dark:text-red-400">{error}</div>
            )}
            {success && (
              <div className="rounded-lg bg-green-50 dark:bg-green-950 p-3 text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Name updated successfully!
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => {
                  const filtered = e.target.value.replace(/[^a-zA-Z ]/g, "");
                  setName(filtered);
                }}
                placeholder="e.g. Aman Ansari"
                maxLength={50}
              />
            </div>
            <Button onClick={handleSave} disabled={loading || name.trim() === user.name}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Member since</p>
                <p className="font-medium">{formatDate(user.createdAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
