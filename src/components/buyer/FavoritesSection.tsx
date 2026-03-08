import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Tables } from "@/integrations/supabase/types";
import { PropertyCard } from "@/components/property/PropertyCard";
import { Heart, Loader2 } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";

type Property = Tables<"properties">;

export function FavoritesSection() {
  const { user } = useAuth();
  const { favoriteIds, loading: favsLoading, toggleFavorite, isFavorite } = useFavorites();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavoriteProperties = async () => {
      if (!user || favsLoading) return;

      const ids = Array.from(favoriteIds);
      if (ids.length === 0) {
        setProperties([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data } = await supabase
        .from("properties")
        .select("*")
        .in("id", ids);
      setProperties(data || []);
      setLoading(false);
    };
    fetchFavoriteProperties();
  }, [user, favoriteIds, favsLoading]);

  if (loading || favsLoading) {
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

      {properties.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
          <p className="text-muted-foreground">Browse properties and tap the heart icon to save them here.</p>
        </div>
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
  );
}
