import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { TextFieldModule } from '@angular/cdk/text-field';
import { Subject, takeUntil, interval } from 'rxjs';
import { MessagingService } from './messaging.service';
import { Conversation, Message, User, MessageCreateDto } from './messaging.types';

@Component({
  selector: 'app-messaging',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatCardModule,
    MatListModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    TextFieldModule,
  ],
  templateUrl: './messaging.component.html',
  styleUrls: ['./messaging.component.scss']
})
export class MessagingComponent implements OnInit, OnDestroy {
  conversations: Conversation[] = [];
  selectedConversation: Conversation | null = null;
  messages: Message[] = [];
  availableUsers: User[] = [];
  selectedUserId: number | null = null;
  newMessageContent: string = '';
  loading = false;
  loadingMessages = false;
  currentUserId: number | null = null;
  userColors: { [userId: number]: string } = {};

  private _unsubscribeAll = new Subject<void>();
  private refreshInterval: any;

  constructor(
    private _messagingService: MessagingService,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadConversations();
    this.loadAvailableUsers();
    this.getCurrentUserId();
    
    // Rafraîchir les conversations toutes les 5 secondes
    this.refreshInterval = setInterval(() => {
      if (!this.loading && !this.loadingMessages) {
        this.loadConversations();
        if (this.selectedConversation) {
          // Ne pas scroller automatiquement lors du rafraîchissement
          this.loadMessages(this.selectedConversation.id, false);
        }
      }
    }, 5000);
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  getCurrentUserId(): void {
    // Récupérer l'ID de l'utilisateur depuis le token JWT
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.currentUserId = parseInt(payload.nameid);
      } catch (e) {
        console.error('Erreur lors de la récupération de l\'ID utilisateur:', e);
      }
    }
  }

  loadConversations(): void {
    this.loading = true;
    this._messagingService.getConversations()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (data) => {
          this.conversations = data || [];
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des conversations:', err);
          this._snackBar.open('❌ Erreur lors du chargement des conversations', 'Fermer', {
            duration: 5000
          });
          this.loading = false;
        }
      });
  }

  loadAvailableUsers(): void {
    this._messagingService.getAvailableUsers()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (data) => {
          this.availableUsers = data || [];
        },
        error: (err) => {
          console.error('Erreur lors du chargement des utilisateurs:', err);
        }
      });
  }

  startConversation(): void {
    if (!this.selectedUserId) {
      this._snackBar.open('Veuillez sélectionner un utilisateur', 'Fermer', {
        duration: 3000
      });
      return;
    }

    this.loading = true;
    this._messagingService.getOrCreateConversation(this.selectedUserId)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (conversation) => {
          this.selectedConversation = conversation;
          this.loadMessages(conversation.id);
          this.loadConversations();
          this.selectedUserId = null;
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur lors de la création de la conversation:', err);
          this._snackBar.open('❌ Erreur lors de la création de la conversation', 'Fermer', {
            duration: 5000
          });
          this.loading = false;
        }
      });
  }

  selectConversation(conversation: Conversation): void {
    this.selectedConversation = conversation;
    this.loadMessages(conversation.id);
  }

  loadMessages(conversationId: number, scrollToBottom: boolean = true): void {
    this.loadingMessages = true;
    this._messagingService.getMessages(conversationId)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (data) => {
          // Éviter les doublons en utilisant un Set basé sur l'ID
          const uniqueMessages = Array.from(
            new Map((data || []).map(msg => [msg.id, msg])).values()
          );
          this.messages = uniqueMessages;
          this.loadingMessages = false;
          // Marquer les messages comme lus
          this.messages.forEach(msg => {
            if (!msg.isRead && msg.senderId !== this.currentUserId) {
              this._messagingService.markAsRead(msg.id)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe();
            }
          });
          // Scroll vers le bas seulement si demandé
          if (scrollToBottom) {
            setTimeout(() => {
              const messagesContainer = document.getElementById('messages-container');
              if (messagesContainer) {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
              }
            }, 100);
          }
        },
        error: (err) => {
          console.error('Erreur lors du chargement des messages:', err);
          this._snackBar.open('❌ Erreur lors du chargement des messages', 'Fermer', {
            duration: 5000
          });
          this.loadingMessages = false;
        }
      });
  }

  sendMessage(): void {
    if (!this.newMessageContent.trim() || !this.selectedConversation) {
      return;
    }

    const messageContent = this.newMessageContent.trim();
    this.newMessageContent = ''; // Vider le champ immédiatement

    const dto: MessageCreateDto = {
      conversationId: this.selectedConversation.id,
      content: messageContent
    };

    this._messagingService.sendMessage(dto)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (message) => {
          // Vérifier si le message n'existe pas déjà pour éviter les doublons
          const messageExists = this.messages.some(m => m.id === message.id);
          if (!messageExists) {
            this.messages.push(message);
          }
          // Recharger les conversations pour mettre à jour le dernier message
          this.loadConversations();
          // Scroll vers le bas
          setTimeout(() => {
            const messagesContainer = document.getElementById('messages-container');
            if (messagesContainer) {
              messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
          }, 100);
        },
        error: (err) => {
          console.error('Erreur lors de l\'envoi du message:', err);
          this._snackBar.open('❌ Erreur lors de l\'envoi du message', 'Fermer', {
            duration: 5000
          });
          // Restaurer le message en cas d'erreur
          this.newMessageContent = messageContent;
        }
      });
  }

  getOtherUserName(conversation: Conversation): string {
    if (this.currentUserId === conversation.user1Id) {
      return conversation.user2Name;
    }
    return conversation.user1Name;
  }

  isMyMessage(message: Message): boolean {
    return message.senderId === this.currentUserId;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return date.toLocaleDateString('fr-FR');
  }

  trackByMessageId(index: number, message: Message): number {
    return message.id;
  }

  onEnterKey(event: KeyboardEvent): void {
    if (!event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  /**
   * Génère une couleur unique basée sur l'ID de l'utilisateur
   * Utilise une palette de couleurs agréables et contrastées
   */
  private generateUserColor(userId: number): string {
    // Palette de couleurs prédéfinies pour garantir de bons contrastes
    const colorPalette = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
      '#FF9FF3', '#54A0FF', '#48DBFB', '#A29BFE', '#FD79A8',
      '#FDCB6E', '#6C5CE7', '#A8E6CF', '#FFD3B6', '#FF8B94',
      '#C7CEEA', '#FFDAC1', '#B5EAD7', '#FFB7B2', '#E2F0CB'
    ];
    
    // Utiliser l'ID pour sélectionner une couleur de manière cohérente
    const index = userId % colorPalette.length;
    return colorPalette[index];
  }

  /**
   * Obtient la couleur pour un utilisateur, en la générant si nécessaire
   */
  getUserColor(userId: number): string {
    if (!this.userColors[userId]) {
      this.userColors[userId] = this.generateUserColor(userId);
    }
    return this.userColors[userId];
  }
}

