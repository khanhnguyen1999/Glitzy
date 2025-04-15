import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/constants/colors";
import { BalanceSummary } from "@/components/BalanceSummary";
import { ExpenseItem } from "@/components/ExpenseItem";
import { FriendItem } from "@/components/FriendItem";
import { GroupItem } from "@/components/GroupItem";
import { Button } from "@/components/Button";
import { useExpenseStore } from "@/store/expenseStore";
import { useFriendStore } from "@/store/friendStore";
import { useGroupStore } from "@/store/groupStore";
import { useRouter } from "expo-router";
import { Plus, ArrowRight } from "lucide-react-native";
import { useAuthStore } from "@/store/authStore";

export default function HomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuthStore();
  const { expenses, fetchExpenses, isLoading: expensesLoading } = useExpenseStore();
  const { friends, fetchFriends, isLoading: friendsLoading } = useFriendStore();
  const { groups, fetchGroups, isLoading: groupsLoading } = useGroupStore();
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    await Promise.all([
      fetchExpenses(user.id),
      fetchFriends(),
      user?.id && fetchGroups(user?.id),
    ]);
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };
  
  // Calculate balances
  const youOwe = 150.75; // In a real app, calculate this from expenses
  const youAreOwed = 275.25; // In a real app, calculate this from expenses
  const totalBalance = youAreOwed - youOwe;
  
  const recentGroups = groups.slice(0, 2);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, {user.firstName}</Text>
          <Text style={styles.subGreeting}>Here's your financial summary</Text>
        </View>
        
        <View style={styles.balanceContainer}>
          <BalanceSummary
            totalBalance={totalBalance}
            youOwe={youOwe}
            youAreOwed={youAreOwed}
          />
        </View>
        
        <View style={styles.actionsContainer}>
          <Button
            title="Add an expense"
            onPress={() => router.push("/add-expense")}
            icon={<Plus size={18} color={colors.white} />}
            style={styles.actionButton}
          />
          <Button
            title="Settle up"
            onPress={() => router.push("/settle")}
            variant="outline"
            style={styles.actionButton}
          />
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Expenses</Text>
            <Button
              title="See all"
              onPress={() => router.push("/expenses")}
              variant="outline"
              size="small"
              icon={<ArrowRight size={14} color={colors.primary} />}
            />
          </View>
          
          {expenses.length > 0 ? (
            expenses.map((expense) => (
              <ExpenseItem
                key={expense.id}
                expense={expense}
                onPress={() => router.push(`/expenses/${expense.id}`)}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No recent expenses</Text>
          )}
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Groups</Text>
            <Button
              title="See all"
              onPress={() => router.push("/groups")}
              variant="outline"
              size="small"
              icon={<ArrowRight size={14} color={colors.primary} />}
            />
          </View>
          
          {recentGroups.length > 0 ? (
            recentGroups.map((group) => (
              <GroupItem
                key={group.id}
                group={group}
                onPress={() => router.push(`/groups/${group.id}`)}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No groups yet</Text>
          )}
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Friends</Text>
            <Button
              title="See all"
              onPress={() => router.push("/friends")}
              variant="outline"
              size="small"
              icon={<ArrowRight size={14} color={colors.primary} />}
            />
          </View>
          
          {friends.length > 0 ? (
            friends.map((friend) => (
              <FriendItem
                key={friend.id}
                friend={friend}
                onPress={() => router.push(`/friends/${friend.id}`)}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No friends yet</Text>
          )}
        </View>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  balanceContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  actionsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  emptyText: {
    textAlign: "center",
    color: colors.textSecondary,
    paddingVertical: 20,
  },
});