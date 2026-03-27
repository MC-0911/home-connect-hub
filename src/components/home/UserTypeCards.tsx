import { motion } from "framer-motion";
import { Search, Home, Briefcase, ArrowRight, Star, ShieldCheck, CalendarCheck, Sparkles, Camera, Users, BarChart3, ClipboardList, FileText, TrendingUp, LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

const userTypes = [
{
  icon: Search,
  title: "Buyers & Tenants",
  microStat: "2,400+ premium listings • verified daily",
  benefits: [
  { text: "Browse thousands of verified listings", icon: ShieldCheck },
  { text: "Schedule visits & make offers online", icon: CalendarCheck },
  { text: "Personalized property recommendations", icon: Sparkles }],

  specTag: "Expert Guidance 24/7",
  cta: "Start Searching",
  link: "/properties",
  footerNote: "⚡ powerful search tools & instant alerts",
  accentClass: "buyer"
},
{
  icon: Home,
  title: "Sellers & Landlords",
  microStat: "avg 23% faster sale • qualified pool",
  benefits: [
  { text: "Free property listing with photos & details", icon: Camera },
  { text: "Wide pool of verified buyers & tenants", icon: Users },
  { text: "Track offers, visits & inquiries in one place", icon: ClipboardList }],

  specTag: "Max ROI · Dedicated Advisor",
  cta: "List Your Property",
  link: "/add-property",
  footerNote: "✨ free listing · exposure to thousands",
  accentClass: "seller"
},
{
  icon: Briefcase,
  title: "Real Estate Agents",
  microStat: "join 6,200+ agents • elite tools",
  benefits: [
  { text: "Dedicated dashboard & CRM tools", icon: BarChart3 },
  { text: "Manage leads, appointments & documents", icon: FileText },
  { text: "Performance analytics & commission tracking", icon: TrendingUp }],

  specTag: "14‑Day Trial · No Card",
  cta: "Join as Agent",
  link: "/agent-dashboard",
  footerNote: "⭐ grow your business · professional tools",
  accentClass: "agent"
}];


const iconColors = {
  buyer: "bg-[hsl(228_76%_59%/0.3)]",
  seller: "bg-[hsl(142_76%_36%/0.3)]",
  agent: "bg-[hsl(262_83%_58%/0.3)]"
};

const markerColors = {
  buyer: "text-[#b1dbff] group-hover/benefit:text-[#60b0ff] group-hover/benefit:bg-[rgba(100,180,255,0.3)] group-hover/benefit:border-[rgba(100,180,255,0.5)] group-hover/benefit:shadow-[0_0_14px_rgba(100,180,255,0.4)]",
  seller: "text-[#b0f0c0] group-hover/benefit:text-[#60e080] group-hover/benefit:bg-[rgba(80,220,130,0.3)] group-hover/benefit:border-[rgba(80,220,130,0.5)] group-hover/benefit:shadow-[0_0_14px_rgba(80,220,130,0.4)]",
  agent: "text-[#e2c5ff] group-hover/benefit:text-[#c090ff] group-hover/benefit:bg-[rgba(180,130,255,0.3)] group-hover/benefit:border-[rgba(180,130,255,0.5)] group-hover/benefit:shadow-[0_0_14px_rgba(180,130,255,0.4)]"
};

export function UserTypeCards({ className }: {className?: string;}) {
  return (
    <section className={`py-20 sm:py-28 relative overflow-hidden ${className}`} style={{ background: "radial-gradient(circle at 10% 20%, hsl(var(--navy)), hsl(var(--navy-dark)))" }}>
      {/* Grain overlay */}
      <div className="absolute inset-0 opacity-[0.15] pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJmIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc0IiBudW1PY3RhdmVzPSIzIiAvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNmKSIgb3BhY2l0eT0iMC4wNCIgLz48L3N2Zz4=')" }} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14">
          
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-sm font-medium mb-4 border border-white/20 backdrop-blur-sm">
            For Everyone
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-white mb-4">
            How Can We Help You?
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Whether you're buying, selling, or managing properties — we have the tools you need.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-8 lg:gap-10">
          {userTypes.map((type, index) =>
          <motion.div
            key={type.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
            whileHover={{ y: -14, scale: 1.025, transition: { type: "spring", stiffness: 260, damping: 20 } }}
            className="group relative flex-1 min-w-[290px] max-w-[380px] rounded-[3.5rem_3.5rem_3rem_3rem] p-7 sm:p-8 flex flex-col overflow-hidden border border-white/10 hover:border-white/30 transition-[border-color,box-shadow] duration-500"
            style={{
              background: "rgba(12, 22, 34, 0.65)",
              backdropFilter: "blur(18px) saturate(200%)",
              boxShadow: "0 50px 80px -20px rgba(0,0,0,0.9), inset 0 0 0 1px rgba(255,255,255,0.05), 0 0 30px -5px rgba(0,180,255,0.2)"
            }}>
            
              {/* Floating orbs */}
              <div className="absolute -top-[30%] -right-[30%] w-[280px] h-[280px] rounded-full pointer-events-none z-0 animate-pulse" style={{ background: "radial-gradient(circle at 40% 40%, rgba(255,180,100,0.2), transparent 70%)", filter: "blur(40px)" }} />
              <div className="absolute -bottom-[30%] -left-[20%] w-[300px] h-[300px] rounded-full pointer-events-none z-0 animate-pulse" style={{ background: "radial-gradient(circle, rgba(80,160,255,0.15), transparent 75%)", filter: "blur(50px)", animationDelay: "2s" }} />

              {/* Header */}
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center border border-white/25 backdrop-blur-sm transition-all duration-300 group-hover:scale-105 group-hover:border-white/50 ${iconColors[type.accentClass as keyof typeof iconColors]}`} style={{ boxShadow: "0 10px 22px -8px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(255,255,255,0.1)" }}>
                  <type.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-[2rem] font-bold leading-tight bg-gradient-to-br from-white via-blue-100 to-blue-200 bg-clip-text text-transparent">
                  {type.title}
                </h3>
              </div>

              {/* Shimmer divider */}
              <div className="w-full h-[2px] mb-5 relative z-10 animate-shimmer" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), rgba(140,210,255,0.8), rgba(255,255,255,0.3), transparent)", backgroundSize: "200% 100%" }} />

              {/* Micro stat */}
              <div className="flex items-center gap-2 text-xs text-blue-100 bg-[rgba(0,15,30,0.5)] w-fit px-4 py-1.5 rounded-full border border-white/15 backdrop-blur-sm mb-5 relative z-10 font-medium" style={{ boxShadow: "0 5px 12px rgba(0,0,0,0.4)" }}>
                <Star className="w-3.5 h-3.5 text-amber-300 drop-shadow-[0_0_6px_#ffb347]" />
                {type.microStat}
              </div>

              {/* Benefits */}
              <ul className="space-y-4 mb-6 flex-1 relative z-10">
              {type.benefits.map((benefit, idx) => {
                const BenefitIcon = benefit.icon;
                return (
                  <li key={idx} className="group/benefit flex items-center gap-3 text-[1.05rem] text-white/95 leading-relaxed transition-transform duration-200 hover:translate-x-1.5">
                      <span className={`w-9 h-9 rounded-2xl flex items-center justify-center border border-white/25 shrink-0 bg-[rgba(110,180,255,0.15)] transition-all duration-200 ${markerColors[type.accentClass as keyof typeof markerColors]}`} style={{ boxShadow: "0 6px 14px rgba(0,30,60,0.7)" }}>
                        <BenefitIcon className="w-4 h-4" />
                      </span>
                      {benefit.text}
                    </li>);

              })}
              </ul>

              {/* Spec tag */}
              <div className="inline-block bg-white/5 border rounded-full px-4 py-1.5 text-[0.8rem] font-semibold uppercase tracking-wider w-fit backdrop-blur-sm mb-4 relative z-10 text-primary border-primary" style={{ boxShadow: "0 4px 10px rgba(0,0,0,0.3)" }}>
                {type.specTag}
              </div>

              {/* CTA */}
              <Link
              to={type.link}
              className="flex items-center justify-between w-full px-6 py-4 rounded-full border border-white/20 text-white font-semibold text-[1.1rem] backdrop-blur-xl mt-2 relative z-10 transition-all duration-300 hover:scale-[1.02] group/cta"
              style={{
                background: "linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
                boxShadow: "0 20px 30px -14px black, inset 0 0 0 1px rgba(255,255,240,0.1)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "linear-gradient(145deg, rgba(60,100,180,0.5), rgba(30,60,120,0.6))";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.6)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
              }}>
              
                {type.cta}
                <span className="w-10 h-10 rounded-full bg-white/20 border border-white/40 flex items-center justify-center transition-all duration-300 group-hover/cta:bg-white group-hover/cta:text-navy group-hover/cta:translate-x-2 group-hover/cta:scale-110" style={{ boxShadow: "0 5px 12px rgba(0,0,0,0.4)" }}>
                  <ArrowRight className="w-5 h-5" />
                </span>
              </Link>

              {/* Footer note */}
              <p className="text-[0.7rem] text-white/40 text-center mt-4 tracking-wide relative z-10 transition-colors duration-200 group-hover:text-white/80">
                {type.footerNote}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </section>);

}