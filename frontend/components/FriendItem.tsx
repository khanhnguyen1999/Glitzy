import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MoreVertical } from 'lucide-react-native';
import { SvgXml } from 'react-native-svg';
import { Friend } from '@/types';

interface FriendItemProps {
  friend: Friend;
  onPress?: () => void;
}

export const FriendItem: React.FC<FriendItemProps> = ({
  friend,
  onPress,
}) => {
  
  return (
    <View style={styles.container}>
      {friend.friend.avatar && <SvgXml style={styles.userAvatar} xml={friend.friend.avatar} width="100" height="100" />}
      
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{friend.friend.firstName} {friend.friend.lastName}</Text>
        {/* <Text style={styles.tripInfo}>
          {friend.trips} {friend.trips === 1 ? 'trip' : 'trips'} together
        </Text> */}
        <Text style={styles.username}>
          {friend.friend?.username ? `@${friend.friend.username}` : ''}
        </Text>
      </View>
      
      <TouchableOpacity style={styles.moreButton}>
        <MoreVertical size={20} color="#666" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
  },
  tripInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  moreButton: {
    padding: 8,
  },
  username: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});