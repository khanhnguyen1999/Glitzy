import React from 'react';
import { View, StyleSheet, Modal, ActivityIndicator, Text } from 'react-native';

interface LoadingOverlayProps {
  /**
   * Whether the overlay is visible
   */
  visible: boolean;
  
  /**
   * Text to display below the loading indicator
   */
  text?: string;
  
  /**
   * Color of the loading indicator
   * @default '#000'
   */
  color?: string;
  
  /**
   * Size of the loading indicator
   * @default 'large'
   */
  size?: 'small' | 'large' | number;
}

/**
 * A modal overlay with a loading indicator
 */
export default function LoadingOverlay({
  visible,
  text,
  color = '#000',
  size = 'large',
}: LoadingOverlayProps) {
  if (!visible) return null;
  
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
    >
      <View style={styles.container}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size={size} color={color} />
          {text && <Text style={styles.text}>{text}</Text>}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
});