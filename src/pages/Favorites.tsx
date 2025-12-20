import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
export default function Favorites() {
  return <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16 bg-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-accent" />
            </div>
            <h1 className="font-display text-3xl font-semibold text-foreground mb-4">
              Your Favorites
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Sign in to save your favorite properties and access them anytime. Your saved searches and favorites will appear here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="gold" size="lg" asChild>
                <Link to="/auth">Sign In to View Favorites</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/properties">Browse Properties</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>;
}