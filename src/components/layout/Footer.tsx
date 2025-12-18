import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <span className="font-display font-bold text-accent-foreground text-lg">R</span>
              </div>
              <span className="font-display text-xl font-semibold">Royal Landmark</span>
            </Link>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Your trusted partner in finding the perfect property. We connect buyers and sellers with exceptional real estate opportunities.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-primary-foreground/60 hover:text-accent transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-primary-foreground/60 hover:text-accent transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-primary-foreground/60 hover:text-accent transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-primary-foreground/60 hover:text-accent transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { label: "Properties", href: "/properties" },
                { label: "About Us", href: "#" },
                { label: "Contact", href: "#" },
                { label: "Blog", href: "/blog" },
                { label: "Careers", href: "#" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className="text-primary-foreground/70 hover:text-accent transition-colors text-sm"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Property Types */}
          <div>
            <h4 className="font-display font-semibold mb-4">Property Types</h4>
            <ul className="space-y-3">
              {["Houses", "Apartments", "Condos", "Land", "Townhouses", "Villas"].map((item) => (
                <li key={item}>
                  <Link
                    to="/properties"
                    className="text-primary-foreground/70 hover:text-accent transition-colors text-sm"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-primary-foreground/70 text-sm">
                <MapPin className="w-4 h-4 text-accent" />
                123 Market Street, San Francisco, CA
              </li>
              <li className="flex items-center gap-3 text-primary-foreground/70 text-sm">
                <Phone className="w-4 h-4 text-accent" />
                (555) 123-4567
              </li>
              <li className="flex items-center gap-3 text-primary-foreground/70 text-sm">
                <Mail className="w-4 h-4 text-accent" />
                hello@royallandmark.com
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-primary-foreground/50 text-sm">
            © 2024 Royal Landmark. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="#" className="text-primary-foreground/50 hover:text-accent text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link to="#" className="text-primary-foreground/50 hover:text-accent text-sm transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
