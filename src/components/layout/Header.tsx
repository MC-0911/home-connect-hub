import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Home, Search, Heart, User, LogIn, LogOut, LayoutDashboard, ClipboardList, Shield, MessageSquare } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import { useMessages } from "@/hooks/useMessages";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
const navLinks = [{
  href: "/",
  label: "Home",
  icon: Home
}, {
  href: "/properties",
  label: "Properties",
  icon: Search
}, {
  href: "/property-requirements",
  label: "Find My Property",
  icon: ClipboardList
}, {
  href: "/favorites",
  label: "Favorites",
  icon: Heart
}];
export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const {
    isAdmin
  } = useAdmin();
  const {
    profile
  } = useProfile();
  const {
    getUnreadCount
  } = useMessages();
  const unreadCount = getUnreadCount();
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  useEffect(() => {
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };
  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };
  return <header className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-300", isHomePage && !isScrolled ? "bg-transparent" : "bg-card/95 backdrop-blur-md border-b border-border shadow-sm")}>
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shadow-gold transition-transform group-hover:scale-105">
              <span className="font-display font-bold text-accent-foreground text-lg">R</span>
            </div>
            <div className="hidden sm:block">
              <span className={cn("font-display text-xl font-semibold transition-colors", isHomePage && !isScrolled ? "text-primary-foreground" : "text-foreground")}>
                Royal Landmark
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => <Link key={link.href} to={link.href} className={cn("text-sm font-medium transition-colors hover:text-accent relative py-2", isHomePage && !isScrolled ? "text-primary-foreground/90" : "text-muted-foreground", location.pathname === link.href && (isHomePage && !isScrolled ? "text-primary-foreground" : "text-foreground"))}>
                {link.label}
                {location.pathname === link.href && <motion.div layoutId="activeNav" className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-accent rounded-full" />}
              </Link>)}
            {user && <Link to="/dashboard" className={cn("text-sm font-medium transition-colors hover:text-accent relative py-2 flex items-center gap-2", isHomePage && !isScrolled ? "text-primary-foreground/90" : "text-muted-foreground", location.pathname === "/dashboard" && (isHomePage && !isScrolled ? "text-primary-foreground" : "text-foreground"))}>
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
                {location.pathname === "/dashboard" && <motion.div layoutId="activeNavDashboard" className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-accent rounded-full" />}
              </Link>}
            {user && <Link to="/messages" className={cn("text-sm font-medium transition-colors hover:text-accent relative py-2 flex items-center gap-2", isHomePage && !isScrolled ? "text-primary-foreground/90" : "text-muted-foreground", location.pathname === "/messages" && (isHomePage && !isScrolled ? "text-primary-foreground" : "text-foreground"))}>
                <div className="relative">
                  <MessageSquare className="w-4 h-4" />
                  {unreadCount > 0 && <Badge className="absolute -top-2 -right-2 h-4 min-w-4 p-0 flex items-center justify-center text-[10px] bg-destructive text-destructive-foreground">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>}
                </div>
                Messages
                {location.pathname === "/messages" && <motion.div layoutId="activeNavMessages" className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-accent rounded-full" />}
              </Link>}
            {isAdmin && <Link to="/admin" className={cn("text-sm font-medium transition-colors hover:text-accent relative py-2 flex items-center gap-2", isHomePage && !isScrolled ? "text-primary-foreground/90" : "text-muted-foreground", location.pathname === "/admin" && (isHomePage && !isScrolled ? "text-primary-foreground" : "text-foreground"))}>
                <Shield className="w-4 h-4" />
                Admin
                {location.pathname === "/admin" && <motion.div layoutId="activeNavAdmin" className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-accent rounded-full" />}
              </Link>}
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center gap-3">
            {user ? <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                    <Avatar className="h-10 w-10 border-2 border-accent">
                      <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || user.email || ''} />
                      <AvatarFallback className="bg-primary text-primary-foreground font-display">
                        {user.email ? getInitials(user.email) : <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu> : <>
                <Button variant={isHomePage && !isScrolled ? "hero-outline" : "ghost"} size="sm" asChild>
                  <Link to="/auth">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Link>
                </Button>
                <Button variant={isHomePage && !isScrolled ? "hero" : "gold"} size="sm" asChild>
                  <Link to="/auth?mode=signup">Get Started</Link>
                </Button>
              </>}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 rounded-lg transition-colors hover:bg-secondary/50" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className={cn("w-6 h-6", isHomePage && !isScrolled ? "text-primary-foreground" : "text-foreground")} /> : <Menu className={cn("w-6 h-6", isHomePage && !isScrolled ? "text-primary-foreground" : "text-foreground")} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && <motion.div initial={{
        opacity: 0,
        height: 0
      }} animate={{
        opacity: 1,
        height: "auto"
      }} exit={{
        opacity: 0,
        height: 0
      }} className="md:hidden bg-card border-b border-border overflow-hidden">
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navLinks.map(link => <Link key={link.href} to={link.href} onClick={() => setMobileMenuOpen(false)} className={cn("flex items-center gap-3 px-4 py-3 rounded-lg transition-colors", location.pathname === link.href ? "bg-accent/20 text-accent-foreground" : "text-muted-foreground hover:bg-secondary/50")}>
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>)}
              {user && <Link to="/messages" onClick={() => setMobileMenuOpen(false)} className={cn("flex items-center gap-3 px-4 py-3 rounded-lg transition-colors", location.pathname === "/messages" ? "bg-accent/20 text-accent-foreground" : "text-muted-foreground hover:bg-secondary/50")}>
                  <div className="relative">
                    <MessageSquare className="w-5 h-5" />
                    {unreadCount > 0 && <Badge className="absolute -top-1 -right-1 h-4 min-w-4 p-0 flex items-center justify-center text-[10px] bg-destructive text-destructive-foreground">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </Badge>}
                  </div>
                  Messages
                </Link>}
              {isAdmin && <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className={cn("flex items-center gap-3 px-4 py-3 rounded-lg transition-colors", location.pathname === "/admin" ? "bg-accent/20 text-accent-foreground" : "text-muted-foreground hover:bg-secondary/50")}>
                  <Shield className="w-5 h-5" />
                  Admin
                </Link>}
              <div className="pt-4 border-t border-border space-y-2">
                {user ? <>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                        <User className="w-4 h-4 mr-2" />
                        My Profile
                      </Link>
                    </Button>
                    <Button variant="destructive" onClick={() => {
                handleSignOut();
                setMobileMenuOpen(false);
              }} className="w-full bg-primary">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </> : <>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                        Sign In
                      </Link>
                    </Button>
                    <Button variant="gold" className="w-full" asChild>
                      <Link to="/auth?mode=signup" onClick={() => setMobileMenuOpen(false)}>
                        Get Started
                      </Link>
                    </Button>
                  </>}
              </div>
            </div>
          </motion.div>}
      </AnimatePresence>
    </header>;
}