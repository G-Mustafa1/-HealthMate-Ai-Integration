"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { useState, useEffect } from "react";
import {
  Menu,
  X,
  LogOut,
  Heart,
  FileText,
  Activity,
  TrendingUp,
  UserPlus,
  LogIn,
} from "lucide-react";
import { Button } from "./ui/button";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);

  const checkLogin = async () => {
    try {
      const res = await fetch(`${API_URL}/profile/getuser`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data?.user || null);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    checkLogin();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      Swal.fire("Success", "Logged out successfully", "success");
      setUser(null);
      setOpen(false);
      router.replace("/");
    } catch (err) {
      console.error("Logout failed:", err);
      Swal.fire("Error", "Logout failed", "error");
    }
  };

  const links = [
    { name: "Dashboard", href: "/dashboard", icon: <Activity className="w-4 h-4" /> },
    { name: "Vitals", href: "/vitals", icon: <TrendingUp className="w-4 h-4" /> },
    { name: "AI Insights", href: "/insights", icon: <Heart className="w-4 h-4" /> },
    { name: "Reports", href: "/reports", icon: <FileText className="w-4 h-4" /> },
  ];

  const renderLinks = () =>
    links.map((link) => {
      const isActive = pathname.startsWith(link.href);
      return (
        <Link
          key={link.href}
          href={link.href}
          className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${isActive
              ? "bg-primary text-white font-semibold shadow"
              : "hover:bg-accent/10"
            }`}
          onClick={() => setOpen(false)}
        >
          {link.icon} {link.name}
        </Link>
      );
    });

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-5 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Heart className="w-5 h-5 text-primary-foreground animate-pulse" />
          </div>
          <Link href="/" className="text-2xl font-bold text-gray-800">
            HealthMate
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-5">
          {user ? (
            <>
              {renderLinks()}
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" /> Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" /> Login
                </Button>
              </Link>
              <Link href="/">
                <Button size="sm" className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" /> Register
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-gray-100 transition"
          onClick={() => setOpen(!open)}
          aria-label="Toggle Menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden bg-white border-t border-gray-200 transition-all duration-300 overflow-hidden ${open ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <div className="flex flex-col p-4 space-y-3">
          {user ? (
            <>
              {renderLinks()}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/" onClick={() => setOpen(false)}>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" /> Login
                </Button>
              </Link>
              <Link href="/" onClick={() => setOpen(false)}>
                <Button size="sm" className="w-full flex items-center gap-2">
                  <UserPlus className="w-4 h-4" /> Register
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
