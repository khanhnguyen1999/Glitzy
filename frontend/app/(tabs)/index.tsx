import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/constants/colors";
import { BalanceSummary } from "@/components/BalanceSummary";
import { ExpenseItem } from "@/components/ExpenseItem";
import { FriendItem } from "@/components/FriendItem";
import { GroupItem } from "@/components/GroupItem";
import { Button } from "@/components/Button";
import { useExpenseStore } from "@/store/expenseStore";
import { useFriendStore } from "@/store/friendStore";
import { useGroupStore } from "@/store/groupStore";
import { useRouter } from "expo-router";
import { Plus, ArrowRight } from "lucide-react-native";
import { useAuthStore } from "@/store/authStore";
import { SvgXml } from 'react-native-svg';

import { TouchableOpacity, Image } from 'react-native';
import { Bell, UserPlus, DollarSign } from 'lucide-react-native';
import { FeaturedTripCard } from '@/components/FeaturedTripCard';
import { UpcomingTripItem } from '@/components/UpcomingTripItem';
import Loading from '@/components/LoadingCommon/Loading';
// Define types for our data models
interface Expense {
  id: string;
  // Add other expense properties as needed
}

interface Friend {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  avatarUrl?: string;
  // Add other friend properties as needed
}

interface Group {
  id: string;
  // Add other group properties as needed
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  // Add other user properties as needed
}

export default function HomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuthStore() as { user: User };
  const { expenses, fetchExpenses, isLoading: expensesLoading } = useExpenseStore() as { 
    expenses: Expense[], 
    fetchExpenses: (userId: string) => Promise<void>, 
    isLoading: boolean 
  };


  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    await Promise.all([
      user?.id ? fetchExpenses(user.id) : Promise.resolve(),
    ]);
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleViewDetails = (tripId: string) => {
    router.push(`/trip/${tripId}`);
  };
  
  // Calculate balances
  const youOwe = 150.75; // In a real app, calculate this from expenses
  const youAreOwed = 275.25; // In a real app, calculate this from expenses

    
  const handleNotificationPress = () => {
    // showNotification('You have no new notifications', 'info');
  };

  const handleSettleUp = () => {
    // Use replace instead of push to avoid navigation issues
    // router.replace('/settle-up');
  };

  if(!user || expensesLoading) {
    return <Loading fullScreen text="Please wait..." />
  }


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hi, {user?.firstName}</Text>
            <Text style={styles.subGreeting}>Ready for your next adventure?</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={handleNotificationPress}
            >
              <Bell size={20} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity>
              {user.avatar && <SvgXml style={styles.userAvatar} xml={user.avatar} width="100" height="100" />}
            </TouchableOpacity>
          </View>
        </View>
        
        {/* {activeTrip && (
          <FeaturedTripCard 
            trip={activeTrip} 
            onViewDetails={() => handleViewDetails(activeTrip.id)} 
          />
        )}
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Upcoming Trips</Text>
          
          {upcomingTrips.map(trip => (
            <UpcomingTripItem 
              key={trip.id} 
              trip={trip} 
              onPress={() => handleViewDetails(trip.id)} 
            />
          ))}
          
          {upcomingTrips.length === 0 && (
            <Text style={styles.emptyText}>No upcoming trips planned</Text>
          )}
        </View> */}
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              // onPress={() => showNotification('Friend management coming soon', 'info')}
            >
              <UserPlus size={20} color={colors.text} />
              <Text style={styles.quickActionText}>Add Friends</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={handleSettleUp}
            >
              <DollarSign size={20} color={colors.text} />
              <Text style={styles.quickActionText}>Settle Up</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  subGreeting: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  sectionContainer: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 20,
  },
  quickActions: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginRight: 12,
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});