import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { format } from "date-fns";
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image: string | null;
  published_at: string | null;
  created_at: string;
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();

      if (error) throw error;
      return data as BlogPost | null;
    },
    enabled: !!slug,
  });

  const handleShare = async () => {
    try {
      await navigator.share({
        title: post?.title,
        url: window.location.href,
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const estimateReadTime = (content: string) => {
    const words = content.split(" ").length;
    const minutes = Math.max(3, Math.ceil(words / 200));
    return `${minutes} min read`;
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background pt-20">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-3xl mx-auto">
              <Skeleton className="h-8 w-32 mb-8" />
              <Skeleton className="h-12 w-full mb-4" />
              <Skeleton className="h-6 w-48 mb-8" />
              <Skeleton className="h-64 w-full mb-8 rounded-xl" />
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!post) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background pt-20">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="font-display text-3xl font-bold text-foreground mb-4">
                Article Not Found
              </h1>
              <p className="text-muted-foreground mb-8">
                The article you're looking for doesn't exist or has been removed.
              </p>
              <Button asChild>
                <Link to="/blog">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Blog
                </Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{post.title} | Royal Landmark Blog</title>
        <meta name="description" content={post.excerpt || post.title} />
      </Helmet>

      <Header />

      <main className="min-h-screen bg-background pt-20">
        <article className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              {/* Back Link */}
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Blog
              </Link>

              {/* Header */}
              <header className="mb-8">
                <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-4">
                  {post.title}
                </h1>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {post.published_at
                        ? format(new Date(post.published_at), "MMMM d, yyyy")
                        : format(new Date(post.created_at), "MMMM d, yyyy")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {estimateReadTime(post.content)}
                    </span>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </header>

              {/* Cover Image */}
              {post.cover_image && (
                <div className="mb-8 rounded-xl overflow-hidden">
                  <img
                    src={post.cover_image}
                    alt={post.title}
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary">
                {post.content.split("\n").map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-12 pt-8 border-t border-border">
                <div className="flex items-center justify-between">
                  <Link
                    to="/blog"
                    className="inline-flex items-center gap-2 text-primary hover:underline"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    More Articles
                  </Link>
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Article
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </>
  );
}
