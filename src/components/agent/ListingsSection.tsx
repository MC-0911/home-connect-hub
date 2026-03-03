import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Search, LayoutGrid, List, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

interface ListingsSectionProps {
  listings: Tables<"properties">[];
  onRefresh: () => void;
}

const statusColors: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  under_review: "bg-info/10 text-info border-info/20",
  sold: "bg-muted text-muted-foreground border-border",
  rented: "bg-muted text-muted-foreground border-border",
  declined: "bg-destructive/10 text-destructive border-destructive/20",
};

export function ListingsSection({ listings, onRefresh }: ListingsSectionProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("newest");

  const filtered = listings
    .filter((l) => {
      const matchSearch = l.title.toLowerCase().includes(search.toLowerCase()) ||
        l.city.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || l.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) toast.error("Failed to delete listing");
    else { toast.success("Listing deleted"); onRefresh(); }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search listings..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
              <SelectItem value="rented">Rented</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price_asc">Price: Low-High</SelectItem>
              <SelectItem value="price_desc">Price: High-Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}>
            {viewMode === "grid" ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
          </Button>
          <Button onClick={() => navigate("/add-property")} className="gap-2">
            <Plus className="h-4 w-4" /> Add Property
          </Button>
        </div>
      </div>

      {/* Listings */}
      {filtered.length === 0 ? (
        <Card className="border border-border/50"><CardContent className="py-12 text-center text-muted-foreground">No listings found</CardContent></Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((listing) => (
            <Card key={listing.id} className="border border-border/50 overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-[16/10] bg-muted relative">
                {listing.images?.[0] ? (
                  <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No Image</div>
                )}
                <Badge className={`absolute top-2 right-2 ${statusColors[listing.status || "under_review"]}`}>
                  {listing.status?.replace("_", " ")}
                </Badge>
              </div>
              <CardContent className="p-4 space-y-2">
                <h3 className="font-semibold text-foreground truncate">{listing.title}</h3>
                <p className="text-sm text-muted-foreground">{listing.city}, {listing.state}</p>
                <p className="text-lg font-bold text-primary">₦{listing.price.toLocaleString()}</p>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" onClick={() => navigate(`/property/${listing.id}`)} className="gap-1 flex-1">
                    <Eye className="h-3 w-3" /> View
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => navigate(`/edit-property/${listing.id}`)} className="gap-1 flex-1">
                    <Pencil className="h-3 w-3" /> Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(listing.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((listing) => (
            <Card key={listing.id} className="border border-border/50">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-20 h-14 rounded-md bg-muted overflow-hidden shrink-0">
                  {listing.images?.[0] ? <img src={listing.images[0]} alt="" className="w-full h-full object-cover" /> : null}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{listing.title}</h3>
                  <p className="text-sm text-muted-foreground">{listing.city}, {listing.state}</p>
                </div>
                <p className="font-bold text-primary whitespace-nowrap">₦{listing.price.toLocaleString()}</p>
                <Badge className={statusColors[listing.status || "under_review"]}>{listing.status?.replace("_", " ")}</Badge>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => navigate(`/edit-property/${listing.id}`)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(listing.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
