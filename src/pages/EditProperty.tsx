import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import ListingFormWizard from '@/components/listing/ListingFormWizard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Tables } from '@/integrations/supabase/types';
import { Loader2 } from 'lucide-react';

type Property = Tables<"properties">;

const EditProperty = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (id && user) {
      fetchProperty();
    }
  }, [id, user, authLoading]);

  const fetchProperty = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      
      if (!data) {
        navigate('/dashboard');
        return;
      }

      setProperty(data);
    } catch (error) {
      console.error('Error fetching property:', error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {property && (
          <ListingFormWizard 
            editMode={true} 
            propertyId={id}
            initialData={{
              title: property.title,
              description: property.description,
              propertyType: property.property_type,
              listingType: property.listing_type,
              price: property.price.toString(),
              address: property.address,
              city: property.city,
              state: property.state,
              zipCode: property.zip_code,
              bedrooms: property.bedrooms?.toString() || '',
              bathrooms: property.bathrooms?.toString() || '',
              squareFeet: property.square_feet?.toString() || '',
              lotSize: property.lot_size?.toString() || '',
              yearBuilt: property.year_built?.toString() || '',
              annualTax: '',
              amenities: property.amenities || [],
              existingImageUrls: property.images || [],
              // Interior features
              basement: property.basement || '',
              flooring: property.flooring || [],
              rooms: property.rooms || [],
              indoorFeatures: property.indoor_features || [],
              // Exterior features
              architecturalStyle: property.architectural_style || '',
              parking: property.parking || [],
              roofingType: property.roofing_type || '',
              outdoorAmenities: property.outdoor_amenities || [],
              views: property.views || [],
              neighborhoodAmenities: {
                education: [],
                dailyEssentials: [],
                diningLeisure: [],
                transportation: [],
                parksRecreation: [],
                healthWellness: [],
                shopping: [],
                cultureEntertainment: [],
                communityServices: [],
              },
            }}
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default EditProperty;
