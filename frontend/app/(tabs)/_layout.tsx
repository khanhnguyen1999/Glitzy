import React, { useEffect } from "react";
import { Tabs, useRouter, Redirect } from "expo-router";
import { colors } from "@/constants/colors";
import { 
  Home, 
  Users, 
  PlusCircle, 
  Activity, 
  User 
} from "lucide-react-native";
import { TouchableOpacity, StyleSheet, View, ActivityIndicator } from "react-native";
import { useActivityStore } from "@/store/activityStore";
import { useAuth } from "../../context/AuthContext";

export default function TabLayout() {
  const { unreadCount, fetchUnreadCount } = useActivityStore();
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  React.useEffect(() => {
    fetchUnreadCount();
  }, []);
  
  // Handle authentication
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.inactive,
        tabBarStyle: styles.tabBar,
        headerStyle: styles.header,
        headerTitleStyle: styles.headerTitle,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
          tabBarLabel: "Home",
        }}
      />
      
      <Tabs.Screen
        name="groups"
        options={{
          title: "Groups",
          tabBarIcon: ({ color }) => <Users size={24} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="add-expense"
        options={{
          title: "Add Expense",
          tabBarIcon: ({ color }) => (
            <View style={styles.addButtonContainer}>
              <PlusCircle size={32} color={colors.primary} />
            </View>
          ),
          tabBarLabel: "",
        }}
      />
      
      <Tabs.Screen
        name="activity"
        options={{
          title: "Activity",
          tabBarIcon: ({ color }) => (
            <View>
              <Activity size={24} color={color} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  {/* No text needed for small badge */}
                </View>
              )}
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 70,
    paddingBottom: 8,
    paddingTop: 8,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  header: {
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerTitle: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 18,
  },
  tabBarLabel: {
    fontSize: 12,
  },
  addButtonContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 55,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.notification,
  },
});