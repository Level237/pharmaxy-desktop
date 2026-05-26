import React from "react";
import { OnboardingHeader } from "./OnboardingHeader";
import { OnboardingFooter } from "./OnboardingFooter";

interface OnboardingLayoutProps {
  children: React.ReactNode;
}

export function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <OnboardingHeader />
      
      <main className="flex-1 flex items-center justify-center p-6 py-12">
        <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          {children}
        </div>
      </main>
      
      <OnboardingFooter />
    </div>
  );
}
