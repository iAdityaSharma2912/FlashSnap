"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  Menu,
  X,
  Layers,
  LogIn,
  UserPlus,
  LogOut,
  LayoutDashboard,
  BookOpen,
  type LucideIcon // <-- Imported type for the icons
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Explicitly define the shape of our navigation items
interface NavItem {
  href: string;
  label: string;
  icon?: LucideIcon; // Make the icon optional
}

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hide Navbar completely on auth pages
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  const isAuth = status === "authenticated";
  const isLoading = status === "loading";

  // Navigation Links explicitly typed as NavItem[]
  const publicNavItems: NavItem[] = [
    { href: "/#features", label: "Features" },
    { href: "/#how-it-works", label: "How it Works" },
  ];

  const authNavItems: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/decks", label: "My Decks", icon: BookOpen },
  ];

  const activeNavItems = isAuth ? authNavItems : publicNavItems;

  return (
    <nav
      className={cn(
        "sticky top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled || isAuth 
          ? "bg-black/80 backdrop-blur-md border-b border-zinc-800/80 shadow-2xl shadow-black/50"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href={isAuth ? "/dashboard" : "/"} className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-orange-500 p-[1px] shadow-[0_0_20px_-5px_rgba(59,130,246,0.4)] group-hover:shadow-[0_0_25px_-5px_rgba(249,115,22,0.6)] group-hover:scale-105 transition-all duration-300">
              <div className="w-full h-full rounded-[10px] bg-black flex items-center justify-center">
                <Layers className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <span className="font-black text-xl tracking-tight text-white">
              Flash<span className="text-orange-500">Snap</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
            {activeNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors",
                  pathname === item.href ? "text-white" : "text-gray-400 hover:text-white"
                )}
              >
                {item.icon && <item.icon className="w-4 h-4" />}
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop Right Side CTA */}
          <div className="hidden md:flex items-center gap-4">
            {isLoading ? (
              <div className="w-20 h-10 bg-zinc-800/50 animate-pulse rounded-lg" />
            ) : isAuth ? (
              <Button 
                onClick={() => signOut({ callbackUrl: "/" })}
                variant="ghost" 
                // Removed hover:text-white to fix the Tailwind conflict
                className="text-gray-400 hover:text-red-400 hover:bg-zinc-900 gap-2 font-medium transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-zinc-900 gap-2 font-medium">
                    <LogIn className="w-4 h-4" />
                    Log In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 hover:from-orange-400 hover:to-orange-500 shadow-[0_0_20px_-5px_rgba(249,115,22,0.4)] hover:-translate-y-0.5 transition-all duration-300 gap-2 font-bold rounded-lg px-5">
                    <UserPlus className="w-4 h-4" />
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-zinc-900 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-in-out absolute top-20 inset-x-0",
          mobileOpen ? "max-h-96 opacity-100 border-b border-zinc-800" : "max-h-0 opacity-0"
        )}
      >
        <div className="bg-zinc-950/95 backdrop-blur-xl shadow-2xl">
          <div className="px-4 py-6 space-y-4">
            {activeNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-base font-medium text-gray-300 hover:text-white transition-colors"
              >
                {item.icon && <item.icon className="w-5 h-5" />}
                {item.label}
              </Link>
            ))}
            
            <div className="h-px bg-zinc-800 my-4" />
            
            <div className="flex flex-col gap-3 px-2">
              {isAuth ? (
                 <Button 
                   onClick={() => { setMobileOpen(false); signOut({ callbackUrl: "/" }); }}
                   variant="ghost" 
                   // Fixed Tailwind conflict here as well
                   className="w-full justify-start text-gray-400 hover:text-red-400 hover:bg-zinc-900 gap-3 text-base h-12"
                 >
                   <LogOut className="w-5 h-5" />
                   Sign Out
                 </Button>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-zinc-900 gap-3 text-base h-12">
                      <LogIn className="w-5 h-5" />
                      Log In
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full justify-start bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-400 hover:to-orange-500 border-0 gap-3 text-base h-12 rounded-xl">
                      <UserPlus className="w-5 h-5" />
                      Sign Up Free
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}