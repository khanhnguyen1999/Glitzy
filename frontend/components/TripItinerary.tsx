import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { TripItinerary as ItineraryType } from '../types/itinerary';

interface TripItineraryProps {
  itinerary: ItineraryType;
  isEditable: boolean;
}

const TripItinerary: React.FC<TripItineraryProps> = ({ itinerary, isEditable }) => {
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState(0); // 0 is the first day

  const getActivityTypeIcon = (type: string) => {
    switch (type) {
      case 'VISIT':
        return <Ionicons name="location" size={20} color="#FF385C" />;
      case 'MEAL':
        return <Ionicons name="restaurant" size={20} color="#4CAF50" />;
      case 'REST':
        return <Ionicons name="bed" size={20} color="#9C27B0" />;
      case 'TRAVEL':
        return <Ionicons name="car" size={20} color="#FF9800" />;
      default:
        return <Ionicons name="calendar" size={20} color="#2196F3" />;
    }
  };

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'VISIT':
        return '#FFEBEE';
      case 'MEAL':
        return '#E8F5E9';
      case 'REST':
        return '#F3E5F5';
      case 'TRAVEL':
        return '#FFF3E0';
      default:
        return '#E3F2FD';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daySelector}>
        {itinerary.days.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayButton,
              selectedDay === index && styles.selectedDayButton
            ]}
            onPress={() => setSelectedDay(index)}
          >
            <Text style={[
              styles.dayButtonText,
              selectedDay === index && styles.selectedDayButtonText
            ]}>
              Day {day.day}
            </Text>
            <Text style={[
              styles.dayDate,
              selectedDay === index && styles.selectedDayDate
            ]}>
              {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.dayContent}>
        <View style={styles.dayHeader}>
          <Text style={styles.dayTitle}>
            Day {itinerary.days[selectedDay].day} - {new Date(itinerary.days[selectedDay].date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
          {isEditable && (
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => router.push(`/trip/edit-day/${itinerary.id}?day=${selectedDay}`)}
            >
              <Ionicons name="pencil" size={16} color="#4285F4" />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView style={styles.activitiesList}>
          {itinerary.days[selectedDay].activities.map((activity, index) => (
            <View 
              key={index} 
              style={[
                styles.activityItem,
                { backgroundColor: getActivityTypeColor(activity.type) }
              ]}
            >
              <View style={styles.activityTime}>
                <Text style={styles.timeText}>{activity.startTime}</Text>
                <View style={styles.timeConnector}>
                  <View style={styles.timeConnectorLine} />
                </View>
                <Text style={styles.timeText}>{activity.endTime}</Text>
              </View>
              
              <View style={styles.activityContent}>
                <View style={styles.activityHeader}>
                  {getActivityTypeIcon(activity.type)}
                  <Text style={styles.activityType}>
                    {activity.type.charAt(0) + activity.type.slice(1).toLowerCase()}
                  </Text>
                </View>
                
                <Text style={styles.locationName}>{activity.location.name}</Text>
                
                {activity.location.address && (
                  <Text style={styles.locationAddress}>{activity.location.address}</Text>
                )}
                
                {activity.notes && (
                  <Text style={styles.activityNotes}>{activity.notes}</Text>
                )}
                
                {activity.type === 'VISIT' && activity.location.estimatedTimeRequired && (
                  <View style={styles.timeRequired}>
                    <Ionicons name="time-outline" size={14} color="#666" />
                    <Text style={styles.timeRequiredText}>
                      {Math.floor(activity.location.estimatedTimeRequired / 60)} hr {activity.location.estimatedTimeRequired % 60} min
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  daySelector: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#f8f9fa',
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  selectedDayButton: {
    backgroundColor: '#4285F4',
    borderColor: '#4285F4',
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  selectedDayButtonText: {
    color: '#fff',
  },
  dayDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  selectedDayDate: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  dayContent: {
    flex: 1,
    padding: 16,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(66, 133, 244, 0.1)',
  },
  editButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#4285F4',
  },
  activitiesList: {
    flex: 1,
  },
  activityItem: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  activityTime: {
    width: 60,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  timeConnector: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  timeConnectorLine: {
    width: 1,
    flex: 1,
    backgroundColor: '#ccc',
  },
  activityContent: {
    flex: 1,
    padding: 12,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityType: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  locationName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  activityNotes: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
    marginTop: 8,
  },
  timeRequired: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  timeRequiredText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
});

export default TripItinerary;
