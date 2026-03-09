import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Share2, MapPin, Bed, Bath, Square, Calendar as CalendarIcon, Home, Check, MessageCircle, DollarSign, Loader2, GraduationCap, ShoppingCart, Coffee, Train, Trees, Heart as HeartIcon, ShoppingBag, Theater, Building2, FileText, Sofa, PaintBucket, MapPinned, Mountain, Compass, Tent, Warehouse, Layers, DoorOpen, Sparkles, Landmark, HardHat, Car, TreePine, Eye } from "lucide-react";
import PropertyImageGallery from "@/components/property/PropertyImageGallery";
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
  seller?: { full_name: string | null } | null;
};

interface BuyerPropertyDetailProps {
  propertyId: string;
  onBack: () => void;
}

export function BuyerPropertyDetail({ propertyId, onBack }: BuyerPropertyDetailProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showVisitDialog, setShowVisitDialog] = useState(false);
  const [showOfferDialog, setShowOfferDialog] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      const { data } = await supabase.from("properties").select("*").eq("id", propertyId).maybeSingle();
      if (data) {
        const { data: sellerProfile } = await supabase.from("profiles").select("full_name").eq("user_id", data.user_id).maybeSingle();
        setProperty({ ...data, seller: sellerProfile });
      }
      setLoading(false);
    };
    fetchProperty();
  }, [propertyId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-16">
        <h2 className="font-display text-2xl font-semibold text-foreground mb-4">Property Not Found</h2>
        <p className="text-muted-foreground mb-6">This property doesn't exist or has been removed.</p>
        <Button onClick={onBack}>Go Back</Button>
      </div>
    );
  }

  const images = property.images?.length ? property.images : ["/placeholder.svg"];
  const sellerName = property.seller?.full_name || "Property Owner";

  const handleContactSeller = () => {
    if (!user) { toast.error("Please sign in to contact the seller"); navigate("/auth"); return; }
    if (property?.user_id) navigate(`/messages?seller=${property.user_id}&property=${propertyId}`);
    else navigate("/dashboard?tab=messages");
  };

  const handleScheduleVisit = () => {
    if (!user) { toast.error("Please sign in to schedule a visit"); navigate("/auth"); return; }
    if (!property?.user_id) { toast.error("Unable to schedule visit"); return; }
    setShowVisitDialog(true);
  };

  const handleMakeOffer = () => {
    if (!user) { toast.error("Please sign in to make an offer"); navigate("/auth"); return; }
    if (!property?.user_id) { toast.error("Unable to make offer"); return; }
    setShowOfferDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="secondary" size="sm" onClick={onBack}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Properties
      </Button>

      {/* Image Gallery */}
      <div className="flex justify-end gap-2 mb-2">
        <Button variant="secondary" size="icon" onClick={() => setIsFavorite(!isFavorite)}>
          <Heart className={cn("w-5 h-5", isFavorite && "fill-destructive text-destructive")} />
        </Button>
        <Button variant="secondary" size="icon">
          <Share2 className="w-5 h-5" />
        </Button>
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

      {/* Content */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Title & Price */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {property.property_type !== "land" && (
              <>
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
                  <span className="block font-semibold text-foreground">{(property.square_feet || 0).toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground">Sq Ft</span>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border text-center">
                  <Home className="w-6 h-6 text-accent mx-auto mb-2" />
                  <span className="block font-semibold text-foreground capitalize">{property.property_type}</span>
                  <span className="text-sm text-muted-foreground">Type</span>
                </div>
              </>
            )}
            {property.year_built && (
              <div className="bg-card rounded-xl p-4 border border-border text-center">
                <CalendarIcon className="w-6 h-6 text-accent mx-auto mb-2" />
                <span className="block font-semibold text-foreground">{property.year_built}</span>
                <span className="text-sm text-muted-foreground">Year Built</span>
              </div>
            )}
          </motion.div>

          {/* Description */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Home className="w-5 h-5 text-accent" /> About This Property
            </h2>
            <p className="text-muted-foreground leading-relaxed">{property.description}</p>
          </motion.div>

          {/* Interior Features */}
          {(property.basement || (property.flooring && property.flooring.length > 0) || (property.rooms && property.rooms.length > 0) || (property.indoor_features && property.indoor_features.length > 0)) && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Sofa className="w-5 h-5 text-accent" /> Interior Features
              </h2>
              <div className="space-y-4 divide-y divide-border">
                {property.basement && (
                  <div className="pb-4 -mx-2 px-2 rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-2"><Warehouse className="w-4 h-4 text-muted-foreground" /><span className="text-sm font-medium text-foreground">Basement:</span></div>
                    <span className="ml-6 text-muted-foreground capitalize">{property.basement}</span>
                  </div>
                )}
                {property.flooring && property.flooring.length > 0 && (
                  <div className="pt-4 pb-4 -mx-2 px-2 rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-2"><Layers className="w-4 h-4 text-muted-foreground" /><span className="text-sm font-medium text-foreground">Flooring:</span></div>
                    <div className="flex flex-wrap gap-2 mt-2 ml-6">{property.flooring.map(f => <Badge key={f} variant="secondary">{f}</Badge>)}</div>
                  </div>
                )}
                {property.rooms && property.rooms.length > 0 && (
                  <div className="pt-4 pb-4 -mx-2 px-2 rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-2"><DoorOpen className="w-4 h-4 text-muted-foreground" /><span className="text-sm font-medium text-foreground">Additional Rooms:</span></div>
                    <div className="flex flex-wrap gap-2 mt-2 ml-6">{property.rooms.map(r => <Badge key={r} variant="secondary">{r}</Badge>)}</div>
                  </div>
                )}
                {property.indoor_features && property.indoor_features.length > 0 && (
                  <div className="pt-4 -mx-2 px-2 rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-muted-foreground" /><span className="text-sm font-medium text-foreground">Indoor Features:</span></div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2 ml-6">
                      {property.indoor_features.map(f => (
                        <div key={f} className="flex items-center gap-3 text-muted-foreground">
                          <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center"><Check className="w-4 h-4 text-accent" /></div>{f}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Exterior Features */}
          {(property.architectural_style || property.roofing_type || (property.parking && property.parking.length > 0) || (property.outdoor_amenities && property.outdoor_amenities.length > 0) || (property.views && property.views.length > 0)) && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <PaintBucket className="w-5 h-5 text-accent" /> Exterior Features
              </h2>
              <div className="space-y-4 divide-y divide-border">
                {property.architectural_style && (
                  <div className="pb-4 -mx-2 px-2 rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-2"><Landmark className="w-4 h-4 text-muted-foreground" /><span className="text-sm font-medium text-foreground">Architectural Style:</span></div>
                    <span className="ml-6 text-muted-foreground">{property.architectural_style}</span>
                  </div>
                )}
                {property.roofing_type && (
                  <div className="pt-4 pb-4 -mx-2 px-2 rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-2"><HardHat className="w-4 h-4 text-muted-foreground" /><span className="text-sm font-medium text-foreground">Roofing:</span></div>
                    <span className="ml-6 text-muted-foreground">{property.roofing_type}</span>
                  </div>
                )}
                {property.parking && property.parking.length > 0 && (
                  <div className="pt-4 pb-4 -mx-2 px-2 rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-2"><Car className="w-4 h-4 text-muted-foreground" /><span className="text-sm font-medium text-foreground">Parking:</span></div>
                    <div className="flex flex-wrap gap-2 mt-2 ml-6">{property.parking.map(p => <Badge key={p} variant="secondary">{p}</Badge>)}</div>
                  </div>
                )}
                {property.outdoor_amenities && property.outdoor_amenities.length > 0 && (
                  <div className="pt-4 pb-4 -mx-2 px-2 rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-2"><TreePine className="w-4 h-4 text-muted-foreground" /><span className="text-sm font-medium text-foreground">Outdoor Amenities:</span></div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2 ml-6">
                      {property.outdoor_amenities.map(a => (
                        <div key={a} className="flex items-center gap-3 text-muted-foreground">
                          <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center"><Check className="w-4 h-4 text-accent" /></div>{a}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {property.views && property.views.length > 0 && (
                  <div className="pt-4 -mx-2 px-2 rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-2"><Eye className="w-4 h-4 text-muted-foreground" /><span className="text-sm font-medium text-foreground">Views:</span></div>
                    <div className="flex flex-wrap gap-2 mt-2 ml-6">{property.views.map(v => <Badge key={v} variant="secondary">{v}</Badge>)}</div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Neighborhood Amenities */}
          {property.neighborhood_amenities && Object.keys(property.neighborhood_amenities as object).some(key => Array.isArray((property.neighborhood_amenities as Record<string, string[]>)[key]) && (property.neighborhood_amenities as Record<string, string[]>)[key].length > 0) && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <MapPinned className="w-5 h-5 text-accent" /> Neighborhood Amenities
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(() => {
                  const amenities = property.neighborhood_amenities as Record<string, string[]>;
                  const categoryConfig = [
                    { id: "education", icon: GraduationCap, title: "Education" },
                    { id: "dailyEssentials", icon: ShoppingCart, title: "Daily Essentials" },
                    { id: "diningLeisure", icon: Coffee, title: "Dining & Leisure" },
                    { id: "transportation", icon: Train, title: "Transportation" },
                    { id: "parksRecreation", icon: Trees, title: "Parks & Recreation" },
                    { id: "healthWellness", icon: HeartIcon, title: "Health & Wellness" },
                    { id: "shopping", icon: ShoppingBag, title: "Shopping" },
                    { id: "cultureEntertainment", icon: Theater, title: "Culture & Entertainment" },
                    { id: "communityServices", icon: Building2, title: "Community Services" },
                  ];
                  return categoryConfig.filter(cat => amenities[cat.id]?.length > 0).map(cat => {
                    const Icon = cat.icon;
                    return (
                      <div key={cat.id} className="bg-muted/50 rounded-xl p-4 border border-border/50">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center"><Icon className="w-4 h-4 text-accent" /></div>
                          <span className="font-medium text-foreground">{cat.title}</span>
                        </div>
                        <div className="space-y-2">
                          {amenities[cat.id].map((item: string) => (
                            <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="w-3 h-3 text-accent" />{item}</div>
                          ))}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </motion.div>
          )}

          {/* Land Features */}
          {property.property_type === "land" && (
            <>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card border border-border rounded-xl p-6">
                <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Mountain className="w-5 h-5 text-accent" /> Land Characteristics
                </h2>
                <div className="space-y-4">
                  {property.zoning_type && <div><span className="text-sm font-medium text-foreground">Zoning Type:</span><span className="ml-2 text-muted-foreground capitalize">{property.zoning_type}</span></div>}
                  {property.allowed_uses && property.allowed_uses.length > 0 && <div><span className="text-sm font-medium text-foreground">Allowed Uses:</span><div className="flex flex-wrap gap-2 mt-2">{property.allowed_uses.map(u => <Badge key={u} variant="secondary">{u}</Badge>)}</div></div>}
                  {property.buildable && <div><span className="text-sm font-medium text-foreground">Buildable:</span><span className="ml-2 text-muted-foreground capitalize">{property.buildable}</span></div>}
                  {property.can_subdivide && <div><span className="text-sm font-medium text-foreground">Can Subdivide:</span><span className="ml-2 text-muted-foreground capitalize">{property.can_subdivide}</span></div>}
                  {property.road_access && <div><span className="text-sm font-medium text-foreground">Road Access:</span><span className="ml-2 text-muted-foreground capitalize">{property.road_access}</span></div>}
                  {property.utilities_available && property.utilities_available.length > 0 && <div><span className="text-sm font-medium text-foreground">Utilities Available:</span><div className="flex flex-wrap gap-2 mt-2">{property.utilities_available.map(u => <Badge key={u} variant="secondary">{u}</Badge>)}</div></div>}
                  {property.water_rights && <div><span className="text-sm font-medium text-foreground">Water Rights:</span><span className="ml-2 text-muted-foreground capitalize">{property.water_rights}</span></div>}
                </div>
              </motion.div>

              {(property.topography || (property.land_views && property.land_views.length > 0) || property.fencing || property.vegetation) && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-card border border-border rounded-xl p-6">
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Compass className="w-5 h-5 text-accent" /> Property Features
                  </h2>
                  <div className="space-y-4">
                    {property.topography && <div><span className="text-sm font-medium text-foreground">Topography:</span><span className="ml-2 text-muted-foreground capitalize">{property.topography}</span></div>}
                    {property.land_views && property.land_views.length > 0 && <div><span className="text-sm font-medium text-foreground">Views:</span><div className="flex flex-wrap gap-2 mt-2">{property.land_views.map(v => <Badge key={v} variant="secondary">{v}</Badge>)}</div></div>}
                    {property.fencing && <div><span className="text-sm font-medium text-foreground">Fencing:</span><span className="ml-2 text-muted-foreground capitalize">{property.fencing}</span></div>}
                    {property.vegetation && <div><span className="text-sm font-medium text-foreground">Trees & Vegetation:</span><span className="ml-2 text-muted-foreground capitalize">{property.vegetation}</span></div>}
                  </div>
                </motion.div>
              )}

              {(property.distance_to_town || property.distance_to_grocery) && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-card border border-border rounded-xl p-6">
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <MapPinned className="w-5 h-5 text-accent" /> Nearby Amenities
                  </h2>
                  <div className="space-y-4">
                    {property.distance_to_town && <div><span className="text-sm font-medium text-foreground">Distance to Town:</span><span className="ml-2 text-muted-foreground">{property.distance_to_town}</span></div>}
                    {property.distance_to_grocery && <div><span className="text-sm font-medium text-foreground">Grocery/Supplies:</span><span className="ml-2 text-muted-foreground">{property.distance_to_grocery}</span></div>}
                  </div>
                </motion.div>
              )}

              {property.recreational_features && property.recreational_features.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="bg-card border border-border rounded-xl p-6">
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Tent className="w-5 h-5 text-accent" /> Recreational Features
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {property.recreational_features.map(f => (
                      <div key={f} className="flex items-center gap-3 text-muted-foreground">
                        <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center"><Check className="w-4 h-4 text-accent" /></div>{f}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {property.land_additional_notes && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">Additional Notes</h2>
                  <p className="text-muted-foreground leading-relaxed">{property.land_additional_notes}</p>
                </motion.div>
              )}
            </>
          )}

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">Features & Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.amenities.map(a => (
                  <div key={a} className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center"><Check className="w-4 h-4 text-accent" /></div>{a}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-xl p-6 border border-border sticky top-28">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
              <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
                <span className="font-display font-semibold text-accent text-lg">{sellerName.charAt(0)}</span>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{sellerName}</h3>
                <p className="text-sm text-muted-foreground">Property Owner</p>
              </div>
            </div>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-center gap-2 h-12" onClick={handleContactSeller}>
                <MessageCircle className="w-5 h-5" /> Contact Seller
              </Button>
              <Button variant="outline" className="w-full justify-center gap-2 h-12" onClick={handleScheduleVisit}>
                <CalendarIcon className="w-5 h-5" /> Schedule Visit
              </Button>
              <Button variant="gold" className="w-full justify-center gap-2 h-12" onClick={handleMakeOffer}>
                <DollarSign className="w-5 h-5" /> Make Offer
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-4">
              By contacting the seller, you agree to our Terms of Service and Privacy Policy.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Dialogs */}
      {property && (
        <>
          <ScheduleVisitDialog open={showVisitDialog} onOpenChange={setShowVisitDialog} propertyId={propertyId} sellerId={property.user_id} propertyTitle={property.title} />
          <MakeOfferDialog open={showOfferDialog} onOpenChange={setShowOfferDialog} propertyId={propertyId} sellerId={property.user_id} propertyTitle={property.title} listPrice={property.price} />
        </>
      )}
    </div>
  );
}
