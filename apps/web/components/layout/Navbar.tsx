"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, Layers } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const isDesign    = pathname?.startsWith("/design");
  const isAttention = pathname?.startsWith("/attention");
  const isHome      = !isDesign && !isAttention;

  const featuresHref   = isDesign ? "/design#features"    : isAttention ? "/attention#features"    : "/#features";
  const howItWorksHref = isDesign ? "/design#how-it-works": isAttention ? "/attention#how-it-works": "/#how-it-works";

  const [open, setOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Main row */}
        <div className="flex h-14 items-center justify-between gap-3">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <Image src="/logo.svg" alt="UXBeacon" width={28} height={34} />
            <div className="flex flex-col leading-none">
              <span className="text-base font-bold tracking-tight text-[#333333]">UXBeacon</span>
              <span className="hidden sm:block text-[11px] font-semibold text-[#EE661D] tracking-wide">
                Measure. Monitor. Improve.
              </span>
            </div>
          </Link>

          {/* Nav links — lg and above only */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link href={featuresHref} className="text-sm text-gray-600 hover:text-[#EE661D] transition-colors whitespace-nowrap">
              Features
            </Link>
            <Link href={howItWorksHref} className="text-sm text-gray-600 hover:text-[#EE661D] transition-colors whitespace-nowrap">
              How it works
            </Link>
          </nav>

          {/* Full segmented control — lg and above */}
          <div className="hidden lg:flex items-center rounded-full border border-gray-200 bg-gray-50 p-1 gap-0.5">
            <Link
              href="/#analyzer"
              className={`inline-flex items-center justify-center rounded-full px-4 h-8 text-sm font-semibold transition-all whitespace-nowrap ${
                isHome ? "bg-[#EE661D] text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Analyse a site
            </Link>
            <Link
              href="/design"
              className={`inline-flex items-center justify-center rounded-full px-4 h-8 text-sm font-semibold transition-all whitespace-nowrap ${
                isDesign ? "bg-[#EE661D] text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Design Scan
            </Link>
            <Link
              href="/attention"
              className={`inline-flex items-center justify-center rounded-full px-4 h-8 text-sm font-semibold transition-all whitespace-nowrap ${
                isAttention ? "bg-[#EE661D] text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Attention
            </Link>
          </div>

          {/* Tools dropdown — below lg */}
          <div className="relative lg:hidden" ref={dropRef}>
            <button
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-haspopup="true"
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 h-9 text-sm font-semibold transition-all ${
                open
                  ? "border-[#EE661D] bg-[#FFF7E3] text-[#EE661D]"
                  : "border-gray-200 bg-gray-50 text-gray-700 hover:border-[#EE661D]/50 hover:text-[#EE661D]"
              }`}
            >
              <Layers className="h-3.5 w-3.5 shrink-0" />
              <span>Tools</span>
              <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
              <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-gray-100 bg-white py-1.5 shadow-lg ring-1 ring-black/5 z-50">
                <Link
                  href="/#analyzer"
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
                    isHome ? "bg-[#FFF7E3] text-[#EE661D]" : "text-gray-700 hover:bg-gray-50 hover:text-[#EE661D]"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full shrink-0 ${isHome ? "bg-[#EE661D]" : "bg-gray-200"}`} />
                  Analyse a site
                </Link>
                <Link
                  href="/design"
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
                    isDesign ? "bg-[#FFF7E3] text-[#EE661D]" : "text-gray-700 hover:bg-gray-50 hover:text-[#EE661D]"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full shrink-0 ${isDesign ? "bg-[#EE661D]" : "bg-gray-200"}`} />
                  Design Scan
                </Link>
                <Link
                  href="/attention"
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
                    isAttention ? "bg-[#FFF7E3] text-[#EE661D]" : "text-gray-700 hover:bg-gray-50 hover:text-[#EE661D]"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full shrink-0 ${isAttention ? "bg-[#EE661D]" : "bg-gray-200"}`} />
                  Attention
                </Link>
              </div>
            )}
          </div>

        </div>

        {/* Second row: Features + How it works — below lg */}
        <div className="flex lg:hidden items-center justify-center gap-8 border-t border-gray-100 py-2.5">
          <Link href={featuresHref} className="text-sm font-medium text-gray-600 hover:text-[#EE661D] transition-colors whitespace-nowrap">
            Features
          </Link>
          <Link href={howItWorksHref} className="text-sm font-medium text-gray-600 hover:text-[#EE661D] transition-colors whitespace-nowrap">
            How it works
          </Link>
        </div>

      </div>
    </header>
  );
}
