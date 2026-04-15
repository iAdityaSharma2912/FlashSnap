"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowLeft, Mail, Lock, Layers, AlertCircle } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Call NextAuth signIn
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false, // Prevent automatic page reload so we can handle errors gracefully
      });

      if (result?.error) {
        setError("Invalid email or password.");
        setIsLoading(false);
        return;
      }

      // Successful login, redirect to the app (e.g., /decks or /generate)
      router.push("/dashboard");
      router.refresh(); 
    } catch (err) {
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

      <div className="w-full max-w-md bg-zinc-950/80 backdrop-blur-xl p-8 sm:p-12 rounded-[2rem] border border-zinc-800 shadow-2xl relative overflow-hidden z-10">
        {/* Decorative corner accents */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 blur-[50px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-orange-500/10 blur-[50px] rounded-full pointer-events-none"></div>

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex justify-center mb-8">
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

          <h2 className="text-3xl font-black tracking-tight text-white text-center mb-2">
            Welcome back
          </h2>
          <p className="text-gray-400 text-center mb-8">
            Enter your details to access your decks.
          </p>

          {/* Form bounded to handleSubmit */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-4 text-gray-500" size={20} />
                <input 
                  type="email" 
                  placeholder="you@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-12 pr-4 py-3 bg-zinc-900/50 border border-zinc-800 text-white placeholder:text-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-gray-300">Password</label>
                <a href="#" className="text-sm text-blue-400 hover:text-blue-300 hover:underline transition-colors">Forgot password?</a>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 text-gray-500" size={20} />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-12 pr-4 py-3 bg-zinc-900/50 border border-zinc-800 text-white placeholder:text-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all" 
                />
              </div>
            </div>

            {/* Error Message Display */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-400 font-medium">{error}</p>
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 mt-6 flex justify-center items-center gap-2 font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl hover:from-orange-400 hover:to-orange-500 shadow-[0_0_30px_-10px_rgba(249,115,22,0.5)] hover:-translate-y-1 transition-all duration-300 border-0 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isLoading && <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Pointed the Sign Up button directly to your new /register route */}
          <div className="mt-8 text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <Link 
              href="/register" 
              className="text-orange-500 font-bold hover:text-orange-400 hover:underline transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}