import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import { colors } from "@/constants/colors";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  fullWidth = false,
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  const getButtonStyle = () => {
    switch (variant) {
      case "secondary":
        return styles.secondaryButton;
      case "outline":
        return styles.outlineButton;
      case "danger":
        return styles.dangerButton;
      case "primary":
      default:
        return styles.primaryButton;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case "outline":
        return styles.outlineText;
      case "secondary":
      case "primary":
      case "danger":
      default:
        return styles.buttonText;
    }
  };

  const getPaddingStyle = () => {
    switch (size) {
      case "small":
        return styles.smallPadding;
      case "large":
        return styles.largePadding;
      case "medium":
      default:
        return styles.mediumPadding;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        getPaddingStyle(),
        fullWidth && styles.fullWidth,
        disabled && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "outline" ? colors.primary : colors.white}
          size="small"
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text
            style={[
              getTextStyle(),
              disabled && styles.disabledText,
              icon ? styles.textWithIcon : undefined,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.primary,
  },
  dangerButton: {
    backgroundColor: colors.danger,
  },
  buttonText: {
    color: colors.white,
    fontWeight: "600",
    textAlign: "center",
  },
  outlineText: {
    color: colors.primary,
    fontWeight: "600",
    textAlign: "center",
  },
  smallPadding: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  mediumPadding: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  largePadding: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  fullWidth: {
    width: "100%",
  },
  disabledButton: {
    backgroundColor: colors.lightGray,
    borderColor: colors.lightGray,
  },
  disabledText: {
    color: colors.inactive,
  },
  textWithIcon: {
    marginLeft: 8,
  },
});