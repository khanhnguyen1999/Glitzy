import React from "react";
import { Tabs } from "expo-router";
import { colors } from "@/constants/colors";
import { Home, Users, Plus, DollarSign, User } from "lucide-react-native";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";

export default function TabLayout() {
  const router = useRouter();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: colors.separator,
          height: 60,
          paddingBottom: 8,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: "Friends",
          tabBarIcon: ({ color }) => <Users size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="new-trip"
        options={{
          title: "New Trip",
          tabBarIcon: ({ color }) => (
            <Plus size={24} color="white" />
          ),
          tabBarButton: (props) => (
            <NewTripButton {...props} />
          ),
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: "Expenses",
          tabBarIcon: ({ color }) => <DollarSign size={24} color={color} />,
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

// Custom button for the center tab
function NewTripButton(props: any) {
  const router = useRouter();
  
  return (
    <TouchableOpacity
      {...props}
      style={styles.newTripButton}
      onPress={() => {
        router.push('/create-trip');
      }}
    >
      <View style={styles.newTripButtonInner}>
        <Plus size={24} color="white" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  newTripButton: {
    flex: 1,
    alignItems: "center",
  },
  newTripButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
});