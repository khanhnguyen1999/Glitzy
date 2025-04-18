import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/constants/colors";
import { GroupItem } from "@/components/GroupItem";
import { Button } from "@/components/Button";
import { useGroupStore } from "@/store/groupStore";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { useAuthStore } from "@/store/authStore";
import { Group } from "@/types";

export default function GroupsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuthStore();
  const { groups, fetchGroups, isLoading } = useGroupStore();

  useEffect(() => {
    if (user?.id) {
      loadGroups();
    }
  }, [user]);

  const loadGroups = async () => {
    if (user?.id) {
      await fetchGroups(user.id);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGroups();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Groups</Text>
        <Button
          title="Create Group"
          onPress={() => {
            // Navigate to create group screen when implemented
            router.push("/create-trip");
          }}
          variant="primary"
          size="small"
          icon={<Plus size={16} color={colors.white} />}
        />
      </View>

      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading groups...</Text>
        </View>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <GroupItem
              group={item}
              onPress={() => {
                // Navigate to group details when implemented
                console.log(`Navigate to group ${item.id}`);
              }}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                You don't have any groups yet.
              </Text>
              <Text style={styles.emptySubtext}>
                Create a group to start splitting expenses with friends.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyContainer: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
