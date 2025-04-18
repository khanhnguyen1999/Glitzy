import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getTripDetails } from '../../../services/tripService';
import { getLocationRecommendations, generateItinerary } from '../../../services/recommendationService';
import { useTripStore } from '../../../store/tripStore';
import { useUserStore } from '../../../store/userStore';
import { Location } from '../../../types/location';
import { ItineraryGenerationParams } from '../../../types/itinerary';
import LocationCard from '../../../components/LocationCard';

export default function CreateItineraryScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useUserStore();
  
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [generatingItinerary, setGeneratingItinerary] = useState(false);
  
  const [recommendedLocations, setRecommendedLocations] = useState<Location[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<Location[]>([]);
  const [interests, setInterests] = useState<string>('');
  
  const [preferences, setPreferences] = useState({
    startTime: '09:00',
    endTime: '21:00',
    mealTimes: {
      breakfast: '08:00',
      lunch: '13:00',
      dinner: '19:00'
    },
    includeRestTime: true,
    maxActivitiesPerDay: 5
  });
  
  const [showTimePicker, setShowTimePicker] = useState<'start' | 'end' | 'breakfast' | 'lunch' | 'dinner' | null>(null);
  const [selectedTime, setSelectedTime] = useState(new Date());

  useEffect(() => {
    fetchTripDetails();
  }, [id]);

  const fetchTripDetails = async () => {
    setLoading(true);
    try {
      const tripData = await getTripDetails(id as string);
      setTrip(tripData);
      
      // Fetch initial recommendations based on trip destination
      if (tripData.destination) {
        fetchRecommendations(tripData.destination);
      }
    } catch (error) {
      console.error('Error fetching trip details:', error);
      Alert.alert('Error', 'Failed to load trip details');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async (destination: string) => {
    setRecommendationsLoading(true);
    try {
      const interestsArray = interests.split(',').map(i => i.trim()).filter(i => i);
      const locations = await getLocationRecommendations(destination, interestsArray);
      setRecommendedLocations(locations);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      Alert.alert('Error', 'Failed to fetch location recommendations');
    } finally {
      setRecommendationsLoading(false);
    }
  };

  const handleLocationSelect = (location: Location) => {
    // Toggle selection
    if (selectedLocations.some(loc => loc.id === location.id)) {
      setSelectedLocations(selectedLocations.filter(loc => loc.id !== location.id));
    } else {
      setSelectedLocations([...selectedLocations, location]);
    }
  };

  const handleTimeChange = (event: any, selectedDate: Date | undefined, type: 'start' | 'end' | 'breakfast' | 'lunch' | 'dinner') => {
    setShowTimePicker(null);
    if (selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}`;
      
      switch (type) {
        case 'start':
          setPreferences(prev => ({ ...prev, startTime: timeString }));
          break;
        case 'end':
          setPreferences(prev => ({ ...prev, endTime: timeString }));
          break;
        case 'breakfast':
          setPreferences(prev => ({ 
            ...prev, 
            mealTimes: { ...prev.mealTimes, breakfast: timeString } 
          }));
          break;
        case 'lunch':
          setPreferences(prev => ({ 
            ...prev, 
            mealTimes: { ...prev.mealTimes, lunch: timeString } 
          }));
          break;
        case 'dinner':
          setPreferences(prev => ({ 
            ...prev, 
            mealTimes: { ...prev.mealTimes, dinner: timeString } 
          }));
          break;
      }
    }
  };

  const handleGenerateItinerary = async () => {
    if (selectedLocations.length === 0) {
      Alert.alert('Error', 'Please select at least one location');
      return;
    }

    setGeneratingItinerary(true);
    try {
      const params: ItineraryGenerationParams = {
        destination: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        selectedLocations,
        preferences
      };

      const itinerary = await generateItinerary(params);
      
      // Update trip with itinerary ID
      // This would typically be handled by the backend
      // For now, we'll just navigate to the trip details page
      
      Alert.alert(
        'Itinerary Generated',
        'Your trip itinerary has been successfully created!',
        [
          {
            text: 'View Itinerary',
            onPress: () => {
              router.back();
              setTimeout(() => {
                router.push({
                  pathname: "/trip/[id]" as any,
                  params: { id: id as string }
                });
              }, 100);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error generating itinerary:', error);
      Alert.alert('Error', 'Failed to generate itinerary');
    } finally {
      setGeneratingItinerary(false);
    }
  };

  const handleRefreshRecommendations = () => {
    if (trip?.destination) {
      fetchRecommendations(trip.destination);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Trip not found or you don't have access to it.</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Itinerary</Text>
        <Text style={styles.subtitle}>{trip.name}</Text>
        <Text style={styles.destination}>
          <Ionicons name="location" size={16} color="#FF385C" /> {trip.destination}
        </Text>
        <Text style={styles.dates}>
          <Ionicons name="calendar" size={16} color="#4285F4" /> {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Interests</Text>
        <Text style={styles.sectionDescription}>
          Enter interests to get better location recommendations (e.g., history, food, nature)
        </Text>
        <View style={styles.interestsContainer}>
          <TextInput
            style={styles.interestsInput}
            value={interests}
            onChangeText={setInterests}
            placeholder="E.g., museums, hiking, local cuisine"
          />
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={handleRefreshRecommendations}
            disabled={recommendationsLoading}
          >
            {recommendationsLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="refresh" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recommended Places</Text>
        <Text style={styles.sectionDescription}>
          Select places you want to visit during your trip
        </Text>
        
        {recommendationsLoading ? (
          <ActivityIndicator style={styles.recommendationsLoading} size="large" color="#0000ff" />
        ) : recommendedLocations.length > 0 ? (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.recommendationsScroll}
            contentContainerStyle={styles.recommendationsContent}
          >
            {recommendedLocations.map(location => (
              <LocationCard
                key={location.id}
                location={location}
                isSelected={selectedLocations.some(loc => loc.id === location.id)}
                onSelect={() => handleLocationSelect(location)}
              />
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyRecommendations}>
            <Ionicons name="location" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No locations found</Text>
            <Text style={styles.emptySubtext}>Try different interests or check your connection</Text>
          </View>
        )}
        
        <View style={styles.selectedCount}>
          <Text style={styles.selectedCountText}>
            {selectedLocations.length} places selected
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Itinerary Preferences</Text>
        <Text style={styles.sectionDescription}>
          Customize your daily schedule preferences
        </Text>
        
        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceLabel}>Daily Start Time</Text>
          <TouchableOpacity 
            style={styles.timeButton}
            onPress={() => {
              const [hours, minutes] = preferences.startTime.split(':').map(Number);
              const date = new Date();
              date.setHours(hours, minutes, 0);
              setSelectedTime(date);
              setShowTimePicker('start');
            }}
          >
            <Text style={styles.timeButtonText}>{preferences.startTime}</Text>
            <Ionicons name="time-outline" size={20} color="#666" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceLabel}>Daily End Time</Text>
          <TouchableOpacity 
            style={styles.timeButton}
            onPress={() => {
              const [hours, minutes] = preferences.endTime.split(':').map(Number);
              const date = new Date();
              date.setHours(hours, minutes, 0);
              setSelectedTime(date);
              setShowTimePicker('end');
            }}
          >
            <Text style={styles.timeButtonText}>{preferences.endTime}</Text>
            <Ionicons name="time-outline" size={20} color="#666" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceLabel}>Meal Times</Text>
          <View style={styles.mealTimesContainer}>
            <View style={styles.mealTimeItem}>
              <Text style={styles.mealTimeLabel}>Breakfast</Text>
              <TouchableOpacity 
                style={styles.timeButton}
                onPress={() => {
                  const [hours, minutes] = preferences.mealTimes.breakfast.split(':').map(Number);
                  const date = new Date();
                  date.setHours(hours, minutes, 0);
                  setSelectedTime(date);
                  setShowTimePicker('breakfast');
                }}
              >
                <Text style={styles.timeButtonText}>{preferences.mealTimes.breakfast}</Text>
                <Ionicons name="time-outline" size={16} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.mealTimeItem}>
              <Text style={styles.mealTimeLabel}>Lunch</Text>
              <TouchableOpacity 
                style={styles.timeButton}
                onPress={() => {
                  const [hours, minutes] = preferences.mealTimes.lunch.split(':').map(Number);
                  const date = new Date();
                  date.setHours(hours, minutes, 0);
                  setSelectedTime(date);
                  setShowTimePicker('lunch');
                }}
              >
                <Text style={styles.timeButtonText}>{preferences.mealTimes.lunch}</Text>
                <Ionicons name="time-outline" size={16} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.mealTimeItem}>
              <Text style={styles.mealTimeLabel}>Dinner</Text>
              <TouchableOpacity 
                style={styles.timeButton}
                onPress={() => {
                  const [hours, minutes] = preferences.mealTimes.dinner.split(':').map(Number);
                  const date = new Date();
                  date.setHours(hours, minutes, 0);
                  setSelectedTime(date);
                  setShowTimePicker('dinner');
                }}
              >
                <Text style={styles.timeButtonText}>{preferences.mealTimes.dinner}</Text>
                <Ionicons name="time-outline" size={16} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceLabel}>Include Rest Time</Text>
          <TouchableOpacity 
            style={styles.toggleButton}
            onPress={() => setPreferences(prev => ({ ...prev, includeRestTime: !prev.includeRestTime }))}
          >
            <View style={[
              styles.toggleTrack,
              preferences.includeRestTime && styles.toggleTrackActive
            ]}>
              <View style={[
                styles.toggleThumb,
                preferences.includeRestTime && styles.toggleThumbActive
              ]} />
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceLabel}>Max Activities Per Day</Text>
          <View style={styles.counterContainer}>
            <TouchableOpacity 
              style={styles.counterButton}
              onPress={() => setPreferences(prev => ({ 
                ...prev, 
                maxActivitiesPerDay: Math.max(1, prev.maxActivitiesPerDay - 1) 
              }))}
            >
              <Ionicons name="remove" size={20} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.counterValue}>{preferences.maxActivitiesPerDay}</Text>
            <TouchableOpacity 
              style={styles.counterButton}
              onPress={() => setPreferences(prev => ({ 
                ...prev, 
                maxActivitiesPerDay: Math.min(10, prev.maxActivitiesPerDay + 1) 
              }))}
            >
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {showTimePicker && (
        <DateTimePicker
          value={selectedTime}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={(event: any, selectedDate?: Date) => handleTimeChange(
            event, 
            selectedDate, 
            showTimePicker as 'start' | 'end' | 'breakfast' | 'lunch' | 'dinner'
          )}
        />
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.generateButton, generatingItinerary && styles.disabledButton]}
          onPress={handleGenerateItinerary}
          disabled={generatingItinerary || selectedLocations.length === 0}
        >
          {generatingItinerary ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.generateButtonText}>Generate Itinerary</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  header: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#333',
    marginBottom: 12,
  },
  destination: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  dates: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  interestsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  interestsInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 10,
    marginRight: 8,
  },
  refreshButton: {
    backgroundColor: '#4285F4',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendationsScroll: {
    marginBottom: 16,
  },
  recommendationsContent: {
    paddingRight: 20,
  },
  recommendationsLoading: {
    marginVertical: 40,
  },
  emptyRecommendations: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  selectedCount: {
    alignItems: 'center',
    marginTop: 8,
  },
  selectedCountText: {
    fontSize: 14,
    color: '#4285F4',
    fontWeight: '500',
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  preferenceLabel: {
    fontSize: 16,
    color: '#333',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  timeButtonText: {
    fontSize: 16,
    marginRight: 8,
  },
  mealTimesContainer: {
    flex: 1,
    marginLeft: 16,
  },
  mealTimeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealTimeLabel: {
    fontSize: 14,
    color: '#666',
  },
  toggleButton: {
    padding: 4,
  },
  toggleTrack: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ccc',
    padding: 2,
  },
  toggleTrackActive: {
    backgroundColor: '#4285F4',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  toggleThumbActive: {
    transform: [{ translateX: 22 }],
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterValue: {
    fontSize: 16,
    fontWeight: '500',
    marginHorizontal: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#333',
  },
  generateButton: {
    flex: 2,
    backgroundColor: '#4285F4',
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#B0BEC5',
  },
  generateButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
});
