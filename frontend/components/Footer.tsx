"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart, Mail, Twitter, Github, Linkedin } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function Footer() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

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

  useEffect(() => {
    checkLogin();
  }, [pathname]);

  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Branding */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground animate-pulse" />
            </div>
            <h2 className="font-bold text-xl text-foreground">HealthMate</h2>
          </div>
          <p className="text-muted-foreground">
            Your personal AI health assistant. Upload reports, track vitals, and get insights in one place.
          </p>
        </div>

        {/* Quick Links */}
        {
          isLoggedIn ? (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg text-foreground">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/dashboard" className="hover:underline text-muted-foreground">Dashboard</Link>
                </li>
                <li>
                  <Link href="/vitals" className="hover:underline text-muted-foreground">Vitals</Link>
                </li>
                <li>
                  <Link href="/report" className="hover:underline text-muted-foreground">Reports</Link>
                </li>
                <li>
                  <Link href="/insights" className="hover:underline text-muted-foreground">AI Insights</Link>
                </li>
              </ul>
            </div>

          ) : (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg text-foreground">Quick Links</h3>
              <div className="flex flex-col gap-2">
                <Link href="/" className="text-muted-foreground hover:text-foreground">Login</Link>
                <Link href="/" className="text-muted-foreground hover:text-foreground">Register</Link>
              </div>
            </div>
          )
        }
        {/* Contact / Support */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg text-foreground">Contact</h3>
          <p className="text-muted-foreground">Need help or have questions? Reach out!</p>
          <p className="flex items-center gap-2 text-muted-foreground">
            <Mail className="w-4 h-4" /> support@healthmate.com
          </p>
          <div className="flex gap-3 mt-2">
            <Link href="#" className="text-muted-foreground hover:text-foreground"><Twitter className="w-5 h-5" /></Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground"><Github className="w-5 h-5" /></Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground"><Linkedin className="w-5 h-5" /></Link>
          </div>
        </div>

        {/* Newsletter / Subscription */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg text-foreground">Stay Updated</h3>
          <p className="text-muted-foreground">Subscribe to our newsletter for latest updates.</p>
          <form className="flex flex-col gap-2">
            <input
              type="email"
              placeholder="Your email"
              className="px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              className="px-3 py-2 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-border mt-8 py-4 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} HealthMate. All rights reserved.
      </div>
    </footer>
  );
}
