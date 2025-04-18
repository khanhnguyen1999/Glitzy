import { Location } from './location';

export interface TripItinerary {
  id: string;
  tripId: string;
  destination: string;
  startDate: string;
  endDate: string;
  days: ItineraryDay[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ItineraryDay {
  day: number;
  date: string;
  activities: ItineraryActivity[];
}

export interface ItineraryActivity {
  startTime: string;
  endTime: string;
  location: Location;
  notes?: string;
  type: 'VISIT' | 'MEAL' | 'REST' | 'TRAVEL';
}

export interface ItineraryGenerationParams {
  destination: string;
  startDate: string;
  endDate: string;
  selectedLocations: Location[];
  preferences: {
    startTime: string; // e.g., "09:00"
    endTime: string; // e.g., "21:00"
    mealTimes: {
      breakfast?: string;
      lunch?: string;
      dinner?: string;
    };
    includeRestTime: boolean;
    maxActivitiesPerDay?: number;
  };
}
