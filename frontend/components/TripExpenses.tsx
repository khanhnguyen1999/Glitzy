// import React, { useState, useEffect } from 'react';
// import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, StyleSheet, Alert, ActivityIndicator } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useRouter } from 'expo-router';
// import { useUserStore } from '../store/userStore';
// import { getGroupExpenses, getExpenseSummary, createExpense, markExpenseSplitAsPaid } from '../services/expenseService';
// import { Expense, ExpenseSummary, ExpenseCategory } from '../types/expense';
// import ExpenseForm from './ExpenseForm';

// interface TripExpensesProps {
//   tripId: string;
//   isAdmin: boolean;
// }

// const TripExpenses: React.FC<TripExpensesProps> = ({ tripId, isAdmin }) => {
//   const router = useRouter();
//   const { user } = useUserStore();
  
//   const [expenses, setExpenses] = useState<Expense[]>([]);
//   const [summary, setSummary] = useState<ExpenseSummary | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [showAddExpense, setShowAddExpense] = useState(false);
//   const [activeTab, setActiveTab] = useState<'list' | 'summary'>('list');
//   const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

//   useEffect(() => {
//     fetchExpenses();
//   }, [tripId]);

//   const fetchExpenses = async () => {
//     setLoading(true);
//     try {
//       const [expensesData, summaryData] = await Promise.all([
//         getGroupExpenses(tripId),
//         getExpenseSummary(tripId)
//       ]);
//       setExpenses(expensesData);
//       setSummary(summaryData);
//     } catch (error) {
//       console.error('Error fetching expenses:', error);
//       Alert.alert('Error', 'Failed to load expenses');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddExpense = async (expenseData) => {
//     try {
//       await createExpense({
//         ...expenseData,
//         groupId: tripId,
//         paidBy: user.id
//       });
//       setShowAddExpense(false);
//       fetchExpenses();
//       Alert.alert('Success', 'Expense added successfully');
//     } catch (error) {
//       console.error('Error adding expense:', error);
//       Alert.alert('Error', 'Failed to add expense');
//     }
//   };

//   const handleMarkAsPaid = async (expenseId: string, userId: string) => {
//     try {
//       await markExpenseSplitAsPaid(expenseId, userId);
//       fetchExpenses();
//       Alert.alert('Success', 'Marked as paid');
//     } catch (error) {
//       console.error('Error marking as paid:', error);
//       Alert.alert('Error', 'Failed to mark as paid');
//     }
//   };

//   const getCategoryIcon = (category: ExpenseCategory) => {
//     switch (category) {
//       case 'ACCOMMODATION':
//         return <Ionicons name="bed" size={20} color="#9C27B0" />;
//       case 'FOOD':
//         return <Ionicons name="restaurant" size={20} color="#4CAF50" />;
//       case 'TRANSPORTATION':
//         return <Ionicons name="car" size={20} color="#FF9800" />;
//       case 'ACTIVITIES':
//         return <Ionicons name="ticket" size={20} color="#2196F3" />;
//       case 'SHOPPING':
//         return <Ionicons name="cart" size={20} color="#E91E63" />;
//       default:
//         return <Ionicons name="cash" size={20} color="#607D8B" />;
//     }
//   };

//   const renderExpenseItem = ({ item }: { item: Expense }) => {
//     const isPaidBy = item.paidBy === user.id;
//     const userSplit = item.paidFor.find(split => split.userId === user.id);
//     const isOwedToUser = isPaidBy && item.paidFor.some(split => !split.isPaid && split.userId !== user.id);
//     const userOwes = !isPaidBy && userSplit && !userSplit.isPaid;

//     return (
//       <TouchableOpacity 
//         style={styles.expenseItem}
//         onPress={() => setSelectedExpense(item)}
//       >
//         <View style={styles.expenseHeader}>
//           <View style={styles.categoryIcon}>
//             {getCategoryIcon(item.category)}
//           </View>
//           <View style={styles.expenseInfo}>
//             <Text style={styles.expenseDescription}>{item.description}</Text>
//             <Text style={styles.expenseDate}>
//               {new Date(item.date).toLocaleDateString()}
//             </Text>
//           </View>
//           <View style={styles.expenseAmount}>
//             <Text style={styles.amountText}>
//               {item.currency} {item.amount.toFixed(2)}
//             </Text>
//             {isPaidBy ? (
//               <Text style={styles.paidByText}>You paid</Text>
//             ) : (
//               <Text style={styles.paidByText}>
//                 Paid by {item.paidBy.substring(0, 8)}...
//               </Text>
//             )}
//           </View>
//         </View>

//         {(isOwedToUser || userOwes) && (
//           <View style={styles.expenseStatus}>
//             {isOwedToUser && (
//               <Text style={styles.owedText}>
//                 You are owed money for this expense
//               </Text>
//             )}
//             {userOwes && (
//               <View style={styles.owesContainer}>
//                 <Text style={styles.owesText}>
//                   You owe {item.currency} {userSplit.amount.toFixed(2)}
//                 </Text>
//                 <TouchableOpacity
//                   style={styles.markPaidButton}
//                   onPress={() => handleMarkAsPaid(item.id, user.id)}
//                 >
//                   <Text style={styles.markPaidText}>Mark as Paid</Text>
//                 </TouchableOpacity>
//               </View>
//             )}
//           </View>
//         )}
//       </TouchableOpacity>
//     );
//   };

//   const renderSummary = () => {
//     if (!summary) return null;

//     return (
//       <View style={styles.summaryContainer}>
//         <View style={styles.totalContainer}>
//           <Text style={styles.totalLabel}>Total Trip Expenses</Text>
//           <Text style={styles.totalAmount}>
//             {summary.currency} {summary.totalExpenses.toFixed(2)}
//           </Text>
//         </View>

//         <View style={styles.sectionTitle}>
//           <Text style={styles.sectionTitleText}>By Category</Text>
//         </View>
//         <View style={styles.categoriesContainer}>
//           {summary.byCategory.map((category, index) => (
//             <View key={index} style={styles.categoryItem}>
//               <View style={styles.categoryHeader}>
//                 {getCategoryIcon(category.category)}
//                 <Text style={styles.categoryName}>
//                   {category.category.charAt(0) + category.category.slice(1).toLowerCase()}
//                 </Text>
//               </View>
//               <View style={styles.categoryDetails}>
//                 <Text style={styles.categoryAmount}>
//                   {summary.currency} {category.amount.toFixed(2)}
//                 </Text>
//                 <Text style={styles.categoryPercentage}>
//                   {category.percentage.toFixed(1)}%
//                 </Text>
//               </View>
//             </View>
//           ))}
//         </View>

//         <View style={styles.sectionTitle}>
//           <Text style={styles.sectionTitleText}>By Member</Text>
//         </View>
//         <View style={styles.membersContainer}>
//           {summary.byMember.map((member, index) => (
//             <View key={index} style={styles.memberItem}>
//               <View style={styles.memberInfo}>
//                 <View style={styles.memberAvatar}>
//                   <Text style={styles.memberInitial}>
//                     {member.username.charAt(0).toUpperCase()}
//                   </Text>
//                 </View>
//                 <Text style={styles.memberName}>
//                   {member.username} {member.userId === user.id ? '(You)' : ''}
//                 </Text>
//               </View>
//               <View style={styles.memberFinances}>
//                 <View style={styles.memberFinanceItem}>
//                   <Text style={styles.memberFinanceLabel}>Paid</Text>
//                   <Text style={styles.memberFinanceValue}>
//                     {summary.currency} {member.paid.toFixed(2)}
//                   </Text>
//                 </View>
//                 <View style={styles.memberFinanceItem}>
//                   <Text style={styles.memberFinanceLabel}>Owes</Text>
//                   <Text style={styles.memberFinanceValue}>
//                     {summary.currency} {member.owes.toFixed(2)}
//                   </Text>
//                 </View>
//                 <View style={styles.memberFinanceItem}>
//                   <Text style={styles.memberFinanceLabel}>Balance</Text>
//                   <Text style={[
//                     styles.memberFinanceValue,
//                     member.netBalance > 0 ? styles.positiveBalance : 
//                     member.netBalance < 0 ? styles.negativeBalance : {}
//                   ]}>
//                     {member.netBalance > 0 ? '+' : ''}
//                     {summary.currency} {member.netBalance.toFixed(2)}
//                   </Text>
//                 </View>
//               </View>
//             </View>
//           ))}
//         </View>
//       </View>
//     );
//   };

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#0000ff" />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <View style={styles.tabContainer}>
//         <TouchableOpacity
//           style={[styles.tab, activeTab === 'list' && styles.activeTab]}
//           onPress={() => setActiveTab('list')}
//         >
//           <Text style={[styles.tabText, activeTab === 'list' && styles.activeTabText]}>
//             Expenses
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.tab, activeTab === 'summary' && styles.activeTab]}
//           onPress={() => setActiveTab('summary')}
//         >
//           <Text style={[styles.tabText, activeTab === 'summary' && styles.activeTabText]}>
//             Summary
//           </Text>
//         </TouchableOpacity>
//       </View>

//       {activeTab === 'list' ? (
//         <>
//           {expenses.length > 0 ? (
//             <FlatList
//               data={expenses}
//               renderItem={renderExpenseItem}
//               keyExtractor={(item) => item.id}
//               contentContainerStyle={styles.expensesList}
//             />
//           ) : (
//             <View style={styles.emptyContainer}>
//               <Ionicons name="cash-outline" size={48} color="#ccc" />
//               <Text style={styles.emptyText}>No expenses yet</Text>
//               <Text style={styles.emptySubtext}>
//                 Add your first expense to start tracking
//               </Text>
//             </View>
//           )}

//           <TouchableOpacity
//             style={styles.addButton}
//             onPress={() => setShowAddExpense(true)}
//           >
//             <Ionicons name="add" size={24} color="#fff" />
//           </TouchableOpacity>
//         </>
//       ) : (
//         <ScrollView contentContainerStyle={styles.summaryScrollContent}>
//           {renderSummary()}
//         </ScrollView>
//       )}

//       <Modal
//         visible={showAddExpense}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => setShowAddExpense(false)}
//       >
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Add Expense</Text>
//               <TouchableOpacity
//                 onPress={() => setShowAddExpense(false)}
//               >
//                 <Ionicons name="close" size={24} color="#000" />
//               </TouchableOpacity>
//             </View>
//             <ExpenseForm 
//               tripId={tripId}
//               onSubmit={handleAddExpense}
//               onCancel={() => setShowAddExpense(false)}
//             />
//           </View>
//         </View>
//       </Modal>

//       <Modal
//         visible={!!selectedExpense}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => setSelectedExpense(null)}
//       >
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Expense Details</Text>
//               <TouchableOpacity
//                 onPress={() => setSelectedExpense(null)}
//               >
//                 <Ionicons name="close" size={24} color="#000" />
//               </TouchableOpacity>
//             </View>
            
//             {selectedExpense && (
//               <View style={styles.expenseDetails}>
//                 <View style={styles.expenseDetailHeader}>
//                   <View style={styles.expenseDetailCategory}>
//                     {getCategoryIcon(selectedExpense.category)}
//                     <Text style={styles.expenseDetailCategoryText}>
//                       {selectedExpense.category.charAt(0) + selectedExpense.category.slice(1).toLowerCase()}
//                     </Text>
//                   </View>
//                   <Text style={styles.expenseDetailAmount}>
//                     {selectedExpense.currency} {selectedExpense.amount.toFixed(2)}
//                   </Text>
//                 </View>
                
//                 <View style={styles.expenseDetailItem}>
//                   <Text style={styles.expenseDetailLabel}>Description</Text>
//                   <Text style={styles.expenseDetailValue}>{selectedExpense.description}</Text>
//                 </View>
                
//                 <View style={styles.expenseDetailItem}>
//                   <Text style={styles.expenseDetailLabel}>Date</Text>
//                   <Text style={styles.expenseDetailValue}>
//                     {new Date(selectedExpense.date).toLocaleDateString()}
//                   </Text>
//                 </View>
                
//                 <View style={styles.expenseDetailItem}>
//                   <Text style={styles.expenseDetailLabel}>Paid by</Text>
//                   <Text style={styles.expenseDetailValue}>
//                     {selectedExpense.paidBy === user.id ? 'You' : selectedExpense.paidBy}
//                   </Text>
//                 </View>
                
//                 <View style={styles.splitSection}>
//                   <Text style={styles.splitSectionTitle}>Split Details</Text>
//                   {selectedExpense.paidFor.map((split, index) => (
//                     <View key={index} style={styles.splitItem}>
//                       <View style={styles.splitUser}>
//                         <View style={styles.splitUserAvatar}>
//                           <Text style={styles.splitUserInitial}>
//                             {split.username.charAt(0).toUpperCase()}
//                           </Text>
//                         </View>
//                         <Text style={styles.splitUserName}>
//                           {split.username} {split.userId === user.id ? '(You)' : ''}
//                         </Text>
//                       </View>
//                       <View style={styles.splitDetails}>
//                         <Text style={styles.splitAmount}>
//                           {selectedExpense.currency} {split.amount.toFixed(2)}
//                         </Text>
//                         {split.isPaid ? (
//                           <View style={styles.paidBadge}>
//                             <Text style={styles.paidBadgeText}>Paid</Text>
//                           </View>
//                         ) : (
//                           selectedExpense.paidBy === user.id && split.userId !== user.id && (
//                             <TouchableOpacity
//                               style={styles.markPaidButton}
//                               onPress={() => {
//                                 handleMarkAsPaid(selectedExpense.id, split.userId);
//                                 setSelectedExpense(null);
//                               }}
//                             >
//                               <Text style={styles.markPaidText}>Mark as Paid</Text>
//                             </TouchableOpacity>
//                           )
//                         )}
//                       </View>
//                     </View>
//                   ))}
//                 </View>
                
//                 {(selectedExpense.paidBy === user.id || isAdmin) && (
//                   <View style={styles.actionButtons}>
//                     <TouchableOpacity
//                       style={[styles.actionButton, styles.editButton]}
//                       onPress={() => {
//                         setSelectedExpense(null);
//                         router.push(`/expense/edit/${selectedExpense.id}`);
//                       }}
//                     >
//                       <Ionicons name="pencil" size={16} color="#fff" />
//                       <Text style={styles.actionButtonText}>Edit</Text>
//                     </TouchableOpacity>
                    
//                     <TouchableOpacity
//                       style={[styles.actionButton, styles.deleteButton]}
//                       onPress={() => {
//                         Alert.alert(
//                           'Delete Expense',
//                           'Are you sure you want to delete this expense?',
//                           [
//                             { text: 'Cancel', style: 'cancel' },
//                             { 
//                               text: 'Delete', 
//                               style: 'destructive',
//                               onPress: async () => {
//                                 try {
//                                   // await deleteExpense(selectedExpense.id);
//                                   setSelectedExpense(null);
//                                   fetchExpenses();
//                                   Alert.alert('Success', 'Expense deleted successfully');
//                                 } catch (error) {
//                                   console.error('Error deleting expense:', error);
//                                   Alert.alert('Error', 'Failed to delete expense');
//                                 }
//                               }
//                             }
//                           ]
//                         );
//                       }}
//                     >
//                       <Ionicons name="trash" size={16} color="#fff" />
//                       <Text style={styles.actionButtonText}>Delete</Text>
//                     </TouchableOpacity>
//                   </View>
//                 )}
//               </View>
//             )}
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   tabContainer: {
//     flexDirection: 'row',
//     borderBottomWidth: 1,
//     borderBottomColor: '#e0e0e0',
//   },
//   tab: {
//     flex: 1,
//     paddingVertical: 12,
//     alignItems: 'center',
//   },
//   activeTab: {
//     borderBottomWidth: 2,
//     borderBottomColor: '#4285F4',
//   },
//   tabText: {
//     fontSize: 16,
//     color: '#666',
//   },
//   activeTabText: {
//     color: '#4285F4',
//     fontWeight: '500',
//   },
//   expensesList: {
//     padding: 16,
//   },
//   expenseItem: {
//     backgroundColor: '#f9f9f9',
//     borderRadius: 8,
//     padding: 16,
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   expenseHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   categoryIcon: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#f0f0f0',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   expenseInfo: {
//     flex: 1,
//   },
//   expenseDescription: {
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   expenseDate: {
//     fontSize: 14,
//     color: '#666',
//     marginTop: 2,
//   },
//   expenseAmount: {
//     alignItems: 'flex-end',
//   },
//   amountText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   paidByText: {
//     fontSize: 12,
//     color: '#666',
//     marginTop: 2,
//   },
//   expenseStatus: {
//     marginTop: 12,
//     paddingTop: 12,
//     borderTopWidth: 1,
//     borderTopColor: '#e0e0e0',
//   },
//   owedText: {
//     fontSize: 14,
//     color: '#4CAF50',
//     fontWeight: '500',
//   },
//   owesContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   owesText: {
//     fontSize: 14,
//     color: '#F44336',
//     fontWeight: '500',
//   },
//   markPaidButton: {
//     backgroundColor: '#4285F4',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 4,
//   },
//   markPaidText: {
//     color: '#fff',
//     fontSize: 12,
//     fontWeight: '500',
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   emptyText: {
//     fontSize: 18,
//     fontWeight: '500',
//     marginTop: 16,
//   },
//   emptySubtext: {
//     fontSize: 14,
//     color: '#666',
//     marginTop: 8,
//     textAlign: 'center',
//   },
//   addButton: {
//     position: 'absolute',
//     bottom: 20,
//     right: 20,
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     backgroundColor: '#4285F4',
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 3,
//     elevation: 5,
//   },
//   modalContainer: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'flex-end',
//   },
//   modalContent: {
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 16,
//     borderTopRightRadius: 16,
//     maxHeight: '80%',
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e0e0e0',
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   summaryContainer: {
//     padding: 16,
//   },
//   summaryScrollContent: {
//     paddingBottom: 20,
//   },
//   totalContainer: {
//     backgroundColor: '#f0f0f0',
//     padding: 16,
//     borderRadius: 8,
//     marginBottom: 20,
//     alignItems: 'center',
//   },
//   totalLabel: {
//     fontSize: 16,
//     color: '#666',
//     marginBottom: 8,
//   },
//   totalAmount: {
//     fontSize: 24,
//     fontWeight: 'bold',
//   },
//   sectionTitle: {
//     marginBottom: 12,
//   },
//   sectionTitleText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   categoriesContainer: {
//     marginBottom: 24,
//   },
//   categoryItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   categoryHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   categoryName: {
//     marginLeft: 8,
//     fontSize: 16,
//   },
//   categoryDetails: {
//     alignItems: 'flex-end',
//   },
//   categoryAmount: {
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   categoryPercentage: {
//     fontSize: 14,
//     color: '#666',
//   },
//   membersContainer: {
//     marginBottom: 24,
//   },
//   memberItem: {
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   memberInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   memberAvatar: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     backgroundColor: '#4285F4',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 8,
//   },
//   memberInitial: {
//     color: '#fff',
//     fontWeight: 'bold',
//   },
//   memberName: {
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   memberFinances: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   memberFinanceItem: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   memberFinanceLabel: {
//     fontSize: 12,
//     color: '#666',
//     marginBottom: 4,
//   },
//   memberFinanceValue: {
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   positiveBalance: {
//     color: '#4CAF50',
//   },
//   negativeBalance: {
//     color: '#F44336',
//   },
//   expenseDetails: {
//     padding: 16,
//   },
//   expenseDetailHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//     paddingBottom: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e0e0e0',
//   },
//   expenseDetailCategory: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   expenseDetailCategoryText: {
//     marginLeft: 8,
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   expenseDetailAmount: {
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
//   expenseDetailItem: {
//     marginBottom: 12,
//   },
//   expenseDetailLabel: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 4,
//   },
//   expenseDetailValue: {
//     fontSize: 16,
//   },
//   splitSection: {
//     marginTop: 16,
//   },
//   splitSectionTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 12,
//   },
//   splitItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   splitUser: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   splitUserAvatar: {
//     width: 28,
//     height: 28,
//     borderRadius: 14,
//     backgroundColor: '#f0f0f0',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 8,
//   },
//   splitUserInitial: {
//     fontSize: 12,
//     fontWeight: 'bold',
//   },
//   splitUserName: {
//     fontSize: 14,
//   },
//   splitDetails: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   splitAmount: {
//     fontSize: 14,
//     fontWeight: '500',
//     marginRight: 8,
//   },
//   paidBadge: {
//     backgroundColor: '#4CAF50',
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: 4,
//   },
//   paidBadgeText: {
//     color: '#fff',
//     fontSize: 12,
//   },
//   actionButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 24,
//   },
//   actionButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 10,
//     borderRadius: 4,
//     flex: 1,
//     marginHorizontal: 4,
//   },
//   editButton: {
//     backgroundColor: '#4285F4',
//   },
//   deleteButton: {
//     backgroundColor: '#F44336',
//   },
//   actionButtonText: {
//     color: '#fff',
//     marginLeft: 4,
//     fontWeight: '500',
//   },
// });

// export default TripExpenses;
