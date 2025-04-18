import React, { useState, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  FlatList, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Keyboard,
  Alert
} from 'react-native';
import { useFriendStore } from '@/store/friendStore';
import { colors } from '@/constants/colors';
import { UserPlus, Search, X } from 'lucide-react-native';
import { SvgXml } from 'react-native-svg';
import { Friend } from '@/types';

interface FriendSearchProps {
  onSelectUser?: (user: Friend) => void;
  onAddSuccess?: () => void;
}

export const FriendSearch = ({ onSelectUser, onAddSuccess }: FriendSearchProps) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { searchNonFriends, searchResults, isLoading, addFriend, error, clearError } = useFriendStore();
  const [addingFriendId, setAddingFriendId] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      if (query.trim().length >= 2) {
        setDebouncedQuery(query);
        setIsSearching(true);
      } else if (query.trim() === '') {
        setDebouncedQuery('');
        setShowResults(false);
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  // Perform search when debounced query changes
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.trim().length >= 2) {
        await searchNonFriends(debouncedQuery);
        setShowResults(true);
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  const handleClearSearch = () => {
    setQuery('');
    setShowResults(false);
    Keyboard.dismiss();
  };

  const handleAddFriend = async (user: Friend) => {
    try {
      setAddingFriendId(user.id);
      // Send the friend request using the friend's ID
      await addFriend(user.friend.id);
      
      // Show success message
      Alert.alert(
        'Friend Request Sent',
        `A friend request has been sent to ${user.friend.firstName || user.friend.username}`,
        [{ text: 'OK' }]
      );
      
      if (onSelectUser) {
        onSelectUser(user);
      }
      
      if (onAddSuccess) {
        onAddSuccess();
      }
      
      // Clear search after successful friend request
      setQuery('');
      setShowResults(false);
    } catch (error) {
      console.error('Failed to add friend:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to send friend request',
        [{ text: 'OK' }]
      );
    } finally {
      setAddingFriendId(null);
    }
  };

  console.log('searchResults ',searchResults)

  const renderItem = ({ item }: any) => {
    console.log('itesms ',item)
    return (
      <View style={styles.userItem}>
        <View style={styles.userAvatar}>
          {item.friend.avatar ? (
            <SvgXml xml={item.friend.avatar} width={40} height={40} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>
                {item.friend?.firstName?.charAt(0) || item.friend.username?.charAt(0) || '?'}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {item.friend?.firstName 
              ? `${item.friend.firstName} ${item.friend.lastName || ''}`
              : item.friend.username || 'Unknown User'}
          </Text>
          <Text style={styles.username}>
            {item.friend?.username ? `@${item.friend.username}` : ''}
          </Text>
        </View>
        <TouchableOpacity 
          style={[
            styles.addButton,
            addingFriendId === item.id && styles.addingButton
          ]}
          onPress={() => handleAddFriend(item)}
          disabled={addingFriendId === item.id}
        >
          {addingFriendId === item.id ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <UserPlus size={16} color="#fff" />
              <Text style={styles.addButtonText}>Add</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Search size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or email"
          placeholderTextColor="#999"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
            <X size={18} color="#999" />
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={clearError}>
            <Text style={styles.dismissText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {isSearching && (
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      )}
      
      {searchResults.length > 0 && (
        <FlatList
          data={searchResults}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={styles.resultsList}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      {showResults && !isSearching && searchResults.length === 0 && debouncedQuery.length > 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No users found matching "{debouncedQuery}"</Text>
          <Text style={styles.emptySubtext}>Try a different search term or check the spelling</Text>
        </View>
      )}
      
      {query.length > 0 && query.length < 2 && (
        <Text style={styles.hintText}>Type at least 2 characters to search</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 50,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 50,
    borderWidth: 1,
    borderColor: '#eee',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  clearButton: {
    padding: 6,
  },
  resultsList: {
    flex: 1,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  username: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 50,
    gap: 4,
  },
  addingButton: {
    backgroundColor: colors.highlight,
    width: 70,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  loader: {
    marginTop: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  hintText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#999',
    fontStyle: 'italic',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#b91c1c',
    flex: 1,
  },
  dismissText: {
    color: '#b91c1c',
    fontWeight: '600',
    marginLeft: 8,
  },
});
