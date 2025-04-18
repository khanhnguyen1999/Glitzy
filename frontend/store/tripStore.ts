import { create } from 'zustand';
import { TripGroup, CreateTripGroupDto, UpdateTripGroupDto } from '../types/trip';
import { 
  getUserTrips, 
  getTripDetails, 
  createTripGroup, 
  updateTripGroup, 
  deleteTripGroup 
} from '../services/tripService';

interface TripState {
  trips: TripGroup[];
  currentTrip: TripGroup | null;
  isLoading: boolean;
  error: string | null;
  fetchTrips: () => Promise<void>;
  fetchTripDetails: (tripId: string) => Promise<void>;
  createTrip: (tripData: CreateTripGroupDto) => Promise<TripGroup>;
  updateTrip: (tripId: string, tripData: UpdateTripGroupDto) => Promise<void>;
  deleteTrip: (tripId: string) => Promise<void>;
  clearError: () => void;
}

export const useTripStore = create<TripState>((set, get) => ({
  trips: [],
  currentTrip: null,
  isLoading: false,
  error: null,

  fetchTrips: async () => {
    set({ isLoading: true, error: null });
    try {
      const trips = await getUserTrips();
      set({ trips, isLoading: false });
    } catch (error: any) {
      console.error('Error fetching trips:', error);
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Failed to fetch trips' 
      });
    }
  },

  fetchTripDetails: async (tripId: string) => {
    set({ isLoading: true, error: null });
    try {
      const trip = await getTripDetails(tripId);
      set({ currentTrip: trip, isLoading: false });
    } catch (error: any) {
      console.error('Error fetching trip details:', error);
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Failed to fetch trip details' 
      });
    }
  },

  createTrip: async (tripData: CreateTripGroupDto) => {
    set({ isLoading: true, error: null });
    try {
      const newTrip = await createTripGroup(tripData);
      set(state => ({ 
        trips: [...state.trips, newTrip],
        currentTrip: newTrip,
        isLoading: false 
      }));
      return newTrip;
    } catch (error: any) {
      console.error('Error creating trip:', error);
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Failed to create trip' 
      });
      throw error;
    }
  },

  updateTrip: async (tripId: string, tripData: UpdateTripGroupDto) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTrip = await updateTripGroup(tripId, tripData);
      set(state => ({ 
        trips: state.trips.map(trip => trip.id === tripId ? updatedTrip : trip),
        currentTrip: state.currentTrip?.id === tripId ? updatedTrip : state.currentTrip,
        isLoading: false 
      }));
    } catch (error: any) {
      console.error('Error updating trip:', error);
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Failed to update trip' 
      });
      throw error;
    }
  },

  deleteTrip: async (tripId: string) => {
    set({ isLoading: true, error: null });
    try {
      await deleteTripGroup(tripId);
      set(state => ({ 
        trips: state.trips.filter(trip => trip.id !== tripId),
        currentTrip: state.currentTrip?.id === tripId ? null : state.currentTrip,
        isLoading: false 
      }));
    } catch (error: any) {
      console.error('Error deleting trip:', error);
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Failed to delete trip' 
      });
      throw error;
    }
  },

  clearError: () => set({ error: null })
}));
