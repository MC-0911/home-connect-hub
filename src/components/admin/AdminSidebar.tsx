import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, Users, Home, FileText, MessageSquare, 
  CalendarCheck, Settings, Crown, ChevronLeft, ChevronRight,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export type AdminSection = 
  | 'analytics' | 'users' | 'listings' | 'leads' 
  | 'bookings' | 'blogs' | 'settings';

interface AdminSidebarProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const navItems: { id: AdminSection; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'analytics', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'listings', label: 'Listings', icon: Home },
  { id: 'leads', label: 'Leads', icon: MessageSquare },
  { id: 'bookings', label: 'Bookings', icon: CalendarCheck },
  { id: 'blogs', label: 'Blogs', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar({ activeSection, onSectionChange }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { profile } = useProfile();

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed left-0 top-0 h-screen z-50 flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, hsl(var(--secondary)) 0%, hsl(228, 60%, 35%) 100%)',
      }}
    >
      {/* Header */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white/10 shrink-0">
            <Crown className="h-6 w-6 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-xl font-display font-bold text-white whitespace-nowrap"
              >
                Royal Landmark
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Agent Profile */}
      <div className={cn("px-5 py-6 border-b border-white/10", collapsed && "px-3 py-4")}>
        <div className={cn("flex flex-col items-center gap-2", collapsed && "items-center")}>
          <Avatar className={cn("border-2 border-white/30 transition-all", collapsed ? "h-10 w-10" : "h-20 w-20")}>
            <AvatarImage src={profile?.avatar_url || ''} />
            <AvatarFallback className="bg-white/20 text-white text-lg">
              {profile?.full_name?.charAt(0) || 'A'}
            </AvatarFallback>
          </Avatar>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <p className="text-white font-semibold text-sm">
                  {profile?.full_name || 'Admin User'}
                </p>
                <p className="text-white/60 text-xs">Administrator</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                isActive
                  ? "bg-white/20 text-white shadow-lg shadow-black/10"
                  : "text-white/70 hover:bg-white/10 hover:text-white hover:translate-x-1"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="admin-nav-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon className={cn("h-5 w-5 shrink-0", isActive && "drop-shadow-lg")} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="text-sm font-medium whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:bg-white/10 hover:text-white transition-all"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm font-medium whitespace-nowrap"
              >
                Back to Site
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all"
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>
    </motion.aside>
  );
}
