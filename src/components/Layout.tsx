import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { LayoutDashboard, SquareKanban as KanbanSquare, Briefcase, Users, Building2, Menu, X, BarChart2 } from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pipeline", label: "Pipeline", icon: KanbanSquare },
  { href: "/deals", label: "Deals", icon: Briefcase },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/companies", label: "Companies", icon: Building2 },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar flex flex-col transition-transform duration-200",
          "lg:relative lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center gap-2 px-6 py-5 border-b border-sidebar-border">
          <div className="w-7 h-7 rounded-md bg-blue-500 flex items-center justify-center flex-shrink-0">
            <KanbanSquare className="w-4 h-4 text-white" />
          </div>
          <span className="text-sidebar-foreground font-semibold text-base tracking-tight">PipelineIQ</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === "/" ? location === "/" : location.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-border/40 hover:text-sidebar-foreground"
                )}
                onClick={() => setMobileOpen(false)}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-6 py-4 border-t border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/40">PipelineIQ CRM v1.0</p>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-md hover:bg-muted"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-semibold">PipelineIQ</span>
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
