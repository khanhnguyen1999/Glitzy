import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { colors } from '@/constants/colors';
import { Check } from 'lucide-react-native';

interface Place {
  id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
}

interface SuggestedPlaceProps {
  place: Place;
  isSelected: boolean;
  onToggle: () => void;
}

export const SuggestedPlace: React.FC<SuggestedPlaceProps> = ({
  place,
  isSelected,
  onToggle
}) => {
  return (
    <View style={styles.container}>
      <Image 
        source={{ uri: place.image }} 
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text style={styles.name}>{place.name}</Text>
        <Text style={styles.description}>{place.description}</Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>{place.rating}</Text>
          <View style={styles.starContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Text 
                key={star} 
                style={[
                  styles.star,
                  star <= Math.floor(place.rating) ? styles.filledStar : styles.emptyStar
                ]}
              >
                ★
              </Text>
            ))}
          </View>
        </View>
      </View>
      <TouchableOpacity 
        style={[
          styles.checkbox,
          isSelected && styles.checkboxSelected
        ]}
        onPress={onToggle}
      >
        {isSelected && <Check size={16} color="white" />}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  image: {
    width: 100,
    height: 100,
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  starContainer: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 14,
    marginRight: 2,
  },
  filledStar: {
    color: '#FFD700',
  },
  emptyStar: {
    color: colors.border,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    margin: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});