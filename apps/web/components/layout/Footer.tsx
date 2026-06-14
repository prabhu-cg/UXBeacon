import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.svg" alt="UXBeacon" width={24} height={28} />
            <div className="flex flex-col leading-none">
              <span className="text-base font-bold text-[#333333]">UXBeacon</span>
              <span className="text-[10px] font-semibold text-[#EE661D] tracking-wide">
                Measure. Monitor. Improve.
              </span>
            </div>
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
