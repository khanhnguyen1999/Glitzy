import axios from 'axios';
import { API_URL, ENDPOINTS } from '../constants/api';
import { TripGroup, CreateTripGroupDto, UpdateTripGroupDto } from '../types/trip';

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
 * Get all trips for the current user
 */
export const getUserTrips = async (): Promise<TripGroup[]> => {
  try {
    const response = await axios.get(`${API_URL}${ENDPOINTS.GROUPS}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error fetching user trips:', error);
    throw error;
  }
};

/**
 * Get trip details by ID
 */
export const getTripDetails = async (tripId: string): Promise<TripGroup> => {
  try {
    const response = await axios.get(`${API_URL}${ENDPOINTS.GROUPS}/${tripId}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error fetching trip details:', error);
    throw error;
  }
};

/**
 * Create a new trip group
 */
export const createTripGroup = async (tripData: CreateTripGroupDto): Promise<TripGroup> => {
  try {
    const response = await axios.post(`${API_URL}${ENDPOINTS.GROUPS}`, tripData, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error creating trip group:', error);
    throw error;
  }
};

/**
 * Update a trip group
 */
export const updateTripGroup = async (tripId: string, tripData: UpdateTripGroupDto): Promise<TripGroup> => {
  try {
    const response = await axios.put(`${API_URL}${ENDPOINTS.GROUPS}/${tripId}`, tripData, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error updating trip group:', error);
    throw error;
  }
};

/**
 * Delete a trip group
 */
export const deleteTripGroup = async (tripId: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}${ENDPOINTS.GROUPS}/${tripId}`, getAuthHeader());
  } catch (error) {
    console.error('Error deleting trip group:', error);
    throw error;
  }
};

/**
 * Get trip members
 */
export const getTripMembers = async (tripId: string): Promise<any[]> => {
  try {
    const url = ENDPOINTS.GROUP_MEMBERS.replace(':groupId', tripId);
    const response = await axios.get(`${API_URL}${url}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error fetching trip members:', error);
    throw error;
  }
};

/**
 * Add member to trip
 */
export const addTripMember = async (tripId: string, userId: string, role: 'ADMIN' | 'MEMBER' = 'MEMBER'): Promise<void> => {
  try {
    const url = ENDPOINTS.GROUP_MEMBERS.replace(':groupId', tripId);
    await axios.post(`${API_URL}${url}`, { userId, role }, getAuthHeader());
  } catch (error) {
    console.error('Error adding trip member:', error);
    throw error;
  }
};

/**
 * Remove member from trip
 */
export const removeTripMember = async (tripId: string, userId: string): Promise<void> => {
  try {
    const url = ENDPOINTS.GROUP_MEMBERS.replace(':groupId', tripId);
    await axios.delete(`${API_URL}${url}/${userId}`, getAuthHeader());
  } catch (error) {
    console.error('Error removing trip member:', error);
    throw error;
  }
};

/**
 * Get trip itinerary
 */
export const getTripItinerary = async (itineraryId: string): Promise<any> => {
  try {
    const url = ENDPOINTS.TRIP_ITINERARY.replace(':tripId', itineraryId);
    const response = await axios.get(`${API_URL}${url}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error fetching trip itinerary:', error);
    throw error;
  }
};
