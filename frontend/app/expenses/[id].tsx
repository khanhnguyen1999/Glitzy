import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { useExpenseStore } from '@/store/expenseStore';
import { Button } from '@/components/Button';
import { ArrowLeft } from 'lucide-react-native';

export default function ExpenseDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { fetchExpenseById, currentExpense } = useExpenseStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadExpense() {
      if (id) {
        try {
          await fetchExpenseById(id.toString());
          setLoading(false);
        } catch (error) {
          console.error('Error fetching expense:', error);
          setLoading(false);
        }
      }
    }
    
    loadExpense();
  }, [id, fetchExpenseById]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button
          title="Expense Details"
          icon={<ArrowLeft size={20} color={colors.primary} />}
          variant="outline"
          onPress={() => router.back()}
        />
        <Text style={styles.title}>Expense Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <Text style={styles.emptyText}>Loading...</Text>
        ) : currentExpense ? (
          <>
            <Text style={styles.expenseTitle}>{currentExpense.title || 'Untitled Expense'}</Text>
            <Text style={styles.amount}>
              ${typeof currentExpense.amount === 'number' ? currentExpense.amount.toFixed(2) : '0.00'}
            </Text>
            
            {/* Add more expense details here */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <Text style={styles.description}>{currentExpense.notes || 'No notes'}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Date</Text>
              <Text style={styles.date}>
                {currentExpense.date ? new Date(currentExpense.date).toLocaleDateString() : 'No date'}
              </Text>
            </View>

            {/* Category section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Category</Text>
              <Text style={styles.category}>{currentExpense.category || 'Uncategorized'}</Text>
            </View>
          </>
        ) : (
          <Text style={styles.emptyText}>Expense not found</Text>
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
  expenseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.text,
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
    color: colors.primary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.text,
  },
  description: {
    fontSize: 16,
    color: colors.text,
  },
  date: {
    fontSize: 16,
    color: colors.text,
  },
  category: {
    fontSize: 16,
    color: colors.text,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 24,
  },
});
