"use client";

import Link from "next/link";
import Image from "next/image";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.svg"
            alt="UXBeacon"
            width={32}
            height={38}
          />
          <div className="flex flex-col leading-none">
            <span className="text-lg font-bold tracking-tight text-[#333333]">UXBeacon</span>
            <span className="text-[11px] font-semibold text-[#EE661D] tracking-wide">
              Measure. Monitor. Improve.
            </span>
          </div>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/#features" className="text-sm font-500 text-gray-600 hover:text-[#EE661D] transition-colors">
            Features
          </Link>
          <Link href="/#how-it-works" className="text-sm font-500 text-gray-600 hover:text-[#EE661D] transition-colors">
            How it works
          </Link>
          <Link href="/design" className="text-sm font-500 text-gray-600 hover:text-[#EE661D] transition-colors">
            Design Scan
          </Link>
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link href="/design" className="hidden sm:inline-flex items-center justify-center rounded-full border border-[#EE661D] text-[#EE661D] hover:bg-[#FFF7E3] px-4 h-9 text-sm font-semibold transition-colors">
            Design Scan
          </Link>
          <Link href="/#analyzer" className="inline-flex items-center justify-center rounded-full bg-[#EE661D] hover:bg-[#d55518] text-white px-5 h-9 text-sm font-semibold transition-colors">
            Analyze a site
          </Link>
        </div>
      </div>
    </header>
  );
}
