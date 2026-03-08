import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone } from "lucide-react";

export function DashboardFooter() {
  return (
    <footer className="border-t border-border/50 bg-card/50 mt-auto">
      <div className="px-8 py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="font-display font-bold text-primary-foreground text-sm">R</span>
            </div>
            <span className="font-display text-sm font-semibold text-foreground">Royal Landmark</span>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
            <Link to="/properties" className="text-muted-foreground hover:text-foreground transition-colors">Properties</Link>
            <Link to="/blog" className="text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
            <Link to="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link to="#" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
          </nav>

          {/* Contact & Social */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-4 text-xs text-muted-foreground mr-2">
              <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> (555) 123-4567</span>
              <span className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> hello@royallandmark.com</span>
            </div>
            <div className="flex items-center gap-2">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border/30 text-center">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Royal Landmark. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
