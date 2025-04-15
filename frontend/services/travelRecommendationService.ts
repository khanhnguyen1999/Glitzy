import axios from 'axios';
import { API_URL } from '@/constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TravelRecommendation } from '@/stores/travelRecommendationStore';

export interface TravelRecommendationUpdateDTO {
  status: 'todo' | 'completed' | 'rejected';
}

class TravelRecommendationService {
  private async getAuthHeader() {
    const token = await AsyncStorage.getItem('auth_token');
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async getRecommendations(groupId: string): Promise<TravelRecommendation[]> {
    try {
      const headers = await this.getAuthHeader();
      const response = await axios.get(
        `${API_URL}/v1/groups/${groupId}/travel-recommendations`, 
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching travel recommendations:', error);
      throw error;
    }
  }

  async generateRecommendations(groupId: string, location: string): Promise<TravelRecommendation[]> {
    try {
      const headers = await this.getAuthHeader();
      const response = await axios.post(
        `${API_URL}/v1/groups/${groupId}/travel-recommendations/generate`,
        { location },
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error generating travel recommendations:', error);
      throw error;
    }
  }

  async updateRecommendationStatus(
    groupId: string, 
    recommendationId: string, 
    status: 'todo' | 'completed' | 'rejected'
  ): Promise<void> {
    try {
      const headers = await this.getAuthHeader();
      await axios.put(
        `${API_URL}/v1/groups/${groupId}/travel-recommendations/${recommendationId}/status`,
        { status },
        { headers }
      );
    } catch (error) {
      console.error('Error updating recommendation status:', error);
      throw error;
    }
  }
}

export const travelRecommendationService = new TravelRecommendationService();
