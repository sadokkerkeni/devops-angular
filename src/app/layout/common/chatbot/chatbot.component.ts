import { CommonModule, DatePipe } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil } from 'rxjs';
import { ChatMessage, ChatbotService } from 'app/core/chatbot/chatbot.service';
import { fuseAnimations } from '@fuse/animations/public-api';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    selector: 'chatbot',
    templateUrl: './chatbot.component.html',
    styleUrls: ['./chatbot.component.scss'],
    animations: fuseAnimations,
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatTooltipModule,
        DatePipe
    ]
})
export class ChatbotComponent implements OnInit, OnDestroy {
    @ViewChild('messagesContainer') private messagesContainer: ElementRef;
    @ViewChild('messageInput') private messageInput: ElementRef;

    isOpen: boolean = false;
    messages: ChatMessage[] = [];
    currentMessage: string = '';
    isLoading: boolean = false;
    suggestions: string[] = [];
    isAuthenticated: boolean = false;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private chatbotService: ChatbotService,
        private authService: AuthService
    ) {
    }

    ngOnInit(): void {
        // Check authentication status
        this.authService.check()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(authenticated => {
                this.isAuthenticated = authenticated;
                if (authenticated) {
                    this.loadMessages();
                }
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    /**
     * Toggle chatbot open/close
     */
    toggle(): void {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            setTimeout(() => {
                this.scrollToBottom();
                this.focusInput();
            }, 100);
        }
    }

    /**
     * Close chatbot
     */
    close(): void {
        this.isOpen = false;
    }

    /**
     * Send message
     */
    sendMessage(): void {
        if (!this.currentMessage.trim() || this.isLoading) {
            return;
        }

        const message = this.currentMessage.trim();
        this.currentMessage = '';
        this.isLoading = true;

        this.chatbotService.sendMessage(message)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response) => {
                    this.isLoading = false;
                    this.suggestions = response.suggestions || [];
                    this.loadMessages();
                    setTimeout(() => this.scrollToBottom(), 100);
                },
                error: (error) => {
                    console.error('Error sending message:', error);
                    this.isLoading = false;
                    
                    // Add error message to chat
                    const errorMessage: ChatMessage = {
                        id: this.chatbotService.generateId(),
                        role: 'assistant',
                        content: error?.error?.message || error?.message || 'Erreur lors de la communication avec le service. Veuillez vérifier votre connexion et réessayer.',
                        timestamp: new Date()
                    };
                    this.chatbotService.addMessage(errorMessage);
                    this.loadMessages();
                    setTimeout(() => this.scrollToBottom(), 100);
                }
            });
    }

    /**
     * Send suggestion
     */
    sendSuggestion(suggestion: string): void {
        this.currentMessage = suggestion;
        this.sendMessage();
    }

    /**
     * Clear conversation
     */
    clearConversation(): void {
        if (confirm('Voulez-vous effacer toute la conversation ?')) {
            this.chatbotService.clearConversation();
            this.messages = [];
            this.suggestions = [];
        }
    }

    /**
     * Load messages from service
     */
    private loadMessages(): void {
        this.messages = this.chatbotService.getMessages();
    }

    /**
     * Scroll to bottom of messages
     */
    private scrollToBottom(): void {
        if (this.messagesContainer) {
            const element = this.messagesContainer.nativeElement;
            element.scrollTop = element.scrollHeight;
        }
    }

    /**
     * Focus input field
     */
    private focusInput(): void {
        if (this.messageInput) {
            this.messageInput.nativeElement.focus();
        }
    }

    /**
     * Handle Enter key
     */
    onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        }
    }
}

