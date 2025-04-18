import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  username: string;
  name?: string;
  profilePicture?: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
}

interface FriendSelectorProps {
  friends: Friend[];
  selectedFriends: string[];
  onSelectFriend: (friendId: string) => void;
}

const FriendSelector: React.FC<FriendSelectorProps> = ({ 
  friends, 
  selectedFriends, 
  onSelectFriend 
}) => {
  if (!friends || friends.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="people" size={24} color="#999" />
        <Text style={styles.emptyText}>No friends available</Text>
        <Text style={styles.emptySubtext}>Add friends to invite them to your trip</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={friends}
      keyExtractor={(item) => item.id}
      horizontal={false}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[
            styles.friendItem,
            selectedFriends.includes(item.id) && styles.selectedFriendItem
          ]}
          onPress={() => onSelectFriend(item.id)}
        >
          <View style={styles.friendInfo}>
            <Image 
              source={{ uri: item.profilePicture || 'https://via.placeholder.com/50' }} 
              style={styles.avatar} 
            />
            <View style={styles.nameContainer}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.username}>@{item.username}</Text>
            </View>
          </View>
          
          <View style={styles.checkboxContainer}>
            {selectedFriends.includes(item.id) ? (
              <View style={styles.checkedBox}>
                <Ionicons name="checkmark" size={18} color="#fff" />
              </View>
            ) : (
              <View style={styles.uncheckedBox} />
            )}
          </View>
        </TouchableOpacity>
      )}
      style={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    maxHeight: 250,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedFriendItem: {
    backgroundColor: 'rgba(66, 133, 244, 0.1)',
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  nameContainer: {
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
  },
  username: {
    fontSize: 14,
    color: '#666',
  },
  checkboxContainer: {
    marginLeft: 'auto',
  },
  uncheckedBox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  checkedBox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default FriendSelector;
