import { create } from 'zustand';
import { Conversation, Message } from '../types/conversation';
import { db } from '../db/indexedDB';
import toast from 'react-hot-toast';

interface ConversationStore {
  conversations: Conversation[];
  isLoading: boolean;
  addMessage: (receiptId: string, content: string, sender: string) => Promise<void>;
  getConversation: (receiptId: string) => Conversation | undefined;
  loadConversations: () => Promise<void>;
}

export const useConversationStore = create<ConversationStore>((set, get) => ({
  conversations: [],
  isLoading: true,

  addMessage: async (receiptId: string, content: string, sender: string) => {
    const { conversations } = get();
    const newMessage: Message = {
      id: crypto.randomUUID(),
      content,
      sender,
      timestamp: new Date().toISOString(),
    };

    let conversation = conversations.find((c) => c.receiptId === receiptId);
    let updatedConversations: Conversation[];

    if (conversation) {
      conversation = {
        ...conversation,
        messages: [...conversation.messages, newMessage],
        lastMessage: content,
        lastMessageTime: newMessage.timestamp,
      };
      updatedConversations = conversations.map((c) =>
        c.receiptId === receiptId ? conversation! : c
      );
    } else {
      conversation = {
        id: crypto.randomUUID(),
        receiptId,
        messages: [newMessage],
        lastMessage: content,
        lastMessageTime: newMessage.timestamp,
      };
      updatedConversations = [...conversations, conversation];
    }

    try {
      // Save to IndexedDB first
      await db.saveConversations(updatedConversations);
      // Only update state after successful save
      set({ conversations: updatedConversations });
    } catch (error) {
      console.error('Failed to save conversation:', error);
      throw new Error('Failed to save message');
    }
  },

  getConversation: (receiptId: string) => {
    const { conversations } = get();
    return conversations.find((c) => c.receiptId === receiptId);
  },

  loadConversations: async () => {
    try {
      const conversations = await db.loadConversations();
      set({ conversations, isLoading: false });
    } catch (error) {
      console.error('Failed to load conversations:', error);
      toast.error('Failed to load chat history');
      set({ isLoading: false });
    }
  },
}));