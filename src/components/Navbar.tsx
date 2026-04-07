import { Terminal, Moon, Sun, Menu, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface NavbarProps {
  isDark: boolean;
  toggleTheme: () => void;
}

const Navbar = ({ isDark, toggleTheme }: NavbarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <Terminal className="h-6 w-6 text-primary" />
          <span className="font-mono text-lg font-bold text-foreground">
            <span className="text-primary">{"<"}</span>
            Judge-Compilo
            <span className="text-primary">{" />"}</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-10">
          <a href="#classrooms" className="font-mono text-sm text-muted-foreground hover:text-primary transition-colors">
            classrooms
          </a>
          <a href="#compiler" className="font-mono text-sm text-muted-foreground hover:text-primary transition-colors">
            compiler
          </a>
          <a href="#features" className="font-mono text-sm text-muted-foreground hover:text-primary transition-colors">
            features
          </a>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md border border-border hover:border-primary hover:text-primary text-muted-foreground transition-all"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            className="font-mono text-sm bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
            onClick={() => navigate("/login")}
          >
            $ login
          </button>
        </div>

        <button className="md:hidden text-muted-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-6 py-4 flex flex-col gap-4">
          <a href="#classrooms" className="font-mono text-sm text-muted-foreground hover:text-primary">
            classrooms
          </a>
          <a href="#compiler" className="font-mono text-sm text-muted-foreground hover:text-primary">
            compiler
          </a>
          <a href="#features" className="font-mono text-sm text-muted-foreground hover:text-primary">
            features
          </a>
          <div className="flex gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-md border border-border text-muted-foreground">
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              className="font-mono text-sm bg-primary text-primary-foreground px-4 py-2 rounded-md flex-1"
              onClick={() => {
                setMobileOpen(false);
                navigate("/login");
              }}
            >
              $ login
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;