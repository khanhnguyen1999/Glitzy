import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { colors } from '@/constants/colors';
import { Check } from 'lucide-react-native';

interface Place {
  id: string;
  name: string;
  description: string;
  image: string;
  imageUrl?: string; // Support both image and imageUrl
  rating: number;
  votes?: number;
  address?: string;
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
  // Use imageUrl if available, otherwise fall back to image
  const imageSource = place.imageUrl || place.image;

  return (
    <View style={styles.container}>
      <Image 
        source={{ uri: imageSource }} 
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text style={styles.name}>{place.name}</Text>
        <Text style={styles.description} numberOfLines={2}>{place.description}</Text>
        {place.address && (
          <Text style={styles.address} numberOfLines={1}>{place.address}</Text>
        )}
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
          {place.votes && (
            <Text style={styles.votes}>({place.votes})</Text>
          )}
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 110,
    height: 120,
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
    color: colors.text,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
    lineHeight: 18,
  },
  address: {
    fontSize: 12,
    color: colors.textTertiary,
    fontStyle: 'italic',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
    color: colors.text,
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
  votes: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
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