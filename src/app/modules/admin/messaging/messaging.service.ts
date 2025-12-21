import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Conversation, Message, User, MessageCreateDto, ConversationCreateDto } from './messaging.types';

@Injectable({
  providedIn: 'root'
})
export class MessagingService {
  private apiUrl = 'http://localhost:5288/api/Messaging';

  constructor(private http: HttpClient) { }

  // Récupérer toutes les conversations de l'utilisateur
  getConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.apiUrl}/conversations`);
  }

  // Récupérer une conversation par ID
  getConversation(id: number): Observable<Conversation> {
    return this.http.get<Conversation>(`${this.apiUrl}/conversations/${id}`);
  }

  // Créer ou récupérer une conversation avec un utilisateur
  getOrCreateConversation(otherUserId: number): Observable<Conversation> {
    const dto: ConversationCreateDto = { otherUserId };
    return this.http.post<Conversation>(`${this.apiUrl}/conversations`, dto);
  }

  // Récupérer les messages d'une conversation
  getMessages(conversationId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/conversations/${conversationId}/messages`);
  }

  // Envoyer un message
  sendMessage(dto: MessageCreateDto): Observable<Message> {
    return this.http.post<Message>(`${this.apiUrl}/messages`, dto);
  }

  // Marquer un message comme lu
  markAsRead(messageId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/messages/${messageId}/read`, {});
  }

  // Récupérer le nombre de messages non lus
  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/unread-count`);
  }

  // Récupérer les utilisateurs disponibles pour la messagerie
  getAvailableUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/available-users`);
  }
}

