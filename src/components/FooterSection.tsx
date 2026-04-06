import { Terminal } from "lucide-react";

const FooterSection = () => (
  <footer className="border-t border-border py-12">
    <div className="container mx-auto px-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-primary" />
          <span className="font-mono text-sm text-foreground">
            <span className="text-primary">{'<'}</span>CodeForge<span className="text-primary">{'/>'}</span>
          </span>
        </div>
        <p className="font-mono text-xs text-muted-foreground">
          © 2026 CodeForge. All rights reserved. <span className="text-primary">{'// '}</span>Built for developers.
        </p>
      </div>
    </div>
  </footer>
);

export default FooterSection;
