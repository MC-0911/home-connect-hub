import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Heart,
  Share2,
  MapPin,
  Bed,
  Bath,
  Square,
  Calendar,
  Home,
  Check,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { mockProperties, formatPrice } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const property = mockProperties.find((p) => p.id === id);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [dbProperty, setDbProperty] = useState<{ user_id: string } | null>(null);

  // Try to get property from database to get seller's user_id
  useEffect(() => {
    const fetchDbProperty = async () => {
      if (!id) return;
      const { data } = await supabase
        .from('properties')
        .select('user_id')
        .eq('id', id)
        .maybeSingle();
      if (data) setDbProperty(data);
    };
    fetchDbProperty();
  }, [id]);

  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center py-16">
            <h1 className="font-display text-3xl font-semibold text-foreground mb-4">
              Property Not Found
            </h1>
            <p className="text-muted-foreground mb-8">
              The property you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/properties">Browse Properties</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleContact = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If user is logged in and property has a seller, redirect to messages
    if (user && dbProperty?.user_id) {
      navigate(`/messages?seller=${dbProperty.user_id}&property=${id}`);
      return;
    }
    
    // If not logged in, prompt to login
    if (!user) {
      toast.error("Please sign in to contact the seller");
      navigate('/auth');
      return;
    }
    
    // Fallback for mock data
    toast.success("Message sent! The seller will contact you soon.");
    setContactForm({ name: "", email: "", message: "" });
  };

  const handleStartChat = () => {
    if (!user) {
      toast.error("Please sign in to message the seller");
      navigate('/auth');
      return;
    }
    
    if (dbProperty?.user_id) {
      navigate(`/messages?seller=${dbProperty.user_id}&property=${id}`);
    } else {
      toast.info("Direct messaging is not available for this property");
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20">
        {/* Image Gallery */}
        <div className="relative h-[50vh] sm:h-[60vh] lg:h-[70vh] bg-secondary">
          <motion.img
            key={currentImageIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            src={property.images[currentImageIndex]}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-foreground/20" />

          {/* Navigation */}
          <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
            <Button variant="secondary" size="sm" asChild>
              <Link to="/properties">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Link>
            </Button>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="icon"
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Heart className={cn("w-5 h-5", isFavorite && "fill-destructive text-destructive")} />
              </Button>
              <Button variant="secondary" size="icon">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Image Navigation */}
          {property.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-card hover:scale-110"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-card hover:scale-110"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Image Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {property.images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === currentImageIndex
                    ? "bg-accent w-6"
                    : "bg-primary-foreground/50 hover:bg-primary-foreground/80"
                )}
              />
            ))}
          </div>

          {/* Badges */}
          <div className="absolute bottom-6 left-6 flex gap-2">
            {property.featured && (
              <Badge className="bg-accent text-accent-foreground border-0">Featured</Badge>
            )}
            <Badge variant="secondary" className="bg-card/90 backdrop-blur-sm border-0">
              {property.priceType === "rent" ? "For Rent" : "For Sale"}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Title & Price */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <h1 className="font-display text-3xl sm:text-4xl font-semibold text-foreground">
                    {property.title}
                  </h1>
                  <div className="text-right">
                    <span className="font-display text-3xl sm:text-4xl font-semibold text-accent">
                      {formatPrice(property.price, property.priceType)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-5 h-5 text-accent" />
                  <span>
                    {property.address}, {property.city}, {property.state} {property.zipCode}
                  </span>
                </div>
              </motion.div>

              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-4"
              >
                {property.propertyType !== "land" && (
                  <>
                    <div className="bg-card rounded-xl p-4 border border-border text-center">
                      <Bed className="w-6 h-6 text-accent mx-auto mb-2" />
                      <span className="block font-semibold text-foreground">{property.bedrooms}</span>
                      <span className="text-sm text-muted-foreground">Bedrooms</span>
                    </div>
                    <div className="bg-card rounded-xl p-4 border border-border text-center">
                      <Bath className="w-6 h-6 text-accent mx-auto mb-2" />
                      <span className="block font-semibold text-foreground">{property.bathrooms}</span>
                      <span className="text-sm text-muted-foreground">Bathrooms</span>
                    </div>
                    <div className="bg-card rounded-xl p-4 border border-border text-center">
                      <Square className="w-6 h-6 text-accent mx-auto mb-2" />
                      <span className="block font-semibold text-foreground">
                        {property.squareFeet.toLocaleString()}
                      </span>
                      <span className="text-sm text-muted-foreground">Sq Ft</span>
                    </div>
                  </>
                )}
                {property.yearBuilt && (
                  <div className="bg-card rounded-xl p-4 border border-border text-center">
                    <Calendar className="w-6 h-6 text-accent mx-auto mb-2" />
                    <span className="block font-semibold text-foreground">{property.yearBuilt}</span>
                    <span className="text-sm text-muted-foreground">Year Built</span>
                  </div>
                )}
                <div className="bg-card rounded-xl p-4 border border-border text-center">
                  <Home className="w-6 h-6 text-accent mx-auto mb-2" />
                  <span className="block font-semibold text-foreground capitalize">{property.propertyType}</span>
                  <span className="text-sm text-muted-foreground">Type</span>
                </div>
              </motion.div>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="font-display text-xl font-semibold text-foreground mb-4">Description</h2>
                <p className="text-muted-foreground leading-relaxed">{property.description}</p>
              </motion.div>

              {/* Amenities */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                  Features & Amenities
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-3 text-muted-foreground">
                      <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center">
                        <Check className="w-4 h-4 text-accent" />
                      </div>
                      {amenity}
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card rounded-xl p-6 border border-border sticky top-28"
              >
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                  <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
                    <span className="font-display font-semibold text-accent text-lg">
                      {property.sellerName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{property.sellerName}</h3>
                    <p className="text-sm text-muted-foreground">Property Owner</p>
                  </div>
                </div>

                <form onSubmit={handleContact} className="space-y-4">
                  <div>
                    <Input
                      placeholder="Your Name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="email"
                      placeholder="Your Email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Textarea
                      placeholder="I'm interested in this property..."
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      required
                    />
                  </div>
                  <Button variant="gold" className="w-full" type="submit">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    {user ? 'Start Chat' : 'Contact Seller'}
                  </Button>
                  
                  {user && dbProperty?.user_id && (
                    <Button 
                      variant="outline" 
                      className="w-full mt-2" 
                      type="button"
                      onClick={handleStartChat}
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Open Direct Message
                    </Button>
                  )}
                </form>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  By contacting the seller, you agree to our Terms of Service and Privacy Policy.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
