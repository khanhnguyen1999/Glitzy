import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { colors } from "@/constants/colors";
import { SvgXml } from 'react-native-svg';

interface AvatarProps {
  uri?: string;
  name?: string;
  size?: "small" | "medium" | "large";
  showBorder?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  uri,
  name,
  size = "medium",
  showBorder = false,
}) => {
  const getSize = () => {
    switch (size) {
      case "small":
        return 36;
      case "large":
        return 64;
      case "medium":
      default:
        return 48;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case "small":
        return 14;
      case "large":
        return 24;
      case "medium":
      default:
        return 18;
    }
  };

  const getInitials = () => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const avatarSize = getSize();
  const fontSize = getFontSize();

  return (
    <View
      style={[
        styles.container,
        {
          width: avatarSize,
          height: avatarSize,
          borderRadius: avatarSize / 2,
          borderWidth: showBorder ? 2 : 0,
        },
      ]}
    >
      {uri ? (
        <SvgXml
          xml={uri}
          width={avatarSize}
          height={avatarSize}
        />
      ) : (
        <Text style={[styles.initials, { fontSize }]}>{getInitials()}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.lightGray,
    borderColor: colors.white,
    overflow: "hidden",
  },
  image: {
    resizeMode: "cover",
  },
  initials: {
    color: colors.primary,
    fontWeight: "bold",
  },
});