import { create } from "zustand";
import { Message } from "@/types";
import { chatService } from "@/services/chatService";

interface ChatMessagesState {
  chatMessages: Message[];
  isLoading: boolean;
  error: string | null;
  fetchChatMessages: (userId: string) => Promise<void>;
}

export const useChatMessagesStore = create<ChatMessagesState>((set, get) => ({
  chatMessages: [],
  isLoading: false,
  error: null,
  
  fetchChatMessages: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await chatService.getPrivateChatHistory(userId);
      set({ chatMessages: response, isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Failed to fetch friends" 
      });
    }
  },

}));