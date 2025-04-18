import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useFriendStore } from '@/store/friendStore';
import { Friend } from '@/types';
import { SvgXml } from 'react-native-svg';

type FriendRequestItemProps = {
  request: Friend;
  onAccept: (requestId: string) => void;
  onReject: (requestId: string) => void;
};

export default function FriendRequestItem({ request, onAccept, onReject }: FriendRequestItemProps) {

  return (
    <View style={styles.container}>
      {request.friend.avatar && <SvgXml style={styles.userAvatar} xml={request.friend.avatar} width="100" height="100" />}
      
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{request.friend.firstName} {request.friend.lastName}</Text>
        <Text style={styles.username}>
                    {request.friend?.username ? `@${request.friend.username}` : ''}
                  </Text>
      </View>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.acceptButton}
          onPress={() => onAccept(request.id)}
        >
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.declineButton}
          onPress={() => onReject(request.id)}
        >
          <Text style={styles.declineButtonText}>Decline</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
  },
  mutualInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 50,
  },
  acceptButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  declineButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  declineButtonText: {
    color: '#000',
    fontWeight: '500',
  },
  username: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});