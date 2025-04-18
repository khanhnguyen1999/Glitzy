import React, { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/constants/colors";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "expo-router";
import { 
  User, 
  Settings, 
  CreditCard, 
  FileText, 
  Bell, 
  HelpCircle, 
  LogOut,
  ChevronRight
} from "lucide-react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isLoadingUser, logout } = useAuthStore();
  
  const handleLogout = async () => {
    await logout();
  };
  
  const menuItems = [
    {
      icon: <User size={20} color={colors.primary} />,
      title: "Account Settings",
      onPress: () => router.push({
        pathname: "/settings/account" as any
      }),
    },
    {
      icon: <CreditCard size={20} color={colors.primary} />,
      title: "Payment Methods",
      onPress: () => router.push({
        pathname: "/settings/payment" as any
      }),
    },
    {
      icon: <FileText size={20} color={colors.primary} />,
      title: "Expense Reports",
      onPress: () => router.push({
        pathname: "/reports" as any
      }),
    },
    {
      icon: <Bell size={20} color={colors.primary} />,
      title: "Notifications",
      onPress: () => router.push({
        pathname: "/settings/notifications" as any
      }),
    },
    {
      icon: <HelpCircle size={20} color={colors.primary} />,
      title: "Help & Support",
      onPress: () => router.push({
        pathname: "/help" as any
      }),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.profileInfo}>
            {user?.avatar && <Avatar
              uri={user.avatar}
              name={user.username}
              size="large"
              showBorder
            />}
            <View style={styles.nameContainer}>
              <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
              <Text style={styles.email}>{user?.username}</Text>
            </View>
          </View>
          
          <Button
            title="Edit Profile"
            onPress={() => router.push({
              pathname: "/settings/profile" as any
            })}
            variant="outline"
            size="small"
          />
        </View>
        
        <Card style={styles.balanceCard}>
          <Text style={styles.balanceTitle}>Account Balance</Text>
          <Text style={styles.balanceAmount}>$124.50</Text>
          <Button
            title="Add Funds"
            onPress={() => router.push({
              pathname: "/add-funds" as any
            })}
            style={styles.addFundsButton}
          />
        </Card>
        
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                {item.icon}
                <Text style={styles.menuItemTitle}>{item.title}</Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
        
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="outline"
          icon={<LogOut size={18} color={colors.danger} />}
          style={styles.logoutButton}
          textStyle={styles.logoutButtonText}
          loading={isLoadingUser}
        />
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  nameContainer: {
    marginLeft: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  balanceCard: {
    margin: 20,
    alignItems: "center",
  },
  balanceTitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 16,
  },
  addFundsButton: {
    width: "100%",
  },
  menuContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: colors.background,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemTitle: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  logoutButton: {
    marginHorizontal: 20,
    marginBottom: 40,
    borderColor: colors.danger,
  },
  logoutButtonText: {
    color: colors.danger,
  },
});