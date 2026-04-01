import SiteHeader from "@/components/SiteHeader";
import HeroSection from "@/components/HeroSection";
import ShowcaseSection from "@/components/ShowcaseSection";
import ServicesSection from "@/components/ServicesSection";
import ExpertiseSection from "@/components/ExpertiseSection";
import ProjectsSection from "@/components/ProjectsSection";
import TimelineSection from "@/components/TimelineSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import CtaBand from "@/components/CtaBand";
import SiteFooter from "@/components/SiteFooter";
import FloatingElements from "@/components/FloatingElements";

const Index = () => {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <HeroSection />
        <ShowcaseSection />
        <ServicesSection />
        <ExpertiseSection />
        <ProjectsSection />
        <TimelineSection />
        <TestimonialsSection />
        <CtaBand />
      </main>
      <SiteFooter />
      <FloatingElements />
    </div>
  );
};

export default Index;
