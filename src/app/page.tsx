import Navbar from '@/src/components/landing/Navbar';
import HeroSection from '@/src/components/landing/HeroSection';
import TestimonialsSection from '@/src/components/landing/TestimonialsSection';
import RotatingTickets from '@/src/components/landing/RotatingTickets';
import SponsorsSection from '@/src/components/landing/SponsorsSection';
import ContactSection from '@/src/components/landing/ContactSection';
import InteractiveBentoGrid from '@/src/components/landing/InteractiveBentoGrid';
import StarsWrapper from '@/src/components/canvas/StarsWrapper';

export default function PremiumNutritionApp() {
  return (
    <main className="relative min-h-screen bg-[#030303] text-white font-sans overflow-hidden selection:bg-fuchsia-600 selection:text-white">
      
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-fuchsia-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* FUNDAL 3D STELE - Apelăm wrapper-ul */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <StarsWrapper />
      </div>

      <div className="relative z-10">
        <Navbar />

        <div className="max-w-7xl mx-auto px-6 pt-40 pb-20 grid grid-cols-1 xl:grid-cols-12 gap-12 xl:gap-8 items-center min-h-screen">
          <HeroSection />
          <InteractiveBentoGrid />
        </div>
        
        <RotatingTickets />
        <TestimonialsSection />
        <SponsorsSection />
        <ContactSection />
      </div>
    </main>
  );
}