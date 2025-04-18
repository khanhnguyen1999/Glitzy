import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { getTripMembers } from '../services/tripService';
import { ExpenseCategory } from '../types/expense';

interface ExpenseFormProps {
  tripId: string;
  expense?: any; // Optional existing expense for editing
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'ACCOMMODATION',
  'FOOD',
  'TRANSPORTATION',
  'ACTIVITIES',
  'SHOPPING',
  'OTHER'
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CNY', 'INR'];

const ExpenseForm: React.FC<ExpenseFormProps> = ({ 
  tripId, 
  expense, 
  onSubmit, 
  onCancel 
}) => {
  const [description, setDescription] = useState(expense?.description || '');
  const [amount, setAmount] = useState(expense?.amount?.toString() || '');
  const [currency, setCurrency] = useState(expense?.currency || 'USD');
  const [category, setCategory] = useState<ExpenseCategory>(expense?.category || 'FOOD');
  const [date, setDate] = useState(expense?.date ? new Date(expense.date) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [splits, setSplits] = useState<{
    userId: string;
    username: string;
    splitType: 'EQUAL' | 'PERCENTAGE' | 'FIXED';
    value?: number;
    selected: boolean;
  }[]>([]);

  useEffect(() => {
    fetchTripMembers();
  }, [tripId]);

  const fetchTripMembers = async () => {
    setLoading(true);
    try {
      const membersData = await getTripMembers(tripId);
      setMembers(membersData);
      
      // Initialize splits with all members selected and equal split
      const initialSplits = membersData.map(member => ({
        userId: member.userId,
        username: member.username,
        splitType: 'EQUAL' as const,
        selected: true
      }));
      
      // If editing an expense, use its split data
      if (expense?.paidFor) {
        const expenseSplits = expense.paidFor.map((split: any) => {
          const member = membersData.find(m => m.userId === split.userId);
          return {
            userId: split.userId,
            username: member?.username || split.username,
            splitType: 'EQUAL' as const, // Default, will be calculated based on amount
            value: split.amount,
            selected: true
          };
        });
        setSplits(expenseSplits);
      } else {
        setSplits(initialSplits);
      }
    } catch (error) {
      console.error('Error fetching trip members:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMemberSelection = (userId: string) => {
    setSplits(splits.map(split => 
      split.userId === userId 
        ? { ...split, selected: !split.selected }
        : split
    ));
  };

  const updateSplitType = (type: 'EQUAL' | 'PERCENTAGE' | 'FIXED') => {
    setSplits(splits.map(split => 
      split.selected ? { ...split, splitType: type, value: undefined } : split
    ));
  };

  const updateSplitValue = (userId: string, value: string) => {
    setSplits(splits.map(split => 
      split.userId === userId 
        ? { ...split, value: parseFloat(value) || 0 }
        : split
    ));
  };

  const onDateChange = (selectedDate: Date | undefined) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };  

  const validateForm = () => {
    if (!description.trim()) {
      alert('Please enter a description');
      return false;
    }
    
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return false;
    }
    
    const selectedSplits = splits.filter(split => split.selected);
    if (selectedSplits.length === 0) {
      alert('Please select at least one person to split with');
      return false;
    }
    
    // Validate split values for percentage and fixed
    const splitType = selectedSplits[0].splitType;
    if (splitType === 'PERCENTAGE') {
      const totalPercentage = selectedSplits.reduce((sum, split) => 
        sum + (split.value || 0), 0);
      
      if (Math.abs(totalPercentage - 100) > 0.01) {
        alert('Total percentage must equal 100%');
        return false;
      }
    } else if (splitType === 'FIXED') {
      const totalFixed = selectedSplits.reduce((sum, split) => 
        sum + (split.value || 0), 0);
      
      if (Math.abs(totalFixed - parseFloat(amount)) > 0.01) {
        alert(`Total fixed amounts must equal ${amount} ${currency}`);
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    const selectedSplits = splits.filter(split => split.selected);
    const splitType = selectedSplits[0].splitType;
    
    // Prepare paidFor data based on split type
    let paidFor;
    
    if (splitType === 'EQUAL') {
      // Equal split
      paidFor = selectedSplits.map(split => ({
        userId: split.userId,
        splitType: 'EQUAL'
      }));
    } else {
      // Percentage or Fixed split
      paidFor = selectedSplits.map(split => ({
        userId: split.userId,
        splitType: split.splitType,
        value: split.value
      }));
    }
    
    const expenseData = {
      description,
      amount: parseFloat(amount),
      currency,
      category,
      date: date.toISOString().split('T')[0],
      paidFor
    };
    
    onSubmit(expenseData);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.input}
          value={description}
          onChangeText={setDescription}
          placeholder="What was this expense for?"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Amount</Text>
        <View style={styles.amountContainer}>
          <Picker
            selectedValue={currency}
            style={styles.currencyPicker}
            onValueChange={(itemValue) => setCurrency(itemValue)}
          >
            {CURRENCIES.map(curr => (
              <Picker.Item key={curr} label={curr} value={curr} />
            ))}
          </Picker>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="numeric"
          />
        </View>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Category</Text>
        <Picker
          selectedValue={category}
          style={styles.picker}
          onValueChange={(itemValue) => setCategory(itemValue as ExpenseCategory)}
        >
          {EXPENSE_CATEGORIES.map(cat => (
            <Picker.Item 
              key={cat} 
              label={cat.charAt(0) + cat.slice(1).toLowerCase()} 
              value={cat} 
            />
          ))}
        </Picker>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Date</Text>
        <TouchableOpacity 
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text>{date.toLocaleDateString()}</Text>
          <Ionicons name="calendar-outline" size={20} color="gray" />
        </TouchableOpacity>
        
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => onDateChange(selectedDate)}
          />
        )}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Split With</Text>
        <View style={styles.splitTypeContainer}>
          <TouchableOpacity
            style={[
              styles.splitTypeButton,
              splits.some(s => s.selected && s.splitType === 'EQUAL') && styles.activeSplitType
            ]}
            onPress={() => updateSplitType('EQUAL')}
          >
            <Text style={splits.some(s => s.selected && s.splitType === 'EQUAL') ? styles.activeSplitTypeText : {}}>
              Equal
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.splitTypeButton,
              splits.some(s => s.selected && s.splitType === 'PERCENTAGE') && styles.activeSplitType
            ]}
            onPress={() => updateSplitType('PERCENTAGE')}
          >
            <Text style={splits.some(s => s.selected && s.splitType === 'PERCENTAGE') ? styles.activeSplitTypeText : {}}>
              Percentage
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.splitTypeButton,
              splits.some(s => s.selected && s.splitType === 'FIXED') && styles.activeSplitType
            ]}
            onPress={() => updateSplitType('FIXED')}
          >
            <Text style={splits.some(s => s.selected && s.splitType === 'FIXED') ? styles.activeSplitTypeText : {}}>
              Fixed
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.membersContainer}>
          {splits.map((split, index) => (
            <View key={index} style={styles.memberRow}>
              <TouchableOpacity
                style={styles.memberSelectContainer}
                onPress={() => toggleMemberSelection(split.userId)}
              >
                <View style={[
                  styles.checkbox,
                  split.selected && styles.checkboxSelected
                ]}>
                  {split.selected && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </View>
                <Text style={styles.memberName}>{split.username}</Text>
              </TouchableOpacity>
              
              {split.selected && split.splitType !== 'EQUAL' && (
                <View style={styles.splitValueContainer}>
                  <TextInput
                    style={styles.splitValueInput}
                    value={split.value?.toString() || ''}
                    onChangeText={(value) => updateSplitValue(split.userId, value)}
                    keyboardType="numeric"
                    placeholder={split.splitType === 'PERCENTAGE' ? '0%' : '0.00'}
                  />
                  <Text style={styles.splitValueUnit}>
                    {split.splitType === 'PERCENTAGE' ? '%' : currency}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>
            {expense ? 'Update' : 'Add'} Expense
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyPicker: {
    width: 100,
    height: 50,
  },
  amountInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 10,
  },
  splitTypeContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  splitTypeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  activeSplitType: {
    backgroundColor: '#4285F4',
    borderColor: '#4285F4',
  },
  activeSplitTypeText: {
    color: '#fff',
    fontWeight: '500',
  },
  membersContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
  },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  memberSelectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ccc',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#4285F4',
    borderColor: '#4285F4',
  },
  memberName: {
    fontSize: 16,
  },
  splitValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 100,
  },
  splitValueInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 6,
    fontSize: 14,
  },
  splitValueUnit: {
    marginLeft: 4,
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 16,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  submitButton: {
    flex: 2,
    padding: 12,
    backgroundColor: '#4285F4',
    borderRadius: 4,
    marginLeft: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
});

export default ExpenseForm;
