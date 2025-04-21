import React, { useState, useEffect, useCallback } from 'react';
import useDebounce from '../../hooks/useDebounce';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
// import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useFriendStore } from '../../store/friendStore';
import { useUserStore } from '../../store/userStore';
import { createTripGroup } from '../../services/tripService';
import { getLocationRecommendations } from '../../services/recommendationService';
import { groupService } from '../../services/groupService';
import FriendSelector from '../../components/FriendSelector';
import LocationCard from '../../components/LocationCard';
import { Location } from '../../types/location';
import { LocationSearchResult } from '../../services/groupService';
import { Sparkles } from 'lucide-react-native';
import DatePicker from 'react-native-date-picker'
// import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

import { 
  StyleSheet, 
  Image,
  SafeAreaView
} from 'react-native';
import { Stack } from 'expo-router';
import { colors } from '@/constants/colors';
import { ArrowLeft, Search, X, Plus, Check } from 'lucide-react-native';
import { SuggestedPlace } from '@/components/SuggestedPlace';
import { TravelRecommendation } from '@/stores/travelRecommendationStore';


export default function CreateTripScreen() {
  const router = useRouter();
  const { friends } = useFriendStore();
  const { user } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [recommendedLocations, setRecommendedLocations] = useState<Location[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<Location[]>([]);
  const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(null);
  const [showTripTypeDropdown, setShowTripTypeDropdown] = useState(false);
  const [recommendations, setRecommendations] = useState<TravelRecommendation[]>([]);
  const [selectedRecommendations, setSelectedRecommendations] = useState<Set<number>>(new Set());



  const [tripName, setTripName] = useState('');
  const [destination, setDestination] = useState('');
  const [tripType, setTripType] = useState('Work & Entertainment');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const [selectedPlaces, setSelectedPlaces] = useState<string[]>([]);
  
  // Trip type options
  const tripTypes = [
    'Relax & Wellness',
    'Adventure & Exploration',
    'Culture & Learning',
    'Food & Shopping',
    'Work & Entertainment'
  ];
  

  const { control, handleSubmit, watch, formState: { errors }, setValue } = useForm({
    defaultValues: {
      name: '',
      description: '',
      destination: '',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    }
  });

  const handleRemoveFriend = (friendId: string) => {
    // setSelectedFriends(selectedFriends.filter(friend => friend.id !== friendId));
  };

  const handleAddMoreFriends = () => {
    // This would open a friend selection modal
    // showNotification('Friend selection coming soon', 'info');
  };

  const handleCreateTrip = async (data: any) => {
    console.log('tripData ',selectedFriends)

    // if (selectedFriends.length === 0) {
    //   Alert.alert('Error', 'Please select at least one friend');
    //   return;
    // }

    // if (selectedLocations.length === 0) {
    //   Alert.alert('Error', 'Please select at least one location');
    //   return;
    // }

    setLoading(true);
    try {
      const tripData = {
        startDate: new Date(),
        endDate: new Date(),
        memberIds: [...selectedFriends, user?.id],
        selectedLocations,
        tripType: tripType // Include the trip type
      };
      console.log('tripData ',tripData)
      // const response = await createTripGroup(tripData);
      // Alert.alert('Success', 'Trip created successfully!');
      // router.push({ 
      //   pathname: '/trip/[id]',
      //   params: { id: response.id }
      // });
    } catch (error) {
      console.error('Error creating trip:', error);
      Alert.alert('Error', 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  // State variables are already declared above

  const handleLocationSearch = useCallback(async (query: string) => {
    if (query.length < 3) return;
    
    setIsSearching(true);
    try {
      const results = await groupService.searchLocations(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching locations:', error);
      Alert.alert('Error', 'Failed to search locations');
    } finally {
      setIsSearching(false);
    }
  }, []);
  
  // This useEffect will be moved after state declarations

  const generateRecommendations = async () => {
    if (!destination) {
      Alert.alert('Error', 'Please enter a destination first');
      return;
    }
    
    setLoadingRecommendations(true);
    try {
      const result = await getLocationRecommendations(destination, tripType);
      // Transform Location[] to TravelRecommendation[] by adding the required status property
      const recommendationsWithStatus = result.map(location => ({
        ...location,
        status: 'todo' as const,
        // Ensure image is available for the SuggestedPlace component
        image: location.imageUrl || 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bG9jYXRpb258ZW58MHx8MHx8&w=1000&q=80'
      }));
      setRecommendations(recommendationsWithStatus);
      // Select all recommendations by default
      const allIndices = new Set(recommendationsWithStatus.map((_, index: number) => index));
      setSelectedRecommendations(allIndices as Set<number>);
      
      // Also update selectedLocations with the selected recommendations
      // Convert TravelRecommendation[] to Location[] for selectedLocations
      const locationsData = recommendationsWithStatus.map(rec => ({
        id: rec.id,
        name: rec.name,
        address: rec.address || '',
        latitude: 0, // Default values for required Location properties
        longitude: 0,
        category: '',
        rating: rec.rating || 4.5,
        description: rec.description,
        imageUrl: rec.imageUrl
      }));
      setSelectedLocations(locationsData);
    } catch (error) {
      console.error("Failed to generate recommendations:", error);
      Alert.alert('Error', 'Failed to generate recommendations');
    } finally {
      setLoadingRecommendations(false);
    }
  };
  
  const toggleRecommendation = (index: number) => {
    const newSelected = new Set(selectedRecommendations);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRecommendations(newSelected);
    
    // Update selectedLocations based on selected indices
    const newSelectedLocations = recommendations
      .filter((_, idx) => newSelected.has(idx))
      .map(rec => ({
        id: rec.id,
        name: rec.name,
        address: rec.address || '',
        latitude: 0, // Default values for required Location properties
        longitude: 0,
        category: '',
        rating: rec.rating || 4.5,
        description: rec.description,
        imageUrl: rec.imageUrl
      }));
    setSelectedLocations(newSelectedLocations);
  };
  const [isFocused, setIsFocused] = useState(false);
  const [address, setAddress] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Use the custom useDebounce hook
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  
  // Effect to trigger search when debounced query changes
  useEffect(() => {
    if (debouncedSearchQuery.length >= 3) {
      handleLocationSearch(debouncedSearchQuery);
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchQuery, handleLocationSearch]);

  const [date, setDate] = useState(new Date(1598051730000));
  // AndroidMode is a type from DateTimePicker that can be 'date', 'time', etc.
const [mode, setMode] = useState<any>('date');
  const [show, setShow] = useState(false);

  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShow(false);
    setDate(currentDate);
  };

  const showMode = (currentMode: any) => {
    setShow(true);
    setMode(currentMode);
  };
  const showDatepicker = () => {
    showMode('date');
  };
  console.log('setShow ', show)

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create New Trip</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Trip Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Summer Vacation 2025"
            value={tripName}
            onChangeText={setTripName}
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Destination</Text>
          <View style={{ width: "100%" }}>
            <TextInput
              style={[styles.input, isFocused && styles.inputFocused]}
              placeholder="Search for a destination"
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
            
            {isSearching && (
              <View style={styles.searchingIndicator}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.searchingText}>Searching...</Text>
              </View>
            )}
            
            {searchResults.length > 0 && (
              <View style={styles.searchResultsContainer}>
                {searchResults.map((result, index) => (
                  <TouchableOpacity 
                    key={result.place_id || index}
                    style={styles.searchResultItem}
                    onPress={() => {
                      setAddress(result.display_name);
                      setDestination(result.display_name);
                      setSearchQuery(result.display_name);
                      setSearchResults([]);
                    }}
                  >
                    <Text style={styles.searchResultText}>{result.display_name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Types</Text>
          <View style={styles.pickerContainer}>
            <View style={styles.pickerIconContainer}>
              <Ionicons name="list-outline" size={20} color={colors.textSecondary} style={styles.pickerIcon} />
            </View>
            <TouchableOpacity 
              style={styles.dropdownButton} 
              onPress={() => setShowTripTypeDropdown(!showTripTypeDropdown)}
            >
              <Text style={styles.dropdownButtonText}>{tripType}</Text>
              <Ionicons 
                name={showTripTypeDropdown ? "chevron-up" : "chevron-down"} 
                size={20} 
                color={colors.textSecondary} 
              />
            </TouchableOpacity>
            {showTripTypeDropdown && (
              <View style={styles.dropdownMenu}>
                {tripTypes.map((type) => (
                  <TouchableOpacity 
                    key={type} 
                    style={[styles.dropdownItem, tripType === type && styles.dropdownItemSelected]}
                    onPress={() => {
                      setTripType(type);
                      setShowTripTypeDropdown(false);
                    }}
                  >
                    <Text style={[styles.dropdownItemText, tripType === type && styles.dropdownItemTextSelected]}>{type}</Text>
                    {tripType === type && (
                      <Check size={16} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Dates</Text>
          <View style={styles.dateContainer}>
          <Button onPress={showDatepicker} title="Show date picker!" />
          {show && (
            <DateTimePicker
              testID="dateTimePicker"
              value={date}
              mode={mode}
              is24Hour={true}
              onChange={onChange}
            />
          )}
          {/* <TextInput
              style={styles.dateInput}
              placeholder="Start Date"
              value={startDate}
              onChangeText={setStartDate}
            />
            <TextInput
              style={styles.dateInput}
              placeholder="End Date"
              value={destination || ''}
              onChangeText={setEndDate}
            /> */}
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Select Friends</Text>
          <View style={styles.friendsContainer}>
            {selectedFriends.map((friend: any) => (
              <View key={friend.id} style={styles.friendChip}>
                <Image source={{ uri: friend.avatar }} style={styles.friendAvatar} />
                <Text style={styles.friendName}>{friend.name}</Text>
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => handleRemoveFriend(friend.id)}
                >
                  <X size={16} color={colors.text} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          
          <TouchableOpacity 
            style={styles.addFriendsButton}
            onPress={handleAddMoreFriends}
          >
            <Plus size={20} color={colors.text} />
            <Text style={styles.addFriendsText}>Add More Friends</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.formGroup}>
          <View style={styles.suggestedPlacesContainer}>
          <Text style={styles.label}>Suggested Places</Text>


            <TouchableOpacity 
              style={styles.regenerateButton}
              onPress={generateRecommendations}
            >
              <Sparkles size={16} color="white" />
              <Text style={styles.regenerateText}>Generate</Text>
            </TouchableOpacity>
          </View>

          {loadingRecommendations ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Generating recommendations for {destination}...</Text>
            </View>
          ) : recommendations.length > 0 ? (
            <View style={styles.recommendationsContainer}>
              {recommendations.map((recommendation, index) => (
                <SuggestedPlace
                  key={recommendation.id || index}
                  place={{
                    id: recommendation.id || `rec-${index}`,
                    name: recommendation.name,
                    description: recommendation.description || '',
                    image: recommendation.imageUrl || 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be',
                    rating: recommendation.rating || 0, // Default rating
                    votes: recommendation.votes, // Default votes
                    address: recommendation.address || ''
                  }}
                  isSelected={selectedRecommendations.has(index)}
                  onToggle={() => toggleRecommendation(index)}
                />
              ))}
              <View style={styles.selectedSummary}>
                <Text style={styles.selectedSummaryText}>
                  {selectedRecommendations.size} of {recommendations.length} places selected
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.noRecommendationsText}>
              Click the Generate button to get recommendations based on your destination and trip type
            </Text>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.createButton}
          onPress={handleCreateTrip}
        >
          <Text style={styles.createButtonText}>Create Trip</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchResultsContainer: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    overflow: 'scroll',
    zIndex: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchResultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchResultText: {
    fontSize: 14,
    color: colors.text,
  },
  searchingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  searchingText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.textSecondary,
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: colors.text,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  pickerIconContainer: {
    paddingHorizontal: 12,
    height: '100%',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  pickerIcon: {
    marginRight: 4,
  },
  dropdownButton: {
    height: 50,
    flex: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: colors.text,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 51,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 2,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownItemSelected: {
    backgroundColor: colors.separator,
  },
  dropdownItemText: {
    fontSize: 16,
    color: colors.text,
  },
  dropdownItemTextSelected: {
    color: colors.primary,
    fontWeight: '500',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    width: '48%',
  },
  friendsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  friendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  friendAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 6,
  },
  friendName: {
    fontSize: 14,
    marginRight: 6,
  },
  removeButton: {
    padding: 2,
  },
  addFriendsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
  },
  addFriendsText: {
    fontSize: 16,
    marginLeft: 8,
  },
  suggestedPlacesContainer: {
    marginTop: 8,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  regenerateButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  regenerateText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
  },
  recommendationsContainer: {
    marginTop: 10,
  },
  recommendationItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  recommendationName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: colors.text,
  },
  recommendationDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  recommendationAddress: {
    fontSize: 12,
    color: colors.textTertiary,
    fontStyle: 'italic',
  },
  noRecommendationsText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  selectedSummary: {
    marginTop: 10,
    marginBottom: 10,
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedSummaryText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});