import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface LoadingProps {
  /**
   * Size of the loading indicator
   * @default 'medium'
   */
  size?: 'small' | 'large' | number;
  
  /**
   * Color of the loading indicator
   * @default '#000'
   */
  color?: string;
  
  /**
   * Text to display below the loading indicator
   */
  text?: string;
  
  /**
   * Whether to show the loading indicator in a full screen overlay
   * @default false
   */
  fullScreen?: boolean;
  
  /**
   * Additional style for the container
   */
  style?: ViewStyle;
  
  /**
   * Additional style for the text
   */
  textStyle?: TextStyle;
}

/**
 * A reusable loading component that can be used throughout the app
 */
export default function Loading({
  size = 'small',
  color = '#000',
  text,
  fullScreen = false,
  style,
  textStyle,
}: LoadingProps) {
  const containerStyle = [
    styles.container,
    fullScreen && styles.fullScreen,
    style,
  ];

  return (
    <View style={containerStyle}>
      <View style={styles.loadingWrapper}>
        <ActivityIndicator size={size} color={color} />
        {text && <Text style={[styles.text, textStyle]}>{text}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 999,
  },
  loadingWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});