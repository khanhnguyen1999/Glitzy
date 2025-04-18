import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '@/constants/colors';

interface ExpenseProps {
  expense: {
    id: string;
    title?: string;
    amount?: number;
    date?: string;
    paidBy?: string;
    // Add other properties as needed
  };
  onPress?: () => void;
}

export const ExpenseItem: React.FC<ExpenseProps> = ({ expense, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Text style={styles.title}>{expense.title || 'Unnamed Expense'}</Text>
        <Text style={styles.date}>{expense.date || 'No date'}</Text>
        <Text style={styles.paidBy}>
          Paid by: {expense.paidBy || 'Unknown'}
        </Text>
      </View>
      <View style={styles.amountContainer}>
        <Text style={styles.amount}>
          ${expense.amount?.toFixed(2) || '0.00'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.border,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  paidBy: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  amountContainer: {
    justifyContent: 'center',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
});
