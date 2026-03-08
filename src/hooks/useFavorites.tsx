import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export function useFavorites() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setFavoriteIds(new Set());
      setLoading(false);
      return;
    }

    const fetchFavorites = async () => {
      const { data } = await supabase
        .from("favorites" as any)
        .select("property_id")
        .eq("user_id", user.id);
      setFavoriteIds(new Set((data || []).map((f: any) => f.property_id)));
      setLoading(false);
    };
    fetchFavorites();
  }, [user]);

  const toggleFavorite = useCallback(async (propertyId: string) => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to save favorites.", variant: "destructive" });
      return;
    }

    const isFav = favoriteIds.has(propertyId);

    // Optimistic update
    setFavoriteIds(prev => {
      const next = new Set(prev);
      if (isFav) next.delete(propertyId);
      else next.add(propertyId);
      return next;
    });

    if (isFav) {
      const { error } = await (supabase.from("favorites" as any) as any)
        .delete()
        .eq("user_id", user.id)
        .eq("property_id", propertyId);
      if (error) {
        // Revert
        setFavoriteIds(prev => { const next = new Set(prev); next.add(propertyId); return next; });
        toast({ title: "Error", description: "Failed to remove favorite.", variant: "destructive" });
      }
    } else {
      const { error } = await (supabase.from("favorites" as any) as any)
        .insert({ user_id: user.id, property_id: propertyId });
      if (error) {
        // Revert
        setFavoriteIds(prev => { const next = new Set(prev); next.delete(propertyId); return next; });
        toast({ title: "Error", description: "Failed to add favorite.", variant: "destructive" });
      } else {
        toast({ title: "Saved!", description: "Property added to favorites." });
      }
    }
  }, [user, favoriteIds, toast]);

  const isFavorite = useCallback((propertyId: string) => favoriteIds.has(propertyId), [favoriteIds]);

  return { favoriteIds, loading, toggleFavorite, isFavorite };
}
