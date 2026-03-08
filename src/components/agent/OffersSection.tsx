import { OffersTab } from "@/components/dashboard/OffersTab";

interface OffersSectionProps {
  onRefresh?: () => void;
}

export function OffersSection({ onRefresh }: OffersSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Offers</h2>
        <p className="text-muted-foreground">Manage your sent and received property offers</p>
      </div>
      <OffersTab onDataChange={onRefresh} />
    </div>
  );
}
