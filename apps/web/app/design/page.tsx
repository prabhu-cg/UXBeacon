import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ImageUploader } from "@/components/design/ImageUploader";
import { ImageIcon, Layers, Contrast, Type, LayoutGrid, Maximize2, MousePointerClick, Palette, Scale } from "lucide-react";

const features = [
  { icon: Layers,            title: "Visual Hierarchy",   description: "Detect dominant elements, heading prominence, CTA visibility, and attention flow patterns." },
  { icon: Contrast,          title: "WCAG Contrast",      description: "Evaluate text contrast against WCAG AA and AAA standards with pass/fail rates." },
  { icon: Type,              title: "Typography",         description: "Analyse font size variations, weight consistency, and typographic scale." },
  { icon: LayoutGrid,        title: "Spacing & Alignment",description: "Measure gap consistency, padding uniformity, and horizontal alignment axes." },
  { icon: Maximize2,         title: "Layout Density",     description: "Compute whitespace ratio and content density to assess breathing room." },
  { icon: MousePointerClick, title: "CTA Effectiveness",  description: "Identify primary and secondary CTAs, score their visibility and placement." },
  { icon: Palette,           title: "Colour Analysis",    description: "Extract dominant and accent colours, evaluate palette coherence and brand consistency." },
  { icon: Scale,             title: "Visual Balance",     description: "Measure horizontal and vertical weight distribution across the layout." },
];

export default function DesignPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-white pt-20 pb-24 sm:pt-28 sm:pb-32">
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[#FFF7E3] opacity-60 blur-3xl" />
            <div className="absolute -top-20 right-0 h-[400px] w-[400px] translate-x-1/3 rounded-full bg-[#EE661D] opacity-[0.08] blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#EE661D]/20 bg-[#FFF7E3] px-4 py-1.5">
              <ImageIcon className="h-3.5 w-3.5 text-[#EE661D]" />
              <span className="text-xs font-semibold text-[#EE661D] tracking-wide uppercase">
                Screenshot Analysis · No live site needed
              </span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-[#333333] sm:text-5xl lg:text-6xl">
              Analyse any{" "}
              <span className="text-[#EE661D]">design</span>
              <br />
              from a screenshot
            </h1>

            <p className="mt-6 mx-auto max-w-2xl text-lg text-gray-500 leading-relaxed sm:text-xl">
              Upload a PNG, JPG, or WEBP screenshot and get a scored design quality report
              across 9 visual dimensions — no live website required.
            </p>

            <div className="mt-10">
              <ImageUploader />
            </div>

            <div className="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-8">
              {[
                { value: "9", label: "Analysis engines" },
                { value: "20MB", label: "Max file size" },
                { value: "A+→F", label: "Design grade" },
                { value: "100%", label: "Free to use" },
              ].map((m) => (
                <div key={m.label} className="text-center">
                  <div className="text-2xl font-extrabold text-[#EE661D] sm:text-3xl">{m.value}</div>
                  <div className="mt-1 text-sm text-gray-500">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-[#FFF7E3] py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="text-sm font-semibold uppercase tracking-widest text-[#EE661D] mb-3">What we analyse</p>
              <h2 className="text-3xl font-extrabold text-[#333333] sm:text-4xl">9 design dimensions. One score.</h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.title} className="group rounded-2xl bg-white p-6 shadow-sm border border-gray-100 hover:border-[#EE661D] hover:shadow-md transition-all">
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
      </main>
      <Footer />
    </div>
  );
}
