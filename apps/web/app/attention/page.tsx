import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AttentionUploader } from "@/components/attention/AttentionUploader";
import { ScanEye, Target, Flame, AlertTriangle, LayoutGrid, Map, ChevronRight } from "lucide-react";

const features = [
  { icon: ScanEye,      title: "Attention Heatmap",       description: "Colour-graded overlay shows where users are predicted to look first — red is highest attention, blue is lowest." },
  { icon: Target,       title: "CTA Attention Analysis",  description: "Ranks your call-to-action in the predicted attention order and scores its prominence, visibility, and placement." },
  { icon: Flame,        title: "Hero Effectiveness",      description: "Evaluates hero dominance, headline prominence, and message visibility in the top of the design." },
  { icon: AlertTriangle,title: "Attention Leakage",       description: "Detects decorative elements that steal attention from functional content — buttons, headlines, and CTAs." },
  { icon: LayoutGrid,   title: "Visual Clutter Score",    description: "Counts competing focal points and measures edge density to flag layouts likely to cause cognitive overload." },
  { icon: Map,          title: "Focus Order Ranking",     description: "Predicts the top 7 regions a user will notice and ranks them by visual weight, from most to least prominent." },
];

export default function AttentionPage() {
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
            <div className="mb-6 inline-flex max-w-full items-center gap-2 rounded-full border border-[#EE661D]/20 bg-[#FFF7E3] px-4 py-1.5">
              <ScanEye className="h-3.5 w-3.5 shrink-0 text-[#EE661D]" />
              <span className="text-xs font-semibold text-[#EE661D] tracking-wide uppercase">
                <span className="sm:hidden">Visual Attention Engine</span>
                <span className="hidden sm:inline">Visual Attention Engine · No eye-tracking needed</span>
              </span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-[#333333] sm:text-5xl lg:text-6xl">
              Predict where users
              <br />
              <span className="text-[#EE661D]">look first</span>
            </h1>

            <p className="mt-6 mx-auto max-w-2xl text-lg text-gray-500 leading-relaxed sm:text-xl">
              Upload a screenshot and get a rule-based attention heatmap, CTA ranking,
              leakage detection, and visual clutter score — no eye-tracking study required.
            </p>

            <div className="mt-10">
              <AttentionUploader />
            </div>

            <div className="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-8">
              {[
                { value: "7",     label: "Analysis engines"  },
                { value: "20MB",  label: "Max file size"     },
                { value: "A+→F",  label: "Attention grade"   },
                { value: "100%",  label: "Free to use"       },
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
        <section id="features" className="bg-[#FFF7E3] py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="text-sm font-semibold uppercase tracking-widest text-[#EE661D] mb-3">What we analyse</p>
              <h2 className="text-3xl font-extrabold text-[#333333] sm:text-4xl">7 attention dimensions. One heatmap.</h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

        {/* How it works */}
        <section id="how-it-works" className="bg-white py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="text-sm font-semibold uppercase tracking-widest text-[#EE661D] mb-3">How it works</p>
              <h2 className="text-3xl font-extrabold text-[#333333] sm:text-4xl">
                From screenshot to heatmap in seconds
              </h2>
            </div>

            <div className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { number: "01", title: "Upload a screenshot", description: "PNG, JPG, or WEBP of any UI — web, mobile, or desktop. No live site needed." },
                { number: "02", title: "We build the saliency map", description: "7 signal types are combined: edge density, local contrast, colour, position bias, and OCR text regions." },
                { number: "03", title: "Heatmap & rankings generated", description: "A colour-graded overlay is composited onto your image and attention regions are ranked by visual weight." },
                { number: "04", title: "Review and act", description: "Identify leakage, improve CTA placement, reduce clutter — all from a single report." },
              ].map((step, idx, arr) => (
                <div key={step.number} className="relative flex flex-col items-center text-center">
                  <div className="relative z-10 mb-5 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#EE661D]/20 bg-white shadow-sm">
                    <span className="text-lg font-extrabold text-[#EE661D]">{step.number}</span>
                  </div>
                  {idx < arr.length - 1 && (
                    <ChevronRight aria-hidden className="absolute top-4 -right-4 h-8 w-8 text-gray-200 hidden lg:block" />
                  )}
                  <h3 className="text-base font-bold text-[#333333] mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-[200px]">{step.description}</p>
                </div>
              ))}
            </div>

            {/* Disclaimer */}
            <div className="mt-16 mx-auto max-w-2xl rounded-2xl bg-[#FFF7E3] border border-[#EE661D]/20 px-6 py-5 text-center">
              <p className="text-sm text-gray-600 leading-relaxed">
                <span className="font-semibold text-[#EE661D]">Note:</span> This is a rule-based approximation of visual attention,
                not a substitute for real eye-tracking studies. It predicts <em>likely</em> focus areas based on
                contrast, edges, colour, and position — the same signals trained UX researchers use for heuristic evaluation.
              </p>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
