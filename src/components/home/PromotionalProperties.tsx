import { useNavigate } from "react-router-dom";
import { Gift } from "lucide-react";
import { OffersCarousel, type CarouselItem } from "@/components/ui/offers-carousel";

const promotionalProperties: CarouselItem[] = [
  {
    id: 1,
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=80",
    title: "Ramada by Wyndham",
    subtitle: "5 star hotel in Katibagiya",
    rating: 4.7,
    price: 3671,
    originalPrice: 5500,
    discountPercentage: 33,
  },
  {
    id: 2,
    imageUrl: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=500&q=80",
    title: "Hotel Clarks Avadh",
    subtitle: "5 star hotel in Qaisar Bagh",
    rating: 4.3,
    price: 4114,
    originalPrice: 8249,
    discountPercentage: 50,
  },
  {
    id: 3,
    imageUrl: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=500&q=80",
    title: "The Oberoi Resort",
    subtitle: "Luxury resort with private pool",
    rating: 4.9,
    price: 6750,
    originalPrice: 9000,
    discountPercentage: 25,
  },
  {
    id: 4,
    imageUrl: "https://images.unsplash.com/photo-1549294413-26f195200c16?w=500&q=80",
    title: "Hyatt Regency",
    subtitle: "Business hotel near airport",
    rating: 4.6,
    price: 5200,
    originalPrice: 6500,
    discountPercentage: 20,
  },
  {
    id: 5,
    imageUrl: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=500&q=80",
    title: "Radisson Blu",
    subtitle: "Modern hotel in city center",
    rating: 4.5,
    price: 4800,
    originalPrice: 7000,
    discountPercentage: 31,
  },
];

const PromotionalProperties = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <OffersCarousel
          offerIcon={<Gift className="w-5 h-5 text-primary" />}
          offerTitle="Flat 25% off on hotels"
          offerSubtitle="CTBEST - Code pre-applied for you!"
          ctaText="View all hotels"
          onCtaClick={() => navigate("/properties?type=hotel")}
          items={promotionalProperties}
        />
      </div>
    </section>
  );
};

export default PromotionalProperties;
