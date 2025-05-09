import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  StyleSheet, 
  SafeAreaView,
  Modal,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useForm } from 'react-hook-form';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { ArrowLeft, X, Plus, Check, Sparkles } from 'lucide-react-native';
import { SvgXml } from 'react-native-svg';

// Hooks
import useDebounce from '../../hooks/useDebounce';
import { useFriendStore } from '@/store/friendStore';
import { useAuthStore } from '@/store/authStore';
import { useGroupStore } from '@/store/groupStore';

// Services
import { getLocationRecommendations } from '@/services/recommendationService';

// Components
import { SuggestedPlace } from '@/components/SuggestedPlace';

// Types
import { Location } from '@/types/location';
import { TravelRecommendation } from '@/stores/travelRecommendationStore';

// Constants
import { colors } from '@/constants/colors';
import { createTripGroup } from '@/services/tripService';


// Trip type options
const TRIP_TYPES = [
  'Relax & Wellness',
  'Adventure & Exploration',
  'Culture & Learning',
  'Food & Shopping',
  'Work & Entertainment'
];

export default function CreateTripScreen() {
  const router = useRouter();
  const { friends, fetchFriends } = useFriendStore();
  const { searchLocations } = useGroupStore();
  const { user } = useAuthStore();
  
  // Form state
  const [tripName, setTripName] = useState('');
  const [tripType, setTripType] = useState('Work & Entertainment');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [showTripTypeDropdown, setShowTripTypeDropdown] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isSelection, setIsSelection] = useState(false);
  
  // Location search state
  const [destination, setDestination] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  
  // Date picker state
  const [date, setDate] = useState(new Date(1598051730000));
  const [mode, setMode] = useState<'date' | 'time'>('date');
  const [show, setShow] = useState(false);
  
  // Recommendations state
  const [recommendations, setRecommendations] = useState<TravelRecommendation[]>([]);
  const [selectedRecommendations, setSelectedRecommendations] = useState<Set<number>>(new Set());
  const [recommendedLocations, setRecommendedLocations] = useState<Location[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<Location[]>([]);
  
  // Friends state
  const [selectedFriends, setSelectedFriends] = useState<any[]>([]);
  const [friendModalVisible, setFriendModalVisible] = useState(false);
  
  // Form handling
  const { handleSubmit } = useForm({
    defaultValues: {
      name: '',
      description: '',
      destination: '',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    }
  });

  /**
   * Handle removing a friend from the selected friends list
   */
  const handleRemoveFriend = (friendId: string) => {
    setSelectedFriends(prevFriends => 
      prevFriends.filter(friend => friend.id !== friendId)
    );
  };

  /**
   * Handle selecting a friend from the modal
   */
  const handleSelectFriend = (friend: any) => {
    // Toggle friend selection
    const isAlreadySelected = selectedFriends.some(f => f.id === friend.id);
    
    if (isAlreadySelected) {
      // Remove friend if already selected
      setSelectedFriends(selectedFriends.filter(f => f.id !== friend.id));
    } else {
      // Add friend if not already selected
      setSelectedFriends([...selectedFriends, friend]);
    }
  };

  /**
   * Handle adding more friends to the trip
   */
  const handleAddMoreFriends = () => {
    // Open friend selection modal
    setFriendModalVisible(true);
  };
  console.log('selectedFriends ',selectedFriends)
  /**
   * Handle creating a new trip
   */
  const handleCreateTrip = async () => {
    if (!tripName.trim()) {
      Alert.alert('Error', 'Please enter a trip name');
      return;
    }

    if (!destination.trim()) {
      Alert.alert('Error', 'Please enter a destination');
      return;
    }

    setLoading(true);
    try {
      const tripData = {
        name: tripName,
        destination,
        startDate,
        endDate,
        memberIds: [...selectedFriends.map(f => f.friendId), user?.id],
        selectedLocations,
        category: tripType
      };
      
      // Uncomment when ready to implement
      const response = await createTripGroup(tripData);
      console.log('response ',response)
      Alert.alert('Success', 'Trip created successfully!');
      router.push({ 
        pathname: '/groups/[id]',
        params: { id: response.id }
      });
      
      // For now, just show success and go back
      Alert.alert('Success', 'Trip creation feature coming soon!');
      router.back();
    } catch (error) {
      console.error('Error creating trip:', error);
      Alert.alert('Error', 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  // State variables are already declared above

  /**
   * Location search functionality
   */
  const { isLoadingSearchLocations, searchResults } = useGroupStore();
  
  // This useEffect will be moved after state declarations

  /**
   * Generate travel recommendations based on destination and trip type
   */
  const generateRecommendations = async () => {
    if (!destination) {
      Alert.alert('Error', 'Please enter a destination first');
      return;
    }
    
    setLoadingRecommendations(true);
    try {
      const result = await getLocationRecommendations(destination, tripType);
      
      // Transform Location[] to TravelRecommendation[]
      const recommendationsWithStatus = result.map(location => ({
        ...location,
        status: 'todo' as const,
        image: location.imageUrl || 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bG9jYXRpb258ZW58MHx8MHx8&w=1000&q=80'
      }));
      
      setRecommendations(recommendationsWithStatus);
      
      // Select all recommendations by default
      const allIndices = new Set(recommendationsWithStatus.map((_, index: number) => index));
      setSelectedRecommendations(allIndices);
      
      // Convert TravelRecommendation[] to Location[] for selectedLocations
      const locationsData = recommendationsWithStatus.map(rec => ({
        id: rec.id,
        name: rec.name,
        address: rec.address || '',
        latitude: 0,
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
  
  /**
   * Toggle selection of a recommendation
   */
  const toggleRecommendation = (index: number) => {
    // Update the selected indices
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
        latitude: 0,
        longitude: 0,
        category: '',
        rating: rec.rating || 4.5,
        description: rec.description,
        imageUrl: rec.imageUrl
      }));
      
    setSelectedLocations(newSelectedLocations);
  };
  /**
   * Handle location selection from search results
   */
  const handleLocationSelect = (result: any) => {
    // Get the location name
    const locationName = result.display_name;
    
    // Update destination and search query
    setDestination(locationName);
    setSearchQuery(locationName);
    
    // Hide results and dismiss keyboard
    setShowResults(false);
    setIsFocused(false);
    Keyboard.dismiss();
  };
  
  // Handle location search when query changes
  useEffect(() => {
    const handleSearch = async () => {
      // Only search with 3+ characters
      if (debouncedSearchQuery.length < 3) {
        setShowResults(false);
        return;
      }
      
      try {
        // Search for locations
        await searchLocations(debouncedSearchQuery);
        
        // Show results if input is focused
        if (isFocused) {
          setShowResults(true);
        }
      } catch (error) {
        // Handle errors silently
        setShowResults(false);
      }
    };
    
    handleSearch();
  }, [debouncedSearchQuery, searchLocations, isFocused]);
  
  // Create a ref for the search input
  const searchInputRef = useRef(null);
  
  // Handle touch outside by using a TouchableWithoutFeedback component
  // We'll implement this in the UI part with a TouchableWithoutFeedback that wraps the entire screen

  /**
   * Handle date change from the date picker
   */
  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShow(false);
    setDate(currentDate);
    
    // Update the appropriate date based on context
    if (mode === 'date') {
      setStartDate(currentDate);
    }
  };

  /**
   * Show the date picker with the specified mode
   */
  const showMode = (currentMode: 'date' | 'time') => {
    setShow(true);
    setMode(currentMode);
  };
  
  /**
   * Show the date picker in date mode
   */
  const showDatepicker = () => {
    showMode('date');
  };

  useEffect(()=>{
    (async () => {
      await fetchFriends();
    })();
  },[])

  return (
    <TouchableWithoutFeedback onPress={() => {
      // Keyboard.dismiss();
      // setShowSearchResults(false);
    }}>
    <SafeAreaView style={styles.container}>
      {/* Friend Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={friendModalVisible}
        onRequestClose={() => setFriendModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Friends</Text>
              <TouchableOpacity onPress={() => setFriendModalVisible(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.friendsList}>
              {friends.length > 0 ? (
                friends.map((item: any) => {
                  const isSelected = selectedFriends.some(f => f.id === item.id);
                  return (
                    <TouchableOpacity 
                      key={item.id} 
                      style={[styles.friendItem, isSelected && styles.selectedFriendItem]}
                      onPress={() => handleSelectFriend(item)}
                    >
                      {item.friend.avatar && <SvgXml style={styles.userAvatar} xml={item.friend.avatar} width="100" height="100" />}
                      <View style={styles.infoContainer}>
                        <Text style={styles.name}>{item.friend.firstName} {item.friend.lastName}</Text>
                        <Text style={styles.username}>
                          {item.friend?.username ? `@${item.friend.username}` : ''}
                        </Text>
                      </View>
                      {isSelected && (
                        <View style={styles.selectedCheckmark}>
                          <Check size={16} color="white" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })
              ) : (
                <Text style={styles.noFriendsText}>No friends found. Add friends in your profile.</Text>
              )}
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.doneButton}
              onPress={() => setFriendModalVisible(false)}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
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
              onChangeText={setSearchQuery}
              onFocus={() => {
                setIsFocused(true);
                // Show results if we have enough characters
                if (searchQuery.length >= 3) {
                  setShowResults(true);
                }
              }}
              onBlur={() => {
                // Hide results after a short delay to allow selection
                setTimeout(() => {
                  setIsFocused(false);
                  setShowResults(false);
                }, 150);
              }}
            />
            
            {isLoadingSearchLocations && (
              <View style={styles.searchingIndicator}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.searchingText}>Searching...</Text>
              </View>
            )}
            
            {showResults && searchResults.length > 0 && debouncedSearchQuery.length >= 3 && (
              <View style={styles.searchResultsContainer}>
                {searchResults.map((result, index) => (
                  <TouchableOpacity 
                    key={result.place_id || index}
                    style={styles.searchResultItem}
                    onPress={() => handleLocationSelect(result)}
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
                {TRIP_TYPES.map((type: string) => (
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
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => {
                showDatepicker();
              }}
            >
              <Text style={startDate ? styles.dateText : styles.datePlaceholder}>
                {startDate ? startDate.toLocaleDateString() : "Select Start Date"}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => {
                // For now, just use the same date picker
                // In a full implementation, you'd want to track which date is being edited
                showDatepicker();
              }}
            >
              <Text style={endDate ? styles.dateText : styles.datePlaceholder}>
                {endDate ? endDate.toLocaleDateString() : "Select End Date"}
              </Text>
            </TouchableOpacity>
            
            {show && (
              <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode={mode}
                is24Hour={true}
                onChange={onChange}
                minimumDate={new Date()}
              />
            )}
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Select Friends</Text>
          <View style={styles.friendsContainer}>
            {selectedFriends.map((item: any) => (
              <View key={item.id} style={styles.friendChip}>
                {item.friend.avatar && <SvgXml xml={item.friend.avatar} width="20" height="20" />}
                <Text style={styles.friendName}>{item.friend.firstName} {item.friend.lastName}</Text>
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => handleRemoveFriend(item.id)}
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
            <Text style={styles.addFriendsText}>
              {selectedFriends.length > 0 
                ? `${selectedFriends.length} friend${selectedFriends.length > 1 ? 's' : ''} selected • Add more` 
                : 'Add friends to your trip'}
            </Text>
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
          style={[styles.createButton, loading && styles.disabledButton]}
          onPress={handleCreateTrip}
          disabled={loading}
        >
          {loading ? (
            <>
              <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
              <Text style={styles.createButtonText}>Creating...</Text>
            </>
          ) : (
            <Text style={styles.createButtonText}>Create Trip</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  friendsList: {
    marginBottom: 20,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedFriendItem: {
    backgroundColor: '#f0f8ff',
  },
  friendItemAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  friendItemName: {
    fontSize: 16,
    flex: 1,
    marginLeft: 6
  },
  selectedCheckmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noFriendsText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#999',
  },
  doneButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  doneButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoContainer: {
    flex: 1,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
  },
  username: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
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
    width: '48%',
    height: 50,
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    color: colors.text,
  },
  datePlaceholder: {
    fontSize: 16,
    color: colors.textSecondary,
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
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 32,
    flexDirection: 'row',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: colors.textSecondary,
    opacity: 0.7,
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