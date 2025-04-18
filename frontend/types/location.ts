export interface Location {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  category: string;
  rating: number;
  openingHours?: {
    open: string;
    close: string;
    days: string[];
  };
  estimatedTimeRequired?: number; // in minutes
  description?: string;
  imageUrl?: string;
}

export interface LocationRecommendationParams {
  destination: string;
  interests?: string[];
}
