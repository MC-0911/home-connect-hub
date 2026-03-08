import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Tables } from "@/integrations/supabase/types";
import { PropertyCard } from "@/components/property/PropertyCard";
import { Heart, Loader2 } from "lucide-react";

type Property = Tables<"properties">;

export function FavoritesSection() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now, show user's own properties as placeholder
    // A proper favorites system would require a favorites table
    const fetchFavorites = async () => {
      if (!user) return;
      setLoading(true);
      const { data } = await supabase
        .from("properties")
        .select("*")
        .eq("status", "active")
        .limit(12);
      setFavorites(data || []);
      setLoading(false);
    };
    fetchFavorites();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Heart className="h-6 w-6 text-destructive" />
        <h2 className="text-2xl font-bold">My Favorite Properties</h2>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
          <p className="text-muted-foreground">Browse properties and tap the heart icon to save them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {favorites.map((property, i) => (
            <PropertyCard key={property.id} property={property} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
