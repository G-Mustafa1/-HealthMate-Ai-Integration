"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, FileText, TrendingUp } from "lucide-react";
import Swal from "sweetalert2";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) return setError("Email is required.");
    if (!password.trim() || password.length < 8) return setError("Password must be at least 8 characters.");
    if (!isLogin && (!firstname.trim() || firstname.length < 3)) return setError("First name must be at least 3 characters.");
    if (!isLogin && (!lastname.trim() || lastname.length < 3)) return setError("Last name must be at least 3 characters.");

    setLoading(true);
    try {
      const endpoint = isLogin ? `${API_URL}/auth/login` : `${API_URL}/auth/signup`;
      const body = isLogin ? { email, password } : { firstname, lastname, email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Authentication failed.");

      if (isLogin) {
        if (!data.token) throw new Error("Token not received from server");
        localStorage.setItem("token", data.token.replace(/"/g, "")); // ✅ remove quotes if any
        localStorage.setItem("user", JSON.stringify(data.user));

        Swal.fire({ icon: "success", title: "Welcome!", text: "Login successful.", timer: 1200, showConfirmButton: false });
        router.replace("/dashboard");
      } else {
        Swal.fire({ icon: "success", title: "Signup successful!", text: "Please login now." });
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left - Info */}
        <div className="hidden md:block space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-4xl font-bold text-foreground">HealthMate</h1>
            </div>
            <p className="text-lg text-muted-foreground">Sehat ka Smart Dost</p>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4">
              <FileText className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Upload Reports</h3>
                <p className="text-sm text-muted-foreground">Store your medical reports safely in one place.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Heart className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">AI-Powered Analysis</h3>
                <p className="text-sm text-muted-foreground">Get instant summaries in English & Roman Urdu.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <TrendingUp className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Track Your Health</h3>
                <p className="text-sm text-muted-foreground">Monitor vitals and view your medical timeline.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right - Auth Form */}
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>{isLogin ? "Welcome Back" : "Create Account"}</CardTitle>
            <CardDescription>
              {isLogin ? "Sign in to your health vault" : "Start managing your health today"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div>
                    <Label htmlFor="firstname">First Name</Label>
                    <Input id="firstname" value={firstname} onChange={(e) => setFirstname(e.target.value)} placeholder="Your first name" />
                  </div>
                  <div>
                    <Label htmlFor="lastname">Last Name</Label>
                    <Input id="lastname" value={lastname} onChange={(e) => setLastname(e.target.value)} placeholder="Your last name" />
                  </div>
                </>
              )}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Processing..." : isLogin ? "Sign In" : "Sign Up"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border text-center">
              <p className="text-sm text-muted-foreground mb-4">{isLogin ? "Don’t have an account?" : "Already have an account?"}</p>
              <Button variant="outline" onClick={() => { setIsLogin(!isLogin); setError(""); }} className="w-full bg-transparent">
                {isLogin ? "Sign Up" : "Sign In"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
