"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Menu,
  X,
  LogOut,
  Heart,
  FileText,
  Activity,
  TrendingUp,
} from "lucide-react";
import { Button } from "./ui/button";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null); // null = not checked yet

  // Function to check login
  const checkLogin = async () => {
    try {
      const res = await fetch(`${API_URL}/profile/getuser`, {
        method: "GET",
        credentials: "include",
      });
      setIsLoggedIn(res.ok);
    } catch {
      setIsLoggedIn(false);
    }
  };

  // Check login on mount and whenever the path changes
  useEffect(() => {
    checkLogin();
  }, [pathname]); // re-check login on route change

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      setIsLoggedIn(false);
      router.push("/");
    } catch (err) {
      console.error(err);
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
          className={`flex items-center gap-2 px-2 py-1 rounded-md ${
            isActive
              ? "bg-accent  font-semibold text-white"
              : "hover:bg-accent/10"
          }`}
          onClick={() => setOpen(false)}
        >
          {link.icon} {link.name}
        </Link>
      );
    });

  // While checking login, don’t show anything
  if (isLoggedIn === null) return null;

  return (
    <nav className="bg-card border-b border-border w-full">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Heart className="w-5 h-5 text-primary-foreground animate-pulse" />
          </div>
          <Link href="/" className="font-bold text-xl">
            HealthMate
          </Link>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-4 items-center">
          {isLoggedIn && renderLinks()}
          {isLoggedIn && (
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-1" /> Logout
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden self-end">
          <button
            className="p-2 rounded-md hover:bg-accent/10"
            onClick={() => setOpen(!open)}
            aria-label="Toggle Menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {open && isLoggedIn && (
          <div className="absolute top-full left-0 w-full bg-card border-t border-border flex flex-col p-4 gap-2 z-50 md:hidden">
            {renderLinks()}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-1" /> Logout
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
