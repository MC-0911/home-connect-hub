import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Share2, MapPin, Bed, Bath, Square, Calendar as CalendarIcon, Home, Check, MessageCircle, DollarSign, Loader2, GraduationCap, ShoppingCart, Coffee, Train, Trees, Heart as HeartIcon, ShoppingBag, Theater, Building2, FileText, Sofa, PaintBucket, MapPinned, Mountain, Compass, Tent } from "lucide-react";
import PropertyImageGallery from "@/components/property/PropertyImageGallery";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ScheduleVisitDialog } from "@/components/dashboard/ScheduleVisitDialog";
import { MakeOfferDialog } from "@/components/dashboard/MakeOfferDialog";
import type { Tables } from "@/integrations/supabase/types";
type Property = Tables<"properties"> & {
  seller?: {
    full_name: string | null;
  } | null;
};
export default function PropertyDetail() {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showVisitDialog, setShowVisitDialog] = useState(false);
  const [showOfferDialog, setShowOfferDialog] = useState(false);
  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      setLoading(true);
      const {
        data,
        error
      } = await supabase.from('properties').select('*').eq('id', id).maybeSingle();
      if (data) {
        // Fetch seller profile
        const {
          data: sellerProfile
        } = await supabase.from('profiles').select('full_name').eq('user_id', data.user_id).maybeSingle();
        setProperty({
          ...data,
          seller: sellerProfile
        });
      }
      setLoading(false);
    };
    fetchProperty();
  }, [id]);
  if (loading) {
    return <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </main>
        <Footer />
      </div>;
  }
  if (!property) {
    return <div className="min-h-screen bg-background">
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
      </div>;
  }
  const images = property.images?.length ? property.images : ['/placeholder.svg'];
  const sellerName = property.seller?.full_name || 'Property Owner';
  const handleContactSeller = () => {
    if (!user) {
      toast.error("Please sign in to contact the seller");
      navigate('/auth');
      return;
    }
    if (property?.user_id) {
      navigate(`/messages?seller=${property.user_id}&property=${id}`);
    } else {
      navigate('/dashboard?tab=messages');
    }
  };
  const handleScheduleVisit = () => {
    if (!user) {
      toast.error("Please sign in to schedule a visit");
      navigate('/auth');
      return;
    }
    if (!property?.user_id) {
      toast.error("Unable to schedule visit for this property");
      return;
    }
    setShowVisitDialog(true);
  };
  const handleMakeOffer = () => {
    if (!user) {
      toast.error("Please sign in to make an offer");
      navigate('/auth');
      return;
    }
    if (!property?.user_id) {
      toast.error("Unable to make offer for this property");
      return;
    }
    setShowOfferDialog(true);
  };
  return <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 bg-primary-foreground">
        {/* Image Gallery */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Navigation */}
          <div className="flex justify-between items-center mb-4">
            <Button variant="secondary" size="sm" asChild>
              <Link to="/properties">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Link>
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" size="icon" onClick={() => setIsFavorite(!isFavorite)}>
                <Heart className={cn("w-5 h-5", isFavorite && "fill-destructive text-destructive")} />
              </Button>
              <Button variant="secondary" size="icon">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <PropertyImageGallery 
            images={images} 
            title={property.title}
            badges={
              <div className="flex gap-2">
                {property.featured && <Badge className="bg-accent text-accent-foreground border-0">Featured</Badge>}
                <Badge variant="secondary" className="border-0 bg-secondary">
                  {property.listing_type === "rent" ? "For Rent" : "For Sale"}
                </Badge>
              </div>
            }
          />
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-primary-foreground">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Title & Price */}
              <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }}>
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2 text-foreground">
                    <MapPin className="w-5 h-5 text-accent" />
                    <span className="font-display text-2xl font-semibold sm:text-xl">
                      {property.address}, {property.city}, {property.state} {property.zip_code}
                    </span>
                  </div>
                  <span className="font-display text-2xl font-semibold text-accent sm:text-4xl">
                    {formatPrice(property.price, property.listing_type)}
                  </span>
                </div>
              </motion.div>

              {/* Quick Stats */}
              <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.1
            }} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {property.property_type !== "land" && <>
                    <div className="bg-card rounded-xl p-4 border border-border text-center">
                      <Bed className="w-6 h-6 text-accent mx-auto mb-2" />
                      <span className="block font-semibold text-foreground">{property.bedrooms || 0}</span>
                      <span className="text-sm text-muted-foreground">Bedrooms</span>
                    </div>
                    <div className="bg-card rounded-xl p-4 border border-border text-center">
                      <Bath className="w-6 h-6 text-accent mx-auto mb-2" />
                      <span className="block font-semibold text-foreground">{property.bathrooms || 0}</span>
                      <span className="text-sm text-muted-foreground">Bathrooms</span>
                    </div>
                    <div className="bg-card rounded-xl p-4 border border-border text-center">
                      <Square className="w-6 h-6 text-accent mx-auto mb-2" />
                      <span className="block font-semibold text-foreground">
                        {(property.square_feet || 0).toLocaleString()}
                      </span>
                      <span className="text-sm text-muted-foreground">Sq Ft</span>
                    </div>
                    <div className="bg-card rounded-xl p-4 border border-border text-center">
                      <Home className="w-6 h-6 text-accent mx-auto mb-2" />
                      <span className="block font-semibold text-foreground capitalize">{property.property_type}</span>
                      <span className="text-sm text-muted-foreground">Type</span>
                    </div>
                  </>}
                {property.year_built && <div className="bg-card rounded-xl p-4 border border-border text-center">
                    <CalendarIcon className="w-6 h-6 text-accent mx-auto mb-2" />
                    <span className="block font-semibold text-foreground">{property.year_built}</span>
                    <span className="text-sm text-muted-foreground">Year Built</span>
                  </div>}
                {property.property_type !== "land" && property.year_renovated && <div className="bg-card rounded-xl p-4 border border-border text-center">
                    <CalendarIcon className="w-6 h-6 text-accent mx-auto mb-2" />
                    <span className="block font-semibold text-foreground">{property.year_renovated}</span>
                    <span className="text-sm text-muted-foreground">Year Renovated</span>
                  </div>}
                {property.property_type !== "land" && property.parcel_number && <div className="bg-card rounded-xl p-4 border border-border text-center">
                    <FileText className="w-6 h-6 text-accent mx-auto mb-2" />
                    <span className="block font-semibold text-foreground">{property.parcel_number}</span>
                    <span className="text-sm text-muted-foreground">Parcel No. (APN)</span>
                  </div>}
                {property.property_type !== "land" && property.annual_tax && <div className="bg-card rounded-xl p-4 border border-border text-center">
                    <DollarSign className="w-6 h-6 text-accent mx-auto mb-2" />
                    <span className="block font-semibold text-foreground">${property.annual_tax.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground">Annual Tax</span>
                  </div>}
              </motion.div>

              {/* Description */}
              <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.2
            }} className="bg-card border border-border rounded-xl p-6">
                <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Home className="w-5 h-5 text-accent" />
                  About This Property
                </h2>
                <p className="text-muted-foreground leading-relaxed">{property.description}</p>
              </motion.div>

              {/* Interior Features */}
              {(property.basement || property.flooring && property.flooring.length > 0 || property.rooms && property.rooms.length > 0 || property.indoor_features && property.indoor_features.length > 0) && <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.3
            }} className="bg-card border border-border rounded-xl p-6">
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Sofa className="w-5 h-5 text-accent" />
                    Interior Features
                  </h2>
                  <div className="space-y-4 divide-y divide-border">
                    {property.basement && <div className="pb-4">
                        <span className="text-sm font-medium text-foreground">Basement:</span>
                        <span className="ml-2 text-muted-foreground capitalize">{property.basement}</span>
                      </div>}
                    {property.flooring && property.flooring.length > 0 && <div className="pt-4 pb-4">
                        <span className="text-sm font-medium text-foreground">Flooring:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {property.flooring.map(floor => <Badge key={floor} variant="secondary">{floor}</Badge>)}
                        </div>
                      </div>}
                    {property.rooms && property.rooms.length > 0 && <div className="pt-4 pb-4">
                        <span className="text-sm font-medium text-foreground">Additional Rooms:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {property.rooms.map(room => <Badge key={room} variant="secondary">{room}</Badge>)}
                        </div>
                      </div>}
                    {property.indoor_features && property.indoor_features.length > 0 && <div className="pt-4">
                        <span className="text-sm font-medium text-foreground">Indoor Features:</span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                          {property.indoor_features.map(feature => <div key={feature} className="flex items-center gap-3 text-muted-foreground">
                              <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center">
                                <Check className="w-4 h-4 text-accent" />
                              </div>
                              {feature}
                            </div>)}
                        </div>
                      </div>}
                  </div>
                </motion.div>}

              {/* Exterior Features */}
              {(property.architectural_style || property.roofing_type || property.parking && property.parking.length > 0 || property.outdoor_amenities && property.outdoor_amenities.length > 0 || property.views && property.views.length > 0) && <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.35
            }} className="bg-card border border-border rounded-xl p-6">
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <PaintBucket className="w-5 h-5 text-accent" />
                    Exterior Features
                  </h2>
                  <div className="space-y-4 divide-y divide-border">
                    {property.architectural_style && <div className="pb-4">
                        <span className="text-sm font-medium text-foreground">Architectural Style:</span>
                        <span className="ml-2 text-muted-foreground">{property.architectural_style}</span>
                      </div>}
                    {property.roofing_type && <div className="pt-4 pb-4">
                        <span className="text-sm font-medium text-foreground">Roofing:</span>
                        <span className="ml-2 text-muted-foreground">{property.roofing_type}</span>
                      </div>}
                    {property.parking && property.parking.length > 0 && <div className="pt-4 pb-4">
                        <span className="text-sm font-medium text-foreground">Parking:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {property.parking.map(park => <Badge key={park} variant="secondary">{park}</Badge>)}
                        </div>
                      </div>}
                    {property.outdoor_amenities && property.outdoor_amenities.length > 0 && <div className="pt-4 pb-4">
                        <span className="text-sm font-medium text-foreground">Outdoor Amenities:</span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                          {property.outdoor_amenities.map(amenity => <div key={amenity} className="flex items-center gap-3 text-muted-foreground">
                              <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center">
                                <Check className="w-4 h-4 text-accent" />
                              </div>
                              {amenity}
                            </div>)}
                        </div>
                      </div>}
                    {property.views && property.views.length > 0 && <div className="pt-4">
                        <span className="text-sm font-medium text-foreground">Views:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {property.views.map(view => <Badge key={view} variant="secondary">{view}</Badge>)}
                        </div>
                      </div>}
                  </div>
                </motion.div>}

              {/* Neighborhood Amenities */}
              {property.neighborhood_amenities && Object.keys(property.neighborhood_amenities as object).some(key => Array.isArray((property.neighborhood_amenities as Record<string, string[]>)[key]) && (property.neighborhood_amenities as Record<string, string[]>)[key].length > 0) && <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.4
            }} className="bg-card border border-border rounded-xl p-6">
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <MapPinned className="w-5 h-5 text-accent" />
                    Neighborhood Amenities
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(() => {
                  const amenities = property.neighborhood_amenities as Record<string, string[]>;
                  const categoryConfig = [{
                    id: 'education',
                    icon: GraduationCap,
                    title: 'Education'
                  }, {
                    id: 'dailyEssentials',
                    icon: ShoppingCart,
                    title: 'Daily Essentials'
                  }, {
                    id: 'diningLeisure',
                    icon: Coffee,
                    title: 'Dining & Leisure'
                  }, {
                    id: 'transportation',
                    icon: Train,
                    title: 'Transportation'
                  }, {
                    id: 'parksRecreation',
                    icon: Trees,
                    title: 'Parks & Recreation'
                  }, {
                    id: 'healthWellness',
                    icon: HeartIcon,
                    title: 'Health & Wellness'
                  }, {
                    id: 'shopping',
                    icon: ShoppingBag,
                    title: 'Shopping'
                  }, {
                    id: 'cultureEntertainment',
                    icon: Theater,
                    title: 'Culture & Entertainment'
                  }, {
                    id: 'communityServices',
                    icon: Building2,
                    title: 'Community Services'
                  }];
                  return categoryConfig.filter(cat => amenities[cat.id]?.length > 0).map(cat => {
                    const Icon = cat.icon;
                    return <div key={cat.id} className="bg-muted/50 rounded-xl p-4 border border-border/50">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                                  <Icon className="w-4 h-4 text-accent" />
                                </div>
                                <span className="font-medium text-foreground">{cat.title}</span>
                              </div>
                              <div className="space-y-2">
                                {amenities[cat.id].map((item: string) => <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Check className="w-3 h-3 text-accent" />
                                    {item}
                                  </div>)}
                              </div>
                            </div>;
                  });
                })()}
                  </div>
                </motion.div>}

              {/* Land Features - only for land properties */}
              {property.property_type === "land" && <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.3
            }} className="bg-card border border-border rounded-xl p-6">
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Mountain className="w-5 h-5 text-accent" />
                    Land Characteristics
                  </h2>
                  <div className="space-y-4">
                    {(property as any).zoning_type && <div>
                        <span className="text-sm font-medium text-foreground">Zoning Type:</span>
                        <span className="ml-2 text-muted-foreground capitalize">{(property as any).zoning_type}</span>
                      </div>}
                    {(property as any).allowed_uses?.length > 0 && <div>
                        <span className="text-sm font-medium text-foreground">Allowed Uses:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {(property as any).allowed_uses.map((use: string) => <Badge key={use} variant="secondary">{use}</Badge>)}
                        </div>
                      </div>}
                    {(property as any).buildable && <div>
                        <span className="text-sm font-medium text-foreground">Buildable:</span>
                        <span className="ml-2 text-muted-foreground capitalize">{(property as any).buildable}</span>
                      </div>}
                    {(property as any).can_subdivide && <div>
                        <span className="text-sm font-medium text-foreground">Can Subdivide:</span>
                        <span className="ml-2 text-muted-foreground capitalize">{(property as any).can_subdivide}</span>
                      </div>}
                    {(property as any).road_access && <div>
                        <span className="text-sm font-medium text-foreground">Road Access:</span>
                        <span className="ml-2 text-muted-foreground capitalize">{(property as any).road_access}</span>
                      </div>}
                    {(property as any).utilities_available?.length > 0 && <div>
                        <span className="text-sm font-medium text-foreground">Utilities Available:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {(property as any).utilities_available.map((util: string) => <Badge key={util} variant="secondary">{util}</Badge>)}
                        </div>
                      </div>}
                    {(property as any).water_rights && <div>
                        <span className="text-sm font-medium text-foreground">Water Rights:</span>
                        <span className="ml-2 text-muted-foreground capitalize">{(property as any).water_rights}</span>
                      </div>}
                  </div>
                </motion.div>}

              {/* Land Property Features - only for land properties */}
              {property.property_type === "land" && ((property as any).topography || (property as any).land_views?.length > 0 || (property as any).fencing || (property as any).vegetation) && <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.35
            }} className="bg-card border border-border rounded-xl p-6">
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Compass className="w-5 h-5 text-accent" />
                    Property Features
                  </h2>
                  <div className="space-y-4">
                    {(property as any).topography && <div>
                        <span className="text-sm font-medium text-foreground">Topography:</span>
                        <span className="ml-2 text-muted-foreground capitalize">{(property as any).topography}</span>
                      </div>}
                    {(property as any).land_views?.length > 0 && <div>
                        <span className="text-sm font-medium text-foreground">Views:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {(property as any).land_views.map((view: string) => <Badge key={view} variant="secondary">{view}</Badge>)}
                        </div>
                      </div>}
                    {(property as any).fencing && <div>
                        <span className="text-sm font-medium text-foreground">Fencing:</span>
                        <span className="ml-2 text-muted-foreground capitalize">{(property as any).fencing}</span>
                      </div>}
                    {(property as any).vegetation && <div>
                        <span className="text-sm font-medium text-foreground">Trees & Vegetation:</span>
                        <span className="ml-2 text-muted-foreground capitalize">{(property as any).vegetation}</span>
                      </div>}
                  </div>
                </motion.div>}

              {/* Land Nearby Amenities - only for land properties */}
              {property.property_type === "land" && ((property as any).distance_to_town || (property as any).distance_to_grocery) && <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.4
            }} className="bg-card border border-border rounded-xl p-6">
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <MapPinned className="w-5 h-5 text-accent" />
                    Nearby Amenities
                  </h2>
                  <div className="space-y-4">
                    {(property as any).distance_to_town && <div>
                        <span className="text-sm font-medium text-foreground">Distance to Town:</span>
                        <span className="ml-2 text-muted-foreground">{(property as any).distance_to_town}</span>
                      </div>}
                    {(property as any).distance_to_grocery && <div>
                        <span className="text-sm font-medium text-foreground">Grocery/Supplies:</span>
                        <span className="ml-2 text-muted-foreground">{(property as any).distance_to_grocery}</span>
                      </div>}
                  </div>
                </motion.div>}

              {/* Land Recreational Features - only for land properties */}
              {property.property_type === "land" && (property as any).recreational_features?.length > 0 && <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.45
            }} className="bg-card border border-border rounded-xl p-6">
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Tent className="w-5 h-5 text-accent" />
                    Recreational Features
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {(property as any).recreational_features.map((feature: string) => <div key={feature} className="flex items-center gap-3 text-muted-foreground">
                        <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center">
                          <Check className="w-4 h-4 text-accent" />
                        </div>
                        {feature}
                      </div>)}
                  </div>
                </motion.div>}

              {/* Land Additional Notes - only for land properties */}
              {property.property_type === "land" && (property as any).land_additional_notes && <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.5
            }}>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                    Additional Notes
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">{(property as any).land_additional_notes}</p>
                </motion.div>}

              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.4
            }}>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                    Features & Amenities
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {property.amenities.map(amenity => <div key={amenity} className="flex items-center gap-3 text-muted-foreground">
                        <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center">
                          <Check className="w-4 h-4 text-accent" />
                        </div>
                        {amenity}
                      </div>)}
                  </div>
                </motion.div>}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.2
            }} className="bg-card rounded-xl p-6 border border-border sticky top-28">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                  <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
                    <span className="font-display font-semibold text-accent text-lg">
                      {sellerName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{sellerName}</h3>
                    <p className="text-sm text-muted-foreground">Property Owner</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-center gap-2 h-12" onClick={handleContactSeller}>
                    <MessageCircle className="w-5 h-5" />
                    Contact Seller
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-center gap-2 h-12" onClick={handleScheduleVisit}>
                    <CalendarIcon className="w-5 h-5" />
                    Schedule Visit
                  </Button>
                  
                  <Button variant="gold" className="w-full justify-center gap-2 h-12" onClick={handleMakeOffer}>
                    <DollarSign className="w-5 h-5" />
                    Make Offer
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  By contacting the seller, you agree to our Terms of Service and Privacy Policy.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Dialogs */}
      {property && id && <>
          <ScheduleVisitDialog open={showVisitDialog} onOpenChange={setShowVisitDialog} propertyId={id} sellerId={property.user_id} propertyTitle={property.title} />
          <MakeOfferDialog open={showOfferDialog} onOpenChange={setShowOfferDialog} propertyId={id} sellerId={property.user_id} propertyTitle={property.title} listPrice={property.price} />
        </>}
    </div>;
}