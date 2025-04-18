import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getTripDetails, getTripItinerary } from '../../services/tripService';
import { useUserStore } from '../../store/userStore';
import TripItinerary from '../../components/TripItinerary';
import TripChat from '../../components/TripChat';
import TripExpenses from '../../components/TripExpenses';
import { TripGroup } from '../../types/trip';
import { TripItinerary as ItineraryType } from '../../types/itinerary';

type TabType = 'details' | 'itinerary' | 'chat' | 'expenses';

export default function TripDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useUserStore();
  
  const [trip, setTrip] = useState<TripGroup | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('details');

  useEffect(() => {
    fetchTripDetails();
  }, [id]);

  const fetchTripDetails = async () => {
    setLoading(true);
    try {
      const tripData = await getTripDetails(id as string);
      setTrip(tripData);
      
      if (tripData.itineraryId) {
        const itineraryData = await getTripItinerary(tripData.itineraryId);
        setItinerary(itineraryData);
      }
    } catch (error) {
      console.error('Error fetching trip details:', error);
      Alert.alert('Error', 'Failed to load trip details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!trip) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-lg text-center">Trip not found or you don't have access to it.</Text>
        <TouchableOpacity 
          className="mt-4 bg-blue-500 px-4 py-2 rounded-md"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isAdmin = trip.members.some(member => 
    member.userId === user.id && member.role === 'ADMIN'
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'details':
        return (
          <View className="p-4">
            <View className="mb-6">
              <Text className="text-lg font-semibold mb-2">Trip Description</Text>
              <Text className="text-gray-700">{trip.description || 'No description provided.'}</Text>
            </View>

            <View className="mb-6">
              <Text className="text-lg font-semibold mb-2">Destination</Text>
              <View className="flex-row items-center">
                <Ionicons name="location" size={20} color="#FF385C" />
                <Text className="text-gray-700 ml-2">{trip.destination}</Text>
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-lg font-semibold mb-2">Dates</Text>
              <View className="flex-row items-center">
                <Ionicons name="calendar" size={20} color="#4285F4" />
                <Text className="text-gray-700 ml-2">
                  {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                </Text>
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-lg font-semibold mb-2">Trip Members</Text>
              {trip.members.map(member => (
                <View key={member.userId} className="flex-row items-center py-2 border-b border-gray-100">
                  <View className="w-8 h-8 bg-gray-300 rounded-full justify-center items-center">
                    <Text className="text-white font-semibold">{member.username.charAt(0).toUpperCase()}</Text>
                  </View>
                  <Text className="ml-3 flex-1">{member.username}</Text>
                  {member.role === 'ADMIN' && (
                    <View className="bg-blue-100 px-2 py-1 rounded">
                      <Text className="text-blue-700 text-xs">Admin</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>

            {isAdmin && (
              <TouchableOpacity 
                className="bg-blue-500 rounded-md p-3 items-center"
                onPress={() => router.push(`/trip/edit/${id}`)}
              >
                <Text className="text-white font-semibold">Edit Trip</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      
      case 'itinerary':
        return (
          <View className="flex-1">
            {itinerary ? (
              <TripItinerary itinerary={itinerary} isEditable={isAdmin} />
            ) : (
              <View className="p-4 items-center justify-center">
                <Text className="text-lg text-center mb-4">No itinerary has been created yet.</Text>
                {isAdmin && (
                  <TouchableOpacity 
                    className="bg-blue-500 rounded-md p-3"
                    onPress={() => router.push(`/trip/create-itinerary/${id}`)}
                  >
                    <Text className="text-white font-semibold">Create Itinerary</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        );
      
      case 'chat':
        return <TripChat tripId={id as string} />;
      
      case 'expenses':
        return <TripExpenses tripId={id as string} isAdmin={isAdmin} />;
      
      default:
        return null;
    }
  };

  return (
    <View className="flex-1 bg-white">
      <View className="bg-blue-500 p-4">
        <Text className="text-white text-2xl font-bold">{trip.name}</Text>
      </View>
      
      <View className="flex-row border-b border-gray-200">
        {(['details', 'itinerary', 'chat', 'expenses'] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            className={`flex-1 py-3 items-center ${activeTab === tab ? 'border-b-2 border-blue-500' : ''}`}
            onPress={() => setActiveTab(tab)}
          >
            <Text 
              className={`${activeTab === tab ? 'text-blue-500 font-semibold' : 'text-gray-600'}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <ScrollView className="flex-1">
        {renderTabContent()}
      </ScrollView>
    </View>
  );
}
