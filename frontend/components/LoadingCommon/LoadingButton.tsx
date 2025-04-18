import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  ActivityIndicator, 
  StyleSheet, 
  ViewStyle, 
  TextStyle 
} from 'react-native';

interface LoadingButtonProps {
  /**
   * Text to display on the button
   */
  title: string;
  
  /**
   * Function to call when the button is pressed
   */
  onPress: () => void;
  
  /**
   * Whether the button is in a loading state
   * @default false
   */
  loading?: boolean;
  
  /**
   * Whether the button is disabled
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Color of the loading indicator
   * @default '#fff'
   */
  loadingColor?: string;
  
  /**
   * Additional style for the button
   */
  style?: ViewStyle;
  
  /**
   * Additional style for the button text
   */
  textStyle?: TextStyle;
}

/**
 * A button that shows a loading indicator when in loading state
 */
export default function LoadingButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  loadingColor = '#fff',
  style,
  textStyle,
}: LoadingButtonProps) {
  const isDisabled = disabled || loading;
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        isDisabled && styles.buttonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={loadingColor} size="small" />
      ) : (
        <Text style={[styles.buttonText, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
    minHeight: 44,
  },
  buttonDisabled: {
    backgroundColor: '#999',
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});