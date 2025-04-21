import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ExpenseSummary as ExpenseSummaryType } from '@/types/trip';

type ExpenseSummaryProps = {
  summary: ExpenseSummaryType;
  onSettleUp?: () => void;
};

export default function ExpenseSummary({ summary, onSettleUp }: ExpenseSummaryProps) {
  const { totalAmount, yourShare, currency } = summary;
  
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.label}>Total Trip Expenses</Text>
        <Text style={styles.totalAmount}>{currency}{totalAmount.toLocaleString()}</Text>
        
        <View style={styles.shareContainer}>
          <Text style={styles.shareLabel}>Your Share</Text>
          <Text style={styles.shareAmount}>{currency}{yourShare.toLocaleString()}</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.settleButton}
        onPress={onSettleUp}
      >
        <Text style={styles.settleButtonText}>Settle Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    display: 'flex',
  },
  content: {
    flex: 1,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 4,
  },
  totalAmount: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  shareContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  shareLabel: {
    color: '#fff',
    fontSize: 14,
  },
  shareAmount: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  settleButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 50,
  },
  settleButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 14,
  },
});