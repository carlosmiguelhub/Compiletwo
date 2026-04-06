import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ClassroomsSection from "@/components/ClassroomsSection";
import CompilerSection from "@/components/CompilerSection";
import FeaturesSection from "@/components/FeaturesSection";
import FooterSection from "@/components/FooterSection";

const Index = () => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar isDark={isDark} toggleTheme={() => setIsDark(!isDark)} />
      <HeroSection />
      <ClassroomsSection />
      <CompilerSection />
      <FeaturesSection />
      <FooterSection />
    </div>
  );
};

export default Index;
