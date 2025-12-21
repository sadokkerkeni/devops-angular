import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SearchHistoryService } from '../search/search-history.service';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

export interface ChatbotResponse {
  message: string;
  suggestions?: string[];
  relatedSearches?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private readonly API_URL = 'http://localhost:5288/api/Chatbot';
  private messages: ChatMessage[] = [];

  constructor(
    private http: HttpClient,
    private searchHistoryService: SearchHistoryService
  ) {
    this.loadMessages();
  }

  /**
   * Send a message to the chatbot
   */
  sendMessage(userMessage: string): Observable<ChatbotResponse> {
    // Add user message
    const userMsg: ChatMessage = {
      id: this.generateId(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    this.addMessage(userMsg);

    // Get search history context
    const searchHistory = this.searchHistoryService.getHistoryAsContext(20);
    const conversationHistory = this.getConversationContext();

    // Prepare request
    const request = {
      message: userMessage,
      searchHistory: searchHistory,
      conversationHistory: conversationHistory,
      userId: this.getCurrentUserId()
    };

    // Call API
    return this.http.post<ChatbotResponse>(`${this.API_URL}/chat`, request).pipe(
      map(response => {
        // Add assistant response
        const assistantMsg: ChatMessage = {
          id: this.generateId(),
          role: 'assistant',
          content: response.message,
          timestamp: new Date()
        };
        this.addMessage(assistantMsg);
        this.saveMessages();
        return response;
      }),
      catchError(error => {
        console.error('Chatbot API error:', error);
        // Log the error but don't create fallback message
        // Let the error propagate to the component
        throw error;
      })
    );
  }

  /**
   * Get conversation history as context
   */
  private getConversationContext(maxMessages: number = 10): string {
    const recentMessages = this.messages.slice(-maxMessages);
    return recentMessages
      .map(msg => `${msg.role === 'user' ? 'Utilisateur' : 'Assistant'}: ${msg.content}`)
      .join('\n');
  }

  /**
   * Get all messages
   */
  getMessages(): ChatMessage[] {
    return [...this.messages];
  }

  /**
   * Clear conversation
   */
  clearConversation(): void {
    this.messages = [];
    this.saveMessages();
  }

  /**
   * Add message to conversation
   */
  addMessage(message: ChatMessage): void {
    this.messages.push(message);
    // Keep only last 100 messages
    if (this.messages.length > 100) {
      this.messages = this.messages.slice(-100);
    }
  }

  /**
   * Load messages from localStorage
   */
  private loadMessages(): void {
    try {
      const stored = localStorage.getItem('chatbot_messages');
      if (stored) {
        this.messages = JSON.parse(stored).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      }
    } catch (error) {
      console.error('Error loading chatbot messages:', error);
      this.messages = [];
    }
  }

  /**
   * Save messages to localStorage
   */
  private saveMessages(): void {
    try {
      localStorage.setItem('chatbot_messages', JSON.stringify(this.messages));
    } catch (error) {
      console.error('Error saving chatbot messages:', error);
    }
  }


  /**
   * Get current user ID (from auth service)
   */
  private getCurrentUserId(): string {
    // TODO: Get from AuthService
    return 'current-user-id';
  }

  /**
   * Generate unique ID
   */
  generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

