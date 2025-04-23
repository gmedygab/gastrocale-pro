import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  Home,
  SquareMenu,
  Package2,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Sidebar() {
  const [location] = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { href: "/", icon: Home, label: t("common.dashboard") },
    { href: "/recipes", icon: SquareMenu, label: t("common.recipes") },
    { href: "/ingredients", icon: Package2, label: t("common.ingredients") },
    { href: "/reports", icon: BarChart3, label: t("common.reports") },
    { href: "/settings", icon: Settings, label: t("common.settings") },
  ];

  return (
    <aside className="fixed hidden md:flex flex-col h-full w-60 bg-white shadow-md z-10">
      <div className="flex items-center justify-center h-16 border-b border-border">
        <h1 className="text-xl font-slab font-bold text-primary flex items-center">
          <SquareMenu className="mr-2" size={24} />
          GastroCalc Pro
        </h1>
      </div>
      <nav className="mt-6 flex-1">
        <ul>
          {navItems.map((item) => {
            const isActive = location === item.href || 
              (item.href !== "/" && location.startsWith(item.href));
              
            return (
              <li key={item.href} className="mb-1">
                <Link href={item.href}>
                  <div 
                    className={cn(
                      "flex items-center px-4 py-3 text-neutral-900 hover:bg-primary/10 hover:text-primary rounded-r-full",
                      isActive && "bg-primary/10 text-primary"
                    )}
                  >
                    <item.icon className="mr-3" size={20} />
                    {item.label}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-border">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-neutral-200 mr-3 flex items-center justify-center text-neutral-700 font-medium">
            C
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-900">Chef Michael</p>
            <p className="text-xs text-neutral-500">chef@example.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
