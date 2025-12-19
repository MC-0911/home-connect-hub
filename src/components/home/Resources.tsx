import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

const articles = [
  {
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop",
    category: "Buyers",
    readTime: "5 min read",
    title: "First-Time Home Buyer's Guide",
    description: "Everything you need to know before purchasing your first property. From financing to negotiation.",
    slug: "first-time-home-buyers-guide",
  },
  {
    image: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=600&h=400&fit=crop",
    category: "Sellers",
    readTime: "3 min read",
    title: "5 Tips to Price Your Property Right",
    description: "Learn how top sellers price their properties to attract buyers and close deals faster.",
    slug: "tips-to-price-your-property",
  },
  {
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop",
    category: "Investment",
    readTime: "6 min read",
    title: "Understanding Property Investment",
    description: "A comprehensive guide to building wealth through strategic real estate investments.",
    slug: "understanding-property-investment",
  },
];

export function Resources() {
  return (
    <section className="py-20 sm:py-28 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between mb-12"
        >
          <div>
            <span className="text-accent font-medium text-sm tracking-wide uppercase mb-2 block">
              Resources
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground">
              Learn the Market
            </h2>
          </div>
          <Link
            to="/resources"
            className="group flex items-center gap-2 text-accent font-medium mt-4 sm:mt-0 hover:underline"
          >
            View All Resources
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, index) => (
            <motion.div
              key={article.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Link to={`/resources/${article.slug}`} className="block h-full">
                <Card className="group h-full overflow-hidden border-0 shadow-md hover:shadow-xl transition-shadow duration-300">
                  <div className="relative overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="bg-accent text-accent-foreground text-xs font-medium px-3 py-1 rounded-full">
                        {article.category}
                      </span>
                      <span className="bg-card/90 backdrop-blur-sm text-foreground text-xs font-medium px-3 py-1 rounded-full">
                        {article.readTime}
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-display text-lg font-semibold text-foreground mb-2 group-hover:text-accent transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                      {article.description}
                    </p>
                    <span className="inline-flex items-center gap-1 text-accent font-medium text-sm group-hover:underline">
                      Read More
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
