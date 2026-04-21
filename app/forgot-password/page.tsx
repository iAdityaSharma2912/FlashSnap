"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, AlertCircle, CheckCircle2, Layers } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to send email");
      
      setMessage("If an account exists with that email, we have sent a reset link.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative bg-black text-gray-100 font-sans selection:bg-orange-500/30">
      <div className="absolute inset-0 bg-black/80 z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/60 to-black z-0" />

      <Link href="/login" className="absolute top-8 left-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-medium z-10 group">
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
        Back to login
      </Link>

      <div className="w-full max-w-md bg-zinc-950/80 backdrop-blur-xl p-8 sm:p-12 rounded-[2rem] border border-zinc-800 shadow-2xl relative z-10">
        <div className="flex justify-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-orange-500 p-[1px]">
            <div className="w-full h-full rounded-[10px] bg-black flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <h2 className="text-3xl font-black text-white text-center mb-2">Reset Password</h2>
        <p className="text-gray-400 text-center mb-8">Enter your email to receive a reset link.</p>

        {message ? (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto" />
            <p className="text-green-200 font-medium">{message}</p>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-4 text-gray-500" size={20} />
                <input 
                  type="email" 
                  required
                  placeholder="you@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-12 pr-4 py-3 bg-zinc-900/50 border border-zinc-800 text-white placeholder:text-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-400 font-medium">{error}</p>
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 mt-6 flex justify-center items-center gap-2 font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl hover:from-orange-400 hover:to-orange-500 transition-all border-0 disabled:opacity-70"
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}