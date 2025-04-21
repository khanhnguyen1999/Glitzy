import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, SafeAreaView, Image } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ArrowLeft, Plus, MoreVertical } from 'lucide-react-native';
import { useGroupStore } from '@/store/groupStore';
import { useExpenseStore } from '@/store/expenseStore';
import { useAuthStore } from '@/store/authStore';
import ExpenseSummary from '@/components/ExpenseSummary';
import { ExpenseItem } from '@/components/ExpenseItem';
import TripTabs from '@/components/TripTabs';
import Loading from '@/components/LoadingCommon/Loading';
import { ExpenseSummary as ExpenseSummaryType } from '@/types/trip';

type TabType = 'chat' | 'itinerary' | 'expenses';

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('expenses');
  const { user } = useAuthStore();
  
  const { 
    fetchGroupById,
    currentGroup: trip,
    isLoading: tripLoading 
  } = useGroupStore();
  
  const {
    fetchExpensesByGroupId,
    fetchGroupBalances,
    expenses,
    balances,
    isLoading: expenseLoading
  } = useExpenseStore();
  
  const isLoading = tripLoading || expenseLoading;
  
  // Fetch trip and expense data on component mount
  useEffect(() => {
    if (id) {
      fetchGroupById(id);
      fetchExpensesByGroupId(id);
      fetchGroupBalances(id);
    }
  }, [id, fetchGroupById, fetchExpensesByGroupId, fetchGroupBalances]);
  
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
    return <Loading fullScreen text="Loading trip details..." />;
  }
  
  if (!trip) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Trip not found</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Use members property from TripGroup interface instead of participants
  const participantCount = trip?.members?.length || 0;
  
  const tabs = [
    { key: 'chat', label: 'Chat' },
    { key: 'itinerary', label: 'Itinerary' },
    { key: 'expenses', label: 'Expenses' },
  ];
  
  const handleSettleUp = () => {
    // Handle settle up logic
    console.log('Settle up pressed');
  };
  
  const handleAddExpense = () => {
    // Navigate to add expense screen
    console.log('Add expense pressed');
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
        
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{trip.name}</Text>
          <Text style={styles.subtitle}>
            with {participantCount} {participantCount === 1 ? 'friend' : 'friends'}
          </Text>
        </View>
        
        <TouchableOpacity style={styles.moreButton}>
          <MoreVertical size={24} color="#000" />
        </TouchableOpacity>
      </View>
      
      <TripTabs 
        tabs={tabs} 
        activeTab={activeTab} 
        onTabChange={(tab) => setActiveTab(tab as TabType)} 
      />
      
      {activeTab === 'expenses' && (
        <View style={styles.expensesContainer}>
          <ExpenseSummary 
            summary={expenseSummary} 
            onSettleUp={handleSettleUp}
          />
          
          <TouchableOpacity 
            style={styles.addExpenseButton}
            onPress={handleAddExpense}
          >
            <Plus size={20} color="#fff" />
            <Text style={styles.addExpenseButtonText}>Add New Expense</Text>
          </TouchableOpacity>
          
          <FlatList
            data={expenses}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ExpenseItem 
                expense={item} 
                onPress={() => console.log('Expense pressed:', item.id)}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.expensesList}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No expenses yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Add your first expense to start tracking
                </Text>
              </View>
            }
          />
        </View>
      )}
      
      {activeTab === 'chat' && (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>Chat functionality coming soon</Text>
        </View>
      )}
      
      {activeTab === 'itinerary' && (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>Itinerary functionality coming soon</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  membersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  moreButton: {
    padding: 8,
  },
  expensesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  addExpenseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  addExpenseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  expensesList: {
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
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
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
  },
});