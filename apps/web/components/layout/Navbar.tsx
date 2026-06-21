"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();
  const isDesign = pathname?.startsWith("/design");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.svg" alt="UXBeacon" width={32} height={38} />
          <div className="flex flex-col leading-none">
            <span className="text-lg font-bold tracking-tight text-[#333333]">UXBeacon</span>
            <span className="text-[11px] font-semibold text-[#EE661D] tracking-wide">
              Measure. Monitor. Improve.
            </span>
          </div>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href={isDesign ? "/design#features" : "/#features"} className="text-sm font-500 text-gray-600 hover:text-[#EE661D] transition-colors">
            Features
          </Link>
          <Link href={isDesign ? "/design#how-it-works" : "/#how-it-works"} className="text-sm font-500 text-gray-600 hover:text-[#EE661D] transition-colors">
            How it works
          </Link>
        </nav>

        {/* Segmented tab control */}
        <div className="flex items-center rounded-full border border-gray-200 bg-gray-50 p-1 gap-0.5">
          <Link
            href="/#analyzer"
            className={`inline-flex items-center justify-center rounded-full px-4 h-8 text-sm font-semibold transition-all ${
              !isDesign
                ? "bg-[#EE661D] text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Analyse a site
          </Link>
          <Link
            href="/design"
            className={`inline-flex items-center justify-center rounded-full px-4 h-8 text-sm font-semibold transition-all ${
              isDesign
                ? "bg-[#EE661D] text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Design Scan
          </Link>
        </div>
      </div>
    </header>
  );
}
