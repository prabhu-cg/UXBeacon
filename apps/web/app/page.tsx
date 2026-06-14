import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { UrlAnalyzer } from "@/components/home/UrlAnalyzer";
import {
  Eye,
  Accessibility,
  FileText,
  Layout,
  TrendingUp,
  Download,
  ChevronRight,
  CheckCircle2,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Eye,
    title: "UX Heuristics",
    description:
      "Evaluate all 10 of Nielsen's heuristics with scored findings and actionable recommendations.",
  },
  {
    icon: Accessibility,
    title: "Accessibility Audit",
    description:
      "Powered by axe-core. Detect critical, serious, moderate, and minor WCAG violations.",
  },
  {
    icon: FileText,
    title: "Content Quality",
    description:
      "Assess readability, heading hierarchy, CTA clarity, link quality, and content density.",
  },
  {
    icon: Layout,
    title: "UX Laws Engine",
    description:
      "Apply Hick's Law, Fitts's Law, Miller's Law, and 3 more to reveal design decision issues.",
  },
  {
    icon: TrendingUp,
    title: "UX Health Score",
    description:
      "A weighted composite score (A+ to F) across accessibility, heuristics, UX laws, content, and navigation.",
  },
  {
    icon: Download,
    title: "Exportable Reports",
    description:
      "Download full audit reports as PDF, CSV, or JSON. Share with your team instantly.",
  },
];

const steps = [
  {
    number: "01",
    title: "Enter any URL",
    description: "Paste the URL of any public website. No login or setup required.",
  },
  {
    number: "02",
    title: "We crawl & analyze",
    description:
      "UXBeacon crawls up to 25 pages, captures screenshots, and runs 6 analysis engines in parallel.",
  },
  {
    number: "03",
    title: "Review your results",
    description:
      "Get a detailed UX health score, heuristic findings, accessibility issues, and content quality metrics.",
  },
  {
    number: "04",
    title: "Download your report",
    description:
      "Export as PDF, CSV, or JSON and share with stakeholders or your design team.",
  },
];

const metrics = [
  { value: "6", label: "Analysis engines" },
  { value: "10", label: "UX heuristics" },
  { value: "25+", label: "Pages per scan" },
  { value: "100%", label: "Free to use" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section
          id="analyzer"
          className="relative overflow-hidden bg-white pt-20 pb-24 sm:pt-28 sm:pb-32"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[#FFF7E3] opacity-60 blur-3xl" />
            <div className="absolute -top-20 right-0 h-[400px] w-[400px] translate-x-1/3 rounded-full bg-[#EE661D] opacity-[0.08] blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#EE661D]/20 bg-[#FFF7E3] px-4 py-1.5">
              <Zap className="h-3.5 w-3.5 text-[#EE661D] fill-[#EE661D]" />
              <span className="text-xs font-semibold text-[#EE661D] tracking-wide uppercase">
                Free UX Analysis · No account needed
              </span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-[#333333] sm:text-5xl lg:text-6xl">
              Measure the{" "}
              <span className="text-[#EE661D]">UX quality</span>
              <br />
              of any website
            </h1>

            <p className="mt-6 mx-auto max-w-2xl text-lg text-gray-500 leading-relaxed sm:text-xl">
              UXBeacon analyzes accessibility, UX heuristics, content quality, and UX laws
              to give you an actionable health score — in seconds.
            </p>

            <div className="mt-10">
              <UrlAnalyzer />
            </div>

            <div className="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-8">
              {metrics.map((m) => (
                <div key={m.label} className="text-center">
                  <div className="text-2xl font-extrabold text-[#EE661D] sm:text-3xl">{m.value}</div>
                  <div className="mt-1 text-sm text-gray-500">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="bg-[#FFF7E3] py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="text-sm font-semibold uppercase tracking-widest text-[#EE661D] mb-3">
                What we analyze
              </p>
              <h2 className="text-3xl font-extrabold text-[#333333] sm:text-4xl">
                Six engines. One unified score.
              </h2>
              <p className="mt-4 mx-auto max-w-xl text-gray-500 text-lg">
                Every scan runs six parallel analysis engines to give you a complete picture of your
                product&apos;s UX health.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.title}
                    className="group rounded-2xl bg-white p-6 shadow-sm border border-gray-100 hover:border-[#EE661D] hover:shadow-md transition-all"
                  >
                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#EE661D]/10 group-hover:bg-[#EE661D]/15 transition-colors">
                      <Icon className="h-5 w-5 text-[#EE661D]" />
                    </div>
                    <h3 className="text-base font-bold text-[#333333] mb-2">{f.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="bg-white py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="text-sm font-semibold uppercase tracking-widest text-[#EE661D] mb-3">
                How it works
              </p>
              <h2 className="text-3xl font-extrabold text-[#333333] sm:text-4xl">
                From URL to full report in minutes
              </h2>
            </div>

            <div className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, idx) => (
                <div key={step.number} className="relative flex flex-col items-center text-center">
                  <div className="relative z-10 mb-5 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#EE661D]/20 bg-white shadow-sm">
                    <span className="text-lg font-extrabold text-[#EE661D]">{step.number}</span>
                  </div>
                  {idx < steps.length - 1 && (
                    <ChevronRight
                      aria-hidden
                      className="absolute top-4 -right-4 h-8 w-8 text-gray-200 hidden lg:block"
                    />
                  )}
                  <h3 className="text-base font-bold text-[#333333] mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-[200px]">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust section */}
        <section className="bg-[#FFF7E3] py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-[#EE661D] mb-4">
                  Built for designers & developers
                </p>
                <h2 className="text-3xl font-extrabold text-[#333333] sm:text-4xl leading-snug">
                  Deterministic. Transparent.
                  <br />
                  Repeatable.
                </h2>
                <p className="mt-5 text-gray-500 text-lg leading-relaxed">
                  Unlike black-box AI audits, every UXBeacon score is computed from
                  concrete rules you can inspect and reproduce. No guessing what changed
                  between runs.
                </p>

                <ul className="mt-8 space-y-3">
                  {[
                    "No AI — pure deterministic rule-based analysis",
                    "axe-core powered accessibility scanning (WCAG 2.2)",
                    "All 10 Nielsen heuristics scored 0–10",
                    "Weighted composite health score with grade",
                    "PDF + CSV + JSON export for sharing",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-[#EE661D] shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Score card preview */}
              <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
                      UXBeacon Score
                    </div>
                    <div className="text-sm text-gray-500">example.com</div>
                  </div>
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 border-2 border-green-200">
                    <div>
                      <div className="text-2xl font-extrabold text-green-600 text-center">A</div>
                      <div className="text-[10px] text-green-500 text-center font-semibold">Great</div>
                    </div>
                  </div>
                </div>

                {[
                  { label: "Accessibility", score: 88, weight: "25%" },
                  { label: "UX Heuristics", score: 82, weight: "25%" },
                  { label: "UX Laws", score: 79, weight: "20%" },
                  { label: "Content Quality", score: 85, weight: "15%" },
                  { label: "Navigation", score: 90, weight: "15%" },
                ].map((item) => (
                  <div key={item.label} className="mb-3 last:mb-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600 font-medium">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{item.weight}</span>
                        <span className="text-sm font-bold text-[#333333]">{item.score}</span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-100">
                      <div
                        className="h-1.5 rounded-full bg-[#EE661D] transition-all"
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                ))}

                <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-400">Overall score</span>
                  <span className="text-2xl font-extrabold text-[#333333]">
                    85<span className="text-base text-gray-400">/100</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-[#EE661D] py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Ready to measure your UX?
            </h2>
            <p className="mt-4 text-lg text-white/80">
              Free. No account needed. Results in minutes.
            </p>
            <div className="mt-8">
              <UrlAnalyzer inverted />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
