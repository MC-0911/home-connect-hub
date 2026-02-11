import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format, formatDistanceToNow } from 'date-fns';
import { Home, UserPlus, DollarSign, CalendarCheck, FileText, Activity, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const ACTIVITY_CONFIG = {
  listing: { icon: Home, color: 'text-success', bg: 'bg-success/10', label: 'New Listing', badgeClass: 'bg-success/10 text-success border-success/30' },
  signup: { icon: UserPlus, color: 'text-primary', bg: 'bg-primary/10', label: 'New Signup', badgeClass: 'bg-primary/10 text-primary border-primary/30' },
  offer: { icon: DollarSign, color: 'text-warning', bg: 'bg-warning/10', label: 'New Offer', badgeClass: 'bg-warning/10 text-warning border-warning/30' },
  visit: { icon: CalendarCheck, color: 'text-info', bg: 'bg-info/10', label: 'Visit Request', badgeClass: 'bg-info/10 text-info border-info/30' },
  blog: { icon: FileText, color: 'text-accent', bg: 'bg-accent/10', label: 'New Blog', badgeClass: 'bg-accent/10 text-accent border-accent/30' },
  lead: { icon: Activity, color: 'text-destructive', bg: 'bg-destructive/10', label: 'New Lead', badgeClass: 'bg-destructive/10 text-destructive border-destructive/30' },
};

export interface ActivityItemFull {
  id: string;
  type: 'listing' | 'signup' | 'offer' | 'visit' | 'blog' | 'lead';
  title: string;
  description: string;
  timestamp: string;
  metadata: Record<string, any>;
}

interface ActivityDetailModalProps {
  activity: ActivityItemFull | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-medium text-foreground text-right">{value}</span>
    </div>
  );
}

function ListingDetails({ meta }: { meta: Record<string, any> }) {
  return (
    <div className="divide-y divide-border">
      <DetailRow label="Title" value={meta.title} />
      <DetailRow label="Property Type" value={meta.property_type} />
      <DetailRow label="Listing Type" value={meta.listing_type === 'sale' ? 'For Sale' : 'For Rent'} />
      <DetailRow label="Price" value={meta.price ? `₦${Number(meta.price).toLocaleString()}` : undefined} />
      <DetailRow label="Location" value={[meta.city, meta.state].filter(Boolean).join(', ')} />
      <DetailRow label="Bedrooms" value={meta.bedrooms} />
      <DetailRow label="Bathrooms" value={meta.bathrooms} />
      <DetailRow label="Square Feet" value={meta.square_feet ? `${Number(meta.square_feet).toLocaleString()} sqft` : undefined} />
      <DetailRow label="Status" value={<Badge variant="outline" className="text-xs">{meta.status}</Badge>} />
      <DetailRow label="User" value={
        (meta.owner_name || meta.owner_email) ? (
          <div>
            <div>{meta.owner_name || 'Not provided'}</div>
            {meta.owner_email && <div className="text-xs text-muted-foreground">{meta.owner_email}</div>}
          </div>
        ) : undefined
      } />
    </div>
  );
}

function SignupDetails({ meta }: { meta: Record<string, any> }) {
  return (
    <div className="divide-y divide-border">
      <DetailRow label="Date & Time" value={
        meta.created_at ? (
          <div>
            <div>{format(new Date(meta.created_at), 'MMMM d, yyyy \'at\' h:mm a')}</div>
            <div className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(meta.created_at), { addSuffix: true })}</div>
          </div>
        ) : undefined
      } />
      <DetailRow label="User" value={
        <div>
          <div>{meta.full_name || 'Not provided'}</div>
          {meta.email && <div className="text-xs text-muted-foreground">{meta.email}</div>}
        </div>
      } />
      <DetailRow label="Phone" value={meta.phone} />
      <DetailRow label="Location" value={meta.location} />
      <DetailRow label="Bio" value={meta.bio} />
    </div>
  );
}

function OfferDetails({ meta }: { meta: Record<string, any> }) {
  return (
    <div className="divide-y divide-border">
      <DetailRow label="Offer Amount" value={meta.offer_amount ? `₦${Number(meta.offer_amount).toLocaleString()}` : undefined} />
      <DetailRow label="Status" value={<Badge variant="outline" className="text-xs">{meta.status}</Badge>} />
      <DetailRow label="Message" value={meta.message} />
      <DetailRow label="Counter Amount" value={meta.counter_amount ? `₦${Number(meta.counter_amount).toLocaleString()}` : undefined} />
      <DetailRow label="Expires" value={meta.expires_at ? format(new Date(meta.expires_at), 'MMM d, yyyy h:mm a') : undefined} />
      <DetailRow label="Buyer" value={
        (meta.buyer_name || meta.buyer_email) ? (
          <div>
            <div>{meta.buyer_name || 'Not provided'}</div>
            {meta.buyer_email && <div className="text-xs text-muted-foreground">{meta.buyer_email}</div>}
          </div>
        ) : undefined
      } />
      <DetailRow label="Property Owner" value={
        (meta.owner_name || meta.owner_email) ? (
          <div>
            <div>{meta.owner_name || 'Not provided'}</div>
            {meta.owner_email && <div className="text-xs text-muted-foreground">{meta.owner_email}</div>}
          </div>
        ) : undefined
      } />
      <DetailRow label="Property" value={meta.property_title} />
      {meta.property_location && <DetailRow label="Location" value={meta.property_location} />}
    </div>
  );
}

function VisitDetails({ meta }: { meta: Record<string, any> }) {
  return (
    <div className="divide-y divide-border">
      <DetailRow label="Preferred Date" value={meta.preferred_date} />
      <DetailRow label="Preferred Time" value={meta.preferred_time} />
      <DetailRow label="Status" value={<Badge variant="outline" className="text-xs">{meta.status}</Badge>} />
      <DetailRow label="Message" value={meta.message} />
      <DetailRow label="Seller Notes" value={meta.seller_notes} />
      <DetailRow label="Visitor" value={
        (meta.visitor_name || meta.visitor_email) ? (
          <div>
            <div>{meta.visitor_name || 'Not provided'}</div>
            {meta.visitor_email && <div className="text-xs text-muted-foreground">{meta.visitor_email}</div>}
          </div>
        ) : undefined
      } />
      <DetailRow label="Property Owner" value={
        (meta.owner_name || meta.owner_email) ? (
          <div>
            <div>{meta.owner_name || 'Not provided'}</div>
            {meta.owner_email && <div className="text-xs text-muted-foreground">{meta.owner_email}</div>}
          </div>
        ) : undefined
      } />
      <DetailRow label="Property" value={meta.property_title} />
      {meta.property_location && <DetailRow label="Location" value={meta.property_location} />}
    </div>
  );
}

function BlogDetails({ meta }: { meta: Record<string, any> }) {
  return (
    <div className="divide-y divide-border">
      <DetailRow label="Title" value={meta.title} />
      <DetailRow label="Slug" value={<span className="font-mono text-xs">/{meta.slug}</span>} />
      <DetailRow label="Author" value={meta.author_name} />
      <DetailRow label="Status" value={<Badge variant="outline" className="text-xs">{meta.status}</Badge>} />
      <DetailRow label="Views" value={meta.views?.toLocaleString()} />
      <DetailRow label="Excerpt" value={meta.excerpt ? <span className="line-clamp-3">{meta.excerpt}</span> : undefined} />
    </div>
  );
}

function LeadDetails({ meta }: { meta: Record<string, any> }) {
  return (
    <div className="divide-y divide-border">
      <DetailRow label="Full Name" value={meta.full_name} />
      <DetailRow label="Email" value={meta.email} />
      <DetailRow label="Phone" value={meta.phone} />
      <DetailRow label="Property Type" value={meta.property_type} />
      <DetailRow label="Requirement Type" value={meta.requirement_type} />
      <DetailRow label="Budget Range" value={
        meta.min_budget || meta.max_budget
          ? `₦${(meta.min_budget ?? 0).toLocaleString()} – ₦${(meta.max_budget ?? 0).toLocaleString()}`
          : undefined
      } />
      <DetailRow label="Bedrooms" value={meta.min_bedrooms ? `${meta.min_bedrooms}+` : undefined} />
      <DetailRow label="Locations" value={meta.preferred_locations?.length ? meta.preferred_locations.join(', ') : undefined} />
      <DetailRow label="Status" value={<Badge variant="outline" className="text-xs">{meta.status}</Badge>} />
    </div>
  );
}

const DETAIL_COMPONENTS: Record<string, React.FC<{ meta: Record<string, any> }>> = {
  listing: ListingDetails,
  signup: SignupDetails,
  offer: OfferDetails,
  visit: VisitDetails,
  blog: BlogDetails,
  lead: LeadDetails,
};

const LINK_MAP: Record<string, (meta: Record<string, any>) => string | null> = {
  listing: (meta) => meta.entity_id ? `/property/${meta.entity_id}` : null,
  blog: (meta) => meta.slug ? `/blog/${meta.slug}` : null,
};

export function ActivityDetailModal({ activity, open, onOpenChange }: ActivityDetailModalProps) {
  const navigate = useNavigate();

  if (!activity) return null;

  const config = ACTIVITY_CONFIG[activity.type];
  const Icon = config.icon;
  const DetailComponent = DETAIL_COMPONENTS[activity.type];
  const getLinkFn = LINK_MAP[activity.type];
  const viewLink = getLinkFn?.(activity.metadata);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center shrink-0`}>
              <Icon className={`h-5 w-5 ${config.color}`} />
            </div>
            <div>
              <DialogTitle className="text-lg">{config.label}</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {format(new Date(activity.timestamp), 'MMMM d, yyyy \'at\' h:mm a')}
              </p>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        <div className="py-1">
          <p className="text-sm text-muted-foreground mb-3">{activity.description}</p>
          {DetailComponent && <DetailComponent meta={activity.metadata} />}
        </div>

        {viewLink && (
          <>
            <Separator />
            <div className="flex justify-end pt-1">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => {
                  onOpenChange(false);
                  navigate(viewLink);
                }}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View Details
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
