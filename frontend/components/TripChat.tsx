import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { chatService } from '../services/chatService';
import { Message } from '../types/chat';
import { io, Socket } from 'socket.io-client';
import { API_URL } from '../constants/api';

interface TripChatProps {
  tripId: string;
}

const TripChat: React.FC<TripChatProps> = ({ tripId }) => {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Load initial messages
    fetchMessages();

    // Connect to socket for real-time updates
    connectToSocket();

    return () => {
      // Disconnect socket when component unmounts
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [tripId]);

  const connectToSocket = () => {
    socketRef.current = io(`${API_URL}`, {
      query: {
        token: user?.token,
        tripId
      }
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected');
    });

    socketRef.current.on('message', (newMessage: Message) => {
      setMessages(prevMessages => [...prevMessages, newMessage]);
      // Scroll to bottom on new message
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    socketRef.current.on('error', (error) => {
      console.error('Socket error:', error);
    });
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const messagesData = await chatService.getGroupChatHistory(tripId);
      // Convert the message format to match the expected Message type
      const formattedMessages: Message[] = messagesData.map(msg => ({
        id: msg.id,
        tripId: msg.groupId, // Map groupId to tripId
        senderId: msg.senderId,
        senderName: '', // This might need to be fetched separately
        content: msg.text, // Map text to content
        createdAt: msg.timestamp, // Map timestamp to createdAt
        status: 'SENT'
      }));
      setMessages(formattedMessages);
      // Scroll to bottom after loading messages
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    setSending(true);
    try {
      const trimmedMessage = messageText.trim();
      setMessageText('');

      // Optimistically add message to UI
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        tripId,
        senderId: user?.id as string,
        senderName: user?.username as string,
        content: trimmedMessage,
        createdAt: new Date().toISOString(),
        status: 'SENDING'
      };
      
      setMessages(prevMessages => [...prevMessages, tempMessage]);
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // Send message to server
      await chatService.sendMessage(tripId, trimmedMessage);
      
      // No need to update messages here as the socket will handle it
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Update the temp message to show error status
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id.startsWith('temp-') ? { ...msg, status: 'ERROR' } : msg
        )
      );
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const shouldShowDate = (index: number) => {
    if (index === 0) return true;
    
    const currentDate = new Date(messages[index].createdAt).toDateString();
    const prevDate = new Date(messages[index - 1].createdAt).toDateString();
    
    return currentDate !== prevDate;
  };

  const renderMessage = ({ item, index }: { item: Message, index: number }) => {
    const isCurrentUser = item.senderId === user?.id;
    
    return (
      <>
        {shouldShowDate(index) && (
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
          </View>
        )}
        <View style={[
          styles.messageContainer,
          isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
        ]}>
          {!isCurrentUser && (
            <Text style={styles.senderName}>{item.senderName}</Text>
          )}
          <View style={styles.messageContent}>
            <Text style={styles.messageText}>{item.content}</Text>
            <View style={styles.messageFooter}>
              <Text style={styles.messageTime}>{formatTime(item.createdAt)}</Text>
              {isCurrentUser && item.status === 'SENDING' && (
                <Ionicons name="time-outline" size={12} color="#999" style={styles.messageStatus} />
              )}
              {isCurrentUser && item.status === 'SENT' && (
                <Ionicons name="checkmark" size={12} color="#999" style={styles.messageStatus} />
              )}
              {isCurrentUser && item.status === 'ERROR' && (
                <Ionicons name="alert-circle" size={12} color="#f44336" style={styles.messageStatus} />
              )}
            </View>
          </View>
        </View>
      </>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />
      )}
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Type a message..."
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!messageText.trim() || sending) && styles.disabledSendButton
          ]}
          onPress={handleSendMessage}
          disabled={!messageText.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  dateContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  messageContainer: {
    maxWidth: '80%',
    marginBottom: 12,
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  currentUserMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
    borderBottomRightRadius: 4,
  },
  otherUserMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  messageContent: {
    
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 10,
    color: '#999',
  },
  messageStatus: {
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  disabledSendButton: {
    backgroundColor: '#B0BEC5',
  },
});

export default TripChat;
