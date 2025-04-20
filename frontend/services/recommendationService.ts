import axios from 'axios';
import { API_URL, ENDPOINTS } from '../constants/api';
import { Location, LocationRecommendationParams } from '../types/location';
import { ItineraryGenerationParams, TripItinerary } from '../types/itinerary';
import api from "./api";

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
 * Get location recommendations based on destination and trip type
 */
export const getLocationRecommendations = async (
  destination: string, 
  tripType: string = 'General'
): Promise<Location[]> => {
  try {
    const response = await api.post(`/v1/groups/recommendations`,{
      location: destination,
      tripType
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching location recommendations:', error);
    
    // Return mock data for development
    return getMockLocationRecommendations(destination, tripType);
  }
};

/**
 * Generate a trip itinerary
 */
export const generateItinerary = async (
  params: ItineraryGenerationParams
): Promise<TripItinerary> => {
  try {
    const response = await api.post(`/v1/groups/recommendations`,params);
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
const getMockLocationRecommendations = (destination: string, tripType: string = 'General'): Location[] => {
  // Generate recommendations based on trip type
  const getDescription = (name: string, type: string) => {
    const descriptions: Record<string, string> = {
      'Relax & Wellness': `${name} is a perfect spot to unwind and rejuvenate. Visitors can enjoy peaceful surroundings and wellness activities.`,
      'Adventure & Exploration': `${name} offers thrilling adventures and exciting exploration opportunities for the adventurous traveler.`,
      'Culture & Learning': `${name} provides a rich cultural experience with opportunities to learn about local history and traditions.`,
      'Food & Shopping': `${name} is famous for its culinary delights and shopping opportunities that showcase local crafts and products.`,
      'Work & Entertainment': `${name} combines productive work spaces with entertainment options for a balanced business trip.`,
      'General': `${name} is a must-visit destination in ${destination} with activities for all interests.`
    };
    return descriptions[type] || descriptions['General'];
  };

  return [
    {
      id: 'loc-1',
      name: `${destination} Museum of Art`,
      address: `123 Main St, ${destination}`,
      latitude: 35.6812,
      longitude: 139.7671,
      category: 'Museum',
      rating: 4.7,
      votes: 328,
      estimatedTimeRequired: 120,
      description: getDescription(`${destination} Museum of Art`, tripType),
      imageUrl: 'https://images.unsplash.com/photo-1566054757965-8c4085344c96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTB8fG11c2V1bXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60',
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
      votes: 452,
      estimatedTimeRequired: 90,
      description: getDescription(`${destination} Central Park`, tripType),
      imageUrl: 'https://images.unsplash.com/photo-1534251369789-5067c8b8602a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTB8fHBhcmt8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60',
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
      votes: 387,
      estimatedTimeRequired: 60,
      description: getDescription(`${destination} Tower`, tripType),
      imageUrl: 'https://images.unsplash.com/photo-1495562569060-2eec283d3391?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8dG93ZXJ8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60',
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
      votes: 276,
      estimatedTimeRequired: 150,
      description: getDescription(`${destination} Historical Museum`, tripType),
      imageUrl: 'https://images.unsplash.com/photo-1582034986517-30d163aa1da9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8aGlzdG9yeXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60',
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
      votes: 312,
      estimatedTimeRequired: 120,
      description: getDescription(`${destination} Botanical Garden`, tripType),
      imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8Z2FyZGVufGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60',
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
      votes: 425,
      estimatedTimeRequired: 90,
      description: getDescription(`${destination} Food Market`, tripType),
      imageUrl: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OHx8Zm9vZCUyMG1hcmtldHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60',
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
