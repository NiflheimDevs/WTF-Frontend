import { Droplets } from "lucide-react";

export function HeroSection() {
  return (
    <>
      {/* Top Bar */}
      <header className="h-14 border-b border-neutral-200 flex items-center justify-between px-4 bg-neutral-0 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Droplets size={20} className="text-primary-500" />
          <span className="text-sm font-bold text-neutral-900">
            Water Supply Reporting
          </span>
        </div>
      </header>

      {/* Hero */}
      <div className="px-6 pt-12 pb-8 min-h-[30vh] flex flex-col justify-center">
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-neutral-900 mb-3">
          Report a water need
        </h1>
        <p className="text-base text-neutral-500 leading-relaxed mb-6 max-w-md">
          No login required. Takes 30 seconds. Help is dispatched fast.
        </p>
        <div className="flex items-center gap-3 text-neutral-400">
          <div className="w-8 h-px bg-neutral-300" />
          <span className="text-[11px] uppercase tracking-wider font-medium">
            Fill the form below
          </span>
        </div>
      </div>
    </>
  );
}
