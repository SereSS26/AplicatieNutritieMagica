import React from 'react';
import Sidebar from '@/src/components/dashboard/Sidebar';
import StarsCanvas from '@/src/components/canvas/Stars';
import { DashboardProvider } from "@/src/context/DashboardContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      {/* Am scos overflow-hidden pentru a lăsa fereastra să facă scroll natural */}
      <div className="flex min-h-screen bg-[#030303] relative">
        
        {/* Fundalul cu stele în spatele Dashboard-ului */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <StarsCanvas />
        </div>

        {/* Sidebar-ul devine STICKY: va sta fixat pe ecran în timp ce pagina face scroll */}
        <div className="sticky top-0 h-screen z-20 shrink-0">
          <Sidebar />
        </div>

        {/* Am eliminat h-screen și overflow-y-auto de pe conținut */}
        <div className="flex-1 relative z-10 flex flex-col w-full">
           {/* Am pus glow-ul ca 'fixed' ca să nu se taie la scroll */}
           <div className="fixed top-0 left-0 w-full h-full bg-fuchsia-500/5 pointer-events-none blur-[120px] z-0" />
           
           <div className="relative z-10 flex-1">
              {children}
           </div>
        </div>
        
      </div>
    </DashboardProvider>
  );
}