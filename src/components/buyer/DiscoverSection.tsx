import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { PropertyCard } from "@/components/property/PropertyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Bookmark, Loader2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { formatPrice } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";

type Property = Tables<"properties">;

interface DiscoverSectionProps {
  initialFilters?: {
    listingType: "sale" | "rent";
    propertyType: string;
    bedrooms: string;
    maxPrice: number;
    searchQuery: string;
  } | null;
  onViewProperty?: (propertyId: string) => void;
}

export function DiscoverSection({ initialFilters, onViewProperty }: DiscoverSectionProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [listingType, setListingType] = useState<"sale" | "rent">(initialFilters?.listingType || "sale");
  const [propertyType, setPropertyType] = useState(initialFilters?.propertyType || "any");
  const [bedrooms, setBedrooms] = useState(initialFilters?.bedrooms || "any");
  const [maxPrice, setMaxPrice] = useState([initialFilters?.maxPrice || 2000000]);
  const [searchQuery, setSearchQuery] = useState(initialFilters?.searchQuery || "");

  useEffect(() => {
    if (initialFilters) {
      setListingType(initialFilters.listingType);
      setPropertyType(initialFilters.propertyType);
      setBedrooms(initialFilters.bedrooms);
      setMaxPrice([initialFilters.maxPrice]);
      setSearchQuery(initialFilters.searchQuery);
      // Trigger filtered search after state updates
      setTimeout(() => handleSearchWithParams(initialFilters), 0);
    }
  }, [initialFilters]);

  useEffect(() => {
    if (!initialFilters) fetchProperties();
  }, [listingType]);

  const fetchProperties = async () => {
    setLoading(true);
    let query = supabase
      .from("properties")
      .select("*")
      .eq("status", "active")
      .eq("listing_type", listingType)
      .order("created_at", { ascending: false });

    const { data, error } = await query.limit(24);
    if (!error && data) setProperties(data);
    setLoading(false);
  };

  const handleSearchWithParams = async (filters: {
    listingType: "sale" | "rent";
    propertyType: string;
    bedrooms: string;
    maxPrice: number;
    searchQuery: string;
  }) => {
    setLoading(true);
    let query = supabase
      .from("properties")
      .select("*")
      .eq("status", "active")
      .eq("listing_type", filters.listingType)
      .lte("price", filters.maxPrice);

    if (filters.propertyType !== "any") query = query.eq("property_type", filters.propertyType as any);
    if (filters.bedrooms !== "any") query = query.gte("bedrooms", parseInt(filters.bedrooms));
    if (filters.searchQuery) query = query.or(`city.ilike.%${filters.searchQuery}%,title.ilike.%${filters.searchQuery}%,state.ilike.%${filters.searchQuery}%`);

    const { data, error } = await query.order("created_at", { ascending: false }).limit(24);
    if (!error && data) setProperties(data);
    setLoading(false);
  };

  const handleSearch = () => handleSearchWithParams({ listingType, propertyType, bedrooms, maxPrice: maxPrice[0], searchQuery });

  return (
    <div className="space-y-6">
      {/* Search Filters */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <div className="flex gap-2 mb-6 border-b border-border pb-4">
          <Button variant={listingType === "sale" ? "default" : "ghost"} onClick={() => setListingType("sale")} size="sm">Buy</Button>
          <Button variant={listingType === "rent" ? "default" : "ghost"} onClick={() => setListingType("rent")} size="sm">Rent</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Location</label>
            <Input placeholder="City, state..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Property Type</label>
            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Type</SelectItem>
                <SelectItem value="house">House</SelectItem>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="condo">Condo</SelectItem>
                <SelectItem value="townhouse">Townhouse</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
                <SelectItem value="land">Land</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Bedrooms</label>
            <Select value={bedrooms} onValueChange={setBedrooms}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="1">1+</SelectItem>
                <SelectItem value="2">2+</SelectItem>
                <SelectItem value="3">3+</SelectItem>
                <SelectItem value="4">4+</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Max Price: {formatPrice(maxPrice[0], listingType)}</label>
            <Slider value={maxPrice} onValueChange={setMaxPrice} max={listingType === "rent" ? 50000 : 5000000} step={listingType === "rent" ? 500 : 50000} className="mt-3" />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button onClick={handleSearch} className="flex-1 gap-2"><Search className="h-4 w-4" /> Search Properties</Button>
          <Button variant="outline" className="gap-2" onClick={async () => {
            if (!user) {
              toast({ title: "Sign in required", description: "Please sign in to save searches.", variant: "destructive" });
              return;
            }
            const parts: string[] = [];
            if (searchQuery) parts.push(searchQuery);
            if (propertyType !== "any") parts.push(propertyType);
            if (bedrooms !== "any") parts.push(`${bedrooms}+ beds`);
            parts.push(listingType === "rent" ? "Rent" : "Buy");
            const name = parts.length > 1 ? parts.slice(0, 3).join(" · ") : `${listingType === "rent" ? "Rental" : "Sale"} Search`;

            const { error } = await (supabase.from("saved_searches" as any) as any).insert({
              user_id: user.id,
              name,
              listing_type: listingType,
              property_type: propertyType,
              bedrooms,
              max_price: maxPrice[0],
              search_query: searchQuery,
            });
            if (!error) {
              toast({ title: "Search saved!", description: "Find it in the Saved Searches tab." });
            } else {
              toast({ title: "Error", description: "Failed to save search.", variant: "destructive" });
            }
          }}><Bookmark className="h-4 w-4" /> Save Search</Button>
        </div>
      </div>

      {/* Results */}
      <div>
        <h3 className="text-lg font-semibold mb-4">{loading ? "Searching..." : `${properties.length} Properties Found`}</h3>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No properties found matching your criteria.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {properties.map((property, i) => (
              <PropertyCard
                key={property.id}
                property={property}
                index={i}
                isFavorite={isFavorite(property.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
