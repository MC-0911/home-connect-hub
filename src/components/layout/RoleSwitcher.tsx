import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutDashboard, Shield, Building2, ShoppingBag, ChevronDown } from "lucide-react";
import { useUserRole, type UserRole } from "@/hooks/useUserRole";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface RoleOption {
  role: UserRole;
  label: string;
  path: string;
  icon: React.ElementType;
}

const ROLE_OPTIONS: RoleOption[] = [
  { role: "admin", label: "Admin Panel", path: "/admin", icon: Shield },
  { role: "agent", label: "Agent Dashboard", path: "/agent-dashboard", icon: Building2 },
  { role: "seller", label: "Seller Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { role: "buyer", label: "Buyer Dashboard", path: "/buyer-dashboard", icon: ShoppingBag },
];

interface RoleSwitcherProps {
  variant: "desktop" | "mobile";
  isHomePage: boolean;
  isScrolled: boolean;
  onMobileClose?: () => void;
}

export function RoleSwitcher({ variant, isHomePage, isScrolled, onMobileClose }: RoleSwitcherProps) {
  const { roles, getDashboardPath, isAdmin } = useUserRole();
  const location = useLocation();

  // Admins get access to ALL dashboards
  const availableRoles = isAdmin
    ? ROLE_OPTIONS
    : ROLE_OPTIONS.filter((opt) => roles.includes(opt.role));
  const dashboardPath = getDashboardPath();
  const currentRole = availableRoles.find((r) => r.path === dashboardPath);
  const isDashboardActive = availableRoles.some((r) => location.pathname === r.path);

  // Single role — render a plain link (no dropdown)
  if (availableRoles.length <= 1) {
    if (variant === "mobile") {
      return (
        <Link
          to={dashboardPath}
          onClick={onMobileClose}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
            isDashboardActive
              ? "bg-accent/20 text-accent-foreground"
              : "text-muted-foreground hover:bg-accent/10 hover:text-accent-foreground"
          )}
        >
          <LayoutDashboard className="w-5 h-5" />
          My Dashboard
        </Link>
      );
    }

    return (
      <Link
        to={dashboardPath}
        className={cn(
          "text-sm font-medium transition-colors hover:text-accent relative py-2 flex items-center gap-2",
          isHomePage && !isScrolled ? "text-primary-foreground/90" : "text-muted-foreground",
          isDashboardActive && (isHomePage && !isScrolled ? "text-primary-foreground" : "text-foreground")
        )}
      >
        <LayoutDashboard className="w-4 h-4" />
        My Dashboard
        {isDashboardActive && (
          <motion.div layoutId="activeNavDashboard" className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-accent rounded-full" />
        )}
      </Link>
    );
  }

  // Multiple roles — render dropdown
  if (variant === "mobile") {
    return (
      <div className="space-y-1">
        <span className="flex items-center gap-3 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
          My Dashboards
        </span>
        {availableRoles.map((opt) => {
          const Icon = opt.icon;
          const isActive = location.pathname === opt.path;
          return (
            <Link
              key={opt.role}
              to={opt.path}
              onClick={onMobileClose}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ml-2",
                isActive
                  ? "bg-accent/20 text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/10 hover:text-accent-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              {opt.label}
            </Link>
          );
        })}
      </div>
    );
  }

  // Desktop dropdown
  const ActiveIcon = currentRole?.icon ?? LayoutDashboard;
  const triggerLabel = isAdmin ? (currentRole?.label ?? "Switch Dashboard") : "My Dashboard";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "text-sm font-medium transition-colors hover:text-accent relative py-2 flex items-center gap-1.5 outline-none",
            isHomePage && !isScrolled ? "text-primary-foreground/90" : "text-muted-foreground",
            isDashboardActive && (isHomePage && !isScrolled ? "text-primary-foreground" : "text-foreground")
          )}
        >
          <ActiveIcon className="w-4 h-4" />
          {triggerLabel}
          <ChevronDown className="w-3 h-3 opacity-60" />
          {isDashboardActive && (
            <motion.div layoutId="activeNavDashboard" className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-accent rounded-full" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {isAdmin && (
          <div className="px-2 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/70 border-b border-border mb-1">
            Switch Account Type
          </div>
        )}
        {availableRoles.map((opt) => {
          const Icon = opt.icon;
          const isActive = location.pathname === opt.path;
          return (
            <DropdownMenuItem key={opt.role} asChild>
              <Link
                to={opt.path}
                className={cn(
                  "flex items-center gap-2.5 cursor-pointer",
                  isActive && "bg-accent/15 font-semibold"
                )}
              >
                <Icon className="w-4 h-4" />
                {opt.label}
                {isActive && (
                  <span className="ml-auto text-[10px] uppercase tracking-wide text-accent font-bold">Active</span>
                )}
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
