import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors } from '@/constants/colors';
import { Trip } from '@/types';

interface UpcomingTripItemProps {
  trip: Trip;
  onPress: () => void;
}

export const UpcomingTripItem: React.FC<UpcomingTripItemProps> = ({ 
  trip, 
  onPress 
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
  
  // Show up to 3 participants
  const visibleParticipants = trip.participants.slice(0, 3);
  
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.content}>
        <View>
          <Text style={styles.title}>{trip.name}</Text>
          <Text style={styles.dateRange}>{formatDateRange()}</Text>
          
          <View style={styles.participantsContainer}>
            {visibleParticipants.map((participant, index) => (
              <Image 
                key={participant.id}
                source={{ uri: participant.avatar }}
                style={[
                  styles.participantAvatar,
                  { marginLeft: index > 0 ? -8 : 0 }
                ]}
              />
            ))}
          </View>
        </View>
        
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Planning</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 12,
  },
  content: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  dateRange: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  participantsContainer: {
    flexDirection: 'row',
  },
  participantAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.card,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.buttonSecondary,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
});