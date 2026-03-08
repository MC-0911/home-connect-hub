import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Scale, X, Plus, Bed, Bath, Square, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/mockData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Property = Tables<"properties">;

export function CompareSection() {
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [compareList, setCompareList] = useState<Property[]>([]);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("properties").select("*").eq("status", "active").limit(50);
      setAllProperties(data || []);
    };
    fetch();
  }, []);

  const addToCompare = () => {
    if (!selectedId || compareList.length >= 4) return;
    const prop = allProperties.find(p => p.id === selectedId);
    if (prop && !compareList.find(p => p.id === selectedId)) {
      setCompareList(prev => [...prev, prop]);
      setSelectedId("");
    }
  };

  const removeFromCompare = (id: string) => {
    setCompareList(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Scale className="h-6 w-6 text-accent" />
          <h2 className="text-2xl font-bold">Compare Properties</h2>
        </div>
        {compareList.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => setCompareList([])}>
            Clear All
          </Button>
        )}
      </div>

      {/* Add property selector */}
      <div className="flex gap-3">
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select a property to compare" />
          </SelectTrigger>
          <SelectContent>
            {allProperties
              .filter(p => !compareList.find(c => c.id === p.id))
              .map(p => (
                <SelectItem key={p.id} value={p.id}>{p.title} - {p.city}</SelectItem>
              ))}
          </SelectContent>
        </Select>
        <Button onClick={addToCompare} disabled={!selectedId || compareList.length >= 4} className="gap-1">
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      {compareList.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <Scale className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No properties to compare</h3>
          <p className="text-muted-foreground">Select up to 4 properties to compare side by side.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {compareList.map(property => (
            <Card key={property.id} className="relative">
              <button
                onClick={() => removeFromCompare(property.id)}
                className="absolute top-2 right-2 z-10 p-1 rounded-full bg-destructive/10 hover:bg-destructive/20 text-destructive"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="aspect-video overflow-hidden rounded-t-lg">
                <img
                  src={property.images?.[0] || "/placeholder.svg"}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-4 space-y-3">
                <h4 className="font-semibold text-sm truncate">{property.title}</h4>
                <p className="text-lg font-bold text-accent">{formatPrice(property.price, property.listing_type)}</p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><Bed className="h-4 w-4" /> {property.bedrooms || 0} Beds</div>
                  <div className="flex items-center gap-2"><Bath className="h-4 w-4" /> {property.bathrooms || 0} Baths</div>
                  <div className="flex items-center gap-2"><Square className="h-4 w-4" /> {(property.square_feet || 0).toLocaleString()} sqft</div>
                </div>
                <div className="pt-3 border-t border-border text-xs text-muted-foreground">
                  {property.city}, {property.state}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
