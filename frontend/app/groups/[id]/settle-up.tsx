import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Image } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ArrowLeft, ChevronDown, Home, Users, Plus, DollarSign, User } from 'lucide-react-native';
import { useGroupStore } from '@/store/groupStore';
import { useExpenseStore } from '@/store/expenseStore';
import { useSettlementStore } from '@/store/settlementStore';
import { useAuthStore } from '@/store/authStore';
import Loading from '@/components/LoadingCommon/Loading';
// Remove Button import as we're using TouchableOpacity instead
import { ExpenseSummary as ExpenseSummaryType } from '@/types/trip';

export default function SettleUpScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [isPayingNow, setIsPayingNow] = useState(false);
  const [isReminding, setIsReminding] = useState(false);
  const { user } = useAuthStore();
  
  // Group store for fetching group details
  const { 
    fetchGroupById,
    currentGroup: group,
    isLoading: groupLoading 
  } = useGroupStore();
  
  // Expense store for fetching expenses and balances
  const {
    fetchExpensesByGroupId,
    fetchGroupBalances,
    expenses,
    balances,
    isLoading: expenseLoading
  } = useExpenseStore();
  
  // Settlement store for fetching and updating settlements
  const {
    fetchUserSettlements,
    updateSettlementStatus,
    settlements,
    isLoading: settlementLoading
  } = useSettlementStore();
  
  const isLoading = groupLoading || expenseLoading || settlementLoading;
  
  // Fetch data on component mount
  useEffect(() => {
    if (id) {
      fetchGroupById(id);
      fetchExpensesByGroupId(id);
      fetchGroupBalances(id);
      if (user?.id) {
        fetchUserSettlements(user.id);
      }
    }
  }, [id, fetchGroupById, fetchExpensesByGroupId, fetchGroupBalances, fetchUserSettlements, user?.id]);
  
  // Create a properly formatted expense summary from the balances data
  const expenseSummary: ExpenseSummaryType = {
    totalAmount: expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0,
    yourShare: balances?.reduce((sum, balance) => sum + (balance.amount || 0), 0) || 0,
    currency: expenses?.[0]?.currency || '$',
    youPaid: expenses?.filter(e => e.paidBy === user?.id)?.reduce((sum, e) => sum + e.amount, 0) || 0,
    youOwe: balances?.filter(b => b.amount < 0)?.reduce((sum, b) => sum + Math.abs(b.amount), 0) || 0,
    owedToYou: balances?.filter(b => b.amount > 0)?.reduce((sum, b) => sum + b.amount, 0) || 0
  };
  
  if (isLoading) {
    return <Loading fullScreen text="Loading settlement details..." />;
  }
  
  if (!group) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Group not found</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Format date range for display
  // Since Group type doesn't have startDate/endDate properties, use createdAt for display
  // or default to current date
  const startDate = group.createdAt ? new Date(group.createdAt) : new Date();
  // Set end date to 7 days after start date as a fallback
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 7);
  
  const formatDateRange = () => {
    return `(${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${endDate.getFullYear()})`;
  };
  
  const handlePayNow = async (settlementId: string) => {
    setIsPayingNow(true);
    try {
      // Update settlement status to completed
      await updateSettlementStatus(settlementId, "completed");
      // Refresh balances
      if (id) {
        await fetchGroupBalances(id);
      }
      // Show success message or navigate back
      alert('Payment successful!');
      router.back();
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Failed to process payment. Please try again.');
    } finally {
      setIsPayingNow(false);
    }
  };
  
  const handleRemind = async (settlementId: string) => {
    setIsReminding(true);
    // Simulate sending reminder
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsReminding(false);
    
    // Show success message
    alert('Reminder sent successfully');
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
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settle Up</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.content}>
        <TouchableOpacity style={styles.tripSelector}>
          <Text style={styles.tripName}>{group.name || 'Group'} {formatDateRange()}</Text>
          <ChevronDown size={20} color="#000" />
        </TouchableOpacity>
        
        <View style={styles.expenseSummaryCard}>
          <Text style={styles.expenseSummaryTitle}>Total Group Expenses</Text>
          <Text style={styles.expenseSummaryAmount}>{expenseSummary.currency}{expenseSummary.totalAmount.toFixed(2)}</Text>
          
          <View style={styles.expenseSummaryDetails}>
            <View style={styles.expenseSummaryDetail}>
              <Text style={styles.expenseSummaryDetailText}>{group.members?.length || 0} Members</Text>
            </View>
            <View style={styles.expenseSummaryDetail}>
              <Text style={styles.expenseSummaryDetailText}>{expenses?.length || 0} Expenses</Text>
            </View>
          </View>
        </View>
        
        <Text style={styles.sectionTitle}>Settlement Summary</Text>
        
        {settlements?.map((settlement) => {
          // Determine if this is a payment you owe or someone owes you
          const isYouOwe = settlement.fromUserId === user?.id;
          const otherUserId = isYouOwe ? settlement.toUserId : settlement.fromUserId;
          // Get the other user's name (would normally come from a user service)
          const otherUserName = `User ${otherUserId.substring(0, 4)}`;
          
          return (
            <View key={settlement.id} style={styles.settlementCard}>
              <View style={styles.settlementHeader}>
                <Image 
                  source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUserName)}&background=random` }} 
                  style={styles.settlementAvatar} 
                />
                
                <View style={styles.settlementInfo}>
                  {isYouOwe ? (
                    <Text style={styles.settlementTitle}>
                      You owe {otherUserName}
                    </Text>
                  ) : (
                    <Text style={styles.settlementTitle}>
                      {otherUserName} owes you
                    </Text>
                  )}
                  
                  <Text style={styles.settlementStatus}>
                    {settlement.status === 'pending' ? 'Pending payment' : 'Completed'}
                  </Text>
                </View>
                
                <Text style={styles.settlementAmount}>
                  {settlement.currency}{Math.abs(settlement.amount).toFixed(2)}
                </Text>
              </View>
              
              {isYouOwe && settlement.status === 'pending' && (
                <TouchableOpacity
                  style={[styles.payButton, isPayingNow && styles.disabledButton]}
                  onPress={() => handlePayNow(settlement.id)}
                  disabled={isPayingNow}
                >
                  {isPayingNow ? (
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Loading size="small" color="#fff" />
                      <Text style={{color: '#fff', marginLeft: 8}}>Processing...</Text>
                    </View>
                  ) : (
                    <Text style={{color: '#fff', fontWeight: '600'}}>Pay Now</Text>
                  )}
                </TouchableOpacity>
              )}
              
              {!isYouOwe && settlement.status === 'pending' && (
                <TouchableOpacity
                  style={[styles.remindButton, isReminding && styles.disabledButton]}
                  onPress={() => handleRemind(settlement.id)}
                  disabled={isReminding}
                >
                  {isReminding ? (
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Loading size="small" color="#000" />
                      <Text style={{color: '#000', marginLeft: 8}}>Sending...</Text>
                    </View>
                  ) : (
                    <Text style={styles.remindButtonText}>Remind</Text>
                  )}
                </TouchableOpacity>
              )}
              
              {settlement.status === 'completed' && (
                <View style={styles.settledContainer}>
                  <Text style={styles.settledText}>All settled up</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
      
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/')}>
          <Home size={24} color="#666" />
          <Text style={styles.tabText}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/friends')}>
          <Users size={24} color="#666" />
          <Text style={styles.tabText}>Friends</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItemCenter}>
          <View style={styles.tabItemCenterButton}>
            <Plus size={24} color="#fff" />
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/groups')}>
          <DollarSign size={24} color="#666" />
          <Text style={styles.tabText}>Expenses</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem}>
          <User size={24} color="#666" />
          <Text style={styles.tabText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  disabledButton: {
    opacity: 0.7,
    backgroundColor: '#999',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  tripSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tripName: {
    fontSize: 16,
    fontWeight: '600',
  },
  expenseSummaryCard: {
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  expenseSummaryTitle: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
  },
  expenseSummaryAmount: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  expenseSummaryDetails: {
    flexDirection: 'row',
    gap: 12,
  },
  expenseSummaryDetail: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 50,
  },
  expenseSummaryDetailText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settlementCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  settlementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  settlementAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  settlementInfo: {
    flex: 1,
  },
  settlementTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settlementStatus: {
    fontSize: 14,
    color: '#666',
  },
  settlementAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  payButton: {
    backgroundColor: '#000',
    borderRadius: 8,
  },
  remindButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  remindButtonText: {
    color: '#000',
  },
  settledContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  settledText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2f95dc',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingBottom: 20, // Extra padding for iOS home indicator
    paddingTop: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItemCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30, // Lift the center button up
  },
  tabItemCenterButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});