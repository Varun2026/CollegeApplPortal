import { Shield, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { Link, useLocation } from "wouter";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [location] = useLocation();

  return (
    <header className="border-b bg-card sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-2 hover-elevate px-3 py-2 rounded-lg transition-colors cursor-pointer" data-testid="link-home">
            <Shield className="w-6 h-6 text-primary" />
            <div className="hidden md:block">
              <h1 className="font-semibold text-sm leading-tight">
                College Application Portal
              </h1>
              <p className="text-xs text-muted-foreground">
                End-to-End Encrypted
              </p>
            </div>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          <Link href="/">
            <Button
              variant={location === "/" ? "default" : "ghost"}
              size="sm"
              data-testid="link-apply"
            >
              Apply
            </Button>
          </Link>
          <Link href="/admin">
            <Button
              variant={location === "/admin" ? "default" : "ghost"}
              size="sm"
              data-testid="link-admin"
            >
              Admin
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            data-testid="button-theme-toggle"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>
        </nav>
      </div>
    </header>
  );
}
