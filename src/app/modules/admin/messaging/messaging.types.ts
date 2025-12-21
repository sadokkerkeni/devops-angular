export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  senderEmail: string;
  content: string;
  sentAt: string;
  isRead: boolean;
  readAt?: string;
}

export interface Conversation {
  id: number;
  user1Id: number;
  user1Name: string;
  user1Email: string;
  user2Id: number;
  user2Name: string;
  user2Email: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?: Message;
  unreadCount: number;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  matricule: string;
}

export interface MessageCreateDto {
  conversationId: number;
  content: string;
}

export interface ConversationCreateDto {
  otherUserId: number;
}

