import { useLocation, Link } from "wouter";
import { Home, SquareMenu, Package2, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Dashboard" },
    { href: "/recipes", icon: SquareMenu, label: "Recipes" },
    { href: "/ingredients", icon: Package2, label: "Ingredients" },
    { href: "/reports", icon: BarChart3, label: "Reports" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border z-10">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const isActive = location === item.href || 
            (item.href !== "/" && location.startsWith(item.href));
            
          return (
            <Link key={item.href} href={item.href}>
              <a className="flex flex-col items-center py-2 px-4">
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
              </a>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
