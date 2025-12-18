import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, Grid3X3, List, X } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PropertyCard } from "@/components/property/PropertyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { mockProperties, propertyTypes, amenitiesList } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";

export default function Properties() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("location") || "");
  const [selectedType, setSelectedType] = useState(searchParams.get("type") || "");
  const [listingType, setListingType] = useState(searchParams.get("listing") || "");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("newest");

  const filteredProperties = useMemo(() => {
    let result = [...mockProperties];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.city.toLowerCase().includes(query) ||
          p.state.toLowerCase().includes(query) ||
          p.address.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (selectedType) {
      result = result.filter((p) => p.propertyType === selectedType);
    }

    // Listing type filter
    if (listingType) {
      result = result.filter((p) => p.priceType === listingType);
    }

    // Price filter
    const min = minPrice ? parseInt(minPrice) : 0;
    const max = maxPrice ? parseInt(maxPrice) : Infinity;
    if (minPrice || maxPrice) {
      result = result.filter((p) => p.price >= min && p.price <= max);
    }

    // Bedrooms filter
    if (bedrooms) {
      const minBeds = parseInt(bedrooms);
      result = result.filter((p) => p.bedrooms >= minBeds);
    }

    // Amenities filter
    if (selectedAmenities.length > 0) {
      result = result.filter((p) =>
        selectedAmenities.every((a) => p.amenities.includes(a))
      );
    }

    // Sort
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return result;
  }, [searchQuery, selectedType, listingType, minPrice, maxPrice, bedrooms, selectedAmenities, sortBy]);

  const activeFiltersCount = [selectedType, listingType, minPrice || maxPrice, bedrooms, selectedAmenities.length > 0].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedType("");
    setListingType("");
    setMinPrice("");
    setMaxPrice("");
    setBedrooms("");
    setSelectedAmenities([]);
    setSearchQuery("");
    setSearchParams({});
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Property Type */}
      <div>
        <label className="text-sm font-medium text-foreground mb-3 block">Property Type</label>
        <Select value={selectedType || "all"} onValueChange={(v) => setSelectedType(v === "all" ? "" : v)}>
          <SelectTrigger>
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {propertyTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Listing Type */}
      <div>
        <label className="text-sm font-medium text-foreground mb-3 block">Listing Type</label>
        <div className="flex rounded-full bg-muted p-1">
          <button
            type="button"
            onClick={() => setListingType("")}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-full transition-colors ${
              listingType === "" 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setListingType("sale")}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-full transition-colors ${
              listingType === "sale" 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Buy
          </button>
          <button
            type="button"
            onClick={() => setListingType("rent")}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-full transition-colors ${
              listingType === "rent" 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Rent
          </button>
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="text-sm font-medium text-foreground mb-3 block">Price Range</label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="h-10"
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="h-10"
          />
        </div>
      </div>

      {/* Bedrooms */}
      <div>
        <label className="text-sm font-medium text-foreground mb-3 block">Bedrooms</label>
        <div className="flex rounded-full bg-muted p-1">
          {[
            { value: "", label: "Any" },
            { value: "1", label: "1+" },
            { value: "2", label: "2+" },
            { value: "3", label: "3+" },
            { value: "4", label: "4+" },
            { value: "5", label: "5+" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setBedrooms(option.value)}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-full transition-colors ${
                bedrooms === option.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div>
        <label className="text-sm font-medium text-foreground mb-3 block">Amenities</label>
        <div className="space-y-3 max-h-48 overflow-y-auto">
          {amenitiesList.map((amenity) => (
            <label key={amenity} className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={selectedAmenities.includes(amenity)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedAmenities([...selectedAmenities, amenity]);
                  } else {
                    setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
                  }
                }}
              />
              <span className="text-sm text-muted-foreground">{amenity}</span>
            </label>
          ))}
        </div>
      </div>

      {activeFiltersCount > 0 && (
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-2">
              Find Your Perfect Property
            </h1>
            <p className="text-muted-foreground">
              {filteredProperties.length} properties available
            </p>
          </motion.div>

          {/* Search and Filters Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-4 mb-8"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by location, city, or address..."
                className="pl-12 h-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              {/* Mobile Filters */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden h-12 relative">
                    <SlidersHorizontal className="w-5 h-5 mr-2" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center bg-accent text-accent-foreground">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterContent />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode */}
              <div className="hidden sm:flex border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-3 transition-colors ${
                    viewMode === "grid" ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50"
                  }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-3 transition-colors ${
                    viewMode === "list" ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50"
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex flex-wrap gap-2 mb-6"
            >
              {selectedType && (
                <Badge variant="secondary" className="gap-1">
                  {propertyTypes.find((t) => t.value === selectedType)?.label}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedType("")} />
                </Badge>
              )}
              {listingType && (
                <Badge variant="secondary" className="gap-1">
                  {listingType === 'sale' ? 'Buy' : 'Rent'}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setListingType("")} />
                </Badge>
              )}
              {(minPrice || maxPrice) && (
                <Badge variant="secondary" className="gap-1">
                  {minPrice ? `$${parseInt(minPrice).toLocaleString()}` : "Any"} - {maxPrice ? `$${parseInt(maxPrice).toLocaleString()}` : "Any"}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => { setMinPrice(""); setMaxPrice(""); }} />
                </Badge>
              )}
              {bedrooms && (
                <Badge variant="secondary" className="gap-1">
                  {bedrooms}+ Beds
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setBedrooms("")} />
                </Badge>
              )}
              {selectedAmenities.map((a) => (
                <Badge key={a} variant="secondary" className="gap-1">
                  {a}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => setSelectedAmenities(selectedAmenities.filter((x) => x !== a))}
                  />
                </Badge>
              ))}
            </motion.div>
          )}

          <div className="flex gap-8">
            {/* Desktop Filters Sidebar */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="hidden lg:block w-72 flex-shrink-0"
            >
              <div className="bg-card rounded-xl p-6 shadow-sm border border-border sticky top-28">
                <h3 className="font-display text-lg font-semibold mb-6">Filters</h3>
                <FilterContent />
              </div>
            </motion.aside>

            {/* Properties Grid */}
            <div className="flex-1">
              {filteredProperties.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <p className="text-muted-foreground text-lg mb-4">No properties found matching your criteria.</p>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </motion.div>
              ) : (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                      : "space-y-4"
                  }
                >
                  {filteredProperties.map((property, index) => (
                    <PropertyCard key={property.id} property={property} index={index} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
