import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import ListingFormWizard from '@/components/listing/ListingFormWizard';

const AddProperty = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <ListingFormWizard />
      </main>
      <Footer />
    </div>
  );
};

export default AddProperty;
