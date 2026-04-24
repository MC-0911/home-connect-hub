import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Shield, Building2, ShoppingBag, ArrowLeftRight } from "lucide-react";
import { useUserRole, type UserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RoleOption {
  role: UserRole;
  label: string;
  shortLabel: string;
  path: string;
  icon: React.ElementType;
}

const ROLE_OPTIONS: RoleOption[] = [
  { role: "admin", label: "Admin Panel", shortLabel: "Admin", path: "/admin", icon: Shield },
  { role: "agent", label: "Agent Dashboard", shortLabel: "Agent", path: "/agent-dashboard", icon: Building2 },
  { role: "seller", label: "Seller Dashboard", shortLabel: "Seller", path: "/dashboard", icon: LayoutDashboard },
  { role: "buyer", label: "Buyer Dashboard", shortLabel: "Buyer", path: "/buyer-dashboard", icon: ShoppingBag },
];

export function AccountTypeBanner() {
  const { roles, isAdmin, loading } = useUserRole();
  const navigate = useNavigate();
  const location = useLocation();

  if (loading) return null;

  // Banner only valuable when user has multiple dashboards (admin or multi-role users)
  const availableRoles = isAdmin
    ? ROLE_OPTIONS
    : ROLE_OPTIONS.filter((opt) => roles.includes(opt.role));

  if (availableRoles.length <= 1) return null;

  const current = availableRoles.find((r) => r.path === location.pathname) ?? availableRoles[0];
  const CurrentIcon = current.icon;

  return (
    <div className="bg-gradient-to-r from-primary/95 to-primary border-b border-border/40 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 py-2 flex-wrap">
          <div className="flex items-center gap-2.5 text-primary-foreground">
            <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center">
              <CurrentIcon className="w-3.5 h-3.5 text-accent" />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="opacity-80">Currently using:</span>
              <span className="font-semibold">{current.label}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-primary-foreground/70 mr-1">
              <ArrowLeftRight className="w-3 h-3" />
              Switch:
            </span>
            {availableRoles.map((opt) => {
              const Icon = opt.icon;
              const isActive = opt.path === current.path;
              return (
                <Button
                  key={opt.role}
                  size="sm"
                  variant="ghost"
                  onClick={() => !isActive && navigate(opt.path)}
                  disabled={isActive}
                  className={cn(
                    "h-7 px-2.5 text-xs gap-1.5 rounded-full transition-all",
                    isActive
                      ? "bg-accent text-accent-foreground hover:bg-accent disabled:opacity-100 cursor-default font-semibold"
                      : "text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  )}
                >
                  <Icon className="w-3 h-3" />
                  {opt.shortLabel}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
