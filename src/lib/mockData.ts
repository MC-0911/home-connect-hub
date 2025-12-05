export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  priceType: 'sale' | 'rent';
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: 'house' | 'apartment' | 'condo' | 'land' | 'townhouse' | 'villa';
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  lotSize?: number;
  yearBuilt?: number;
  images: string[];
  amenities: string[];
  featured: boolean;
  status: 'active' | 'pending' | 'sold' | 'rented';
  createdAt: string;
  sellerId: string;
  sellerName: string;
  coordinates: { lat: number; lng: number };
}

export const mockProperties: Property[] = [
  {
    id: "1",
    title: "Elegant Victorian Estate",
    description: "A stunning Victorian masterpiece featuring original hardwood floors, high ceilings, and period details throughout. This magnificent estate offers the perfect blend of historic charm and modern luxury.",
    price: 2450000,
    priceType: "sale",
    address: "1842 Heritage Lane",
    city: "San Francisco",
    state: "CA",
    zipCode: "94115",
    propertyType: "house",
    bedrooms: 5,
    bathrooms: 4,
    squareFeet: 4200,
    lotSize: 8500,
    yearBuilt: 1892,
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800"
    ],
    amenities: ["Garden", "Garage", "Fireplace", "Wine Cellar", "Library"],
    featured: true,
    status: "active",
    createdAt: "2024-01-15",
    sellerId: "seller1",
    sellerName: "Elizabeth Crawford",
    coordinates: { lat: 37.7899, lng: -122.4394 }
  },
  {
    id: "2",
    title: "Modern Skyline Penthouse",
    description: "Experience luxury living at its finest in this breathtaking penthouse with panoramic city views. Floor-to-ceiling windows, private terrace, and top-of-the-line finishes throughout.",
    price: 3800000,
    priceType: "sale",
    address: "888 Market Street, PH1",
    city: "San Francisco",
    state: "CA",
    zipCode: "94102",
    propertyType: "condo",
    bedrooms: 3,
    bathrooms: 3,
    squareFeet: 2800,
    yearBuilt: 2022,
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"
    ],
    amenities: ["Terrace", "Concierge", "Gym", "Pool", "Smart Home"],
    featured: true,
    status: "active",
    createdAt: "2024-01-20",
    sellerId: "seller2",
    sellerName: "James Mitchell",
    coordinates: { lat: 37.7851, lng: -122.4056 }
  },
  {
    id: "3",
    title: "Charming Craftsman Bungalow",
    description: "Beautifully restored craftsman home with original built-ins, updated kitchen, and a serene backyard garden. Perfect for those who appreciate character and craftsmanship.",
    price: 1250000,
    priceType: "sale",
    address: "2156 Oak Grove Avenue",
    city: "Oakland",
    state: "CA",
    zipCode: "94611",
    propertyType: "house",
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1850,
    lotSize: 5000,
    yearBuilt: 1925,
    images: [
      "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800",
      "https://images.unsplash.com/photo-1600573472591-ee6c563aaec0?w=800",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800"
    ],
    amenities: ["Garden", "Garage", "Fireplace", "Deck", "Original Woodwork"],
    featured: false,
    status: "active",
    createdAt: "2024-02-01",
    sellerId: "seller3",
    sellerName: "Sarah Bennett",
    coordinates: { lat: 37.8271, lng: -122.2127 }
  },
  {
    id: "4",
    title: "Waterfront Contemporary Villa",
    description: "Stunning waterfront property with private dock, infinity pool, and unobstructed bay views. Architect-designed with seamless indoor-outdoor living spaces.",
    price: 5950000,
    priceType: "sale",
    address: "100 Bayshore Drive",
    city: "Sausalito",
    state: "CA",
    zipCode: "94965",
    propertyType: "villa",
    bedrooms: 6,
    bathrooms: 5,
    squareFeet: 5500,
    lotSize: 12000,
    yearBuilt: 2019,
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
      "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800"
    ],
    amenities: ["Pool", "Dock", "Smart Home", "Home Theater", "Wine Room", "Elevator"],
    featured: true,
    status: "active",
    createdAt: "2024-01-10",
    sellerId: "seller4",
    sellerName: "Michael Sterling",
    coordinates: { lat: 37.8591, lng: -122.4852 }
  },
  {
    id: "5",
    title: "Downtown Luxury Apartment",
    description: "Sophisticated urban living in the heart of downtown. High-end finishes, walkable to restaurants and entertainment, with stunning city views.",
    price: 4500,
    priceType: "rent",
    address: "500 Post Street, Unit 1203",
    city: "San Francisco",
    state: "CA",
    zipCode: "94102",
    propertyType: "apartment",
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 1400,
    yearBuilt: 2020,
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"
    ],
    amenities: ["Gym", "Doorman", "Rooftop Deck", "In-Unit Laundry", "Parking"],
    featured: false,
    status: "active",
    createdAt: "2024-02-05",
    sellerId: "seller5",
    sellerName: "Victoria Park Properties",
    coordinates: { lat: 37.7879, lng: -122.4098 }
  },
  {
    id: "6",
    title: "Prime Development Land",
    description: "Exceptional opportunity to develop on this prime parcel with approved plans for a 10-unit residential building. Utilities at street, flat topography.",
    price: 1800000,
    priceType: "sale",
    address: "Lot 42, Mission District",
    city: "San Francisco",
    state: "CA",
    zipCode: "94110",
    propertyType: "land",
    bedrooms: 0,
    bathrooms: 0,
    squareFeet: 0,
    lotSize: 7500,
    images: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800",
      "https://images.unsplash.com/photo-1628624747186-a941c476b7ef?w=800"
    ],
    amenities: ["Utilities Ready", "Zoned Residential", "Approved Plans"],
    featured: false,
    status: "active",
    createdAt: "2024-01-28",
    sellerId: "seller6",
    sellerName: "Bay Area Development Co.",
    coordinates: { lat: 37.7599, lng: -122.4148 }
  },
  {
    id: "7",
    title: "Mediterranean Revival Estate",
    description: "Spectacular Mediterranean estate on over an acre of manicured grounds. Features include a guest house, pool, tennis court, and mature olive trees.",
    price: 4200000,
    priceType: "sale",
    address: "789 Hillside Avenue",
    city: "Los Altos Hills",
    state: "CA",
    zipCode: "94022",
    propertyType: "house",
    bedrooms: 6,
    bathrooms: 6,
    squareFeet: 6200,
    lotSize: 45000,
    yearBuilt: 1998,
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
      "https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=800",
      "https://images.unsplash.com/photo-1600573472591-ee6c563aaec0?w=800"
    ],
    amenities: ["Pool", "Tennis Court", "Guest House", "Wine Cellar", "Gardens", "3-Car Garage"],
    featured: true,
    status: "active",
    createdAt: "2024-02-10",
    sellerId: "seller7",
    sellerName: "Katherine Reynolds",
    coordinates: { lat: 37.3688, lng: -122.1378 }
  },
  {
    id: "8",
    title: "Chic City Townhouse",
    description: "Newly renovated townhouse in a prime location. Three levels of modern living with a private garage and rooftop terrace with city views.",
    price: 1650000,
    priceType: "sale",
    address: "2234 Fillmore Street",
    city: "San Francisco",
    state: "CA",
    zipCode: "94115",
    propertyType: "townhouse",
    bedrooms: 3,
    bathrooms: 3,
    squareFeet: 2200,
    yearBuilt: 2021,
    images: [
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"
    ],
    amenities: ["Rooftop Terrace", "Garage", "Smart Home", "Gourmet Kitchen"],
    featured: false,
    status: "active",
    createdAt: "2024-02-08",
    sellerId: "seller8",
    sellerName: "Urban Living Realty",
    coordinates: { lat: 37.7899, lng: -122.4330 }
  }
];

export const propertyTypes = [
  { value: "house", label: "House" },
  { value: "apartment", label: "Apartment" },
  { value: "condo", label: "Condo" },
  { value: "land", label: "Land" },
  { value: "townhouse", label: "Townhouse" },
  { value: "villa", label: "Villa" },
];

export const amenitiesList = [
  "Pool",
  "Garden",
  "Garage",
  "Gym",
  "Fireplace",
  "Terrace",
  "Smart Home",
  "Wine Cellar",
  "Home Theater",
  "Security System",
  "Elevator",
  "Concierge",
  "Doorman",
  "In-Unit Laundry",
  "Parking",
  "Deck",
  "Tennis Court",
  "Guest House",
];

export function formatPrice(price: number, type: 'sale' | 'rent'): string {
  if (type === 'rent') {
    return `$${price.toLocaleString()}/mo`;
  }
  return `$${price.toLocaleString()}`;
}
