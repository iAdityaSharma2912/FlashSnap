"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, UserPlus, AlertCircle, Layers, ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState<string | null>(null);

  const passwordStrength = (pw: string) => {
    if (pw.length === 0) return 0;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strength = passwordStrength(password);
  // Updated colors to match standard Tailwind red, orange, yellow, green palette
  const strengthColors = ["", "#ef4444", "#f97316", "#eab308", "#22c55e"];
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in all required fields"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error ?? "Registration failed");
        setIsLoading(false);
        return;
      }

      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        router.push("/login");
        return;
      }

      toast({ title: "Account created", description: "Welcome to FlashSnap", variant: "success" });
      router.push("/decks");
    } catch {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative bg-black text-gray-100 font-sans selection:bg-orange-500/30 selection:text-white">
      {/* Injecting custom keyframes for the animated gradient background */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes gradientBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-bg {
          background: linear-gradient(-45deg, #000000, #0f172a, #1e3a8a, #ea580c, #000000);
          background-size: 400% 400%;
          animation: gradientBG 15s ease infinite;
        }
      `}} />

      {/* Background Overlays */}
      <div className="absolute inset-0 animate-gradient-bg z-0" />
      <div className="absolute inset-0 bg-black/80 z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/60 to-black z-0" />

      {/* Back Button */}
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-medium z-10 group">
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
        Back to home
      </Link>

      <div className="w-full max-w-md bg-zinc-950/80 backdrop-blur-xl p-8 sm:p-12 rounded-[2rem] border border-zinc-800 shadow-2xl relative overflow-hidden z-10 my-12">
        {/* Decorative corner accents */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 blur-[50px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-orange-500/10 blur-[50px] rounded-full pointer-events-none" />

        <div className="relative z-10 space-y-8">
          <div className="text-center space-y-3">
            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-orange-500 p-[1px] shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)]">
                  <div className="w-full h-full rounded-[10px] bg-black flex items-center justify-center">
                    <Layers className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <span className="text-2xl font-black tracking-tight text-white">
                  Flash<span className="text-orange-500">Snap</span>
                </span>
              </div>
            </div>
            
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white">Create an account</h1>
              <p className="text-sm text-gray-400 mt-2 font-medium">Free forever — no credit card required</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label 
                htmlFor="name"
                className={`text-sm font-semibold transition-colors ${focused === "name" ? "text-blue-400" : "text-gray-300"}`}
              >
                Name <span className="text-gray-600 font-normal"></span>
              </Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                onFocus={() => setFocused("name")}
                onBlur={() => setFocused(null)}
                className={`w-full px-4 py-6 bg-zinc-900/50 border border-zinc-800 text-white placeholder:text-gray-600 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:border-blue-500 outline-none transition-all ${focused === "name" ? "border-blue-500 ring-2 ring-blue-500/20" : ""}`}
              />
            </div>

            <div className="space-y-2">
              <Label 
                htmlFor="email"
                className={`text-sm font-semibold transition-colors ${focused === "email" ? "text-blue-400" : "text-gray-300"}`}
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={isLoading}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                className={`w-full px-4 py-6 bg-zinc-900/50 border border-zinc-800 text-white placeholder:text-gray-600 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:border-blue-500 outline-none transition-all ${focused === "email" ? "border-blue-500 ring-2 ring-blue-500/20" : ""}`}
              />
            </div>

            <div className="space-y-2">
              <Label 
                htmlFor="password"
                className={`text-sm font-semibold transition-colors ${focused === "password" ? "text-blue-400" : "text-gray-300"}`}
              >
                Password
              </Label>
              <div className="relative flex items-center">
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  disabled={isLoading}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  className={`w-full pl-4 pr-12 py-6 bg-zinc-900/50 border border-zinc-800 text-white placeholder:text-gray-600 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:border-blue-500 outline-none transition-all ${focused === "password" ? "border-blue-500 ring-2 ring-blue-500/20" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-4 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Strength indicator */}
              {password && (
                <div className="space-y-2 pt-2">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-1.5 flex-1 rounded-full transition-all duration-300"
                        style={{ 
                          backgroundColor: i <= strength ? strengthColors[strength] : "#27272a", // zinc-800
                          boxShadow: i <= strength ? `0 0 10px ${strengthColors[strength]}40` : 'none'
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-xs font-medium transition-colors duration-200" style={{ color: strengthColors[strength] }}>
                    {strengthLabels[strength]}
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-400 font-medium">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 mt-6 font-bold text-lg text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl hover:from-orange-400 hover:to-orange-500 shadow-[0_0_30px_-10px_rgba(249,115,22,0.5)] hover:-translate-y-1 transition-all duration-300 border-0 gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <UserPlus className="w-5 h-5" />
              )}
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="text-orange-500 font-bold hover:text-orange-400 hover:underline transition-colors">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}