import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { colors } from "@/constants/colors";
import { Users } from "lucide-react-native";

interface GroupItemProps {
  group: {
    id: string;
    name?: string;
    memberCount?: number;
    totalBalance?: number;
    image?: string;
    // Add other group properties as needed
  };
  onPress?: () => void;
}

export function GroupItem({ group, onPress }: GroupItemProps) {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        {group.image ? (
          <Image source={{ uri: group.image }} style={styles.image} />
        ) : (
          <View style={styles.defaultIcon}>
            <Users size={24} color={colors.white} />
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.name}>{group.name || "Unnamed Group"}</Text>
        <Text style={styles.members}>
          {group.memberCount || 0} {group.memberCount === 1 ? "member" : "members"}
        </Text>
      </View>
      
      {group.totalBalance !== undefined && (
        <View style={styles.balanceContainer}>
          <Text 
            style={[
              styles.balance, 
              group.totalBalance > 0 
                ? styles.positive 
                : group.totalBalance < 0 
                  ? styles.negative 
                  : styles.neutral
            ]}
          >
            {group.totalBalance > 0 ? "+" : ""}
            ${Math.abs(group.totalBalance).toFixed(2)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: colors.textSecondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 16,
  },
  defaultIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  members: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  balanceContainer: {
    alignItems: "flex-end",
  },
  balance: {
    fontSize: 16,
    fontWeight: "600",
  },
  positive: {
    color: colors.success,
  },
  negative: {
    color: colors.danger,
  },
  neutral: {
    color: colors.textSecondary,
  },
});
