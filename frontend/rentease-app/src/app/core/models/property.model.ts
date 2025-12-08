// property types
export enum PropertyType {
  APARTMENT = 'apartment',
  HOUSE = 'house',
  CONDO = 'condo',
  STUDIO = 'studio',
  VILLA = 'villa'
}

// property status
export enum PropertyStatus {
  AVAILABLE = 'available',
  RENTED = 'rented',
  MAINTENANCE = 'maintenance',
  UNAVAILABLE = 'unavailable'
}

// location interface
export interface PropertyLocation {
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

// amenities interface
export interface PropertyAmenities {
  wifi: boolean;
  parking: boolean;
  air_conditioning: boolean;
  heating: boolean;
  kitchen: boolean;
  washer: boolean;
  dryer: boolean;
  tv: boolean;
  gym: boolean;
  pool: boolean;
  pet_friendly: boolean;
}

// property interface
export interface Property {
  _id: string;
  title: string;
  description: string;
  type: PropertyType;
  status: PropertyStatus;
  price: number;
  price_per_night: number;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  location: PropertyLocation;
  amenities: PropertyAmenities;
  images: string[];
  agent_id: string;
  agent_name?: string;
  created_at: Date;
  updated_at: Date;
  is_featured?: boolean;
  ratings?: {
    average_rating: number;
    total_reviews: number;
  };
  average_rating?: number;
  total_reviews?: number;
}

// search filters
export interface PropertySearchFilters {
  query?: string;
  type?: PropertyType;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  city?: string;
  amenities?: string[];
  sort_by?: 'price' | 'created_at' | 'rating';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// property payload for create/update
export interface PropertyPayload {
  title: string;
  description: string;
  type: PropertyType;
  price: number;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  location: PropertyLocation;
  amenities: PropertyAmenities;
  images?: string[];
}
