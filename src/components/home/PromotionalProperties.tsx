import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Gift } from "lucide-react";
import { OffersCarousel, type CarouselItem } from "@/components/ui/offers-carousel";
import { supabase } from "@/integrations/supabase/client";

const PromotionalProperties = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<CarouselItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await supabase
        .from("promotional_offers")
        .select("*")
        .eq("is_active", true)
        .or(`start_date.is.null,start_date.lte.${today}`)
        .or(`end_date.is.null,end_date.gte.${today}`)
        .order("display_order", { ascending: true });

      const mapped: CarouselItem[] = (data || []).map((o: any) => ({
        id: o.id,
        imageUrl: o.image_url,
        title: o.title,
        subtitle: o.subtitle || "",
        rating: Number(o.rating) || 0,
        price: Number(o.price) || 0,
        originalPrice: o.original_price ? Number(o.original_price) : undefined,
        discountPercentage: o.discount_percentage || 0,
      }));
      setItems(mapped);
      setLoading(false);
    };
    fetchOffers();

    const channel = supabase
      .channel("home-promo-offers")
      .on("postgres_changes", { event: "*", schema: "public", table: "promotional_offers" }, () => fetchOffers())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  if (loading || items.length === 0) return null;

  return (
    <section className="py-16 bg-background">
      <div className="w-full px-4 md:px-8">
        <OffersCarousel
          offerIcon={<Gift className="w-5 h-5 text-primary" />}
          offerTitle="Flat 25% off on hotels"
          offerSubtitle="CTBEST - Code pre-applied for you!"
          ctaText="View all hotels"
          onCtaClick={() => navigate("/properties?type=hotel")}
          items={items}
        />
      </div>
    </section>
  );
};

export default PromotionalProperties;
