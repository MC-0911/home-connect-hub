import { Search, ClipboardCheck, FileText, Truck, LucideIcon } from "lucide-react";

import servicePropertyMatching from "@/assets/service-property-matching.jpg";
import serviceHomeInspection from "@/assets/service-home-inspection.jpg";
import serviceTitleVerification from "@/assets/service-title-verification.jpg";
import serviceMoving from "@/assets/service-moving.jpg";

// Banner images for service detail pages
import bannerPropertyMatching from "@/assets/banner-property-matching.jpg";
import bannerHomeInspection from "@/assets/banner-home-inspection.jpg";
import bannerTitleVerification from "@/assets/banner-title-verification.jpg";
import bannerMovingRelocation from "@/assets/banner-moving-relocation.jpg";

export interface ServiceData {
  slug: string;
  icon: LucideIcon;
  title: string;
  shortDescription: string;
  fullDescription: string;
  benefits: string[];
  features: string[];
  process: { step: number; title: string; description: string }[];
  pricing?: string;
  cta: string;
  cardImage: string;
  bannerImage: string;
}

export const servicesData: ServiceData[] = [
  {
    slug: "property-matching",
    icon: Search,
    title: "Smart Property Matching",
    shortDescription: "AI-powered matching that finds properties aligned with your specific requirements, budget, and lifestyle preferences.",
    fullDescription: "Our advanced AI-powered property matching service analyzes your preferences, budget, and lifestyle needs to find the perfect property for you. We go beyond basic filters to understand what truly matters to you in a home, saving you countless hours of searching.",
    benefits: [
      "Personalized property recommendations",
      "Saves 80% of your search time",
      "Real-time alerts for new matches",
      "Expert consultation included",
      "Priority access to new listings",
    ],
    features: [
      "AI-powered preference analysis",
      "Neighborhood compatibility scoring",
      "Budget optimization suggestions",
      "Lifestyle matching algorithm",
      "Real-time market insights",
      "Dedicated property specialist",
    ],
    process: [
      { step: 1, title: "Share Your Preferences", description: "Tell us about your ideal property, budget, and must-have features." },
      { step: 2, title: "AI Analysis", description: "Our system analyzes thousands of listings to find your perfect matches." },
      { step: 3, title: "Curated Recommendations", description: "Receive a personalized list of properties that meet your criteria." },
      { step: 4, title: "Schedule Viewings", description: "Book visits for properties you love with our dedicated team." },
    ],
    pricing: "Free consultation • Premium matching from $99",
    cta: "Get Matched",
    cardImage: servicePropertyMatching,
    bannerImage: bannerPropertyMatching,
  },
  {
    slug: "home-inspection",
    icon: ClipboardCheck,
    title: "Professional Home Inspection",
    shortDescription: "Certified inspectors provide comprehensive property evaluation to identify potential issues before purchase.",
    fullDescription: "Our certified home inspectors conduct thorough 200+ point inspections to uncover any hidden issues before you make one of the biggest investments of your life. We provide detailed reports with photos and recommendations, giving you complete peace of mind.",
    benefits: [
      "200+ point detailed inspection",
      "Certified expert reports",
      "Prevent costly surprises",
      "Same-day report delivery",
      "Negotiation leverage",
    ],
    features: [
      "Structural integrity assessment",
      "Electrical system evaluation",
      "Plumbing inspection",
      "HVAC system check",
      "Roof and foundation analysis",
      "Pest and mold detection",
      "Safety hazard identification",
      "Energy efficiency assessment",
    ],
    process: [
      { step: 1, title: "Book Inspection", description: "Schedule a convenient time for our certified inspector to visit." },
      { step: 2, title: "Comprehensive Inspection", description: "Our expert conducts a thorough 200+ point evaluation." },
      { step: 3, title: "Detailed Report", description: "Receive a comprehensive report with photos and recommendations." },
      { step: 4, title: "Expert Consultation", description: "Discuss findings and get advice on next steps." },
    ],
    pricing: "Starting from $299 • Premium inspection from $499",
    cta: "Schedule Inspection",
    cardImage: serviceHomeInspection,
    bannerImage: bannerHomeInspection,
  },
  {
    slug: "title-verification",
    icon: FileText,
    title: "Title Search & Verification",
    shortDescription: "Thorough legal verification ensuring clear property ownership and preventing future disputes.",
    fullDescription: "Protect your investment with our comprehensive title search and verification service. Our legal experts thoroughly examine property records, ownership history, and any encumbrances to ensure you're getting a clean title with no hidden surprises.",
    benefits: [
      "100% ownership guarantee",
      "Legal document verification",
      "Dispute prevention",
      "Lien and encumbrance search",
      "Title insurance coordination",
    ],
    features: [
      "Complete ownership history review",
      "Lien and judgment search",
      "Easement verification",
      "Tax status confirmation",
      "Legal description validation",
      "Survey review",
      "Mortgage payoff verification",
      "Title insurance facilitation",
    ],
    process: [
      { step: 1, title: "Submit Property Details", description: "Provide property information for our title search." },
      { step: 2, title: "Comprehensive Search", description: "Our team examines all public records and ownership history." },
      { step: 3, title: "Issue Identification", description: "We identify any liens, encumbrances, or title defects." },
      { step: 4, title: "Clear Title Report", description: "Receive a detailed report confirming clear title or issues found." },
    ],
    pricing: "Standard search from $199 • Full verification from $399",
    cta: "Verify Title",
    cardImage: serviceTitleVerification,
    bannerImage: bannerTitleVerification,
  },
  {
    slug: "moving-relocation",
    icon: Truck,
    title: "Moving & Relocation",
    shortDescription: "Seamless moving solutions with vetted partners for packing, transport, and settling in.",
    fullDescription: "Make your move stress-free with our comprehensive relocation services. We partner with vetted, insured moving companies to handle everything from packing to unpacking, ensuring your belongings arrive safely at your new home.",
    benefits: [
      "Vetted moving partners",
      "Insurance-covered transport",
      "Stress-free relocation",
      "Packing and unpacking services",
      "Storage solutions available",
    ],
    features: [
      "Professional packing services",
      "Secure transportation",
      "Full insurance coverage",
      "Climate-controlled storage",
      "Unpacking and setup",
      "Furniture assembly",
      "Disposal of packing materials",
      "Move coordination",
    ],
    process: [
      { step: 1, title: "Get a Quote", description: "Tell us about your move and receive competitive quotes." },
      { step: 2, title: "Choose Your Package", description: "Select from basic to full-service moving options." },
      { step: 3, title: "Moving Day", description: "Our professional team handles everything with care." },
      { step: 4, title: "Settle In", description: "We help you unpack and get settled in your new home." },
    ],
    pricing: "Local moves from $299 • Long-distance from $999",
    cta: "Plan My Move",
    cardImage: serviceMoving,
    bannerImage: bannerMovingRelocation,
  },
];

export function getServiceBySlug(slug: string): ServiceData | undefined {
  return servicesData.find((service) => service.slug === slug);
}
