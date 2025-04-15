import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { colors } from "@/constants/colors";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevation?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  elevation = true,
}) => {
  return (
    <View
      style={[
        styles.card,
        elevation && styles.elevation,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  elevation: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});