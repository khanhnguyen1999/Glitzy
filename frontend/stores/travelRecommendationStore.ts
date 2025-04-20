import { create } from 'zustand';
import axios from 'axios';
import { API_URL } from '@/constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TravelRecommendation {
  id: string;
  name: string;
  description?: string;
  address?: string;
  imageUrl?: string;
  status: 'todo' | 'completed' | 'rejected';
  // Additional properties for enhanced UI
  rating?: number;
  votes?: number;
  image?: string; // Fallback for imageUrl
  latitude?: number;
  longitude?: number;
}

interface TravelRecommendationState {
  recommendations: TravelRecommendation[];
  loading: boolean;
  generating: boolean;
  error: string | null;
  
  // Actions
  fetchRecommendations: (groupId: string) => Promise<void>;
  generateRecommendations: (groupId: string, location: string) => Promise<void>;
  updateRecommendationStatus: (groupId: string, id: string, status: 'todo' | 'completed' | 'rejected') => Promise<void>;
  clearError: () => void;
}

export const useTravelRecommendationStore = create<TravelRecommendationState>((set, get) => ({
  recommendations: [],
  loading: false,
  generating: false,
  error: null,
  
  fetchRecommendations: async (groupId: string) => {
    if (!groupId) return;
    
    set({ loading: true, error: null });
    
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await axios.get(`${API_URL}/v1/groups/${groupId}/travel-recommendations`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      set({ recommendations: response.data, loading: false });
    } catch (error) {
      console.error('Error fetching travel recommendations:', error);
      set({ error: 'Failed to load travel recommendations', loading: false });
    }
  },
  
  generateRecommendations: async (groupId: string, location: string) => {
    if (!groupId || !location) {
      set({ error: 'Location is required to generate recommendations' });
      return;
    }
    
    set({ generating: true, error: null });
    
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await axios.post(
        `${API_URL}/v1/groups/${groupId}/travel-recommendations/generate`,
        { location },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      set({ recommendations: response.data, generating: false });
    } catch (error) {
      console.error('Error generating travel recommendations:', error);
      set({ error: 'Failed to generate travel recommendations', generating: false });
    }
  },
  
  updateRecommendationStatus: async (groupId: string, id: string, status: 'todo' | 'completed' | 'rejected') => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      await axios.put(
        `${API_URL}/v1/groups/${groupId}/travel-recommendations/${id}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Update local state
      const { recommendations } = get();
      const updatedRecommendations = recommendations.map(rec => 
        rec.id === id ? { ...rec, status } : rec
      );
      
      set({ recommendations: updatedRecommendations });
    } catch (error) {
      console.error('Error updating recommendation status:', error);
      set({ error: 'Failed to update recommendation status' });
    }
  },
  
  clearError: () => set({ error: null })
}));
