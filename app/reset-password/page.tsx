"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, AlertCircle, Layers, Loader2 } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Missing reset token.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password");

      router.push("/login?reset=success");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return <div className="text-red-400 text-center">Invalid or missing reset token.</div>;
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-300">New Password</label>
        <div className="relative flex items-center">
          <Lock className="absolute left-4 text-gray-500" size={20} />
          <input 
            type="password" 
            required
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
        {isLoading ? "Resetting..." : "Save New Password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative bg-black text-gray-100 font-sans">
      <div className="absolute inset-0 bg-black/80 z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/60 to-black z-0" />

      <div className="w-full max-w-md bg-zinc-950/80 backdrop-blur-xl p-8 sm:p-12 rounded-[2rem] border border-zinc-800 shadow-2xl relative z-10">
        <div className="flex justify-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-orange-500 p-[1px]">
            <div className="w-full h-full rounded-[10px] bg-black flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <h2 className="text-3xl font-black text-white text-center mb-2">New Password</h2>
        <p className="text-gray-400 text-center mb-8">Enter your new secure password below.</p>

        <Suspense fallback={<div className="flex justify-center"><Loader2 className="animate-spin text-orange-500" /></div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}