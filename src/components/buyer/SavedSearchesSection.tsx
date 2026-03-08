import { useState } from "react";
import { Bookmark, Play, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface SavedSearch {
  id: string;
  name: string;
  criteria: string;
  createdAt: string;
}

export function SavedSearchesSection() {
  const { toast } = useToast();
  const [searches, setSearches] = useState<SavedSearch[]>([
    { id: "1", name: "Downtown Condos", criteria: "Location: Downtown • Type: Condo • Max: ₦80M", createdAt: "2026-03-01" },
    { id: "2", name: "Family Homes", criteria: "Bedrooms: 3+ • Type: House • Max: ₦60M", createdAt: "2026-02-20" },
    { id: "3", name: "Waterfront Properties", criteria: "Waterfront • Max: ₦150M", createdAt: "2026-02-15" },
  ]);

  const deleteSearch = (id: string) => {
    setSearches(prev => prev.filter(s => s.id !== id));
    toast({ title: "Search deleted" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bookmark className="h-6 w-6 text-accent" />
          <h2 className="text-2xl font-bold">Saved Searches</h2>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> New Search
        </Button>
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
                  <p className="text-sm text-muted-foreground">{search.criteria}</p>
                  <p className="text-xs text-muted-foreground mt-1">Created: {search.createdAt}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="gap-1">
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
