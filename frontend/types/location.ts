export interface Location {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  category: string;
  rating: number;
  votes?: number; // Number of votes/reviews
  openingHours?: {
    open: string;
    close: string;
    days: string[];
  };
  estimatedTimeRequired?: number; // in minutes
  description?: string;
  imageUrl?: string;
  // For compatibility with TravelRecommendation
  status?: string;
  image?: string;
}

export interface LocationRecommendationParams {
  destination: string;
  interests?: string[];
}
