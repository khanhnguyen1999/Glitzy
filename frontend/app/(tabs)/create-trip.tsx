import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import DateTimePicker from '@react-native-community/datetimepicker';
// import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useFriendStore } from '../../store/friendStore';
import { useUserStore } from '../../store/userStore';
import { createTripGroup } from '../../services/tripService';
import { getLocationRecommendations } from '../../services/recommendationService';
import FriendSelector from '../../components/FriendSelector';
import LocationCard from '../../components/LocationCard';
import { Location } from '../../types/location';
import { Sparkles } from 'lucide-react-native';


import { 
  StyleSheet, 
  Image,
  SafeAreaView
} from 'react-native';
import { Stack } from 'expo-router';
import { colors } from '@/constants/colors';
import { ArrowLeft, Search, X, Plus, Check } from 'lucide-react-native';
import { SuggestedPlace } from '@/components/SuggestedPlace';


export default function CreateTripScreen() {
  const router = useRouter();
  const { friends } = useFriendStore();
  const { user } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [recommendedLocations, setRecommendedLocations] = useState<Location[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<Location[]>([]);
  const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(null);
  const [showTripTypeDropdown, setShowTripTypeDropdown] = useState(false);



  const [tripName, setTripName] = useState('');
  const [destination, setDestination] = useState('');
  const [tripType, setTripType] = useState('Relax & Wellness');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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
    if (selectedFriends.length === 0) {
      Alert.alert('Error', 'Please select at least one friend');
      return;
    }

    if (selectedLocations.length === 0) {
      Alert.alert('Error', 'Please select at least one location');
      return;
    }

    setLoading(true);
    try {
      const tripData = {
        ...data,
        startDate: data.startDate.toISOString().split('T')[0],
        endDate: data.endDate.toISOString().split('T')[0],
        memberIds: [...selectedFriends, user?.id],
        selectedLocations,
        tripType: tripType // Include the trip type
      };

      const response = await createTripGroup(tripData);
      Alert.alert('Success', 'Trip created successfully!');
      router.push({ 
        pathname: '/trip/[id]',
        params: { id: response.id }
      });
    } catch (error) {
      console.error('Error creating trip:', error);
      Alert.alert('Error', 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };


  
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
          <View style={styles.searchInputContainer}>
            <Search size={20} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search destination"
              value={destination}
              onChangeText={setDestination}
            />
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
            <TextInput
              style={styles.dateInput}
              placeholder="Start Date"
              value={startDate}
              onChangeText={setStartDate}
            />
            <TextInput
              style={styles.dateInput}
              placeholder="End Date"
              value={endDate}
              onChangeText={setEndDate}
            />
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
            <TouchableOpacity style={styles.regenerateButton}>
              <Sparkles size={16} color="white" />
              <Text style={styles.regenerateText}>Regenerate</Text>
            </TouchableOpacity>
          </View>
            {/* {recommendedLocations.map(place => (
              <SuggestedPlace
                key={place.id}
                place={place}
                isSelected={selectedPlaces.includes(place.id)}
                onToggle={() => handleTogglePlace(place.id)}
              />
            ))} */}
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
});