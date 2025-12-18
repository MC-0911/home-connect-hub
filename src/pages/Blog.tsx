import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { format } from "date-fns";
import { Calendar, Clock, ArrowRight, Search } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  published_at: string | null;
  created_at: string;
}

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: blogs, isLoading } = useQuery({
    queryKey: ["published-blogs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blogs")
        .select("id, title, slug, excerpt, cover_image, published_at, created_at")
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (error) throw error;
      return data as Blog[];
    },
  });

  const filteredBlogs = blogs?.filter(
    (blog) =>
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const estimateReadTime = (excerpt: string | null) => {
    if (!excerpt) return "3 min read";
    const words = excerpt.split(" ").length;
    const minutes = Math.max(3, Math.ceil(words / 200));
    return `${minutes} min read`;
  };

  return (
    <>
      <Helmet>
        <title>Blog | Royal Landmark - Property Insights & Tips</title>
        <meta
          name="description"
          content="Explore expert insights on real estate, property buying tips, market trends, and home improvement guides from Royal Landmark."
        />
      </Helmet>

      <Header />

      <main className="min-h-screen bg-background pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary to-primary/80 py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="font-display text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
                Property Insights & Tips
              </h1>
              <p className="text-primary-foreground/80 text-lg mb-8">
                Expert advice, market trends, and guides to help you make informed property decisions.
              </p>
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-background/95 border-0 shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Blog Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <CardContent className="p-6 space-y-4">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredBlogs && filteredBlogs.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredBlogs.map((blog) => (
                  <Link key={blog.id} to={`/blog/${blog.slug}`}>
                    <Card className="group overflow-hidden h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="relative h-48 overflow-hidden bg-muted">
                        {blog.cover_image ? (
                          <img
                            src={blog.cover_image}
                            alt={blog.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                            <span className="font-display text-4xl text-primary/30">RL</span>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {blog.published_at
                              ? format(new Date(blog.published_at), "MMM d, yyyy")
                              : format(new Date(blog.created_at), "MMM d, yyyy")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {estimateReadTime(blog.excerpt)}
                          </span>
                        </div>
                        <h2 className="font-display text-xl font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {blog.title}
                        </h2>
                        {blog.excerpt && (
                          <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                            {blog.excerpt}
                          </p>
                        )}
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                          Read more
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-6 flex items-center justify-center">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  {searchQuery ? "No articles found" : "No articles yet"}
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "Check back soon for new content!"}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
