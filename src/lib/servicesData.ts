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

export interface FAQItem {
  question: string;
  answer: string;
}

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
  faqs: FAQItem[];
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
    faqs: [
      { question: "How does AI property matching work?", answer: "Our AI analyzes your preferences, budget, location requirements, and lifestyle needs to identify properties that best match your criteria. It learns from your feedback to continuously improve recommendations." },
      { question: "How long does it take to receive property matches?", answer: "You'll receive your first batch of curated property recommendations within 24-48 hours after completing your preference profile. New matches are sent in real-time as they become available." },
      { question: "Is the consultation really free?", answer: "Yes! Your initial consultation with our property specialist is completely free. We'll discuss your needs and explain how our matching service works with no obligation." },
      { question: "Can I modify my preferences after signing up?", answer: "Absolutely. You can update your preferences anytime through your dashboard, and our AI will immediately adjust recommendations based on your new criteria." },
    ],
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
    faqs: [
      { question: "How long does a home inspection take?", answer: "A typical home inspection takes 2-4 hours depending on the size and condition of the property. Larger homes or properties with multiple issues may take longer." },
      { question: "Should I attend the inspection?", answer: "We highly encourage buyers to attend the inspection. This gives you the opportunity to ask questions, see issues firsthand, and learn about the home's systems and maintenance needs." },
      { question: "What's included in the inspection report?", answer: "Our comprehensive report includes detailed findings on all major systems (structural, electrical, plumbing, HVAC, roof), photos of any issues, severity ratings, and recommendations for repairs or further evaluation." },
      { question: "Can the inspection results be used for negotiation?", answer: "Yes! Many buyers use inspection findings to negotiate repairs or price reductions with sellers. Our detailed reports provide the documentation needed for these discussions." },
    ],
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
    faqs: [
      { question: "Why do I need a title search?", answer: "A title search protects you from inheriting legal problems like unpaid taxes, liens, boundary disputes, or ownership claims. It ensures you're getting a clean, marketable title to the property." },
      { question: "How long does the title search process take?", answer: "A standard title search typically takes 3-5 business days. Complex properties with multiple previous owners or legal issues may require additional time for thorough research." },
      { question: "What happens if issues are found?", answer: "If we discover title defects, we'll explain the issues and provide guidance on resolution options. Many issues can be resolved before closing, and title insurance can protect against others." },
      { question: "Do you provide title insurance?", answer: "We facilitate title insurance through our partner providers. Title insurance protects you against future claims or defects that weren't discovered during the search." },
    ],
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
    faqs: [
      { question: "How far in advance should I book my move?", answer: "We recommend booking at least 2-4 weeks in advance for local moves and 4-6 weeks for long-distance moves. Peak season (summer months) may require even earlier booking." },
      { question: "Is my belongings insured during the move?", answer: "Yes, all our moving partners provide basic liability coverage. We also offer additional full-value protection options for complete peace of mind during your move." },
      { question: "Do you offer storage solutions?", answer: "Yes! We provide short-term and long-term storage options in climate-controlled facilities. This is perfect if there's a gap between your move-out and move-in dates." },
      { question: "What items can't be moved?", answer: "Movers cannot transport hazardous materials, perishable foods, plants, pets, or personal documents/valuables. We'll provide a complete list of prohibited items when you book." },
    ],
  },
];

export function getServiceBySlug(slug: string): ServiceData | undefined {
  return servicesData.find((service) => service.slug === slug);
}
