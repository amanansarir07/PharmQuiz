"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Calendar, ArrowLeft, CheckCircle, Lock, Eye, EyeOff, Trash2, LogOut, AlertTriangle, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { user, updateProfile, changePassword, deleteAccount, logout } = useAuth();
  const router = useRouter();
  const [name, setName] = useState(user?.name || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState("");

  // Delete state
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
    if (!/\p{L}/u.test(trimmedName)) {
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

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) { setPwError("Fill in all fields"); return; }
    if (newPassword.length < 6) { setPwError("New password must be at least 6 characters"); return; }
    if (newPassword !== confirmNewPassword) { setPwError("New passwords do not match"); return; }
    if (currentPassword === newPassword) { setPwError("New password must be different"); return; }
    setPwLoading(true); setPwError(""); setPwSuccess(false);
    const result = await changePassword(currentPassword, newPassword);
    if (result.error) { setPwError(result.error); }
    else { setPwSuccess(true); setCurrentPassword(""); setNewPassword(""); setConfirmNewPassword(""); setTimeout(() => setPwSuccess(false), 3000); }
    setPwLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) { setDeleteError("Enter your password to confirm"); return; }
    setDeleteLoading(true); setDeleteError("");
    const result = await deleteAccount(deletePassword);
    if (result.error) { setDeleteError(result.error); setDeleteLoading(false); }
    else { router.push("/"); }
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
                  const filtered = e.target.value.replace(/[^\p{L} ]/gu, "");
                  setName(filtered);
                }}
                placeholder="Enter your full name"
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
        {/* Change Password */}
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Lock className="h-5 w-5" /> Change Password</CardTitle><CardDescription>Update your account password</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            {pwError && <div className="rounded-lg bg-red-50 dark:bg-red-950 p-3 text-sm text-red-600 dark:text-red-400">{pwError}</div>}
            {pwSuccess && <div className="rounded-lg bg-green-50 dark:bg-green-950 p-3 text-sm text-green-600 dark:text-green-400 flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Password changed successfully!</div>}
            <div className="space-y-2"><Label>Current Password</Label><Input type={showPasswords ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" /></div>
            <div className="space-y-2"><Label>New Password</Label><Input type={showPasswords ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 6 characters" /></div>
            <div className="space-y-2"><Label>Confirm New Password</Label><Input type={showPasswords ? "text" : "password"} value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} placeholder="Confirm new password" /></div>
            <div className="flex items-center gap-3">
              <Button onClick={handleChangePassword} disabled={pwLoading || !currentPassword || !newPassword}>{pwLoading ? "Changing..." : "Update Password"}</Button>
              <button type="button" onClick={() => setShowPasswords(!showPasswords)} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                {showPasswords ? <><EyeOff className="h-4 w-4" /> Hide</> : <><Eye className="h-4 w-4" /> Show</>}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Sign Out */}
        <Card>
          <CardContent className="p-5"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><LogOut className="h-5 w-5 text-muted-foreground" /><div><p className="font-medium">Sign Out</p><p className="text-sm text-muted-foreground">Sign out of your account on this device</p></div></div><Button variant="outline" onClick={() => { logout(); router.push("/"); }}>Sign Out</Button></div></CardContent>
        </Card>

        {/* Danger Zone - Delete Account */}
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader><CardTitle className="text-lg flex items-center gap-2 text-red-600 dark:text-red-400"><Trash2 className="h-5 w-5" /> Delete Account</CardTitle><CardDescription>Permanently delete your account and all associated data. This action cannot be undone.</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            {!showDeleteConfirm ? (
              <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}><Trash2 className="mr-2 h-4 w-4" /> Delete My Account</Button>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg bg-red-50 dark:bg-red-950 p-4 text-sm text-red-600 dark:text-red-400"><div className="flex items-start gap-2"><AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" /><div><p className="font-semibold mb-1">Are you absolutely sure?</p><p>This will permanently delete your account, profile, quiz results, bookmarks, and notes. This cannot be undone.</p></div></div></div>
                {deleteError && <div className="rounded-lg bg-red-50 dark:bg-red-950 p-3 text-sm text-red-600 dark:text-red-400">{deleteError}</div>}
                <div className="space-y-2"><Label>Enter your password to confirm</Label><Input type={showDeletePassword ? "text" : "password"} value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} placeholder="Your password" /></div>
                <div className="flex items-center gap-3">
                  <Button variant="destructive" onClick={handleDeleteAccount} disabled={deleteLoading || !deletePassword}>{deleteLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : <><Trash2 className="mr-2 h-4 w-4" /> Yes, Delete My Account</>}</Button>
                  <Button variant="outline" onClick={() => { setShowDeleteConfirm(false); setDeletePassword(""); setDeleteError(""); }}>Cancel</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
