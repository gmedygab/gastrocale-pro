import { useState } from "react";
import { useLocation } from "wouter";
import { 
  Menu, 
  Search, 
  Bell, 
  ChevronRight,
  SquareMenu,
  Package2,
  BarChart3,
  Home,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import LanguageSelector from "@/components/LanguageSelector";

function getPageTitle(path: string): string {
  if (path === "/") return "Dashboard";
  if (path.startsWith("/recipes")) {
    if (path === "/recipes/new") return "New Recipe";
    if (path.includes("/edit")) return "Edit Recipe";
    if (path === "/recipes") return "Recipe Management";
    return "Recipe Details";
  }
  if (path.startsWith("/ingredients")) return "Ingredient Management";
  if (path.startsWith("/reports")) return "Reports";
  if (path.startsWith("/settings")) return "Settings";
  return "GastroCalc Pro";
}

function getPageTitleTranslation(path: string, t: any): string {
  if (path === "/") return t("common.dashboard");
  if (path.startsWith("/recipes")) {
    if (path === "/recipes/new") return t("recipes.newRecipe");
    if (path.includes("/edit")) return t("recipes.editRecipe");
    if (path === "/recipes") return t("recipes.title");
    return t("recipes.details");
  }
  if (path.startsWith("/ingredients")) return t("ingredients.title");
  if (path.startsWith("/reports")) return t("reports.title");
  if (path.startsWith("/settings")) return t("settings.title");
  return "GastroCalc Pro";
}

export default function TopBar() {
  const isMobile = useIsMobile();
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useTranslation();
  const pageTitle = getPageTitleTranslation(location, t);

  const navItems = [
    { href: "/", icon: Home, label: t("common.dashboard") },
    { href: "/recipes", icon: SquareMenu, label: t("common.recipes") },
    { href: "/ingredients", icon: Package2, label: t("common.ingredients") },
    { href: "/reports", icon: BarChart3, label: t("common.reports") },
    { href: "/settings", icon: Settings, label: t("common.settings") },
  ];

  return (
    <header className="bg-white shadow h-16 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center">
        {isMobile && (
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 max-w-[250px]">
              <div className="flex items-center justify-center h-16 border-b border-border">
                <h1 className="text-xl font-slab font-bold text-primary flex items-center">
                  <SquareMenu className="mr-2" size={24} />
                  GastroCalc Pro
                </h1>
              </div>
              <nav className="mt-6">
                <ul>
                  {navItems.map((item) => {
                    const isActive = location === item.href || 
                      (item.href !== "/" && location.startsWith(item.href));
                    
                    return (
                      <li key={item.href} className="mb-1">
                        <Link href={item.href}>
                          <div 
                            className={cn(
                              "flex items-center px-4 py-3 text-neutral-900 hover:bg-primary/10 hover:text-primary",
                              isActive && "bg-primary/10 text-primary"
                            )}
                            onClick={() => setIsMenuOpen(false)}
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
            </SheetContent>
          </Sheet>
        )}
        
        <div className="md:flex items-center">
          {location !== "/" && !location.startsWith("/recipes/new") && !location.includes("/edit") && (
            <div className="hidden md:flex items-center text-sm text-neutral-500 mb-1">
              <Link href="/">
                <div className="hover:text-primary cursor-pointer">{t("common.dashboard")}</div>
              </Link>
              <ChevronRight size={14} className="mx-1" />
              <span className="text-neutral-700">{pageTitle}</span>
            </div>
          )}
          <h2 className="text-xl font-slab font-medium text-neutral-900">
            {pageTitle}
          </h2>
        </div>
      </div>
      
      <div className="flex items-center">
        <div className="hidden sm:block mr-4">
          <LanguageSelector />
        </div>
        <Button variant="ghost" size="icon" className="mr-2">
          <Search />
        </Button>
        <Button variant="ghost" size="icon" className="mr-2">
          <Bell />
        </Button>
        {isMobile && (
          <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-700 font-medium">
            C
          </div>
        )}
      </div>
    </header>
  );
}
