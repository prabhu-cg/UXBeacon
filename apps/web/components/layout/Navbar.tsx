"use client";

import Link from "next/link";
import { Zap } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EE661D] transition-transform group-hover:scale-105">
            <Zap className="h-4 w-4 text-white fill-white" />
          </div>
          <span className="text-lg font-800 tracking-tight text-[#333333]">
            UX<span className="text-[#EE661D]">Beacon</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/#features"
            className="text-sm font-500 text-gray-600 hover:text-[#EE661D] transition-colors"
          >
            Features
          </Link>
          <Link
            href="/#how-it-works"
            className="text-sm font-500 text-gray-600 hover:text-[#EE661D] transition-colors"
          >
            How it works
          </Link>
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link
            href="/#analyzer"
            className="inline-flex items-center justify-center rounded-full bg-[#EE661D] hover:bg-[#d55518] text-white px-5 h-9 text-sm font-semibold transition-colors"
          >
            Analyze a site
          </Link>
        </div>
      </div>
    </header>
  );
}
