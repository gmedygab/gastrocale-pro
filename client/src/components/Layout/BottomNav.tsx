import { useLocation, Link } from "wouter";
import { Home, SquareMenu, Package2, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export default function BottomNav() {
  const [location] = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { href: "/", icon: Home, label: t("common.dashboard") },
    { href: "/recipes", icon: SquareMenu, label: t("common.recipes") },
    { href: "/ingredients", icon: Package2, label: t("common.ingredients") },
    { href: "/reports", icon: BarChart3, label: t("common.reports") },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border z-10">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const isActive = location === item.href || 
            (item.href !== "/" && location.startsWith(item.href));
            
          return (
            <Link key={item.href} href={item.href}>
              <div className="flex flex-col items-center py-2 px-4 cursor-pointer">
                <item.icon 
                  size={20} 
                  className={cn(
                    "mb-1",
                    isActive ? "text-primary" : "text-neutral-500"
                  )} 
                />
                <span 
                  className={cn(
                    "text-xs",
                    isActive ? "text-primary" : "text-neutral-500"
                  )}
                >
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
