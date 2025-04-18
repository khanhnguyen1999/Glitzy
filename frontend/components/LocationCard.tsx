import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Location } from '../types/location';

interface LocationCardProps {
  location: Location;
  isSelected: boolean;
  onSelect: () => void;
}

const LocationCard: React.FC<LocationCardProps> = ({ location, isSelected, onSelect }) => {
  return (
    <TouchableOpacity 
      onPress={onSelect}
      style={[
        styles.container,
        isSelected && styles.selectedContainer
      ]}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: location.imageUrl || 'https://via.placeholder.com/150' }} 
          style={styles.image} 
        />
        {isSelected && (
          <View style={styles.selectedBadge}>
            <Ionicons name="checkmark-circle" size={24} color="#ffffff" />
          </View>
        )}
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>{location.name}</Text>
        <Text style={styles.category}>{location.category}</Text>
        
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.rating}>{location.rating.toFixed(1)}</Text>
        </View>
        
        <Text style={styles.timeRequired}>
          {location.estimatedTimeRequired 
            ? `${Math.round(location.estimatedTimeRequired / 60)} hr ${location.estimatedTimeRequired % 60} min` 
            : 'Time varies'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 180,
    height: 240,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  selectedContainer: {
    borderWidth: 2,
    borderColor: '#4285F4',
  },
  imageContainer: {
    width: '100%',
    height: 120,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4285F4',
    borderRadius: 12,
    padding: 2,
  },
  infoContainer: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  timeRequired: {
    fontSize: 12,
    color: '#666',
  },
});

export default LocationCard;
