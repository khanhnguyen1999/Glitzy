import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';

interface BalanceSummaryProps {
  totalOwed?: number;
  totalOwing?: number;
}

export const BalanceSummary: React.FC<BalanceSummaryProps> = ({ 
  totalOwed = 0, 
  totalOwing = 0 
}) => {
  const netBalance = totalOwed - totalOwing;
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Balance Summary</Text>
      
      <View style={styles.balanceRow}>
        <View style={styles.balanceItem}>
          <Text style={styles.balanceLabel}>You are owed</Text>
          <Text style={[styles.balanceAmount, styles.positive]}>
            ${totalOwed.toFixed(2)}
          </Text>
        </View>
        
        <View style={styles.balanceItem}>
          <Text style={styles.balanceLabel}>You owe</Text>
          <Text style={[styles.balanceAmount, styles.negative]}>
            ${totalOwing.toFixed(2)}
          </Text>
        </View>
      </View>
      
      <View style={styles.netBalanceContainer}>
        <Text style={styles.netBalanceLabel}>Net Balance</Text>
        <Text 
          style={[
            styles.netBalanceAmount, 
            netBalance >= 0 ? styles.positive : styles.negative
          ]}
        >
          ${Math.abs(netBalance).toFixed(2)}
          {netBalance >= 0 ? ' in your favor' : ' you owe'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: colors.text,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  balanceItem: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: '600',
  },
  positive: {
    color: colors.success || '#28a745',
  },
  negative: {
    color: colors.danger || '#dc3545',
  },
  netBalanceContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border || '#e0e0e0',
    paddingTop: 12,
    marginTop: 4,
  },
  netBalanceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  netBalanceAmount: {
    fontSize: 20,
    fontWeight: '700',
  },
});
