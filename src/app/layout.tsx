import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import PikachuChat from "@/src/components/shared/PikachuChat"; 
import Footer from '@/src/components/shared/Footer';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });

export const metadata: Metadata = {
  // Am modificat titlul aici:
  title: "Queen&King Fit | Performanță & Nutriție AI",
  description: "Monitorizează-ți caloriile.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="ro" className="scroll-smooth">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased bg-[#030303] text-white selection:bg-fuchsia-500 selection:text-white overflow-x-hidden flex flex-col min-h-screen relative`}>
        
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        
        <PikachuChat />
        <Footer />
      </body>
    </html>
  );
}