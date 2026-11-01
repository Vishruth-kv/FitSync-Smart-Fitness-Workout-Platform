"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Sparkles, ArrowLeft, CheckCircle2 } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to reset password");
      }
      
      setStatus("success");
    } catch (error: any) {
      setStatus("error");
      setErrorMessage(error.message || "Something went wrong. Please try again.");
    }
  }

  return (
    <Card className="w-full max-w-[420px] border-border/50 bg-background/60 backdrop-blur-xl shadow-2xl">
      <CardHeader className="text-center pb-6">
        <Link href="/" className="inline-flex items-center justify-center gap-1 mb-6 hover:opacity-80 transition-opacity">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="text-xl font-black tracking-tighter">
            Fit<span className="text-primary">Match</span>
            <span className="text-secondary ml-1 text-[10px] tracking-widest uppercase align-top">AI</span>
          </span>
        </Link>
        <CardTitle className="text-2xl font-bold tracking-tight">Create new password</CardTitle>
        <CardDescription>Enter a new password for {email || "your account"}.</CardDescription>
      </CardHeader>
      <CardContent>
        {status === "success" ? (
          <div className="flex flex-col items-center justify-center text-center space-y-4 py-4">
            <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center mb-2">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
            <h3 className="text-lg font-bold">Password Reset Complete</h3>
            <p className="text-sm text-muted-foreground">
              Your password has been successfully updated. You can now log in with your new password.
            </p>
            <Button asChild className="w-full mt-4">
              <Link href="/login">Go to Login</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">New Password</label>
              <Input 
                required 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="h-12 bg-background/50"
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            {status === "error" && (
              <div className="text-sm font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                {errorMessage}
              </div>
            )}

            <Button 
              type="submit" 
              disabled={status === "loading" || !password} 
              className="h-12 w-full mt-2 font-bold text-md shadow-lg shadow-primary/20"
            >
              {status === "loading" ? "Resetting…" : "Reset Password"}
            </Button>
          </form>
        )}
      </CardContent>
      {status !== "success" && (
        <CardFooter className="flex justify-center border-t border-border/50 pt-6">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground font-semibold inline-flex items-center gap-2 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-primary/10 to-brand-orange/5 rounded-full blur-[120px] -z-10" />
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
