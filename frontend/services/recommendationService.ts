import axios from 'axios';
import { API_URL, ENDPOINTS } from '../constants/api';
import { Location, LocationRecommendationParams } from '../types/location';
import { ItineraryGenerationParams, TripItinerary } from '../types/itinerary';

// Configure axios with auth token
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

/**
 * Get location recommendations based on destination
 */
export const getLocationRecommendations = async (
  destination: string, 
  interests: string[] = []
): Promise<Location[]> => {
  try {
    const url = ENDPOINTS.LOCATIONS.replace(':destination', encodeURIComponent(destination));
    const interestsParam = interests.length > 0 ? `?interests=${interests.join(',')}` : '';
    
    const response = await axios.get(
      `${API_URL}${url}${interestsParam}`, 
      getAuthHeader()
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching location recommendations:', error);
    
    // Return mock data for development
    return getMockLocationRecommendations(destination);
  }
};

/**
 * Generate a trip itinerary
 */
export const generateItinerary = async (
  params: ItineraryGenerationParams
): Promise<TripItinerary> => {
  try {
    const response = await axios.post(
      `${API_URL}${ENDPOINTS.ITINERARY}`, 
      params, 
      getAuthHeader()
    );
    
    return response.data;
  } catch (error) {
    console.error('Error generating itinerary:', error);
    
    // Return mock data for development
    return getMockItinerary(params);
  }
};

/**
 * Mock location recommendations for development
 */
const getMockLocationRecommendations = (destination: string): Location[] => {
  return [
    {
      id: 'loc-1',
      name: `${destination} Museum of Art`,
      address: `123 Main St, ${destination}`,
      latitude: 35.6812,
      longitude: 139.7671,
      category: 'Museum',
      rating: 4.7,
      estimatedTimeRequired: 120,
      description: `The ${destination} Museum of Art houses an impressive collection of both local and international artwork.`,
      imageUrl: 'https://picsum.photos/400/300?random=1',
      openingHours: {
        open: '09:00',
        close: '17:00',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      }
    },
    {
      id: 'loc-2',
      name: `${destination} Central Park`,
      address: `456 Park Ave, ${destination}`,
      latitude: 35.6897,
      longitude: 139.7063,
      category: 'Park',
      rating: 4.8,
      estimatedTimeRequired: 90,
      description: `${destination} Central Park offers beautiful walking paths, gardens, and recreational areas.`,
      imageUrl: 'https://picsum.photos/400/300?random=2',
      openingHours: {
        open: '06:00',
        close: '22:00',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      }
    },
    {
      id: 'loc-3',
      name: `${destination} Tower`,
      address: `789 Tower Rd, ${destination}`,
      latitude: 35.6586,
      longitude: 139.7454,
      category: 'Landmark',
      rating: 4.9,
      estimatedTimeRequired: 60,
      description: `The iconic ${destination} Tower offers panoramic views of the entire city.`,
      imageUrl: 'https://picsum.photos/400/300?random=3',
      openingHours: {
        open: '10:00',
        close: '22:00',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      }
    },
    {
      id: 'loc-4',
      name: `${destination} Historical Museum`,
      address: `101 History Blvd, ${destination}`,
      latitude: 35.7015,
      longitude: 139.7751,
      category: 'Museum',
      rating: 4.6,
      estimatedTimeRequired: 150,
      description: `Learn about the rich history of ${destination} through interactive exhibits and artifacts.`,
      imageUrl: 'https://picsum.photos/400/300?random=4',
      openingHours: {
        open: '09:00',
        close: '18:00',
        days: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      }
    },
    {
      id: 'loc-5',
      name: `${destination} Botanical Garden`,
      address: `202 Garden St, ${destination}`,
      latitude: 35.7154,
      longitude: 139.7489,
      category: 'Park',
      rating: 4.7,
      estimatedTimeRequired: 120,
      description: `The ${destination} Botanical Garden features thousands of plant species from around the world.`,
      imageUrl: 'https://picsum.photos/400/300?random=5',
      openingHours: {
        open: '08:00',
        close: '19:00',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      }
    },
    {
      id: 'loc-6',
      name: `${destination} Food Market`,
      address: `303 Market St, ${destination}`,
      latitude: 35.6923,
      longitude: 139.7038,
      category: 'Food',
      rating: 4.8,
      estimatedTimeRequired: 90,
      description: `Experience the local cuisine at the famous ${destination} Food Market.`,
      imageUrl: 'https://picsum.photos/400/300?random=6',
      openingHours: {
        open: '10:00',
        close: '20:00',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      }
    }
  ];
};

/**
 * Mock itinerary for development
 */
const getMockItinerary = (params: ItineraryGenerationParams): TripItinerary => {
  const startDate = new Date(params.startDate);
  const endDate = new Date(params.endDate);
  const dayCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1;
  
  const days = Array.from({ length: dayCount }, (_, i) => {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    
    return {
      day: i + 1,
      date: currentDate.toISOString().split('T')[0],
      activities: [
        {
          startTime: '09:00',
          endTime: '11:00',
          location: params.selectedLocations[i % params.selectedLocations.length],
          type: 'VISIT' as const
        },
        {
          startTime: '11:30',
          endTime: '12:30',
          location: {
            id: `restaurant-${i}`,
            name: `Local Restaurant ${i+1}`,
            address: `${100+i} Food St, ${params.destination}`,
            latitude: 35.6812 + (i * 0.01),
            longitude: 139.7671 + (i * 0.01),
            category: 'Restaurant',
            rating: 4.5
          },
          type: 'MEAL' as const
        },
        {
          startTime: '13:00',
          endTime: '15:00',
          location: params.selectedLocations[(i+1) % params.selectedLocations.length],
          type: 'VISIT' as const
        },
        {
          startTime: '15:00',
          endTime: '16:00',
          location: {
            id: 'rest-spot',
            name: 'Rest Area',
            address: `${params.destination} Central`,
            latitude: 35.6812,
            longitude: 139.7671,
            category: 'Rest',
            rating: 4.0
          },
          type: 'REST' as const
        },
        {
          startTime: '16:30',
          endTime: '18:30',
          location: params.selectedLocations[(i+2) % params.selectedLocations.length],
          type: 'VISIT' as const
        }
      ]
    };
  });

  return {
    id: `itinerary-${Date.now()}`,
    tripId: `trip-${Date.now()}`,
    destination: params.destination,
    startDate: params.startDate,
    endDate: params.endDate,
    days,
    createdAt: new Date(),
    updatedAt: new Date()
  };
};
