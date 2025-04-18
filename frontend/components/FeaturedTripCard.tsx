import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors } from '@/constants/colors';
import { Trip } from '@/types';

interface FeaturedTripCardProps {
  trip: Trip;
  onViewDetails: () => void;
}

export const FeaturedTripCard: React.FC<FeaturedTripCardProps> = ({ 
  trip, 
  onViewDetails 
}) => {
  // Format date range
  const formatDateRange = () => {
    if (!trip.startDate || !trip.endDate) return '';
    
    const startDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);
    
    const startMonth = startDate.toLocaleString('default', { month: 'short' });
    const endMonth = endDate.toLocaleString('default', { month: 'short' });
    
    const startDay = startDate.getDate();
    const endDay = endDate.getDate();
    const year = startDate.getFullYear();
    
    if (startMonth === endMonth) {
      return `${startMonth} ${startDay}-${endDay}, ${year}`;
    }
    
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
  };
  
  // Determine how many participants to show directly
  const visibleParticipants = trip.participants.slice(0, 3);
  const remainingCount = Math.max(0, trip.participants.length - 3);
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{trip.name}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Active</Text>
        </View>
      </View>
      
      <Text style={styles.dateRange}>{formatDateRange()}</Text>
      
      <View style={styles.participantsContainer}>
        {visibleParticipants.map((participant, index) => (
          <Image 
            key={participant.id}
            source={{ uri: participant.avatar }}
            style={[
              styles.participantAvatar,
              { marginLeft: index > 0 ? -10 : 0 }
            ]}
          />
        ))}
        
        {remainingCount > 0 && (
          <View style={[styles.participantAvatar, styles.remainingCount, { marginLeft: -10 }]}>
            <Text style={styles.remainingCountText}>+{remainingCount}</Text>
          </View>
        )}
      </View>
      
      <TouchableOpacity 
        style={styles.viewDetailsButton}
        onPress={onViewDetails}
      >
        <Text style={styles.viewDetailsText}>View Details</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  statusBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  dateRange: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 16,
  },
  participantsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  participantAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  remainingCount: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  remainingCountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  viewDetailsButton: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  viewDetailsText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});