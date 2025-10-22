"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart, Mail, Twitter, Github, Linkedin } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Footer() {
  const pathname = usePathname();
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
    const timer = setTimeout(() => {
      checkLogin();
    }, 300);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <footer className="bg-white border-t border-gray-200 mt-16 text-gray-700">
      <div className="max-w-7xl mx-auto px-5 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 animate-fade-in">
        {/* Logo & Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-md">
              <Heart className="w-5 h-5 text-white animate-pulse" />
            </div>
            <h2 className="font-bold text-xl text-gray-900">HealthMate</h2>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            Your personal AI health assistant — upload reports, track vitals, and
            get AI insights powered by Gemini.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold text-lg mb-4 text-gray-900">Quick Links</h3>
          <ul className="space-y-2">
            {user ? (
              <>
                <li>
                  <Link
                    href="/dashboard"
                    className="text-gray-500 hover:text-primary transition-colors"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/vitals"
                    className="text-gray-500 hover:text-primary transition-colors"
                  >
                    Vitals
                  </Link>
                </li>
                <li>
                  <Link
                    href="/reports"
                    className="text-gray-500 hover:text-primary transition-colors"
                  >
                    Reports
                  </Link>
                </li>
                <li>
                  <Link
                    href="/insights"
                    className="text-gray-500 hover:text-primary transition-colors"
                  >
                    AI Insights
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    href="/"
                    className="text-gray-500 hover:text-primary transition-colors"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-gray-500 hover:text-primary transition-colors"
                  >
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Contact Section */}
        <div>
          <h3 className="font-semibold text-lg mb-4 text-gray-900">Contact</h3>
          <p className="text-gray-500 flex items-center gap-2 mb-2">
            <Mail className="w-4 h-4" /> support@healthmate.com
          </p>
          <div className="flex gap-4 mt-3">
            <Twitter className="w-5 h-5 text-gray-500 hover:text-primary cursor-pointer transition-transform hover:scale-110" />
            <Github className="w-5 h-5 text-gray-500 hover:text-primary cursor-pointer transition-transform hover:scale-110" />
            <Linkedin className="w-5 h-5 text-gray-500 hover:text-primary cursor-pointer transition-transform hover:scale-110" />
          </div>
        </div>

        {/* Newsletter Section */}
        <div>
          <h3 className="font-semibold text-lg mb-4 text-gray-900">
            Stay Updated
          </h3>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col gap-2"
          >
            <input
              type="email"
              placeholder="Your email"
              className="px-3 py-2 rounded-md border border-gray-300 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              className="px-3 py-2 rounded-md bg-primary text-white font-semibold hover:bg-primary/90 transition-all"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 py-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} HealthMate. All rights reserved.
      </div>
    </footer>
  );
}
