import { useState, useEffect } from "react";
import { Bookmark, Play, Trash2, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/mockData";

interface SavedSearch {
  id: string;
  name: string;
  listing_type: string;
  property_type: string;
  bedrooms: string;
  max_price: number;
  search_query: string;
  created_at: string;
}

interface SavedSearchesSectionProps {
  onRunSearch?: (filters: {
    listingType: "sale" | "rent";
    propertyType: string;
    bedrooms: string;
    maxPrice: number;
    searchQuery: string;
  }) => void;
}

export function SavedSearchesSection({ onRunSearch }: SavedSearchesSectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSearches = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("saved_searches" as any)
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setSearches((data as any) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchSearches();
  }, [user]);

  const deleteSearch = async (id: string) => {
    const { error } = await (supabase.from("saved_searches" as any) as any)
      .delete()
      .eq("id", id);
    if (!error) {
      setSearches(prev => prev.filter(s => s.id !== id));
      toast({ title: "Search deleted" });
    } else {
      toast({ title: "Error", description: "Failed to delete search.", variant: "destructive" });
    }
  };

  const buildCriteria = (s: SavedSearch) => {
    const parts: string[] = [];
    if (s.search_query) parts.push(`Location: ${s.search_query}`);
    if (s.property_type && s.property_type !== "any") parts.push(`Type: ${s.property_type}`);
    if (s.bedrooms && s.bedrooms !== "any") parts.push(`Bedrooms: ${s.bedrooms}+`);
    parts.push(`Max: ${formatPrice(s.max_price, s.listing_type as "sale" | "rent")}`);
    return parts.join(" • ");
  };

  const handleRun = (s: SavedSearch) => {
    if (onRunSearch) {
      onRunSearch({
        listingType: s.listing_type as "sale" | "rent",
        propertyType: s.property_type,
        bedrooms: s.bedrooms,
        maxPrice: s.max_price,
        searchQuery: s.search_query,
      });
    } else {
      toast({ title: "Navigate to Discover", description: "Switch to the Discover tab to run searches." });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bookmark className="h-6 w-6 text-accent" />
          <h2 className="text-2xl font-bold">Saved Searches</h2>
        </div>
      </div>

      {searches.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No saved searches</h3>
          <p className="text-muted-foreground">Save a search from the Discover tab to get notified of new matches.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {searches.map(search => (
            <Card key={search.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <h4 className="font-semibold">{search.name}</h4>
                  <p className="text-sm text-muted-foreground">{buildCriteria(search)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Created: {new Date(search.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="gap-1" onClick={() => handleRun(search)}>
                    <Play className="h-3 w-3" /> Run
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => deleteSearch(search.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
