import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { ExpenseItem } from '@/components/ExpenseItem';
import { useExpenseStore } from '@/store/expenseStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/Button';
import { ArrowLeft, Plus } from 'lucide-react-native';

export default function ExpensesScreen() {
  const router = useRouter();
  const { expenses, fetchExpenses } = useExpenseStore();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchExpenses(user.id);
    }
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (user?.id) {
      await fetchExpenses(user.id);
    }
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button
          title="Back"
          icon={<ArrowLeft size={20} color={colors.primary} />}
          variant="outline"
          onPress={() => router.back()}
        />
        <Text style={styles.title}>All Expenses</Text>
        <Button
          title="Add"
          icon={<Plus size={20} color={colors.primary} />}
          variant="outline"
          onPress={() => router.push('/add-expense')}
        />
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {expenses.length > 0 ? (
          expenses.map((expense) => (
            <ExpenseItem
              key={expense.id}
              expense={expense}
              onPress={() => router.push(`/expenses/${expense.id}`)}
            />
          ))
        ) : (
          <Text style={styles.emptyText}>No expenses found</Text>
        )}
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
    paddingVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 24,
  },
});
