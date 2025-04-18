import React, { useEffect, useState, useCallback } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  TextInput, 
  TouchableOpacity,
  RefreshControl
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/constants/colors";
import { FriendItem } from "@/components/FriendItem";
import { useFriendStore } from "@/store/friendStore";
import { useAuthStore } from "@/store/authStore";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Friend, User } from "@/types";
import { SvgXml } from 'react-native-svg';
import { Search, UserPlus, X } from 'lucide-react-native';
import FriendRequestItem from '@/components/FriendRequestItem';
import Loading from '@/components/LoadingCommon/Loading';
import { FriendSearch } from "@/components/FriendSearch";

export default function FriendsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuthStore();
  const { 
    friends, 
    friendRequests,
    fetchFriends, 
    fetchFriendRequests,
    acceptFriendRequest,
    rejectFriendRequest,
    isLoading, 
    searchUsers,
    searchResults,
    clearSearchResults
  } = useFriendStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [currentFriend, setCurrentFriend] = useState<Friend | null>(null);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    loadFriends();
    loadFriendRequests();
  }, []);

  useEffect(() => {
    if (id && friends.length > 0) {
      const friend = friends.find(f => f.id === id);
      if (friend) {
        setCurrentFriend(friend);
      } else {
        setCurrentFriend(null);
      }
    } else {
      setCurrentFriend(null);
    }
  }, [id, friends]);

  const loadFriends = async () => {
    try {
      await fetchFriends();
    } catch (error) {
      console.error("Failed to load friends:", error);
    }
  };

  const loadFriendRequests = async () => {
    try {
      await fetchFriendRequests();
    } catch (error) {
      console.error("Failed to load friend requests:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadFriends(), loadFriendRequests()]);
    setRefreshing(false);
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      clearSearchResults();
    }
  };

  const handleAddSuccess = () => {
    loadFriends();
    loadFriendRequests();
    setShowSearch(false);
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
    } catch (error) {
      console.error("Failed to accept friend request:", error);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await rejectFriendRequest(requestId);
    } catch (error) {
      console.error("Failed to reject friend request:", error);
    }
  };

  if (!user || (isLoading && !refreshing)) {
    return <Loading fullScreen text="Loading friends..." />;
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Friends</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={toggleSearch}
        >
          {showSearch ? (
            <>
              <X size={20} color="#fff" />
              <Text style={styles.addButtonText}>Close</Text>
            </>
          ) : (
            <>
              <UserPlus size={20} color="#fff" />
              <Text style={styles.addButtonText}>Add Friend</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {showSearch ? (
        <View style={styles.searchWrapper}>
          <FriendSearch onAddSuccess={handleAddSuccess} />
        </View>
      ) : (
        <>
          {friendRequests.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Friend Requests</Text>
              <FlatList
                data={friendRequests}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <FriendRequestItem 
                    request={item} 
                    onAccept={() => handleAcceptRequest(item.id)}
                    onReject={() => handleRejectRequest(item.id)}
                  />
                )}
                scrollEnabled={false}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No friend requests</Text>
                  </View>
                }
              />
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Friends</Text>
            <FlatList
              data={friends}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <FriendItem friend={item} />}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>You don't have any friends yet</Text>
                  <Text style={styles.emptySubtext}>Tap "Add Friend" to get started</Text>
                </View>
              }
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 50,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  searchWrapper: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyContainer: {
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
});