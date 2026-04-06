import { Zap, Shield, Users, Terminal, GitBranch, Layers } from "lucide-react";

const features = [
  {
    icon: Terminal,
    title: "Multi-Language Compiler",
    desc: "Python, JavaScript, C++, Java, Go, Rust — compile and run instantly in the browser.",
  },
  {
    icon: Users,
    title: "Live Classrooms",
    desc: "Join sessions with instructors. See code changes in real-time, ask questions, get feedback.",
  },
  {
    icon: Zap,
    title: "Instant Execution",
    desc: "Sub-second compilation with cloud-backed runtimes. No local setup needed.",
  },
  {
    icon: GitBranch,
    title: "Version Snapshots",
    desc: "Save, fork, and revert your code at any point. Built-in revision history.",
  },
  {
    icon: Shield,
    title: "Sandboxed Environment",
    desc: "Every execution runs in an isolated container. Safe, secure, and reproducible.",
  },
  {
    icon: Layers,
    title: "Project Templates",
    desc: "Start from templates for web apps, APIs, scripts, and algorithms challenges.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-6">
        <div className="mb-12 text-center">
          <p className="font-mono text-sm text-primary mb-2">{'/* features */'}</p>
          <h2 className="text-3xl md:text-4xl font-bold font-mono text-foreground">
            Built for <span className="text-primary">developers</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
           <div key={f.title} className="bg-card border border-border rounded-xl p-8 hover:border-glow transition-all min-h-[210px]">
              <f.icon className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-mono font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
