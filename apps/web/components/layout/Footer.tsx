import Link from "next/link";
import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EE661D]">
              <Zap className="h-3.5 w-3.5 text-white fill-white" />
            </div>
            <span className="text-base font-700 text-[#333333]">
              UX<span className="text-[#EE661D]">Beacon</span>
            </span>
          </Link>

          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} UXBeacon. Measure. Monitor. Improve.
          </p>

          <div className="flex items-center gap-5">
            <Link href="/privacy" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
