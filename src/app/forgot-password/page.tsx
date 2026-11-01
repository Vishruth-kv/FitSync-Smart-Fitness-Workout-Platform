"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Sparkles, ArrowLeft, MailCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      // Simulate API call for now (you can hook this up to a real endpoint later)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // We simulate success assuming the email exists. 
      // In a real app, we'd send a reset link to their email.
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-primary/10 to-brand-orange/5 rounded-full blur-[120px] -z-10" />

      <Card className="w-full max-w-[420px] border-border/50 bg-background/60 backdrop-blur-xl shadow-2xl">
        <CardHeader className="text-center pb-6">
          <Link href="/" className="inline-flex items-center justify-center gap-1 mb-6 hover:opacity-80 transition-opacity">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-xl font-black tracking-tighter">
              Fit<span className="text-primary">Match</span>
              <span className="text-secondary ml-1 text-[10px] tracking-widest uppercase align-top">AI</span>
            </span>
          </Link>
          <CardTitle className="text-2xl font-bold tracking-tight">Reset password</CardTitle>
          <CardDescription>Enter your email address and we&apos;ll send you a link to reset your password.</CardDescription>
        </CardHeader>
        <CardContent>
          {status === "success" ? (
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-4">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                <MailCheck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold">Check your email</h3>
              <p className="text-sm text-muted-foreground">
                We sent a password reset link to <span className="font-semibold text-foreground">{email}</span>.
              </p>
              
              <div className="w-full p-3 mt-4 text-left border rounded-lg bg-primary/5 border-primary/20">
                <p className="text-xs font-semibold text-primary mb-1 uppercase tracking-wide">Demo Link</p>
                <p className="text-xs text-muted-foreground mb-2">Since this is a demo, no email was sent. Click the link below to reset your password:</p>
                <Link href={`/reset-password?email=${encodeURIComponent(email)}`} className="text-sm text-primary font-medium hover:underline break-all">
                  http://localhost:3000/reset-password?token=demo_12345
                </Link>
              </div>

              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => setStatus("idle")}
              >
                Try another email
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email address</label>
                <Input 
                  required 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="h-12 bg-background/50"
                  placeholder="you@example.com"
                />
              </div>

              {status === "error" && (
                <div className="text-sm font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  {errorMessage}
                </div>
              )}

              <Button 
                type="submit" 
                disabled={status === "loading" || !email} 
                className="h-12 w-full mt-2 font-bold text-md shadow-lg shadow-primary/20"
              >
                {status === "loading" ? "Sending link…" : "Send reset link"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center border-t border-border/50 pt-6">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground font-semibold inline-flex items-center gap-2 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
