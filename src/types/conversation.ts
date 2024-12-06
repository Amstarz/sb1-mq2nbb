export interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  isSystem?: boolean;
}

export interface Conversation {
  id: string;
  receiptId: string;
  messages: Message[];
  lastMessage?: string;
  lastMessageTime?: string;
}