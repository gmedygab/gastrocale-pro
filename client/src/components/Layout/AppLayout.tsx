import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-60">
        {/* Top App Bar */}
        <TopBar />
        
        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto pb-20 md:pb-4">
          {children}
        </main>
        
        {/* Mobile Bottom Navigation */}
        {isMobile && <BottomNav />}
      </div>
    </div>
  );
}
