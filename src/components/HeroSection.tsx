import { Play, ChevronRight } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background image - only visible in dark mode */}
      <div
        className="absolute inset-0 hidden dark:block opacity-30"
        style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />

      {/* Scan line effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none dark:block hidden">
        <div className="w-full h-px bg-primary/20 animate-scan-line" />
      </div>

      <div className="relative z-10 container mx-auto px-6 text-center">
        {/* Terminal-style intro */}
        <div className="inline-block mb-8">
          <div className="bg-surface-code border border-border rounded-lg px-4 py-2 font-mono text-sm text-muted-foreground">
            <span className="text-primary">$</span> welcome --to <span className="text-cyber">codeforge</span>
            <span className="inline-block w-2 h-4 bg-primary ml-1 animate-blink" />
          </div>
        </div>

        <h1 className="text-6xl md:text-8xl font-bold font-mono mb-6 leading-tight tracking-tight">
          <span className="text-foreground">Compile.</span>{" "}
          <span className="text-primary text-glow">Learn.</span>{" "}
          <span className="text-foreground">Build.</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 font-body">
          A real-time code compilation platform with interactive classrooms.
          Write, compile, and collaborate — all in your browser.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="group font-mono bg-primary text-primary-foreground px-8 py-3 rounded-md hover:opacity-90 transition-all flex items-center justify-center gap-2 box-glow">
            <Play className="h-4 w-4" />
            Start Coding
            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="font-mono border border-border text-foreground px-8 py-3 rounded-md hover:border-primary hover:text-primary transition-all">
            Browse Classrooms
          </button>
        </div>

        {/* Mini code preview */}
        <div className="mt-16 max-w-2xl mx-auto">
          <div className="bg-surface-code border border-border rounded-lg overflow-hidden text-left">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              <div className="w-3 h-3 rounded-full bg-destructive/60" />
              <div className="w-3 h-3 rounded-full bg-accent/60" />
              <div className="w-3 h-3 rounded-full bg-primary/60" />
              <span className="ml-2 font-mono text-xs text-muted-foreground">main.py</span>
            </div>
            <pre className="p-4 font-mono text-sm leading-relaxed overflow-x-auto">
              <code>
                <span className="text-cyber">def</span> <span className="text-primary">hello_world</span>():
                {"\n"}    <span className="text-cyber">print</span>(<span className="text-accent">"Hello, CodeForge!"</span>)
                {"\n"}
                {"\n"}<span className="text-muted-foreground"># Run with one click ▶</span>
                {"\n"}<span className="text-primary">hello_world</span>()
              </code>
            </pre>
            <div className="border-t border-border px-4 py-2 font-mono text-xs">
              <span className="text-primary">▶ Output:</span>{" "}
              <span className="text-foreground">Hello, CodeForge!</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
