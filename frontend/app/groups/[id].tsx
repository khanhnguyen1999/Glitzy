import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/constants/colors";
import { useLocalSearchParams, Stack } from "expo-router";
import { useGroupStore } from "@/store/groupStore";
import { Group } from "@/types";
import { useExpenseStore } from "@/store/expenseStore";
import { Expense } from "@/types";

export default function GroupDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState<Group | null>(null);
  const [groupExpenses, setGroupExpenses] = useState<Expense[]>([]);
  const { fetchGroupById } = useGroupStore();
  const { fetchExpensesByGroupId } = useExpenseStore();

  useEffect(() => {
    if (id) {
      loadGroup();
    }
  }, [id]);

  const loadGroup = async () => {
    try {
      setLoading(true);
      const groupData = await fetchGroupById(id);
      setGroup(groupData);
      
      // Load expenses for this group
      const expenses = await fetchExpensesByGroupId(id);
      setGroupExpenses(expenses);
    } catch (error) {
      console.error("Failed to load group:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: group?.name || "Group Details",
        }} 
      />
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : group ? (
          <ScrollView style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.groupName}>{group.name}</Text>
              {group.description && (
                <Text style={styles.description}>{group.description}</Text>
              )}
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Members</Text>
              {group.members?.length > 0 ? (
                group.members.map((member) => (
                  <View key={member.id} style={styles.memberItem}>
                    <Text style={styles.memberName}>{member.name}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No members in this group</Text>
              )}
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Group Expenses</Text>
              {groupExpenses.length > 0 ? (
                groupExpenses.map((expense: Expense) => (
                  <View key={expense.id} style={styles.expenseItem}>
                    <Text style={styles.expenseTitle}>{expense.title}</Text>
                    <Text style={styles.expenseAmount}>${expense.amount.toFixed(2)}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No expenses in this group</Text>
              )}
            </View>
          </ScrollView>
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Group not found</Text>
          </View>
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  groupName: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  section: {
    marginTop: 16,
    padding: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 12,
  },
  memberItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  memberName: {
    fontSize: 16,
    color: colors.text,
  },
  expenseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  expenseTitle: {
    fontSize: 16,
    color: colors.text,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    paddingVertical: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: colors.danger,
  },
});
